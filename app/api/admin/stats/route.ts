import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const POSTS_FILE = path.join(process.cwd(), 'data', 'posts.json');
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

function readPosts() {
  try {
    return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const posts = readPosts();
  const users = readUsers();

  const publishedPosts = posts.filter((p: { status: string }) => p.status === 'published');
  const draftPosts = posts.filter((p: { status: string }) => p.status === 'draft');

  const monthlyVisitors = [
    { month: 'Jun', count: 3200 },
    { month: 'Jul', count: 4100 },
    { month: 'Aug', count: 3800 },
    { month: 'Sep', count: 5200 },
    { month: 'Oct', count: 6100 },
    { month: 'Nov', count: 5800 },
    { month: 'Dec', count: 4900 },
    { month: 'Jan', count: 6400 },
    { month: 'Feb', count: 7200 },
    { month: 'Mar', count: 8100 },
    { month: 'Apr', count: 9300 },
    { month: 'May', count: 10832 },
  ];

  const topPosts = publishedPosts.slice(0, 5).map((p: { title: string; slug: string; category: string }, i: number) => ({
    title: p.title,
    slug: p.slug,
    category: p.category,
    views: [12400, 9800, 8200, 6700, 5100][i] || 1000,
  }));

  const recentActivity = [
    { id: '1', type: 'post_published', description: 'Post "Why D2C Brands Fail..." was published', user: 'Aditya Raj', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: '2', type: 'user_login', description: 'Priya Sharma logged in', user: 'Priya Sharma', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
    { id: '3', type: 'post_draft', description: 'New draft created: "Influencer Marketing ROI"', user: 'Rohit Nair', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
    { id: '4', type: 'settings_updated', description: 'SEO settings updated for /blog', user: 'Aditya Raj', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
    { id: '5', type: 'post_published', description: 'Post "MarTech Stack..." was published', user: 'Aditya Raj', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { id: '6', type: 'user_created', description: 'New user Anjali Menon added as contributor', user: 'Aditya Raj', timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString() },
    { id: '7', type: 'redirect_created', description: 'Redirect /old-blog → /blog created', user: 'Aditya Raj', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
    { id: '8', type: 'post_draft', description: 'Draft "AI & Future of Creative" saved', user: 'Priya Sharma', timestamp: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString() },
  ];

  return NextResponse.json({
    totalPosts: posts.length,
    publishedPosts: publishedPosts.length,
    draftPosts: draftPosts.length,
    totalUsers: users.length,
    totalViews: 47832,
    totalLeads: 284,
    monthlyVisitors,
    topPosts,
    recentActivity,
  });
}
