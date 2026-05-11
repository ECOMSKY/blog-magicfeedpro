'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function NewsletterCard() {
  const t = useTranslations('newsletter');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error('fail');
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <aside className="mf-cta-card" aria-label="Newsletter signup">
      <span className="mf-cta-card__eyebrow">{t('eyebrow')}</span>
      <h3 className="mf-cta-card__title">{t('title')}</h3>
      <p className="mf-cta-card__lead">{t('lead')}</p>
      <form className="mf-cta-card__form" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          placeholder={t('placeholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email"
          disabled={status === 'loading' || status === 'success'}
        />
        <button
          type="submit"
          className="btn btn--primary"
          disabled={status === 'loading' || status === 'success'}
        >
          {t('cta')}
        </button>
      </form>
      {status === 'success' && <p className="mf-cta-card__success">{t('success')}</p>}
      {status === 'error' && <p className="mf-cta-card__error">{t('error')}</p>}
    </aside>
  );
}
