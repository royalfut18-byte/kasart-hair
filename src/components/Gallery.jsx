import { useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { GALLERY, SITE } from '../data/site';
import SplitText from './ui/SplitText';
import Reveal from './ui/Reveal';
import Img from './ui/Img';
import Button from './ui/Button';
import Marquee from './ui/Marquee';
import Lightbox from './Lightbox';
import './Gallery.css';

const pad = (n) => String(n).padStart(2, '0');

function GalleryCard({ item, index, clone, onOpen }) {
  const mediaRef = useRef(null);
  return (
    <button
      type="button"
      className="gcard"
      onClick={() => onOpen(index, mediaRef.current)}
      aria-label={`View ${item.title} larger`}
      tabIndex={clone ? -1 : undefined}
    >
      <span className="gcard__media" ref={mediaRef}>
        <span className="gcard__img">
          <Img name={item.id} sizes="(max-width: 700px) 76vw, 420px" />
        </span>
      </span>
      <span className="gcard__no">{pad(index + 1)}</span>
      <span className="gcard__caption">
        <span className="gcard__name">{item.title}</span>
        <span className="gcard__tag">{item.tag}</span>
      </span>
    </button>
  );
}

/** Client results: a steady, endless row of finished looks (right → left). */
export default function Gallery() {
  const [selected, setSelected] = useState(null);
  const open = (index, el) => setSelected({ index, el });

  return (
    <section id="work" data-nav="work" className="gallery section section--light sheet before-sheet">
      <div className="container gallery__head">
        <div>
          <Reveal>
            <span className="eyebrow">Portfolio</span>
          </Reveal>
          <SplitText as="h2" className="display title-lg gallery__title" text={'Real clients.\n*Real results.*'} />
        </div>
        <div className="gallery__aside">
          <Reveal as="p" className="lead" delay={0.1}>
            A few favourite looks from our chairs, from soft blonde balayage and bright ash foils to glossy
            brunettes and deep burgundy. Tap any look to see it up close.
          </Reveal>
          <Reveal delay={0.2}>
            <Button href={SITE.phoneHref} variant="dark">
              Book your appointment
            </Button>
          </Reveal>
        </div>
      </div>

      <Reveal className="gallery__row" y={60}>
        <Marquee speed={46} paused={!!selected} className="marquee--fade gallery__marquee">
          {(clone) =>
            GALLERY.map((item, i) => (
              <GalleryCard key={item.id} item={item} index={i} clone={clone} onOpen={open} />
            ))
          }
        </Marquee>
      </Reveal>

      <AnimatePresence>
        {selected && (
          <Lightbox
            key="lightbox"
            items={GALLERY}
            start={selected.index}
            originEl={selected.el}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
