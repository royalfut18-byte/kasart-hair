const stroke = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
};

export const ArrowUpRight = (p) => (
  <svg {...stroke} {...p}>
    <path d="M7 17 17 7M8.5 7H17v8.5" />
  </svg>
);

export const ArrowRight = (p) => (
  <svg {...stroke} {...p}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </svg>
);

export const ArrowLeft = (p) => (
  <svg {...stroke} {...p}>
    <path d="M19.5 12h-15M10.5 6l-6 6 6 6" />
  </svg>
);

export const ArrowUp = (p) => (
  <svg {...stroke} {...p}>
    <path d="M12 19.5v-15M6 10.5l6-6 6 6" />
  </svg>
);

export const Phone = (p) => (
  <svg {...stroke} {...p}>
    <path d="M6.6 3.8h3l1.6 4.3-2.1 1.3a11.5 11.5 0 0 0 5.5 5.5l1.3-2.1 4.3 1.6v3a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.6 6a2 2 0 0 1 2-2.2Z" />
  </svg>
);

export const Pin = (p) => (
  <svg {...stroke} {...p}>
    <path d="M12 21s-6.8-6-6.8-11.2a6.8 6.8 0 0 1 13.6 0C18.8 15 12 21 12 21Z" />
    <circle cx="12" cy="9.8" r="2.4" />
  </svg>
);

export const Clock = (p) => (
  <svg {...stroke} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const Plus = (p) => (
  <svg {...stroke} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const Close = (p) => (
  <svg {...stroke} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ChevronLeft = (p) => (
  <svg {...stroke} {...p}>
    <path d="M14.5 6 8.5 12l6 6" />
  </svg>
);

export const ChevronRight = (p) => (
  <svg {...stroke} {...p}>
    <path d="m9.5 6 6 6-6 6" />
  </svg>
);

export const Star = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...p}>
    <path
      fill="currentColor"
      d="m12 2.6 2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 17.3l-5.8 3.1 1.2-6.5-4.8-4.5 6.5-.8L12 2.6Z"
    />
  </svg>
);

export const Sparkle = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...p}>
    <path fill="currentColor" d="M12 1.5c.6 5.6 4.9 9.9 10.5 10.5-5.6.6-9.9 4.9-10.5 10.5C11.4 16.9 7.1 12.6 1.5 12 7.1 11.4 11.4 7.1 12 1.5Z" />
  </svg>
);
