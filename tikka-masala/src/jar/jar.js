// The one persistent 3D jar. A single fixed <canvas> renders it for the whole
// page; its pose comes from the scroll director (see director.js).
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, LatheGeometry, CylinderGeometry,
  TorusGeometry, Vector2, MeshStandardMaterial, MeshPhysicalMaterial, CanvasTexture,
  SRGBColorSpace, DirectionalLight, HemisphereLight, PMREMGenerator, NeutralToneMapping, MathUtils,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { makeLabel, makeLidSide, makeLidTop } from './label.js';

const JAR_H = 2.75; // world height of the model (glass + lid)

function texture(canvas, renderer) {
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return t;
}

// Physical (clearcoat/sheen) materials on real GPUs, cheaper standard ones on software GL
let LITE = false;
const PHYS_ONLY = ['clearcoat', 'clearcoatRoughness', 'sheen', 'sheenColor'];
function mat(params) {
  if (!LITE) return new MeshPhysicalMaterial(params);
  const p = { ...params };
  PHYS_ONLY.forEach((k) => delete p[k]);
  return new MeshStandardMaterial(p);
}

function buildJar(renderer) {
  const jar = new Group();

  // Glass shell profile (radius, y)
  const profile = [
    [0, -1.1], [0.82, -1.1], [0.93, -1.08], [0.99, -1.02], [1.0, -0.9],
    [1.0, 0.78], [0.98, 0.9], [0.92, 0.98], [0.84, 1.03], [0.82, 1.08], [0.82, 1.2],
  ].map(([x, y]) => new Vector2(x, y));

  const sauceProfile = profile
    .filter(([, y]) => true)
    .map((v) => new Vector2(Math.max(0, v.x - 0.035), Math.min(v.y, 0.96)))
    .filter((v, i, a) => i === 0 || v.y !== a[i - 1].y || v.x !== a[i - 1].x);
  sauceProfile.push(new Vector2(0, 0.96));

  const sauce = new Mesh(
    new LatheGeometry(sauceProfile, 96),
    mat({ color: '#8f2205', roughness: 0.38, clearcoat: 0.3, sheen: 0.5, sheenColor: '#ff6a1a' }),
  );
  jar.add(sauce);

  const glass = new Mesh(
    new LatheGeometry(profile, 96),
    mat({
      color: '#ffffff', roughness: 0.04, metalness: 0, transparent: true, opacity: 0.1,
      clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 2.2, depthWrite: false,
    }),
  );
  glass.renderOrder = 2;
  jar.add(glass);

  // Label: open cylinder, front of the artwork (u = .5) faces +z
  const label = new Mesh(
    new CylinderGeometry(1.012, 1.012, 1.5, 128, 1, true, Math.PI, Math.PI * 2),
    mat({ map: texture(makeLabel(), renderer), roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.3 }),
  );
  label.position.y = -0.08;
  jar.add(label);

  // Lid
  const lidSide = mat({ map: texture(makeLidSide(), renderer), roughness: 0.32, metalness: 0.25, clearcoat: 0.8 });
  const lidTop = mat({ map: texture(makeLidTop(), renderer), roughness: 0.62, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.5, envMapIntensity: 0.12 });
  const lidBottom = new MeshStandardMaterial({ color: '#0b0b0b' });
  const lid = new Mesh(new CylinderGeometry(0.9, 0.9, 0.42, 128, 1, false), [lidSide, lidTop, lidBottom]);
  lid.position.y = 1.32;
  lid.rotation.y = -Math.PI / 2;
  jar.add(lid);

  const bead = new Mesh(new TorusGeometry(0.885, 0.03, 12, 128), mat({ color: '#E7B547', metalness: 1, roughness: 0.25 }));
  bead.rotation.x = Math.PI / 2;
  bead.position.y = 1.53;
  jar.add(bead);

  // centre the model vertically around the origin
  jar.position.y = -0.22;
  return jar;
}

export async function createJar({ canvas, getState, reduced = false }) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 0.98;

  // Software rasterisers (no GPU: some VMs, CI, old laptops) get a lighter render budget
  const gl = renderer.getContext();
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  const gpu = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
  const softwareGL = !new URLSearchParams(location.search).has('hq') && /swiftshader|llvmpipe|software|basic render/i.test(gpu);
  LITE = softwareGL;

  const scene = new Scene();
  if (softwareGL) {
    // baking the PMREM environment is very slow without a GPU: plain lights instead
    scene.add(new HemisphereLight('#fff6e8', '#5a2a10', 2.2));
  } else {
    const pmrem = new PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.75;
    pmrem.dispose();
  }

  const key = new DirectionalLight('#fff1dc', 2.4);
  key.position.set(-4, 5, 6);
  const rim = new DirectionalLight('#ffb36b', 2.2);
  rim.position.set(5, 2, -4);
  scene.add(key, rim);

  const camera = new PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 12);

  // outer = placement + tilt, inner = spin around the jar's own axis
  const outer = new Group();
  const inner = new Group();
  inner.add(buildJar(renderer));
  outer.add(inner);
  scene.add(outer);

  const cur = { ...getState() };
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let spin = 0;
  let visW = 1, visH = 1;

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(softwareGL ? 0.6 : Math.min(window.devicePixelRatio || 1, w < 768 ? 1.5 : 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    visH = 2 * Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    visW = visH * camera.aspect;
  }
  resize();
  window.addEventListener('resize', resize);

  if (!reduced && matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', (e) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  function apply(s) {
    const unit = Math.min(visH, visW * 1.28);
    const scale = (s.size * unit) / JAR_H;
    outer.position.set(s.x * visW, -s.y * visH, 0);
    outer.scale.setScalar(scale);
    outer.rotation.set(s.rx + pointer.y * 0.12, pointer.x * 0.18, s.rz);
    inner.rotation.y = s.ry + spin;
  }

  let frame = 0;
  let acc = 0;
  function tick(time, deltaMs) {
    if (document.hidden) return;
    // on software GL render at ~20 fps instead of every frame
    acc += deltaMs;
    if (softwareGL && ++frame % 3) return;
    const dt = Math.min(acc / 1000, 0.1);
    acc = 0;
    const target = getState();
    const k = reduced ? 1 : 1 - Math.exp(-dt * 7);
    for (const p in target) cur[p] += (target[p] - cur[p]) * k;
    if (!reduced) spin += dt * 0.35;
    pointer.x += (pointer.tx - pointer.x) * (1 - Math.exp(-dt * 4));
    pointer.y += (pointer.ty - pointer.y) * (1 - Math.exp(-dt * 4));
    apply(cur);
    renderer.render(scene, camera);
  }

  /** Render a few still poses (for the collage) and return PNG data URLs. */
  function snapshots(poses, w = 360, h = 480) {
    const prevSize = renderer.getSize(new Vector2());
    const prevPR = renderer.getPixelRatio();
    const cam = new PerspectiveCamera(26, w / h, 0.1, 100);
    cam.position.set(0, 0, 12);
    const vh = 2 * Math.tan(MathUtils.degToRad(13)) * 12;
    renderer.setPixelRatio(1.5);
    renderer.setSize(w, h, false);
    const out = poses.map((p) => {
      outer.position.set(0, 0, 0);
      outer.scale.setScalar((vh * 0.78) / JAR_H);
      outer.rotation.set(p.rx || 0, 0, p.rz || 0);
      inner.rotation.y = p.ry || 0;
      renderer.render(scene, cam);
      return canvas.toDataURL('image/png');
    });
    renderer.setPixelRatio(prevPR);
    renderer.setSize(prevSize.x, prevSize.y, false);
    apply(cur);
    return out;
  }

  return { tick, resize, snapshots, renderer };
}
