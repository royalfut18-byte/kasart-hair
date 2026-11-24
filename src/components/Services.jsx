import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SERVICES, SITE } from '../data/site';
import { EASE_IN_OUT, EASE_OUT } from '../lib/motion';
import SplitText from './ui/SplitText';
import Reveal from './ui/Reveal';
import Img from './ui/Img';
import Button from './ui/Button';
import { Plus } from './ui/icons';
import './Services.css';

// Reveals use plain `transform` strings so the browser runs them on the GPU.
const fadeIn = (delay) => ({
  hidden: { opacity: 0, transform: 'translateY(18px)' },
  show: {
    opacity: 1,
    transform: 'translateY(0px)',
    transitionEnd: { transform: 'none' },
    transition: { duration: 1, ease: EASE_OUT, delay },
  },
});

function ServiceRow({ service: s, isOpen, onToggle }) {
  return (
    <motion.li
      className={`svc__row${isOpen ? ' is-open' : ''}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
    >
      <motion.span
        className="svc__line"
        variants={{
          hidden: { transform: 'scaleX(0)' },
          show: { transform: 'scaleX(1)', transition: { duration: 1.5, ease: EASE_IN_OUT } },
        }}
      />
      <button type="button" className="svc__btn" onClick={onToggle} aria-expanded={isOpen}>
        <motion.span className="svc__no" variants={fadeIn(0.2)}>
          {s.no}
        </motion.span>
        <span className="svc__name-mask">
          <motion.span
            className="svc__name"
            variants={{
              hidden: { transform: 'translateY(115%)' },
              show: {
                transform: 'translateY(0%)',
                transitionEnd: { transform: 'none' },
                transition: { duration: 1.15, ease: EASE_OUT, delay: 0.1 },
              },
            }}
          >
            {s.title}
          </motion.span>
        </span>
        <motion.span className="svc__short" variants={fadeIn(0.28)}>
          {s.short}
        </motion.span>
        <motion.span className="svc__icon" variants={fadeIn(0.34)}>
          <Plus />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="svc__panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.75, ease: EASE_IN_OUT }}
          >
            <div className="svc__panel-inner">
              <div className="svc__panel-img">
                <Img name={s.image} sizes="(max-width: 1000px) 90vw, 360px" alt="" />
              </div>
              <div className="svc__panel-body">
                <p>{s.desc}</p>
                <ul className="svc__tags">
                  {s.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <Button href={SITE.phoneHref} size="sm">
                  Enquire
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export default function Services() {
  const [open, setOpen] = useState(null);

  return (
    <section id="services" data-nav="services" className="svc section section--dark sheet before-sheet">
      <div className="container">
        <div className="svc__head">
          <div>
            <Reveal>
              <span className="eyebrow">What we do</span>
            </Reveal>
            <SplitText as="h2" className="display title-xl svc__title" text="Signature *services*" />
          </div>
          <Reveal as="p" className="lead svc__intro" delay={0.15}>
            From your first consultation to the final blow-dry, every service is tailored to your hair, your
            features and the way you live.
          </Reveal>
        </div>

        <ul className="svc__list">
          {SERVICES.map((s, i) => (
            <ServiceRow
              key={s.no}
              service={s}
              isOpen={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
