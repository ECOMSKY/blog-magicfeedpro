import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { MDXRemote } from 'next-mdx-remote/rsc';
import SafeMdxBody from '@/components/SafeMdxBody';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import type { Locale } from '@/i18n/config';
import { locales } from '@/i18n/config';
import {
  getPostBySlug,
  getAuthor,
  getRelatedPosts,
  getPrevNext,
  getTranslations as getPostTranslations,
  getCategory,
  getAllPosts
} from '@/lib/content';
import { localePath, absoluteUrl, breadcrumbJsonLd, ORG_NAME, ORG_URL, SITE_NAME } from '@/lib/seo';
import { mdxComponents, makeProductCTA } from '@/components/MdxComponents';
import TableOfContents from '@/components/TableOfContents';
import ShareRow from '@/components/ShareRow';
import PostCard from '@/components/PostCard';
import Giscus from '@/components/Giscus';
import JsonLd from '@/components/JsonLd';
import AuditBanner from '@/components/AuditBanner';
import SidebarAuditPromo from '@/components/SidebarAuditPromo';
import ExitIntentPopup from '@/components/ExitIntentPopup';

type Params = { locale: string; slug: string };

// Dynamic SSR per request.
// Build stays fast (~60s, no article prerender) and bad MDX doesn't crash build.
// Caching is handled at the route-segment level once next-intl + ISR are aligned.
export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, locale: localeRaw } = await params;
  const locale = localeRaw as Locale;
  const post = getPostBySlug(locale, slug);
  if (!post) return {};
  const trans = getPostTranslations(post);
  const languages: Record<string, string> = {};
  for (const [loc, p] of Object.entries(trans)) {
    if (p) languages[loc] = localePath(loc as Locale, `/posts/${p.slug}`);
  }
  languages['x-default'] = languages['en'] || localePath(locale, `/posts/${post.slug}`);

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: localePath(locale, `/posts/${post.slug}`),
      languages
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: absoluteUrl(locale, `/posts/${post.slug}`),
      images: post.cover ? [{ url: post.cover, alt: post.coverAlt || post.title }] : undefined,
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: [post.author],
      locale
    },
    robots: post.noindex ? { index: false, follow: true } : undefined,
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.cover ? [post.cover] : undefined
    }
  };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug, locale: localeRaw } = await params;
  setRequestLocale(localeRaw);
  const locale = localeRaw as Locale;
  const t = await getTranslations({ locale, namespace: 'article' });
  const post = getPostBySlug(locale, slug);
  if (!post) notFound();
  const author = getAuthor(post.author) ?? { slug: 'mfp-team', name: 'MagicFeedPro Team', role: 'Editorial', bio: '' };
  const category = getCategory(locale, post.category);
  const related = getRelatedPosts(post, 3);
  const { prev, next } = getPrevNext(post);
  const url = absoluteUrl(locale, `/posts/${post.slug}`);

  const blogPostingLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title,
    description: post.description,
    image: post.cover ? [post.cover.startsWith('http') ? post.cover : `${absoluteUrl(locale, post.cover)}`] : undefined,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    inLanguage: locale,
    keywords: post.keywords.join(', '),
    articleSection: category?.name || post.category,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: {
      '@type': 'Person',
      name: author.name,
      url: author.sameAs?.[0]
    },
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: ORG_URL,
      logo: { '@type': 'ImageObject', url: `${ORG_URL}/logo.png` }
    }
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: SITE_NAME, url: absoluteUrl(locale, '/') },
    { name: category?.name || post.category, url: absoluteUrl(locale, `/category/${post.category}`) },
    { name: post.title, url }
  ]);

  // Extract FAQ items from raw MDX <FAQItem q="..." a="..." /> for FAQPage JSON-LD.
  // Self-contained regex; tolerates single/double quotes and escaped chars in attrs.
  const faqRegex = /<FAQItem\s+q=(?:"([^"]+)"|'([^']+)')\s+a=(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)')\s*\/?>/g;
  const faqItems: { q: string; a: string }[] = [];
  for (const m of post.body.matchAll(faqRegex)) {
    const q = (m[1] || m[2] || '').trim();
    const a = (m[3] || m[4] || '').replace(/\\"/g, '"').replace(/\\\\/g, '\\').trim();
    if (q && a) faqItems.push({ q, a });
  }
  const faqLd = faqItems.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((it) => ({
          '@type': 'Question',
          name: it.q,
          acceptedAnswer: { '@type': 'Answer', text: it.a }
        }))
      }
    : null;

  const formattedDate = new Date(post.date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const updatedDate = post.updated
    ? new Date(post.updated).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;
  const initials = author.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  // The canonical MFP author has no human face — initials read as a
  // placeholder, the brand mark reinforces identity on every article.
  const isMfpAuthor = author.slug === 'mfp-team' || /magicfeedpro/i.test(author.name);

  return (
    <>
      <JsonLd data={blogPostingLd} />
      <JsonLd data={breadcrumb} />
      {faqLd && <JsonLd data={faqLd} />}

      <div className="container article-hero">
        <div className="article-hero__grid">
          <div className="article-hero__main">
            <div className="breadcrumbs">
              <Link href={localePath(locale, '/')}>{SITE_NAME}</Link>
              <span className="breadcrumbs__sep">/</span>
              <Link href={localePath(locale, `/category/${post.category}`)}>
                {category?.name || post.category.replace(/-/g, ' ')}
              </Link>
              <span className="breadcrumbs__sep">/</span>
              <span aria-current="page">{post.title}</span>
            </div>
            <h1>{post.title}</h1>
            <div className="article-meta">
              <div className="article-meta__author">
                <span className="article-meta__avatar" aria-hidden="true">
                  {isMfpAuthor ? (
                    <Image src="/favicon.png" alt="" width={56} height={56} sizes="28px" />
                  ) : (
                    initials
                  )}
                </span>
                <span>{t('by')} {author.name}</span>
              </div>
              <span>·</span>
              <time dateTime={post.date}>{t('publishedOn')} {formattedDate}</time>
              {updatedDate && (
                <>
                  <span>·</span>
                  <span>{t('updatedOn')} {updatedDate}</span>
                </>
              )}
              <span>·</span>
              <span>{post.readingMinutes} {t('readTime')}</span>
            </div>
            <div className="article-hero__cover">
              {post.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.cover} alt={post.coverAlt || post.title} />
              ) : (
                <DefaultCoverHero title={post.title} />
              )}
            </div>
          </div>
          <div className="article-hero__aside">
            <SidebarAuditPromo locale={locale} />
          </div>
        </div>
      </div>

      <div className="container article-body">
        <article className="prose">
          {post.tldr && (
            <div className="tldr">
              <div className="tldr__label">{t('tldr')}</div>
              <p className="tldr__body">{post.tldr}</p>
            </div>
          )}
          <SafeMdxBody
            slug={post.slug}
            source={post.body}
            components={{
              ...mdxComponents,
              // Inject locale-aware ProductCTA so MDX <ProductCTA />
              // blocks render with the right language without each MDX
              // file having to ship hardcoded title/body copy.
              ProductCTA: makeProductCTA(locale as 'en' | 'fr' | 'es' | 'de' | 'it' | 'ja' | 'nl' | 'pl' | 'pt' | 'sv'),
            }}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  rehypeSlug,
                  [rehypeAutolinkHeadings, { behavior: 'wrap' }]
                ]
              }
            }}
          />

          <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: 'var(--s-16) 0' }} />

          <ShareRow url={url} title={post.title} />

          {/* Author card — text-only. The brand mark / initials avatar
              ate horizontal real estate without earning it; the box
              reads cleaner with name, role and bio distributed across
              the full width. */}
          <div className="author-card author-card--text">
            <h3 className="author-card__name">{author.name}</h3>
            <div className="author-card__role">{author.role}</div>
            {author.bio && <p className="author-card__bio">{author.bio}</p>}
          </div>

          {/* Article-end CTA — animated gradient banner pushing toward the
              free audit on lp.magicfeedpro.com. Server-rendered so it ships
              without a JS payload. */}
          <AuditBanner locale={locale} slug={post.slug} />

          {related.length > 0 && (
            <>
              <h2 style={{ marginTop: 'var(--s-20)' }}>{t('relatedArticles')}</h2>
              <div className="card-grid">
                {related.map((r) => (
                  <PostCard key={r.slug} post={r} locale={locale} />
                ))}
              </div>
            </>
          )}

          <div className="prev-next">
            {prev ? (
              <Link href={localePath(locale, `/posts/${prev.slug}`)} className="prev-next__item">
                <div className="prev-next__label">← {t('prev')}</div>
                <div className="prev-next__title">{prev.title}</div>
              </Link>
            ) : <span />}
            {next ? (
              <Link href={localePath(locale, `/posts/${next.slug}`)} className="prev-next__item prev-next__item--next">
                <div className="prev-next__label">{t('next')} →</div>
                <div className="prev-next__title">{next.title}</div>
              </Link>
            ) : <span />}
          </div>

          {post.comments && <Giscus />}
        </article>
        <TableOfContents body={post.body} label={t('tableOfContents')} />
      </div>

      {/* Exit-intent popup — fires when the user shows leaving signals
          (cursor escapes top of viewport on desktop, scroll-back on mobile)
          and the user is past 30% of the article. Suppressed for 7 days
          after dismissal. */}
      <ExitIntentPopup pathKind="article" />
    </>
  );
}

/**
 * Hero cover fallback for an article when `post.cover` is missing.
 * Brand abstract (gradient + sparkles) — same motif as PostCard.DefaultCover
 * so the placeholder reads as deliberate art rather than missing image.
 */
function DefaultCoverHero({ title: _title }: { title: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--g-hero, var(--g-brand))',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: '-15%', right: '-8%', width: '55%', height: '60%', background: 'radial-gradient(circle, rgba(255,255,255,0.30) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 60%)' }} />
      <svg
        viewBox="0 0 1200 480"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <g fill="#FFFFFF">
          <path d="M260 140 L295 230 L390 260 L295 290 L260 380 L225 290 L130 260 L225 230 Z" opacity="0.85" />
          <path d="M740 110 L760 170 L820 190 L760 210 L740 270 L720 210 L660 190 L720 170 Z" opacity="0.65" />
          <path d="M900 340 L912 372 L944 384 L912 396 L900 428 L888 396 L856 384 L888 372 Z" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}
