'use client';

import { useEffect, useMemo, useState } from 'react';

export default function TableOfContents({ body, label }: { body: string; label: string }) {
  const items = useMemo(() => extractHeadings(body), [body]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const headings = document.querySelectorAll('.prose h2, .prose h3');
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: '-100px 0px -70% 0px' }
    );
    headings.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, []);

  if (items.length < 2) return null;

  return (
    <aside className="article-toc" aria-label="Table of contents">
      <div className="article-toc__title">{label}</div>
      <ul>
        {items.map((it) => (
          <li key={it.id} className={it.level === 3 ? 'is-h3' : ''}>
            <a
              href={`#${it.id}`}
              style={
                active === it.id
                  ? { color: 'var(--brand-600)', background: 'var(--brand-50)', borderLeftColor: 'var(--brand-500)' }
                  : undefined
              }
            >
              {it.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function extractHeadings(body: string): { level: 2 | 3; text: string; id: string }[] {
  const lines = body.split('\n');
  const out: { level: 2 | 3; text: string; id: string }[] = [];
  let inCode = false;
  for (const line of lines) {
    if (line.trim().startsWith('```')) { inCode = !inCode; continue; }
    if (inCode) continue;
    const m2 = /^##\s+(.+)$/.exec(line);
    const m3 = /^###\s+(.+)$/.exec(line);
    if (m2) out.push({ level: 2, text: m2[1].trim(), id: slugify(m2[1]) });
    else if (m3) out.push({ level: 3, text: m3[1].trim(), id: slugify(m3[1]) });
  }
  return out;
}
