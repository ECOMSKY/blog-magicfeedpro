import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';

/**
 * Article-bottom audit CTA — vibrant gradient variant.
 *
 * Founder direction: "pour les banners sur les articles faut que ce soit
 * un peu plus colorés avec de beaux boutons avec dégradés". So this
 * banner deliberately overrides the audit's charcoal recommendation —
 * the exit popup keeps charcoal (binary decision moment), the in-article
 * banner gets the bolder treatment to interrupt the read.
 *
 * Decisions:
 *  - Soft brand gradient card surface (white→brand-50→white), reads as
 *    "the next thing" without screaming.
 *  - Gradient CTA pill (Electric Blue → deep blue), lifts on hover.
 *  - Score-comparison visual kept but tightened: first-letter tiles
 *    instead of generic-mask SVG, danger-tinted "before" 42/100,
 *    brand-tinted "after" 94/100, only 2 attribute chips not 4.
 *  - Single microcopy line under the CTA (was 2 — second was a broken
 *    i18n key).
 */
export default async function AuditBanner({ locale, slug }: { locale: Locale; slug: string }) {
  const t = await getTranslations({ locale, namespace: 'auditBanner' });
  const href = `https://lp.magicfeedpro.com/?utm_source=blog&utm_medium=article_banner&utm_campaign=audit&utm_content=${encodeURIComponent(slug)}&lang=${locale}`;

  return (
    <aside className="audit-cta" aria-label={t('aria')}>
      <div className="audit-cta__inner">
        {/* ── Left: message + CTA ────────────────────────────────── */}
        <div className="audit-cta__left">
          <span className="audit-cta__eyebrow">{t('eyebrow')}</span>

          <h3 className="audit-cta__title">{t('title')}</h3>
          <p className="audit-cta__lead">{t('lead')}</p>

          <div className="audit-cta__actions">
            <a href={href} className="audit-cta__btn" target="_blank" rel="noopener">
              {t('cta')}
              <svg
                className="audit-cta__btn-arrow"
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
            <span className="audit-cta__meta">{t('metaLine')}</span>
          </div>
        </div>

        {/* ── Right: feed-row score comparison ─────────────────────── */}
        <figure className="audit-cta__product" aria-hidden="true">
          <div className="audit-cta__score-label">{t('scoreLabel')}</div>
          <FeedRow state="before" />
          <FeedRow state="after" />
        </figure>
      </div>
    </aside>
  );
}

/* ────────────────────────────────────────────────────────────────────
   FeedRow — one product-feed row, two states stacked vertically.
   Thumb is a CSS first-letter tile (brand "R") — cleaner than the old
   generic-mask SVG, intentionally low-fi so it reads as a credibility
   prop, not a polished mockup.
   ───────────────────────────────────────────────────────────────── */
function FeedRow({ state }: { state: 'before' | 'after' }) {
  const isAfter = state === 'after';
  return (
    <div className={`audit-cta__row audit-cta__row--${state}`}>
      <div
        className={`audit-cta__row-thumb-letter audit-cta__row-thumb-letter--${state}`}
        aria-hidden="true"
      >
        R
      </div>

      <div className="audit-cta__row-body">
        <div
          className={`audit-cta__row-title ${isAfter ? '' : 'audit-cta__row-title--dim'}`}
        >
          {isAfter
            ? 'R-PUR Nano Light — Masque anti-pollution cycliste, filtre PM 0.1'
            : 'Masque running'}
        </div>
        <div className="audit-cta__row-attrs">
          {isAfter ? (
            <>
              <span className="audit-cta__chip">GTIN</span>
              <span className="audit-cta__chip">Attributes</span>
            </>
          ) : (
            <span className="audit-cta__chip audit-cta__chip--missing">— missing —</span>
          )}
        </div>
      </div>

      <div
        className={`audit-cta__row-score audit-cta__row-score--${state}`}
        aria-label={isAfter ? 'Quality score 94 of 100' : 'Quality score 42 of 100'}
      >
        <span className="audit-cta__row-score-num">{isAfter ? '94' : '42'}</span>
        <span className="audit-cta__row-score-unit">/100</span>
      </div>
    </div>
  );
}
