import { buildRss } from '@/lib/rss';
// Keep force-static so the route gets prerendered at build, but ALSO
// set revalidate=60 so Next.js refreshes the cached output every minute
// — newly-published posts then appear in the feed within ~60s without
// needing a redeploy. Combining force-static + revalidate is the
// supported pattern (see Next.js Route Handlers docs).
export const dynamic = 'force-static';
export const revalidate = 60;
export async function GET() { return buildRss('en'); }
