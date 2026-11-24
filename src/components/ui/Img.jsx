import { forwardRef } from 'react';
import manifest from '../../data/images.json';

/**
 * Responsive WebP image from the generated manifest, with a blurred
 * placeholder painted underneath until the real image arrives.
 */
const Img = forwardRef(function Img(
  { name, sizes = '100vw', alt, eager = false, className = 'cover-img', style, ...rest },
  ref,
) {
  const m = manifest[name];
  if (!m) return null;
  const largest = m.srcs[m.srcs.length - 1];

  return (
    <img
      ref={ref}
      src={largest.file}
      srcSet={m.srcs.map((s) => `${s.file} ${s.w}w`).join(', ')}
      sizes={sizes}
      width={m.w}
      height={m.h}
      alt={alt ?? m.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable="false"
      className={className}
      style={{ backgroundImage: `url(${m.placeholder})`, ...style }}
      {...rest}
    />
  );
});

export default Img;

// The hero portrait is shown full-screen in the intro before it shrinks into
// the hero arch, so both use these sizes and load the very same file.
export const HERO_SIZES = '100vw';
export const imageMeta = (name) => manifest[name];
