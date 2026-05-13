import { NextResponse } from 'next/server';
import { watchLaterDb } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ inWatchLater: false });
    }

    const inWatchLater = await watchLaterDb.isInWatchLater(session.id, id);
    return NextResponse.json({ inWatchLater });
  } catch (error) {
    console.error('Watch later check error:', error);
    return NextResponse.json({ inWatchLater: false });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const added = await watchLaterDb.toggle(session.id, id);

    return NextResponse.json({ added });
  } catch (error) {
    console.error('Watch later toggle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
