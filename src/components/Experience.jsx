import { RITUALS } from '../data/site';
import SplitText from './ui/SplitText';
import Reveal from './ui/Reveal';
import ParallaxImg from './ui/ParallaxImg';
import './Experience.css';

export default function Experience() {
  return (
    <section className="xp section section--light sheet before-sheet" data-nav="salon">
      <div className="container xp__grid">
        <div className="xp__aside">
          <div className="xp__sticky">
            <Reveal>
              <span className="eyebrow">The experience</span>
            </Reveal>
            <SplitText as="h2" className="display title-lg xp__title" text={'Come in as a client.\n*Leave as a regular.*'} />
            <Reveal as="p" className="lead" delay={0.1}>
              The details are what our clients remember: being truly listened to, honest advice, a gentle
              hand with the little ones, and walking out with hair they love.
            </Reveal>
          </div>
        </div>

        <div className="xp__main">
          {/* Kept close to the photo's real size (it's 1,360px wide), with only
              a gentle drift, so it stays sharp on retina screens and phones. */}
          <ParallaxImg name="shopfront" className="xp__img" sizes="(max-width: 900px) 100vw, 570px" speed={4} />
          <ol className="xp__list">
            {RITUALS.map((r, i) => (
              <Reveal as="li" key={r.title} className="xp__item" delay={(i % 2) * 0.1} y={30} amount={0.5}>
                <span className="xp__no">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="xp__item-title">{r.title}</h3>
                <p className="xp__item-text">{r.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
