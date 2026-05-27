import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const REDIRECTS_FILE = path.join(process.cwd(), 'data', 'redirects.json');

function readRedirects() {
  try {
    return JSON.parse(fs.readFileSync(REDIRECTS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeRedirects(data: unknown[]) {
  fs.writeFileSync(REDIRECTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({ redirects: readRedirects() });
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const redirects = readRedirects();

  const newRedirect = {
    id: String(Date.now()),
    from: body.from,
    to: body.to,
    type: body.type || '301',
    active: true,
    createdAt: new Date().toISOString(),
  };

  redirects.push(newRedirect);
  writeRedirects(redirects);

  return NextResponse.json({ redirect: newRedirect }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const redirects = readRedirects();
  const idx = redirects.findIndex((r: { id: string }) => r.id === body.id);

  if (idx === -1) return NextResponse.json({ error: 'Redirect not found' }, { status: 404 });

  redirects[idx] = { ...redirects[idx], ...body };
  writeRedirects(redirects);

  return NextResponse.json({ redirect: redirects[idx] });
}

export async function DELETE(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const redirects = readRedirects();
  const idx = redirects.findIndex((r: { id: string }) => r.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  redirects.splice(idx, 1);
  writeRedirects(redirects);

  return NextResponse.json({ success: true });
}
