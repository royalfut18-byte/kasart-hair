import Lenis from 'lenis';
import { cancelFrame, frame } from 'framer-motion';

let lenis = null;
let locks = 0;
let running = false;
let justWoke = false;
let quietFrames = 0;

// Lenis only needs a frame loop while it is gliding towards a scroll target.
// Running it forever (the usual setup) makes the browser produce a full frame
// 60 times a second even while the page sits still, and each of those frames
// re-styles the moving rows and any reveal that's playing. So the loop starts
// on wheel input or a programmatic scroll, and stops itself a few frames
// after the glide has finished.
const tick = ({ timestamp }) => {
  if (justWoke) {
    // Lenis steps by the time since its previous frame. After a pause that
    // gap is huge and the first step would jump straight to the target, so
    // count the first frame after waking as one ordinary 60fps frame.
    lenis.time = timestamp - 1000 / 60;
    justWoke = false;
  }
  lenis.raf(timestamp);
  if (lenis.animate.isRunning) {
    quietFrames = 0;
  } else if (++quietFrames > 2) {
    cancelFrame(tick);
    running = false;
  }
};

function wake() {
  if (!lenis || running) return;
  running = true;
  justWoke = true;
  quietFrames = 0;
  // Drive Lenis from Framer Motion's frame loop, in its very first step:
  // the page is scrolled before Framer measures the scroll position, so every
  // scroll-linked animation renders for the position on screen in the same
  // frame (from a later step it would always draw one frame behind).
  frame.setup(tick, true);
}

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

  // Wheel input reaches Lenis as a "virtual scroll" just before it starts
  // gliding: that's the moment to start the loop.
  lenis.on('virtual-scroll', wake);
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
    wake();
  } else if (typeof el === 'number') {
    window.scrollTo({ top: el, behavior: 'smooth' });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
