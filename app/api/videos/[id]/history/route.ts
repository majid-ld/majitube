import { NextResponse } from 'next/server';
import { historyDb } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false }); // silently fail for unauth

    const { id: video_id } = await params;
    await historyDb.add(session.id, video_id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
