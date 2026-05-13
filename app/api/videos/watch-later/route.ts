import { NextResponse } from 'next/server';
import { watchLaterDb } from '@/lib/db';
import { getSession } from '@/lib/session';
import { getDriveStreamUrls } from '@/lib/drive';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const videos = watchLaterDb.getByUserId.all(session.id) as any[];

    const enriched = videos.map((v) => {
      const urls = getDriveStreamUrls(v.drive_id);
      return {
        ...v,
        streamUrl: urls.streamUrl,
        embedUrl: urls.embedUrl,
        thumbnailUrl: v.thumbnail_url || urls.thumbnailUrl,
      };
    });

    return NextResponse.json({ videos: enriched });
  } catch (error) {
    console.error('Failed to get watch later videos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
