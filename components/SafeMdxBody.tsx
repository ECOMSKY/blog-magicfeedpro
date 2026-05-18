/**
 * SafeMdxBody — render an MDX article body, with a markdown fallback
 * when the MDX compilation fails.
 *
 * Why this exists:
 *   AI-generated article bodies routinely contain MDX-hostile content
 *   (smart-quote characters U+201C/U+201E inside JSX attribute values,
 *   math-like expressions <30, hyphens before attribute names, etc.).
 *   When MDX cannot parse the body it throws during render and the
 *   whole article URL returns HTTP 500.
 *
 *   500s are the worst possible signal to send Google: the URL stays
 *   in the index but ranks tank ("server unreliable"), Search Console
 *   raises a "Server error (5xx)" alert, and the bot keeps retrying
 *   forever instead of moving on.
 *
 *   This wrapper tries to compile the MDX up front. If the compile
 *   succeeds we hand the source to <MDXRemote> as before. If it
 *   fails we render the same source through the unified/remark/rehype
 *   pipeline and turn the resulting hast tree into React nodes via
 *   hast-util-to-jsx-runtime — no innerHTML, no string concat, no
 *   injection surface. The embedded JSX components (<FAQItem>,
 *   <ProductCTA>, <Callout>) lose their JSX semantics in the fallback
 *   (they get escaped to plain text by remark-rehype's
 *   allowDangerousHtml=false) but the rest of the article still
 *   ships a 200 with readable content.
 *
 *   The failure path also logs to stderr with the post slug + first
 *   line of the MDX error, so we can grep the journal and fix the
 *   broken sources at the AI-generation layer.
 */
import { MDXRemote } from 'next-mdx-remote/rsc';
import { compile } from '@mdx-js/mdx';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import type { ReactNode } from 'react';

type Props = {
  source: string;
  components: Record<string, unknown>;
  options: Record<string, unknown>;
  slug?: string;
};

async function renderMarkdownFallback(source: string): Promise<ReactNode> {
  // Mirror the MDX path's remarkGfm so tables / strikethroughs /
  // task-lists render the same way the article was authored.
  // allowDangerousHtml=false escapes any raw HTML (including the
  // <FAQItem ...> blocks that broke MDX) so they show up as plain
  // text rather than injecting half-parsed JSX into the DOM.
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false });
  const mdast = processor.parse(source);
  const hast = await processor.run(mdast);
  // toJsxRuntime walks the hast tree and emits React elements with
  // the standard jsx-runtime — same path React uses for compiled JSX
  // in any other component. No string concat, no innerHTML.
  return toJsxRuntime(hast as never, {
    Fragment,
    jsx: jsx as never,
    jsxs: jsxs as never,
  });
}

export default async function SafeMdxBody({
  source,
  components,
  options,
  slug,
}: Props): Promise<ReactNode> {
  try {
    // Pre-compile probe with the same mdxOptions the real render uses.
    // Cheap — MDX compile is O(article length) and articles are ~5-50KB.
    // The cost buys us a guaranteed 200 on every URL.
    await compile(source, (options?.mdxOptions ?? {}) as never);
  } catch (err) {
    const firstLine = String((err as Error)?.message || err).split('\n')[0];
    // eslint-disable-next-line no-console
    console.warn(
      `[SafeMdxBody] MDX compile failed for slug="${slug ?? '<unknown>'}" — falling back to plain markdown. Error: ${firstLine}`,
    );
    const node = await renderMarkdownFallback(source);
    return <div className="mdx-fallback prose">{node}</div>;
  }

  // Happy path: source compiles cleanly, use the full MDX renderer.
  return (
    <MDXRemote
      source={source}
      components={components as never}
      options={options as never}
    />
  );
}
