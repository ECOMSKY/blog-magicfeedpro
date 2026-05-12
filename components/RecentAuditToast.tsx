'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

/**
 * Bottom-right rolling social-proof toast — "Marc à Lyon a lancé un
 * audit il y a 12 minutes". Cycles through a small pool of localized
 * names + cities + relative times to make the conversion path feel
 * lived-in without claiming a specific identity.
 *
 * Implementation notes:
 *  - First show is delayed 8s after page load so it doesn't compete
 *    with the hero / first-paint.
 *  - Each toast stays 5s on screen, then a new one appears after a
 *    20-30s gap.
 *  - Auto-dismissable via the × button. Once dismissed in a session,
 *    no more toasts fire (sessionStorage flag).
 *  - Hidden if user opens the page with ?notoasts=1.
 */

type Name = { first: string; city: string };

const POOL_BY_LOCALE: Record<string, Name[]> = {
  en: [
    { first: 'Mark',    city: 'London'      }, { first: 'Sarah',   city: 'New York' },
    { first: 'James',   city: 'Manchester'  }, { first: 'Emily',   city: 'Toronto' },
    { first: 'David',   city: 'Sydney'      }, { first: 'Olivia',  city: 'Brighton' },
    { first: 'Daniel',  city: 'Dublin'      }, { first: 'Sophie',  city: 'Edinburgh' },
  ],
  fr: [
    { first: 'Thomas',  city: 'Paris'       }, { first: 'Camille', city: 'Lyon' },
    { first: 'Julien',  city: 'Marseille'   }, { first: 'Léa',     city: 'Bordeaux' },
    { first: 'Nicolas', city: 'Toulouse'    }, { first: 'Marie',   city: 'Nantes' },
    { first: 'Antoine', city: 'Lille'       }, { first: 'Sarah',   city: 'Strasbourg' },
  ],
  es: [
    { first: 'Carlos',  city: 'Madrid'      }, { first: 'Lucía',   city: 'Barcelona' },
    { first: 'Javier',  city: 'Valencia'    }, { first: 'María',   city: 'Sevilla' },
    { first: 'Pablo',   city: 'Bilbao'      }, { first: 'Sofía',   city: 'Málaga' },
  ],
  de: [
    { first: 'Lukas',   city: 'Berlin'      }, { first: 'Anna',    city: 'München' },
    { first: 'Maximilian', city: 'Hamburg'  }, { first: 'Lena',    city: 'Köln' },
    { first: 'Leon',    city: 'Frankfurt'   }, { first: 'Mia',     city: 'Düsseldorf' },
  ],
  it: [
    { first: 'Marco',   city: 'Milano'      }, { first: 'Giulia',  city: 'Roma' },
    { first: 'Lorenzo', city: 'Napoli'      }, { first: 'Sofia',   city: 'Torino' },
    { first: 'Davide',  city: 'Bologna'     }, { first: 'Chiara',  city: 'Firenze' },
  ],
  ja: [
    { first: '田中',     city: '東京'        }, { first: '佐藤',     city: '大阪' },
    { first: '鈴木',     city: '横浜'        }, { first: '山本',     city: '京都' },
  ],
  nl: [
    { first: 'Daan',    city: 'Amsterdam'   }, { first: 'Sophie',  city: 'Rotterdam' },
    { first: 'Lucas',   city: 'Utrecht'     }, { first: 'Emma',    city: 'Den Haag' },
  ],
  pl: [
    { first: 'Jakub',   city: 'Warszawa'    }, { first: 'Zuzanna', city: 'Kraków' },
    { first: 'Antoni',  city: 'Wrocław'     }, { first: 'Maja',    city: 'Poznań' },
  ],
  pt: [
    { first: 'João',    city: 'Lisboa'      }, { first: 'Beatriz', city: 'Porto' },
    { first: 'Miguel',  city: 'Braga'       }, { first: 'Mariana', city: 'Coimbra' },
  ],
  sv: [
    { first: 'Lucas',   city: 'Stockholm'   }, { first: 'Alma',    city: 'Göteborg' },
    { first: 'Liam',    city: 'Malmö'       }, { first: 'Wilma',   city: 'Uppsala' },
  ],
};

const TIME_TEMPLATES: Record<string, (n: number, unit: 'min' | 'h') => string> = {
  en: (n, u) => `${n} ${u === 'min' ? 'minute' : 'hour'}${n > 1 ? 's' : ''} ago`,
  fr: (n, u) => `il y a ${n} ${u === 'min' ? 'minute' : 'heure'}${n > 1 ? 's' : ''}`,
  es: (n, u) => `hace ${n} ${u === 'min' ? 'minuto' : 'hora'}${n > 1 ? 's' : ''}`,
  de: (n, u) => `vor ${n} ${u === 'min' ? 'Minute' : 'Stunde'}${n > 1 ? 'n' : ''}`,
  it: (n, u) => `${n} ${u === 'min' ? 'minuto' : 'ora'}${n > 1 ? (u === 'min' ? 'i' : 'e') : ''} fa`,
  ja: (n, u) => `${n}${u === 'min' ? '分' : '時間'}前`,
  nl: (n, u) => `${n} ${u === 'min' ? 'minuut' : 'uur'} geleden`,
  pl: (n, u) => `${n} ${u === 'min' ? 'minut' : 'godzin'} temu`,
  pt: (n, u) => `há ${n} ${u === 'min' ? 'minuto' : 'hora'}${n > 1 ? 's' : ''}`,
  sv: (n, u) => `för ${n} ${u === 'min' ? 'minut' : 'timme'}${n > 1 ? (u === 'min' ? 'er' : 'r') : ''} sedan`,
};

const SENTENCE_TEMPLATES: Record<string, (name: string, city: string, time: string) => string> = {
  en: (n, c, t) => `${n} from ${c} just ran a feed audit · ${t}`,
  fr: (n, c, t) => `${n} à ${c} vient de lancer un audit · ${t}`,
  es: (n, c, t) => `${n} de ${c} acaba de hacer una auditoría · ${t}`,
  de: (n, c, t) => `${n} aus ${c} hat gerade einen Audit gestartet · ${t}`,
  it: (n, c, t) => `${n} da ${c} ha appena avviato un audit · ${t}`,
  ja: (n, c, t) => `${c}の${n}さんが監査を実行 · ${t}`,
  nl: (n, c, t) => `${n} uit ${c} heeft net een audit uitgevoerd · ${t}`,
  pl: (n, c, t) => `${n} z ${c} właśnie uruchomił audyt · ${t}`,
  pt: (n, c, t) => `${n} de ${c} acabou de fazer uma auditoria · ${t}`,
  sv: (n, c, t) => `${n} från ${c} körde just en granskning · ${t}`,
};

const FIRST_DELAY_MS    = 8_000;
const ON_SCREEN_MS      = 6_000;
const MIN_GAP_MS        = 22_000;
const MAX_GAP_MS        = 38_000;
const SESSION_KILL_KEY  = 'mfp_recent_audit_toast_dismissed';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildLine(locale: string): string {
  const pool = POOL_BY_LOCALE[locale] || POOL_BY_LOCALE.en;
  const { first, city } = pickRandom(pool);
  // 70% chance: minutes (1-58), 30%: hours (1-12)
  const useMinutes = Math.random() < 0.7;
  const n = useMinutes ? 1 + Math.floor(Math.random() * 58) : 1 + Math.floor(Math.random() * 12);
  const tpl = TIME_TEMPLATES[locale] || TIME_TEMPLATES.en;
  const sentence = SENTENCE_TEMPLATES[locale] || SENTENCE_TEMPLATES.en;
  const time = tpl(n, useMinutes ? 'min' : 'h');
  return sentence(first, city, time);
}

export default function RecentAuditToast() {
  const locale = useLocale();
  const t = useTranslations('exitPopup'); // borrow the LP CTA wording for the link
  const [visible, setVisible] = useState(false);
  const [line, setLine] = useState('');
  const [killed, setKilled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('notoasts') === '1') return;
    try {
      if (sessionStorage.getItem(SESSION_KILL_KEY) === '1') {
        setKilled(true);
        return;
      }
    } catch {
      /* private mode — proceed */
    }

    let firstTimer: number;
    let cycleTimer: number;
    let hideTimer: number;

    const showOne = () => {
      setLine(buildLine(locale));
      setVisible(true);
      hideTimer = window.setTimeout(() => setVisible(false), ON_SCREEN_MS);
      const nextGap = MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS);
      cycleTimer = window.setTimeout(showOne, ON_SCREEN_MS + nextGap);
    };

    firstTimer = window.setTimeout(showOne, FIRST_DELAY_MS);

    return () => {
      window.clearTimeout(firstTimer);
      window.clearTimeout(cycleTimer);
      window.clearTimeout(hideTimer);
    };
  }, [locale]);

  const dismissForever = () => {
    try { sessionStorage.setItem(SESSION_KILL_KEY, '1'); } catch {}
    setKilled(true);
    setVisible(false);
  };

  if (killed) return null;

  return (
    <div
      className="recent-audit-toast"
      data-visible={visible ? 'true' : 'false'}
      role="status"
      aria-live="polite"
    >
      <span className="recent-audit-toast__pulse" aria-hidden="true" />
      <span className="recent-audit-toast__text">{line}</span>
      <a
        href={`https://lp.magicfeedpro.com/?utm_source=blog&utm_medium=social_proof_toast&lang=${locale}`}
        className="recent-audit-toast__cta"
        target="_blank"
        rel="noopener"
      >
        {t('cta')}
      </a>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismissForever}
        className="recent-audit-toast__close"
      >
        ×
      </button>
    </div>
  );
}
