import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import FeedScoringAnim from './FeedScoringAnim';

/**
 * SidebarAuditPromo — vibrant audit promo card that sits to the right of
 * the article title/hero on desktop (≥1024px). Reuses the same gradient
 * surface + gradient CTA pill treatment as <AuditBanner /> so the two
 * touchpoints read as one product family.
 *
 * Hidden on mobile — the article-end <AuditBanner /> handles that
 * viewport. This card exists to fill the desktop whitespace that would
 * otherwise sit empty next to the article title.
 */
export default async function SidebarAuditPromo({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'auditPromo' });
  const href = `https://lp.magicfeedpro.com/${locale === 'en' ? '' : `${locale}/`}?utm_source=blog&utm_medium=sidebar&utm_campaign=audit_promo`;

  return (
    <aside className="sidebar-audit-promo" aria-label={t('aria')}>
      <div className="sidebar-audit-promo__top">
        <span className="sidebar-audit-promo__eyebrow">{t('eyebrow')}</span>
        <h2 className="sidebar-audit-promo__title">{t('title')}</h2>
        <p className="sidebar-audit-promo__lead">{t('lead')}</p>
      </div>

      {/* Animated illustration fills the visual gap between the lead
          copy and the CTA so the card distributes content across the
          full hero-column height instead of leaving dead whitespace. */}
      <FeedScoringAnim variant="sidebar" />

      <div className="sidebar-audit-promo__bottom">
        <a
          href={href}
          className="sidebar-audit-promo__btn"
          target="_blank"
          rel="noopener"
        >
          {t('cta')}
          <svg
            className="sidebar-audit-promo__btn-arrow"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </a>
        <p className="sidebar-audit-promo__meta">{t('meta')}</p>
      </div>
    </aside>
  );
}
