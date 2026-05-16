import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import type { Locale } from "@/i18n/config";
import { locales } from "@/i18n/config";

export type Post = {
  slug: string;
  translationKey: string;
  locale: Locale;
  title: string;
  description: string;
  keywords: string[];
  date: string;
  updated?: string;
  author: string;
  reviewedBy?: string;
  category: string;
  tags: string[];
  cover?: string;
  coverAlt?: string;
  tldr?: string;
  noindex?: boolean;
  draft?: boolean;
  featured?: boolean;
  comments?: boolean;
  body: string;
  readingMinutes: number;
};

export type Author = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  avatar?: string;
  sameAs?: string[];
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  locale: Locale;
};

const ROOT = path.join(process.cwd(), 'content');
const POSTS_DIR = path.join(ROOT, 'posts');
const AUTHORS_DIR = path.join(ROOT, 'authors');
const CATEGORIES_DIR = path.join(ROOT, 'categories');

function safeReadDir(dir: string): string[] {
  try { return fs.readdirSync(dir); } catch { return []; }
}

function parseBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const t = v.trim().toLowerCase();
    return t === "true" || t === "1" || t === "yes";
  }
  return !!v;
}

export function getAllPosts(): Post[] {
  const posts: Post[] = [];
  const locales = safeReadDir(POSTS_DIR);
  for (const locale of locales) {
    const localeDir = path.join(POSTS_DIR, locale);
    const files = safeReadDir(localeDir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(localeDir, file), 'utf-8');
      const { data, content } = matter(raw);
      const slug = (data.slug as string) || file.replace(/\.mdx?$/, '');
      if (data.draft) continue;
      const stat = readingTime(content);
      posts.push({
        slug,
        translationKey: (data.translationKey as string) || slug,
        locale: locale as Locale,
        title: data.title || '',
        description: data.description || '',
        keywords: data.keywords || [],
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        updated: data.updated ? new Date(data.updated).toISOString() : undefined,
        author: data.author || 'mfp-team',
        reviewedBy: data.reviewedBy,
        category: data.category || 'feed-optimization',
        tags: data.tags || [],
        cover: data.cover,
        coverAlt: data.coverAlt,
        tldr: data.tldr,
        // YAML can yield strings ("false") that are truthy in JS; coerce
        // any string explicitly. !!data.x was emitting noindex tags on
        // articles whose AI generator quoted the boolean.
        noindex: parseBool(data.noindex),
        draft: parseBool(data.draft),
        featured: parseBool(data.featured),
        comments: data.comments === true,
        body: content,
        readingMinutes: Math.max(1, Math.round(stat.minutes))
      });
    }
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostsByLocale(locale: Locale): Post[] {
  return getAllPosts().filter((p) => p.locale === locale);
}

export function getPostBySlug(locale: Locale, slug: string): Post | undefined {
  return getPostsByLocale(locale).find((p) => p.slug === slug);
}

export function getRelatedPosts(post: Post, count = 3): Post[] {
  const same = getPostsByLocale(post.locale).filter((p) => p.slug !== post.slug);
  const sameCat = same.filter((p) => p.category === post.category);
  const tagOverlap = same
    .filter((p) => p.category !== post.category)
    .filter((p) => p.tags.some((t) => post.tags.includes(t)));
  return [...sameCat, ...tagOverlap, ...same].slice(0, count);
}

export function getPrevNext(post: Post): { prev?: Post; next?: Post } {
  const list = getPostsByLocale(post.locale).filter((p) => p.category === post.category);
  const i = list.findIndex((p) => p.slug === post.slug);
  return {
    prev: i >= 0 && i < list.length - 1 ? list[i + 1] : undefined,
    next: i > 0 ? list[i - 1] : undefined
  };
}

export function getAllAuthors(): Author[] {
  const files = safeReadDir(AUTHORS_DIR).filter((f) => f.endsWith('.json'));
  return files.map((f) => {
    const raw = JSON.parse(fs.readFileSync(path.join(AUTHORS_DIR, f), 'utf-8'));
    return { ...raw, slug: raw.slug || f.replace(/\.json$/, '') } as Author;
  });
}

export function getAuthor(slug: string): Author | undefined {
  return getAllAuthors().find((a) => a.slug === slug);
}

export function getCategoriesByLocale(locale: Locale): Category[] {
  const localeDir = path.join(CATEGORIES_DIR, locale);
  const files = safeReadDir(localeDir).filter((f) => f.endsWith('.json'));
  return files.map((f) => {
    const raw = JSON.parse(fs.readFileSync(path.join(localeDir, f), 'utf-8'));
    return { ...raw, locale, slug: raw.slug || f.replace(/\.json$/, '') } as Category;
  });
}

export function getCategory(locale: Locale, slug: string): Category | undefined {
  return getCategoriesByLocale(locale).find((c) => c.slug === slug);
}

export function getTranslations(post: Post): Record<Locale, Post | undefined> {
  // Use the canonical  tuple so adding/removing a locale in
  // i18n/config.ts auto-propagates here. The previous hard-coded en/fr/es
  // record broke the Type<Locale> contract whenever the locale list grew.
  const all = getAllPosts().filter((p) => p.translationKey === post.translationKey);
  const out = {} as Record<Locale, Post | undefined>;
  for (const loc of locales) {
    out[loc] = all.find((p) => p.locale === loc);
  }
  return out;
}
