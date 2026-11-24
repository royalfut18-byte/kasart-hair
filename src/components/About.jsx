import { Fragment, useMemo, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { tokenize } from '../lib/motion';
import SplitText from './ui/SplitText';
import Reveal from './ui/Reveal';
import ParallaxImg from './ui/ParallaxImg';
import Counter from './ui/Counter';
import Button from './ui/Button';
import { OPEN_DAY_COUNT, SITE } from '../data/site';
import './About.css';

const STATEMENT =
  'Every appointment at KasArt Hair begins with *listening.* We’re a Lindfield salon devoted to *seamless balayage,* beautiful colour and *cuts that suit you.* With an expert eye and a warm, unhurried approach, you’ll leave with hair you *truly love.*';

function Word({ progress, range, em, children }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  // Plain words fade via text colour rather than opacity: same look, but
  // 50 opacity layers are much heavier for the browser to manage.
  const color = useTransform(progress, range, ['rgba(27, 22, 17, 0.14)', 'rgba(27, 22, 17, 1)']);
  return em ? (
    <motion.span className="em-gold" style={{ opacity }}>
      {children}
    </motion.span>
  ) : (
    <motion.span style={{ color }}>{children}</motion.span>
  );
}

/** Words light up one by one as you scroll through the paragraph. */
function ScrollStatement({ text }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.55'] });
  const words = useMemo(() => tokenize(text).filter((t) => !t.br), [text]);

  return (
    <p ref={ref} className="about__statement display">
      {words.map((t, i) => (
        <Fragment key={i}>
          <Word progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} em={t.em}>
            {t.word}
          </Word>{' '}
        </Fragment>
      ))}
    </p>
  );
}

function Stat({ value, decimals = 0, suffix, label, delay }) {
  return (
    <Reveal className="about__stat" delay={delay}>
      <span className="about__stat-num">
        <Counter value={value} decimals={decimals} />
        {suffix && <span className="about__stat-suffix">{suffix}</span>}
      </span>
      <span className="about__stat-label">{label}</span>
    </Reveal>
  );
}

export default function About() {
  return (
    <section id="salon" data-nav="salon" className="about section section--light">
      <div className="container">
        <div className="about__top">
          <Reveal className="about__label">
            <span className="eyebrow">The Salon</span>
          </Reveal>
          <ScrollStatement text={STATEMENT} />
        </div>

        <div className="about__grid">
          <div className="about__media">
            <ParallaxImg
              name="salon-shelves"
              className="about__img about__img--main"
              sizes="(max-width: 900px) 76vw, 34vw"
              speed={8}
            />
            <ParallaxImg
              name="bronde-lob"
              className="about__img about__img--small"
              sizes="(max-width: 900px) 44vw, 24vw"
              speed={14}
              delay={0.3}
            />
          </div>

          <div className="about__copy">
            <SplitText as="h2" className="display title-lg about__title" text="Crafted with care in *Lindfield.*" />
            <Reveal as="p" className="lead" delay={0.1}>
              Our salon is a bright, welcoming space on the Pacific Highway, with warm timber floors, fresh flowers
              and good conversation. It&rsquo;s the kind of place you look forward to coming back to.
            </Reveal>
            <Reveal as="p" className="lead" delay={0.18}>
              Whether it&rsquo;s a hand-painted balayage, a careful colour correction or a first haircut for
              the little ones, Kas tailors every detail to your hair, your lifestyle and the result you&rsquo;ve
              been hoping for.
            </Reveal>

            <div className="about__stats">
              <Stat value={SITE.rating} decimals={1} suffix="★" label="Google rating" delay={0} />
              <Stat value={SITE.reviewCount} label="Google reviews" delay={0.1} />
              <Stat value={OPEN_DAY_COUNT} label="Days a week" delay={0.2} />
            </div>

            <Reveal delay={0.2}>
              <Button href="#visit" variant="dark">
                Plan your visit
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
