import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/config';
import { locales } from '@/i18n/config';
import { absoluteUrl, localePath } from '@/lib/seo';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeRaw } = await params;
  const locale = localeRaw as Locale;
  const t = await getTranslations({ locale, namespace: 'seo' });
  const title = t('aboutTitle');
  const description = t('aboutDescription');
  return {
    title,
    description,
    alternates: { canonical: localePath(locale, '/about') },
    openGraph: {
      title,
      description,
      url: absoluteUrl(locale, '/about')
    }
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="container section">
      <article className="prose" style={{ maxWidth: 760, margin: '0 auto' }}>
        <span className="eyebrow">About</span>
        <h1>The MagicFeedPro Blog</h1>
        <p>
          MagicFeedPro is a feed optimization platform that uses AI to rewrite product titles,
          descriptions, and attributes so they match how real shoppers search on Google Shopping.
          This blog is where we share what we learn — practical playbooks, deep dives on Merchant
          Center policies, and case studies from real e-commerce stores.
        </p>
        <h2>What you'll find here</h2>
        <ul>
          <li>Step-by-step feed optimization guides for Shopify, WooCommerce, and custom stores</li>
          <li>Deep dives on Google Shopping ranking factors and Merchant Center rules</li>
          <li>Case studies showing the exact before/after CTR and conversion lift from feed rewrites</li>
          <li>Listicles on the most common feed errors and how to fix them</li>
        </ul>
        <h2>Who writes it</h2>
        <p>
          The MagicFeedPro team — a small group of e-commerce and paid-search practitioners who
          have spent the last decade running Google Shopping campaigns at scale. Every article is
          written by someone who has shipped the technique to a real store, not pulled from a
          generic AI prompt.
        </p>
        <h2>How to contribute</h2>
        <p>
          Have a topic you'd like us to cover? Email{' '}
          <a href="mailto:hello@magicfeedpro.com">hello@magicfeedpro.com</a>.
        </p>
      </article>
    </div>
  );
}
