import { useEffect, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import { EASE_OUT } from '../../lib/motion';

/** Counts up from zero the first time it scrolls into view. */
export default function Counter({ value, decimals = 0, duration = 2.2, className, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(mv, value, { duration, ease: EASE_OUT, delay });
    return () => controls.stop();
  }, [inView, mv, value, duration, delay]);

  return (
    <motion.span ref={ref} className={className} aria-label={value.toFixed(decimals)}>
      {text}
    </motion.span>
  );
}
