import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/lib/seo';

export default async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'footer' });
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__cols">
          <div>
            <div className="site-footer__brand-mark">
              <span aria-hidden="true" />
              MagicFeedPro
            </div>
            <p className="site-footer__about">{t('about')}</p>
          </div>
          <div className="site-footer__col">
            <div className="site-footer__col-title">{t('product')}</div>
            <ul>
              <li><a href="https://magicfeedpro.com/#features">Features</a></li>
              <li><a href="https://magicfeedpro.com/#pricing">Pricing</a></li>
              <li><a href="https://lp.magicfeedpro.com/">Free feed audit</a></li>
              <li><a href="https://magicfeedpro.com/">magicfeedpro.com</a></li>
            </ul>
          </div>
          <div className="site-footer__col">
            <div className="site-footer__col-title">{t('information')}</div>
            <ul>
              <li><Link href={localePath(locale, '/')}>Blog</Link></li>
              <li><Link href={localePath(locale, '/categories')}>Categories</Link></li>
              <li><Link href={localePath(locale, '/about')}>About</Link></li>
              <li><Link href={`/${locale === 'en' ? '' : locale + '/'}rss.xml`}>RSS</Link></li>
            </ul>
          </div>
          <div className="site-footer__col">
            <div className="site-footer__col-title">{t('legal')}</div>
            <ul>
              <li><a href="https://magicfeedpro.com/privacy">Privacy</a></li>
              <li><a href="https://magicfeedpro.com/terms">Terms</a></li>
              <li><a href="mailto:hello@magicfeedpro.com">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="site-footer__bottom">
          <div>© {year} MagicFeedPro. {t('rights')}</div>
          <div>blog.magicfeedpro.com</div>
        </div>
      </div>
    </footer>
  );
}
