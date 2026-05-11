import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { locales, localeNames, defaultLocale } from '@/i18n/config';
import { localePath } from '@/lib/seo';

export default async function SiteHeader({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'nav' });

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href={localePath(locale, '/')} className="site-header__logo" aria-label="MagicFeedPro Blog">
          <span className="site-header__logo-mark">M</span>
          <span>MagicFeedPro</span>
        </Link>
        <nav className="site-header__nav" aria-label="Primary">
          <Link href={localePath(locale, '/')}>{t('blog')}</Link>
          <Link href={localePath(locale, '/categories')}>{t('categories')}</Link>
          <Link href={localePath(locale, '/about')}>{t('about')}</Link>
        </nav>
        <div className="site-header__right">
          <LangSwitcher current={locale} />
          <a className="btn btn--primary btn--sm" href="https://magicfeedpro.com/" rel="noopener">
            {t('cta')}
          </a>
        </div>
      </div>
    </header>
  );
}

function LangSwitcher({ current }: { current: Locale }) {
  // Cycle through locales for simplicity (a real picker would be a popover).
  const order: Locale[] = [...locales];
  const idx = order.indexOf(current);
  const next = order[(idx + 1) % order.length];
  return (
    <Link
      className="site-header__lang"
      href={next === defaultLocale ? '/' : `/${next}`}
      aria-label={`Switch language to ${localeNames[next]}`}
      title={localeNames[next]}
    >
      {current.toUpperCase()} → {next.toUpperCase()}
    </Link>
  );
}
