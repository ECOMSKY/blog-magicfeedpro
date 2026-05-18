import type { MetadataRoute } from 'next';
import { locales, defaultLocale } from '@/i18n/config';
import type { Locale } from '@/i18n/config';
import { getAllPosts, getCategoriesByLocale } from '@/lib/content';
import { SITE_URL } from '@/lib/seo';

function url(locale: Locale, path = ''): string {
  const p = path === '/' ? '' : path;
  if (locale === defaultLocale) return `${SITE_URL}${p}`;
  return `${SITE_URL}/${locale}${p}`;
}

function absoluteImageUrl(cover: string | undefined, locale: Locale): string | undefined {
  if (!cover) return undefined;
  if (cover.startsWith('http')) return cover;
  return `${SITE_URL}${cover.startsWith('/') ? cover : '/' + cover}`;
}

/**
 * Sitemap output, with Google-supported extensions:
 *   - `alternates.languages` → hreflang (multilingual)
 *   - `images` → <image:image> entries for article covers, used by
 *     Google Images discovery and surfaced in AI Overviews.
 *
 * One file because Next.js's MetadataRoute.Sitemap handles up to 50k
 * entries before needing a sitemap-index. For this blog we'll stay
 * well below that for years; if we ever cross 5k we'll split.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const out: MetadataRoute.Sitemap = [];
  const allPosts = getAllPosts();

  for (const locale of locales) {
    out.push({
      url: url(locale, '/'),
      changeFrequency: 'daily',
      priority: 1.0,
      lastModified: new Date(),
    });
    out.push({ url: url(locale, '/about'), changeFrequency: 'monthly', priority: 0.5 });
    out.push({ url: url(locale, '/categories'), changeFrequency: 'weekly', priority: 0.7 });
    out.push({ url: url(locale, '/posts'), changeFrequency: 'daily', priority: 0.8 });

    for (const c of getCategoriesByLocale(locale)) {
      out.push({
        url: url(locale, `/category/${c.slug}`),
        changeFrequency: 'weekly',
        priority: 0.7
      });
    }

    const posts = allPosts.filter((p) => p.locale === locale);
    for (const p of posts) {
      const translations = allPosts.filter((q) => q.translationKey === p.translationKey);
      const alternates: Record<string, string> = {};
      for (const tr of translations) {
        alternates[tr.locale] = url(tr.locale, `/posts/${tr.slug}`);
      }
      const defaultTr = translations.find((t) => t.locale === defaultLocale);
      if (defaultTr) {
        alternates['x-default'] = url(defaultLocale, `/posts/${defaultTr.slug}`);
      }
      const img = absoluteImageUrl(p.cover, locale);
      out.push({
        url: url(locale, `/posts/${p.slug}`),
        lastModified: p.updated || p.date,
        changeFrequency: 'weekly',
        // Featured posts get extra weight; new posts (< 30 days) too.
        priority: p.featured ? 0.95 : (isFresh(p.date) ? 0.9 : 0.7),
        alternates: { languages: alternates },
        ...(img ? { images: [img] } : {}),
      });
    }
  }

  return out;
}

function isFresh(dateStr: string): boolean {
  const t = new Date(dateStr).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < 30 * 86_400_000;
}
