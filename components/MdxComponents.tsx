/* MDX-allowed components */
import React from 'react';

export function Callout({
  type = 'info',
  title,
  children
}: {
  type?: 'tip' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`callout callout--${type}`}>
      {title && <div className="callout__title">{title}</div>}
      <div>{children}</div>
    </div>
  );
}

export function ImageCaption({
  src,
  alt,
  caption
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure style={{ margin: 'var(--s-12) 0' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={{ borderRadius: 'var(--r-lg)' }} />
      {caption && (
        <figcaption style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 'var(--s-3)', textAlign: 'center' }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Static per-locale ProductCTA copy. Kept inline so the component can
 * stay sync (MDXRemote / RSC trees would still accept an async version,
 * but server-side getTranslations() requires the locale to be propagated
 * via cookies/headers — fragile here). One source of truth, LP-aligned.
 */
type ProductCTAVariant = 'audit' | 'trial';
type ProductCTALocale = 'en' | 'fr' | 'es' | 'de' | 'it' | 'ja' | 'nl' | 'pl' | 'pt' | 'sv';

const PRODUCT_CTA_COPY: Record<ProductCTAVariant, Record<ProductCTALocale, { title: string; lead: string; cta: string }>> = {
  audit: {
    en: { title: "See what's costing you Shopping clicks.", lead: "Our AI scores every product in your Google Shopping feed against 7 quality criteria — titles, descriptions, GTIN, highlights and more. You walk away with a 0–100 Feed Quality Score and the exact AI rewrites that lift each one. Free, 30 seconds, no signup.", cta: 'Run my free audit →' },
    fr: { title: 'Voyez ce qui sabote vos clics Shopping.', lead: "Notre IA note chaque produit de votre flux Google Shopping selon 7 critères — titres, descriptions, GTIN, points forts et plus. Vous repartez avec un score qualité de 0 à 100 + les réécritures IA exactes pour faire monter chaque score. Gratuit, 30 secondes, sans inscription.", cta: 'Lancer mon audit gratuit →' },
    es: { title: 'Descubre qué sabotea tus clics de Shopping.', lead: "Nuestra IA puntúa cada producto de tu feed Google Shopping según 7 criterios — títulos, descripciones, GTIN, destacados y más. Obtienes una puntuación de 0 a 100 + las reescrituras IA exactas. Gratis, 30 segundos, sin registro.", cta: 'Iniciar mi auditoría gratis →' },
    de: { title: 'Sehen Sie, was Ihre Shopping-Klicks sabotiert.', lead: "Unsere KI bewertet jedes Produkt nach 7 Google Shopping-Kriterien — Titel, Beschreibungen, GTIN, Highlights und mehr. Sie erhalten einen Score von 0 bis 100 + die genauen KI-Umschreibungen. Kostenlos, 30 Sekunden, keine Anmeldung.", cta: 'Kostenlosen Audit starten →' },
    it: { title: 'Scopri cosa frena i tuoi click Shopping.', lead: "La nostra IA valuta ogni prodotto secondo 7 criteri Google Shopping — titoli, descrizioni, GTIN, punti di forza e altro. Ottieni un punteggio da 0 a 100 + le riscritture IA esatte. Gratis, 30 secondi, senza registrazione.", cta: 'Avvia audit gratuito →' },
    ja: { title: 'Shoppingクリックを妨げている原因を発見。', lead: "当社のAIが7つのGoogle Shopping基準で各商品を評価 — タイトル、説明、GTIN、ハイライトなど。0〜100スコア + 正確なAI書き換えを取得。無料、30秒、登録不要。", cta: '無料監査を開始 →' },
    nl: { title: 'Zie wat je Shopping-clicks saboteert.', lead: "Onze AI beoordeelt elk product op 7 Google Shopping-criteria — titels, beschrijvingen, GTIN, kenmerken en meer. Je krijgt een score van 0 tot 100 + de exacte AI-herschrijvingen. Gratis, 30 seconden, geen registratie.", cta: 'Start gratis audit →' },
    pl: { title: 'Zobacz, co sabotuje twoje kliknięcia Shopping.', lead: "Nasza AI ocenia każdy produkt według 7 kryteriów Google Shopping — tytuły, opisy, GTIN, wyróżniki i więcej. Otrzymujesz wynik od 0 do 100 + konkretne przepisania AI. Bezpłatnie, 30 sekund, bez rejestracji.", cta: 'Rozpocznij bezpłatny audyt →' },
    pt: { title: 'Veja o que sabota seus cliques no Shopping.', lead: "Nossa IA avalia cada produto segundo 7 critérios do Google Shopping — títulos, descrições, GTIN, destaques e mais. Você recebe uma pontuação de 0 a 100 + as reescritas IA exatas. Grátis, 30 segundos, sem cadastro.", cta: 'Iniciar auditoria grátis →' },
    sv: { title: 'Se vad som saboterar dina Shopping-klick.', lead: "Vår AI betygsätter varje produkt enligt 7 Google Shopping-kriterier — titlar, beskrivningar, GTIN, höjdpunkter och mer. Du får ett poäng från 0 till 100 + de exakta AI-omskrivningarna. Gratis, 30 sekunder, ingen registrering.", cta: 'Starta gratis granskning →' },
  },
  trial: {
    en: { title: 'Try MagicFeedPro free for 7 days.', lead: 'Generate AI-rewritten product feeds for Google Shopping in minutes. No credit card up front. Cancel anytime.', cta: 'Start free trial →' },
    fr: { title: 'Testez MagicFeedPro gratuitement 7 jours.', lead: "Générez des flux produits réécrits par IA pour Google Shopping en quelques minutes. Sans CB. Annulation à tout moment.", cta: 'Démarrer l’essai gratuit →' },
    es: { title: 'Prueba MagicFeedPro gratis 7 días.', lead: 'Genera feeds de productos reescritos por IA para Google Shopping en minutos. Sin tarjeta. Cancela cuando quieras.', cta: 'Iniciar prueba gratuita →' },
    de: { title: 'Testen Sie MagicFeedPro 7 Tage kostenlos.', lead: 'Generieren Sie KI-umgeschriebene Produkt-Feeds in Minuten. Keine Kreditkarte. Jederzeit kündbar.', cta: 'Kostenlose Testversion starten →' },
    it: { title: 'Prova MagicFeedPro gratis 7 giorni.', lead: 'Genera feed prodotti riscritti dall’IA per Google Shopping in minuti. Senza carta. Annulli quando vuoi.', cta: 'Inizia la prova gratuita →' },
    ja: { title: 'MagicFeedProを7日間無料でお試し。', lead: 'Google Shopping用のAI書き換え商品フィードを数分で生成。クレジットカード不要。いつでもキャンセル可能。', cta: '無料トライアルを開始 →' },
    nl: { title: 'Probeer MagicFeedPro 7 dagen gratis.', lead: 'Genereer AI-herschreven productfeeds voor Google Shopping in minuten. Geen creditcard. Op elk moment opzegbaar.', cta: 'Start gratis proefperiode →' },
    pl: { title: 'Wypróbuj MagicFeedPro za darmo przez 7 dni.', lead: 'Generuj przepisane przez AI feedy produktów do Google Shopping w kilka minut. Bez karty. Anuluj w każdej chwili.', cta: 'Rozpocznij bezpłatny okres próbny →' },
    pt: { title: 'Experimente MagicFeedPro grátis por 7 dias.', lead: 'Gere feeds de produtos reescritos por IA para Google Shopping em minutos. Sem cartão. Cancele quando quiser.', cta: 'Iniciar avaliação gratuita →' },
    sv: { title: 'Prova MagicFeedPro gratis i 7 dagar.', lead: 'Generera AI-omskrivna produktfeeds för Google Shopping på minuter. Inget kort. Avbryt när som helst.', cta: 'Starta gratis provperiod →' },
  },
};

export function makeProductCTA(locale: ProductCTALocale) {
  return function ProductCTA({
    variant = 'audit',
    title,
    children,
  }: {
    variant?: ProductCTAVariant;
    title?: string;
    children?: React.ReactNode;
  }) {
    const href = variant === 'audit' ? 'https://lp.magicfeedpro.com/' : 'https://magicfeedpro.com/';
    const copy =
      PRODUCT_CTA_COPY[variant]?.[locale] ?? PRODUCT_CTA_COPY[variant].en;
    return (
      <div className="product-cta" role="complementary">
        <div className="product-cta__title">{title || copy.title}</div>
        <div className="product-cta__lead">{children || copy.lead}</div>
        <a className="btn btn--primary btn--lg" href={href} rel="noopener">
          {copy.cta}
        </a>
      </div>
    );
  };
}

/** Back-compat: a locale-less ProductCTA falls back to English. */
export function ProductCTA(props: {
  variant?: ProductCTAVariant;
  title?: string;
  children?: React.ReactNode;
}) {
  const Component = makeProductCTA('en');
  return <Component {...props} />;
}

/**
 * FAQ container for MDX.
 *
 * Two usage patterns:
 *   1. <FAQ items={[{q,a}]} />      — object-prop form
 *   2. <FAQ>                         — children form (preferred under
 *        <FAQItem q="..." a="..." />     next-mdx-remote/rsc, which can lose
 *        ...                             complex JSX expression props)
 *      </FAQ>
 *
 * Both patterns emit the same DOM and emit FAQPage JSON-LD via the page's
 * schema layer.
 */
export function FAQ({
  items,
  children
}: {
  items?: { q: string; a: string }[];
  children?: React.ReactNode;
}) {
  const safe = Array.isArray(items) ? items : [];
  return (
    <section className="faq" aria-label="Frequently asked questions">
      {safe.map((it, i) => (
        <div className="faq__item" key={i}>
          <div className="faq__q">{it.q}</div>
          <div className="faq__a">{it.a}</div>
        </div>
      ))}
      {children}
    </section>
  );
}

export function FAQItem({ q, a, children }: { q: string; a?: string; children?: React.ReactNode }) {
  return (
    <div className="faq__item">
      <div className="faq__q">{q}</div>
      <div className="faq__a">{a ?? children}</div>
    </div>
  );
}

export const mdxComponents = {
  Callout,
  ImageCaption,
  ProductCTA,
  FAQ,
  FAQItem
};
