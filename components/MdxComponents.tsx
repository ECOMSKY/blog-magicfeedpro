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
    en: { title: "What's your Google Shopping feed score?", lead: "Free AI audit. We score every product on 3 factors — Title, Description, Product Highlights — and ship the exact fixes that boost ranking. Most stores lose 30–50% of Shopping traffic because their feed isn't optimized.", cta: 'Get my feed score →' },
    fr: { title: "Quel est le score de votre flux Google Shopping ?", lead: "Audit IA gratuit. On note chaque produit sur 3 facteurs — Titre, Description, Points forts produit — et on livre les correctifs exacts qui boostent le classement. La plupart des boutiques perdent 30 à 50 % de leur trafic Shopping parce que leur flux n'est pas optimisé.", cta: 'Obtenir mon score →' },
    es: { title: "¿Cuál es la puntuación de tu feed Google Shopping?", lead: "Auditoría IA gratuita. Puntuamos cada producto en 3 factores — Título, Descripción, Puntos destacados — y entregamos las correcciones exactas que mejoran el ranking. La mayoría de las tiendas pierde 30–50 % del tráfico Shopping porque su feed no está optimizado.", cta: 'Obtener mi puntuación →' },
    de: { title: "Wie ist Ihr Google Shopping Feed-Score?", lead: "Kostenloser KI-Audit. Wir bewerten jedes Produkt anhand von 3 Faktoren — Titel, Beschreibung, Produkt-Highlights — und liefern die exakten Korrekturen, die das Ranking verbessern. Die meisten Shops verlieren 30–50 % ihres Shopping-Traffics, weil ihr Feed nicht optimiert ist.", cta: 'Feed-Score abrufen →' },
    it: { title: "Qual è il punteggio del tuo feed Google Shopping?", lead: "Audit IA gratuito. Valutiamo ogni prodotto su 3 fattori — Titolo, Descrizione, Punti di forza — e inviamo le correzioni esatte che migliorano il ranking. La maggior parte degli store perde 30–50 % del traffico Shopping perché il feed non è ottimizzato.", cta: 'Ottieni il mio punteggio →' },
    ja: { title: "あなたのGoogle Shoppingフィードスコアは?", lead: "無料AI監査。3つの要素 — タイトル、説明、商品ハイライト — で各商品を採点し、ランキングを向上させる正確な修正を提供します。ほとんどのストアはフィードが最適化されていないため、Shoppingトラフィックの30〜50%を失っています。", cta: 'スコアを取得 →' },
    nl: { title: "Wat is je Google Shopping feedscore?", lead: "Gratis AI-audit. We beoordelen elk product op 3 factoren — Titel, Beschrijving, Productkenmerken — en leveren de exacte verbeteringen die de ranking verhogen. De meeste shops verliezen 30–50% van hun Shopping-verkeer omdat hun feed niet geoptimaliseerd is.", cta: 'Mijn score ophalen →' },
    pl: { title: "Jaki jest wynik twojego feedu Google Shopping?", lead: "Bezpłatny audyt AI. Oceniamy każdy produkt w oparciu o 3 czynniki — Tytuł, Opis, Wyróżniki produktu — i dostarczamy konkretne poprawki poprawiające ranking. Większość sklepów traci 30–50% ruchu Shopping, ponieważ ich feed nie jest zoptymalizowany.", cta: 'Pobierz mój wynik →' },
    pt: { title: "Qual é a pontuação do seu feed Google Shopping?", lead: "Auditoria IA gratuita. Pontuamos cada produto em 3 fatores — Título, Descrição, Destaques de produto — e entregamos as correções exatas que melhoram o ranking. A maioria das lojas perde 30–50% do tráfego Shopping porque seu feed não está otimizado.", cta: 'Obter minha pontuação →' },
    sv: { title: "Vad är din Google Shopping-feed-poäng?", lead: "Gratis AI-granskning. Vi betygsätter varje produkt på 3 faktorer — Titel, Beskrivning, Produkthöjdpunkter — och levererar de exakta korrigeringarna som förbättrar rankingen. De flesta butiker förlorar 30–50% av sin Shopping-trafik eftersom deras feed inte är optimerad.", cta: 'Hämta min poäng →' },
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

/**
 * YouTube embed component. The blog AI generation prompt asks the model
 * to drop a <YouTubeEmbed /> when a topic deserves video reinforcement
 * (e.g. tutorial-style sections), so the MDX needs to render it.
 *
 * Title attribute = accessibility label (the iframe needs one), not a
 * caption — we don't show it visually to keep the player clean.
 *
 * Sandboxed via youtube-nocookie.com so the embed doesn't drop tracking
 * cookies on the blog visitor before they've consented.
 */
export function YouTubeEmbed({ id, title }: { id: string; title?: string }) {
  if (!id) return null;
  return (
    <div
      className="youtube-embed"
      style={{
        position: 'relative',
        paddingBottom: '56.25%',
        height: 0,
        overflow: 'hidden',
        borderRadius: 'var(--r-lg, 12px)',
        margin: 'var(--s-12, 32px) 0',
        background: '#000',
      }}
    >
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`}
        title={title || 'YouTube video'}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 0,
        }}
      />
    </div>
  );
}

export const mdxComponents = {
  Callout,
  ImageCaption,
  ProductCTA,
  FAQ,
  FAQItem,
  YouTubeEmbed,
};
