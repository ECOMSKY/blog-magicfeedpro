import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * AI-crawler allowlist mirrors the LP's robots policy.
 * Source: Phase A plan, section A.3.
 */
const AI_AGENTS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'PerplexityBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'Google-Extended',
  'CCBot',
  'cohere-ai',
  'Bytespider',
  'Applebot-Extended'
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...AI_AGENTS.map((ua) => ({ userAgent: ua, allow: '/' }))
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  };
}
