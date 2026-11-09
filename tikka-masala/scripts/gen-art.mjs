// Generates the offline "photography" for the landing page as editorial SVG
// illustrations (top-down food styling, grain + vignette for a photo feel).
// Run: npm run art   → writes into public/art/
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/art');
mkdirSync(OUT, { recursive: true });

/* ---------- tiny toolkit ---------- */
let seed = 1;
const rand = () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const r = (a, b) => a + rand() * (b - a);
const ri = (a, b) => Math.floor(r(a, b + 1));
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const gauss = () => (rand() + rand() + rand() + rand() - 2) / 2;
const f = (n) => Math.round(n * 10) / 10;

function svg(name, w, h, body, { grain = 0.16, vignette = 0.45 } = {}) {
  const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice">
<defs>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 1"/></feComponentTransfer></filter>
<radialGradient id="vig" cx="50%" cy="45%" r="75%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="${vignette}"/></radialGradient>
<radialGradient id="shine" cx="35%" cy="30%" r="60%"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
<filter id="soft2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
</defs>
${body}
<rect width="${w}" height="${h}" fill="url(#vig)"/>
<rect width="${w}" height="${h}" filter="url(#grain)" opacity="${grain}" style="mix-blend-mode:overlay"/>
</svg>`;
  writeFileSync(`${OUT}/${name}.svg`, out.replace(/\n\s*\n/g, '\n'));
  console.log(`  ✓ ${name}.svg  ${(out.length / 1024).toFixed(1)} kB`);
}

const shadow = (inner, dx = 14, dy = 22, op = 0.45) =>
  `<g transform="translate(${dx} ${dy})" opacity="${op}" filter="url(#soft)">${inner}</g>`;

/* ---------- surfaces ---------- */
function wood(w, h, base = ['#3a2012', '#432615', '#331c10', '#4a2a17']) {
  let s = '';
  const plank = ri(140, 190);
  for (let x = -20, i = 0; x < w; x += plank, i++) {
    s += `<rect x="${x}" y="0" width="${plank}" height="${h}" fill="${base[i % base.length]}"/>`;
    s += `<rect x="${x}" y="0" width="3" height="${h}" fill="#1a0e08" opacity=".7"/>`;
    for (let k = 0; k < 9; k++) {
      const gx = x + r(10, plank - 10);
      let d = `M${f(gx)} 0`;
      for (let y = 0; y <= h; y += 80) d += ` Q ${f(gx + r(-14, 14))} ${y + 40} ${f(gx + r(-6, 6))} ${y + 80}`;
      s += `<path d="${d}" stroke="#1a0e08" stroke-opacity="${f(r(0.12, 0.3) * 100) / 100}" stroke-width="${f(r(1, 3))}" fill="none"/>`;
    }
  }
  return s;
}

function cloth(w, h, c1, c2) {
  let s = `<rect width="${w}" height="${h}" fill="${c1}"/>`;
  for (let x = 0; x < w; x += 60) s += `<rect x="${x}" y="0" width="22" height="${h}" fill="${c2}" opacity=".35"/>`;
  for (let y = 0; y < h; y += 60) s += `<rect x="0" y="${y}" width="${w}" height="22" fill="${c2}" opacity=".25"/>`;
  return s;
}

/* ---------- ingredients ---------- */
function leaf(x, y, len, wid, ang, color = '#3f8a2c', vein = '#9fd27a') {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})">
<path d="M0 ${-len} Q ${wid} ${-len * 0.2} 0 ${len} Q ${-wid} ${-len * 0.2} 0 ${-len}Z" fill="${color}"/>
<path d="M0 ${-len * 0.9} L0 ${len * 0.95}" stroke="${vein}" stroke-width="${Math.max(1, wid * 0.06)}" opacity=".7"/></g>`;
}

function coriander(x, y, s = 1, ang = 0) {
  let g = '';
  for (let i = 0; i < 3; i++) {
    const a = -50 + i * 50;
    g += `<g transform="rotate(${a})"><path d="M0 0 C ${-14 * s} ${-10 * s} ${-16 * s} ${-28 * s} 0 ${-34 * s} C ${16 * s} ${-28 * s} ${14 * s} ${-10 * s} 0 0Z" fill="#4c9a32"/>
<path d="M0 0 L0 ${-30 * s}" stroke="#a6dc84" stroke-width="1.2" opacity=".6"/></g>`;
  }
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})">${g}<path d="M0 0 L0 ${22 * s}" stroke="#3d7a26" stroke-width="2.5"/></g>`;
}

function chili(x, y, ang, len = 160, color = '#c4140f', dried = false) {
  const w = len * 0.13;
  const body = `<path d="M0 0 C ${w} ${len * 0.15} ${w * 1.1} ${len * 0.55} ${w * 0.15} ${len} C ${-w * 0.5} ${len * 0.6} ${-w * 1.05} ${len * 0.2} 0 0Z" fill="${color}"/>`;
  const hi = `<path d="M${-w * 0.35} ${len * 0.12} C ${-w * 0.2} ${len * 0.4} ${-w * 0.1} ${len * 0.6} ${w * 0.05} ${len * 0.8}" stroke="#fff" stroke-opacity="${dried ? 0.12 : 0.35}" stroke-width="${w * 0.22}" fill="none" stroke-linecap="round"/>`;
  const wr = dried ? `<path d="M${-w * 0.4} ${len * 0.3} q ${w * 0.4} ${len * 0.05} ${w * 0.8} 0 M${-w * 0.3} ${len * 0.5} q ${w * 0.3} ${len * 0.04} ${w * 0.6} 0" stroke="#000" stroke-opacity=".25" stroke-width="2" fill="none"/>` : '';
  const stem = `<path d="M0 2 C ${-w * 0.8} ${-len * 0.04} ${-w * 0.9} ${-len * 0.12} ${-w * 0.3} ${-len * 0.16}" stroke="#3d6b1f" stroke-width="${w * 0.35}" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="3" rx="${w * 0.7}" ry="${w * 0.35}" fill="#4c7d26"/>`;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})">${body}${hi}${wr}${stem}</g>`;
}

function starAnise(x, y, s = 1, ang = 0) {
  let g = '';
  for (let i = 0; i < 8; i++) {
    g += `<g transform="rotate(${i * 45})"><path d="M0 0 C ${9 * s} ${-12 * s} ${10 * s} ${-34 * s} 0 ${-46 * s} C ${-10 * s} ${-34 * s} ${-9 * s} ${-12 * s} 0 0Z" fill="#6b3418"/>
<ellipse cx="0" cy="${-24 * s}" rx="${4 * s}" ry="${7 * s}" fill="#c98a4b"/><path d="M0 ${-6 * s} L0 ${-42 * s}" stroke="#2d1408" stroke-width="${1.6 * s}"/></g>`;
  }
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})">${g}<circle r="${7 * s}" fill="#4a230f"/></g>`;
}

function cinnamon(x, y, ang, len = 260, w = 34) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})">
<rect x="${-len / 2}" y="${-w / 2}" width="${len}" height="${w}" rx="${w / 2.2}" fill="#8a4a22"/>
<rect x="${-len / 2}" y="${-w / 2}" width="${len}" height="${w * 0.35}" rx="${w / 5}" fill="#b0683a" opacity=".8"/>
<path d="M${-len / 2 + 20} 0 H ${len / 2 - 20}" stroke="#5a2c12" stroke-width="2" opacity=".5"/>
<ellipse cx="${len / 2 - 4}" cy="0" rx="${w * 0.22}" ry="${w / 2}" fill="#6e3818"/>
<path d="M${len / 2 - 4} ${-w * 0.3} a ${w * 0.15} ${w * 0.3} 0 1 1 0 ${w * 0.5}" stroke="#c17a45" stroke-width="2" fill="none"/></g>`;
}

function cardamom(x, y, ang, s = 1) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})">
<ellipse rx="${11 * s}" ry="${20 * s}" fill="#86a33f"/><ellipse rx="${11 * s}" ry="${20 * s}" fill="url(#shine)"/>
<path d="M0 ${-19 * s} Q ${5 * s} 0 0 ${19 * s} M ${-6 * s} ${-15 * s} Q ${-2 * s} 0 ${-6 * s} ${15 * s}" stroke="#5c7826" stroke-width="1.6" fill="none"/>
<circle cy="${-21 * s}" r="${2.4 * s}" fill="#5c7826"/></g>`;
}

function heap(cx, cy, rad, colors, n = 500, grain = 3) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${colors[0]}"/>`;
  s += `<circle cx="${cx - rad * 0.2}" cy="${cy - rad * 0.25}" r="${rad * 0.55}" fill="${colors[1]}" opacity=".7" filter="url(#soft)"/>`;
  for (let i = 0; i < n; i++) {
    const a = r(0, Math.PI * 2), d = Math.abs(gauss()) * rad * 1.05;
    s += `<circle cx="${f(cx + Math.cos(a) * d)}" cy="${f(cy + Math.sin(a) * d)}" r="${f(r(grain * 0.4, grain))}" fill="${pick(colors)}" opacity="${f(r(0.5, 1) * 10) / 10}"/>`;
  }
  return s;
}

function scatter(cx, cy, spread, n, colors, size = 2.4) {
  let s = '';
  for (let i = 0; i < n; i++) {
    s += `<circle cx="${f(cx + gauss() * spread)}" cy="${f(cy + gauss() * spread)}" r="${f(r(size * 0.3, size))}" fill="${pick(colors)}" opacity="${f(r(0.4, 0.95) * 10) / 10}"/>`;
  }
  return s;
}

function seeds(cx, cy, spread, n, color = '#7a5a2e') {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = cx + gauss() * spread, y = cy + gauss() * spread;
    s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="2.4" ry="6.5" transform="rotate(${ri(0, 180)} ${f(x)} ${f(y)})" fill="${color}"/>`;
  }
  return s;
}

function bowl(cx, cy, rad, rim = '#e9dcc6', inner = '#d7c6a8', content = '') {
  const id = `b${ri(0, 1e6)}`;
  return `${shadow(`<circle cx="${cx}" cy="${cy}" r="${rad}" fill="#000"/>`)}
<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${rim}"/>
<circle cx="${cx}" cy="${cy}" r="${rad * 0.86}" fill="${inner}"/>
<clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${rad * 0.84}"/></clipPath>
<g clip-path="url(#${id})">${content}<circle cx="${cx + rad * 0.25}" cy="${cy + rad * 0.3}" r="${rad * 0.95}" fill="#000" opacity=".12" filter="url(#soft)"/></g>
<circle cx="${cx}" cy="${cy}" r="${rad * 0.93}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="${rad * 0.04}"/>`;
}

function curryFill(cx, cy, rad, { chunks = 10, cream = true } = {}) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="#c2410c"/>`;
  s += `<circle cx="${cx - rad * 0.2}" cy="${cy - rad * 0.2}" r="${rad * 0.7}" fill="#e2581a" filter="url(#soft)" opacity=".9"/>`;
  for (let i = 0; i < 60; i++) {
    const a = r(0, 6.3), d = r(0, rad);
    s += `<circle cx="${f(cx + Math.cos(a) * d)}" cy="${f(cy + Math.sin(a) * d)}" r="${f(r(2, 7))}" fill="${pick(['#f07a2a', '#9e2f08', '#ffa040'])}" opacity=".55"/>`;
  }
  for (let i = 0; i < chunks; i++) {
    const a = r(0, 6.3), d = r(0, rad * 0.75), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, w = r(rad * 0.16, rad * 0.24);
    s += `<g transform="translate(${f(x)} ${f(y)}) rotate(${ri(0, 90)})"><rect x="${-w / 2}" y="${-w / 2.6}" width="${w}" height="${w / 1.3}" rx="${w / 4}" fill="#a8400f"/>
<rect x="${-w / 2.4}" y="${-w / 3}" width="${w * 0.8}" height="${w / 2.2}" rx="${w / 5}" fill="#d9752e"/><rect x="${-w / 4}" y="${-w / 4}" width="${w / 2.5}" height="${w / 5}" rx="3" fill="#5e1f06" opacity=".7"/></g>`;
  }
  if (cream) {
    s += `<path d="M${cx - rad * 0.5} ${cy + rad * 0.1} C ${cx - rad * 0.2} ${cy - rad * 0.5}, ${cx + rad * 0.3} ${cy + rad * 0.45}, ${cx + rad * 0.55} ${cy - rad * 0.15}" stroke="#fff3df" stroke-width="${rad * 0.07}" fill="none" stroke-linecap="round" opacity=".92"/>`;
    s += `<path d="M${cx - rad * 0.3} ${cy + rad * 0.35} C ${cx} ${cy + rad * 0.1}, ${cx + rad * 0.2} ${cy + rad * 0.5}, ${cx + rad * 0.4} ${cy + rad * 0.3}" stroke="#fff3df" stroke-width="${rad * 0.035}" fill="none" stroke-linecap="round" opacity=".8"/>`;
  }
  for (let i = 0; i < 5; i++) s += coriander(cx + gauss() * rad * 0.6, cy + gauss() * rad * 0.6, r(0.55, 0.9), ri(0, 360));
  return s;
}

function tomato(x, y, rad) {
  let cal = '';
  for (let i = 0; i < 5; i++) cal += `<path d="M0 0 L${f(Math.cos(i * 1.256) * rad * 0.35)} ${f(Math.sin(i * 1.256) * rad * 0.35)}" stroke="#3f7a22" stroke-width="${rad * 0.09}" stroke-linecap="round"/>`;
  return `${shadow(`<circle cx="${x}" cy="${y}" r="${rad}" fill="#000"/>`, 8, 14, 0.4)}<circle cx="${x}" cy="${y}" r="${rad}" fill="#d8231a"/><circle cx="${x}" cy="${y}" r="${rad}" fill="url(#shine)"/>
<g transform="translate(${x} ${y})">${cal}<circle r="${rad * 0.08}" fill="#2d5c17"/></g>`;
}

function onion(x, y, rad) {
  let s = `${shadow(`<circle cx="${x}" cy="${y}" r="${rad}" fill="#000"/>`, 8, 14, 0.4)}<circle cx="${x}" cy="${y}" r="${rad}" fill="#7a1f4a"/>`;
  for (let k = 0.85; k > 0.1; k -= 0.16) s += `<circle cx="${x}" cy="${y}" r="${rad * k}" fill="${k > 0.6 ? '#f2d6e3' : '#e7bcd0'}" stroke="#8c2a58" stroke-width="3"/>`;
  return s;
}

function garlic(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">${shadow('<ellipse rx="40" ry="34" fill="#000"/>', 6, 10, 0.35)}
<ellipse rx="40" ry="34" fill="#f2e9d8"/><path d="M-30 -10 Q 0 -40 30 -10 M -18 18 Q 0 -30 18 18 M0 -34 V 30" stroke="#d9c7a7" stroke-width="2.5" fill="none"/>
<path d="M0 -34 l -4 -14 h 8 z" fill="#c9b48e"/><ellipse rx="40" ry="34" fill="url(#shine)"/></g>`;
}

function naan(cx, cy, w, h, ang = 0) {
  let pts = '';
  const n = 26;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + r(-0.06, 0.06) + (a > 1 && a < 2 ? 0.08 : 0);
    pts += `${i ? 'L' : 'M'}${f(Math.cos(a) * w * k)} ${f(Math.sin(a) * h * k * (1 - 0.25 * Math.sin(a)))}`;
  }
  let spots = '';
  for (let i = 0; i < 26; i++) {
    const x = gauss() * w * 0.45, y = gauss() * h * 0.45;
    spots += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r(6, 20))}" ry="${f(r(5, 14))}" fill="${pick(['#7a3d12', '#4d2209', '#a5602a'])}" opacity="${f(r(0.4, 0.85) * 10) / 10}"/>`;
  }
  return `<g transform="translate(${cx} ${cy}) rotate(${ang})">${shadow(`<path d="${pts}Z" fill="#000"/>`)}<path d="${pts}Z" fill="#e8b874"/>
<path d="${pts}Z" fill="#f7d79f" transform="scale(.82)" opacity=".7" filter="url(#soft2)"/>${spots}
${coriander(w * 0.3, -h * 0.2, 0.6, 30)}${scatter(0, 0, w * 0.3, 40, ['#2b1405', '#fff'], 2)}</g>`;
}

function hand(x, y, ang, s = 1, skin = '#b9733f', sleeve = '#FFC21A') {
  const sh = '#7a4320';
  const finger = (fx, fy, len, w, a) =>
    `<g transform="translate(${fx} ${fy}) rotate(${a})"><rect x="${-w / 2}" y="${-len}" width="${w}" height="${len + 8}" rx="${w / 2}" fill="${skin}"/>
<rect x="${-w / 2 + 3}" y="${-len + 4}" width="${w - 10}" height="${w * 0.7}" rx="${w / 3}" fill="#e8b48c" opacity=".7"/>
<path d="M${-w / 2 + 4} ${-len * 0.45} h ${w - 8}" stroke="${sh}" stroke-width="2" opacity=".5"/></g>`;
  const shape = `<path d="M-62 40 C -70 -10 -60 -60 -10 -66 C 40 -70 66 -40 64 0 C 62 40 50 70 0 76 C -40 80 -58 70 -62 40Z" fill="${skin}"/>
${finger(-42, -54, 70, 26, -8)}${finger(-14, -62, 86, 27, -2)}${finger(14, -60, 82, 26, 4)}${finger(40, -48, 66, 24, 10)}
<g transform="translate(-58 18) rotate(-52)"><rect x="-14" y="-74" width="30" height="86" rx="15" fill="${skin}"/><rect x="-9" y="-68" width="18" height="18" rx="7" fill="#e8b48c" opacity=".7"/></g>
<path d="M-40 10 C -10 -6 20 -6 46 10" stroke="${sh}" stroke-width="3" fill="none" opacity=".45"/>
<rect x="-56" y="66" width="112" height="140" rx="20" fill="${sleeve}"/><rect x="-56" y="66" width="112" height="22" rx="10" fill="#000" opacity=".15"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${ang}) scale(${s})">${shadow(shape.replace(/fill="[^"]+"/g, 'fill="#000"'), 16, 26, 0.5)}${shape}</g>`;
}

function spoon(x, y, ang, len = 520) {
  return `<g transform="translate(${x} ${y}) rotate(${ang})">${shadow(`<rect x="-14" y="0" width="28" height="${len}" rx="14" fill="#000"/><ellipse cx="0" cy="-50" rx="58" ry="78" fill="#000"/>`)}
<rect x="-14" y="0" width="28" height="${len}" rx="14" fill="#c48a52"/><rect x="-8" y="0" width="8" height="${len}" rx="4" fill="#e3b07a" opacity=".6"/>
<ellipse cx="0" cy="-50" rx="58" ry="78" fill="#b87a44"/><ellipse cx="0" cy="-50" rx="44" ry="62" fill="#c2410c"/><ellipse cx="-12" cy="-66" rx="14" ry="22" fill="#ff9a52" opacity=".55"/></g>`;
}

/* ---------- compositions ---------- */
function hands() {
  seed = 11;
  const W = 900, H = 1200;
  let b = `<rect width="${W}" height="${H}" fill="#2a160c"/>${wood(W, H)}`;
  b += scatter(160, 1040, 60, 120, ['#f2b705', '#e8a000', '#ffcc33'], 3);
  b += scatter(760, 160, 50, 90, ['#b5121b', '#8e0f15', '#d43b20'], 3);
  b += `<g transform="translate(450 600)">${shadow('<circle r="360" fill="#000"/>', 20, 34, 0.6)}
<rect x="-470" y="-34" width="120" height="68" rx="30" fill="#151515"/><rect x="350" y="-34" width="120" height="68" rx="30" fill="#151515"/>
<circle r="360" fill="#1d1d1d"/><circle r="340" fill="#2c2c2c"/><circle r="318" fill="#111"/></g>`;
  b += `<clipPath id="pan"><circle cx="450" cy="600" r="314"/></clipPath><g clip-path="url(#pan)">${curryFill(450, 600, 320, { chunks: 16 })}</g>`;
  b += spoon(560, 520, 38, 560);
  b += hand(760, 1000, -38, 1.15, '#a8652f', '#D4156B');
  b += hand(170, 300, 140, 1.05, '#a8652f', '#D4156B');
  b += scatter(260, 470, 26, 140, ['#f2b705', '#ffcc33', '#e07b00'], 2.6);
  b += cardamom(110, 860, 30, 1.2) + cardamom(140, 900, -20, 1.2) + starAnise(800, 380, 1.1, 12);
  svg('hands', W, H, b);
}

function curry() {
  seed = 22;
  const W = 1200, H = 900;
  let b = cloth(W, H, '#8a1e3c', '#D4156B');
  b += bowl(560, 470, 300, '#1c1c1c', '#262626', curryFill(560, 470, 270, { chunks: 12 }));
  b += naan(1020, 210, 210, 150, -24);
  b += bowl(190, 760, 150, '#efe2c9', '#f8f1e4', heap(190, 760, 140, ['#fbf6ea', '#ffffff', '#efe4cc'], 700, 3.5) + scatter(190, 760, 40, 30, ['#f2b705'], 3));
  b += chili(1000, 600, 70, 220) + chili(1060, 650, 82, 190, '#9a0f0d');
  b += leaf(140, 180, 120, 40, 40, '#3f8a2c') + coriander(250, 140, 1, 10) + coriander(980, 820, 1.1, -30);
  b += garlic(1100, 820, 0.8);
  svg('curry', W, H, b);
}

function thali() {
  seed = 33;
  const W = 800, H = 1200;
  let b = `<rect width="${W}" height="${H}" fill="#2a160c"/>${wood(W, H)}`;
  // banana leaf
  const leafPath = `M400 30 C 700 160 740 700 520 1180 L 280 1180 C 60 700 100 160 400 30Z`;
  b += shadow(`<path d="${leafPath}" fill="#000"/>`, 20, 30, 0.6);
  b += `<path d="${leafPath}" fill="#2f7d23"/><path d="${leafPath}" fill="#4fae36" opacity=".55" transform="translate(40 0) scale(.9)"/>`;
  for (let y = 120; y < 1160; y += 26) {
    b += `<path d="M400 ${y} C ${f(470 + r(0, 30))} ${y - 30} ${f(560 + r(0, 40))} ${y - 50} ${f(680 + r(-10, 20))} ${y - 60}" stroke="#a3dc7c" stroke-opacity=".28" stroke-width="2" fill="none"/>`;
    b += `<path d="M400 ${y} C ${f(330 - r(0, 30))} ${y - 30} ${f(240 - r(0, 40))} ${y - 50} ${f(120 - r(-10, 20))} ${y - 60}" stroke="#a3dc7c" stroke-opacity=".28" stroke-width="2" fill="none"/>`;
  }
  b += `<path d="M400 40 L 400 1180" stroke="#cfeeaf" stroke-width="12" opacity=".75"/>`;
  b += `<path d="M560 420 l 120 -40 l -60 90z M210 900 l -100 50 l 80 40z" fill="#2a160c" opacity=".55"/>`;
  // rice mound
  b += shadow('<ellipse cx="400" cy="660" rx="170" ry="140" fill="#000"/>');
  b += `<ellipse cx="400" cy="660" rx="170" ry="140" fill="#f6efe0"/>`;
  for (let i = 0; i < 520; i++) {
    const a = r(0, 6.3), d = Math.sqrt(rand()), x = 400 + Math.cos(a) * d * 165, y = 660 + Math.sin(a) * d * 135;
    b += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="2.2" ry="6.5" transform="rotate(${ri(0, 180)} ${f(x)} ${f(y)})" fill="${pick(['#ffffff', '#efe6d2', '#fffaf0'])}"/>`;
  }
  b += `<circle cx="340" cy="610" r="60" fill="#fff" opacity=".35" filter="url(#soft)"/>`;
  b += bowl(400, 330, 120, '#c9a24a', '#a8862f', curryFill(400, 330, 110, { chunks: 6 }));
  b += bowl(250, 960, 92, '#c9a24a', '#a8862f', `<circle cx="250" cy="960" r="90" fill="#e8a317"/>${seeds(250, 960, 30, 40, '#5b3a12')}${coriander(240, 950, 0.7, 20)}`);
  b += bowl(560, 940, 92, '#c9a24a', '#a8862f', `<circle cx="560" cy="940" r="90" fill="#f4ecd8"/>${scatter(560, 940, 30, 50, ['#3f8a2c', '#d43b20'], 3.2)}`);
  b += `<g transform="translate(600 640) rotate(20)">${shadow('<path d="M0 0 a 70 70 0 0 1 140 0z" fill="#000"/>', 8, 14, 0.4)}<path d="M0 0 a 70 70 0 0 1 140 0z" fill="#ffd93b"/><path d="M14 -4 a 56 56 0 0 1 112 0z" fill="#fff6b0"/>
<path d="M70 -4 l -40 -40 M70 -4 l 0 -56 M70 -4 l 40 -40" stroke="#ffd93b" stroke-width="4"/></g>`;
  b += chili(150, 560, -20, 150) + chili(650, 260, 160, 140, '#2f7d23');
  b += `<g transform="translate(200 260)">${shadow('<circle r="96" fill="#000"/>')}<circle r="96" fill="#f0c56a"/>${scatter(0, 0, 40, 60, ['#8a5a1c', '#3a2408'], 3)}</g>`;
  svg('thali', W, H, b);
}

function turmeric() {
  seed = 44;
  const W = 800, H = 800;
  let b = `<rect width="${W}" height="${H}" fill="#1a0e08"/>${wood(W, H, ['#2b170c', '#311b0e', '#26140a'])}`;
  b += scatter(560, 600, 120, 500, ['#f2b705', '#ffcc33', '#e8a000'], 3);
  b += bowl(380, 380, 240, '#d9c4a0', '#c7ae86', heap(380, 380, 220, ['#f0a90a', '#ffc21a', '#e08e00', '#ffd659'], 1500, 4));
  for (let i = 0; i < 3; i++) {
    const x = 640 + i * 40, y = 170 + i * 60;
    b += `<g transform="translate(${x} ${y}) rotate(${ri(-40, 40)})">${shadow('<rect x="-70" y="-18" width="140" height="36" rx="18" fill="#000"/>', 6, 10, 0.5)}
<rect x="-70" y="-18" width="140" height="36" rx="18" fill="#a8641f"/><path d="M-50 -18 v36 M-20 -18 v36 M15 -18 v36 M45 -18 v36" stroke="#6e3c10" stroke-width="3"/>
<ellipse cx="70" cy="0" rx="10" ry="16" fill="#ff9d0a"/></g>`;
  }
  b += leaf(130, 660, 120, 44, 60, '#3f8a2c');
  svg('spice-turmeric', W, H, b);
}

function chilies() {
  seed = 55;
  const W = 800, H = 1000;
  let b = `<rect width="${W}" height="${H}" fill="#ffc21a"/>`;
  b += scatter(400, 500, 260, 400, ['#e06d00', '#c2410c', '#ffdf70'], 3);
  for (let i = 0; i < 26; i++) {
    const x = r(60, 740), y = r(60, 940), a = r(0, 360);
    b += `<g>${shadow(chili(x, y, a, r(140, 210), '#000', true), 8, 12, 0.3)}${chili(x, y, a, r(140, 210), pick(['#a30d0b', '#c4140f', '#8a0b0a', '#b3120e']), true)}</g>`;
  }
  svg('spice-chili', W, H, b);
}

function anise() {
  seed = 66;
  const W = 800, H = 800;
  let b = `<rect width="${W}" height="${H}" fill="#D4156B"/>`;
  for (let i = 0; i < 4; i++) b += shadow(cinnamon(r(150, 650), r(150, 650), r(0, 180)), 10, 14, 0.4) + cinnamon(r(150, 650), r(150, 650), r(0, 180));
  for (let i = 0; i < 9; i++) {
    const x = r(80, 720), y = r(80, 720), s = r(1, 1.6), a = ri(0, 90);
    b += `<g>${shadow(starAnise(x, y, s, a).replace(/fill="#[0-9a-f]+"/gi, 'fill="#000"'), 8, 12, 0.35)}${starAnise(x, y, s, a)}</g>`;
  }
  for (let i = 0; i < 22; i++) b += cardamom(r(40, 760), r(40, 760), r(0, 360), r(1, 1.3));
  svg('spice-anise', W, H, b);
}

function cumin() {
  seed = 77;
  const W = 800, H = 1000;
  let b = `<rect width="${W}" height="${H}" fill="#e8500a"/>`;
  b += seeds(400, 500, 220, 900, '#6e4a1e');
  b += seeds(400, 500, 160, 300, '#8f6a33');
  b += `<g transform="translate(420 470) rotate(-28)">${shadow('<ellipse cx="0" cy="0" rx="130" ry="96" fill="#000"/><rect x="100" y="-14" width="300" height="28" rx="14" fill="#000"/>')}
<rect x="100" y="-14" width="300" height="28" rx="14" fill="#c48a52"/><ellipse rx="130" ry="96" fill="#b87a44"/><ellipse rx="112" ry="80" fill="#7a5426"/>${seeds(0, 0, 40, 220, '#4d3313').replace(/cx="(-?\d+\.?\d*)"/g, (m) => m)}</g>`;
  svg('spice-cumin', W, H, b);
}

function produce() {
  seed = 88;
  const W = 1000, H = 800;
  let b = cloth(W, H, '#f3e3c4', '#e7c99a');
  b += tomato(230, 240, 120) + tomato(420, 150, 90) + tomato(150, 520, 96);
  b += onion(700, 300, 140) + onion(880, 600, 100);
  b += garlic(470, 470, 1.2) + garlic(580, 650, 0.9);
  b += chili(820, 110, 120, 200, '#2f7d23') + chili(330, 640, 40, 180, '#c4140f');
  b += coriander(620, 120, 1.4, 20) + coriander(100, 720, 1.3, -40) + leaf(920, 300, 110, 40, -30);
  b += `<g transform="translate(330 330) rotate(-10)">${shadow('<rect x="-60" y="-30" width="120" height="60" rx="10" fill="#000"/>', 6, 10, 0.35)}<rect x="-60" y="-30" width="120" height="60" rx="12" fill="#e9c27a"/><path d="M-50 -10 h100 M-50 10 h100" stroke="#c9963f" stroke-width="3"/></g>`;
  svg('produce', W, H, b);
}

function naanShot() {
  seed = 99;
  const W = 800, H = 1000;
  let b = `<rect width="${W}" height="${H}" fill="#1a0e08"/>${wood(W, H)}`;
  b += naan(400, 520, 300, 230, 12);
  b += bowl(640, 170, 110, '#1c1c1c', '#262626', `<circle cx="640" cy="170" r="100" fill="#f4ecd8"/>${scatter(640, 170, 30, 60, ['#3f8a2c', '#2f6d1d'], 3)}`);
  b += coriander(140, 860, 1.4, 30) + chili(680, 860, -60, 180);
  svg('naan', W, H, b);
}

/* ---------- decorative pattern (used as a CSS mask) ---------- */
function pattern() {
  const st = 'fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
  const leafP = (x, y, a, s = 1) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})" ${st}><path d="M0 -40 Q 22 -8 0 40 Q -22 -8 0 -40Z"/><path d="M0 -34 V 50"/><path d="M0 -10 l 10 -8 M0 6 l -11 -8 M0 20 l 10 -8"/></g>`;
  const chiliP = (x, y, a) => `<g transform="translate(${x} ${y}) rotate(${a})" ${st}><path d="M0 0 C 12 10 14 40 2 62 C -8 40 -12 12 0 0Z"/><path d="M0 0 C -6 -6 -6 -14 2 -18"/></g>`;
  const anise = (x, y, a) => { let g = ''; for (let i = 0; i < 8; i++) g += `<path transform="rotate(${i * 45})" d="M0 0 C 5 -6 6 -18 0 -26 C -6 -18 -5 -6 0 0Z"/>`; return `<g transform="translate(${x} ${y}) rotate(${a})" ${st}>${g}</g>`; };
  const pod = (x, y, a) => `<g transform="translate(${x} ${y}) rotate(${a})" ${st}><ellipse rx="9" ry="17"/><path d="M0 -15 Q 4 0 0 15"/></g>`;
  const dots = (x, y) => `<g fill="#000"><circle cx="${x}" cy="${y}" r="4"/><circle cx="${x + 14}" cy="${y + 6}" r="3"/><circle cx="${x + 4}" cy="${y + 16}" r="3.5"/></g>`;
  const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360" width="360" height="360">
${leafP(60, 70, -30)}${chiliP(200, 30, 40)}${anise(300, 110, 10)}${pod(130, 180, 60)}${leafP(270, 250, 50, 0.9)}${dots(40, 260)}${anise(90, 300, 30)}${chiliP(190, 230, -50)}${pod(330, 330, -20)}${dots(240, 150)}${pod(20, 160, 10)}
</svg>`;
  writeFileSync(`${OUT}/pattern.svg`, out);
  console.log('  ✓ pattern.svg');
}

console.log('Generating art →', OUT);
hands(); curry(); thali(); turmeric(); chilies(); anise(); cumin(); produce(); naanShot(); pattern();
