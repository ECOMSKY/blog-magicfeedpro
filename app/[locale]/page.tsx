import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/config';
import { locales } from '@/i18n/config';
import { getPostsByLocale, getCategoriesByLocale } from '@/lib/content';
import FeaturedCard from '@/components/FeaturedCard';
import PostCard from '@/components/PostCard';
import ExitIntentPopup from '@/components/ExitIntentPopup';
// Newsletter card removed — the user opted to drop the sidebar capture in
// favour of a cleaner two-column layout with just Categories on the side.
import { localePath, absoluteUrl } from '@/lib/seo';
import Link from 'next/link';

type Params = { locale: string };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  const title = t('homeTitle');
  const description = t('homeDescription');
  return {
    title,
    description,
    alternates: {
      canonical: localePath(locale as Locale, '/'),
      languages: {
        en: '/',
        fr: '/fr',
        es: '/es',
        'x-default': '/'
      }
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(locale as Locale, '/')
    }
  };
}

export default async function HomePage({ params }: { params: Promise<Params> }) {
  const { locale: localeRaw } = await params;
  setRequestLocale(localeRaw);
  const locale = localeRaw as Locale;
  const t = await getTranslations({ locale, namespace: 'home' });
  const posts = getPostsByLocale(locale);
  // Featured slot = newest article by date (date-desc already applied in
  // getPostsByLocale). The previous `posts.find(p => p.featured) || posts[0]`
  // pinned the FIRST article we ever flagged featured=true (the May-09
  // optimization guide) and never rotated even as fresher articles
  // shipped. Behavior changed 2026-05-16.
  const featured = posts[0];
  const rest = posts.filter((p) => p.slug !== featured?.slug).slice(0, 8);
  const categories = getCategoriesByLocale(locale);

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="eyebrow">{t('eyebrow')}</span>
          <h1 className="title-gradient" style={{ maxWidth: 880, margin: '0 auto var(--s-10)' }}>
            {t('title')}
          </h1>
          <p className="hero__lead">{t('lead')}</p>
          <form
            className="hero__search"
            action={localePath(locale, '/search')}
            method="get"
            role="search"
          >
            <span className="hero__search-icon" aria-hidden="true">
              <SearchIcon />
            </span>
            <input
              type="search"
              name="q"
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchPlaceholder')}
            />
          </form>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container" aria-label={t('categories')}>
          <div className="chip-row" style={{ justifyContent: 'center' }}>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={localePath(locale, `/category/${c.slug}`)}
                className="pill"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="container section">
        <div className="home-grid">
          <div className="home-grid__main">
            {featured && (
              <div style={{ marginBottom: 'var(--s-16)' }}>
                <div className="section__head">
                  <h2 className="section__title">{t('featured')}</h2>
                </div>
                <FeaturedCard post={featured} locale={locale} />
              </div>
            )}
            <div className="section__head">
              <h2 className="section__title">{t('latest')}</h2>
            </div>
            <div className="card-grid">
              {rest.map((p) => (
                <PostCard key={p.slug} post={p} locale={locale} />
              ))}
            </div>
          </div>
          <div className="home-grid__side">
            <CategoriesSide categories={categories} locale={locale} title={t('categories')} />
          </div>
        </div>
      </div>
      {/* Exit-intent popup — fires on mouse-leave-top (desktop) or
          scroll-back (mobile) once the visitor has spent 25s+ on the
          index, with a 7-day suppression after dismissal. */}
      <ExitIntentPopup pathKind="category" />
    </>
  );
}

function CategoriesSide({
  categories,
  locale,
  title
}: {
  categories: { slug: string; name: string }[];
  locale: Locale;
  title: string;
}) {
  if (!categories.length) return null;
  return (
    <aside className="mf-cta-card" style={{ padding: 'var(--s-12)' }}>
      <span className="mf-cta-card__eyebrow">{title}</span>
      <div className="chip-row" style={{ marginTop: 8 }}>
        {categories.map((c) => (
          <Link key={c.slug} href={localePath(locale, `/category/${c.slug}`)} className="pill">
            {c.name}
          </Link>
        ))}
      </div>
    </aside>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
