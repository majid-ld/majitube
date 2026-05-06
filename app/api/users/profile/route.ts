import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { usersDb, historyDb } from '@/lib/db';
import { getSession, createSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = usersDb.getByEmail.get(session.email);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const history = historyDb.getByUserId.all(session.id);
    
    // Don't send password hash
    const { password_hash, ...safeUser } = user;
    
    return NextResponse.json({ user: safeUser, history });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { username, email, avatar_url, new_password } = await req.json();

    usersDb.updateProfile.run(username, email, avatar_url || null, session.id);

    if (new_password) {
      const hashedPassword = await bcrypt.hash(new_password, 10);
      usersDb.updatePassword.run(hashedPassword, session.id);
    }

    // Refresh session with new data
    const updatedUser = usersDb.getById.get(session.id);
    if (updatedUser) {
      await createSession(updatedUser);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
