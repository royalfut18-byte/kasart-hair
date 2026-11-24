import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HOURS_LINES, NAV_LINKS, SITE } from '../data/site';
import { scrollToTarget } from '../lib/lenis';
import { EASE_OUT } from '../lib/motion';
import SplitText from './ui/SplitText';
import Button from './ui/Button';
import Monogram from './ui/Monogram';
import { ArrowUp } from './ui/icons';
import './Footer.css';

const WORD = 'KASART HAIR';

export default function Footer() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const wordY = useTransform(scrollYProgress, [0, 1], ['-40%', '0%']);

  const go = (e, id) => {
    e.preventDefault();
    scrollToTarget(`#${id}`);
  };

  return (
    <footer ref={ref} className="footer" data-nav="visit">
      <div className="container">
        <div className="footer__top">
          <SplitText as="h2" className="display footer__cta" text={'Your best hair\n*starts here.*'} />
          <Button href={SITE.phoneHref}>Book now</Button>
        </div>

        <div className="footer__cols">
          <div className="footer__brand">
            <Monogram size={64} />
            <p>Hair · Styling · Balayage</p>
          </div>
          <div>
            <h3 className="footer__h">Visit</h3>
            <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="footer__link">
              {SITE.street}
              <br />
              {SITE.suburb} {SITE.region}
            </a>
          </div>
          <div>
            <h3 className="footer__h">Hours</h3>
            <ul className="footer__nav">
              {HOURS_LINES.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="footer__h">Contact</h3>
            <ul className="footer__nav">
              <li>
                <a href={SITE.phoneHref} className="footer__link">
                  {SITE.phone}
                </a>
              </li>
              {SITE.instagram && (
                <li>
                  <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="footer__link">
                    Instagram
                  </a>
                </li>
              )}
              {SITE.facebook && (
                <li>
                  <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" className="footer__link">
                    Facebook
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="footer__h">Explore</h3>
            <ul className="footer__nav">
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} onClick={(e) => go(e, l.id)} className="footer__link">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <motion.div
        className="footer__word"
        style={{ y: wordY }}
        aria-hidden="true"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045 } } }}
      >
        {WORD.split('').map((ch, i) => (
          <span className="footer__char-mask" key={i}>
            <motion.span
              className="footer__char"
              variants={{
                hidden: { transform: 'translateY(105%)' },
                show: {
                  transform: 'translateY(0%)',
                  transitionEnd: { transform: 'none' },
                  transition: { duration: 1.3, ease: EASE_OUT },
                },
              }}
            >
              {ch === ' ' ? ' ' : ch}
            </motion.span>
          </span>
        ))}
      </motion.div>

      <div className="container footer__bottom">
        <span>
          © {new Date().getFullYear()} {SITE.name} · {SITE.suburb}, Sydney
        </span>
        <button type="button" className="footer__totop" onClick={() => scrollToTarget('#top')}>
          Back to top <ArrowUp />
        </button>
      </div>
    </footer>
  );
}
