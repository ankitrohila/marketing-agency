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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const limitParam = searchParams.get('limit');
  const status = searchParams.get('status') || 'published';

  let posts = readPosts();

  if (status !== 'all') {
    posts = posts.filter((p: { status: string }) => p.status === status);
  }

  if (category && category !== 'All') {
    posts = posts.filter((p: { category: string }) => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    posts = posts.filter(
      (p: { title: string; excerpt: string; tags: string[] }) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t: string) => t.toLowerCase().includes(q))
    );
  }

  if (limitParam) {
    const limit = parseInt(limitParam, 10);
    if (!isNaN(limit) && limit > 0) {
      posts = posts.slice(0, limit);
    }
  }

  return NextResponse.json({ posts, total: posts.length });
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const posts = readPosts();

  const newPost = {
    id: crypto.randomUUID(),
    ...body,
    publishedAt: body.publishedAt || new Date().toISOString(),
    status: body.status || 'draft',
  };

  posts.unshift(newPost);
  writePosts(posts);

  return NextResponse.json({ post: newPost }, { status: 201 });
}
