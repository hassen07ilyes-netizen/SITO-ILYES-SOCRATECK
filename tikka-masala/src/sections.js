// Section choreography: split-text reveals, pins, clip-path reveals, parallax.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const mobile = () => window.innerWidth < 768;

/** Split once, return chars (or words) wrapped in line masks. */
function split(el, type = 'chars') {
  // keep one clean, readable copy of the text for assistive tech
  if (!el.closest('[aria-label]')) {
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = el.textContent;
    el.before(sr);
  }
  el.setAttribute('aria-hidden', 'true');
  const s = SplitText.create(el, {
    type: type === 'chars' ? 'lines,chars' : 'lines,words',
    mask: 'lines',
    linesClass: 'split-line',
    charsClass: 'split-char',
    wordsClass: 'split-word',
    aria: 'none',
  });
  return type === 'chars' ? s.chars : s.words;
}

const charsIn = (extra = {}) => ({
  yPercent: 115, rotate: 5, duration: 1.15, ease: 'expo.out', stagger: 0.028, ...extra,
});

export function initSections({ reduced }) {
  if (reduced) {
    initStatic();
    return { heroIntro: () => {} };
  }

  /* ---------- generic split reveals (anything not choreographed below) ---------- */
  const custom = new Set([
    ...$$('.hero .split-chars'), ...$$('.adv .split-chars'), ...$$('.cta .split-chars'), ...$$('.grow .split-chars'),
  ]);
  $$('.split-chars').forEach((el) => {
    if (custom.has(el)) return;
    const chars = split(el);
    gsap.from(chars, charsIn({ scrollTrigger: { trigger: el, start: 'top 88%', once: true } }));
  });
  $$('.split-words').forEach((el) => {
    const words = split(el, 'words');
    gsap.from(words, { yPercent: 105, duration: 1, ease: 'power3.out', stagger: 0.012, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  /* ---------- 01 hero ---------- */
  const heroChars = $$('.hero__line').map((l) => split(l));
  const subChars = split($('.hero__sub'));
  gsap.set([heroChars.flat(), subChars], { yPercent: 115 });
  gsap.set('.hero__foot > *, .hero__scroll, .hero__meta li, .nav > *', { autoAlpha: 0, y: 24 });

  const heroIntro = () =>
    gsap.timeline()
      .to(heroChars.flat(), { yPercent: 0, rotate: 0, duration: 1.4, ease: 'expo.out', stagger: 0.045 })
      .to(subChars, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.03 }, 0.35)
      .to('.nav > *', { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.08 }, 0.4)
      .to('.hero__foot > *, .hero__scroll, .hero__meta li', { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.08 }, 0.6);

  // title drifts up & spreads as you leave the hero
  gsap.to('.hero__title', {
    yPercent: -28, letterSpacing: '0.02em', ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero__sub', { yPercent: -260, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: '60% top', scrub: true } });

  /* ---------- 02 unwrap the adventure: the line splits around the jar ---------- */
  const advL = split($('.adv__line--l'));
  const advR = split($('.adv__line--r'));
  gsap.from([...advL, ...advR], charsIn({ stagger: 0.03, scrollTrigger: { trigger: '#adventure', start: 'top 70%', once: true } }));
  gsap.timeline({
    scrollTrigger: { trigger: '#adventure', start: 'top top', end: '+=160%', pin: true, scrub: true },
  })
    .to('.adv__line--l', { xPercent: () => (mobile() ? -50 : -46), ease: 'power2.inOut' }, 0)
    .to('.adv__line--r', { xPercent: () => (mobile() ? 50 : 46), ease: 'power2.inOut' }, 0)
    .to('.adv__title', { scale: 1.08, ease: 'none' }, 0)
    .from('.adv__copy', { autoAlpha: 0, y: 40, duration: 0.3 }, 0.55);

  /* ---------- 03 a new perspective: giant title scrolls behind the jar ---------- */
  const marquee = $('.persp__marquee');
  gsap.timeline({
    scrollTrigger: { trigger: '#perspective', start: 'top top', end: '+=170%', pin: true, scrub: true, invalidateOnRefresh: true },
  })
    .fromTo(marquee, { x: () => window.innerWidth * 0.5 }, { x: () => -(marquee.scrollWidth - window.innerWidth * 0.5), ease: 'none', duration: 1 }, 0)
    .from('.persp__notes li', { autoAlpha: 0, y: 30, stagger: 0.06, duration: 0.15 }, 0.1);

  /* ---------- 04 no fillers: panel wipes in from the right ---------- */
  gsap.timeline({
    scrollTrigger: { trigger: '#fillers', start: 'top top', end: '+=110%', pin: true, scrub: true },
  })
    .to('.fillers__panel', { clipPath: 'inset(0 0 0 0%)', ease: 'power3.inOut', duration: 0.6 }, 0)
    .to('.fillers__photo img', { scale: 1, ease: 'power2.out', duration: 0.8 }, 0.05)
    .from('.fillers__photo', { yPercent: 18, ease: 'power2.out', duration: 0.8 }, 0.05)
    .from('.fillers__list li', { autoAlpha: 0, x: -40, stagger: 0.1, duration: 0.3 }, 0.1)
    .to('.fillers__pattern', { yPercent: -6, duration: 1, ease: 'none' }, 0);

  /* ---------- 05 tradition: photo reveals through an arch mask ---------- */
  $$('.reveal').forEach((fig) => {
    gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 82%', once: true } })
      .to(fig, { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 24px 24px)', duration: 1.5, ease: 'expo.out' })
      .to($('img', fig), { scale: 1, duration: 1.8, ease: 'expo.out' }, 0);
  });

  /* ---------- 05b the banana-leaf plate grows to fill the screen ---------- */
  const growChars = $$('.grow__title > span').map((l) => split(l));
  gsap.set(growChars.flat(), { yPercent: 115 });
  gsap.timeline({
    scrollTrigger: { trigger: '#grow', start: 'top top', end: '+=170%', pin: true, scrub: true },
  })
    .to('.grow__photo', { clipPath: 'inset(0vh 0vw 0vh 0vw round 0px 0px 0px 0px)', ease: 'power2.inOut', duration: 0.6 }, 0)
    .to('.grow__photo img', { scale: 1, ease: 'power2.out', duration: 0.7 }, 0)
    .to(growChars.flat(), { yPercent: 0, rotate: 0, stagger: 0.02, duration: 0.25, ease: 'power3.out' }, 0.5)
    .to({}, { duration: 0.2 });

  /* ---------- 06 collage: parallax tiles + jars sliding in from the sides ---------- */
  $$('[data-speed]').forEach((el) => {
    const speed = parseFloat(el.dataset.speed);
    gsap.fromTo(el, { yPercent: speed * 60 }, {
      yPercent: -speed * 60, ease: 'none',
      scrollTrigger: { trigger: '.collage__grid', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.from(el, { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    gsap.from($('img', el), { scale: 1.2, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });
  $$('.mini-jar').forEach((el, i) => {
    const from = parseFloat(el.dataset.from);
    const rot = [-16, 18, -8][i];
    gsap.fromTo(el, { xPercent: from * 160, rotate: rot + from * 40 }, {
      xPercent: 0, rotate: rot, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 35%', scrub: 1 + i * 0.4 },
    });
  });
  gsap.fromTo('.sticker', { rotate: -40, scale: 0.6 }, { rotate: 14, scale: 1, ease: 'back.out(2)', scrollTrigger: { trigger: '.sticker', start: 'top bottom', end: 'top 40%', scrub: 1 } });

  /* ---------- 07 cta ---------- */
  const ctaChars = $$('.cta__line').map((l) => split(l));
  gsap.from(ctaChars.flat(), charsIn({ stagger: 0.035, scrollTrigger: { trigger: '.cta__title', start: 'top 80%', once: true } }));
  gsap.fromTo('.cta__line:first-child', { xPercent: -12 }, { xPercent: 4, ease: 'none', scrollTrigger: { trigger: '#cta', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.cta__line--front', { xPercent: 12 }, { xPercent: -4, ease: 'none', scrollTrigger: { trigger: '#cta', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.cta__actions > *, .cta__eyebrow', { autoAlpha: 0, y: 30, stagger: 0.1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.cta__actions', start: 'top 92%', once: true } });

  /* ---------- 08 footer ---------- */
  gsap.from('.footer__mark', { yPercent: 60, ease: 'none', scrollTrigger: { trigger: '.footer__mark', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  gsap.from('.footer__badge', { scale: 0, rotate: -180, duration: 1.2, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.footer__magenta', start: 'top 60%', once: true } });

  return { heroIntro };
}

/** Reduced motion: no pins, no scrubs; content simply present. */
function initStatic() {
  gsap.set('.fillers__list li', { clearProps: 'all' });
}
