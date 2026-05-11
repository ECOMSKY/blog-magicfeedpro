import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { locales } from '@/i18n/config';
import { getPostsByLocale } from '@/lib/content';
import PostCard from '@/components/PostCard';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata = {
  title: 'Search'
};

export default async function SearchPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { locale: localeRaw } = await params;
  setRequestLocale(localeRaw);
  const locale = localeRaw as Locale;
  const t = await getTranslations({ locale, namespace: 'search' });
  const posts = getPostsByLocale(locale);
  const query = (q || '').trim().toLowerCase();
  const results = query
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          p.keywords.some((kw) => kw.toLowerCase().includes(query)) ||
          p.body.toLowerCase().includes(query)
      )
    : [];

  return (
    <div className="container section">
      <h1>{t('title')}</h1>
      <form method="get" className="hero__search" style={{ maxWidth: 560, margin: 'var(--s-12) 0 var(--s-16)' }}>
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder={t('placeholder')}
          aria-label={t('placeholder')}
        />
      </form>
      {query && results.length === 0 && (
        <p style={{ color: 'var(--ink-500)' }}>
          {t('noResults')} <strong>"{query}"</strong>
        </p>
      )}
      {results.length > 0 && (
        <div className="card-grid">
          {results.map((p) => (
            <PostCard key={p.slug} post={p} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
