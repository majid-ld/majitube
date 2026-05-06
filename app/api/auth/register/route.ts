import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { usersDb } from '@/lib/db';
import { createSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existingUser = usersDb.getByEmail.get(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const countRes = usersDb.count.get();
    const isFirstUser = countRes && countRes.count === 0;
    
    // First user is admin, rest are viewer
    const role = isFirstUser ? 'admin' : 'viewer';

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    usersDb.insert.run(userId, username, email, hashedPassword, role);

    const newUser = { id: userId, username, email, password_hash: hashedPassword, role, created_at: new Date().toISOString() };
    
    await createSession(newUser);

    return NextResponse.json({ success: true, user: { id: userId, username, email, role } });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
