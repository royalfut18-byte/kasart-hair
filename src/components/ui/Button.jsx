import { scrollToTarget } from '../../lib/lenis';

/**
 * A flat button: a solid block for the main action (`gold`, or `dark` on
 * light sections), or an underlined text link (`link`) for a secondary one.
 * In-page "#anchors" scroll smoothly via Lenis.
 */
export default function Button({ href, children, variant = 'gold', size, onClick, className = '', ...rest }) {
  const external = href && /^https?:/.test(href);

  const handleClick = (e) => {
    if (href && href.startsWith('#')) {
      e.preventDefault();
      scrollToTarget(href);
    }
    onClick?.(e);
  };

  const classes = ['btn', `btn--${variant}`, size ? `btn--${size}` : '', className].filter(Boolean).join(' ');

  return (
    <a
      href={href}
      className={classes}
      onClick={handleClick}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
