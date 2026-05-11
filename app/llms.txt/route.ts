import { getAllPosts, getCategoriesByLocale } from '@/lib/content';
import { SITE_URL, SITE_NAME, absoluteUrl } from '@/lib/seo';
import { locales } from '@/i18n/config';

export const dynamic = 'force-static';

export async function GET() {
  const lines: string[] = [];
  lines.push(`# ${SITE_NAME}`);
  lines.push('');
  lines.push('> Practical guides on Google Shopping feed optimization, e-commerce SEO, and conversion.');
  lines.push('');
  lines.push(`Site: ${SITE_URL}`);
  lines.push('');

  for (const locale of locales) {
    const posts = getAllPosts().filter((p) => p.locale === locale);
    if (!posts.length) continue;
    const categories = getCategoriesByLocale(locale);
    lines.push(`## ${locale.toUpperCase()} content`);
    lines.push('');
    for (const cat of categories) {
      const inCat = posts.filter((p) => p.category === cat.slug);
      if (!inCat.length) continue;
      lines.push(`### ${cat.name}`);
      lines.push('');
      for (const p of inCat) {
        lines.push(`- [${p.title}](${absoluteUrl(locale, `/posts/${p.slug}`)}): ${p.description}`);
      }
      lines.push('');
    }
    // Uncategorised
    const cats = new Set(categories.map((c) => c.slug));
    const uncat = posts.filter((p) => !cats.has(p.category));
    if (uncat.length) {
      lines.push(`### Other`);
      lines.push('');
      for (const p of uncat) {
        lines.push(`- [${p.title}](${absoluteUrl(locale, `/posts/${p.slug}`)}): ${p.description}`);
      }
      lines.push('');
    }
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}
