// 60s ISR — author archive picks up newly-attributed posts within a minute.
export const revalidate = 60;

import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/config';
import { locales } from '@/i18n/config';
import { getAllAuthors, getAuthor, getPostsByLocale } from '@/lib/content';
import PostCard from '@/components/PostCard';
import { absoluteUrl, breadcrumbJsonLd, SITE_NAME } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

type Params = { locale: string; slug: string };

export function generateStaticParams() {
  const out: Params[] = [];
  for (const locale of locales) {
    for (const a of getAllAuthors()) out.push({ locale, slug: a.slug });
  }
  return out;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, locale: localeRaw } = await params;
  const locale = localeRaw as Locale;
  const author = getAuthor(slug);
  if (!author) return {};
  const t = await getTranslations({ locale, namespace: 'seo' });
  const title = t('authorTitle', { name: author.name });
  const description = t('authorDescription', { bio: author.bio });
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(locale, `/author/${author.slug}`) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(locale, `/author/${author.slug}`)
    }
  };
}

export default async function AuthorPage({ params }: { params: Promise<Params> }) {
  const { slug, locale: localeRaw } = await params;
  setRequestLocale(localeRaw);
  const locale = localeRaw as Locale;
  const t = await getTranslations({ locale, namespace: 'author' });
  const author = getAuthor(slug);
  if (!author) notFound();
  const posts = getPostsByLocale(locale).filter((p) => p.author === slug);
  const initials = author.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    description: author.bio,
    sameAs: author.sameAs || [],
    url: absoluteUrl(locale, `/author/${author.slug}`)
  };
  const breadcrumb = breadcrumbJsonLd([
    { name: SITE_NAME, url: absoluteUrl(locale, '/') },
    { name: author.name, url: absoluteUrl(locale, `/author/${author.slug}`) }
  ]);

  return (
    <>
      <JsonLd data={personLd} />
      <JsonLd data={breadcrumb} />
      <section className="hero">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s-8)' }}>
          <div
            style={{
              width: 96, height: 96, borderRadius: '50%', background: 'var(--g-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 36
            }}
          >
            {initials}
          </div>
          <h1>{author.name}</h1>
          <p style={{ color: 'var(--brand-600)', fontWeight: 600 }}>{author.role}</p>
          <p className="hero__lead" style={{ marginTop: 0 }}>{author.bio}</p>
        </div>
      </section>
      <div className="container section">
        <h2 className="section__title">{t('articlesBy')} {author.name}</h2>
        <div className="card-grid">
          {posts.map((p) => (
            <PostCard key={p.slug} post={p} locale={locale} />
          ))}
        </div>
      </div>
    </>
  );
}
