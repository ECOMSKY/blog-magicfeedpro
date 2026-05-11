import { buildRss } from '@/lib/rss';
export const dynamic = 'force-static';
export async function GET() { return buildRss('fr'); }
