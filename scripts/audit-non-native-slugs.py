#!/usr/bin/env python3
"""Audit blog post slugs for non-native (English-leaking) content.

A slug is "non-native" when:
  1. It equals the EN slug of the same translation cluster (verbatim copy)
  2. OR it shares ≥ 3 non-whitelisted tokens with the EN slug
  3. OR (when no EN sibling exists) it contains ≥ 2 common English
     content words that have no business in this locale

Output: TSV to stdout — locale, current_slug, en_slug, suspected_reason,
filepath. Pipe to `column -t -s$'\\t'` for human reading.

Japanese (`ja`) is excluded — the prompt deliberately keeps EN slugs for
romaji-search reasons.
"""
from __future__ import annotations

import re
import sys
from collections import defaultdict
from pathlib import Path

# Articles live one folder deep under content/posts/<locale>/
REPO_ROOT = Path(__file__).resolve().parents[1]
POSTS_DIR = REPO_ROOT / "content" / "posts"

# Per i18n config: only these 10 are actually wired to the blog runtime.
ACTIVE_LOCALES = {"en", "es", "fr", "de", "it", "pt", "nl", "pl", "sv", "ja"}
NATIVE_SLUG_REQUIRED = ACTIVE_LOCALES - {"en", "ja"}  # ja keeps EN per prompt spec

# Tokens that are language-agnostic and don't count as English leakage.
WHITELIST = {
    # Brands
    "google", "shopify", "meta", "facebook", "instagram", "youtube",
    "tiktok", "paddle", "stripe", "amazon", "microsoft", "bing", "openai",
    "anthropic", "claude", "gemini", "chatgpt", "perplexity",
    "magicfeedpro", "magicfeed", "mfp",
    # Initialisms
    "ai", "llm", "seo", "saas", "ctr", "cpc", "cpa", "cpm", "roas",
    "pmax", "sge", "gtin", "sku", "url", "api", "json", "xml",
    "rss", "sgr", "ctv", "ott", "ppc", "kpi", "ux", "ui", "b2b",
    "b2c", "dtc", "dr", "tof", "mof", "bof", "tof", "us", "uk", "eu",
    "ad", "ads", "ga4", "fb",
    # E-commerce loanwords used as-is across Romance/Germanic locales.
    # Confirmed in published translations: ES "feeds", FR "feed", DE "feed",
    # IT "feed". Flagging these as English leakage was the source of ~60%
    # of audit false positives in the first run.
    "shopping", "feed", "feeds", "product", "performance", "max",
    "merchant", "center", "checkout", "ecommerce", "commerce",
    # Common across locales (numbers, units, file extensions)
    "v1", "v2", "v3", "v4", "v5", "q1", "q2", "q3", "q4",
    "h1", "h2", "h3", "h4",
    "mdx", "html", "css", "js", "pdf",
    "vs", "x", "y", "z",
    # Year tokens already in the wild
    *(str(y) for y in range(2020, 2031)),
}

# A *small* high-frequency English-content list — words that nearly never
# legitimately appear in a non-EN slug. Keep it short on purpose so false
# positives stay near zero.
EN_TELLS = {
    "the", "and", "for", "with", "your", "from", "this", "that",
    "what", "how", "why", "where", "when", "which", "best",
    "free", "new", "old", "more", "less", "most",
    # Verbs commonly leaked
    "is", "are", "was", "were", "be", "being", "been", "have", "has",
    "had", "do", "does", "did", "get", "got", "make", "made",
    "use", "used", "using", "find", "found", "stop", "start",
    "convert", "converting", "convertions", "ranks", "rank", "ranking",
    "optimize", "optimization", "optimized", "improve", "improving",
    "improvement", "boost", "increase", "increased", "decrease",
    "scale", "scaling", "grow", "growing", "growth",
    "build", "building", "built", "create", "creating", "created",
    "fix", "fixing", "fixed",
    "search", "searching", "shopping",
    "feed", "feeds", "title", "titles", "description", "descriptions",
    "highlight", "highlights", "product", "products",
    "store", "stores", "ad", "ads", "ecommerce", "commerce",
    "voice", "rewrite", "rewriting", "rewrites",
    "reason", "reasons", "guide", "guides", "tip", "tips",
    "complete", "ultimate", "essential", "advanced", "beginner",
    "to", "in", "of", "on", "at", "as", "by", "or", "if", "an", "a",
    "not", "no", "yes",
}


SLUG_FM_RE = re.compile(r'^slug:\s*"?([a-z0-9][a-z0-9-]*)"?\s*$', re.MULTILINE)
KEY_FM_RE = re.compile(r'^translationKey:\s*"?([^"\n]+?)"?\s*$', re.MULTILINE)


def parse_minimal_frontmatter(path: Path) -> tuple[str | None, str | None]:
    """Pull just `slug` and `translationKey` from a frontmatter block.

    Heavy YAML parsing isn't needed and would break on the locale-specific
    typographic quotes some files have. The two fields we care about are
    ASCII-only.
    """
    try:
        head = path.read_text(encoding="utf-8")[:2048]
    except OSError:
        return None, None
    if not head.startswith("---"):
        return None, None
    end = head.find("\n---", 3)
    block = head[: end if end > 0 else 2048]
    slug_m = SLUG_FM_RE.search(block)
    key_m = KEY_FM_RE.search(block)
    return (slug_m.group(1) if slug_m else None), (key_m.group(1) if key_m else None)


def tokens_of(slug: str) -> list[str]:
    return [t for t in slug.split("-") if t]


def content_tokens(slug: str) -> set[str]:
    """Slug tokens minus whitelist (brands, initialisms, numbers)."""
    out: set[str] = set()
    for t in tokens_of(slug):
        if t in WHITELIST:
            continue
        if t.isdigit():
            continue
        if len(t) < 3:
            continue
        out.add(t)
    return out


def main() -> int:
    by_key: dict[str, list[dict]] = defaultdict(list)
    orphans: list[dict] = []  # articles missing translationKey
    for locale_dir in sorted(POSTS_DIR.iterdir()):
        if not locale_dir.is_dir():
            continue
        locale = locale_dir.name
        if locale not in ACTIVE_LOCALES:
            continue
        for mdx in sorted(locale_dir.glob("*.mdx")):
            slug, key = parse_minimal_frontmatter(mdx)
            if not slug:
                continue
            entry = {"locale": locale, "slug": slug, "path": mdx, "key": key}
            if key:
                by_key[key].append(entry)
            else:
                orphans.append(entry)

    bad: list[dict] = []

    # Strategy A — cross-locale comparison inside each translation cluster.
    for key, items in by_key.items():
        en = next((i for i in items if i["locale"] == "en"), None)
        en_slug = en["slug"] if en else None
        en_content = content_tokens(en_slug) if en_slug else set()
        for it in items:
            loc = it["locale"]
            if loc not in NATIVE_SLUG_REQUIRED:
                continue
            slug = it["slug"]
            this_content = content_tokens(slug)
            reason = None
            if en_slug and slug == en_slug:
                reason = "identical-to-en"
            elif en_content and len(en_content & this_content) >= 3:
                reason = f"shares-{len(en_content & this_content)}-en-content-tokens"
            elif not en_slug:
                # No EN sibling — fall through to Strategy B
                pass
            else:
                # Final tell-list check: 2+ pure English filler/verb tokens
                tells = this_content & EN_TELLS
                if len(tells) >= 2:
                    reason = f"contains-en-tells:{','.join(sorted(tells))}"
            if reason:
                bad.append({**it, "en_slug": en_slug or "", "reason": reason})

    # Strategy B — for orphan/non-clustered articles, use EN_TELLS alone.
    for it in orphans:
        loc = it["locale"]
        if loc not in NATIVE_SLUG_REQUIRED:
            continue
        tells = content_tokens(it["slug"]) & EN_TELLS
        if len(tells) >= 2:
            bad.append({**it, "en_slug": "", "reason": f"orphan-en-tells:{','.join(sorted(tells))}"})

    bad.sort(key=lambda r: (r["locale"], r["slug"]))

    print(f"# Audit summary: {len(bad)} non-native slugs across {len(NATIVE_SLUG_REQUIRED)} locales",
          file=sys.stderr)
    by_locale_count: dict[str, int] = defaultdict(int)
    for b in bad:
        by_locale_count[b["locale"]] += 1
    for loc in sorted(by_locale_count):
        print(f"#   {loc}: {by_locale_count[loc]}", file=sys.stderr)

    # TSV output
    print("locale\tcurrent_slug\ten_slug\treason\tpath")
    for b in bad:
        rel = b["path"].relative_to(REPO_ROOT)
        print(f"{b['locale']}\t{b['slug']}\t{b['en_slug']}\t{b['reason']}\t{rel}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
