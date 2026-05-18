'use client';

import Script from 'next/script';

/**
 * MagicFeedPro-owned Reddit Pixel — fires PageVisit on every blog page so
 * we can build a "blog reader" audience and retarget them with audit
 * offers on Reddit Ads. Mirrors the MetaPixel component pattern 1:1.
 *
 * Hard-coded pixel id (same approach as MetaPixel.tsx — the blog is a
 * separate Next deploy and threading env vars across packages was more
 * trouble than it was worth for a single static string).
 */
const REDDIT_PIXEL_ID = 'a2_j0rw7qhj284x';

export default function RedditPixel() {
  return (
    <Script id="mfp-reddit-pixel" strategy="afterInteractive">
      {`
        !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?
        p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};
        p.callQueue=[];var t=d.createElement("script");
        t.src="https://www.redditstatic.com/ads/pixel.js";t.async=!0;
        var s=d.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(t,s)}}(window,document);
        rdt('init', '${REDDIT_PIXEL_ID}');
        rdt('track', 'PageVisit');
      `}
    </Script>
  );
}
