import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: '**' }]
  },
  // Ensure MDX content + author/category JSON travels into the serverless bundles.
  outputFileTracingIncludes: {
    '/[locale]/posts/[slug]': ['./content/**/*'],
    '/[locale]/category/[slug]': ['./content/**/*'],
    '/[locale]/categories': ['./content/**/*'],
    '/[locale]/author/[slug]': ['./content/**/*'],
    '/[locale]/search': ['./content/**/*'],
    '/[locale]': ['./content/**/*'],
    '/sitemap.xml': ['./content/**/*'],
    '/llms.txt': ['./content/**/*'],
    '/rss.xml': ['./content/**/*'],
    '/fr/rss.xml': ['./content/**/*'],
    '/es/rss.xml': ['./content/**/*']
  },
  experimental: {
    mdxRs: false
  },
  // 301-redirect the old English slugs we shipped on non-English locales
  // to the new SEO-localized slugs. Pre-existing inbound links + previously
  // indexed pages keep working without losing PageRank.
  async redirects() {
    const map = [
      ['7-reasons-google-shopping-ads-not-converting', {
        fr: '7-raisons-annonces-google-shopping-ne-convertissent-pas',
        es: '7-razones-anuncios-google-shopping-no-convierten',
        de: '7-gruende-google-shopping-anzeigen-konvertieren-nicht',
        it: '7-motivi-annunci-google-shopping-non-convertono',
        nl: '7-redenen-google-shopping-advertenties-niet-converteren',
        pl: '7-powodow-reklamy-google-shopping-nie-konwertuja',
        pt: '7-razoes-anuncios-google-shopping-nao-convertem',
        sv: '7-anledningar-google-shopping-annonser-konverterar-inte',
      }],
      ['ai-rewrites-improve-google-shopping-ctr-40-percent', {
        fr: 'reecritures-ia-ameliorer-ctr-google-shopping-40-pourcent',
        es: 'reescrituras-ia-mejorar-ctr-google-shopping-40-por-ciento',
        de: 'ki-umschreibungen-google-shopping-ctr-40-prozent',
        it: 'riscrittura-ai-migliorare-ctr-google-shopping-40-percento',
        nl: 'ai-herschrijvingen-google-shopping-ctr-40-procent',
        pl: 'przepisania-ai-poprawiaja-ctr-google-shopping-40-procent',
        pt: 'reescritas-ia-melhorar-ctr-google-shopping-40-por-cento',
        sv: 'ai-omskrivningar-forbattra-google-shopping-ctr-40-procent',
      }],
      ['google-shopping-feed-optimization-2026-guide', {
        fr: 'optimisation-flux-google-shopping-guide-complet-2026',
        es: 'optimizacion-feed-google-shopping-guia-completa-2026',
        de: 'google-shopping-feed-optimierung-leitfaden-2026',
        it: 'ottimizzazione-feed-google-shopping-guida-completa-2026',
        nl: 'google-shopping-feed-optimalisatie-gids-2026',
        pl: 'optymalizacja-feedu-google-shopping-przewodnik-2026',
        pt: 'otimizacao-feed-google-shopping-guia-completo-2026',
        sv: 'google-shopping-feed-optimering-guide-2026',
      }],
      ['merchant-center-errors-12-common-issues-solutions', {
        fr: 'erreurs-merchant-center-12-problemes-courants-solutions',
        es: 'errores-merchant-center-12-problemas-comunes-soluciones',
        de: 'merchant-center-fehler-12-haeufige-probleme-loesungen',
        it: 'errori-merchant-center-12-problemi-comuni-soluzioni',
        nl: 'merchant-center-fouten-12-veelvoorkomende-problemen-oplossingen',
        pl: 'bledy-merchant-center-12-czestych-problemow-rozwiazania',
        pt: 'erros-merchant-center-12-problemas-comuns-solucoes',
        sv: 'merchant-center-fel-12-vanliga-problem-losningar',
      }],
      ['shopify-product-feed-google-shopping-setup', {
        fr: 'flux-produit-shopify-google-shopping-configuration',
        es: 'feed-productos-shopify-google-shopping-configuracion',
        de: 'shopify-produkt-feed-google-shopping-einrichtung',
        it: 'feed-prodotti-shopify-google-shopping-configurazione',
        nl: 'shopify-product-feed-google-shopping-instellen',
        pl: 'feed-produktow-shopify-google-shopping-konfiguracja',
        pt: 'feed-produtos-shopify-google-shopping-configuracao',
        sv: 'shopify-produktfeed-google-shopping-konfiguration',
      }],
    ];
    const out = [];
    for (const [oldSlug, byLocale] of map) {
      for (const [locale, newSlug] of Object.entries(byLocale)) {
        out.push({
          source: `/${locale}/posts/${oldSlug}`,
          destination: `/${locale}/posts/${newSlug}`,
          permanent: true,
        });
      }
    }
    return out;
  },
};

export default withNextIntl(nextConfig);
