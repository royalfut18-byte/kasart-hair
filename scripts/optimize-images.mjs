// Turns the salon's original photos (in the "photos" folder) into web-sized
// WebP files, plus a manifest with dimensions and tiny blurred placeholders
// that the <Img> component uses for a soft blur-up.
//
//   npm run images
import sharp from 'sharp';
import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(here, '..', 'photos');
const OUT_DIR = path.resolve(here, '..', 'public', 'images');
const MANIFEST = path.resolve(here, '..', 'src', 'data', 'images.json');
const OG_IMAGE = path.resolve(here, '..', 'public', 'og-image.jpg');

// `extract` crops a photo before it is resized. The crops below keep each
// frame on the hair: they trim a client's reflection or profile, a bystander,
// the lettering on a client's top, and the buttons Instagram draws over its
// photos.
const SOURCES = [
  {
    name: 'balayage-curls',
    file: 'balayage-curls-back.png',
    extract: { left: 43, top: 104, width: 1000, height: 1344 },
    alt: 'Blonde balayage finished in soft, bouncy curls, seen from behind in the salon chair',
  },
  {
    name: 'ombre-sleek',
    file: 'ombre-sleek.png',
    extract: { left: 100, top: 60, width: 730, height: 950 },
    alt: 'Long, glass-smooth hair melting from a soft brown root into bright blonde lengths',
  },
  {
    name: 'balayage-side',
    file: 'balayage-curls-side.png',
    extract: { left: 175, top: 110, width: 800, height: 1200 },
    alt: 'Side view of golden blonde balayage curls beside the styling trolley',
  },
  {
    name: 'burgundy',
    file: 'burgundy.png',
    extract: { left: 20, top: 20, width: 504, height: 640 },
    alt: 'Deep burgundy colour with soft waves, with the salon window and fresh flowers behind',
  },
  {
    name: 'ash-blonde',
    file: 'ash-blonde.jpg',
    alt: 'Long ash blonde hair with fine, bright foils',
  },
  {
    name: 'glossy-brunette',
    file: 'glossy-brunette.png',
    alt: 'Long, sleek, glossy brunette hair seen from behind in the salon',
  },
  {
    name: 'bronde-lob',
    file: 'bronde-lob.jpg',
    alt: 'Shoulder-length bronde cut with soft highlights, blow-dried under at the ends',
  },
  {
    name: 'espresso-waves',
    file: 'espresso-waves.png',
    extract: { left: 62, top: 40, width: 518, height: 660 },
    alt: 'Long espresso brunette layers finished in loose waves',
  },
  {
    name: 'salon-shelves',
    file: 'salon-shelves.png',
    alt: 'Inside KasArt Hair: shelves of professional hair care, fresh flowers and warm timber floors',
  },
  {
    name: 'shopfront',
    file: 'shopfront.jpg',
    alt: 'The KasArt Hair shopfront on the Pacific Highway in Lindfield',
  },
  // The two halves of the "sleek or curled" slider. Both are cropped to the
  // same shape, with the head the same size and in the same place, so the
  // two finishes line up along the handle.
  {
    name: 'finish-sleek',
    file: 'ombre-sleek.png',
    extract: { left: 232, top: 260, width: 547, height: 750 },
    alt: 'A blonde ombré worn sleek and straight',
  },
  {
    name: 'finish-curled',
    file: 'balayage-curls-back.png',
    extract: { left: 182, top: 104, width: 707, height: 968 },
    alt: 'A blonde balayage finished in soft curls',
  },
];

const WIDTHS = [640, 1200];
const ENLARGE_BELOW = 900; // photos narrower than this also get a 2x version

const load = (src) => {
  const img = sharp(path.join(SRC_DIR, src.file)).removeAlpha();
  return src.extract ? img.extract(src.extract) : img;
};

// Start clean, so a renamed or removed photo doesn't leave old files behind.
await mkdir(OUT_DIR, { recursive: true });
for (const f of await readdir(OUT_DIR)) {
  if (f.endsWith('.webp')) await unlink(path.join(OUT_DIR, f));
}

const manifest = {};

for (const src of SOURCES) {
  const { width, height } = src.extract ?? (await sharp(path.join(SRC_DIR, src.file)).metadata());

  const srcs = [];
  for (const target of WIDTHS.map((w) => Math.min(w, width))) {
    if (srcs.some((s) => s.w === target)) continue;
    const file = `${src.name}-${target}.webp`;
    await load(src).resize({ width: target }).webp({ quality: 80, effort: 5 }).toFile(path.join(OUT_DIR, file));
    srcs.push({ w: target, file: `/images/${file}` });
  }

  // Some photos are small (phone shots and Instagram posts, 500 to 800px
  // wide), smaller than they're shown on retina screens and phones. For
  // those, also make a double-size version with a high-quality (Lanczos)
  // enlargement and gentle sharpening: clearly crisper than the browser
  // stretching the small file. Larger original photos would be better.
  if (width < ENLARGE_BELOW) {
    const target = width * 2;
    const file = `${src.name}-${target}.webp`;
    await load(src)
      .resize({ width: target, kernel: 'lanczos3' })
      .sharpen({ sigma: 1 })
      .webp({ quality: 76, effort: 6, smartSubsample: true })
      .toFile(path.join(OUT_DIR, file));
    srcs.push({ w: target, file: `/images/${file}` });
  }

  const tiny = await load(src).resize({ width: 24 }).blur(1.5).webp({ quality: 45 }).toBuffer();
  manifest[src.name] = {
    w: width,
    h: height,
    alt: src.alt,
    srcs,
    placeholder: `data:image/webp;base64,${tiny.toString('base64')}`,
  };
  console.log(`✓ ${src.name} (${srcs.map((s) => s.w).join(', ')})`);
}

// Extra-high-quality, full-resolution versions of the photos shown large: the
// intro, the hero portrait and the closing banner. Value = gentle sharpening
// (0 = none).
const HQ = { 'salon-shelves': 0, 'balayage-side': 0.5, 'balayage-curls': 0.5 };

for (const [name, sigma] of Object.entries(HQ)) {
  const src = SOURCES.find((s) => s.name === name);
  let img = load(src);
  if (sigma) img = img.sharpen({ sigma });
  const file = `${name}-hq.webp`;
  await img.webp({ quality: 90, effort: 6, smartSubsample: true }).toFile(path.join(OUT_DIR, file));
  const base = manifest[name];
  manifest[`${name}-hq`] = { ...base, srcs: [{ w: base.w, file: `/images/${file}` }] };
  console.log(`✓ ${name}-hq`);
}

// Social sharing preview (1200×630): the shopfront, with the sign and door.
await sharp(path.join(SRC_DIR, 'shopfront.jpg'))
  .extract({ left: 0, top: 100, width: 1360, height: 714 })
  .resize(1200, 630, { fit: 'cover' })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(OG_IMAGE);

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nWrote ${Object.keys(manifest).length} images + manifest`);
