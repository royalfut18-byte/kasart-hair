import Lenis from 'lenis';
import { frame } from 'framer-motion';

let lenis = null;
let locks = 0;

/**
 * Smooth wheel scrolling on desktop.
 * Touch devices keep their native scrolling, which is already smooth.
 */
export function initLenis() {
  if (lenis || typeof window === 'undefined') return lenis;
  // Phones and tablets already scroll smoothly; skipping Lenis there also
  // avoids a frame loop that would run (and drain battery) forever.
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return null;

  lenis = new Lenis({
    lerp: 0.13, // responsive: a long glide feels like input lag
    smoothWheel: true,
    syncTouch: false,
  });

  // Drive Lenis from Framer Motion's frame loop, in its very first step:
  // the page is scrolled before Framer measures the scroll position, so every
  // scroll-linked animation renders for the position on screen in the same
  // frame (from a later step it would always draw one frame behind).
  frame.setup(({ timestamp }) => lenis.raf(timestamp), true);
  return lenis;
}

export const getLenis = () => lenis;

/** Reference-counted scroll lock, shared by the intro, menu and lightbox. */
export function lockScroll(lock) {
  locks = Math.max(0, locks + (lock ? 1 : -1));
  const locked = locks > 0;
  document.documentElement.classList.toggle('is-locked', locked);
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
}

export function scrollToTarget(target, { offset = 0 } = {}) {
  const el =
    target === '#top' || target === 0
      ? 0
      : typeof target === 'string'
        ? document.querySelector(target)
        : target;
  if (el === null || el === undefined) return;

  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.6, force: true });
  } else if (typeof el === 'number') {
    window.scrollTo({ top: el, behavior: 'smooth' });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
