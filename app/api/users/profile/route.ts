import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { usersDb, historyDb } from '@/lib/db';
import { getSession, createSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await usersDb.getByEmail(session.email);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const history = await historyDb.getByUserId(session.id);
    
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

    const { username, email, avatar_url, bio, tiktok, snapchat, instagram, facebook, new_password } = await req.json();

    await usersDb.updateProfile(
      username, 
      email, 
      avatar_url || undefined, 
      bio || undefined, 
      tiktok || undefined, 
      snapchat || undefined, 
      instagram || undefined, 
      facebook || undefined, 
      session.id
    );

    if (new_password) {
      const hashedPassword = await bcrypt.hash(new_password, 10);
      await usersDb.updatePassword(hashedPassword, session.id);
    }

    // Refresh session with new data
    const updatedUser = await usersDb.getById(session.id);
    if (updatedUser) {
      await createSession(updatedUser);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
