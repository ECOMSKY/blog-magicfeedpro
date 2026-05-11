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

export function DefaultCover({ title }: { title: string }) {
  // Fallback: brand gradient + first 2 words.
  const initials = title.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--g-brand)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 800,
        fontSize: 48,
        letterSpacing: -1,
        textShadow: '0 4px 24px rgba(0,0,0,0.15)'
      }}
    >
      {initials}
    </div>
  );
}
