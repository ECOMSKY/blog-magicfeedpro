#!/usr/bin/env python3
"""
Auto-generate cover images for new blog articles.

Scans content/posts/en/*.mdx, finds articles whose `cover:` field is
missing OR points to a non-existent file under public/blog-covers/,
then for each:

  1. Reads title + description + first ~500 chars of body.
  2. Asks Claude (claude-sonnet-4-6 by default) to write a subject
     prompt that matches the v4 batch style.
  3. Calls OpenAI gpt-image-1 at 1536x1024 quality=high.
  4. Saves the JPEG to public/blog-covers/<slug>.jpg.
  5. Writes `cover:` + `coverAlt:` into the frontmatter of the EN
     file AND of every other locale variant (same translationKey).

Run before publishing a new article:

    OPENAI_API_KEY=sk-... ANTHROPIC_API_KEY=sk-ant-... \
      python3 scripts/generate-blog-cover.py

The keys are also read from .env / .env.local if `python-dotenv` is
installed. If you want the script to ALWAYS regenerate covers, pass
`--force` and it will ignore existing covers.

Note: this script is idempotent — running it twice on the same MDX
without `--force` is a no-op.
"""

from __future__ import annotations

import argparse
import base64
import io
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# ------------------------------------------------------------------
# Layout
# ------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT / 'content' / 'posts'
COVERS_DIR = ROOT / 'public' / 'blog-covers'
LOCALES = ['en', 'fr', 'es', 'de', 'it', 'ja', 'nl', 'pl', 'pt', 'sv']

# Style prefix from the v4 batch — DO NOT CHANGE WITHOUT
# regenerating all covers. Founder explicitly approved this style.
STYLE_PREFIX = (
    "Editorial illustration, vector-style geometric composition, isometric "
    "perspective, brand palette of electric blue (#0000EE) and violet "
    "(#716FFF) on a soft off-white background (#F8F8FB), subtle shadows, "
    "monochrome accents in charcoal (#1F2937), no text, no logos, no "
    "people, no faces, no hands holding phones — abstract conceptual "
    "graphics only. Style reference: Linear.app / Vercel / Stripe blog "
    "covers. 16:9 aspect ratio."
)

# Claude system prompt used to write the per-article subject sentence.
CLAUDE_SYSTEM = (
    "You write image-generation prompts for blog covers in a strict "
    "house style: vector isometric editorial illustrations on a "
    "soft off-white canvas, brand palette electric blue + violet + "
    "charcoal. Style reference Linear / Vercel / Stripe blog covers.\n\n"
    "The PREAMBLE is provided and must NOT be altered. Your output is "
    "ONLY the SUBJECT sentence that will be appended to the preamble. "
    "Constraints for the subject:\n"
    " - 1-2 sentences max.\n"
    " - Describe ONE concrete, content-aware visual that illustrates "
    "the article's SPECIFIC topic (not a generic 'feed optimization' "
    "trope).\n"
    " - Use simple geometric objects, arrows, shapes, charts. Allow "
    "numbers/symbols (✓, ✗, →, %, digits) as DESIGN ELEMENTS — never "
    "logos, paragraphs of text, faces, hands, photographic content.\n"
    " - The subject should be obvious at thumbnail size (200x112).\n\n"
    "Output ONLY the subject sentence — no preamble, no quotes, no "
    "explanation."
)


# ------------------------------------------------------------------
# Env loading
# ------------------------------------------------------------------
def _maybe_load_dotenv() -> None:
    try:
        from dotenv import load_dotenv  # type: ignore
        for fname in ('.env.local', '.env'):
            p = ROOT / fname
            if p.exists():
                load_dotenv(p)
    except ImportError:
        pass


# ------------------------------------------------------------------
# Frontmatter parsing
# ------------------------------------------------------------------
_FRONTMATTER_RE = re.compile(r'^---\n(.*?)\n---\n(.*)$', re.S)


def parse_frontmatter(text: str) -> Tuple[Dict[str, str], str]:
    m = _FRONTMATTER_RE.match(text)
    if not m:
        return {}, text
    fm_raw, body = m.group(1), m.group(2)
    fm: Dict[str, str] = {}
    for line in fm_raw.split('\n'):
        if ':' not in line:
            continue
        key, _, value = line.partition(':')
        key = key.strip()
        value = value.strip()
        # strip surrounding quotes
        if value and value[0] in '"\'' and value[-1] == value[0]:
            value = value[1:-1]
        fm[key] = value
    return fm, body


def serialize_frontmatter(fm: Dict[str, str], body: str) -> str:
    # Preserve insertion order, dump key: "value" with double quotes.
    # CRITICAL: backslash-escape any embedded " in the value, otherwise
    # YAML parses the string as terminated mid-value and the next chars
    # become an invalid block. (Real bug we shipped: Claude generated a
    # coverAlt like '... like "1," "2,"...' and the blog build died.)
    lines = []
    for k, v in fm.items():
        if isinstance(v, str) and not (v.startswith('[') or v.startswith('{')):
            safe = v.replace('\\', '\\\\').replace('"', '\\"')
            lines.append(f'{k}: "{safe}"')
        else:
            lines.append(f'{k}: {v}')
    return '---\n' + '\n'.join(lines) + '\n---\n' + body


def needs_cover(mdx_path: Path, force: bool) -> bool:
    text = mdx_path.read_text()
    fm, _ = parse_frontmatter(text)
    cover = fm.get('cover', '').strip()
    if force:
        return True
    if not cover:
        return True
    # Cover field exists — does the file?
    rel = cover.lstrip('/')
    expected = ROOT / 'public' / rel
    return not expected.exists()


# ------------------------------------------------------------------
# Claude call — write the subject sentence
# ------------------------------------------------------------------
def claude_subject(title: str, description: str, body_excerpt: str) -> str:
    try:
        from anthropic import Anthropic
    except ImportError:
        print('  ! anthropic package missing — pip install anthropic')
        sys.exit(2)

    key = os.environ.get('ANTHROPIC_API_KEY')
    if not key:
        print('  ! ANTHROPIC_API_KEY missing')
        sys.exit(2)

    client = Anthropic(api_key=key)
    user_msg = (
        f"PREAMBLE (do not alter):\n{STYLE_PREFIX}\n\n"
        f"Article title: {title}\n"
        f"Article description: {description}\n"
        f"Article opening:\n{body_excerpt[:500]}\n\n"
        "Write the subject sentence now."
    )
    model = os.environ.get('CLAUDE_MODEL', 'claude-sonnet-4-6')
    resp = client.messages.create(
        model=model,
        max_tokens=400,
        system=CLAUDE_SYSTEM,
        messages=[{'role': 'user', 'content': user_msg}],
    )
    return ''.join(b.text for b in resp.content if getattr(b, 'type', '') == 'text').strip()


# ------------------------------------------------------------------
# OpenAI image generation
# ------------------------------------------------------------------
def generate_image_jpeg(prompt: str) -> bytes:
    try:
        from openai import OpenAI
    except ImportError:
        print('  ! openai package missing — pip install openai')
        sys.exit(2)
    try:
        from PIL import Image
    except ImportError:
        print('  ! Pillow missing — pip install Pillow')
        sys.exit(2)

    key = os.environ.get('OPENAI_API_KEY')
    if not key:
        print('  ! OPENAI_API_KEY missing')
        sys.exit(2)

    client = OpenAI(api_key=key)
    result = client.images.generate(
        model='gpt-image-1',
        prompt=prompt,
        size='1536x1024',
        quality='high',
        n=1,
    )
    b64 = result.data[0].b64_json
    if not b64:
        raise RuntimeError('No b64_json in image response')
    raw = base64.b64decode(b64)
    img = Image.open(io.BytesIO(raw)).convert('RGB')
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=85, optimize=True)
    return buf.getvalue()


# ------------------------------------------------------------------
# Locale propagation
# ------------------------------------------------------------------
def find_locale_variants(translation_key: str) -> List[Path]:
    """Return every MDX file whose frontmatter has the matching translationKey."""
    out = []
    for locale in LOCALES:
        d = POSTS_DIR / locale
        if not d.exists():
            continue
        for mdx in sorted(d.glob('*.mdx')):
            text = mdx.read_text()
            fm, _ = parse_frontmatter(text)
            if fm.get('translationKey', '').strip() == translation_key:
                out.append(mdx)
                break
    return out


def update_frontmatter_cover(mdx_path: Path, cover: str, cover_alt: str) -> None:
    text = mdx_path.read_text()
    fm, body = parse_frontmatter(text)
    fm['cover'] = cover
    fm['coverAlt'] = cover_alt
    mdx_path.write_text(serialize_frontmatter(fm, body))


# ------------------------------------------------------------------
# Main flow
# ------------------------------------------------------------------
def main() -> None:
    _maybe_load_dotenv()
    ap = argparse.ArgumentParser()
    ap.add_argument('--force', action='store_true',
                    help='Regenerate covers even when they already exist.')
    ap.add_argument('--only', help='Only process this slug (filename without .mdx).')
    args = ap.parse_args()

    en_dir = POSTS_DIR / 'en'
    if not en_dir.exists():
        print('No content/posts/en/ — nothing to process.')
        return

    COVERS_DIR.mkdir(parents=True, exist_ok=True)
    candidates = sorted(en_dir.glob('*.mdx'))
    if args.only:
        candidates = [c for c in candidates if c.stem == args.only]
    if not candidates:
        print('No matching articles found.')
        return

    processed = 0
    skipped = 0
    for en_mdx in candidates:
        slug = en_mdx.stem
        if not needs_cover(en_mdx, args.force):
            print(f'  · {slug} — cover already exists, skip')
            skipped += 1
            continue

        text = en_mdx.read_text()
        fm, body = parse_frontmatter(text)
        translation_key = fm.get('translationKey', slug)
        title = fm.get('title', slug.replace('-', ' '))
        description = fm.get('description', '')

        print(f'  → {slug}')
        print(f'    title: {title[:80]}')

        # 1. Ask Claude for the subject. Catch ANY exception so a single
        # transient (401, 429, network) doesn't kill the whole batch —
        # the next article in the loop may have a different fate and the
        # workflow stays green. Auth errors are exit-fast (no point
        # retrying 200 articles against a dead key) with a one-liner the
        # admin can act on without reading the stack.
        try:
            subject = claude_subject(title, description, body)
        except Exception as exc:  # noqa: BLE001
            kind = type(exc).__name__
            msg = str(exc)
            auth_failed = (
                "authentication_error" in msg
                or "invalid x-api-key" in msg
                or kind == "AuthenticationError"
            )
            if auth_failed:
                print('    ✗ Claude AUTH error — ANTHROPIC_API_KEY secret is invalid.')
                print('      Rotate it: GitHub → Settings → Secrets and variables → Actions')
                sys.exit(78)  # neutral-error: GH Actions marks the step skipped
            print(f'    ✗ Claude subject failed ({kind}): {msg[:140]} — skipping')
            continue
        print(f'    Claude subject: {subject[:120]}…')

        # 2. Compose full prompt + generate
        full_prompt = f'{STYLE_PREFIX} {subject}'
        try:
            jpeg = generate_image_jpeg(full_prompt)
        except Exception as exc:  # noqa: BLE001
            print(f'    ✗ Image generation failed: {exc}')
            continue

        # 3. Save
        target = COVERS_DIR / f'{slug}.jpg'
        target.write_bytes(jpeg)
        print(f'    ✓ saved {target.relative_to(ROOT)} ({len(jpeg) // 1024} KB)')

        # 4. Propagate to all locales sharing the same translationKey
        cover_path = f'/blog-covers/{slug}.jpg'
        cover_alt = subject[:140]
        variants = find_locale_variants(translation_key)
        for v in variants:
            update_frontmatter_cover(v, cover_path, cover_alt)
        print(f'    ✓ updated {len(variants)} locale frontmatters')
        processed += 1

    print()
    print(f'Done. processed={processed} skipped={skipped}')


if __name__ == '__main__':
    main()
