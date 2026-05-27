import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SEO_FILE = path.join(process.cwd(), 'data', 'seo.json');

function readSeo() {
  try {
    return JSON.parse(fs.readFileSync(SEO_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function writeSeo(data: unknown) {
  fs.writeFileSync(SEO_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json(readSeo());
}

export async function PUT(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const current = readSeo();

  const updated = {
    ...current,
    ...body,
    global: body.global ? { ...current.global, ...body.global } : current.global,
    pages: body.pages ? { ...current.pages, ...body.pages } : current.pages,
  };

  writeSeo(updated);
  return NextResponse.json(updated);
}
