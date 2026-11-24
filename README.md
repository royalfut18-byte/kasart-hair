# KasArt Hair website

A one-page, animation-rich website for **KasArt Hair**, 323 Pacific Highway, Lindfield.

Built with React, Vite, [Framer Motion](https://motion.dev) and [Lenis](https://lenis.darkroom.engineering) smooth scrolling. It uses the same layout and animations as the Hair Glorious site, with KasArt's own content, photos and branding. The two sites are separate projects and share no code at run time.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

Every visitor gets the full animations, whatever their device's "reduce motion" setting is.

## Live site and deploys

- **Live:** https://kasart-hair.vercel.app
- **Hosting:** Vercel project `kasart-hair`
- **Code:** GitHub repo `royalfut18-byte/kasart-hair`

Once the GitHub repo is connected to the Vercel project, **every push to `main` deploys automatically**. Other branches get their own preview links.

To build locally instead:

```bash
npm run build
```

This creates a `dist/` folder of plain static files.

**Moving to a custom domain** (e.g. kasarthair.com.au): add it under the project's **Settings → Domains** on Vercel. Then update the `og:url`, `og:image`, `canonical` and JSON-LD URLs in `index.html` so link previews point at the new address.

## Edit the content

All text and business details live in **`src/data/site.js`**: phone, address, hours, services, gallery captions, reviews, FAQs, and social links.

- **Hours:** edit the `HOURS` list (times are minutes after midnight, so 10am is `600` and 7pm is `1140`; remove `open` and `close` from a day to mark it closed). The "Open now / Closed" badge, the hours table, the footer, the hero, the menu, the closing banner and the FAQ answer are all worked out from that one list, in Sydney time. The search-engine copy of the hours in `index.html` (the `openingHoursSpecification` block) is separate, so change it there too.
- **Google rating:** `rating` and `reviewCount` (shown on the Google badge and in the About numbers). Update them as new reviews come in.
- **Instagram and Facebook:** `instagram` is set. Paste the Facebook page URL into `facebook` and a link appears in the footer.
- **Moving rows:** each `<Marquee speed={…}>` takes a speed in pixels per second; add `reverse` to flip direction.

### Where the details came from

| Detail | Source |
| --- | --- |
| Name, address, phone, 4.9 rating, 105 reviews | The salon's Google listing |
| Opening hours | Public directory listings (Fresha, MapQuest). One older listing (Bookwell) shows the weekday close an hour earlier, so **check these against the salon's Google listing** |
| Instagram | [@kasarthair](https://www.instagram.com/kasarthair/) |
| Reviews | Short excerpts from the salon's public Google reviews, shown with first name and last initial |
| Services | The salon's Instagram bio ("Hair / Styling / Balayage specialists"), its photos and its reviews. No prices are listed |

## Photos

The original photos sit in the **`photos`** folder. To add or swap one:

1. Add the photo to the `photos` folder.
2. Add an entry to the list in `scripts/optimize-images.mjs`.
3. Run `npm run images`.

The script makes web-sized WebP files in `public/images/`, plus blurred placeholders. Then use the photo's `name` in `site.js` (or with `<Img name="…" />`).

An entry can carry an `extract` crop (`left`, `top`, `width`, `height`, in pixels of the original). The crops in the script keep each frame on the hair: they trim a client's reflection or profile, a bystander, the lettering on a client's top, and the buttons Instagram draws over its photos. Keep that in mind when adding client photos.

The photos vary a lot in size. The four largest are 940 to 1,360px wide; the phone shots and Instagram posts are only 520 to 770px wide. A photo stretched across a whole screen looks soft, so each one is shown at about its real size or smaller, and the large slots (the intro, the hero arch, the About photo and the closing banner) use the largest photos. Remember that a `ParallaxImg` is drawn slightly larger than its frame (more so at higher `speed`), so give it a matching `sizes`.

For any photo under 900px wide the script also makes a double-size version with a high-quality enlargement, which looks crisper than the browser stretching the small file. The real fix is larger originals: add them like any other photo.

The intro, hero portrait and closing banner use extra-high-quality `-hq` versions of three photos (listed under `HQ` in the same script). To swap an intro photo, add its name there, run `npm run images`, then update `PHOTOS` at the top of `src/components/Intro.jsx`.

## What's where

| Section | File |
| --- | --- |
| Intro: KA monogram draws itself → letterbox bars and a gold light flare → three of the sharpest photos, each shown whole in a tall frame, while giant KASART / HAIR letters fill with gold → the final photo glides into the hero arch as the slatted curtain opens. The photo list and timings are at the top of the file. | `src/components/Intro.jsx` |
| Hero (arch portrait, small arch photo in the headline, hours · Google rating · address along the bottom) | `src/components/Hero.jsx` |
| Speciality ribbons (steady speed, opposite directions) | `src/components/Ribbons.jsx` |
| About (words light up as you scroll) | `src/components/About.jsx` |
| Services (click a service to open its photo and details) | `src/components/Services.jsx` |
| Client results (steady right-to-left row, tap for full-screen view) | `src/components/Gallery.jsx`, `Lightbox.jsx` |
| Sleek-or-curled slider (sweeps by itself until touched). It compares two finishes on two different clients, so it is labelled "Sleek" and "Curled", not before and after. | `src/components/Transformation.jsx` |
| Google reviews (Google rating badge, steady left-to-right row) | `src/components/Reviews.jsx` |
| The steady moving-row engine | `src/components/ui/Marquee.jsx` |
| Closing banner ("Your chair is waiting.": a sharp arch photo beside the booking buttons) | `src/components/CtaBanner.jsx` |
| Experience, FAQ, Visit, Footer | `src/components/*.jsx` |
| The "K \| A" monogram | `src/components/ui/Monogram.jsx`, `public/favicon.svg` |
| Colours, fonts, buttons | `src/styles/global.css` |

## Keeping it smooth

The site uses the normal mouse cursor and flat buttons (solid for the main action, underlined text for the second). A few rules keep scrolling smooth:

- **Animate only `transform` and `opacity`.** Write them as a plain `transform` string (e.g. `transform: 'translateY(30px)'`), not Framer's `x`/`y`/`scale` shortcuts, so the browser runs them on the GPU. `Reveal` and `SplitText` already do this.
- **No endless animations.** A spinning, floating or pulsing element makes the browser redo work on every frame, even while the page sits still.
- **No full-screen overlays** (film grain, glows that follow the mouse): the browser has to redraw them over the whole page on every frame.
- **Lenis runs in Framer Motion's first step** (`src/lib/lenis.js`), so scroll-linked effects always match what's on screen.
