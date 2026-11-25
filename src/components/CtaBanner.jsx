import { useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import { HOURS_PHRASE, SITE } from '../data/site';
import { EASE_IN_OUT, EASE_OUT } from '../lib/motion';
import { useScrollEffects, useScrollProgress } from '../lib/scroll';
import SplitText from './ui/SplitText';
import Reveal from './ui/Reveal';
import Img from './ui/Img';
import Button from './ui/Button';
import './CtaBanner.css';

// The photo opens from the bottom and settles as it scrolls into view. Plain
// `transform` strings run on the GPU, and both end at scale 1, so once it's
// in place the photo is drawn at full sharpness.
const ARCH = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)' },
  show: {
    clipPath: 'inset(0% 0% 0% 0%)',
    transitionEnd: { clipPath: 'none' },
    transition: { duration: 1.4, ease: EASE_IN_OUT },
  },
};
const CTA_RANGE = ['start end', 'start start'];
const BG_FRAMES = [{ transform: 'scale(0.86)' }, { transform: 'scale(1)' }];

const PHOTO = {
  hidden: { transform: 'scale(1.2)' },
  show: {
    transform: 'scale(1)',
    transitionEnd: { transform: 'none' },
    transition: { duration: 2, ease: EASE_OUT },
  },
};

/**
 * Closing call to action. A dark panel grows to fill the screen as it
 * scrolls in, with a photo in an arch beside the copy.
 *
 * The salon's photos are 800 to 1,100px wide, so stretched across a whole
 * screen they turn soft. Here the photo is shown at about its real size,
 * and only the panel's background is scaled (one GPU layer), never the
 * photo or text, so both stay sharp.
 */
export default function CtaBanner() {
  const ref = useRef(null);
  const bgRef = useRef(null);

  // The panel grows as it scrolls in: on the GPU via the browser's scroll
  // timeline where supported, otherwise from scroll progress in JavaScript.
  const onGpu = useScrollEffects(ref, CTA_RANGE, [{ ref: bgRef, keyframes: BG_FRAMES }]);
  const scrollYProgress = useScrollProgress(ref, CTA_RANGE, !onGpu);
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);

  return (
    <section ref={ref} className="cta" aria-label="Book your appointment">
      <motion.div ref={bgRef} className="cta__bg" style={onGpu ? undefined : { scale }} aria-hidden="true" />

      <div className="cta__inner">
        <motion.div className="cta__media" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
          <motion.div className="cta__arch" variants={ARCH}>
            <motion.div className="cta__photo" variants={PHOTO}>
              <Img name="balayage-side-hq" sizes="(max-width: 900px) 60vw, 36vw" />
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="cta__content">
          <Reveal>
            <span className="eyebrow">Book your visit</span>
          </Reveal>
          <SplitText as="h2" className="display cta__title" text={'Your chair\n*is waiting.*'} />
          <Reveal as="p" className="cta__text" delay={0.15}>
            Open {HOURS_PHRASE}, on the Pacific Highway in {SITE.suburb}.
          </Reveal>
          <Reveal className="cta__actions" delay={0.25}>
            <Button href={SITE.phoneHref}>{`Call ${SITE.phone}`}</Button>
            <Button href={SITE.mapsUrl} variant="link">
              Get directions
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
