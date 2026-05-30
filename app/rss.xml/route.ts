import { buildRss } from '@/lib/rss';
// Refresh RSS feed every 60s so newly-published posts appear in
// subscribers' readers + Google/Bing RSS-based discovery within a minute.
export const revalidate = 60;
export async function GET() { return buildRss('en'); }
