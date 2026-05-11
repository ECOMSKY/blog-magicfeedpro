import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { locales } from '@/i18n/config';
import type { Locale } from '@/i18n/config';
import { getCategoriesByLocale, getCategory, getPostsByLocale } from '@/lib/content';
import PostCard from '@/components/PostCard';
import { absoluteUrl, breadcrumbJsonLd, localePath, SITE_NAME } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import Link from 'next/link';

type Params = { locale: string; slug: string };

export function generateStaticParams() {
  const all: Params[] = [];
  for (const locale of locales) {
    for (const c of getCategoriesByLocale(locale)) all.push({ locale, slug: c.slug });
  }
  return all;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, locale: localeRaw } = await params;
  const locale = localeRaw as Locale;
  const cat = getCategory(locale, slug);
  if (!cat) return {};
  return {
    title: cat.name,
    description: cat.description,
    alternates: { canonical: localePath(locale, `/category/${cat.slug}`) }
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { slug, locale: localeRaw } = await params;
  setRequestLocale(localeRaw);
  const locale = localeRaw as Locale;
  const t = await getTranslations({ locale, namespace: 'category' });
  const cat = getCategory(locale, slug);
  if (!cat) notFound();
  const posts = getPostsByLocale(locale).filter((p) => p.category === slug);
  const others = getCategoriesByLocale(locale).filter((c) => c.slug !== slug);

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: cat.name,
    description: cat.description,
    inLanguage: locale,
    url: absoluteUrl(locale, `/category/${cat.slug}`),
    hasPart: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: absoluteUrl(locale, `/posts/${p.slug}`),
      datePublished: p.date
    }))
  };
  const breadcrumb = breadcrumbJsonLd([
    { name: SITE_NAME, url: absoluteUrl(locale, '/') },
    { name: cat.name, url: absoluteUrl(locale, `/category/${cat.slug}`) }
  ]);

  return (
    <>
      <JsonLd data={collectionLd} />
      <JsonLd data={breadcrumb} />
      <section className="hero">
        <div className="container">
          <span className="eyebrow">{cat.name}</span>
          <h1 className="title-gradient" style={{ maxWidth: 880, margin: '0 auto var(--s-8)' }}>
            {cat.name}
          </h1>
          <p className="hero__lead">{cat.description}</p>
          <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>
            {posts.length} {t('articles')}
          </div>
        </div>
      </section>

      <div className="container section">
        {posts.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--ink-500)' }}>No articles yet.</p>
        ) : (
          <div className="card-grid">
            {posts.map((p) => (
              <PostCard key={p.slug} post={p} locale={locale} />
            ))}
          </div>
        )}
        {others.length > 0 && (
          <>
            <div className="section__head" style={{ marginTop: 'var(--s-20)' }}>
              <h2 className="section__title">{t('exploreOther')}</h2>
            </div>
            <div className="chip-row">
              {others.map((c) => (
                <Link key={c.slug} href={localePath(locale, `/category/${c.slug}`)} className="pill">
                  {c.name}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      <ExitIntentPopup pathKind="category" />
    </>
  );
}
