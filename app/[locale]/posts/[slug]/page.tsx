import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import type { Metadata } from 'next';
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
import { mdxComponents } from '@/components/MdxComponents';
import TableOfContents from '@/components/TableOfContents';
import ShareRow from '@/components/ShareRow';
import PostCard from '@/components/PostCard';
import Giscus from '@/components/Giscus';
import JsonLd from '@/components/JsonLd';

type Params = { locale: string; slug: string };

export function generateStaticParams() {
  const out: Params[] = [];
  for (const locale of locales) {
    for (const p of getAllPosts().filter((q) => q.locale === locale)) {
      out.push({ locale, slug: p.slug });
    }
  }
  return out;
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

  return (
    <>
      <JsonLd data={blogPostingLd} />
      <JsonLd data={breadcrumb} />
      {faqLd && <JsonLd data={faqLd} />}

      <div className="container article-hero">
        <div className="breadcrumbs">
          <Link href={localePath(locale, '/')}>{SITE_NAME}</Link>
          <span className="breadcrumbs__sep">/</span>
          <Link href={localePath(locale, `/category/${post.category}`)}>
            {category?.name || post.category.replace(/-/g, ' ')}
          </Link>
          <span className="breadcrumbs__sep">/</span>
          <span aria-current="page">{post.title}</span>
        </div>
        <h1 style={{ maxWidth: 880 }}>{post.title}</h1>
        <div className="article-meta">
          <div className="article-meta__author">
            <span className="article-meta__avatar">{initials}</span>
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

      <div className="container article-body">
        <TableOfContents body={post.body} label={t('tableOfContents')} />
        <article className="prose">
          {post.tldr && (
            <div className="tldr">
              <div className="tldr__label">{t('tldr')}</div>
              <p className="tldr__body">{post.tldr}</p>
            </div>
          )}
          <MDXRemote
            source={post.body}
            components={mdxComponents}
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

          <div className="author-card">
            <span className="author-card__avatar">{initials}</span>
            <div>
              <h3 className="author-card__name">{author.name}</h3>
              <div className="author-card__role">{author.role}</div>
              <p className="author-card__bio">{author.bio}</p>
            </div>
          </div>

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
      </div>
    </>
  );
}

function DefaultCoverHero({ title }: { title: string }) {
  const initials = title.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--g-brand)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 800,
        fontSize: 88,
        letterSpacing: -2
      }}
    >
      {initials}
    </div>
  );
}
