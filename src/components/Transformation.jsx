import { useEffect, useRef } from 'react';
import { animate, easeInOut, motion, useInView, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion';
import { STEPS } from '../data/site';
import SplitText from './ui/SplitText';
import Reveal from './ui/Reveal';
import Img from './ui/Img';
import Monogram from './ui/Monogram';
import { ChevronLeft, ChevronRight } from './ui/icons';
import './Transformation.css';

/* ---------- the self-running "drag me" sweep ----------
   Divider position (% from the left) goes 50 → 24 → 76 → 50 over 3.4s with
   an ease-in-out on each leg, then rests at 50 for 1.4s, and repeats. It runs
   as Web Animations on the GPU: driving it from JavaScript meant work on every
   frame for as long as the slider was on screen, even with nobody scrolling. */
const SWEEP = [50, 24, 76, 50];
const SWEEP_TIMES = [0, 0.32, 0.72, 1];
const SWEEP_S = 3.4;
const REST_S = 1.4;
const PERIOD_S = SWEEP_S + REST_S;
const EASE = 'cubic-bezier(0.42, 0, 0.58, 1)'; // Framer Motion's easeInOut

/** Divider position `t` seconds into the sweep. */
function sweepAt(t) {
  const u = t / SWEEP_S;
  if (u >= 1) return SWEEP[3];
  for (let k = 0; k < 3; k++) {
    if (u <= SWEEP_TIMES[k + 1]) {
      const local = (u - SWEEP_TIMES[k]) / (SWEEP_TIMES[k + 1] - SWEEP_TIMES[k]);
      return SWEEP[k] + (SWEEP[k + 1] - SWEEP[k]) * easeInOut(local);
    }
  }
  return SWEEP[3];
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
// The "Sleek" / "Curled" tags fade as the divider nears their edge.
const leftTagFor = (v) => clamp01((v - 6) / 20);
const rightTagFor = (v) => clamp01(1 - (v - 74) / 20);

function sweepFrames(sign) {
  const at = (v) => `translateX(${sign * v}%)`;
  return [
    { offset: 0, transform: at(SWEEP[0]), easing: EASE },
    { offset: (SWEEP_TIMES[1] * SWEEP_S) / PERIOD_S, transform: at(SWEEP[1]), easing: EASE },
    { offset: (SWEEP_TIMES[2] * SWEEP_S) / PERIOD_S, transform: at(SWEEP[2]), easing: EASE },
    { offset: SWEEP_S / PERIOD_S, transform: at(SWEEP[3]) },
    { offset: 1, transform: at(SWEEP[3]) },
  ];
}

// The tags' fades follow the divider's eased path, so sample it finely.
function tagFrames(fn) {
  const n = 240;
  return Array.from({ length: n + 1 }, (_, i) => ({ offset: i / n, opacity: fn(sweepAt((i / n) * PERIOD_S)) }));
}

/**
 * Drag-to-compare: a blonde worn sleek and straight on the left, another
 * finished in soft curls on the right. The two photos are cropped so the
 * heads line up along the handle. The right-hand photo is revealed with
 * transforms only (no clip-path), which every phone browser renders
 * reliably and smoothly.
 */
export default function Transformation() {
  const sliderRef = useRef(null);
  const handleRef = useRef(null);
  const afterRef = useRef(null);
  const innerRef = useRef(null);
  const dividerRef = useRef(null);
  const leftTagRef = useRef(null);
  const rightTagRef = useRef(null);
  const sweep = useRef(null);
  const touched = useRef(false);
  const dragging = useRef(false);
  const touchStart = useRef(null);

  const pos = useMotionValue(50); // divider position, % from the left
  const afterX = useTransform(pos, (v) => `${v}%`); // mask and divider slide right…
  const innerX = useTransform(pos, (v) => `${-v}%`); // …photo slides back, so it stays still
  const leftTagOpacity = useTransform(pos, leftTagFor);
  const rightTagOpacity = useTransform(pos, rightTagFor);

  const inView = useInView(sliderRef, { amount: 0.35 });

  useMotionValueEvent(pos, 'change', (v) => {
    handleRef.current?.setAttribute('aria-valuenow', String(Math.round(v)));
  });

  // Gentle back-and-forth sweep whenever it's on screen, until someone
  // touches it, so it's obvious the photo can be dragged.
  useEffect(() => {
    if (touched.current) return;
    const running = sweep.current;
    if (!inView) {
      running?.forEach((a) => a.pause());
      return;
    }
    if (running) {
      running.forEach((a) => a.play());
      return;
    }
    const timing = { duration: PERIOD_S * 1000, iterations: Infinity, easing: 'linear' };
    sweep.current = [
      afterRef.current.animate(sweepFrames(1), timing),
      dividerRef.current.animate(sweepFrames(1), timing),
      innerRef.current.animate(sweepFrames(-1), timing),
      leftTagRef.current.animate(tagFrames(leftTagFor), timing),
      rightTagRef.current.animate(tagFrames(rightTagFor), timing),
    ];
  }, [inView]);

  useEffect(() => () => sweep.current?.forEach((a) => a.cancel()), []);

  // Hand control to the person: stop the sweep exactly where it is.
  const takeOver = () => {
    touched.current = true;
    const running = sweep.current;
    if (!running) return;
    sweep.current = null;
    const t = ((running[0].currentTime ?? 0) / 1000) % PERIOD_S;
    running.forEach((a) => {
      a.commitStyles?.(); // hold the current frame until Framer redraws it
      a.cancel();
    });
    pos.set(sweepAt(t));
  };

  const xToPos = (clientX) => {
    const r = sliderRef.current.getBoundingClientRect();
    return Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
  };
  const setFromX = (clientX) => pos.set(xToPos(clientX));

  const beginDrag = (e) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setFromX(e.clientX);
  };

  const onPointerDown = (e) => {
    takeOver();
    if (e.pointerType === 'mouse') {
      beginDrag(e);
      return;
    }
    // Touch: wait to see which way the finger moves, so a vertical swipe
    // still scrolls the page.
    touchStart.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e) => {
    if (dragging.current) {
      setFromX(e.clientX);
      return;
    }
    if (!touchStart.current) return;
    const dx = Math.abs(e.clientX - touchStart.current.x);
    const dy = Math.abs(e.clientY - touchStart.current.y);
    if (dx > 8 && dx > dy) beginDrag(e);
    else if (dy > 8) touchStart.current = null;
  };

  const onPointerUp = (e) => {
    // a quick tap (no drag) jumps the divider to that spot
    if (!dragging.current && touchStart.current) {
      animate(pos, xToPos(e.clientX), { duration: 0.4, ease: 'easeOut' });
    }
    dragging.current = false;
    touchStart.current = null;
  };

  const stop = () => {
    dragging.current = false;
    touchStart.current = null;
  };

  const onKeyDown = (e) => {
    const step = e.shiftKey ? 10 : 4;
    let next = null;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = pos.get() - step;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = pos.get() + step;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = 100;
    if (next === null) return;
    e.preventDefault();
    takeOver();
    animate(pos, Math.min(100, Math.max(0, next)), { duration: 0.35, ease: 'easeOut' });
  };

  return (
    <section className="tf section section--dark sheet before-sheet">
      <div className="container tf__grid">
        <div className="tf__intro">
          <Reveal>
            <span className="eyebrow">The finish</span>
          </Reveal>
          <SplitText as="h2" className="display title-lg tf__title" text={'Sleek or\n*softly curled?*'} />
          <Reveal as="p" className="lead" delay={0.1}>
            Drag the handle to compare two ways to wear blonde: glass-smooth and straight, or soft, bouncy
            curls. However you like to wear your hair, we colour and finish it to suit.
          </Reveal>
        </div>

        <div className="tf__slider-wrap">
          <div
            ref={sliderRef}
            className="tf__slider"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={stop}
          >
            <Img
              name="finish-sleek"
              className="tf__img"
              sizes="(max-width: 900px) 92vw, 540px"
              eager
              alt="Left: a blonde ombré worn sleek and straight"
            />
            <motion.div ref={afterRef} className="tf__after" style={{ x: afterX }}>
              <motion.div ref={innerRef} className="tf__after-inner" style={{ x: innerX }}>
                <Img
                  name="finish-curled"
                  className="tf__img"
                  sizes="(max-width: 900px) 92vw, 540px"
                  eager
                  alt="Right: a blonde balayage finished in soft curls"
                />
              </motion.div>
            </motion.div>

            <motion.span ref={leftTagRef} className="tf__tag tf__tag--l" style={{ opacity: leftTagOpacity }}>
              Sleek
            </motion.span>
            <motion.span ref={rightTagRef} className="tf__tag tf__tag--r" style={{ opacity: rightTagOpacity }}>
              Curled
            </motion.span>

            {/* full-size layer slid by the same % as the mask, so the handle
                moves on the GPU (no layout per frame) */}
            <motion.div ref={dividerRef} className="tf__divider" style={{ x: afterX }}>
              <div
                ref={handleRef}
                className="tf__handle"
                role="slider"
                tabIndex={0}
                aria-label="Compare a sleek finish with a curled finish"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={50}
                onKeyDown={onKeyDown}
              >
                <span className="tf__knob">
                  <ChevronLeft />
                  <Monogram size={30} ring={false} />
                  <ChevronRight />
                </span>
              </div>
            </motion.div>
          </div>
          <p className="tf__hint" aria-hidden="true">
            <ChevronLeft /> Drag to compare <ChevronRight />
          </p>
        </div>

        <ol className="tf__steps">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.no} className="tf__step" delay={0.1 + i * 0.08} y={30}>
              <span className="tf__step-no">{s.no}</span>
              <span className="tf__step-body">
                <span className="tf__step-title">{s.title}</span>
                <span className="tf__step-text">{s.text}</span>
              </span>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
