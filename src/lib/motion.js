// Shared easing curves so every animation on the site feels like one family.
export const EASE_OUT = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT = [0.76, 0, 0.24, 1];
export const EASE_SOFT = [0.22, 1, 0.36, 1];

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const wrap = (min, max, v) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/**
 * Splits copy into word tokens. `*words*` become gold italic emphasis and
 * `\n` forces a line break.
 */
export function tokenize(text) {
  const tokens = [];
  text
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .forEach((part) => {
      const em = part.startsWith('*') && part.endsWith('*');
      const clean = em ? part.slice(1, -1) : part;
      clean.split(/(\n)/).forEach((chunk) => {
        if (chunk === '\n') {
          tokens.push({ br: true });
          return;
        }
        chunk
          .split(/\s+/)
          .filter(Boolean)
          .forEach((word) => tokens.push({ word, em }));
      });
    });
  return tokens;
}

export const plainText = (text) => text.replace(/\*/g, '').replace(/\n/g, ' ');
