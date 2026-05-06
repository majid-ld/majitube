import { NextResponse } from 'next/server';
import { roleRequestsDb, usersDb, notificationsDb } from '@/lib/db';
import { getSession } from '@/lib/session';
import { v4 as uuidv4 } from 'uuid';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { status } = await request.json(); // 'accepted' or 'rejected'
    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const roleReq = roleRequestsDb.getById.get(id);
    if (!roleReq) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    roleRequestsDb.updateStatus.run(status, id);

    if (status === 'accepted') {
      usersDb.updateRole.run(roleReq.requested_role, roleReq.user_id);
      
      notificationsDb.create.run(
        uuidv4(),
        roleReq.user_id,
        `Your request for ${roleReq.requested_role} status has been approved!`,
        '/profile'
      );
    } else {
       notificationsDb.create.run(
        uuidv4(),
        roleReq.user_id,
        `Your request for ${roleReq.requested_role} status was not approved at this time.`,
        '/profile'
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Role request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
