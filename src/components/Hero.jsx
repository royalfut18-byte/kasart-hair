import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HOURS_BRIEF, SITE } from '../data/site';
import { useIntroPhase } from '../lib/hooks';
import { scrollToTarget } from '../lib/lenis';
import { EASE_IN_OUT, EASE_OUT } from '../lib/motion';
import Button from './ui/Button';
import Img, { HERO_SIZES } from './ui/Img';
import { Star } from './ui/icons';
import './Hero.css';

// Entrance animations use plain `transform` strings (not x/y/scale
// shorthands) so the browser runs them on the GPU.
const settle = { transitionEnd: { transform: 'none' } };

function Line({ ready, delay, className = '', children }) {
  return (
    <span className={`hero__line ${className}`}>
      <motion.span
        className="hero__line-inner"
        initial={{ transform: 'translateY(115%) rotate(4deg)' }}
        animate={ready ? { transform: 'translateY(0%) rotate(0deg)', ...settle } : undefined}
        transition={{ duration: 1.4, ease: EASE_OUT, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

const rise = (ready, delay) => ({
  initial: { opacity: 0, transform: 'translateY(30px)' },
  animate: ready ? { opacity: 1, transform: 'translateY(0px)', ...settle } : undefined,
  transition: { duration: 1.2, ease: EASE_OUT, delay },
});

export default function Hero() {
  const phase = useIntroPhase();
  const ready = phase !== 'playing';
  // The intro's lookbook ends on this portrait and flies it into place, so the
  // hero arch stays hidden until it has landed, then swaps in on the same frame.
  const archShown = phase === 'done';
  const ref = useRef(null);

  // Scroll-out choreography
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const visualY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section id="top" data-nav="top" ref={ref} className="hero">
      <div className="container hero__grid">
        <motion.div className="hero__copy" style={{ y: copyY, opacity: copyOpacity }}>
          <motion.p
            className="eyebrow hero__eyebrow"
            initial={{ opacity: 0, transform: 'translateY(16px)' }}
            animate={ready ? { opacity: 1, transform: 'translateY(0px)', ...settle } : undefined}
            transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.6 }}
          >
            Lindfield Hair Salon
          </motion.p>

          <h1 className="hero__title" aria-label="The art of great hair.">
            <Line ready={ready} delay={0.3}>
              The art
            </Line>
            <Line ready={ready} delay={0.42} className="hero__line--indent">
              of
              {/* a small arch (same shape as the main portrait) showing ash blonde foils */}
              <motion.span
                className="hero__pill"
                initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
                animate={ready ? { clipPath: 'inset(0% 0% 0% 0%)', transitionEnd: { clipPath: 'none' } } : undefined}
                transition={{ duration: 1.2, ease: EASE_IN_OUT, delay: 1.0 }}
              >
                <motion.span
                  className="hero__pill-img"
                  initial={{ transform: 'scale(1.5)' }}
                  animate={ready ? { transform: 'scale(1)', ...settle } : undefined}
                  transition={{ duration: 1.8, ease: EASE_OUT, delay: 1.0 }}
                >
                  <Img name="ash-blonde" sizes="(max-width: 560px) 70px, 140px" eager alt="" />
                </motion.span>
              </motion.span>
            </Line>
            <Line ready={ready} delay={0.54}>
              <em className="em-gold">great hair.</em>
            </Line>
          </h1>

          <motion.p className="hero__sub" {...rise(ready, 0.85)}>
            Lindfield&rsquo;s home for seamless balayage, beautiful colour and cuts that suit you. Expert
            colouring, cutting and styling on the Pacific Highway, moments from the station.
          </motion.p>

          <motion.div className="hero__ctas" {...rise(ready, 1)}>
            <Button href={SITE.phoneHref}>Book an appointment</Button>
            <Button href="#work" variant="link">
              View the work
            </Button>
          </motion.div>
        </motion.div>

        <motion.div className="hero__visual" style={{ y: visualY }}>
          <div className="hero__arch-wrap">
            {/* Arrives via the intro: its portrait flies in and lands exactly here */}
            <div className="hero__arch" style={{ opacity: archShown ? 1 : 0 }}>
              <motion.div className="hero__arch-img" style={{ scale: imgScale }}>
                <div className="hero__arch-zoom">
                  {/* same high-quality file the intro ends on, so the hand-off is seamless */}
                  <Img name="balayage-curls-hq" sizes={HERO_SIZES} eager />
                </div>
              </motion.div>
              <div className="hero__arch-shade" />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="hero__meta container"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ duration: 1.2, delay: 1.5 }}
      >
        <span className="hero__meta-item">{HOURS_BRIEF}</span>
        <a
          className="hero__meta-item hero__rating"
          href="#reviews"
          onClick={(e) => {
            e.preventDefault();
            scrollToTarget('#reviews');
          }}
        >
          <Star className="hero__rating-star" />
          {SITE.rating} Google rating
        </a>
        <span className="hero__meta-item">
          {SITE.street}, {SITE.suburb}
        </span>
      </motion.div>
    </section>
  );
}
