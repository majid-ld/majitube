import { NextResponse } from 'next/server';
import { vipDb } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'publisher' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { expires_at } = await request.json();
    
    // id is the request id in vip_requests table
    vipDb.updateExpiry.run(expires_at || null, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update VIP expiry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
