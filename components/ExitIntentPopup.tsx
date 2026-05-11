'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

/**
 * Exit-intent popup — single-column offer card (DESIGN_AUDIT.md §1).
 *
 * Decisions:
 *   - Single column, max-width 460px. The exit moment is a binary
 *     decision — strip everything that isn't the offer + the action.
 *   - Charcoal CTA (matches the marketing-site primary button).
 *   - One close (×) + one decline link. No third dismiss surface.
 *   - No before/after demo — that re-explanation belongs on the LP.
 *   - Factual microcopy under the CTA (~60 s, no signup, no card).
 *     No fabricated dollar figure, no unverifiable "800+" social proof.
 *
 * Trigger: cursor leaves the top of the viewport (desktop), or
 * scroll-back after 10% page depth (mobile), or 25 s dwell. 7-day
 * dismissal cookie.
 */
const STORAGE_KEY = 'mfp_exit_popup_dismissed_at';
const SUPPRESS_DAYS = 7;
const SCROLL_THRESHOLD = 0.1;
const SCROLL_BACK_PX = 200;
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

    // ?testpopup=1 short-circuits both the dismissal cookie AND the
    // mouse/scroll trigger so the popup fires immediately. Useful for
    // visual QA and for sharing a preview link with the founder.
    if (url.searchParams.get('testpopup') === '1') {
      setOpen(true);
      return;
    }

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
          <p className="exitpop__meta">{t('meta')}</p>
          <button type="button" className="exitpop__skip" onClick={dismiss}>{t('decline')}</button>
        </div>
      </div>
    </div>
  );
}
