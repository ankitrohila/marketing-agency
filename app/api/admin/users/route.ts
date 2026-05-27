import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeUsers(users: unknown[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

function getRequestingUser(token: string) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId] = decoded.split(':');
    const users = readUsers();
    return users.find((u: { id: string }) => u.id === userId);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const users = readUsers().map((u: { password: string; [key: string]: unknown }) => {
    const { password: _pw, ...safe } = u;
    return safe;
  });

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const requester = getRequestingUser(token);
  if (!requester || !['super_admin', 'admin'].includes(requester.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const users = readUsers();

  if (users.find((u: { email: string }) => u.email === body.email)) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
  }

  const newUser = {
    id: String(Date.now()),
    name: body.name,
    email: body.email,
    password: body.password || 'changeme123',
    role: body.role || 'viewer',
    avatar: body.avatar || `https://i.pravatar.cc/64?img=${Math.floor(Math.random() * 70)}`,
    createdAt: new Date().toISOString(),
    status: 'active',
  };

  users.push(newUser);
  writeUsers(users);

  const { password: _pw, ...safeUser } = newUser;
  return NextResponse.json({ user: safeUser }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const requester = getRequestingUser(token);
  if (!requester || !['super_admin', 'admin'].includes(requester.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const users = readUsers();
  const idx = users.findIndex((u: { id: string }) => u.id === body.id);

  if (idx === -1) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (body.role && requester.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super_admin can change roles' }, { status: 403 });
  }

  users[idx] = { ...users[idx], ...body, updatedAt: new Date().toISOString() };
  writeUsers(users);

  const { password: _pw, ...safeUser } = users[idx];
  return NextResponse.json({ user: safeUser });
}

export async function DELETE(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const requester = getRequestingUser(token);
  if (!requester || requester.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super_admin can delete users' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'User id required' }, { status: 400 });

  const users = readUsers();
  const idx = users.findIndex((u: { id: string }) => u.id === id);
  if (idx === -1) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  users.splice(idx, 1);
  writeUsers(users);

  return NextResponse.json({ success: true });
}
