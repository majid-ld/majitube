import { NextResponse } from 'next/server';
import { vipDb, notificationsDb } from '@/lib/db';
import { getSession } from '@/lib/session';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { publisherId } = await request.json();
    if (!publisherId) {
      return NextResponse.json({ error: 'Publisher ID is required' }, { status: 400 });
    }

    if (session.id === publisherId) {
      return NextResponse.json({ error: 'You cannot request VIP from yourself' }, { status: 400 });
    }

    const requestId = uuidv4();
    vipDb.request.run(requestId, session.id, publisherId);

    // Notify the publisher
    notificationsDb.create.run(
      uuidv4(),
      publisherId,
      `${session.username} requested VIP access to your cinematic content.`,
      `/dashboard/vip`
    );

    return NextResponse.json({ message: 'VIP request sent successfully' });
  } catch (error) {
    console.error('Failed to send VIP request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
