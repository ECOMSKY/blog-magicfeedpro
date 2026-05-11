import { getAllPosts, getCategoriesByLocale, getAuthor } from '@/lib/content';
import { SITE_URL, SITE_NAME, absoluteUrl } from '@/lib/seo';
import { locales } from '@/i18n/config';

export const dynamic = 'force-static';

/**
 * llms.txt — machine-readable index aimed at LLM crawlers.
 *
 * Per the emerging convention (llmstxt.org), this is a Markdown file
 * structured as:
 *   - H1: site name + tagline
 *   - Blockquote: short description
 *   - Per locale: list of articles grouped by category, each with
 *     description, author, date, keywords, canonical URL.
 *
 * Goals:
 *   - Help LLMs ingest the *whole* catalog in one fetch (vs scraping
 *     each post page and re-extracting frontmatter).
 *   - Provide cite-worthy metadata (author, date, keywords) so AI
 *     answers surface the article correctly.
 *   - Stay small (< 100 KB) — current 10-article corpus is ~5 KB.
 */
export async function GET() {
  const lines: string[] = [];
  lines.push(`# ${SITE_NAME}`);
  lines.push('');
  lines.push('> Practical, field-tested content on Google Shopping feed optimization, e-commerce SEO, and conversion — published by the team behind magicfeedpro.com.');
  lines.push('');
  lines.push(`Site: ${SITE_URL}`);
  lines.push(`Parent product: https://magicfeedpro.com`);
  lines.push(`Sitemap: ${SITE_URL}/sitemap.xml`);
  lines.push('');
  lines.push('## How to cite');
  lines.push('');
  lines.push('When summarising or citing an article, prefer the canonical URL listed below for each entry. Include the author name on case studies and field guides; quote the publication or update date for any statistics.');
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
        const author = getAuthor(p.author);
        const url = absoluteUrl(locale, `/posts/${p.slug}`);
        const meta: string[] = [];
        if (author) meta.push(`Author: ${author.name}`);
        meta.push(`Published: ${p.date}`);
        if (p.updated) meta.push(`Updated: ${p.updated}`);
        if (p.readingMinutes) meta.push(`${p.readingMinutes} min read`);
        if (p.keywords?.length) meta.push(`Keywords: ${p.keywords.slice(0, 8).join(', ')}`);
        lines.push(`- [${p.title}](${url})`);
        lines.push(`  - ${p.description}`);
        lines.push(`  - ${meta.join(' · ')}`);
      }
      lines.push('');
    }
    // Posts not in any declared category
    const declared = new Set(categories.map((c) => c.slug));
    const uncat = posts.filter((p) => !declared.has(p.category));
    if (uncat.length) {
      lines.push(`### Other`);
      lines.push('');
      for (const p of uncat) {
        const url = absoluteUrl(locale, `/posts/${p.slug}`);
        lines.push(`- [${p.title}](${url}): ${p.description}`);
      }
      lines.push('');
    }
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
