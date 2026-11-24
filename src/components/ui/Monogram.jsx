import { useId } from 'react';

/** The salon's "K | A" mark (Kas · Art), drawn as crisp SVG in brushed gold. */
export default function Monogram({ size = 44, ring = true, className = '', title }) {
  const id = `mono${useId().replace(/:/g, '')}`;
  return (
    <svg
      className={`mono ${className}`}
      width={size}
      height={size}
      viewBox="0 0 160 160"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        {/* userSpaceOnUse: a bounding-box gradient would make the straight divider invisible */}
        <linearGradient id={id} x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f6e3b4" />
          <stop offset="0.5" stopColor="#c9a35c" />
          <stop offset="1" stopColor="#9a7434" />
        </linearGradient>
      </defs>
      {ring && <circle cx="80" cy="80" r="75" fill="none" stroke={`url(#${id})`} strokeWidth="3" />}
      <text
        x="55"
        y="98"
        textAnchor="middle"
        fill={`url(#${id})`}
        style={{ fontFamily: 'var(--font-brand)', fontSize: 50, fontWeight: 500 }}
      >
        K
      </text>
      <line x1="80" y1="50" x2="80" y2="110" stroke={`url(#${id})`} strokeWidth="2.5" />
      <text
        x="105"
        y="98"
        textAnchor="middle"
        fill={`url(#${id})`}
        style={{ fontFamily: 'var(--font-brand)', fontSize: 50, fontWeight: 500 }}
      >
        A
      </text>
    </svg>
  );
}
