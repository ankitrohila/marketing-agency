import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PAGES_FILE = path.join(process.cwd(), "data", "pages.json");

const DEFAULT_PAGES = [
  { id: "home",                title: "Home",                slug: "/",                              parentId: null,       metaTitle: "BrandThink — MarTech & Creative Agency",           metaDescription: "BrandThink crafts standout campaigns that drive real growth through creativity, data, and cutting-edge technology.", noindex: false, ogImage: "", status: "published", isBuiltIn: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
  { id: "about",               title: "About",               slug: "/about",                         parentId: null,       metaTitle: "About BrandThink — Our Story & Team",             metaDescription: "Learn about BrandThink, India's leading MarTech and creative agency.", noindex: false, ogImage: "", status: "published", isBuiltIn: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
  { id: "services",            title: "Services",            slug: "/services",                      parentId: null,       metaTitle: "Our Services — BrandThink",                       metaDescription: "From brand strategy to AI & MarTech, explore our full suite of marketing services.", noindex: false, ogImage: "", status: "published", isBuiltIn: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
  { id: "brand-strategy",      title: "Brand Strategy",      slug: "/services/brand-strategy",       parentId: "services", metaTitle: "Brand Strategy Services — BrandThink",            metaDescription: "Build a distinctive, enduring brand with BrandThink's expert strategy team.", noindex: false, ogImage: "", status: "published", isBuiltIn: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
  { id: "creative-studio",     title: "Creative Studio",     slug: "/services/creative-studio",      parentId: "services", metaTitle: "Creative Studio — BrandThink",                    metaDescription: "High-impact creative production for brands that want to stand out.", noindex: false, ogImage: "", status: "published", isBuiltIn: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
  { id: "media-distribution",  title: "Media Distribution",  slug: "/services/media-distribution",   parentId: "services", metaTitle: "Media Distribution — BrandThink",                 metaDescription: "Reach your audience at scale with BrandThink's media distribution network.", noindex: false, ogImage: "", status: "published", isBuiltIn: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
  { id: "performance-mktg",    title: "Performance Marketing", slug: "/services/performance-marketing", parentId: "services", metaTitle: "Performance Marketing — BrandThink",             metaDescription: "Data-driven performance marketing that grows your revenue.", noindex: false, ogImage: "", status: "published", isBuiltIn: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
  { id: "conversion-cro",      title: "Conversion & CRO",    slug: "/services/conversion-cro",       parentId: "services", metaTitle: "Conversion & CRO — BrandThink",                  metaDescription: "Turn traffic into customers with BrandThink's CRO expertise.", noindex: false, ogImage: "", status: "published", isBuiltIn: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
  { id: "ai-martech",          title: "AI & MarTech",         slug: "/services/ai-martech",           parentId: "services", metaTitle: "AI & MarTech Services — BrandThink",              metaDescription: "Harness AI and marketing technology to outpace your competition.", noindex: false, ogImage: "", status: "published", isBuiltIn: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
  { id: "work",                title: "Our Work",             slug: "/work",                          parentId: null,       metaTitle: "Our Work — BrandThink Portfolio",                 metaDescription: "See BrandThink's portfolio of brand, creative, and performance marketing work.", noindex: false, ogImage: "", status: "published", isBuiltIn: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
  { id: "blog",                title: "Blog",                 slug: "/blog",                          parentId: null,       metaTitle: "Blog — BrandThink Insights",                      metaDescription: "Marketing insights, case studies, and growth strategies from BrandThink.", noindex: false, ogImage: "", status: "published", isBuiltIn: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
  { id: "contact",             title: "Contact",              slug: "/contact",                       parentId: null,       metaTitle: "Contact BrandThink",                              metaDescription: "Get in touch with BrandThink to start your brand journey.", noindex: false, ogImage: "", status: "published", isBuiltIn: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
  { id: "pricing",             title: "Pricing",              slug: "/pricing",                       parentId: null,       metaTitle: "Pricing — BrandThink Packages",                  metaDescription: "Transparent pricing for BrandThink's marketing services and packages.", noindex: false, ogImage: "", status: "published", isBuiltIn: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
];

function readPages() {
  try {
    return JSON.parse(fs.readFileSync(PAGES_FILE, "utf-8"));
  } catch {
    return DEFAULT_PAGES;
  }
}

function writePages(data: unknown[]) {
  const dir = path.dirname(PAGES_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(PAGES_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ pages: readPages() });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const pages = readPages();
  const newPage = {
    id: crypto.randomUUID(),
    title: body.title,
    slug: body.slug,
    parentId: body.parentId || null,
    metaTitle: body.metaTitle || "",
    metaDescription: body.metaDescription || "",
    noindex: body.noindex || false,
    ogImage: body.ogImage || "",
    status: body.status || "published",
    isBuiltIn: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  pages.push(newPage);
  writePages(pages);
  return NextResponse.json({ page: newPage }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const pages = readPages();
  const idx = pages.findIndex((p: { id: string }) => p.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  pages[idx] = { ...pages[idx], ...body, updatedAt: new Date().toISOString() };
  writePages(pages);
  return NextResponse.json({ page: pages[idx] });
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const pages = readPages();
  const page = pages.find((p: { id: string; isBuiltIn?: boolean }) => p.id === id);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (page.isBuiltIn) return NextResponse.json({ error: "Cannot delete built-in pages" }, { status: 403 });
  writePages(pages.filter((p: { id: string }) => p.id !== id));
  return NextResponse.json({ success: true });
}
