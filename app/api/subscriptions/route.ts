import { NextResponse } from 'next/server';
import { subscriptionsDb } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { publisher_id } = await req.json();
    if (!publisher_id) return NextResponse.json({ error: 'Missing publisher_id' }, { status: 400 });

    if (session.id === publisher_id) {
      return NextResponse.json({ error: 'Cannot subscribe to yourself' }, { status: 400 });
    }

    const isSubscribed = subscriptionsDb.toggle(session.id, publisher_id);
    return NextResponse.json({ success: true, isSubscribed });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const publisher_id = url.searchParams.get('publisher_id');

    if (!publisher_id) {
      return NextResponse.json({ error: 'Missing publisher_id' }, { status: 400 });
    }

    const countRes = subscriptionsDb.countSubscribers.get(publisher_id);
    const subscribers = countRes ? countRes.count : 0;

    let isSubscribed = false;
    const session = await getSession();
    if (session) {
      const subRes = subscriptionsDb.isSubscribed.get(session.id, publisher_id);
      if (subRes && subRes.count > 0) isSubscribed = true;
    }

    return NextResponse.json({ subscribers, isSubscribed });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
