'use client';
import { useEffect, useRef } from 'react';

/**
 * Giscus comments (disabled by default).
 * Enable per-article via frontmatter `comments: true`.
 * Configure repo/category/categoryId via env vars before activating in production.
 */
export default function Giscus() {
  const ref = useRef<HTMLDivElement>(null);
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  useEffect(() => {
    if (!ref.current || !repo || !repoId) return;
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', repo);
    script.setAttribute('data-repo-id', repoId);
    script.setAttribute('data-category', category || 'General');
    script.setAttribute('data-category-id', categoryId || '');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', 'light');
    script.setAttribute('data-lang', 'en');
    ref.current.appendChild(script);
  }, [repo, repoId, category, categoryId]);

  if (!repo || !repoId) return null;
  return <div ref={ref} style={{ marginTop: 'var(--s-16)' }} />;
}
