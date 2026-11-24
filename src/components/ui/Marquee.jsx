import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './Marquee.css';

/**
 * Endless row that glides at a steady speed (px per second), completely
 * independent of scrolling. Runs on the GPU via the Web Animations API.
 *
 * - `children(isClone)` renders one copy of the row; the clones are hidden
 *   from screen readers and keyboard focus.
 * - `reverse` moves left → right instead of right → left.
 * - Pauses while hovered (mouse), while a finger is down (touch), when
 *   `paused` is set, and while off-screen (saves battery).
 */
export default function Marquee({
  children,
  speed = 50,
  reverse = false,
  pauseOnHover = true,
  paused = false,
  className = '',
  style,
}) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const listRef = useRef(null);
  const anim = useRef(null);
  const hold = useRef({ hover: false, press: false, hidden: false, paused });
  const [copies, setCopies] = useState(2);

  const sync = () => {
    const a = anim.current;
    if (!a) return;
    const h = hold.current;
    const stop = h.paused || h.hidden || (pauseOnHover && (h.hover || h.press));
    if (stop && a.playState === 'running') a.pause();
    else if (!stop && a.playState !== 'running') a.play();
  };

  // Build (and rebuild on resize) the looping animation.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const list = listRef.current;
    const track = trackRef.current;
    if (!root || !list || !track || !track.animate) return undefined;
    let width = 0;

    const build = () => {
      const w = list.offsetWidth; // layout width (unaffected by rotation)
      if (!w) return;
      const need = Math.max(2, Math.ceil(root.offsetWidth / w) + 1);
      setCopies((c) => (c === need ? c : need));
      if (w === width && anim.current) return;

      // keep our place in the loop when the size changes
      const prev = anim.current;
      const fraction = prev ? (prev.currentTime % prev.effect.getTiming().duration) / prev.effect.getTiming().duration : 0;
      prev?.cancel();

      width = w;
      const duration = (w / speed) * 1000;
      const a = track.animate(
        [{ transform: 'translate3d(0, 0, 0)' }, { transform: `translate3d(${-w}px, 0, 0)` }],
        { duration, iterations: Infinity, direction: reverse ? 'reverse' : 'normal', easing: 'linear' },
      );
      a.currentTime = fraction * duration;
      anim.current = a;
      sync();
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(list);
    ro.observe(root);
    const io = new IntersectionObserver(
      ([entry]) => {
        hold.current.hidden = !entry.isIntersecting;
        sync();
      },
      { rootMargin: '150px 0px' },
    );
    io.observe(root);

    return () => {
      ro.disconnect();
      io.disconnect();
      anim.current?.cancel();
      anim.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed, reverse]);

  useEffect(() => {
    hold.current.paused = paused;
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const set = (key, value) => () => {
    hold.current[key] = value;
    sync();
  };

  return (
    <div
      ref={rootRef}
      className={`marquee ${className}`}
      style={style}
      onPointerEnter={(e) => e.pointerType === 'mouse' && set('hover', true)()}
      onPointerLeave={set('hover', false)}
      onPointerDown={(e) => e.pointerType !== 'mouse' && set('press', true)()}
      onPointerUp={set('press', false)}
      onPointerCancel={set('press', false)}
    >
      <div ref={trackRef} className="marquee__track">
        {Array.from({ length: copies }, (_, k) => (
          <div key={k} ref={k === 0 ? listRef : undefined} className="marquee__list" aria-hidden={k > 0 || undefined}>
            {children(k > 0)}
          </div>
        ))}
      </div>
    </div>
  );
}
