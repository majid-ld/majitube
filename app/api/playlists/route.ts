import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { playlistsDb } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const playlists = await playlistsDb.getByUserId(session.id);
    return NextResponse.json({ playlists });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name } = await req.json();
    if (!name || typeof name !== 'string') return NextResponse.json({ error: 'Invalid name' }, { status: 400 });

    const id = uuidv4();
    await playlistsDb.create(id, session.id, name);
    
    return NextResponse.json({ success: true, playlist: { id, name } });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
