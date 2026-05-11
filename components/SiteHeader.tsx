import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { locales, localeNames, defaultLocale } from '@/i18n/config';
import { localePath } from '@/lib/seo';

// Mirrors the magicfeedpro.com marketing header — same nav order, same CTA
// pair (Login + Get Started For Free), same logo treatment. Cross-domain
// links point at the marketing site so the header behaves as a single
// continuous navigation regardless of which subdomain the user is on.

const MARKETING = 'https://magicfeedpro.com';
const APP = 'https://app.magicfeedpro.com';

const NAV = [
  { href: `${MARKETING}/#features`,     key: 'features' },
  { href: `${MARKETING}/#how-it-works`, key: 'howItWorks' },
  { href: `${MARKETING}/#results`,      key: 'results' },
  { href: `${MARKETING}/#pricing`,      key: 'pricing' },
];

export default async function SiteHeader({ locale }: { locale: Locale }) {
  // Translations remain optional — the marketing site is English-only so
  // we hard-code the English labels and fall back if a translation file
  // for that locale exists.
  const t = await getTranslations({ locale, namespace: 'nav' }).catch(() => null);
  const labels = {
    features:   t?.('features')   ?? 'Features',
    howItWorks: t?.('howItWorks') ?? 'How it works',
    results:    t?.('results')    ?? 'Results',
    pricing:    t?.('pricing')    ?? 'Pricing',
    blog:       t?.('blog')       ?? 'Blog',
    login:      t?.('login')      ?? 'Login',
    cta:        t?.('cta')        ?? 'Get Started For Free',
  };

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link
          href={localePath(locale, '/')}
          className="site-header__logo"
          aria-label="MagicFeed Pro Blog"
        >
          {/* Real wordmark sourced from magicfeedpro.com so the blog header
              is visually identical to the marketing site. Native 1000×300
              aspect ratio — we render at 36px tall (12:1 ratio = 144px wide). */}
          <Image
            src="/logo-magicfeedpro.png"
            alt="MagicFeed Pro"
            width={1000}
            height={300}
            priority
            sizes="187px"
            /* Same rendered size as the marketing site (~187px wide, ~56px
               tall on desktop — the 1000×300 native aspect ratio gives
               that exact height when width is 187). */
            style={{ height: 56, width: 'auto' }}
          />
        </Link>

        <nav className="site-header__nav" aria-label="Primary">
          {NAV.map((item) => (
            <a key={item.key} href={item.href}>
              {labels[item.key as keyof typeof labels]}
            </a>
          ))}
          {/* "Blog" is the user's current location — link to the locale home */}
          <Link href={localePath(locale, '/')} aria-current="page">
            {labels.blog}
          </Link>
        </nav>

        <div className="site-header__right">
          <FlagLangSwitcher current={locale} />
          <a
            href={`${APP}/login`}
            rel="noopener"
            className="site-header__login"
          >
            {labels.login}
          </a>
          <a
            href={`${APP}/register`}
            rel="noopener"
            className="btn btn--primary btn--sm"
          >
            {labels.cta}
          </a>
        </div>
      </div>
    </header>
  );
}

// Flag-based language switcher. CSS-only popover (uses :focus-within +
// :hover) so the menu works without any client JS. Uses the regional
// flags people associate with each locale: en→🇺🇸, fr→🇫🇷, es→🇪🇸.
// The button shows the *current* flag; the popover lets you jump to any
// other locale directly (no more "cycle to the next one" surprise).
const LOCALE_FLAGS: Record<Locale, { flag: string; label: string }> = {
  en: { flag: '🇺🇸', label: 'English' },
  es: { flag: '🇪🇸', label: 'Español' },
  fr: { flag: '🇫🇷', label: 'Français' },
  de: { flag: '🇩🇪', label: 'Deutsch' },
  it: { flag: '🇮🇹', label: 'Italiano' },
  pt: { flag: '🇵🇹', label: 'Português' },
  nl: { flag: '🇳🇱', label: 'Nederlands' },
  pl: { flag: '🇵🇱', label: 'Polski' },
  sv: { flag: '🇸🇪', label: 'Svenska' },
  ja: { flag: '🇯🇵', label: '日本語' },
};

function localeHomePath(loc: Locale): string {
  return loc === defaultLocale ? '/' : `/${loc}`;
}

function FlagLangSwitcher({ current }: { current: Locale }) {
  const meta = LOCALE_FLAGS[current] ?? LOCALE_FLAGS.en;
  return (
    <div className="lang-switcher" tabIndex={0} aria-label="Language">
      <button
        type="button"
        className="lang-switcher__current"
        aria-haspopup="menu"
        aria-label={`Language: ${meta.label}`}
      >
        <span className="lang-switcher__flag" aria-hidden="true">{meta.flag}</span>
        <span className="lang-switcher__code">{current.toUpperCase()}</span>
        <span className="lang-switcher__caret" aria-hidden="true">▾</span>
      </button>
      <ul className="lang-switcher__menu" role="menu">
        {([...locales] as Locale[]).map((loc) => {
          const m = LOCALE_FLAGS[loc] ?? { flag: '🌐', label: localeNames[loc] };
          const isActive = loc === current;
          return (
            <li key={loc} role="none">
              <Link
                role="menuitem"
                href={localeHomePath(loc)}
                className={`lang-switcher__option${isActive ? ' lang-switcher__option--active' : ''}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="lang-switcher__flag" aria-hidden="true">{m.flag}</span>
                <span>{m.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
