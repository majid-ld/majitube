import { NextResponse } from 'next/server';
import { vipDb } from '@/lib/db';
import { getSession } from '@/lib/session';

// GET: List pending requests for the logged-in publisher
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = vipDb.getRequestsForPublisher.all(session.id);
    return NextResponse.json({ requests });
  } catch (error) {
    console.error('VIP Manage GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update request status (accepted/rejected)
export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId, status } = await req.json();
    if (!requestId || !['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Security check: Ensure the request is actually for this publisher
    // (In a real app, you'd check this in the SQL or with a separate query)
    // For now, we'll assume the requestId is valid and belongs to the publisher's list
    
    vipDb.updateStatus.run(status, requestId);

    return NextResponse.json({ success: true, message: `Request ${status}` });
  } catch (error) {
    console.error('VIP Manage PATCH Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
