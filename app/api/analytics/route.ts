import { NextResponse } from 'next/server';
import { analyticsDb } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'publisher')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const stats = await analyticsDb.getStats();
    const rawTopVideos = await analyticsDb.getTopVideos();
    
    const topVideos = rawTopVideos.map(v => ({
      ...v,
      thumbnailUrl: v.thumbnail_url
    }));

    return NextResponse.json({ stats, topVideos });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
