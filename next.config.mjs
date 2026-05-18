import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
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
    // 1) Load the auto-generated authoritative redirects FIRST. These
    //    map old EN slugs (under non-EN locales) to the slug actually
    //    on disk today. Each rename done by
    //    backend/scripts/relocalize_blog_slugs.py appends here.
    const out = [];
    const seen = new Set();
    try {
      const here = dirname(fileURLToPath(import.meta.url));
      const raw = readFileSync(join(here, 'data/legacy-slug-redirects.json'), 'utf8');
      const legacy = JSON.parse(raw);
      if (Array.isArray(legacy)) {
        for (const r of legacy) {
          if (r && r.source && r.destination && !seen.has(r.source)) {
            out.push({ ...r, permanent: r.permanent !== false });
            seen.add(r.source);
          }
        }
      }
    } catch (e) {
      // First-build or missing file: fine, manual map still applies.
    }

    // 2) Legacy hand-curated map (pre-2026-05-18). Only entries whose
    //    source isn't already covered by the JSON file above are kept,
    //    so stale destinations stop generating 404s on disk-renamed
    //    files. Safe to delete once every entry below has migrated into
    //    the JSON.
    const map = [
      ["7-reasons-google-shopping-ads-not-converting", {
        de: "7-grunde-warum-google-shopping-nicht-konvertiert",
        es: "7-razones-por-las-que-google-shopping-no-convierte",
        fr: "7-raisons-pour-lesquelles-google-shopping-ne-convertit-pas",
        it: "7-motivi-per-cui-google-shopping-non-converte",
        nl: "7-redenen-waarom-google-shopping-niet-converteert",
        pl: "7-powodow-dla-ktorych-google-shopping-nie-konwertuje",
        pt: "7-razoes-pelas-quais-o-google-shopping-nao-converte",
        sv: "7-anledningar-google-shopping-inte-konverterar",
      }],
      ["ai-rewrites-improve-google-shopping-ctr-40-percent", {
        de: "ki-rewrites-40-ctr-auf-google-shopping",
        es: "reescrituras-con-ia-40-de-ctr-en-google-shopping",
        fr: "reecriture-ia-40-de-ctr-sur-google-shopping",
        it: "riscritture-ai-40-di-ctr-su-google-shopping",
        nl: "ai-herschrijvingen-40-ctr-op-google-shopping",
        pl: "przepisanie-ai-40-ctr-w-google-shopping",
        pt: "reescritas-com-ia-40-de-ctr-no-google-shopping",
        sv: "ai-omskrivningar-40-ctr-i-google-shopping",
      }],
      ["custom-label-strategy-how-3-dtc-brands-scaled-to-8-figure-roas", {
        de: "custom-labels-3-dtc-marken-zu-8-stelligem-roas",
        es: "custom-labels-3-marcas-dtc-a-roas-de-8-cifras",
        fr: "custom-labels-3-marques-dtc-a-roas-8-chiffres",
        it: "custom-label-3-brand-dtc-a-roas-a-8-cifre",
        nl: "custom-labels-hoe-3-dtc-merken-8-cijferige-roas-halen",
        pl: "custom-labels-3-marki-dtc-z-8-cyfrowym-roas",
        pt: "custom-labels-3-marcas-dtc-com-roas-de-8-digitos",
        sv: "custom-labels-3-dtc-varumarken-med-8-siffrig-roas",
      }],
      ["google-shopping-bid-modifiers-vs-feed-segmentation-roi-test", {
        es: "pujas-vs-segmentacion-de-feed-test-roi-de-90-dias",
        fr: "encheres-vs-segmentation-de-flux-test-roi-90-jours",
        it: "offerte-vs-segmentazione-del-feed-test-roi-90-giorni",
        nl: "biedingen-vs-feed-segmentatie-90-daagse-roi-test",
        pt: "lances-vs-segmentacao-de-feed-teste-roi-de-90-dias",
      }],
      ["google-shopping-feed-optimization-2026-guide", {
        de: "google-shopping-feed-optimierung-leitfaden-2026",
        es: "feed-de-google-shopping-la-guia-completa-2026",
        fr: "flux-google-shopping-le-guide-complet-2026",
        it: "ottimizzazione-feed-google-shopping-guida-2026",
        nl: "google-shopping-feed-optimalisatie-gids-2026",
        pl: "optymalizacja-feedu-google-shopping-przewodnik-2026",
        pt: "otimizacao-do-feed-google-shopping-guia-2026",
        sv: "google-shopping-feed-optimering-guide-2026",
      }],
      ["google-shopping-quality-score-reverse-engineering-the-2026-feed-ranking-algorith", {
        de: "shopping-quality-score-reverse-engineering-2026",
        es: "quality-score-de-shopping-ingenieria-inversa-2026",
        fr: "quality-score-google-shopping-reverse-engineering-2026",
        it: "quality-score-shopping-reverse-engineering-2026",
        nl: "shopping-quality-score-reverse-engineering-2026",
        pl: "quality-score-shopping-inzynieria-wsteczna-2026",
        pt: "quality-score-do-shopping-engenharia-reversa-2026",
        sv: "shopping-quality-score-reverse-engineering-2026",
      }],
      ["merchant-center-errors-12-common-issues-solutions", {
        de: "merchant-center-fehler-die-12-haufigsten-probleme",
        es: "errores-de-merchant-center-los-12-mas-comunes",
        fr: "erreurs-merchant-center-les-12-plus-frequentes",
        it: "errori-merchant-center-i-12-piu-comuni-e-le-soluzioni",
        nl: "merchant-center-fouten-12-meest-voorkomende-oplossingen",
        pl: "bledy-merchant-center-12-najczestszych-problemow",
        pt: "erros-do-merchant-center-os-12-mais-comuns-e-solucoes",
        sv: "merchant-center-fel-de-12-vanligaste-och-losningar",
      }],
      ["multi-currency-feed-ops-scaling-google-shopping-to-12-markets", {
        de: "multi-wahrungs-feeds-google-shopping-in-12-markten",
        es: "feeds-multidivisa-google-shopping-en-12-mercados",
        fr: "flux-multi-devises-google-shopping-sur-12-marches",
        it: "feed-multi-valuta-google-shopping-su-12-mercati",
        nl: "multi-currency-feeds-google-shopping-in-12-markten",
        pl: "feedy-wielowalutowe-google-shopping-na-12-rynkach",
        pt: "feeds-multimoeda-google-shopping-em-12-mercados",
        sv: "multi-valuta-feeds-google-shopping-pa-12-marknader",
      }],
      ["performance-max-asset-groups-are-killing-your-feed-a-200k-audit-breakdown", {
        de: "performance-max-zerstort-ihren-feed-200k-audit",
        es: "performance-max-esta-matando-tu-feed-auditoria-200k",
        fr: "performance-max-detruit-votre-flux-audit-de-200k",
        it: "performance-max-distrugge-il-tuo-feed-audit-da-200k",
        nl: "performance-max-sloopt-je-feed-audit-van-200k",
        pl: "performance-max-niszczy-feed-audyt-za-200-tys-usd",
        pt: "performance-max-esta-matando-seu-feed-auditoria-200k",
        sv: "performance-max-forstor-din-feed-granskning-pa-200k",
      }],
      ["shopify-product-feed-google-shopping-setup", {
        de: "shopify-feed-fur-google-shopping-setup-2026",
        es: "feed-shopify-para-google-shopping-configuracion-2026",
        fr: "flux-shopify-pour-google-shopping-configuration-2026",
        it: "feed-shopify-per-google-shopping-configurazione-2026",
        nl: "shopify-productfeed-voor-google-shopping-setup-2026",
        pl: "feed-shopify-dla-google-shopping-konfiguracja-2026",
        pt: "feed-shopify-para-google-shopping-configuracao-2026",
        sv: "shopify-produktflode-for-google-shopping-setup-2026",
      }],
      ["zero-click-shopping-optimizing-feeds-for-google-s-product-knowledge-panel", {
        de: "zero-click-shopping-das-knowledge-panel-gewinnen",
        es: "shopping-sin-clic-gana-el-knowledge-panel-de-google",
        fr: "shopping-zero-clic-gagner-le-knowledge-panel-produit",
        it: "shopping-zero-click-vincere-il-knowledge-panel-google",
        nl: "zero-click-shopping-claim-google-s-knowledge-panel",
        pl: "zero-click-shopping-zdobadz-knowledge-panel-google",
        pt: "shopping-sem-clique-conquiste-o-knowledge-panel-google",
        sv: "nollklicks-shopping-vinn-googles-knowledge-panel",
      }],
      ["feed-attribute-arbitrage-how-condition-and-age-group-beat-bid-wars", {
        de: "google-shopping-cpcs-um-30-60-senken-3-feed-tricks",
        es: "reduce-tu-cpc-de-shopping-30-60-con-3-ajustes-de-feed",
        fr: "reduisez-vos-cpc-shopping-de-30-60-avec-3-attributs",
        it: "taglia-i-cpc-google-shopping-30-60-con-3-attributi-feed",
        nl: "verlaag-google-shopping-cpc-s-30-60-met-3-feed-aanpassingen",
        pl: "obniz-cpc-w-google-shopping-o-30-60-3-zmiany-w-feedzie",
        pt: "reduza-cpc-do-shopping-30-60-com-3-ajustes-no-feed",
        sv: "sank-google-shopping-cpc-30-60-med-3-flodesjusteringar",
      }],
      ["google-shopping-feed-refresh-cadence-the-6-hour-vs-24-hour-test", {
        de: "google-shopping-feed-6-stunden-vs-24-stunden-update",
        es: "feed-google-shopping-actualizacion-cada-6-vs-24-horas",
        fr: "frequence-de-mise-a-jour-du-flux-google-shopping-6h-vs-24h",
        it: "feed-google-shopping-frequenza-aggiornamento-6h-vs-24h",
        nl: "google-shopping-feed-update-frequentie-6-uurs-vs-24-uurs",
        pl: "czestotliwosc-aktualizacji-google-shopping-6h-vs-24h-test",
        pt: "feed-google-shopping-6h-vs-24h-impacto-no-cpc",
        sv: "google-shopping-flode-6h-vs-24h-uppdateringsfrekvens",
      }],
      ["gtin-exemption-requests-are-dead-the-2026-workaround-for-handmade-custom-goods", {
        de: "gtin-ausnahme-tot-2026-workaround-fur-individuelle-produkte",
        es: "exencion-gtin-muerta-solucion-2026-productos-custom",
        fr: "exemption-gtin-morte-solution-2026-produits-sur-mesure",
        it: "esenzione-gtin-morta-guida-2026-prodotti-custom",
        nl: "gtin-vrijstelling-dood-2026-oplossing-custom-producten",
        pl: "gtin-2026-jak-sprzedawac-produkty-custom-bez-kodow",
        pt: "isencao-gtin-morta-como-ajustar-produtos-em-2026",
        sv: "gtin-undantag-2026-sa-klarar-du-utan-falska-koder",
      }],
      ["shopping-feed-localization-the-18-ctr-lift-from-city-level-geo-terms", {
        de: "google-shopping-feed-lokalisierung-18-ctr-mit-stadten",
        es: "feed-google-shopping-local-18-ctr-con-terminos-ciudad",
        fr: "flux-shopping-google-18-ctr-avec-localisation-ville",
        it: "localizzazione-feed-google-shopping-18-ctr-con-citta",
        nl: "google-shopping-feed-lokalisering-18-ctr-winst-steden",
        pl: "feed-google-shopping-18-ctr-dzieki-lokalizacji-miejskiej",
        pt: "feed-google-shopping-local-18-ctr-com-termos-de-cidade",
        sv: "google-shopping-lokalisering-18-hogre-ctr-med-stadstermer",
      }],
      ["variant-clustering-in-shopping-feeds-stop-cannibalizing-your-own-ads", {
        de: "varianten-clustering-in-shopping-feeds-horen-sie-auf-ihre-eigenen-anzeigen-zu-ka",
        es: "agrupacion-de-variantes-en-feeds-de-shopping-deja-de-canibalizar-tus-propios-anu",
        fr: "regroupement-des-variantes-dans-les-flux-shopping-arretez-de-cannibaliser-vos-pr",
        it: "clustering-di-varianti-nei-feed-shopping-smetti-di-cannibalizzare-i-tuoi-stessi-",
        nl: "variant-clustering-in-shopping-feeds-stop-met-het-kannibaliseren-van-je-eigen-ad",
        pl: "grupowanie-wariantow-w-feedach-shopping-przestan-kanibalizowac-wlasne-reklamy",
        pt: "agrupamento-de-variantes-em-feeds-de-shopping-pare-de-canibalizar-seus-proprios-",
        sv: "variantklustring-i-shoppingfloden-sluta-kannibalisera-dina-egna-annonser",
      }],
    ];
    for (const [oldSlug, byLocale] of map) {
      for (const [locale, newSlug] of Object.entries(byLocale)) {
        const source = `/${locale}/posts/${oldSlug}`;
        if (seen.has(source)) continue;  // JSON above is authoritative
        out.push({ source, destination: `/${locale}/posts/${newSlug}`, permanent: true });
      }
    }
    return out;
  },
};

export default withNextIntl(nextConfig);
