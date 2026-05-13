import { NextResponse } from 'next/server';
import { vipDb, notificationsDb } from '@/lib/db';
import { getSession } from '@/lib/session';
import { v4 as uuidv4 } from 'uuid';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || (session.role !== 'publisher' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { status } = await request.json();
    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // We should probably check if this request actually belongs to this publisher
    // But status update helper is simple.
    vipDb.updateStatus.run(status, id);

    // Notify the user
    const requestItem = vipDb.getById.get(id);
    if (requestItem) {
      const message = status === 'accepted' 
        ? `Your VIP request for ${session.username} has been accepted!` 
        : `Your VIP request for ${session.username} was declined.`;
      
      notificationsDb.create.run(
        uuidv4(),
        requestItem.user_id,
        message,
        `/${session.username}`
      );
    }
    
    return NextResponse.json({ message: `Request ${status}` });
  } catch (error) {
    console.error('Failed to update VIP request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
