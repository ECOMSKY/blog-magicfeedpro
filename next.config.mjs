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
  }
};

export default withNextIntl(nextConfig);
