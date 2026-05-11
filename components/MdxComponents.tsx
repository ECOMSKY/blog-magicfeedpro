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

export function ProductCTA({
  variant = 'audit',
  title,
  children
}: {
  variant?: 'audit' | 'trial';
  title?: string;
  children?: React.ReactNode;
}) {
  const href = variant === 'audit' ? 'https://lp.magicfeedpro.com/' : 'https://magicfeedpro.com/';
  const defaultTitle =
    variant === 'audit' ? 'Get a free Google Shopping feed audit' : 'Try MagicFeedPro free';
  const cta = variant === 'audit' ? 'Start free audit →' : 'Start free trial →';
  return (
    <div className="product-cta" role="complementary">
      <div className="product-cta__title">{title || defaultTitle}</div>
      <div className="product-cta__lead">
        {children ||
          'See exactly how AI-powered feed rewrites can lift your CTR and conversion rate — in minutes.'}
      </div>
      <a className="btn btn--primary btn--lg" href={href} rel="noopener">
        {cta}
      </a>
    </div>
  );
}

export function FAQ({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section className="faq" aria-label="Frequently asked questions">
      {items.map((it, i) => (
        <div className="faq__item" key={i}>
          <div className="faq__q">{it.q}</div>
          <div className="faq__a">{it.a}</div>
        </div>
      ))}
    </section>
  );
}

export const mdxComponents = {
  Callout,
  ImageCaption,
  ProductCTA,
  FAQ
};
