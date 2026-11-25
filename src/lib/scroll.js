import { useLayoutEffect, useState } from 'react';
import { frame, motionValue } from 'framer-motion';
import { getLenis } from './lenis';

/*
 * Scroll-linked effects, with the same offset maths as Framer Motion's
 * useScroll({ target, offset }), but much lighter on every frame.
 *
 * useScroll re-measures its element on every frame of scrolling: it walks the
 * element's offsetParent chain (twice) and reads several sizes, for every
 * scroll effect on the page, on every frame, even when the element is far
 * off screen. Element positions only change when the layout does, so here
 * they are measured once, then again only after a resize, a change in the
 * page's height, fonts loading, or once a second while scrolling (a cheap
 * safety net).
 *
 * Two ways to use a measured range:
 * - useScrollEffects: keyframes played by the browser's own scroll-linked
 *   animations (a ScrollTimeline). They run on the GPU, exactly in step
 *   with the scroll, with no JavaScript per frame. Used where supported.
 * - useScrollProgress: a 0 → 1 motion value updated once per frame, for
 *   effects that need JavaScript, and as the fallback for the above.
 */

const trackers = new Set();
const scrollY = motionValue(0);
let started = false;
let stale = true;
let measuredAt = 0;
let latestY = 0;
let timeline = null;

/** True where the browser can run scroll-linked keyframes itself. */
export const scrollTimelines =
  typeof window !== 'undefined' &&
  typeof window.ScrollTimeline === 'function' &&
  typeof window.CSS?.supports === 'function' &&
  window.CSS.supports('animation-range: 0px 1px');

const NAMED = { start: 0, center: 0.5, end: 1 };

// Same rules as Framer Motion's resolveEdge.
function resolveEdge(edge, length, inset = 0) {
  let delta = 0;
  let value = edge;
  if (value in NAMED) value = NAMED[value];
  if (typeof value === 'string') {
    const n = parseFloat(value);
    if (value.endsWith('px')) delta = n;
    else if (value.endsWith('%')) value = n / 100;
    else if (value.endsWith('vw')) delta = (n / 100) * document.documentElement.clientWidth;
    else if (value.endsWith('vh')) delta = (n / 100) * document.documentElement.clientHeight;
    else value = n;
  }
  if (typeof value === 'number') delta = length * value;
  return inset + delta;
}

// Same rules as Framer Motion's resolveOffset: "target-edge container-edge".
function splitOffset(offset) {
  if (typeof offset === 'number') return [offset, offset];
  if (Array.isArray(offset)) return offset;
  const s = String(offset).trim();
  return s.includes(' ') ? s.split(' ') : [s, NAMED[s] !== undefined ? s : '0'];
}

function measure() {
  const root = document.documentElement;
  const viewport = root.clientHeight;
  for (const t of trackers) {
    const el = t.ref.current;
    if (!el) {
      t.ready = false;
      continue;
    }
    // Position in the page, from the offsetParent chain (as Framer does:
    // layout position, unaffected by transforms).
    let top = 0;
    let node = el;
    while (node && node !== root) {
      top += node.offsetTop;
      node = node.offsetParent;
    }
    const height = el.clientHeight;
    t.points = t.offset.map((o) => {
      const [targetEdge, containerEdge] = splitOffset(o);
      return resolveEdge(targetEdge, height, top) - resolveEdge(containerEdge, viewport);
    });
    t.ready = true;
    // Scroll-timeline effects play between the same two scroll positions.
    const [a, b] = t.points;
    if (t.anims && (t.range?.[0] !== a || t.range?.[1] !== b)) {
      t.range = [a, b];
      for (const anim of t.anims) {
        anim.rangeStart = `${a}px`;
        anim.rangeEnd = `${b}px`;
      }
    }
  }
  stale = false;
  measuredAt = performance.now();
}

function progressFor(t, y) {
  const [a, b] = t.points;
  if (a === b) return y < a ? 0 : 1;
  const p = (y - a) / (b - a);
  return p < 0 ? 0 : p > 1 ? 1 : p;
}

// Framer Motion order: measure in the "read" step, publish in "preUpdate".
function publish() {
  scrollY.set(latestY);
  for (const t of trackers) if (t.ready && t.value) t.value.set(progressFor(t, latestY));
}

function read() {
  if (stale || performance.now() - measuredAt > 1000) measure();
  latestY = window.scrollY;
  frame.preUpdate(publish);
}

const update = () => frame.read(read);
const remeasure = () => {
  stale = true;
  update();
};

function start() {
  if (started || typeof window === 'undefined') return;
  started = true;
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', remeasure);
  // Anything that changes the page's height (an accordion opening, images
  // or fonts settling) can move the elements below it.
  new ResizeObserver(remeasure).observe(document.body);
  document.fonts?.ready.then(remeasure);
  // On desktop, Lenis scrolls the page at the start of each frame: update in
  // that same frame, so effects always match the position on screen.
  getLenis()?.on('scroll', update);
}

/**
 * 0 → 1 as the page scrolls through `offset` for the element in `ref`, e.g.
 * ['start end', 'end start'] (Framer Motion's syntax and results). Pass
 * `enabled = false` when the value isn't needed (it then stays at 0).
 */
export function useScrollProgress(ref, offset, enabled = true) {
  const [value] = useState(() => motionValue(0));
  const key = JSON.stringify(offset);
  useLayoutEffect(() => {
    if (!enabled) return undefined;
    start();
    const tracker = { ref, offset: JSON.parse(key), value, points: [0, 1], ready: false };
    trackers.add(tracker);
    remeasure();
    return () => {
      trackers.delete(tracker);
    };
  }, [ref, key, value, enabled]);
  return value;
}

/**
 * Plays each effect's `keyframes` on its `ref` as the page scrolls through
 * `offset` for the element in `targetRef` (the range useScrollProgress would
 * report as 0 → 1), using the browser's scroll timeline. Returns false where
 * that isn't supported: the caller then drives the same effects from
 * useScrollProgress instead. `effects` must not change between renders.
 */
export function useScrollEffects(targetRef, offset, effects) {
  const key = JSON.stringify(offset);
  useLayoutEffect(() => {
    if (!scrollTimelines) return undefined;
    start();
    timeline ??= new window.ScrollTimeline({ source: document.documentElement, axis: 'block' });
    const anims = effects
      .filter((e) => e.ref.current)
      .map((e) => e.ref.current.animate(e.keyframes, { timeline, fill: 'both', easing: 'linear' }));
    const tracker = { ref: targetRef, offset: JSON.parse(key), anims, points: [0, 1], ready: false };
    trackers.add(tracker);
    measure(); // set the ranges before the first paint
    return () => {
      trackers.delete(tracker);
      anims.forEach((a) => a.cancel());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRef, key]);
  return scrollTimelines;
}

/** The page's scroll position, as a motion value shared by everyone. */
export function useScrollY() {
  useLayoutEffect(() => {
    start();
    update();
  }, []);
  return scrollY;
}
