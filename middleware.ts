import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: true
});

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|pagefind|sitemap.xml|sitemap-.*\\.xml|robots.txt|llms.txt|rss.xml|covers|favicon|.*\\..*).*)'
  ]
};
