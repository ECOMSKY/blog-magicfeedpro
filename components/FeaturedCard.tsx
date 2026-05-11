import Link from 'next/link';
import type { Post } from '@/lib/content';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/lib/seo';
import { DefaultCover } from './PostCard';

export default function FeaturedCard({ post, locale }: { post: Post; locale: Locale }) {
  return (
    <Link
      href={localePath(locale, `/posts/${post.slug}`)}
      className="featured"
      aria-label={post.title}
    >
      <div className="featured__cover">
        {post.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover} alt={post.coverAlt || post.title} />
        ) : (
          <DefaultCover title={post.title} />
        )}
      </div>
      <div className="featured__body">
        <span className="eyebrow">{post.category.replace(/-/g, ' ')}</span>
        <h2 className="featured__title">{post.title}</h2>
        <p className="featured__excerpt">{post.description}</p>
        <div className="card__meta" style={{ marginTop: 'var(--s-6)' }}>
          <time dateTime={post.date}>{new Date(post.date).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}</time>
          <span>·</span>
          <span>{post.readingMinutes} min read</span>
        </div>
      </div>
    </Link>
  );
}
