import { NextResponse } from 'next/server';
import { roleRequestsDb } from '@/lib/db';
import { getSession } from '@/lib/session';
import { v4 as uuidv4 } from 'uuid';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Already a publisher or admin
    if (session.role !== 'viewer') {
      return NextResponse.json({ error: 'You are already a publisher or admin' }, { status: 400 });
    }

    await roleRequestsDb.create(uuidv4(), session.id, 'publisher');

    return NextResponse.json({ success: true, message: 'Request submitted successfully' });
  } catch (error) {
    console.error('Request publisher error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const request = await roleRequestsDb.getByUserId(session.id);
    return NextResponse.json({ request });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
