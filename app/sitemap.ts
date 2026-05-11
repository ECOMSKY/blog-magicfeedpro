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

export default function sitemap(): MetadataRoute.Sitemap {
  const out: MetadataRoute.Sitemap = [];
  const allPosts = getAllPosts();

  for (const locale of locales) {
    // Static
    out.push({ url: url(locale, '/'), changeFrequency: 'daily', priority: 1.0 });
    out.push({ url: url(locale, '/about'), changeFrequency: 'monthly', priority: 0.5 });
    out.push({ url: url(locale, '/categories'), changeFrequency: 'weekly', priority: 0.7 });

    // Categories
    for (const c of getCategoriesByLocale(locale)) {
      out.push({
        url: url(locale, `/category/${c.slug}`),
        changeFrequency: 'weekly',
        priority: 0.7
      });
    }

    // Posts in this locale
    const posts = allPosts.filter((p) => p.locale === locale);
    for (const p of posts) {
      const translations = allPosts.filter((q) => q.translationKey === p.translationKey);
      const alternates: Record<string, string> = {};
      for (const tr of translations) {
        alternates[tr.locale] = url(tr.locale, `/posts/${tr.slug}`);
      }
      if (translations.find((t) => t.locale === defaultLocale)) {
        alternates['x-default'] = url(defaultLocale, `/posts/${translations.find((t) => t.locale === defaultLocale)!.slug}`);
      }
      out.push({
        url: url(locale, `/posts/${p.slug}`),
        lastModified: p.updated || p.date,
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: { languages: alternates }
      });
    }
  }

  return out;
}
