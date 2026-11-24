import { useState } from 'react';
import { HOURS, SITE, fmtTime } from '../data/site';
import { useMedia, useOpenStatus } from '../lib/hooks';
import SplitText from './ui/SplitText';
import Reveal from './ui/Reveal';
import Monogram from './ui/Monogram';
import { ArrowUpRight, Clock, Phone, Pin } from './ui/icons';
import './Visit.css';

const WEEK = [1, 2, 3, 4, 5, 6, 0]; // Monday first

export default function Visit() {
  const status = useOpenStatus();
  // On touch screens the map would swallow scroll gestures until tapped.
  const touch = useMedia('(hover: none), (pointer: coarse)');
  const [mapLive, setMapLive] = useState(false);

  return (
    <section id="visit" data-nav="visit" className="visit section section--dark sheet">
      <div className="container">
        <div className="visit__head">
          <div>
            <Reveal>
              <span className="eyebrow">Visit us</span>
            </Reveal>
            <SplitText as="h2" className="display title-xl visit__title" text="Find the *salon.*" />
          </div>
          <Reveal className={`visit__status${status.open ? ' is-open' : ''}`} delay={0.2}>
            <span className={`status-dot${status.open ? '' : ' status-dot--closed'}`} />
            {status.label}
          </Reveal>
        </div>

        <div className="visit__grid">
          <div className="visit__info">
            <Reveal className="visit__card">
              <span className="visit__label">
                <Pin /> Address
              </span>
              <p className="visit__big">
                {SITE.street}
                <br />
                {SITE.suburb} {SITE.region}
              </p>
              <a className="link-line" href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer">
                Get directions <ArrowUpRight />
              </a>
            </Reveal>

            <Reveal className="visit__card" delay={0.08}>
              <span className="visit__label">
                <Phone /> Bookings
              </span>
              <a className="visit__big visit__phone" href={SITE.phoneHref}>
                {SITE.phone}
              </a>
              <p className="visit__note">Call during opening hours to book or ask us anything.</p>
            </Reveal>

            <Reveal className="visit__card" delay={0.16}>
              <span className="visit__label">
                <Clock /> Opening hours
              </span>
              <ul className="visit__hours">
                {WEEK.map((d) => {
                  const h = HOURS[d];
                  const today = d === status.day;
                  return (
                    <li key={h.day} className={`${today ? 'is-today' : ''}${h.open == null ? ' is-closed' : ''}`}>
                      <span>
                        {h.day}
                        {today && <em> · today</em>}
                      </span>
                      <span>{h.open != null ? `${fmtTime(h.open)}–${fmtTime(h.close)}` : 'Closed'}</span>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>

          <Reveal className="visit__map" y={70}>
            <iframe
              title={`Map showing ${SITE.name} at ${SITE.street}, ${SITE.suburb}`}
              src={SITE.mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            {touch && !mapLive && (
              <button type="button" className="visit__map-cover" onClick={() => setMapLive(true)}>
                <span>Tap to explore the map</span>
              </button>
            )}
            <a className="visit__map-badge" href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer">
              <Monogram size={44} />
              <span>
                <strong>{SITE.name}</strong>
                <span>Open in Google Maps</span>
              </span>
              <ArrowUpRight />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
