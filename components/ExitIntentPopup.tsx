'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

/**
 * Exit-intent popup — premium SaaS rewrite.
 *
 * Design choices (vs the first version):
 *   - No looping sparkle animation. Premium SaaS doesn't dance.
 *   - Single visual: a before/after micro-mockup of a Shopping ad title.
 *     It SHOWS the value rather than describing it.
 *   - One primary CTA + one ghost dismiss. No bullet lists, no
 *     decorative gradient bubbles.
 *   - 2-column on desktop, stack on mobile.
 *
 * Trigger: cursor leaves the top of the viewport (desktop), or
 * scroll-back after 30% page depth (mobile). 7-day dismissal cookie.
 */
const STORAGE_KEY = 'mfp_exit_popup_dismissed_at';
const SUPPRESS_DAYS = 7;
// Relaxed from 0.3 → 0.10 (10% page depth) so the popup actually has a
// chance to fire on shorter articles. Below 10% the user clearly bounced.
const SCROLL_THRESHOLD = 0.1;
const SCROLL_BACK_PX = 200;
// Fallback: if the user spends > N ms on the page AND scrolled at all,
// the popup arms even without a mouseleave event (covers users who
// reach the back button without crossing the top edge).
const DWELL_ARM_MS = 25_000;

export default function ExitIntentPopup({
  pathKind,
}: {
  pathKind: 'article' | 'category';
}) {
  const t = useTranslations('exitPopup');
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('nopopup') === '1') return;

    try {
      const last = Number(localStorage.getItem(STORAGE_KEY) || '0');
      if (last && Date.now() - last < SUPPRESS_DAYS * 86_400_000) return;
    } catch {
      /* localStorage unavailable — proceed */
    }

    let fired = false;
    let armed = false;
    let lastY = window.scrollY;
    let maxScroll = 0;
    const fire = () => {
      if (fired) return;
      fired = true;
      setOpen(true);
    };
    const arm = () => { armed = true; };
    const onLeave = (e: MouseEvent) => {
      // `clientY <= 0` is the canonical "cursor exited via the top" signal.
      // Some browsers report -ve values when the cursor reaches the URL
      // bar / dev-tools edge, so be permissive.
      if ((e.clientY <= 5 || e.relatedTarget === null) && armed) fire();
    };
    const onScroll = () => {
      const y = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const frac = docH > 0 ? y / docH : 0;
      if (frac > maxScroll) maxScroll = frac;
      if (maxScroll > SCROLL_THRESHOLD) armed = true;
      // Mobile scroll-back trigger
      if ('ontouchstart' in window && armed && lastY - y > SCROLL_BACK_PX) {
        fire();
      }
      lastY = y;
    };
    // Time-based arming: if the user dwells long enough, treat them as
    // engaged and arm the popup even without scroll.
    const dwellTimer = window.setTimeout(arm, DWELL_ARM_MS);
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(dwellTimer);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  if (!open) return null;

  const auditUrl = `https://lp.magicfeedpro.com/?utm_source=blog&utm_medium=exit_popup&utm_campaign=audit&utm_content=${pathKind}&lang=${locale}`;
  const dismiss = () => {
    setOpen(false);
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
  };

  return (
    <div
      className="exitpop-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exitpop-title"
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div className="exitpop">
        <button type="button" className="exitpop__close" aria-label={t('close')} onClick={dismiss}>×</button>

        <div className="exitpop__grid">
          <div className="exitpop__copy">
            <span className="exitpop__pill">
              <span className="exitpop__pill-dot" /> {t('pill')}
            </span>
            <h2 id="exitpop-title" className="exitpop__title">{t('title')}</h2>
            <p className="exitpop__lead">{t('lead')}</p>
            <a href={auditUrl} className="exitpop__cta" target="_blank" rel="noopener" onClick={dismiss}>
              {t('cta')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
            <button type="button" className="exitpop__skip" onClick={dismiss}>{t('decline')}</button>
            <p className="exitpop__trust">{t('trust')}</p>
          </div>

          <div className="exitpop__demo" aria-hidden="true">
            {/* Before/after micro-mockup — shows the value (a Google
                Shopping listing rewrite) instead of an abstract sparkle. */}
            <div className="exitpop__demo-label exitpop__demo-label--before">{t('before')}</div>
            <div className="exitpop__card exitpop__card--before">
              <div className="exitpop__card-img" />
              <div className="exitpop__card-body">
                <div className="exitpop__card-title exitpop__card-title--before">Masque running</div>
                <div className="exitpop__card-price">29,90 €</div>
              </div>
            </div>
            <div className="exitpop__demo-arrow" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
            <div className="exitpop__demo-label exitpop__demo-label--after">{t('after')}</div>
            <div className="exitpop__card exitpop__card--after">
              <div className="exitpop__card-img" />
              <div className="exitpop__card-body">
                <div className="exitpop__card-title">R-PUR Masque Running Anti-Pollution Filtre Nano-light Cycliste</div>
                <div className="exitpop__card-meta">
                  <span className="exitpop__card-price">29,90 €</span>
                  <span className="exitpop__card-stars">★★★★★ <em>(312)</em></span>
                </div>
              </div>
              <div className="exitpop__card-badge">+ {t('ctrBoost')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
