import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import MetaPixel from '@/components/MetaPixel';
import GoogleAds from '@/components/GoogleAds';
import { locales, type Locale } from '@/i18n/config';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(locales as readonly string[]).includes(locale)) notFound();
  setRequestLocale(locale);

  return (
    <>
      <MetaPixel />
      <GoogleAds />
      <SiteHeader locale={locale as Locale} />
      <main id="main">{children}</main>
      <SiteFooter locale={locale as Locale} />
    </>
  );
}
