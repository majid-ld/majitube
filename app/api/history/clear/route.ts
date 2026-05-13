import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import db from '@/lib/db';

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    db.prepare('DELETE FROM history WHERE user_id = ?').run(session.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
