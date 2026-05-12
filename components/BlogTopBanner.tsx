import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';

/**
 * Sticky promo bar above the blog header — drives blog readers to the
 * LP's free-audit CTA in the same language as the article they're on.
 *
 * Why sticky: the blog gets a lot of organic SEO traffic, but the user
 * journey to LP → audit is what actually converts. Surfacing the offer
 * above-the-fold (and pinning it) caps the friction at "one click".
 *
 * Why per-locale: we ship 10 locales for the blog; pushing every visitor
 * to the EN landing page leaks intent. The link includes `?lang=` so
 * the LP can boot in the matching locale.
 */
export default async function BlogTopBanner({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'topBanner' });
  const url = `https://lp.magicfeedpro.com/?utm_source=blog&utm_medium=top_banner&utm_campaign=free_audit&lang=${locale}`;
  return (
    <div className="blog-top-banner" role="region" aria-label={t('aria')}>
      <div className="blog-top-banner__inner">
        <span className="blog-top-banner__dot" aria-hidden="true">🎁</span>
        <span className="blog-top-banner__text">{t('headline')}</span>
        <a
          href={url}
          className="blog-top-banner__cta"
          target="_blank"
          rel="noopener"
        >
          {t('cta')} →
        </a>
      </div>
    </div>
  );
}
