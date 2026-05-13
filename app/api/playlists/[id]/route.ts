import { NextResponse } from 'next/server';
import { playlistsDb } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: playlist_id } = await params;
    const videos = await playlistsDb.getVideos(playlist_id);
    return NextResponse.json({ videos });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: playlist_id } = await params;
    const { video_id } = await req.json();

    await playlistsDb.addVideo(playlist_id, video_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: playlist_id } = await params;
    const url = new URL(req.url);
    const video_id = url.searchParams.get('video_id');

    if (video_id) {
      await playlistsDb.removeVideo(playlist_id, video_id);
    } else {
      await playlistsDb.delete(playlist_id, session.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
