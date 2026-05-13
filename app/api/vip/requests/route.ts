import { NextResponse } from 'next/server';
import { vipDb } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only publishers/admins can see requests meant for them
    if (session.role !== 'publisher' && session.role !== 'admin') {
      return NextResponse.json({ requests: [], accepted: [] });
    }

    const requests = await vipDb.getRequestsForPublisher(session.id);
    const accepted = await vipDb.getVipSubscribers(session.id);
    return NextResponse.json({ requests, accepted });
  } catch (error) {
    console.error('Failed to get VIP requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
