'use client';

import Script from 'next/script';

/**
 * Google Ads global site tag — fires on every blog page so Google Ads
 * can attribute conversions back to blog visits. Conversion ID for the
 * MagicFeedPro Google Ads account, hard-coded since the blog is a
 * separate Next deploy.
 */
const GADS_ID = 'AW-17849037738';

export default function GoogleAds() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="mfp-gads-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GADS_ID}');
        `}
      </Script>
    </>
  );
}
