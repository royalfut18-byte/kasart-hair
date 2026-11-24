import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HOURS_BRIEF, NAV_LINKS, SITE } from '../data/site';
import { lockScroll, scrollToTarget } from '../lib/lenis';
import { EASE_IN_OUT, EASE_OUT } from '../lib/motion';
import Monogram from './ui/Monogram';
import { ArrowUpRight, Close, Phone } from './ui/icons';
import './MobileMenu.css';

const SLATS = 6;

export default function MobileMenu({ onClose, active }) {
  useEffect(() => {
    lockScroll(true);
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const go = (e, id) => {
    e.preventDefault();
    onClose();
    setTimeout(() => scrollToTarget(`#${id}`), 750);
  };

  const fade = {
    closed: { opacity: 0, y: 16, transition: { duration: 0.25 } },
    open: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT, delay: 0.75 } },
  };

  return (
    <motion.div
      className="mmenu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      initial="closed"
      animate="open"
      exit="closed"
    >
      <div className="mmenu__slats" aria-hidden="true">
        {Array.from({ length: SLATS }, (_, i) => (
          <motion.span
            key={i}
            className="mmenu__slat"
            style={{ transformOrigin: i % 2 ? '50% 100%' : '50% 0%' }}
            variants={{
              closed: {
                scaleY: 0,
                transition: { duration: 0.6, ease: EASE_IN_OUT, delay: 0.2 + (SLATS - i) * 0.035 },
              },
              open: { scaleY: 1, transition: { duration: 0.75, ease: EASE_IN_OUT, delay: i * 0.05 } },
            }}
          />
        ))}
      </div>

      <div className="mmenu__content" data-lenis-prevent>
        <motion.div className="mmenu__top" variants={fade}>
          <Monogram size={44} />
          <button type="button" className="mmenu__close" onClick={onClose} aria-label="Close menu">
            <Close />
          </button>
        </motion.div>

        <nav className="mmenu__links" aria-label="Menu">
          {NAV_LINKS.map((link, i) => (
            <div key={link.id} className="mmenu__mask">
              <motion.a
                href={`#${link.id}`}
                onClick={(e) => go(e, link.id)}
                className={`mmenu__link${active === link.id ? ' is-active' : ''}`}
                variants={{
                  closed: { y: '115%', transition: { duration: 0.45, ease: EASE_IN_OUT } },
                  open: { y: '0%', transition: { duration: 1, ease: EASE_OUT, delay: 0.38 + i * 0.07 } },
                }}
              >
                <span className="mmenu__no">0{i + 1}</span>
                {link.label}
              </motion.a>
            </div>
          ))}
        </nav>

        <motion.div className="mmenu__foot" variants={fade}>
          <a className="mmenu__call" href={SITE.phoneHref}>
            <Phone />
            {SITE.phone}
          </a>
          <a className="mmenu__addr" href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer">
            {SITE.street}, {SITE.suburb} <ArrowUpRight />
          </a>
          <p className="mmenu__hours">{HOURS_BRIEF}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
