import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FAQS, SITE } from '../data/site';
import { EASE_IN_OUT } from '../lib/motion';
import SplitText from './ui/SplitText';
import Reveal from './ui/Reveal';
import { Plus } from './ui/icons';
import './Faq.css';

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="faq section section--light sheet">
      <div className="container faq__grid">
        <div className="faq__aside">
          <Reveal>
            <span className="eyebrow">Good to know</span>
          </Reveal>
          <SplitText as="h2" className="display title-lg faq__title" text="Questions, *answered.*" />
          <Reveal as="p" className="lead" delay={0.1}>
            Can&rsquo;t find what you&rsquo;re looking for? Give the salon a call. We&rsquo;re always happy to
            chat.
          </Reveal>
          <Reveal delay={0.18}>
            <a className="faq__phone" href={SITE.phoneHref}>
              {SITE.phone}
            </a>
          </Reveal>
        </div>

        <ul className="faq__list">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal as="li" key={f.q} className={`faq__item${isOpen ? ' is-open' : ''}`} delay={i * 0.05} y={30}>
                <button
                  type="button"
                  className="faq__q"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                >
                  <span className="faq__no">{String(i + 1).padStart(2, '0')}</span>
                  <span className="faq__q-text">{f.q}</span>
                  <span className="faq__icon">
                    <Plus />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-${i}`}
                      className="faq__a"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.6, ease: EASE_IN_OUT }}
                    >
                      <p>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
