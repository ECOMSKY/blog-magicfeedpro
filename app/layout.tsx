import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { SITE_URL, SITE_NAME, organizationJsonLd, websiteJsonLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Google Shopping & feed optimization`,
    template: `%s | ${SITE_NAME}`
  },
  description:
    'Practical guides on Google Shopping feed optimization, e-commerce SEO, and conversion.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: SITE_URL
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = (await getLocale()) as Locale;
  const messages = await getMessages();
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || 'blog.magicfeedpro.com';

  return (
    <html lang={locale} className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate" type="application/rss+xml" title="MagicFeedPro Blog RSS" href="/rss.xml" />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd(locale)} />
        <script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js"></script>
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <a href="#main" className="skip-link">Skip to content</a>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
