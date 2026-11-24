// All of the salon's content lives here, so copy, hours and links can be
// updated without touching any components.

export const SITE = {
  name: 'KasArt Hair',
  phone: '(02) 9416 5150',
  phoneHref: 'tel:+61294165150',
  street: '323 Pacific Highway',
  suburb: 'Lindfield',
  region: 'NSW 2070',
  rating: 4.9,
  reviewCount: 105, // number of Google reviews; update as it grows
  mapsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=KasArt+Hair,+323+Pacific+Hwy,+Lindfield+NSW+2070',
  mapEmbed:
    'https://maps.google.com/maps?q=KasArt%20Hair%2C%20323%20Pacific%20Hwy%2C%20Lindfield%20NSW%202070&z=16&output=embed',
  // The salon's own Google listing (opens its reviews).
  reviewsUrl: 'https://www.google.com/maps?cid=55399161272316527',
  instagram: 'https://www.instagram.com/kasarthair/',
  // Paste the salon's Facebook page URL here and the link appears automatically.
  facebook: '',
};

export const NAV_LINKS = [
  { id: 'services', label: 'Services' },
  { id: 'work', label: 'The Work' },
  { id: 'salon', label: 'Salon' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'visit', label: 'Visit' },
];

// Indexed by JavaScript's getDay(): 0 = Sunday. Times are minutes after midnight.
// A day with no `open` / `close` shows as closed.
export const HOURS = [
  { day: 'Sunday', short: 'Sun', open: 600, close: 960 },
  { day: 'Monday', short: 'Mon', open: 600, close: 1140 },
  { day: 'Tuesday', short: 'Tue', open: 600, close: 1140 },
  { day: 'Wednesday', short: 'Wed', open: 600, close: 1140 },
  { day: 'Thursday', short: 'Thu', open: 600, close: 1260 },
  { day: 'Friday', short: 'Fri', open: 600, close: 1140 },
  { day: 'Saturday', short: 'Sat', open: 540, close: 1020 },
];

export const fmtTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}${m ? `:${String(m).padStart(2, '0')}` : ''}${h < 12 ? 'am' : 'pm'}`;
};

/* ---------------------------------------------------------------------
   Everything below is worked out from HOURS, so the hero, menu, footer,
   closing banner and FAQ all change together when the hours do.
   --------------------------------------------------------------------- */

const WEEK = [1, 2, 3, 4, 5, 6, 0]; // Monday first
const OPEN_DAYS = WEEK.filter((d) => HOURS[d].open != null);

/** How many days a week the salon opens (About section). */
export const OPEN_DAY_COUNT = OPEN_DAYS.length;
const NUMBERS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];

/** Turns a list of days into runs: Mon, Tue, Wed, Fri → [[Mon, Tue, Wed], [Fri]]. */
const runs = (days) =>
  days.reduce((out, d) => {
    const last = out[out.length - 1];
    if (last && WEEK.indexOf(d) === WEEK.indexOf(last[last.length - 1]) + 1) last.push(d);
    else out.push([d]);
    return out;
  }, []);

const joinList = (parts) =>
  parts.length < 2 ? parts.join('') : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;

// Days that share the same hours, in the order they first appear in the week.
const GROUPS = WEEK.reduce((out, d) => {
  const h = HOURS[d];
  const key = h.open != null ? `${h.open}-${h.close}` : 'closed';
  const group = out.find((g) => g.key === key);
  if (group) group.days.push(d);
  else out.push({ key, days: [d], open: h.open, close: h.close });
  return out;
}, []);

/** One line per group, e.g. "Mon–Wed, Fri · 10am–7pm" (footer). */
export const HOURS_LINES = GROUPS.map((g) => {
  const days = runs(g.days)
    .map((r) => (r.length > 2 ? `${HOURS[r[0]].short}–${HOURS[r[r.length - 1]].short}` : r.map((d) => HOURS[d].short).join(', ')))
    .join(', ');
  return `${days} · ${g.open != null ? `${fmtTime(g.open)}–${fmtTime(g.close)}` : 'Closed'}`;
});

// The one day that stays open later than the rest, if there is one.
const LATEST = Math.max(...OPEN_DAYS.map((d) => HOURS[d].close));
const LATE_DAYS = OPEN_DAYS.filter((d) => HOURS[d].close === LATEST);
const LATE_NIGHT = LATE_DAYS.length === 1 && OPEN_DAYS.length > 1 ? HOURS[LATE_DAYS[0]] : null;

/** Short label, e.g. "Open 7 days · Late Thursdays" (hero and menu). */
export const HOURS_BRIEF = [
  `Open ${OPEN_DAYS.length} days`,
  LATE_NIGHT && `Late ${LATE_NIGHT.day}s`,
]
  .filter(Boolean)
  .join(' · ');

/** As a phrase, e.g. "seven days a week, with a late night on Thursdays" (closing banner). */
export const HOURS_PHRASE = `${NUMBERS[OPEN_DAYS.length]} days a week${
  LATE_NIGHT ? `, with a late night on ${LATE_NIGHT.day}s` : ''
}`;

/** Spelled out in full, e.g. "Monday to Wednesday and Friday 10am to 7pm, …" (FAQ). */
export const HOURS_FULL = joinList(
  GROUPS.filter((g) => g.open != null).map((g) => {
    const days = joinList(
      runs(g.days).map((r) =>
        r.length > 2 ? `${HOURS[r[0]].day} to ${HOURS[r[r.length - 1]].day}` : joinList(r.map((d) => HOURS[d].day)),
      ),
    );
    return `${days} ${fmtTime(g.open)} to ${fmtTime(g.close)}`;
  }),
);

export const SPECIALTIES = [
  'Balayage',
  'Blonde Foils',
  'Ombré',
  'Colour & Gloss',
  'Colour Correction',
  'Precision Cuts',
  'Kids’ Cuts',
  'Blow-dries',
  'Styling',
];

export const SERVICES = [
  {
    no: '01',
    title: 'Balayage',
    short: 'Our signature: hand-painted and sun-kissed.',
    desc: 'Freehand-painted colour that melts from root to end for soft, lived-in dimension and a seamless grow-out.',
    tags: ['Hand-painted', 'Ombré', 'Lived-in', 'Soft grow-out'],
    image: 'balayage-side',
  },
  {
    no: '02',
    title: 'Blonde & Foils',
    short: 'Bright, lifted and perfectly toned.',
    desc: 'Fine babylights through to a full head of foils, lifted with care and toned to your shade, from warm honey to cool ash.',
    tags: ['Foils', 'Babylights', 'Toning', 'Ash blonde'],
    image: 'ash-blonde',
  },
  {
    no: '03',
    title: 'Colour & Gloss',
    short: 'Rich colour, grey coverage and mirror shine.',
    desc: 'All-over colour, glossing, grey coverage and regrowth touch-ups, from glossy brunettes to deep burgundy reds.',
    tags: ['All-over colour', 'Grey coverage', 'Regrowth', 'Gloss'],
    image: 'burgundy',
  },
  {
    no: '04',
    title: 'Colour Correction',
    short: 'Brassy, patchy or over-processed? We can help.',
    desc: 'Careful, step-by-step correction for colour that has gone brassy, uneven or tired, bringing it back to soft, healthy-looking tone.',
    tags: ['Brass removal', 'Toning', 'Colour repair'],
    image: 'bronde-lob',
  },
  {
    no: '05',
    title: 'Cuts & Restyles',
    short: 'Precision cuts for women and children.',
    desc: 'Cuts shaped to your hair and the way you wear it, from a tidy trim to a complete restyle. Little ones are very welcome.',
    tags: ['Women’s cuts', 'Kids’ cuts', 'Restyles', 'Layers'],
    image: 'espresso-waves',
  },
  {
    no: '06',
    title: 'Blow-dry & Styling',
    short: 'Soft curls, loose waves or a sleek finish.',
    desc: 'Blow-dries and styling for every day or a special occasion, whether you love bouncy curls or glass-smooth lengths.',
    tags: ['Blow-dries', 'Curls & waves', 'Sleek finishes'],
    image: 'glossy-brunette',
  },
];

export const GALLERY = [
  { id: 'balayage-curls', title: 'Blonde Balayage', tag: 'Balayage' },
  { id: 'burgundy', title: 'Deep Burgundy', tag: 'Colour' },
  { id: 'ombre-sleek', title: 'Sleek Ombré', tag: 'Colour & Styling' },
  { id: 'glossy-brunette', title: 'Glossy Brunette', tag: 'Colour & Gloss' },
  { id: 'balayage-side', title: 'Golden Curls', tag: 'Balayage & Styling' },
  { id: 'ash-blonde', title: 'Ash Blonde', tag: 'Foils' },
  { id: 'espresso-waves', title: 'Espresso Waves', tag: 'Cut & Styling' },
  { id: 'bronde-lob', title: 'Soft Bronde', tag: 'Cut & Colour' },
];

// Excerpts from the salon's public Google reviews.
export const REVIEWS = [
  {
    name: 'Tania M.',
    text: 'Best hairdresser with the best customer service in Sydney.',
  },
  {
    name: 'Samira G.',
    text: 'He always goes above and beyond to make you feel so special from the moment you book through to the moment he works his wonders on your locks! My hair was so damaged and the color was so brassy before visiting Kas and he fixed it easily for me.',
  },
  {
    name: 'Rhordan',
    text: 'Great place, fantastic service and lovely owner',
  },
  {
    name: 'Andrew J.',
    text: 'Kas was just excellent with my 5 year old son. Great haircut.',
  },
  {
    name: 'Rachel G.',
    text: 'The pricing of a haircut and styling was also very good.',
  },
  {
    name: 'Oscar M.',
    text: 'Kas has been doing my wife’s hair for over 10 years.',
  },
  {
    name: 'Dee G.',
    text: 'Kas helped my little girl get out a hairbrush that was seriously tangled in her hair.',
  },
];

export const RITUALS = [
  {
    title: 'Consultation first',
    text: 'We start by listening: your hair history, your routine and the look you’re picturing, so the plan is built around you.',
  },
  {
    title: 'Honest advice',
    text: 'A straight answer on what will suit your hair, what it will take to get there and how to keep it looking good between visits.',
  },
  {
    title: 'Patience with everyone',
    text: 'Little ones, nervous first-timers and everyone in between. It’s the gentle, unhurried care our clients mention most.',
  },
  {
    title: 'A bright, welcoming space',
    text: 'Fresh flowers, warm timber floors and a friendly hello. Settle in, switch off and let us look after you.',
  },
];

export const STEPS = [
  { no: '01', title: 'Consult', text: 'We talk tone, upkeep and how you like to wear your hair.' },
  { no: '02', title: 'Colour', text: 'Hand-painted or foiled, placed for a soft, seamless blend.' },
  { no: '03', title: 'Tone & gloss', text: 'A custom toner for the right shade and plenty of shine.' },
  { no: '04', title: 'Finish', text: 'Cut, blow-dry and styling: smooth and sleek, or soft curls.' },
];

export const FAQS = [
  {
    q: 'How do I book an appointment?',
    a: `Bookings are by phone. Give us a call on ${SITE.phone} during opening hours and we’ll find a time that suits you.`,
  },
  {
    q: 'When are you open?',
    a: `We’re open ${HOURS_PHRASE}: ${HOURS_FULL}.`,
  },
  {
    q: 'What do you specialise in?',
    a: 'Balayage is our signature, alongside foils and blonding, rich brunette and red colour, colour correction, cuts for women and children, and blow-dry styling.',
  },
  {
    q: 'Can you fix a colour from somewhere else?',
    a: 'Yes. Brassy tones, uneven colour and tired, over-processed hair are things we see often. Come in for a chat so we can look at your hair and plan the best path to the result you want.',
  },
  {
    q: 'Do you cut children’s hair?',
    a: 'Yes, children are very welcome. Parents often tell us how patient and gentle we are with little ones, including those who find haircuts a bit daunting.',
  },
  {
    q: 'Where are you located?',
    a: `You’ll find us at ${SITE.street}, ${SITE.suburb} ${SITE.region}, on the Pacific Highway shopping strip, a short walk from Lindfield station.`,
  },
];
