import { Fragment, useMemo } from 'react';
import { motion } from 'framer-motion';
import { EASE_OUT, plainText, tokenize } from '../../lib/motion';

/**
 * Masked word-by-word reveal. Plays when scrolled into view, or when
 * `play` is passed (for elements controlled by the intro). Each word moves
 * with a plain `transform` so the browser animates it on the GPU.
 */
export default function SplitText({
  text,
  as = 'h2',
  className = '',
  delay = 0,
  stagger = 0.07,
  duration = 1.15,
  play,
  amount = 0.5,
}) {
  const tokens = useMemo(() => tokenize(text), [text]);
  const Tag = motion[as];

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const word = {
    hidden: { transform: 'translateY(115%) rotate(5deg)' },
    show: {
      transform: 'translateY(0%) rotate(0deg)',
      transitionEnd: { transform: 'none' },
      transition: { duration, ease: EASE_OUT },
    },
  };

  const trigger =
    play === undefined
      ? { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount } }
      : { initial: 'hidden', animate: play ? 'show' : 'hidden' };

  return (
    <Tag className={className} variants={container} {...trigger} aria-label={plainText(text)}>
      {tokens.map((t, i) =>
        t.br ? (
          <br key={i} />
        ) : (
          <Fragment key={i}>
            <span className="split-mask" aria-hidden="true">
              <motion.span className={`split-word${t.em ? ' em-gold' : ''}`} variants={word}>
                {t.word}
              </motion.span>
            </span>
            {tokens[i + 1] && !tokens[i + 1].br ? ' ' : null}
          </Fragment>
        ),
      )}
    </Tag>
  );
}
