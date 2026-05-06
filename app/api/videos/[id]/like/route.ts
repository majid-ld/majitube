import { NextResponse } from 'next/server';
import { likesDb, videosDb, notificationsDb } from '@/lib/db';
import { getSession } from '@/lib/session';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: video_id } = await params;
    const countRes = likesDb.count.get(video_id);
    const count = countRes?.count || 0;

    let hasLiked = false;
    const session = await getSession();
    if (session) {
      const likedRes = likesDb.hasLiked.get(video_id, session.id);
      if (likedRes && likedRes.count > 0) hasLiked = true;
    }

    return NextResponse.json({ count, hasLiked });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: video_id } = await params;
    
    // Using our transaction to toggle
    const isLiked = likesDb.toggle(video_id, session.id);

    // Notify the video publisher if liked
    if (isLiked) {
      const video = videosDb.getById.get(video_id);
      if (video && video.publisher_id && video.publisher_id !== session.id) {
        notificationsDb.create.run(
          uuidv4(),
          video.publisher_id,
          `${session.email.split('@')[0]} liked your video: "${video.title}"`,
          `/video/${video_id}`
        );
      }
    }

    return NextResponse.json({ success: true, isLiked });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
