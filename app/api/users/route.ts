import { NextRequest, NextResponse } from 'next/server';
import { usersDb } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const users = role 
      ? usersDb.getAll.all().filter((u: any) => u.role === role)
      : usersDb.getAll.all();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Failed to get users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
