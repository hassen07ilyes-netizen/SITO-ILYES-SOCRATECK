import '@fontsource/anton/latin-400.css';
import '@fontsource-variable/inter/wght.css';
import 'lenis/dist/lenis.css';
import './styles/main.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

import { createDirector } from './director.js';
import { initSections } from './sections.js';
import { initCursor } from './ui/cursor.js';
import { initMagnetic } from './ui/magnetic.js';
import { runLoader } from './ui/loader.js';

gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.defaults({ ease: 'power3.out' });

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* ---------- smooth scroll ---------- */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, touchMultiplier: 1.4 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
  window.__lenis = lenis; // handy for debugging & automated screenshots
}

/* in-page links go through Lenis */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const target = document.querySelector(a.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  if (lenis) lenis.scrollTo(target, { duration: 1.8 });
  else target.scrollIntoView();
});

/* nav: hide on scroll down, show on scroll up, dark ink over light sections */
const nav = document.querySelector('.nav');
let lastY = 0;
const onScroll = (y) => {
  nav.classList.toggle('is-hidden', y > lastY && y > 200);
  lastY = y;
};
if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });

/* newsletter (demo only) */
const form = document.querySelector('.news');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = document.querySelector('.news__msg');
  const email = form.email.value.trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    msg.textContent = 'Hmm, that email looks a little undercooked.';
    form.email.focus();
    return;
  }
  msg.textContent = 'You’re in! Your 10% code is on its way: SAUCY10';
  form.reset();
});

/* ---------- boot ---------- */
async function boot() {
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]);

  const { heroIntro } = initSections({ reduced });
  const director = createDirector({ reduced });
  initCursor();
  initMagnetic();
  initNavTheme();

  // the 3D jar loads in its own chunk so the first paint stays light
  const canvas = document.querySelector('.jar-canvas');
  const jarReady = (async () => {
    try {
      await document.fonts.load('100px Anton');
      const { createJar } = await import('./jar/jar.js');
      const jar = await createJar({ canvas, getState: director.getJarState, reduced });
      const shots = jar.snapshots([
        { rx: 0.25, ry: 0.5, rz: 0 },
        { rx: 0.1, ry: 2.6, rz: 0 },
        { rx: 0.9, ry: -0.3, rz: 0 },
      ]);
      document.querySelectorAll('.mini-jar').forEach((img, i) => {
        img.src = shots[i];
        img.classList.add('is-ready');
      });
      gsap.ticker.add(jar.tick);
      requestAnimationFrame(() => canvas.classList.add('is-ready'));
    } catch (err) {
      console.warn('[jar] WebGL unavailable, using the flat fallback.', err);
      root.classList.add('no-webgl');
    }
  })();

  await runLoader(jarReady, { reduced });
  root.classList.add('is-loaded');
  ScrollTrigger.refresh();
  lenis?.start();
  heroIntro();
}

function initNavTheme() {
  ['#adventure', '#perspective', '#tradition', '#footer'].forEach((sel) => {
    const el = document.querySelector(sel);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 40px',
      end: sel === '#footer' ? 'max' : 'bottom 40px',
      toggleClass: { targets: nav, className: 'nav--dark' },
    });
  });
}

boot();
