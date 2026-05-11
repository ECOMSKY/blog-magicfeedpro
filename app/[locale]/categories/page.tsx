import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { locales } from '@/i18n/config';
import { getCategoriesByLocale, getPostsByLocale } from '@/lib/content';
import { localePath } from '@/lib/seo';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata = {
  title: 'All categories'
};

export default async function CategoriesIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeRaw } = await params;
  setRequestLocale(localeRaw);
  const locale = localeRaw as Locale;
  const t = await getTranslations({ locale, namespace: 'home' });
  const cats = getCategoriesByLocale(locale);
  const posts = getPostsByLocale(locale);
  const countByCat = new Map<string, number>();
  for (const p of posts) countByCat.set(p.category, (countByCat.get(p.category) || 0) + 1);

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1 className="title-gradient">{t('categories')}</h1>
        </div>
      </section>
      <div className="container section">
        <div className="card-grid">
          {cats.map((c) => (
            <Link key={c.slug} href={localePath(locale, `/category/${c.slug}`)} className="card">
              <div className="card__cover" style={{ aspectRatio: '5 / 2' }}>
                <div
                  style={{
                    position: 'absolute', inset: 0, background: 'var(--g-brand)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: 22, padding: 16, textAlign: 'center', letterSpacing: -0.5
                  }}
                >
                  {c.name}
                </div>
              </div>
              <div className="card__body">
                <p className="card__excerpt">{c.description}</p>
                <div className="card__meta">{countByCat.get(c.slug) || 0} articles</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
