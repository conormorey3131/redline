# Redline Events — Marketing Site

A single-page static marketing site for **Redline Events**, a Killarney-based sports and corporate events company run by Cian Murphy. Pure HTML / CSS / JS — no build step, no frameworks, no npm. Drop the folder onto any static host (GitHub Pages, Blacknight, Netlify, S3) and it works.

---

## File structure

```
/
├── index.html              # entire page lives here
├── css/styles.css          # all styles
├── js/main.js              # mobile menu, lightbox, scroll reveals, form handler
├── assets/
│   ├── brand/
│   │   ├── logo-primary-dark.png      # horizontal lockup (dark backgrounds)
│   │   ├── logo-primary-light.png     # horizontal lockup (light backgrounds)
│   │   ├── logo-secondary-dark.png    # vertical mark (dark backgrounds)
│   │   ├── logo-secondary-light.png   # vertical mark (light backgrounds)
│   │   ├── favicon.ico
│   │   ├── favicon-32.png
│   │   ├── favicon-192.png
│   │   └── favicon-512.png
│   └── images/
│       ├── hero.jpg                   # full-bleed hero (motion-blur sport)
│       └── gallery/image-01..05.jpg   # 5 gallery images
├── CNAME                   # add your custom domain here for GitHub Pages
├── robots.txt
└── sitemap.xml
```

---

## Deploy to GitHub Pages

1. Create a new GitHub repo (e.g. `redline-events`) and push this folder to `main`.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`, **Branch** to `main`, **Folder** to `/ (root)`. Save.
4. Wait ~1 minute. The site will be live at `https://<username>.github.io/<repo>/`.
5. **Custom domain (e.g. `redlineevents.ie`):**
   - Add the domain to the `CNAME` file in this repo (one line, no protocol — just `redlineevents.ie`).
   - At the registrar (Blacknight), add a CNAME record `www → <username>.github.io` and four A records on the apex pointing to GitHub's IPs: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   - Back in **Settings → Pages**, set the custom domain and tick **Enforce HTTPS** once it goes green (allow up to 24 hours for DNS propagation).

## Deploy to Blacknight (cPanel)

1. Open the cPanel **File Manager** for the hosting account.
2. Navigate to `public_html` (or the relevant document root).
3. Upload the entire contents of this folder — `index.html` should sit at the root, not inside a sub-folder.
4. Visit the domain. Done.

---

## Swapping placeholder content

### Hero copy and image
Edit `index.html`, search for `<section class="hero"`. The eyebrow text, `<h1>`, sub-paragraph and the two CTA buttons are all in the next ~20 lines.

To replace the hero image, drop the file at `assets/images/hero.jpg`. Recommended ≥ 2400px wide, motion-blur sports imagery to match the brand deck. The hero gracefully falls back to a brand-coloured radial gradient with the signature 3-bar diagonal accent if the image is missing.

### Contact form endpoint (Formspree — recommended)

The form currently posts to a placeholder `/contact` endpoint. JS intercepts that and shows a fake success message so the form never silently fails. Wire it up before launch:

1. Sign up at <https://formspree.io>, create a new form, copy the endpoint URL (e.g. `https://formspree.io/f/abc123`).
2. In `index.html`, find:
   ```html
   <form class="contact-form reveal" action="/contact" method="POST" novalidate>
   ```
   Replace `action="/contact"` with `action="https://formspree.io/f/abc123"`. That's the only change — submissions will land in your Formspree inbox and forward to the email registered on the account (`cian@redlineevents.ie`).

**Alternative options:**
- **Netlify Forms** — add `netlify` to the `<form>` tag and a hidden honeypot field. Auto-detected on first deploy.
- **Custom endpoint** — point `action` at any endpoint that accepts `application/x-www-form-urlencoded` POSTs. The early-return guard in `js/main.js` only triggers on `/contact`, so any other action submits normally.

### Gallery images

Drop 5 JPEGs in `assets/images/gallery/` named `image-01.jpg` through `image-05.jpg`. Recommended at least 1600×1200px, optimised JPEG (target ≤ 300 KB each). The first image (`image-01.jpg`) spans 2 columns on the top row of the desktop grid for visual variety, so pick a strong horizontal hero shot for that slot.

Until the images exist, each tile renders as a labelled placeholder showing the file path to drop in. Captions and alt text live on the `<button class="gallery-item">` elements in `index.html` — update them so they describe the actual photos.

### Contact details
In `index.html`, search for `<ul class="contact-meta">`. Update the location, email, and phone items. Also update the `email` and `telephone` fields in the JSON-LD block at the top of `<head>` if those change.

### Social handles
In the footer (`<div class="footer-social">`), update the `href` on each `<a>` to the live Instagram / Facebook / TikTok URLs.

---

## Brand reference

Brand identity (Illustrator source files, fonts, exports, photography guidelines):
<https://www.dropbox.com/scl/fo/9ctgs3jkkg4i6c93qsywv/APA4-gnfjxkiSUBJ_FqpaFU?rlkey=pbrt4xrss68gqkr4sdd9bjzvr&st=xu1x1zzi&dl=0>

The logos referenced in this site (PNG with transparent backgrounds and grunge texture) live in `assets/brand/`. SVG fallbacks are also included at the same paths with `.svg` extensions — they auto-load if the PNGs are missing.

---

## Performance / SEO checklist (in place)

- Semantic HTML5, single `<h1>`, accessible labels on every form input
- Skip-to-main-content link, visible `:focus-visible` rings, keyboard-friendly mobile nav and lightbox (Tab focus trap, arrow-key navigation, Esc to close)
- `prefers-reduced-motion` honoured — animations and smooth-scroll disabled when requested
- Lazy-loaded gallery images (`loading="lazy"`)
- Open Graph + Twitter card tags for social sharing
- `LocalBusiness` JSON-LD with Killarney address, email, phone
- `robots.txt` and `sitemap.xml` at the root
- Google Fonts pre-connected and loaded with `display=swap`

---

## Maintenance contact

Site built and maintained by **Conor Morey, Morey Digital** — <conor@moreydigital.ie>
