# ciseldsouza.com Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hand-written HTML site with an Astro 5 editorial site ("dark rhode" aesthetic) deployed to GitHub Pages, per `docs/superpowers/specs/2026-07-07-site-revamp-design.md`.

**Architecture:** Astro 5 SSG at repo root, Tailwind 4 via vite plugin, journal posts as a markdown content collection, zero framework JS (small vanilla `<script>`s), GitHub Actions deploy to Pages with the existing `ciseldsouza.com` CNAME.

**Tech Stack:** Astro ^5, Tailwind ^4 (`@tailwindcss/vite`), `@astrojs/sitemap`, `@astrojs/rss`, `@astrojs/check` + TypeScript, Fontsource (Poppins, Instrument Serif, Inter), pnpm.

**Verification approach:** No unit-test framework — this is a content site with one 3-line utility. Every task verifies with `pnpm build` (and `pnpm check` once configured) plus `grep` assertions against `dist/` output. Treat a failing grep exactly like a failing test: fix before committing.

**Design tokens (used throughout — do not improvise):**
- Colors: charcoal `#191714` (bg), bone `#EFEAE2` (text), muted `#8f887c`, faint `#6e675c`, line `#2b2822` (hairlines), champagne `#C9BFAF` (interactive accent only)
- Fonts: `font-display` = Poppins (300/500/600), `font-serif` = Instrument Serif (400 + italic), `font-body` = Inter (300/400/500)
- Voice: all-lowercase display text; uppercase only for tiny letterspaced meta labels

---

### Task 1: Scaffold Astro project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/styles/global.css`, `src/pages/index.astro` (placeholder, replaced in Task 4)

The old site files (`index.html`, `blog.html`, `blog/`, `post.css`, `.nojekyll`, `CNAME`) stay untouched until Task 9 — GitHub Pages currently serves them from `main`, and nothing changes live until the Pages setting is flipped.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "ciseldsouza",
  "type": "module",
  "version": "1.0.0",
  "packageManager": "pnpm@10.12.1",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check"
  },
  "dependencies": {
    "@astrojs/rss": "^4.0.11",
    "@astrojs/sitemap": "^3.3.0",
    "@fontsource/inter": "^5.2.5",
    "@fontsource/instrument-serif": "^5.2.5",
    "@fontsource/poppins": "^5.2.5",
    "@tailwindcss/vite": "^4.1.8",
    "astro": "^5.6.1",
    "tailwindcss": "^4.1.8"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.4",
    "typescript": "^5.8.0"
  }
}
```

- [ ] **Step 2: Write `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://ciseldsouza.com',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "src/**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: Write `src/styles/global.css`** (theme tokens; component classes come in Task 2)

```css
@import "tailwindcss";

@theme {
  --color-charcoal: #191714;
  --color-bone: #EFEAE2;
  --color-muted: #8f887c;
  --color-faint: #6e675c;
  --color-line: #2b2822;
  --color-champagne: #C9BFAF;

  --font-display: "Poppins", ui-sans-serif, sans-serif;
  --font-serif: "Instrument Serif", ui-serif, serif;
  --font-body: "Inter", ui-sans-serif, sans-serif;
}

html {
  background-color: var(--color-charcoal);
  color: var(--color-bone);
  font-family: var(--font-body);
}
```

- [ ] **Step 5: Write placeholder `src/pages/index.astro`**

```astro
---
import '../styles/global.css';
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>cisel dsouza</title>
  </head>
  <body>
    <h1 class="font-serif italic text-4xl p-8">scaffold ok</h1>
  </body>
</html>
```

- [ ] **Step 6: Install and build**

Run: `pnpm install && pnpm build`
Expected: build completes, `dist/index.html` exists.

Run: `grep -c "scaffold ok" dist/index.html`
Expected: `1`

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs tsconfig.json src/
git commit -m "feat: scaffold Astro 5 + Tailwind 4 project"
```

---

### Task 2: Design system — Layout, Nav, Footer, motion

**Files:**
- Create: `src/layouts/Layout.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`
- Modify: `src/styles/global.css`, `src/pages/index.astro` (use the layout)

- [ ] **Step 1: Extend `src/styles/global.css`** — append after the existing `html` rule:

```css
::selection {
  background-color: var(--color-champagne);
  color: var(--color-charcoal);
}

/* tiny uppercase letterspaced meta label */
.sec-label {
  font-family: var(--font-body);
  font-size: 0.65rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--color-faint);
}

/* animated underline for inline links */
.u-link {
  position: relative;
  text-decoration: none;
}
.u-link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -2px;
  height: 1px;
  width: 100%;
  background: var(--color-champagne);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s ease;
}
.u-link:hover::after { transform: scaleX(1); }

/* scroll reveal */
[data-reveal] {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: no-preference) {
  [data-reveal] {
    opacity: 0;
    transform: translateY(1.25rem);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  [data-reveal].is-visible {
    opacity: 1;
    transform: none;
  }
}

/* marquee band */
@media (prefers-reduced-motion: no-preference) {
  .marquee-track { animation: marquee 40s linear infinite; }
}
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
```

- [ ] **Step 2: Write `src/components/Nav.astro`**

```astro
<header class="flex items-center justify-between px-6 py-6 md:px-12 md:py-8">
  <a href="/" class="font-serif text-xl tracking-wide text-bone">cisel dsouza</a>
  <nav class="flex gap-6 text-[0.7rem] tracking-[0.18em] text-muted">
    <a href="/about" class="u-link hover:text-bone transition-colors">about</a>
    <a href="/journal" class="u-link hover:text-bone transition-colors">journal</a>
    <a href="/contact" class="u-link hover:text-bone transition-colors">contact</a>
  </nav>
</header>
```

- [ ] **Step 3: Write `src/components/Footer.astro`**

```astro
<footer class="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-6 md:px-12">
  <span class="text-[0.65rem] tracking-[0.22em] uppercase text-faint">© 2026 cisel dsouza</span>
  <nav class="flex gap-6 text-[0.65rem] tracking-[0.22em] uppercase text-muted">
    <a href="https://instagram.com/ciseldsouza" target="_blank" rel="noopener" class="u-link hover:text-bone transition-colors">instagram</a>
    <a href="https://linkedin.com" target="_blank" rel="noopener" class="u-link hover:text-bone transition-colors">linkedin</a>
    <a href="mailto:ciseldsouza@gmail.com" class="u-link hover:text-bone transition-colors">email</a>
  </nav>
</footer>
```

- [ ] **Step 4: Write `src/layouts/Layout.astro`**

```astro
---
import '../styles/global.css';
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site);
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <link rel="alternate" type="application/rss+xml" title="cisel dsouza — journal" href="/rss.xml" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonical} />
    <meta name="generator" content={Astro.generator} />
  </head>
  <body class="flex min-h-screen flex-col bg-charcoal font-body text-bone antialiased">
    <Nav />
    <main class="flex-1">
      <slot />
    </main>
    <Footer />
    <script>
      const els = document.querySelectorAll('[data-reveal]');
      if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches && els.length) {
        const io = new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (e.isIntersecting) {
                e.target.classList.add('is-visible');
                io.unobserve(e.target);
              }
            }
          },
          { threshold: 0.15 }
        );
        els.forEach((el) => io.observe(el));
      }
    </script>
  </body>
</html>
```

- [ ] **Step 5: Rewrite `src/pages/index.astro`** to use the layout (still placeholder content):

```astro
---
import Layout from '../layouts/Layout.astro';
---
<Layout title="cisel dsouza — brand, marketing & ecommerce strategy" description="Brand, marketing, and ecommerce strategy & optimization.">
  <h1 class="font-serif italic text-4xl p-8" data-reveal>layout ok</h1>
</Layout>
```

- [ ] **Step 6: Build and verify**

Run: `pnpm build`
Expected: success.

Run: `grep -c "cisel dsouza" dist/index.html && grep -c "instagram.com/ciseldsouza" dist/index.html`
Expected: both ≥ 1.

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: design system — layout, nav, footer, motion primitives"
```

---

### Task 3: Journal content collection

**Files:**
- Create: `src/content.config.ts`, `src/utils/readTime.ts`, `src/content/journal/brand-strategy-is-not-a-logo.md`, `src/content/journal/the-one-marketing-metric-that-matters.md`, `src/content/journal/why-most-brands-lose-on-ecommerce.md`

- [ ] **Step 1: Write `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tag: z.enum(['brand strategy', 'marketing', 'ecommerce', 'growth']),
    draft: z.boolean().default(false),
  }),
});

export const collections = { journal };
```

- [ ] **Step 2: Write `src/utils/readTime.ts`**

```ts
/** Rounded minutes at ~200 wpm, minimum 1. */
export function readTime(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
```

- [ ] **Step 3: Write `src/content/journal/brand-strategy-is-not-a-logo.md`** (content migrated verbatim from `blog/brand-strategy-is-not-a-logo.html`)

```markdown
---
title: "brand strategy is not a logo (and why the confusion costs you)"
description: "Every week a founder tells me they need to fix their branding. What they usually mean is a new logo. What they actually need is something much harder to buy."
date: 2026-05-15
tag: "brand strategy"
---

Every week a founder tells me they need to "fix their branding." What they usually mean is they need a new logo. What they actually need is something much harder to buy — and much more valuable.

## the logo is the last thing

A logo is the output of a brand strategy. It should be the last thing you design, not the first. When you design the logo first, you end up with a mark that looks nice but doesn't mean anything — because there was no strategy behind the choices.

What colour is your brand? Why? What feeling should someone have when they see it? What kind of person does your brand speak to, and what do they believe about the world? A logo cannot answer these questions. It can only express the answers you've already found.

## what brand strategy actually is

Brand strategy is the set of decisions that determine how your business wants to be known, by whom, and why. It includes your positioning (where you sit relative to competitors), your audience (who you are for and equally, who you are not for), your voice (how you speak), and your values (what you stand for when no one is watching).

None of this is visual. All of it shapes the visual.

## the cost of getting it backwards

Brands that start with the logo and work backwards end up redesigning every 18 months. Each time the business evolves, the logo feels wrong — because it was never rooted in anything that lasts.

Brands that start with strategy might take longer to get to a logo. But when they do, the logo holds. It can survive a new campaign, a new product line, a new market. Because it's connected to something deeper than taste.

The best brands aren't the ones with the prettiest logos. They're the ones that know exactly what they are — and have been consistent about it for years.
```

- [ ] **Step 4: Write `src/content/journal/the-one-marketing-metric-that-matters.md`** (migrated from `blog/the-one-marketing-metric-that-matters.html`)

```markdown
---
title: "the one marketing metric that actually matters"
description: "You can track open rates, CTR, ROAS, CAC, and fifty other acronyms. But if you're not watching this one number, you're optimizing the wrong thing."
date: 2026-04-10
tag: "marketing"
---

You can track open rates, CTR, ROAS, CAC, and fifty other acronyms. Dashboards can be beautiful things. But if you're not watching this one number, you're optimising the wrong thing entirely.

## the metric: revenue per customer over time

It goes by different names — customer lifetime value, LTV, CLV. But the concept is simple: how much does a single customer spend with you across their entire relationship with your brand?

This number changes everything. It tells you how much you can afford to spend acquiring a new customer. It tells you which customer segments are actually profitable. And it tells you whether your marketing is building a business or just buying transactions.

## why most brands ignore it

LTV is hard to measure well. It requires connecting data across time — first purchase, second purchase, churn, reactivation. Most marketing dashboards are built around campaigns, not customers. So brands optimise for campaign metrics instead.

The result: you can have a 4x ROAS campaign that's destroying your business. If the customers it brings in only buy once at a discount and never return, you've paid to acquire unprofitable customers at scale.

## how to start using it

**First:** Calculate your average purchase value and how many times a customer buys in a year. Multiply. That's a rough LTV.

**Second:** Segment your customers. Your top 20% almost always generate 60–80% of revenue. Find out what they have in common and use that to guide acquisition.

**Third:** Start measuring what drives repeat purchase — not what drives first click. Email flows, packaging, product quality, customer service. These are your real marketing levers.

ROAS tells you if an ad worked today. LTV tells you if your marketing is working at all. One of these builds a business. The other fills a dashboard.
```

- [ ] **Step 5: Write `src/content/journal/why-most-brands-lose-on-ecommerce.md`** (migrated from `blog/why-most-brands-lose-on-ecommerce.html`)

```markdown
---
title: "why most brands lose on ecommerce before they even start"
description: "The biggest mistake isn't a bad product page or slow shipping. It's treating ecommerce like a channel instead of a business model."
date: 2026-06-12
tag: "ecommerce"
---

The biggest mistake isn't a bad product page or slow shipping. It's treating ecommerce like a channel instead of a business model. And this one framing error shapes every decision that follows — usually badly.

## the channel mindset

When brands think of ecommerce as a channel, they bolt it onto an existing operation. They take their retail pricing, their retail product assortment, and their retail marketing logic — and they dump it online. Then they wonder why it doesn't work as well as the store.

It won't. Because ecommerce is not a shelf. It's a relationship.

## what changes when you treat it as a business model

You start asking different questions. Not "how do we drive traffic to the product page?" but "what does someone need to feel to buy something they can't touch?" Not "what's our ROAS?" but "what's the total experience from first impression to repeat purchase?"

This shifts your attention from acquisition to retention. From the transaction to the journey. From the click to the customer.

## three things that actually matter

**1. Trust signals at every step.** Online, no one can pick up your product. The images, the copy, the reviews, the returns policy — all of it is doing the work that a shop assistant and a physical shelf used to do.

**2. Post-purchase is where loyalty is built.** Most brands spend everything on acquiring the first sale and almost nothing on what happens after. The packaging, the confirmation email, the follow-up — these are where a customer decides if they come back.

**3. Your data is a business asset.** Every ecommerce interaction generates data that a physical store never could. Customer segments, buying patterns, product affinity. If you're not using this to inform your next decision, you're leaving the most valuable part of ecommerce on the table.

Ecommerce done well isn't a cheaper version of retail. It's a fundamentally different business — one that rewards brands who understand the psychology of buying without presence.
```

- [ ] **Step 6: Verify the collection loads and schema validates**

Run: `pnpm build`
Expected: success, no schema errors. (The pages aren't rendered yet — this validates frontmatter parsing.)

Run: `pnpm check`
Expected: 0 errors (warnings acceptable).

- [ ] **Step 7: Commit**

```bash
git add src/content.config.ts src/utils/ src/content/
git commit -m "feat: journal content collection with three migrated posts"
```

---

### Task 4: Homepage

**Files:**
- Create: `src/components/Capture.astro`, `src/components/Marquee.astro`, `src/components/JournalRow.astro`
- Modify: `src/pages/index.astro` (replace placeholder)

- [ ] **Step 1: Write `src/components/Capture.astro`** — pre-launch email capture. Plain HTML form posting to Google Forms (works without JS); JS intercepts for an inline success state.

```astro
<div class="max-w-md" data-reveal>
  <p class="font-serif italic text-lg text-bone mb-1">be the first to know when i launch</p>
  <form
    method="POST"
    action="https://docs.google.com/forms/d/e/1FAIpQLSfN8VW8dOFFSNBKRwaWBfcNBKXVIDjpQ82DxEApX68iMgsXHQ/formResponse"
    target="_blank"
    data-capture
    class="group flex items-baseline gap-3 border-b border-faint pb-2 transition-colors focus-within:border-champagne"
  >
    <input
      type="email"
      name="entry.1485403170"
      required
      placeholder="your@email.com"
      autocomplete="email"
      class="w-full bg-transparent font-body text-sm font-light text-bone placeholder:text-faint focus:outline-none"
    />
    <button type="submit" class="shrink-0 text-[0.65rem] tracking-[0.2em] uppercase text-champagne cursor-pointer">
      notify me →
    </button>
  </form>
  <p class="mt-2 text-[0.65rem] tracking-[0.04em] text-faint" data-note>no spam. just the launch announcement.</p>
  <p class="mt-2 font-serif italic text-sm text-champagne" data-success hidden>you're on the list. talk soon.</p>
</div>

<script>
  const form = document.querySelector<HTMLFormElement>('[data-capture]');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = new FormData(form).get('entry.1485403170');
    fetch(form.action, { method: 'POST', mode: 'no-cors', body: new FormData(form) });
    form.hidden = true;
    document.querySelector<HTMLElement>('[data-note]')!.hidden = true;
    document.querySelector<HTMLElement>('[data-success]')!.hidden = false;
  });
</script>
```

- [ ] **Step 2: Write `src/components/Marquee.astro`**

```astro
---
const items = ['strategy', 'brand', 'ecommerce', 'growth', 'marketing'];
const line = items.map((i) => `${i} · `).join('');
---
<div class="overflow-hidden border-y border-line py-3" aria-hidden="true">
  <div class="marquee-track flex w-max whitespace-nowrap text-[0.65rem] tracking-[0.3em] text-faint">
    <span>{line.repeat(4)}</span>
    <span>{line.repeat(4)}</span>
  </div>
</div>
```

- [ ] **Step 3: Write `src/components/JournalRow.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import { readTime } from '../utils/readTime';

interface Props {
  post: CollectionEntry<'journal'>;
  index: number;
}

const { post, index } = Astro.props;
const num = String(index + 1).padStart(2, '0');
const minutes = readTime(post.body ?? '');
---
<a
  href={`/journal/${post.id}/`}
  class="group flex items-baseline gap-5 border-b border-line py-5 transition-transform duration-300 hover:translate-x-2"
  data-reveal
>
  <span class="font-serif italic text-sm text-faint">{num}</span>
  <span class="flex-1">
    <span class="block font-serif text-xl md:text-2xl text-bone group-hover:text-champagne transition-colors">{post.data.title}</span>
    <span class="sec-label mt-1 block">{post.data.tag} — {minutes} min</span>
  </span>
  <span class="text-muted opacity-0 transition-opacity duration-300 group-hover:opacity-100">→</span>
</a>
```

- [ ] **Step 4: Rewrite `src/pages/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Layout from '../layouts/Layout.astro';
import Capture from '../components/Capture.astro';
import Marquee from '../components/Marquee.astro';
import JournalRow from '../components/JournalRow.astro';

const posts = (await getCollection('journal', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  .slice(0, 3);
---
<Layout
  title="cisel dsouza — brand, marketing & ecommerce strategy"
  description="Brand, marketing, and ecommerce strategy & optimization for brands that want to matter."
>
  <section class="px-6 pt-16 pb-12 md:px-12 md:pt-24 md:pb-16">
    <h1 class="font-display font-semibold lowercase leading-[0.98] tracking-[-0.02em] text-[clamp(3rem,8vw,6.5rem)]" data-reveal>
      brand,<br />marketing<br />&amp; <em class="font-serif italic font-normal">ecommerce</em>
    </h1>
    <div class="mt-8 flex flex-wrap items-end justify-between gap-6" data-reveal>
      <p class="max-w-xs text-sm font-light leading-relaxed text-muted">
        strategy &amp; optimization for brands that want to matter.
      </p>
      <span class="sec-label">est. 2026</span>
    </div>
    <div class="mt-12">
      <Capture />
    </div>
  </section>

  <Marquee />

  <section class="px-6 py-12 md:px-12 md:py-16">
    <div class="mb-6 flex items-baseline justify-between" data-reveal>
      <h2 class="sec-label">selected thinking</h2>
      <a href="/journal" class="u-link text-[0.65rem] tracking-[0.2em] uppercase text-muted hover:text-bone transition-colors">all posts →</a>
    </div>
    <div class="border-t border-line">
      {posts.map((post, i) => <JournalRow post={post} index={i} />)}
    </div>
  </section>

  <section class="grid border-t border-line md:grid-cols-2">
    <div class="border-b border-line px-6 py-10 md:border-b-0 md:border-r md:px-12" data-reveal>
      <h2 class="sec-label mb-5">services</h2>
      <ul class="font-serif text-xl leading-loose text-bone">
        <li>brand strategy</li>
        <li>marketing</li>
        <li>ecommerce</li>
        <li>growth</li>
      </ul>
    </div>
    <div class="px-6 py-10 md:px-12" data-reveal>
      <h2 class="sec-label mb-5">elsewhere</h2>
      <p class="max-w-xs text-sm font-light leading-relaxed text-muted">
        daily thinking, behind the scenes, and work in progress —
        <a href="https://instagram.com/ciseldsouza" target="_blank" rel="noopener" class="u-link text-bone">@ciseldsouza</a>
      </p>
    </div>
  </section>
</Layout>
```

(The "elsewhere" block is upgraded to the image strip in Task 8 — if images exist.)

- [ ] **Step 5: Build and verify**

Run: `pnpm build`
Expected: success.

Run:
```bash
grep -c "selected thinking" dist/index.html
grep -c "formResponse" dist/index.html
grep -c "why most brands lose on ecommerce" dist/index.html
```
Expected: each ≥ 1 (newest post appears on home).

- [ ] **Step 6: Visual check**

Run: `pnpm preview` and open http://localhost:4321 — verify: hero renders with serif italic "ecommerce", capture underline focuses champagne, marquee scrolls, journal rows shift on hover, mobile width (devtools 375px) has no horizontal scroll.

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: editorial index homepage with pre-launch capture"
```

---

### Task 5: Journal pages + legacy redirects

**Files:**
- Create: `src/pages/journal/index.astro`, `src/pages/journal/[slug].astro`, `public/blog.html`, `public/blog/brand-strategy-is-not-a-logo.html`, `public/blog/the-one-marketing-metric-that-matters.html`, `public/blog/why-most-brands-lose-on-ecommerce.html`

Note: `public/blog/*.html` will collide with the old `blog/*.html` at repo root only conceptually — the root files are the *old site* and get deleted in Task 9; the `public/` copies are the redirect stubs that ship with the new site.

- [ ] **Step 1: Write `src/pages/journal/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
import JournalRow from '../../components/JournalRow.astro';

const posts = (await getCollection('journal', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---
<Layout title="journal — cisel dsouza" description="Writing on brand strategy, marketing, and ecommerce.">
  <section class="px-6 pt-16 pb-12 md:px-12 md:pt-24">
    <h1 class="font-display font-semibold lowercase leading-none tracking-[-0.02em] text-[clamp(2.5rem,6vw,4.5rem)]" data-reveal>
      the <em class="font-serif italic font-normal">journal</em>
    </h1>
    <p class="mt-6 max-w-sm text-sm font-light leading-relaxed text-muted" data-reveal>
      thinking on brand, marketing &amp; ecommerce — published occasionally, when there's something worth saying.
    </p>
  </section>
  <section class="px-6 pb-16 md:px-12">
    <div class="border-t border-line">
      {posts.map((post, i) => <JournalRow post={post} index={i} />)}
    </div>
  </section>
</Layout>
```

- [ ] **Step 2: Write `src/pages/journal/[slug].astro`** — reading layout with prev/next:

```astro
---
import { getCollection, render } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
import { readTime } from '../../utils/readTime';

export async function getStaticPaths() {
  const posts = (await getCollection('journal', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return posts.map((post, i) => ({
    params: { slug: post.id },
    props: { post, prev: posts[i + 1] ?? null, next: posts[i - 1] ?? null },
  }));
}

const { post, prev, next } = Astro.props;
const { Content } = await render(post);
const minutes = readTime(post.body ?? '');
const dateLabel = post.data.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toLowerCase();
---
<Layout title={`${post.data.title} — cisel dsouza`} description={post.data.description}>
  <article class="mx-auto max-w-2xl px-6 pt-16 pb-12 md:pt-24">
    <a href="/journal" class="u-link text-[0.65rem] tracking-[0.2em] uppercase text-muted">← all posts</a>
    <p class="sec-label mt-8">{post.data.tag}</p>
    <h1 class="mt-3 font-serif text-4xl leading-tight text-bone md:text-5xl" data-reveal>{post.data.title}</h1>
    <p class="mt-4 text-[0.7rem] tracking-[0.14em] text-faint">{dateLabel} · {minutes} min read</p>
    <div class="prose-journal mt-10">
      <Content />
    </div>
  </article>
  <nav class="mx-auto grid max-w-2xl gap-px border-t border-line px-6 py-8 md:grid-cols-2">
    <div>
      {prev && (
        <a href={`/journal/${prev.id}/`} class="group block">
          <span class="sec-label">← previous</span>
          <span class="mt-1 block font-serif text-lg text-muted group-hover:text-bone transition-colors">{prev.data.title}</span>
        </a>
      )}
    </div>
    <div class="md:text-right">
      {next && (
        <a href={`/journal/${next.id}/`} class="group block">
          <span class="sec-label">next →</span>
          <span class="mt-1 block font-serif text-lg text-muted group-hover:text-bone transition-colors">{next.data.title}</span>
        </a>
      )}
    </div>
  </nav>
</Layout>
```

- [ ] **Step 3: Add journal prose styles** — append to `src/styles/global.css`:

```css
/* journal article body */
.prose-journal {
  font-family: var(--font-body);
  font-weight: 300;
  font-size: 1rem;
  line-height: 1.9;
  color: var(--color-bone);
}
.prose-journal p { margin-bottom: 1.5rem; }
.prose-journal h2 {
  font-family: var(--font-serif);
  font-size: 1.6rem;
  margin: 2.5rem 0 1rem;
  color: var(--color-bone);
}
.prose-journal strong { font-weight: 500; color: var(--color-champagne); }
.prose-journal a { color: var(--color-champagne); text-decoration: underline; text-underline-offset: 3px; }
```

- [ ] **Step 4: Write the four legacy redirect stubs.** `public/blog.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0; url=/journal/" />
  <link rel="canonical" href="https://ciseldsouza.com/journal/" />
  <title>Redirecting…</title>
</head>
<body><a href="/journal/">Moved to /journal/</a></body>
</html>
```

`public/blog/brand-strategy-is-not-a-logo.html`, `public/blog/the-one-marketing-metric-that-matters.html`, `public/blog/why-most-brands-lose-on-ecommerce.html` — same file with the URL swapped to `/journal/<same-slug>/` (e.g. `url=/journal/brand-strategy-is-not-a-logo/` and matching canonical).

- [ ] **Step 5: Build and verify**

Run: `pnpm build && pnpm check`
Expected: both clean.

Run:
```bash
test -f dist/journal/index.html && echo INDEX_OK
test -f dist/journal/brand-strategy-is-not-a-logo/index.html && echo POST_OK
grep -c "the logo is the last thing" dist/journal/brand-strategy-is-not-a-logo/index.html
grep -o 'url=/journal/[a-z-]*/' dist/blog/why-most-brands-lose-on-ecommerce.html
```
Expected: `INDEX_OK`, `POST_OK`, `1`, `url=/journal/why-most-brands-lose-on-ecommerce/`.

- [ ] **Step 6: Visual check**

Run: `pnpm preview` — open a post: title serif, ~65ch measure, bold lead-ins render champagne, prev/next links work, `/blog.html` redirects to `/journal/`.

- [ ] **Step 7: Commit**

```bash
git add src/ public/
git commit -m "feat: journal index, post layout, legacy blog redirects"
```

---

### Task 6: About, Contact, 404

**Files:**
- Create: `src/pages/about.astro`, `src/pages/contact.astro`, `src/pages/404.astro`

- [ ] **Step 1: Write `src/pages/about.astro`** (copy is a draft in Cisel's voice — flagged for her to edit):

```astro
---
import Layout from '../layouts/Layout.astro';
---
<Layout title="about — cisel dsouza" description="Brand, marketing and ecommerce strategist. I help brands find their voice, their customers, and the numbers to prove it.">
  <section class="mx-auto max-w-3xl px-6 pt-16 pb-16 md:pt-24">
    <h1 class="font-serif text-3xl leading-snug text-bone md:text-5xl md:leading-snug" data-reveal>
      good strategy is <em class="italic text-champagne">taste</em>, backed by numbers.
    </h1>
    <div class="mt-12 max-w-xl space-y-6 text-sm font-light leading-loose text-muted" data-reveal>
      <p>
        i'm cisel — a brand, marketing &amp; ecommerce strategist. i work with brands that
        want to matter: to stand for something, speak like themselves, and grow because of it.
      </p>
      <p>
        my work sits where creative and commercial meet — positioning that holds, marketing
        that compounds, and ecommerce treated as a business model, not a channel. fewer,
        better decisions; measured properly.
      </p>
    </div>
    <div class="mt-14 border-t border-line pt-8" data-reveal>
      <h2 class="sec-label mb-5">disciplines</h2>
      <ul class="flex flex-wrap gap-x-8 gap-y-2 font-serif text-lg text-bone">
        <li>brand strategy</li>
        <li>marketing</li>
        <li>ecommerce</li>
        <li>growth optimization</li>
      </ul>
    </div>
  </section>
</Layout>
```

- [ ] **Step 2: Write `src/pages/contact.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';

const links = [
  { label: 'email', value: 'ciseldsouza@gmail.com', href: 'mailto:ciseldsouza@gmail.com' },
  { label: 'instagram', value: '@ciseldsouza', href: 'https://instagram.com/ciseldsouza' },
  { label: 'linkedin', value: 'cisel dsouza', href: 'https://linkedin.com' },
];
---
<Layout title="contact — cisel dsouza" description="Say hello — email, Instagram, or LinkedIn.">
  <section class="px-6 pt-16 pb-16 md:px-12 md:pt-24">
    <h1 class="font-display font-semibold lowercase leading-none tracking-[-0.02em] text-[clamp(2.5rem,7vw,5.5rem)]" data-reveal>
      say <em class="font-serif italic font-normal">hello</em>
    </h1>
    <div class="mt-14 max-w-xl border-t border-line" data-reveal>
      {links.map(({ label, value, href }) => (
        <a
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener' : undefined}
          class="group flex items-baseline justify-between gap-6 border-b border-line py-5 transition-transform duration-300 hover:translate-x-2"
        >
          <span class="sec-label">{label}</span>
          <span class="font-serif text-xl text-bone group-hover:text-champagne transition-colors">{value}</span>
        </a>
      ))}
    </div>
  </section>
</Layout>
```

- [ ] **Step 3: Write `src/pages/404.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
---
<Layout title="not found — cisel dsouza" description="This page doesn't exist.">
  <section class="flex flex-col items-start px-6 pt-24 pb-16 md:px-12">
    <p class="sec-label">404</p>
    <h1 class="mt-4 font-serif text-4xl italic text-bone md:text-6xl">this page wandered off.</h1>
    <a href="/" class="u-link mt-10 text-[0.7rem] tracking-[0.2em] uppercase text-champagne">back home →</a>
  </section>
</Layout>
```

- [ ] **Step 4: Build and verify**

Run: `pnpm build`
Expected: success.

Run:
```bash
grep -c "say" dist/contact/index.html
grep -c "disciplines" dist/about/index.html
test -f dist/404.html && echo 404_OK
```
Expected: ≥1, ≥1, `404_OK`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/
git commit -m "feat: about, contact, and 404 pages"
```

---

### Task 7: RSS feed

**Files:**
- Create: `src/pages/rss.xml.js`

(Sitemap already ships via the integration configured in Task 1; the RSS `<link>` tag already exists in `Layout.astro`.)

- [ ] **Step 1: Write `src/pages/rss.xml.js`**

```js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('journal', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'cisel dsouza — journal',
    description: 'Writing on brand strategy, marketing, and ecommerce.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/journal/${post.id}/`,
    })),
  });
}
```

- [ ] **Step 2: Build and verify**

Run: `pnpm build`

Run:
```bash
grep -c "<item>" dist/rss.xml
test -f dist/sitemap-index.xml && echo SITEMAP_OK
grep -c "ciseldsouza.com/journal/" dist/sitemap-0.xml
```
Expected: `3`, `SITEMAP_OK`, ≥ 1.

- [ ] **Step 3: Commit**

```bash
git add src/pages/rss.xml.js
git commit -m "feat: RSS feed for journal"
```

---

### Task 8: Instagram strip

**Files:**
- Create: `scripts/fetch-instagram.mjs`, `src/components/InstaStrip.astro`, `src/assets/instagram/.gitkeep`
- Modify: `src/pages/index.astro` (swap "elsewhere" text block content)

- [ ] **Step 1: Write `scripts/fetch-instagram.mjs`** — best-effort local script, never run in CI:

```js
// Best-effort fetch of recent Instagram images for @ciseldsouza.
// Run locally: node scripts/fetch-instagram.mjs
// If Instagram blocks the request, drop images into src/assets/instagram/ manually —
// the site renders whatever that folder contains and hides the strip when empty.
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const USERNAME = 'ciseldsouza';
const OUT_DIR = 'src/assets/instagram';
const MAX_IMAGES = 6;

const res = await fetch(
  `https://www.instagram.com/api/v1/users/web_profile_info/?username=${USERNAME}`,
  {
    headers: {
      // Public web app id Instagram's own frontend sends; required for a JSON response.
      'x-ig-app-id': '936619743392459',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
  }
);

if (!res.ok) {
  console.error(`Instagram responded ${res.status}. Add images to ${OUT_DIR}/ manually.`);
  process.exit(1);
}

const json = await res.json();
const edges = json?.data?.user?.edge_owner_to_timeline_media?.edges ?? [];
if (edges.length === 0) {
  console.error(`No posts found (private account or changed API). Add images to ${OUT_DIR}/ manually.`);
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });
let saved = 0;
for (const { node } of edges.slice(0, MAX_IMAGES)) {
  const img = await fetch(node.display_url);
  if (!img.ok) continue;
  const file = path.join(OUT_DIR, `${node.shortcode}.jpg`);
  await writeFile(file, Buffer.from(await img.arrayBuffer()));
  console.log(`saved ${file}`);
  saved++;
}
console.log(saved > 0 ? `done: ${saved} images.` : 'no images saved — add manually.');
```

- [ ] **Step 2: Run the fetch script once**

Run: `node scripts/fetch-instagram.mjs`
Expected: either `saved src/assets/instagram/<shortcode>.jpg` lines, or a clear failure message. **Both outcomes are fine** — the component handles the empty folder. If it failed, create the folder with a `.gitkeep`:

```bash
mkdir -p src/assets/instagram && touch src/assets/instagram/.gitkeep
```

- [ ] **Step 3: Write `src/components/InstaStrip.astro`** — renders nothing when the folder is empty:

```astro
---
import { Image } from 'astro:assets';
import type { ImageMetadata } from 'astro';

const modules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/instagram/*.{jpg,jpeg,png,webp}',
  { eager: true }
);
const images = Object.values(modules).map((m) => m.default);
---
{images.length > 0 && (
  <section class="border-t border-line px-6 py-10 md:px-12" data-reveal>
    <div class="mb-5 flex items-baseline justify-between">
      <h2 class="sec-label">from instagram</h2>
      <a href="https://instagram.com/ciseldsouza" target="_blank" rel="noopener" class="u-link text-[0.65rem] tracking-[0.2em] uppercase text-muted hover:text-bone transition-colors">@ciseldsouza →</a>
    </div>
    <div class="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3">
      {images.map((img) => (
        <a href="https://instagram.com/ciseldsouza" target="_blank" rel="noopener" class="shrink-0 snap-start">
          <Image
            src={img}
            alt="Instagram post by @ciseldsouza"
            width={440}
            height={440}
            class="aspect-square w-52 rounded-sm object-cover brightness-[.92] saturate-[.85] transition hover:brightness-100 hover:saturate-100"
          />
        </a>
      ))}
    </div>
  </section>
)}
```

- [ ] **Step 4: Wire into `src/pages/index.astro`** — import and place after the services/elsewhere grid section:

Add to frontmatter imports:
```astro
import InstaStrip from '../components/InstaStrip.astro';
```
Add after the closing `</section>` of the services grid:
```astro
<InstaStrip />
```

- [ ] **Step 5: Build and verify (both states)**

Run: `pnpm build && pnpm check`
Expected: clean regardless of whether images exist.

If images were fetched: `grep -c "from instagram" dist/index.html` → `1`.
If not: `grep -c "from instagram" dist/index.html` → `0` (section absent, no placeholders).

- [ ] **Step 6: Commit**

```bash
git add scripts/ src/
git commit -m "feat: instagram strip fed from committed images, hidden when empty"
```

---

### Task 9: Deploy workflow + old-site removal

**Files:**
- Create: `.github/workflows/deploy.yml`, `public/CNAME`
- Delete: `index.html`, `blog.html`, `blog/`, `post.css`, `.nojekyll`, `CNAME` (root)

- [ ] **Step 1: Write `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

(`withastro/action@v3` detects pnpm from `packageManager` in package.json, builds, and uploads the Pages artifact.)

- [ ] **Step 2: Move CNAME into `public/`**

```bash
git mv CNAME public/CNAME
```

Verify content: `cat public/CNAME` → `ciseldsouza.com`

- [ ] **Step 3: Delete the old site files**

```bash
git rm index.html blog.html post.css .nojekyll
git rm -r blog
```

- [ ] **Step 4: Full build verification**

Run: `pnpm build && pnpm check`
Expected: clean.

Run:
```bash
cat dist/CNAME
test -f dist/blog/brand-strategy-is-not-a-logo.html && echo REDIRECT_OK
```
Expected: `ciseldsouza.com`, `REDIRECT_OK` (redirect stubs from `public/` replace the deleted originals).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: GitHub Actions Pages deploy, remove legacy hand-written site"
```

- [ ] **Step 6: Push and flip Pages source (needs Joel)**

```bash
git push origin main
```

Then Joel (or `gh api`) must switch the repo's Pages build source from "Deploy from a branch" to **"GitHub Actions"**: repo → Settings → Pages → Build and deployment → Source. Via CLI:

```bash
gh api -X PUT repos/{owner}/{repo}/pages -f build_type=workflow
```

Watch the run: `gh run watch` — expected: deploy job succeeds, site live at https://ciseldsouza.com.

---

### Task 10: Final verification pass

**Files:** none (verification only; fix-forward anything found)

- [ ] **Step 1: Clean build from scratch**

Run: `rm -rf dist && pnpm build && pnpm check`
Expected: zero errors.

- [ ] **Step 2: Link integrity sweep over dist**

```bash
python3 - <<'EOF'
import re, pathlib, sys
root = pathlib.Path('dist')
hrefs = set()
for f in root.rglob('*.html'):
    hrefs.update(re.findall(r'href="(/[^"#]*)"', f.read_text()))
missing = []
for h in sorted(hrefs):
    p = h.rstrip('/')
    candidates = [root / p.lstrip('/'), root / (p.lstrip('/') + '/index.html'), root / (p.lstrip('/') + '.html')]
    if p == '': candidates = [root / 'index.html']
    if not any(c.exists() for c in candidates):
        missing.append(h)
print('MISSING:', missing if missing else 'none')
sys.exit(1 if missing else 0)
EOF
```
Expected: `MISSING: none`

- [ ] **Step 3: Preview walkthrough**

Run: `pnpm preview` — check at desktop and 375px width:
- `/` — hero, capture (submit a test email → success line appears), marquee, 3 journal rows, services block
- `/journal` and all 3 posts — prose styles, prev/next chain
- `/about`, `/contact`, a bogus URL for 404
- `/blog.html` → lands on `/journal/`

- [ ] **Step 4: Lighthouse**

Run: `npx lighthouse http://localhost:4321 --quiet --chrome-flags="--headless" --only-categories=performance,accessibility,seo --output=json --output-path=/tmp/lh.json && python3 -c "import json;d=json.load(open('/tmp/lh.json'));print({k:round(v['score']*100) for k,v in d['categories'].items()})"`
Expected: all ≥ 95. Common fixes if short: missing `alt`, contrast on `--color-faint` text (bump to `#7a7368` if flagged), unsized images.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: final verification pass adjustments"
git push origin main
```

Confirm live site at https://ciseldsouza.com renders the new design (may need a hard refresh for cached CNAME-level assets).
