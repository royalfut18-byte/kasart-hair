import { SPECIALTIES } from '../data/site';
import Marquee from './ui/Marquee';
import { Sparkle } from './ui/icons';
import './Ribbons.css';

const items = () =>
  SPECIALTIES.map((s) => (
    <span className="ribbon__item" key={s}>
      {s}
      <Sparkle className="ribbon__star" />
    </span>
  ));

/** Two crossing ribbons of specialities gliding in opposite directions at a steady speed. */
export default function Ribbons() {
  return (
    <section className="ribbons" aria-label="Our specialities">
      <div className="ribbon ribbon--dark">
        <Marquee speed={40} reverse pauseOnHover={false} className="ribbon__marquee">
          {items}
        </Marquee>
      </div>
      <div className="ribbon ribbon--gold">
        <Marquee speed={55} pauseOnHover={false} className="ribbon__marquee">
          {items}
        </Marquee>
      </div>
    </section>
  );
}
