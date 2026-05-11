import { getPostsByLocale } from '@/lib/content';
import { SITE_URL, SITE_NAME, absoluteUrl } from '@/lib/seo';
import type { Locale } from '@/i18n/config';

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildRss(locale: Locale) {
  const posts = getPostsByLocale(locale).slice(0, 30);
  const home = absoluteUrl(locale, '/');
  const selfHref = `${SITE_URL}/${locale === 'en' ? '' : locale + '/'}rss.xml`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escape(SITE_NAME)} (${locale.toUpperCase()})</title>
  <link>${home}</link>
  <description>Practical guides on Google Shopping feed optimization, e-commerce SEO, and conversion.</description>
  <language>${locale}</language>
  <atom:link href="${selfHref}" rel="self" type="application/rss+xml"/>
  ${posts
    .map(
      (p) => `<item>
    <title>${escape(p.title)}</title>
    <link>${absoluteUrl(locale, `/posts/${p.slug}`)}</link>
    <guid>${absoluteUrl(locale, `/posts/${p.slug}`)}</guid>
    <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    <description>${escape(p.description)}</description>
  </item>`
    )
    .join('\n  ')}
</channel>
</rss>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
  });
}
