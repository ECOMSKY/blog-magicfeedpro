import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';

/**
 * Article-bottom audit CTA — v5 (Apple/Notion/Stripe-grade redesign).
 *
 * Design references:
 *  - Stripe homepage CTA blocks: light surface, single primary action,
 *    a small product fragment that LOOKS like the product (not a fake
 *    browser chrome).
 *  - Notion "Try Notion" footer: generous whitespace, restrained type,
 *    one trust microcopy line, never two.
 *  - Apple product detail CTA: large quiet headline, one button,
 *    no gradient backgrounds in body content.
 *
 * Decisions:
 *  - Light surface (#FAFAFB) bordered with --line, not charcoal. The
 *    article above is already light; a dark slab fights the page.
 *  - Solid Electric Blue primary CTA on light: highest brand recall,
 *    AAA contrast, matches Stripe "Start now" treatment.
 *  - The right side is NOT a fake Google Shopping chrome anymore. It
 *    is a single, real-looking product-feed ROW (the actual unit of
 *    the product), with two stacked indicator lines for title quality
 *    and CTR — both annotated. No browser frame, no traffic lights.
 *  - No looping animations. No glow blobs. No gradient body bg.
 *  - Trust stats moved to a single short line beneath the CTA: one
 *    sentence, not a 3-pill row.
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

          <p className="audit-cta__trust">{t('trustLine')}</p>
        </div>

        {/* ── Right: a real-looking feed row, not a browser mockup ─── */}
        <figure className="audit-cta__product" aria-hidden="true">
          <FeedRow state="before" />
          <FeedRow state="after" />
        </figure>
      </div>
    </aside>
  );
}

/* ────────────────────────────────────────────────────────────────────
   FeedRow — a single product-feed row, the actual unit of the product
   we sell. Two states stacked vertically:
     - "before": dim title, no attributes, gray score
     - "after":  full title, GTIN + attributes pill, green score
   This is NOT a fake search result; it is a fragment of the feed-studio
   table — i.e., the real product. Stripe-style "show, don't decorate".
   ───────────────────────────────────────────────────────────────── */
function FeedRow({ state }: { state: 'before' | 'after' }) {
  const isAfter = state === 'after';
  return (
    <div className={`audit-cta__row audit-cta__row--${state}`}>
      <div className="audit-cta__row-thumb" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="6" fill={isAfter ? '#EEEEFE' : '#EFEFF1'} />
          <path
            d="M9 19 C9 14, 13 11, 20 11 C27 11, 31 14, 31 19 L31 23 C31 26, 27 29, 20 29 C13 29, 9 26, 9 23 Z"
            fill={isAfter ? '#716FFF' : '#C8C8CC'}
          />
          <path d="M13 21 L27 21" stroke="rgba(255,255,255,0.7)" strokeWidth="1" strokeLinecap="round" />
        </svg>
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
              <span className="audit-cta__chip">Brand</span>
              <span className="audit-cta__chip">Color</span>
              <span className="audit-cta__chip">Size</span>
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
