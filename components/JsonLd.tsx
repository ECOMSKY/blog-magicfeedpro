/**
 * Safe JSON-LD <script> emitter.
 *
 * Why dangerouslySetInnerHTML is acceptable here:
 *   - Content is produced by JSON.stringify on objects built in our own server code.
 *   - We additionally escape "<" to "<" to prevent any "</script>" breakout.
 *   - React has no other supported way to render a <script type="application/ld+json">
 *     element with raw text content.
 *
 * This pattern is documented by Next.js and Google's Search Central as the
 * recommended way to ship structured data.
 */
export default function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
