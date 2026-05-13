import { NextRequest, NextResponse } from 'next/server';
import { videosDb } from '@/lib/db';
import { getDriveStreamUrls } from '@/lib/drive';
import { getSession } from '@/lib/session';

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
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const video = videosDb.getById.get(id);

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (video.publisher_id !== session.id && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    videosDb.delete.run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Video delete error:', error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const video = videosDb.getById.get(id);
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (video.publisher_id !== session.id && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, description, visibility, thumbnail_url } = await request.json();
    
    videosDb.update.run(title || video.title, description || video.description, visibility || video.visibility, thumbnail_url || video.thumbnail_url, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Video update error:', error);
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
  }
}
