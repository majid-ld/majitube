import { NextResponse } from 'next/server';
import { usersDb } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { role } = await req.json();
    if (!['admin', 'publisher', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Await params since Next.js 15 requires awaiting dynamic route params in some cases
    const { id } = await Promise.resolve(params);

    await usersDb.updateRole(id, role);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update user role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
