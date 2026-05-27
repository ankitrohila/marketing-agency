import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const POSTS_FILE = path.join(process.cwd(), 'data', 'posts.json');

function readPosts() {
  try {
    const raw = fs.readFileSync(POSTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writePosts(posts: unknown[]) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const posts = readPosts();
  const post = posts.find(
    (p: { id: string; slug: string }) => p.id === id || p.slug === id
  );

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = request.headers.get('x-admin-token');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const posts = readPosts();
  const idx = posts.findIndex(
    (p: { id: string; slug: string }) => p.id === id || p.slug === id
  );

  if (idx === -1) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  posts[idx] = { ...posts[idx], ...body, updatedAt: new Date().toISOString() };
  writePosts(posts);

  return NextResponse.json({ post: posts[idx] });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = request.headers.get('x-admin-token');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const posts = readPosts();
  const idx = posts.findIndex(
    (p: { id: string }) => p.id === id
  );

  if (idx === -1) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  posts.splice(idx, 1);
  writePosts(posts);

  return NextResponse.json({ success: true });
}
