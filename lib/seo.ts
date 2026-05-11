import type { Locale } from '@/i18n/config';
import { locales, defaultLocale } from '@/i18n/config';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.magicfeedpro.com';
export const SITE_NAME = 'MagicFeedPro Blog';
export const ORG_NAME = 'MagicFeedPro';
export const ORG_URL = 'https://magicfeedpro.com';
export const ORG_LOGO = `${ORG_URL}/logo.png`;

export function localePath(locale: Locale, pathname = ''): string {
  const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (locale === defaultLocale) return clean || '/';
  return `/${locale}${clean === '/' ? '' : clean}`;
}

export function absoluteUrl(locale: Locale, pathname = ''): string {
  return `${SITE_URL}${localePath(locale, pathname)}`;
}

export function hreflangCluster(translations: Partial<Record<Locale, string | undefined>>) {
  // translations map locale -> pathname (without locale prefix)
  const out: { hrefLang: string; href: string }[] = [];
  for (const locale of locales) {
    const p = translations[locale];
    if (p !== undefined) {
      out.push({ hrefLang: locale, href: absoluteUrl(locale, p) });
    }
  }
  // x-default points to English version
  if (translations[defaultLocale] !== undefined) {
    out.push({ hrefLang: 'x-default', href: absoluteUrl(defaultLocale, translations[defaultLocale]!) });
  }
  return out;
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${ORG_URL}/#org`,
    name: ORG_NAME,
    url: ORG_URL,
    logo: ORG_LOGO,
    sameAs: ['https://twitter.com/magicfeedpro']
  };
}

export function websiteJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${absoluteUrl(locale, '/')}#website`,
    name: SITE_NAME,
    url: absoluteUrl(locale, '/'),
    inLanguage: locale,
    publisher: { '@id': `${ORG_URL}/#org` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${absoluteUrl(locale, '/search')}?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url
    }))
  };
}
