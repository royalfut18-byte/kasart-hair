import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { NAV_LINKS, SITE } from '../data/site';
import { useIntroReady } from '../lib/hooks';
import { scrollToTarget } from '../lib/lenis';
import { EASE_OUT } from '../lib/motion';
import Monogram from './ui/Monogram';
import Button from './ui/Button';
import { Phone } from './ui/icons';
import MobileMenu from './MobileMenu';
import './Navbar.css';

export default function Navbar() {
  const ready = useIntroReady();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const closeMenu = useCallback(() => setOpen(false), []);
  const flags = useRef({ scrolled: false, hidden: false });

  // Gains a solid background once scrolling; hides while scrolling down.
  // State only changes when a flag actually flips, so scrolling doesn't
  // re-render the navbar every frame.
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    const nextScrolled = y > 60;
    if (nextScrolled !== flags.current.scrolled) {
      flags.current.scrolled = nextScrolled;
      setScrolled(nextScrolled);
    }
    if (Math.abs(y - prev) < 3) return;
    const nextHidden = y > prev && y > 560;
    if (nextHidden !== flags.current.hidden) {
      flags.current.hidden = nextHidden;
      setHidden(nextHidden);
    }
  });

  // Highlight whichever section is crossing the middle of the screen.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-nav]'));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.getAttribute('data-nav'));
        });
      },
      { rootMargin: '-48% 0px -48% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (e, id) => {
    e.preventDefault();
    scrollToTarget(`#${id}`);
  };

  return (
    <>
      <motion.header
        className={`nav${scrolled ? ' nav--scrolled' : ''}`}
        initial={{ y: '-140%' }}
        animate={{ y: ready && !hidden ? '0%' : '-140%' }}
        transition={{ duration: 0.9, ease: EASE_OUT, delay: ready && !scrolled ? 1.15 : 0 }}
      >
        <div className="nav__inner">
          <a href="#top" className="nav__brand" onClick={(e) => go(e, 'top')} aria-label="KasArt Hair, back to top">
            <Monogram size={42} />
            <span className="nav__wordmark">KasArt Hair</span>
          </a>

          <nav className="nav__links" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => go(e, link.id)}
                className={`nav__link${active === link.id ? ' is-active' : ''}`}
                aria-current={active === link.id ? 'true' : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="nav__actions">
            <a className="nav__phone" href={SITE.phoneHref}>
              <Phone />
              {SITE.phone}
            </a>
            <Button href={SITE.phoneHref} size="sm" className="nav__cta">
              Book now
            </Button>
            <button
              type="button"
              className="nav__burger"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>{open && <MobileMenu onClose={closeMenu} active={active} />}</AnimatePresence>
    </>
  );
}
