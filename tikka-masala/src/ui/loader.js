// Intro curtain: counts to 100 while fonts + the 3D jar get ready, then lifts.
import { gsap } from 'gsap';

export function runLoader(ready, { reduced }) {
  const el = document.querySelector('.loader');
  const num = el.querySelector('.loader__num');
  const bar = el.querySelector('.loader__bar i');
  const state = { p: 0 };

  return new Promise((resolve) => {
    if (reduced) {
      ready.then(() => { gsap.to(el, { autoAlpha: 0, duration: 0.3, onComplete: () => { el.remove(); resolve(); } }); });
      return;
    }
    // fake progress up to 80% quickly, the rest once everything is really ready
    const t1 = gsap.to(state, {
      p: 80, duration: 1.1, ease: 'power2.out',
      onUpdate: () => { num.textContent = Math.round(state.p); bar.style.transform = `scaleX(${state.p / 100})`; },
    });
    ready.then(() => {
      t1.kill();
      gsap.timeline({ onComplete: () => { el.remove(); } })
        .to(state, {
          p: 100, duration: 0.5, ease: 'power2.inOut',
          onUpdate: () => { num.textContent = Math.round(state.p); bar.style.transform = `scaleX(${state.p / 100})`; },
        })
        .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 1.05, ease: 'expo.inOut' }, '+=0.1')
        .add(resolve, '-=0.55');
    });
  });
}
