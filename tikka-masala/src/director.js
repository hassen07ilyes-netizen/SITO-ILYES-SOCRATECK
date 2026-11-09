// The "director": maps the scroll position to
//   • the pose of the persistent 3D jar
//   • the page background colour + tone-on-tone texture colour
// Keyframes are anchored to real DOM positions and re-measured on every
// ScrollTrigger refresh, so it stays correct with pins, resizes and mobile.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const isMobile = () => window.innerWidth < 768;

/** document-space top of an element (uses the pin-spacer when pinned) */
function box(el) {
  return el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
}
function docTop(el) {
  const b = box(el);
  return b.getBoundingClientRect().top + window.scrollY;
}
const A = {
  /** scroll position at which el's top reaches `vp` (0 = top of viewport, 1 = bottom) */
  top: (el, vp = 0) => docTop(el) - window.innerHeight * vp,
  /** scroll position at which a pinned section releases */
  pinEnd: (el) => docTop(el) + box(el).offsetHeight - window.innerHeight,
  /** scroll position where el's centre is at the viewport centre */
  center: (el) => docTop(el) + box(el).offsetHeight / 2 - window.innerHeight / 2,
  max: () => ScrollTrigger.maxScroll(window),
};

/** Where an element's centre will be on screen (fractions from centre) when scrolled to `pos` */
function screenPos(el, pos, fx = 0.5, fy = 0.5) {
  // measure relative to the owning section so it also works while that section is pinned (position: fixed)
  const r = el.getBoundingClientRect();
  const sec = el.closest('section, footer') || el;
  const start = docTop(sec);
  let secTop = start - pos;
  const b = box(sec);
  if (b !== sec) {
    // pinned: the section sits at the viewport top for the whole pin range
    const end = start + b.offsetHeight - window.innerHeight;
    secTop = pos < start ? start - pos : pos <= end ? 0 : end - pos;
  }
  const top = secTop + (r.top - sec.getBoundingClientRect().top);
  return {
    x: (r.left + r.width * fx) / window.innerWidth - 0.5,
    y: (top + r.height * fy) / window.innerHeight - 0.5,
  };
}

class Track {
  constructor(keys) { this.defs = keys; this.keys = []; }
  measure() {
    this.keys = this.defs
      .map((k) => {
        const pos = k.at();
        const values = {};
        for (const [p, v] of Object.entries(k.v)) values[p] = typeof v === 'function' ? v(pos) : v;
        return { pos, values, ease: gsap.parseEase(k.ease || 'power2.inOut') };
      })
      .sort((a, b) => a.pos - b.pos);
  }
  at(scroll) {
    const ks = this.keys;
    if (!ks.length) return {};
    if (scroll <= ks[0].pos) return { ...ks[0].values };
    for (let i = 1; i < ks.length; i++) {
      if (scroll <= ks[i].pos) {
        const a = ks[i - 1], b = ks[i];
        const p = b.ease((scroll - a.pos) / Math.max(1, b.pos - a.pos));
        return gsap.utils.interpolate(a.values, b.values, p);
      }
    }
    return { ...ks[ks.length - 1].values };
  }
}

export function createDirector({ reduced }) {
  const $ = (s) => document.querySelector(s);
  const s = {
    hero: $('#hero'), adv: $('#adventure'), persp: $('#perspective'), fillers: $('#fillers'),
    panel: $('.fillers__panel'), trad: $('#tradition'), tradPhoto: $('.trad__photo'),
    grow: $('#grow'), collage: $('#collage'), cta: $('#cta'), footer: $('#footer'), footJar: $('.footer__jar'),
  };
  const TAU = Math.PI * 2;
  const R = reduced ? 0 : 1; // rotation multiplier: no big spins with reduced motion

  // ---------- jar keyframes ----------
  const jar = new Track([
    { at: () => 0, v: { x: 0, y: () => (isMobile() ? 0.12 : 0.02), size: () => (isMobile() ? 0.52 : 0.6), rx: 0.14, ry: -0.35, rz: -0.09 } },
    { at: () => A.top(s.adv), v: { x: 0, y: 0, size: () => (isMobile() ? 0.56 : 0.72), rx: 0.08, ry: R * TAU * 0.5, rz: 0.04 }, ease: 'power1.inOut' },
    { at: () => A.pinEnd(s.adv), v: { x: 0, y: 0.04, size: () => (isMobile() ? 0.74 : 0.78), rx: 0.05, ry: R * TAU * 1.25, rz: 0.06 } },
    // 03 — tip forward ~90° to show the lid from above
    { at: () => A.top(s.persp), v: { x: 0, y: 0, size: () => (isMobile() ? 0.82 : 0.78), rx: 1.5, ry: R * TAU * 1.5, rz: 0 } },
    { at: () => A.top(s.persp) + (A.pinEnd(s.persp) - A.top(s.persp)) * 0.55, v: { x: 0, y: 0, size: () => (isMobile() ? 0.82 : 0.78), rx: 1.52, ry: R * TAU * 2, rz: 0 } },
    { at: () => A.pinEnd(s.persp), v: { x: 0, y: 0.02, size: () => (isMobile() ? 0.78 : 0.74), rx: 0.42, ry: R * TAU * 2.25, rz: 0.38 } },
    // 04 — sits on the seam between the dark side and the magenta panel
    {
      at: () => A.top(s.fillers),
      v: {
        x: (pos) => (isMobile() ? 0.27 : screenPos(s.panel, pos, 0, 0.5).x),
        y: (pos) => (isMobile() ? screenPos(s.panel, pos, 0.5, 0.2).y : 0.06),
        size: () => (isMobile() ? 0.36 : 0.5), rx: 0.12, ry: R * TAU * 2.5, rz: -0.22,
      },
    },
    {
      at: () => A.pinEnd(s.fillers),
      v: {
        x: (pos) => (isMobile() ? 0.27 : screenPos(s.panel, pos, 0, 0.5).x),
        y: (pos) => (isMobile() ? screenPos(s.panel, pos, 0.5, 0.2).y : 0.06),
        size: () => (isMobile() ? 0.36 : 0.5), rx: 0.12, ry: R * TAU * 3, rz: -0.22,
      },
    },
    // 05 — in front of the photo's lower-left corner, like a product shot
    {
      at: () => A.center(s.trad),
      v: {
        x: (pos) => screenPos(s.tradPhoto, pos, isMobile() ? 0.82 : 0.04, 0.7).x,
        y: (pos) => screenPos(s.tradPhoto, pos, 0.1, isMobile() ? 0.8 : 0.68).y,
        size: () => (isMobile() ? 0.4 : 0.42), rx: 0.1, ry: R * TAU * 3.25, rz: 0.16,
      },
    },
    { at: () => A.top(s.grow), v: { x: 0, y: 0.05, size: () => (isMobile() ? 0.5 : 0.42), rx: 0.1, ry: R * TAU * 3.5, rz: -0.05 } },
    { at: () => A.pinEnd(s.grow), v: { x: 0, y: () => (isMobile() ? 0.2 : 0.04), size: () => (isMobile() ? 0.56 : 0.72), rx: 0.12, ry: R * TAU * 4, rz: 0 } },
    // 06 — steps aside for the collage title, then floats through the tiles
    { at: () => A.top(s.collage), v: { x: () => (isMobile() ? 0.22 : 0.34), y: () => (isMobile() ? 0.3 : 0.18), size: () => (isMobile() ? 0.4 : 0.42), rx: 0.15, ry: R * TAU * 4.25, rz: 0.3 } },
    { at: () => A.center(s.collage), v: { x: () => (isMobile() ? 0 : 0.02), y: 0.02, size: () => (isMobile() ? 0.6 : 0.56), rx: 0.2, ry: R * TAU * 4.5, rz: 0.22 } },
    // 07 — between "LET'S GET" (behind) and "COOKING" (in front)
    { at: () => A.center(s.cta), v: { x: 0, y: () => (isMobile() ? 0 : 0.01), size: () => (isMobile() ? 0.44 : 0.5), rx: 0.08, ry: R * TAU * 5, rz: -0.12 } },
    // 08 — lands in the magenta half of the footer, then scrolls with it
    {
      at: () => Math.min(A.top(s.footer), A.max() - 1),
      v: {
        x: (pos) => screenPos(s.footJar, pos).x,
        y: (pos) => screenPos(s.footJar, pos).y,
        size: () => (isMobile() ? 0.36 : 0.5), rx: 0.16, ry: R * TAU * 5.25, rz: 0.1,
      },
    },
    {
      ease: 'none',
      at: () => A.max(),
      v: {
        x: (pos) => screenPos(s.footJar, pos).x,
        y: (pos) => screenPos(s.footJar, pos).y,
        size: () => (isMobile() ? 0.36 : 0.5), rx: 0.16, ry: R * TAU * 5.25, rz: 0.1,
      },
    },
  ]);

  // ---------- background keyframes ----------
  const COL = {
    orange: '#E8500A', mustard: '#FFC21A', cream: '#F7E6CB', dark: '#1A0E08', magenta: '#D4156B', ember: '#A8320A',
  };
  const texDark = 'rgba(26,14,8,0.10)';
  const texLight = 'rgba(255,241,220,0.06)';
  const pair = (el, from, to, ft, tt) => [
    { at: () => A.top(el, 0.9), v: { bg: from, tex: ft } },
    { at: () => A.top(el, 0.35), v: { bg: to, tex: tt } },
  ];
  const bg = new Track([
    { at: () => 0, v: { bg: COL.orange, tex: texDark } },
    ...pair(s.adv, COL.orange, COL.mustard, texDark, texDark),
    ...pair(s.persp, COL.mustard, COL.cream, texDark, texDark),
    ...pair(s.fillers, COL.cream, COL.dark, texDark, texLight),
    ...pair(s.trad, COL.dark, COL.mustard, texLight, texDark),
    ...pair(s.collage, COL.mustard, COL.magenta, texDark, texDark),
    ...pair(s.cta, COL.magenta, COL.ember, texDark, texDark),
    ...pair(s.footer, COL.ember, COL.dark, texDark, texLight),
  ]);

  const root = document.documentElement;
  let jarState = { x: 0, y: 0, size: 0.6, rx: 0, ry: 0, rz: 0 };

  function update(scroll) {
    jarState = jar.at(scroll);
    const b = bg.at(scroll);
    root.style.setProperty('--page-bg', b.bg);
    root.style.setProperty('--tex', b.tex);
    root.style.setProperty('--tex-shift', `${(-scroll * 0.12).toFixed(1)}px`);
  }

  function measure() {
    jar.measure();
    bg.measure();
    update(window.scrollY);
  }

  ScrollTrigger.addEventListener('refresh', measure);
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => update(self.scroll()) });
  measure();

  return { getJarState: () => jarState, measure };
}
