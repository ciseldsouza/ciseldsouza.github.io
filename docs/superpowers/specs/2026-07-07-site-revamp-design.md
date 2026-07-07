# ciseldsouza.com Revamp — Design Spec

**Date:** 2026-07-07
**Status:** Approved by Joel
**Goal:** Replace the hand-written "coming soon" HTML site with a slick, modern, editorial Astro site — rhode/Hailey Bieber-inspired softness on a dark base — while staying pure SSG on GitHub Pages with the existing GoDaddy-connected domain (ciseldsouza.com).

## Decisions made during brainstorm

| Question | Decision |
|---|---|
| Scope | Full editorial site: Home, About, Journal, Contact |
| Visual direction | "Dark rhode": warm-minimal editorial style on a dark base |
| Palette temperature | Warm charcoal (espresso black + bone), not true black |
| Homepage layout | Editorial Index (left-aligned oversized hero, numbered journal index) |
| Typography | Poppins (structure) × Instrument Serif (italic accents), Inter for prose |
| Imagery | Typography-first; design never looks unfinished without photos |
| Launch state | Still pre-launch — email capture stays a hero moment |
| Instagram | Pull real images from @ciseldsouza, commit as static assets |
| Stack | Astro 5 + Tailwind 4 + pnpm, trimmed (no Preact/Alpine islands) |

## 1. Pages & structure

### `/` Home
Top to bottom:
1. **Nav** — `cisel dsouza` (serif wordmark) left; `about · journal · contact` right. Small, letterspaced, lowercase.
2. **Hero** — oversized left-aligned headline: "brand, marketing & *ecommerce*" (Poppins semibold; "ecommerce" in Instrument Serif italic). Below: tagline ("strategy & optimization for brands that want to matter.") and an `est. 2026 — worldwide`-style label on one row.
3. **Pre-launch capture** — directly under hero, slim inline row (not a boxed form): label "be the first to know when I launch", single input with animated underline, arrow submit. Posts to the existing Google Forms endpoint (`entry.1485403170`). Success swaps to a quiet confirmation line; invalid input gets a subtle shake/underline highlight. No spam note stays.
4. **Selected thinking** — numbered journal index: italic serif number, serif title, uppercase tag + read time meta. Rows are full-width links with hover shift. Shows the latest 3 posts; "all posts →" link.
5. **Split block** — left: **services** (brand strategy / marketing / ecommerce / growth); right: **from Instagram** teaser strip (see §4).
6. **Footer** — © line left; instagram / linkedin / email right. Hairline top border.

### `/about`
Manifesto page: one large italic-serif statement, two short bio paragraphs, disciplines list. Copy drafted in Cisel's voice as editable markdown/Astro content.

### `/journal`
Full numbered index of all posts, same row style as home. Tags shown; no filtering UI needed at 3 posts (design leaves room for it).

### `/journal/<slug>`
Reading layout: serif display title, tag + date + read time meta, ~65ch measure, generous leading, styled markdown (pull quotes, lists), prev/next post links at the bottom. The 3 existing HTML posts (`brand-strategy-is-not-a-logo`, `the-one-marketing-metric-that-matters`, `why-most-brands-lose-on-ecommerce`) migrate to markdown, served at new `/journal/<slug>/` paths. Legacy paths (`/blog.html`, `/blog/<slug>.html`) get static meta-refresh redirect pages to their new equivalents (hand-written stubs in `public/`, since Astro's `redirects` config turns `.html`-suffixed routes into directories).

### `/contact`
Big "say hello" statement; email (mailto), LinkedIn, Instagram links in the index-row style.

### `404`
Styled, on-brand, links home.

## 2. Visual system

- **Palette:** background `#191714` (warm charcoal), text `#EFEAE2` (bone), muted `#9c9488`, faint `#8a8377`, hairlines `#2b2822`, interactive accent `#C9BFAF` (champagne) used sparingly. No pure black/white, no gold fills. (Muted/faint lightened from the original draft values during implementation to meet WCAG AA 4.5:1 contrast on charcoal.)
- **Type:** Poppins 300/500/600 (display + UI), Instrument Serif regular + italic (accent words, journal titles, numbers), Inter 300/400/500 (prose + meta). Self-hosted via Fontsource packages — zero external font requests.
- **Type scale:** hero `clamp(3rem, 8vw, 6.5rem)`; journal titles ~1.5–2rem serif; meta 0.65–0.75rem uppercase letterspaced.
- **Motion:** fade-up on scroll via IntersectionObserver + CSS classes; slow marquee text band (CSS animation); hover: index rows shift right slightly, underlines animate in. Everything gated behind `prefers-reduced-motion: no-preference`.

## 3. Tech & deployment

- **Stack:** Astro 5, Tailwind 4 via `@tailwindcss/vite`, pnpm, `@astrojs/sitemap`, `@astrojs/rss`. No UI framework integrations. Vanilla `<script>` for form + strip + observer (a few dozen lines total).
- **Layout components:** `Layout.astro` (head/meta/OG/fonts), `Nav.astro`, `Footer.astro`, `JournalRow.astro`, `Capture.astro` (email form), `Marquee.astro`.
- **Content:** `src/content/journal/*.md`, schema: `title`, `description`, `date`, `tag` (enum: brand strategy | marketing | ecommerce | growth), optional `draft`. Read time computed from word count at build.
- **SEO:** per-page titles/descriptions, OG tags, sitemap, RSS feed at `/rss.xml`, canonical URLs on `https://ciseldsouza.com`.
- **Repo layout:** Astro project at repo root (`src/`, `public/`, `astro.config.mjs`, `package.json`). Old `index.html`, `blog.html`, `blog/`, `post.css` deleted after content migration.
- **Deploy (revised 2026-07-08, supersedes GitHub Pages plan):** Netlify, connected to the GitHub repo (`netlify.toml`: `pnpm build` → `dist`). Legacy `/blog*.html` URLs are 301-redirected via `netlify.toml` (replaces the meta-refresh stubs). The email capture is a **Netlify Form** (`launch-notify`, honeypot spam filter, real success/failure responses) instead of Google Forms. Cutover: test on the `*.netlify.app` URL → point GoDaddy DNS (apex A → Netlify, `www` CNAME → site.netlify.app) → merge to `main`, set Netlify production branch to `main`, disable GitHub Pages. The old site keeps serving from GitHub Pages until the DNS flip.

## 4. Instagram strip

- `scripts/fetch-instagram.mjs` (run locally, never in CI) attempts to download recent post images from instagram.com/ciseldsouza into `src/assets/instagram/`.
- Images are committed to the repo; the home strip renders whatever the folder contains (Astro `import.meta.glob`), optimized through Astro's image pipeline, linking to the profile.
- If scraping is blocked: folder is manually fillable; **the section renders nothing when the folder is empty** — no placeholder tiles ever.

## 5. Error handling

- Email capture: client-side validation (non-empty, contains `@`); Google Forms posted with `no-cors` (fire-and-forget, same as today) — success state shown optimistically; JS-disabled fallback: form still renders, submit opens the Google Form URL.
- Empty content states: Instagram section hides when empty; journal index handles zero posts (won't occur at launch).
- 404 page covers dead links including legacy `blog/*.html` paths.

## 6. Verification

- `astro build` and `astro check` pass clean.
- Local `astro preview` walkthrough of every page at mobile + desktop widths.
- All internal links resolve; RSS + sitemap validate.
- Lighthouse ≥95 performance/accessibility/SEO on home and a journal post.
