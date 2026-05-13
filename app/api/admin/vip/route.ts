import { NextResponse } from 'next/server';
import { vipDb, usersDb } from '@/lib/db';
import { getSession } from '@/lib/session';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const publisherId = searchParams.get('publisherId');

    const subscribers = publisherId 
      ? await vipDb.getVipSubscribers(publisherId)
      : await vipDb.getAllGlobal();
    return NextResponse.json({ subscribers });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { user_email, publisher_email, expires_at } = await request.json();

    const user = await usersDb.getByEmail(user_email);
    const publisher = await usersDb.getByEmail(publisher_email);

    if (!user || !publisher) {
      return NextResponse.json({ error: 'User or Publisher not found' }, { status: 404 });
    }

    if (publisher.role !== 'publisher' && publisher.role !== 'admin') {
      return NextResponse.json({ error: 'Target is not a publisher' }, { status: 400 });
    }

    await vipDb.grantAccess(uuidv4(), user.id, publisher.id, expires_at || null);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin grant VIP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
