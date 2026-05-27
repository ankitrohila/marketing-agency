import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const POSTS_FILE = path.join(process.cwd(), 'data', 'posts.json');

const CATEGORIES = [
  { name: 'Performance Marketing', slug: 'performance-marketing', color: '#E8312A', description: 'Paid acquisition, ROAS optimisation, and demand generation strategies.' },
  { name: 'Brand Strategy', slug: 'brand-strategy', color: '#8B5CF6', description: 'Positioning, identity, and long-term brand equity building.' },
  { name: 'Creative Studio', slug: 'creative-studio', color: '#F472B6', description: 'Design thinking, visual identity, and creative production insights.' },
  { name: 'Media Distribution', slug: 'media-distribution', color: '#38BDF8', description: 'Content distribution systems, channels, and organic reach strategies.' },
  { name: 'Conversion & CRO', slug: 'conversion-cro', color: '#FB923C', description: 'A/B testing, landing page optimisation, and funnel improvement.' },
  { name: 'AI & MarTech', slug: 'ai-martech', color: '#34D399', description: 'Artificial intelligence, marketing technology, and automation workflows.' },
  { name: 'Case Studies', slug: 'case-studies', color: '#FBBF24', description: 'In-depth brand and campaign case studies from real client engagements.' },
  { name: 'Growth Insights', slug: 'growth-insights', color: '#A78BFA', description: 'Frameworks, mental models, and strategic perspectives on growth.' },
  { name: 'Industry Trends', slug: 'industry-trends', color: '#60A5FA', description: 'What is changing in marketing, media, and consumer behaviour.' },
  { name: 'D2C Growth', slug: 'd2c-growth', color: '#F87171', description: 'Direct-to-consumer brand building, acquisition, and retention strategies.' },
  { name: 'Startup Marketing', slug: 'startup-marketing', color: '#4ADE80', description: 'Go-to-market strategy, early traction, and growth loops for startups.' },
  { name: 'Analytics & Data', slug: 'analytics-data', color: '#2DD4BF', description: 'Measurement frameworks, attribution, and data-driven decision making.' },
];

export async function GET(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let posts: { category: string }[] = [];
  try {
    posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
  } catch {
    posts = [];
  }

  const categoriesWithCount = CATEGORIES.map((cat) => ({
    ...cat,
    postCount: posts.filter((p) => p.category === cat.name).length,
  }));

  return NextResponse.json({ categories: categoriesWithCount });
}
