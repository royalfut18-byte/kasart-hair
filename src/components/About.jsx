import { Fragment, useLayoutEffect, useMemo, useRef } from 'react';
import { tokenize } from '../lib/motion';
import { useScrollProgress } from '../lib/scroll';
import SplitText from './ui/SplitText';
import Reveal from './ui/Reveal';
import ParallaxImg from './ui/ParallaxImg';
import Counter from './ui/Counter';
import Button from './ui/Button';
import { OPEN_DAY_COUNT, SITE } from '../data/site';
import './About.css';

const STATEMENT =
  'Every appointment at KasArt Hair begins with *listening.* We’re a Lindfield salon devoted to *seamless balayage,* beautiful colour and *cuts that suit you.* With an expert eye and a warm, unhurried approach, you’ll leave with hair you *truly love.*';

const DIM = 0.14; // how strongly an unlit word shows
const INK = '27, 22, 17'; // --text-dark

/**
 * Words light up one by one as you scroll through the paragraph: each word
 * fades from 14% to full strength over its own slice of the scroll range.
 *
 * At rest (before or after that range) the words are ordinary text, plain
 * words faded by their colour and gold ones by opacity. While the paragraph
 * is lighting up, each word sits on its own GPU layer and fades by opacity
 * instead, which looks the same but needs no repainting. Fading by colour
 * meant a repaint on every frame of scrolling, and each repaint also redrew
 * the tilted ribbons and the hero text above.
 */
function ScrollStatement({ text }) {
  const ref = useRef(null);
  const progress = useScrollProgress(ref, ['start 0.85', 'end 0.55']);
  const words = useMemo(() => tokenize(text).filter((t) => !t.br), [text]);

  useLayoutEffect(() => {
    const p = ref.current;
    const spans = Array.from(p.children);
    const n = spans.length;
    const shown = new Array(n);
    let live = null;

    const apply = (value) => {
      const isLive = value > 0 && value < 1;
      if (isLive !== live) {
        live = isLive;
        p.classList.toggle('is-live', isLive);
        shown.fill(-1); // restyle every word for the new mode
      }
      for (let i = 0; i < n; i++) {
        const v = Math.min(1, Math.max(0, value * n - i));
        if (v === shown[i]) continue;
        shown[i] = v;
        const a = DIM + (1 - DIM) * v;
        const s = spans[i].style;
        if (words[i].em) {
          s.opacity = a;
        } else if (isLive) {
          s.color = `rgb(${INK})`;
          s.opacity = a;
        } else {
          s.color = `rgba(${INK}, ${a})`;
          s.opacity = '';
        }
      }
    };

    apply(progress.get());
    return progress.on('change', apply);
  }, [progress, words]);

  return (
    <p ref={ref} className="about__statement display">
      {words.map((t, i) => (
        <Fragment key={i}>
          <span className={t.em ? 'em-gold' : undefined}>{t.word}</span>{' '}
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
