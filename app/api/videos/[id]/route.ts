import { NextRequest, NextResponse } from 'next/server';
import { videosDb } from '@/lib/db';
import { getDriveStreamUrls } from '@/lib/drive';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const video = videosDb.getById.get(id);

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Increment view count
    videosDb.incrementViews.run(id);

    const urls = getDriveStreamUrls(video.drive_id);

    return NextResponse.json({
      video: {
        ...video,
        views: video.views + 1,
        streamUrl: urls.streamUrl,
        embedUrl: urls.embedUrl,
        thumbnailUrl: video.thumbnail_url || urls.thumbnailUrl,
      },
    });
  } catch (error) {
    console.error('Video detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const video = videosDb.getById.get(id);

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    videosDb.delete.run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Video delete error:', error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}
