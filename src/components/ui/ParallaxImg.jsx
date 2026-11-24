import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import Img from './Img';
import { EASE_IN_OUT } from '../../lib/motion';

/**
 * Image that wipes in from below, then drifts inside its frame as the
 * page scrolls for a sense of depth.
 *
 * The reveal is triggered from scroll progress rather than whileInView:
 * an element clipped to nothing never counts as "visible" to
 * IntersectionObserver, so it would never start.
 */
export default function ParallaxImg({ name, speed = 10, className = '', sizes, alt, delay = 0, style }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${speed}%`, `${speed}%`]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!shown && v > 0.08) setShown(true);
  });

  return (
    <motion.div
      ref={ref}
      className={`pimg ${className}`}
      style={style}
      initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
      animate={shown ? { clipPath: 'inset(0% 0% 0% 0%)', transitionEnd: { clipPath: 'none' } } : undefined}
      transition={{ duration: 1.5, ease: EASE_IN_OUT, delay }}
    >
      <motion.div className="pimg__inner" style={{ y, scale: 1 + (speed * 2.4) / 100 }}>
        <Img name={name} sizes={sizes} alt={alt} />
      </motion.div>
    </motion.div>
  );
}
