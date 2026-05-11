import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container section" style={{ textAlign: 'center', minHeight: '50vh' }}>
      <span className="eyebrow">404</span>
      <h1 className="title-gradient">Page not found</h1>
      <p className="hero__lead">The article you're looking for may have been moved or doesn't exist.</p>
      <Link href="/" className="btn btn--primary">Back to the blog</Link>
    </div>
  );
}
