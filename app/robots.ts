import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * AI-crawler allowlist mirrors the LP's robots policy. We explicitly
 * allow each agent (rather than relying on the global `*` rule) so the
 * intent is visible to bot operators and to humans auditing the file.
 *
 * Why allow AI crawlers at all: the blog is *meant* to surface in
 * ChatGPT, Claude, Perplexity, Gemini and Google AI Overviews.
 * Cite-worthy answers in those surfaces drive qualified traffic to
 * the audit funnel even when our exact URL isn't clicked.
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
  'Applebot-Extended',
  'YouBot',
  'meta-externalagent',
  'DuckAssistBot',
  'MistralAI-User',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Defensive: even though the blog has no real admin routes,
        // make it explicit that crawlers shouldn't follow query-string
        // junk or the language-switch query param URL variants.
        disallow: ['/api/', '/admin/', '/*?nopopup='],
      },
      ...AI_AGENTS.map((ua) => ({ userAgent: ua, allow: '/' })),
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/llms.txt`, // not a sitemap but flagged here so AI crawlers find it fast
    ],
    host: SITE_URL,
  };
}
