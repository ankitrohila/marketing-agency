import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(process.cwd());
const BLOCKED_DIRS = ['node_modules', '.next', '.git'];
const BLOCKED_FILES = ['.env', '.env.local', '.env.production', '.env.development'];

function isSafePath(targetPath: string): boolean {
  const resolved = path.resolve(targetPath);
  if (!resolved.startsWith(PROJECT_ROOT)) return false;

  const relative = path.relative(PROJECT_ROOT, resolved);
  const parts = relative.split(path.sep);

  for (const part of parts) {
    if (BLOCKED_DIRS.includes(part)) return false;
  }

  const basename = path.basename(resolved);
  if (BLOCKED_FILES.includes(basename) || basename.startsWith('.env')) return false;

  return true;
}

function getFileTree(dirPath: string, maxDepth = 3, currentDepth = 0): unknown[] {
  if (currentDepth >= maxDepth) return [];
  if (!fs.existsSync(dirPath)) return [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => {
        if (BLOCKED_DIRS.includes(entry.name)) return false;
        if (entry.name.startsWith('.') && !entry.isDirectory()) return false;
        return true;
      })
      .map((entry) => {
        const fullPath = path.join(dirPath, entry.name);
        const relative = path.relative(PROJECT_ROOT, fullPath);
        if (entry.isDirectory()) {
          return {
            name: entry.name,
            type: 'dir',
            path: relative,
            children: getFileTree(fullPath, maxDepth, currentDepth + 1),
          };
        } else {
          let size = 0;
          let modified = '';
          try {
            const stat = fs.statSync(fullPath);
            size = stat.size;
            modified = stat.mtime.toISOString();
          } catch {
            // ignore
          }
          return {
            name: entry.name,
            type: 'file',
            path: relative,
            size,
            modified,
          };
        }
      });
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const relativePath = searchParams.get('path') || '';
  const readFile = searchParams.get('read') === '1';

  const targetPath = relativePath
    ? path.resolve(PROJECT_ROOT, relativePath)
    : PROJECT_ROOT;

  if (!isSafePath(targetPath)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  if (!fs.existsSync(targetPath)) {
    return NextResponse.json({ error: 'Path not found' }, { status: 404 });
  }

  const stat = fs.statSync(targetPath);

  if (stat.isDirectory()) {
    const entries = getFileTree(targetPath, 1);
    return NextResponse.json({ entries, path: relativePath });
  }

  if (readFile) {
    const ext = path.extname(targetPath).toLowerCase();
    const binaryExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.woff', '.woff2', '.ttf', '.eot'];
    if (binaryExts.includes(ext)) {
      return NextResponse.json({ error: 'Binary file cannot be read as text' }, { status: 400 });
    }
    const content = fs.readFileSync(targetPath, 'utf-8');
    return NextResponse.json({ content, path: relativePath, size: stat.size, modified: stat.mtime.toISOString() });
  }

  return NextResponse.json({
    name: path.basename(targetPath),
    type: 'file',
    path: relativePath,
    size: stat.size,
    modified: stat.mtime.toISOString(),
  });
}

export async function PUT(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { path: relativePath, content } = body;

  if (!relativePath || content === undefined) {
    return NextResponse.json({ error: 'path and content required' }, { status: 400 });
  }

  const targetPath = path.resolve(PROJECT_ROOT, relativePath);

  if (!isSafePath(targetPath)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    return NextResponse.json({ error: 'Parent directory does not exist' }, { status: 400 });
  }

  fs.writeFileSync(targetPath, content, 'utf-8');

  const stat = fs.statSync(targetPath);
  return NextResponse.json({ success: true, size: stat.size, modified: stat.mtime.toISOString() });
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const relativePath = searchParams.get('path') || '';
  const targetPath = path.resolve(PROJECT_ROOT, relativePath);

  if (!isSafePath(targetPath)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const tree = getFileTree(PROJECT_ROOT, 4);
  return NextResponse.json({ tree, root: PROJECT_ROOT });
}
