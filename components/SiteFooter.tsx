import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/lib/seo';

// Mirrors the magicfeedpro.com footer column structure: a brand block
// followed by Product / Information / Legal. Link labels match the
// marketing site so users moving between blog and marketing don't see
// inconsistent IA.

const MARKETING = 'https://magicfeedpro.com';

export default async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'footer' }).catch(
    () => null,
  );
  const labels = {
    about:       t?.('about') ?? 'AI-powered Google Shopping feed optimization for stores that want fewer disapprovals, better CTR, and more revenue per click.',
    product:     t?.('product') ?? 'Product',
    information: t?.('information') ?? 'Information',
    legal:       t?.('legal') ?? 'Legal',
    rights:      t?.('rights') ?? 'All rights reserved.',
  };
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__cols">
          {/* Brand — same wordmark as the header so the visual identity
              stays consistent end-to-end. */}
          <div>
            <div className="site-footer__brand-mark">
              <Image
                src="/logo-magicfeedpro.png"
                alt="MagicFeed Pro"
                width={1000}
                height={300}
                sizes="160px"
                style={{ height: 40, width: 'auto' }}
              />
            </div>
            <p className="site-footer__about">{labels.about}</p>
          </div>

          {/* Product */}
          <div className="site-footer__col">
            <div className="site-footer__col-title">{labels.product}</div>
            <ul>
              <li><a href={`${MARKETING}/#features`}>Features</a></li>
              <li><a href={`${MARKETING}/#how-it-works`}>How it works</a></li>
              <li><a href={`${MARKETING}/#results`}>Results</a></li>
              <li><a href={`${MARKETING}/#pricing`}>Pricing</a></li>
              <li><a href="https://lp.magicfeedpro.com/">Free feed audit</a></li>
            </ul>
          </div>

          {/* Information — mirrors marketing site exactly */}
          <div className="site-footer__col">
            <div className="site-footer__col-title">{labels.information}</div>
            <ul>
              <li><a href={`${MARKETING}/about`}>About</a></li>
              <li><Link href={localePath(locale, '/')}>Blog</Link></li>
              <li><a href={`${MARKETING}/contact`}>Contact</a></li>
              <li><Link href={`/${locale === 'en' ? '' : locale + '/'}rss.xml`}>RSS</Link></li>
            </ul>
          </div>

          {/* Legal — mirrors marketing site exactly */}
          <div className="site-footer__col">
            <div className="site-footer__col-title">{labels.legal}</div>
            <ul>
              <li><a href={`${MARKETING}/terms`}>Terms of Service</a></li>
              <li><a href={`${MARKETING}/privacy`}>Privacy Policy</a></li>
              <li><a href={`${MARKETING}/cookies`}>Cookies</a></li>
              <li><a href={`${MARKETING}/refund-policy`}>Refund policy</a></li>
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <div>© {year} Magicfeedpro. {labels.rights}</div>
          <div>blog.magicfeedpro.com</div>
        </div>
      </div>
    </footer>
  );
}
