import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion';
import { GALLERY } from '../data/site';
import { EASE_IN_OUT, wait } from '../lib/motion';
import { preloadImages } from '../lib/hooks';
import Img, { HERO_SIZES } from './ui/Img';
import './Intro.css';

/*
 * A cinematic title sequence that becomes the homepage.
 *
 *   mark:   the KA monogram draws itself on black, then lifts into the
 *           top letterbox bar
 *   arrive: a gold light flare sweeps the screen as the first photo wipes
 *           in and KASART / HAIR rise letter by letter
 *   reel:   three sharp photos, each shown whole in a tall frame between the
 *           bars, change at a calm, even pace while the letters fill with gold
 *   exit:   the final photo gets a second flare, then the frame shrinks
 *           into the hero's arch (rounding its corners on the way) as the
 *           bars slide off and the slatted curtain opens
 *
 * The "stage" holding the photos is laid out exactly over the hero arch and
 * scaled up to fill the space between the bars, so the exit is a single
 * transform back to scale 1: smooth, and it lands pixel-perfect on the arch.
 */

// The three sharpest photos: the salon first, then the hero look from the
// side and from behind, ending on the photo the hero arch shows.
// Each uses its extra-high-quality "-hq" file.
const PHOTOS = ['salon-shelves', 'balayage-side', 'balayage-curls'];
const hq = (name) => `${name}-hq`;
const LAST = PHOTOS.length - 1;
const TITLES = { 'salon-shelves': 'The Salon', ...Object.fromEntries(GALLERY.map((g) => [g.id, g.title])) };
const HERO_ARCH_RADIUS = 26; // bottom corner radius of .hero__arch (px)

// Timeline (ms)
const MS = {
  mark: 850, // monogram draws on black
  arrive: 700, // flare + first photo + letters rise
  reel: 2700, // calm, evenly spaced changes of photo
  hold: 650, // final portrait + second flare
  flightDelay: 120,
  flight: 1300, // full-screen photo shrinks into the hero arch
  reveal: 420, // hero copy starts animating
  done: 1800, // intro removed
};

const pad = (n) => String(n).padStart(2, '0');
const barHeight = (vh) => Math.round(Math.min(96, Math.max(52, vh * 0.1)));

function useViewport() {
  const read = () => ({ w: window.innerWidth, h: window.innerHeight });
  const [vp, setVp] = useState(() => (typeof window === 'undefined' ? { w: 1280, h: 800 } : read()));
  useEffect(() => {
    const onResize = () => setVp(read());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return vp;
}

function IntroMonogram({ play }) {
  const id = `imono${useId().replace(/:/g, '')}`;
  const on = (to) => (play ? to : {});
  const out = [0.16, 1, 0.3, 1];

  return (
    <svg className="intro__mono" viewBox="0 0 160 160" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f6e3b4" />
          <stop offset="0.5" stopColor="#c9a35c" />
          <stop offset="1" stopColor="#9a7434" />
        </linearGradient>
      </defs>
      <motion.path
        d="M80 5a75 75 0 1 1 0 150a75 75 0 1 1 0-150"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="1.8"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={on({ pathLength: 1, opacity: 1 })}
        transition={{ pathLength: { duration: 1.4, ease: EASE_IN_OUT }, opacity: { duration: 0.2 } }}
      />
      <motion.circle
        cx="80"
        cy="80"
        r="66"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="0.6"
        strokeOpacity="0.55"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={on({ scale: 1, opacity: 1 })}
        transition={{ duration: 1.3, ease: out, delay: 0.15 }}
      />
      <motion.text
        x="55"
        y="98"
        textAnchor="middle"
        className="intro__mono-letter"
        fill={`url(#${id})`}
        initial={{ x: -26, opacity: 0 }}
        animate={on({ x: 0, opacity: 1 })}
        transition={{ duration: 1, ease: out, delay: 0.3 }}
      >
        K
      </motion.text>
      <motion.line
        x1="80"
        y1="48"
        x2="80"
        y2="112"
        stroke={`url(#${id})`}
        strokeWidth="1.6"
        initial={{ scaleY: 0 }}
        animate={on({ scaleY: 1 })}
        transition={{ duration: 0.8, ease: EASE_IN_OUT, delay: 0.2 }}
      />
      <motion.text
        x="105"
        y="98"
        textAnchor="middle"
        className="intro__mono-letter"
        fill={`url(#${id})`}
        initial={{ x: 26, opacity: 0 }}
        animate={on({ x: 0, opacity: 1 })}
        transition={{ duration: 1, ease: out, delay: 0.3 }}
      >
        A
      </motion.text>
    </svg>
  );
}

/** Each letter rises out of its own mask and fills with gold as `fill` grows. */
function Letters({ text, start, outer, inner }) {
  return (
    <span className="intro__word">
      {text.split('').map((ch, i) => (
        <span key={i} className="intro__l" style={{ '--i': start + i }}>
          <span className="intro__l-in">
            <span className="intro__l-out">{ch}</span>
            <motion.span className="intro__l-wrap" style={{ y: outer }}>
              <motion.span className="intro__l-fill" style={{ y: inner }}>
                {ch}
              </motion.span>
            </motion.span>
          </span>
        </span>
      ))}
    </span>
  );
}

function CinematicIntro({ onReveal, onDone }) {
  const vp = useViewport();
  const portrait = vp.w / vp.h < 1;
  const bar = barHeight(vp.h);
  const slatCount = portrait || vp.w < 700 ? 6 : 12;
  const center = (slatCount - 1) / 2;

  const [phase, setPhase] = useState('boot'); // boot → mark → arrive → reel → exit
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const progress = useMotionValue(0);
  const count = useTransform(progress, (v) => String(Math.round(v)).padStart(3, '0'));
  const barScale = useTransform(progress, [0, 100], [0, 1]);
  // Gold fill: the clipping box slides up while its contents slide down by the
  // same amount, so the letters stay put and only the "waterline" rises.
  const fillOuter = useTransform(progress, (v) => `${100 - v}%`);
  const fillInner = useTransform(progress, (v) => `${v - 100}%`);

  const stageRef = useRef(null);
  const geo = useRef(null);
  const reel = useRef(null);
  const timers = useRef([]);
  const exited = useRef(false);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  useMotionValueEvent(progress, 'change', (v) => {
    const s = Math.min(LAST, Math.floor((v / 100) * PHOTOS.length));
    if (s > stepRef.current) {
      stepRef.current = s;
      setStep(s);
    }
  });

  /** Lay the stage exactly over the hero arch, then scale it up to fill the screen. */
  const place = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const hero = document.querySelector('.hero__arch');
    let r = hero?.getBoundingClientRect();
    if (!r || !r.width) {
      const w = Math.min(vw * 0.6, vh * 0.55);
      r = { left: (vw - w) / 2, top: (vh - w * 1.35) / 2, width: w, height: w * 1.35 };
    }
    // Show each photo whole and sharp: fit its height between the letterbox
    // bars instead of stretching it across a wide screen. (On a phone that
    // is wider than the screen, so it still fills it edge to edge.)
    const barH = barHeight(vh);
    const s = (vh - 2 * barH) / r.height;
    const W = r.width * s;
    const cover = `translate3d(${(vw - W) / 2 - r.left}px, ${barH - r.top}px, 0) scale(${s})`;
    Object.assign(el.style, {
      left: `${r.left}px`,
      top: `${r.top}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
      transform: cover,
    });
    geo.current = { w: r.width, cover, found: !!hero };
  }, []);

  useLayoutEffect(() => {
    if (!exited.current) place();
  }, [phase, vp, place]);

  /** Shrink the full-screen stage into the hero arch (runs on the compositor). */
  const fly = () => {
    const el = stageRef.current;
    if (!el || !el.animate) return false;
    place();
    const g = geo.current;
    if (!g?.found) return false;
    const r = `${g.w / 2}px`;
    el.animate(
      [
        { transform: g.cover, borderRadius: '0px' },
        { transform: 'translate3d(0px, 0px, 0) scale(1)', borderRadius: `${r} ${r} ${HERO_ARCH_RADIUS}px ${HERO_ARCH_RADIUS}px` },
      ],
      { duration: MS.flight, delay: MS.flightDelay, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', fill: 'forwards' },
    );
    return true;
  };

  const exit = useRef(() => {});
  exit.current = () => {
    if (exited.current) return;
    exited.current = true;
    reel.current?.stop();
    if (progress.get() < 100) animate(progress, 100, { duration: 0.3, ease: 'easeOut' });
    stepRef.current = LAST;
    setStep(LAST);
    setPhase('exit');
    requestAnimationFrame(() => {
      if (!fly()) stageRef.current?.classList.add('is-lost');
    });
    later(onReveal, MS.reveal);
    later(onDone, MS.done);
  };

  // The timeline
  useEffect(() => {
    let alive = true;
    const fonts = document.fonts
      ? Promise.all([
          document.fonts.load('400 64px Cinzel'),
          document.fonts.load('500 64px Cinzel'),
          document.fonts.load('300 64px "Cormorant Garamond"'),
          document.fonts.load('italic 300 64px "Cormorant Garamond"'),
        ]).catch(() => {})
      : Promise.resolve();
    const photosReady = Promise.race([
      preloadImages(PHOTOS.map((name) => ({ name: hq(name), sizes: HERO_SIZES }))),
      wait(3000),
    ]);

    Promise.race([fonts, wait(1500)]).then(() => {
      if (!alive || exited.current) return;
      setPhase('mark');
      Promise.all([wait(MS.mark), photosReady]).then(() => {
        if (!alive || exited.current) return;
        setPhase('arrive');
        later(() => {
          if (!alive || exited.current) return;
          setPhase('reel');
          reel.current = animate(progress, 100, {
            duration: MS.reel / 1000,
            ease: 'linear', // evenly spaced, unhurried changes
            onComplete: () => alive && later(() => exit.current(), MS.hold),
          });
        }, MS.arrive);
      });
    });

    return () => {
      alive = false;
      reel.current?.stop();
    };
  }, [progress]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const rolling = phase === 'arrive' || phase === 'reel' || phase === 'exit';
  const markTarget =
    phase === 'boot'
      ? { opacity: 0, y: vp.h / 2 - bar / 2, scale: 1 }
      : phase === 'mark'
        ? { opacity: 1, y: vp.h / 2 - bar / 2, scale: 1 }
        : phase === 'exit'
          ? { opacity: 0, y: -bar, scale: 0.34 }
          : { opacity: 1, y: 0, scale: 0.34 };

  return (
    <div
      className={`intro is-${phase}${step === LAST && rolling ? ' is-last' : ''}${portrait ? ' is-portrait' : ''}`}
      style={{ '--bar': `${bar}px` }}
      role="presentation"
    >
      {/* Slatted curtain that opens onto the homepage */}
      <div className="intro__slats" aria-hidden="true">
        {Array.from({ length: slatCount }, (_, i) => (
          <div
            key={`${slatCount}-${i}`}
            className="intro__slat"
            style={{
              '--o': i % 2 ? '50% 100%' : '50% 0%',
              '--d': `${0.2 + Math.abs(i - center) * 0.05}s`,
              '--ld': `${0.05 + i * 0.04}s`,
            }}
          >
            <span className="intro__slat-line" />
          </div>
        ))}
      </div>
      <div className="intro__glow" aria-hidden="true" />

      {/* Photo stage: shrinks into the hero arch at the end */}
      <div ref={stageRef} className="intro__stage" aria-hidden="true">
        {PHOTOS.map((name, i) => (
          <div
            key={name}
            className={`intro__photo${rolling && i <= step ? ' is-in' : ''}${rolling && i < step - 1 ? ' is-gone' : ''}`}
            style={{ zIndex: i }}
          >
            <Img name={hq(name)} sizes={HERO_SIZES} eager alt="" />
          </div>
        ))}
        <div className="intro__dim" />
        <div className="intro__shade" />
      </div>

      <div className="intro__flare intro__flare--a" aria-hidden="true" />
      <div className="intro__flare intro__flare--b" aria-hidden="true" />

      <div className="intro__words" aria-hidden="true">
        <Letters text="KasArt" start={0} outer={fillOuter} inner={fillInner} />
        <Letters text="Hair" start={2} outer={fillOuter} inner={fillInner} />
      </div>

      {/* Letterbox bars */}
      <div className="intro__bar intro__bar--top">
        <span className="intro__tag">Lindfield · Sydney</span>
        <button type="button" className="intro__skip" onClick={() => exit.current()}>
          Skip intro
        </button>
      </div>
      <div className="intro__bar intro__bar--bottom" aria-hidden="true">
        <motion.span className="intro__count">{count}</motion.span>
        <span className="intro__progress">
          <motion.span style={{ scaleX: barScale }} />
        </span>
        <span className="intro__cap">
          <span className="intro__cap-no">
            {pad(step + 1)} / {pad(PHOTOS.length)}
          </span>
          <span className="intro__cap-title">{TITLES[PHOTOS[step]]}</span>
        </span>
      </div>

      <motion.div
        className="intro__mark"
        initial={{ opacity: 0, y: vp.h / 2 - bar / 2, scale: 1 }}
        animate={markTarget}
        transition={{ duration: phase === 'mark' ? 0.4 : phase === 'exit' ? 0.6 : 0.75, ease: EASE_IN_OUT }}
        aria-hidden="true"
      >
        <IntroMonogram play={phase !== 'boot'} />
      </motion.div>
    </div>
  );
}

export default CinematicIntro;
