import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, usePresence } from 'framer-motion';
import { lockScroll } from '../lib/lenis';
import { EASE_IN_OUT, EASE_OUT } from '../lib/motion';
import Img, { imageMeta } from './ui/Img';
import { ArrowLeft, ArrowRight, Close } from './ui/icons';
import './Lightbox.css';

/** Offset + scale that maps the element's box onto another rect (FLIP). */
function flipFrom(el, rect) {
  if (!el || !rect) return null;
  const f = el.getBoundingClientRect();
  if (!f.width) return null;
  return {
    x: rect.left + rect.width / 2 - (f.left + f.width / 2),
    y: rect.top + rect.height / 2 - (f.top + f.height / 2),
    scale: rect.width / f.width,
  };
}

const slide = {
  enter: (dir) => ({ x: dir * 120, opacity: 0, scale: 0.96 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir) => ({ x: dir * -120, opacity: 0, scale: 0.96 }),
};

export default function Lightbox({ items, start, originEl, onClose }) {
  const [isPresent, safeToRemove] = usePresence();
  const [[index, dir], setState] = useState([start, 0]);
  const item = items[index];
  const meta = imageMeta(item.id);
  const backdropRef = useRef(null);
  const mediaRef = useRef(null);
  const chromeRef = useRef(null);

  const go = (d) => setState(([i]) => [(i + d + items.length) % items.length, d]);

  useEffect(() => {
    lockScroll(true);
    return () => lockScroll(false);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  // Open: the photo flies out of its card.
  useLayoutEffect(() => {
    animate(backdropRef.current, { opacity: [0, 1] }, { duration: 0.5, ease: 'easeOut' });
    animate(chromeRef.current, { opacity: [0, 1] }, { duration: 0.6, delay: 0.45 });
    const d = flipFrom(mediaRef.current, originEl?.getBoundingClientRect());
    if (d) {
      animate(
        mediaRef.current,
        { x: [d.x, 0], y: [d.y, 0], scale: [d.scale, 1], borderRadius: ['22px', '14px'] },
        { duration: 0.95, ease: EASE_IN_OUT },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close: fly back into the card it came from (or fade if we navigated away).
  useEffect(() => {
    if (isPresent) return undefined;
    if (!mediaRef.current) {
      safeToRemove();
      return undefined;
    }
    let cancelled = false;
    // fly back into the very card that was clicked (the row repeats each photo)
    const card = index === start && originEl?.isConnected ? originEl : null;
    const d = card ? flipFrom(mediaRef.current, card.getBoundingClientRect()) : null;

    const runs = [
      animate(chromeRef.current, { opacity: 0 }, { duration: 0.25 }),
      animate(backdropRef.current, { opacity: 0 }, { duration: 0.6, ease: 'easeOut', delay: d ? 0.2 : 0 }),
      d
        ? animate(
            mediaRef.current,
            { x: d.x, y: d.y, scale: d.scale, borderRadius: '22px' },
            { duration: 0.85, ease: EASE_IN_OUT },
          )
        : animate(mediaRef.current, { opacity: 0, scale: 0.92 }, { duration: 0.4, ease: EASE_OUT }),
    ];
    Promise.all(runs).then(() => !cancelled && safeToRemove());
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresent]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Portfolio photo: ${item.title}`}>
      <div ref={backdropRef} className="lightbox__backdrop" onClick={onClose} />

      <div className="lightbox__stage">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.figure
            key={item.id}
            className="lightbox__figure"
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: EASE_OUT }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              // swipe between photos
              if (info.offset.x < -60 || info.velocity.x < -400) go(1);
              else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
            }}
          >
            <div
              ref={(el) => {
                // Exiting slides unmount after the new one mounts; keep the newest.
                if (el) mediaRef.current = el;
              }}
              className="lightbox__media"
              style={{ '--ratio': meta.w / meta.h, aspectRatio: `${meta.w} / ${meta.h}` }}
            >
              <Img name={item.id} sizes="(max-width: 700px) 92vw, 62vh" eager />
            </div>
          </motion.figure>
        </AnimatePresence>
      </div>

      <div ref={chromeRef} className="lightbox__chrome">
        <button type="button" className="lightbox__close" onClick={onClose} aria-label="Close">
          <Close />
        </button>
        <div className="lightbox__caption">
          <span className="lightbox__count">
            {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={item.id}
              className="lightbox__title"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              {item.title} <em>· {item.tag}</em>
            </motion.span>
          </AnimatePresence>
        </div>
        <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => go(-1)} aria-label="Previous photo">
          <ArrowLeft />
        </button>
        <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => go(1)} aria-label="Next photo">
          <ArrowRight />
        </button>
      </div>
    </div>
  );
}
