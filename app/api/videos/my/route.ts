import { NextRequest, NextResponse } from 'next/server';
import { videosDb } from '@/lib/db';
import { getSession } from '@/lib/session';
import { getDriveStreamUrls } from '@/lib/drive';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const videos = await videosDb.getByPublisherId(session.id);

    // Enrich with streaming URLs
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
    console.error('My videos error:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}
