import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { locales } from '@/i18n/config';
import type { Locale } from '@/i18n/config';
import { getPostsByLocale } from '@/lib/content';
import PostCard from '@/components/PostCard';
import { absoluteUrl, breadcrumbJsonLd, localePath, SITE_NAME } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';

const PAGE_SIZE = 12;

type Params = { locale: string };
type Search = { page?: string };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

function parsePage(raw: string | undefined): number {
  const n = parseInt(raw ?? '1', 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}): Promise<Metadata> {
  const { locale: localeRaw } = await params;
  const { page: pageRaw } = await searchParams;
  const locale = localeRaw as Locale;
  const t = await getTranslations({ locale, namespace: 'seo' });
  const page = parsePage(pageRaw);

  const baseTitle = t('postsTitle');
  const title = page > 1 ? `${baseTitle} — ${page}` : baseTitle;
  const description = t('postsDescription');
  const path = page > 1 ? `/posts?page=${page}` : '/posts';

  // Hreflang alternates: only point at canonical page-1 in each locale.
  // Paginated pages (?page=N) get noindex below, so they don't need
  // hreflang entries — that would just confuse Google's clustering.
  const langs: Record<string, string> = {};
  for (const l of locales) langs[l] = localePath(l as Locale, '/posts');
  langs['x-default'] = '/posts';

  return {
    title,
    description,
    alternates: {
      canonical: localePath(locale, path),
      ...(page === 1 ? { languages: langs } : {}),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(locale, path),
    },
    // Page 1 = canonical full list, indexable.
    // Page 2+ noindex,follow → preserves crawl budget, links still flow.
    ...(page > 1 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function PostsIndexPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { locale: localeRaw } = await params;
  const { page: pageRaw } = await searchParams;
  setRequestLocale(localeRaw);
  const locale = localeRaw as Locale;
  const t = await getTranslations({ locale, namespace: 'posts' });
  const tCat = await getTranslations({ locale, namespace: 'category' });
  const tArt = await getTranslations({ locale, namespace: 'article' });

  const all = getPostsByLocale(locale);
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const page = Math.min(parsePage(pageRaw), totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const items = all.slice(start, start + PAGE_SIZE);

  const breadcrumb = breadcrumbJsonLd([
    { name: SITE_NAME, url: absoluteUrl(locale, '/') },
    { name: t('title'), url: absoluteUrl(locale, '/posts') },
  ]);

  const pageHref = (n: number) =>
    n <= 1 ? localePath(locale, '/posts') : localePath(locale, `/posts?page=${n}`);

  const range = pageRange(page, totalPages);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <section className="hero">
        <div className="container">
          <h1 className="title-gradient" style={{ maxWidth: 880, margin: '0 auto var(--s-8)' }}>
            {t('title')}
          </h1>
          <p className="hero__lead">{t('lead')}</p>
          <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>
            {all.length} {tCat('articles')}
            {totalPages > 1 && (
              <>
                {' · '}
                {t('pageOf', { current: page, total: totalPages })}
              </>
            )}
          </div>
        </div>
      </section>

      <div className="container section">
        <div className="card-grid">
          {items.map((p) => (
            <PostCard key={p.slug} post={p} locale={locale} />
          ))}
        </div>

        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="pagination"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'var(--s-3)',
              marginTop: 'var(--s-16)',
              flexWrap: 'wrap',
            }}
          >
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className="pill" rel="prev">
                ← {tArt('prev')}
              </Link>
            ) : (
              <span className="pill" aria-disabled="true" style={{ opacity: 0.3 }}>
                ← {tArt('prev')}
              </span>
            )}

            {range.map((n, i) =>
              n === '…' ? (
                <span key={`gap-${i}`} aria-hidden="true" style={{ padding: '0 var(--s-1)', color: 'var(--ink-500)' }}>
                  …
                </span>
              ) : (
                <Link
                  key={n}
                  href={pageHref(n)}
                  className="pill"
                  aria-current={n === page ? 'page' : undefined}
                  aria-label={`${t('pageLabel')} ${n}`}
                  style={
                    n === page
                      ? {
                          fontWeight: 700,
                          background: 'var(--ink-900)',
                          color: 'var(--ink-0)',
                          borderColor: 'var(--ink-900)',
                        }
                      : undefined
                  }
                >
                  {n}
                </Link>
              ),
            )}

            {page < totalPages ? (
              <Link href={pageHref(page + 1)} className="pill" rel="next">
                {tArt('next')} →
              </Link>
            ) : (
              <span className="pill" aria-disabled="true" style={{ opacity: 0.3 }}>
                {tArt('next')} →
              </span>
            )}
          </nav>
        )}
      </div>
    </>
  );
}

// Compact page range with ellipsis: always show first + last + ±1
// around current. ≤ 7 total → show all. Output examples:
//   (1, 10)  → [1, 2, '…', 10]
//   (5, 10)  → [1, '…', 4, 5, 6, '…', 10]
//   (10, 10) → [1, '…', 9, 10]
function pageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = new Set([1, total, current - 1, current, current + 1]);
  const nums = [...keep].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  nums.forEach((n, i) => {
    out.push(n);
    if (i < nums.length - 1 && nums[i + 1] - n > 1) out.push('…');
  });
  return out;
}
