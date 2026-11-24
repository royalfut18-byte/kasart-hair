import { motion } from 'framer-motion';
import { REVIEWS, SITE } from '../data/site';
import { EASE_IN_OUT } from '../lib/motion';
import SplitText from './ui/SplitText';
import Reveal from './ui/Reveal';
import Counter from './ui/Counter';
import Marquee from './ui/Marquee';
import GoogleG from './ui/GoogleG';
import { ArrowUpRight, Star } from './ui/icons';
import './Reviews.css';

const initials = (name) =>
  name
    .replace(/\./g, '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/** The salon's average, with the gold layer filled to the exact rating. */
function Stars({ fill }) {
  return (
    <motion.span
      className="rv__stars"
      aria-label={`${SITE.rating} out of 5 stars`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.8 }}
    >
      <span className="rv__stars-base" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} />
        ))}
      </span>
      <motion.span
        className="rv__stars-fill"
        aria-hidden="true"
        variants={{
          hidden: { clipPath: 'inset(0% 100% 0% 0%)' },
          show: {
            clipPath: `inset(0% ${100 - fill}% 0% 0%)`,
            transition: { duration: 2, ease: EASE_IN_OUT, delay: 0.3 },
          },
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} />
        ))}
      </motion.span>
    </motion.span>
  );
}

function ReviewCard({ review }) {
  return (
    <figure className="rcard">
      <figcaption className="rcard__top">
        <span className="rcard__avatar" aria-hidden="true">
          {initials(review.name)}
        </span>
        <span className="rcard__who">
          <span className="rcard__name">{review.name}</span>
          <span className="rcard__src">Google review</span>
        </span>
        <GoogleG size={22} className="rcard__g" />
      </figcaption>
      <blockquote className="rcard__quote">
        <p>&ldquo;{review.text}&rdquo;</p>
      </blockquote>
    </figure>
  );
}

/** Real Google reviews gliding left → right, with the salon's Google rating. */
export default function Reviews() {
  return (
    <section id="reviews" data-nav="reviews" className="rv section section--dark sheet before-sheet">
      <div className="container rv__head">
        <div>
          <Reveal>
            <span className="eyebrow">Client love</span>
          </Reveal>
          <SplitText as="h2" className="display title-xl rv__title" text="Kind *words.*" />
        </div>

        <Reveal delay={0.15}>
          <a
            className="rv__badge"
            href={SITE.reviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Rated ${SITE.rating} out of 5 from ${SITE.reviewCount} Google reviews. Read them on Google.`}
          >
            <span className="rv__badge-g">
              <GoogleG size={30} />
            </span>
            <span className="rv__badge-body">
              <span className="rv__badge-label">Google Reviews</span>
              <span className="rv__badge-row">
                <span className="rv__badge-score">
                  <Counter value={SITE.rating} decimals={1} />
                </span>
                <Stars fill={(SITE.rating / 5) * 100} />
              </span>
              <span className="rv__badge-count">Based on {SITE.reviewCount} reviews</span>
            </span>
            <ArrowUpRight className="rv__badge-arrow" />
          </a>
        </Reveal>
      </div>

      <Reveal className="rv__row" y={60}>
        <Marquee speed={38} reverse className="marquee--fade rv__marquee">
          {() => REVIEWS.map((r) => <ReviewCard key={r.name} review={r} />)}
        </Marquee>
      </Reveal>
    </section>
  );
}
