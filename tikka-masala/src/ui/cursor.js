// Custom cursor: a blended dot + a lagging ring that grows on interactive
// elements and shows a label for elements with [data-cursor-label].
import { gsap } from 'gsap';

export function initCursor() {
  if (!matchMedia('(pointer: fine)').matches) return;
  const root = document.querySelector('.cursor');
  const dot = root.querySelector('.cursor__dot');
  const ring = root.querySelector('.cursor__ring');
  const label = root.querySelector('.cursor__label');
  document.documentElement.classList.add('has-cursor');

  const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' });

  window.addEventListener('pointermove', (e) => {
    dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    root.classList.remove('is-hidden');
  }, { passive: true });
  document.addEventListener('pointerleave', () => root.classList.add('is-hidden'));

  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('a, button, [data-cursor], [data-cursor-label]');
    const text = t?.dataset.cursorLabel;
    root.classList.toggle('is-hover', !!t && !text);
    root.classList.toggle('has-label', !!text);
    if (text) label.textContent = text;
  });
}
