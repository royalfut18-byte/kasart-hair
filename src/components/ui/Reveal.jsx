import { motion } from 'framer-motion';
import { EASE_OUT } from '../../lib/motion';

/**
 * Fade-and-rise when the element scrolls into view.
 *
 * Animates `opacity` and a plain `transform` string rather than Framer's
 * x/y shorthands: those two run as browser animations on the GPU, so a
 * reveal costs the main thread nothing while the page is scrolling.
 */
export default function Reveal({
  as = 'div',
  children,
  className,
  delay = 0,
  y = 44,
  x = 0,
  amount = 0.3,
  duration = 1.1,
  ...rest
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, transform: `translate(${x}px, ${y}px)` }}
      whileInView={{ opacity: 1, transform: 'translate(0px, 0px)', transitionEnd: { transform: 'none' } }}
      viewport={{ once: true, amount }}
      transition={{ duration, ease: EASE_OUT, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
