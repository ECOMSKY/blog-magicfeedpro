import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { SITE_URL, SITE_NAME, organizationJsonLd, websiteJsonLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import './globals.css';

// DESIGN.md §3 — Inter Display drives body copy. We load it via
// next/font/google as `Inter` (the closest Google Fonts equivalent of
// Inter Display) at the weights DESIGN.md uses (400 for buttons, 500
// for body, 600/700 for emphasis).
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
        {/* DESIGN.md §3 — General Sans for headlines + UI logo. Served by
            Fontshare (no Google Fonts equivalent). Preconnect cuts the DNS
            cost; the 500-weight cut covers DESIGN.md's only headline weight. */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@500,600,700&display=swap"
        />
        {/* PNG favicon = exact 3-sparkle wordmark icon from
            magicfeedpro.com (Framer asset sf6Kn271r5TcW6blgTKJyWSbc.png).
            No SVG fallback — the old generic SVG was being preferred by
            some browsers, ignoring the brand PNG. Single source of truth. */}
        <link rel="icon" type="image/png" sizes="64x64" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="alternate" type="application/rss+xml" title="MagicFeedPro Blog RSS" href="/rss.xml" />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd(locale)} />
        <script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js"></script>
        {/* Google Analytics 4 (gtag.js). Hardcoded measurement ID; the
            inline init is a fixed string literal so there's no user
            input flowing into a script body. */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-T5BGZMG8NT" strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-T5BGZMG8NT');`}
        </Script>
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
