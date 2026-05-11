# MagicFeedPro Blog — `blog.magicfeedpro.com`

The MagicFeedPro blog: practical, field-tested content on Google Shopping feed optimization,
e-commerce SEO and conversion.

**Stack**: Next.js 15 (App Router, RSC) · TypeScript · MDX content in repo · vanilla CSS
mirroring the LP tokens · next-intl (EN / FR / ES) · Pagefind-ready · Plausible analytics ·
Resend for newsletter · Vercel for hosting.

This repo is a **separate static site** with no dependency on the SaaS app at
`magicfeedpro-dev-test`. It is pure SSG (no DB, no auth, no FastAPI backend). The only
optional outbound is the Resend Audience API for newsletter capture.

---

## Quick start

```bash
npm install
cp .env.example .env.local      # add keys when you have them
npm run dev                     # http://localhost:3000
```

Build for production:

```bash
npm run build
npm start
```

---

## How to add an article

1. Create an MDX file under `content/posts/<locale>/<slug>.mdx`. Use one of the existing posts
   as a template — the frontmatter schema is documented at the top of each file.
2. Required frontmatter fields:
   - `slug` (URL fragment; must match the filename)
   - `translationKey` (shared across locales so hreflang/sitemap can link them)
   - `locale` (`en` | `fr` | `es`)
   - `title`, `description`, `keywords[]`
   - `date` (ISO), `updated` (ISO)
   - `author` (must exist as `content/authors/<author>.json`)
   - `category` (must exist as `content/categories/<locale>/<category>.json`)
   - `tags[]`
3. Optional:
   - `tldr` — rendered in a callout at the top
   - `cover`, `coverAlt` — if omitted, a brand-gradient default is used
   - `featured: true` — show on the homepage hero
   - `comments: true` — enable Giscus (requires env vars; off by default)
   - `noindex: true` — exclude from search engines and sitemap
   - `draft: true` — exclude from the build entirely
4. Allowed MDX components: `<Callout type="tip|warning|info">`, `<ImageCaption>`,
   `<ProductCTA variant="audit|trial">`, `<FAQ items={[{q,a}]}>`. All available without
   import.
5. Commit and push. Vercel will preview-deploy your change automatically.

---

## How to add a locale

1. Add the locale code to `i18n/config.ts` (`locales` array + `localeNames`).
2. Create `messages/<locale>.json` — copy `messages/en.json` and translate.
3. Create `content/categories/<locale>/<slug>.json` files for each category.
4. Create `content/posts/<locale>/` and add at least one post.
5. Add an RSS route: copy `app/fr/rss.xml/route.ts` and adjust the locale.
6. `next-intl` middleware picks the new locale up automatically.

---

## How to deploy

### Status (today)

- **GitHub**: https://github.com/ECOMSKY/blog-magicfeedpro
- **Vercel staging**: https://blog-magicfeedpro.vercel.app
- **Production domain**: `blog.magicfeedpro.com` (CNAME setup required — see below)

### Initial deployment to Vercel

The Vercel project is already linked. To redeploy:

```bash
git push origin main          # triggers automatic production deploy
# or, from a working tree:
vercel deploy --prod          # manual prod deploy
vercel deploy                 # preview deploy (per branch / PR)
```

Environment variables already configured in Vercel:

- `NEXT_PUBLIC_SITE_URL=https://blog.magicfeedpro.com`
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=blog.magicfeedpro.com`

To add Resend / Giscus / additional locale env vars:

```bash
vercel env add RESEND_API_KEY production
vercel env add RESEND_AUDIENCE_ID production
# (paste value when prompted)
```

### Custom domain (CNAME)

In your DNS provider (Hostinger), add:

```
Type:  CNAME
Name:  blog
Value: cname.vercel-dns.com
TTL:   3600
```

In Vercel → Project → Settings → Domains, add `blog.magicfeedpro.com`. Vercel auto-issues
the SSL certificate within a few minutes after DNS propagates.

### CLI deploy (optional)

```bash
npx vercel link            # one-time, attach to the Vercel project
npx vercel --prod          # deploy to production
```

---

## Environment variables

| Name | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | ✓ | Production URL; used for canonical, OG, sitemap. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | ✓ | Domain Plausible reports under. |
| `RESEND_API_KEY` | optional | When set, newsletter subscriptions are persisted to Resend. |
| `RESEND_AUDIENCE_ID` | optional | The audience to add subscribers to. |
| `NEXT_PUBLIC_GISCUS_REPO` | optional | Owner/repo for Giscus comments. |
| `NEXT_PUBLIC_GISCUS_REPO_ID` | optional | Giscus repo ID from giscus.app. |
| `NEXT_PUBLIC_GISCUS_CATEGORY` | optional | Discussion category. |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | optional | Category ID. |

---

## What ships in v1

- Vanilla-CSS design mirroring the LP tokens (colors, typography, gradients, shadows, radii).
- Homepage: hero with gradient + search, featured article card, latest articles grid (8),
  category chips, newsletter capture, footer (3 cols mirroring `magicfeedpro.com`).
- Article page: breadcrumbs, TL;DR callout, sticky TOC (desktop), MDX body with allowed
  components, author card, share row, related (3), prev/next, Giscus slot.
- Category page: hero + filtered grid + cross-category chips.
- Author page: avatar + bio + articles by them.
- About page.
- Search page (server-side filter on title/description/tags/body).
- Static i18n at `/`, `/fr`, `/es` via `next-intl` `as-needed` prefix.
- `sitemap.xml` (locale-aware, with hreflang `<xhtml:link>`).
- `robots.txt` with the LP's AI-crawler allowlist (GPTBot, ClaudeBot, PerplexityBot, ...).
- `llms.txt` listing the article hierarchy per locale.
- RSS at `/rss.xml`, `/fr/rss.xml`, `/es/rss.xml`.
- JSON-LD on every page (`Organization`, `WebSite` w/ `SearchAction`, `BlogPosting`,
  `BreadcrumbList`, `CollectionPage`, `Person`, `FAQPage` via the `<FAQ>` MDX component).
- Newsletter capture (`/api/newsletter/subscribe`) → Resend Audience API (soft-fails to
  acceptance when keys missing).
- Plausible analytics script in `<head>`.
- 5 EN seed articles + 5 ES translation stubs covering: pillar feed-optimization guide,
  conversion troubleshooting, Shopify setup, AI rewrite case study, Merchant Center errors.

## What is intentionally deferred

- **Pagefind client-side search**. `next/build` triggers `pagefind` over `.next/server/app`
  but the production-grade client UI is left as a future enhancement. The current `/search`
  page is a server-side filter that works on all the static content.
- **Cover images for the 5 seed articles**. Frontmatter has `cover: ""` and the
  `DefaultCover` component renders the LP gradient + initials as a fallback. Drop PNGs into
  `public/covers/<slug>.png` (1200×630) and set `cover: "/covers/<slug>.png"` when ready.
- **Giscus comments** are wired but disabled — set the four `NEXT_PUBLIC_GISCUS_*` env vars
  and flip `comments: true` on the articles you want to enable.

---

## File layout

```
app/                         App Router routes
  layout.tsx                 Root layout (Inter font, JSON-LD, Plausible)
  page.tsx                   Homepage
  posts/[slug]/page.tsx      Article template
  category/[slug]/page.tsx   Category page
  categories/page.tsx        Category index
  author/[slug]/page.tsx     Author page
  about/page.tsx             About
  search/page.tsx            Search (server-side filter)
  sitemap.ts                 Generated sitemap (locale-aware)
  robots.ts                  Robots (with AI-crawler allowlist)
  rss.xml/route.ts           RSS (default locale)
  fr/rss.xml/route.ts        RSS (FR)
  es/rss.xml/route.ts        RSS (ES)
  llms.txt/route.ts          LLM manifest
  api/newsletter/subscribe/route.ts   Resend audience POST

components/                  Reusable components
content/
  posts/<locale>/*.mdx       Articles
  authors/<slug>.json        Author bios
  categories/<locale>/<slug>.json
i18n/                        next-intl config + request loader
messages/<locale>.json       UI translations
lib/                         Content + SEO helpers
public/                      Static assets (favicon, covers)
```

---

## Lighthouse / Web Vitals targets

- Performance ≥ 95 (mobile)
- SEO 100
- Accessibility 100
- Best Practices 100
- LCP < 2.5s, CLS < 0.05, INP < 200ms

Inter is loaded via `next/font/google` with `display: swap`. Images use the brand gradient
fallback (no external request) until covers are provided.

---

## Contact / contributing

- Issues / PRs on this repo
- Email: hello@magicfeedpro.com

© MagicFeedPro. All rights reserved.
