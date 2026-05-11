'use client';

import { useState } from 'react';

export default function ShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const enc = (s: string) => encodeURIComponent(s);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="share-row">
      <span className="share-row__label">Share</span>
      <a
        className="share-row__btn"
        href={`https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Twitter
      </a>
      <a
        className="share-row__btn"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        LinkedIn
      </a>
      <button className="share-row__btn" onClick={copy}>
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  );
}
