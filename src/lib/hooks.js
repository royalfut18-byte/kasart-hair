import { createContext, useContext, useEffect, useState } from 'react';
import manifest from '../data/images.json';
import { HOURS, fmtTime } from '../data/site';

/* ---------- intro state shared with the rest of the page ---------- */

// 'playing' → 'revealing' (curtain lifting, hero animates in) → 'done'
export const IntroContext = createContext('done');
export const useIntroPhase = () => useContext(IntroContext);
export const useIntroReady = () => useContext(IntroContext) !== 'playing';

/* ---------- media queries ---------- */

export function useMedia(query) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export const useFinePointer = () => useMedia('(hover: hover) and (pointer: fine)');

/* ---------- image preloading for the intro ---------- */

export function preloadImages(list) {
  return Promise.all(
    list.map(
      ({ name, sizes }) =>
        new Promise((resolve) => {
          const m = manifest[name];
          if (!m) return resolve();
          const img = new Image();
          // decode up front so the first frame each photo appears in is smooth
          img.onload = () => (img.decode ? img.decode().catch(() => {}).then(resolve) : resolve());
          img.onerror = resolve;
          img.sizes = sizes;
          img.srcset = m.srcs.map((s) => `${s.file} ${s.w}w`).join(', ');
          img.src = m.srcs[m.srcs.length - 1].file;
        }),
    ),
  );
}

/* ---------- live opening hours (always in Sydney time) ---------- */

function sydneyNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Australia/Sydney',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  const mins = (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10);
  return { day, mins };
}

function computeStatus() {
  const { day, mins } = sydneyNow();
  const today = HOURS[day];
  if (today?.open != null && mins >= today.open && mins < today.close) {
    return { open: true, day, label: `Open now · until ${fmtTime(today.close)}` };
  }
  for (let k = 0; k < 7; k += 1) {
    const d = (day + k) % 7;
    const h = HOURS[d];
    if (h.open == null || (k === 0 && mins >= h.open)) continue;
    const when = k === 0 ? 'today' : k === 1 ? 'tomorrow' : h.day;
    return { open: false, day, label: `Closed · opens ${when} ${fmtTime(h.open)}` };
  }
  return { open: false, day, label: 'Closed' };
}

export function useOpenStatus() {
  const [status, setStatus] = useState(computeStatus);
  useEffect(() => {
    const id = setInterval(() => setStatus(computeStatus()), 60_000);
    return () => clearInterval(id);
  }, []);
  return status;
}
