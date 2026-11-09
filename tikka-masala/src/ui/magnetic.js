// Magnetic hover: the element leans toward the pointer, its content leans
// further, and both spring back with an elastic ease on leave.
import { gsap } from 'gsap';

export function initMagnetic(strength = 0.38) {
  if (!matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    // wrap the content so it can move independently (parallax inside the button)
    const inner = document.createElement('span');
    inner.className = 'btn__inner';
    while (el.firstChild) inner.appendChild(el.firstChild);
    el.appendChild(inner);

    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    const ixTo = gsap.quickTo(inner, 'x', { duration: 0.6, ease: 'power3.out' });
    const iyTo = gsap.quickTo(inner, 'y', { duration: 0.6, ease: 'power3.out' });

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      xTo(mx * strength); yTo(my * strength);
      ixTo(mx * strength * 0.45); iyTo(my * strength * 0.45);
    });
    el.addEventListener('pointerleave', () => {
      gsap.to([el, inner], { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, 0.35)', overwrite: true });
    });
  });
}
