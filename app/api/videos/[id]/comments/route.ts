import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { commentsDb, videosDb, notificationsDb } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: video_id } = await params;
    const comments = commentsDb.getByVideoId.all(video_id);
    return NextResponse.json({ comments });
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

    const { content, parentId } = await req.json();
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid comment content' }, { status: 400 });
    }

    const { id: video_id } = await params;
    const commentId = uuidv4();

    commentsDb.insert.run(commentId, video_id, session.id, content.trim(), parentId || null);
    
    // Notify the parent comment author or the video publisher
    if (parentId) {
      const parentComment = commentsDb.getById.get(parentId);
      if (parentComment && parentComment.user_id !== session.id) {
        notificationsDb.create.run(
          uuidv4(),
          parentComment.user_id,
          `${session.email.split('@')[0]} replied to your comment.`,
          `/video/${video_id}`
        );
      }
    } else {
      const video = videosDb.getById.get(video_id);
      if (video && video.publisher_id && video.publisher_id !== session.id) {
        notificationsDb.create.run(
          uuidv4(),
          video.publisher_id,
          `${session.email.split('@')[0]} commented on your video: "${video.title}"`,
          `/video/${video_id}`
        );
      }
    }

    return NextResponse.json({ success: true, commentId });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
