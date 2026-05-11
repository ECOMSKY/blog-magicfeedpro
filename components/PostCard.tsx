import Link from 'next/link';
import type { Post } from '@/lib/content';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/lib/seo';

export default function PostCard({ post, locale }: { post: Post; locale: Locale }) {
  return (
    <Link
      href={localePath(locale, `/posts/${post.slug}`)}
      className="card"
      aria-label={post.title}
    >
      <div className="card__cover">
        {post.cover ? (
          // Using <img> avoids next/image domain whitelist friction for content covers.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover} alt={post.coverAlt || post.title} loading="lazy" />
        ) : (
          <DefaultCover title={post.title} />
        )}
      </div>
      <div className="card__body">
        <span className="card__category">{post.category.replace(/-/g, ' ')}</span>
        <h3 className="card__title">{post.title}</h3>
        <p className="card__excerpt">{post.description}</p>
        <div className="card__meta">
          <time dateTime={post.date}>{new Date(post.date).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}</time>
          <span>·</span>
          <span>{post.readingMinutes} min</span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Fallback cover shown when a post has no `cover` field. The previous
 * version rendered the article's initials in 48px white ("OD", "FE", ...) —
 * looked like a missing image and dragged the whole index page down. The
 * new version is an intentional brand abstract: hero gradient + three
 * sparkles (mirrors the magicfeedpro.com wordmark motif) + soft white
 * radial highlights. Reads as "this is the brand", not "this is broken".
 */
export function DefaultCover({ title: _title }: { title: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--g-hero, var(--g-brand))',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />
      <svg
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <g fill="#FFFFFF">
          <path d="M170 100 L195 175 L270 200 L195 225 L170 300 L145 225 L70 200 L145 175 Z" opacity="0.85" />
          <path d="M380 80 L395 130 L445 145 L395 160 L380 210 L365 160 L315 145 L365 130 Z" opacity="0.65" />
          <path d="M460 290 L470 320 L500 330 L470 340 L460 370 L450 340 L420 330 L450 320 Z" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}
