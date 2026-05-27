"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/sections/Footer";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CATEGORIES = [
  "All",
  "Performance Marketing",
  "Brand Strategy",
  "Creative Studio",
  "Media Distribution",
  "Conversion & CRO",
  "AI & MarTech",
  "Case Studies",
  "Growth Insights",
  "Industry Trends",
  "D2C Growth",
  "Startup Marketing",
  "Analytics & Data",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Performance Marketing": "#E8312A",
  "Brand Strategy": "#8B5CF6",
  "Creative Studio": "#F472B6",
  "Media Distribution": "#38BDF8",
  "Conversion & CRO": "#FB923C",
  "AI & MarTech": "#34D399",
  "Case Studies": "#FBBF24",
  "Growth Insights": "#A78BFA",
  "Industry Trends": "#60A5FA",
  "D2C Growth": "#F87171",
  "Startup Marketing": "#4ADE80",
  "Analytics & Data": "#2DD4BF",
};

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: { name: string; role: string; avatar: string };
  coverImage: string;
  publishedAt: string;
  readTime: string;
  featured: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function BlogPage() {
  const heroRef = useRef<HTMLElement>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filtered, setFiltered] = useState<Post[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const PER_PAGE = 9;

  useEffect(() => {
    fetch("/api/posts?status=published")
      .then((r) => r.json())
      .then((d) => {
        setPosts(d.posts || []);
        setFiltered(d.posts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const applyFilters = useCallback(() => {
    let result = [...posts];
    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
    setPage(1);
  }, [posts, activeCategory, search]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useGSAP(() => {
    gsap.from(".blog-hero-word", {
      y: "100%",
      stagger: 0.06,
      duration: 0.9,
      ease: "power4.out",
    });
    gsap.from(".blog-hero-sub", {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.7,
      delay: 0.5,
    });
    gsap.utils.toArray<HTMLElement>(".post-card").forEach((card) => {
      gsap.from(card, {
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 88%", once: true },
      });
    });
  }, { scope: heroRef, dependencies: [filtered] });

  const featured = posts.find((p) => p.featured);
  const nonFeatured = filtered.filter((p) => !p.featured || activeCategory !== "All" || search);
  const totalPages = Math.ceil(nonFeatured.length / PER_PAGE);
  const paginated = nonFeatured.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      {/* Hero */}
      <section
        ref={heroRef}
        className="page-hero"
        style={{
          position: "relative",
          paddingTop: "calc(var(--nav-h) + 80px)",
          paddingBottom: 80,
          paddingLeft: 40,
          paddingRight: 40,
          overflow: "hidden",
          background: "var(--bt-black)",
        }}
      >
        <div
          className="bg-grid"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.3,
            maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent 90%)",
          }}
        />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="blog-hero-sub" style={{ marginBottom: 24 }}>
            <span className="chip">Latest Insights</span>
          </div>
          <h1 style={{ overflow: "hidden" }}>
            {["Ideas that", "move brands."].map((w, i) => (
              <div key={i} style={{ overflow: "hidden" }}>
                <span
                  className="blog-hero-word"
                  style={{
                    display: "block",
                    fontSize: "clamp(2.5rem, 8vw, 7rem)",
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    lineHeight: 1.0,
                    color: i === 1 ? "var(--bt-red)" : "var(--bt-white)",
                  }}
                >
                  {w}
                </span>
              </div>
            ))}
          </h1>
          <p
            className="blog-hero-sub"
            style={{
              marginTop: 28,
              fontSize: "1.125rem",
              color: "var(--bt-muted)",
              maxWidth: 500,
              lineHeight: 1.75,
            }}
          >
            Strategy frameworks, case studies, and market intelligence from the BrandThink team.
          </p>

          {/* Search */}
          <div className="blog-hero-sub" style={{ marginTop: 32, maxWidth: 480 }}>
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                background: "var(--bt-surface)",
                border: "1px solid var(--bt-border)",
                borderRadius: 99,
                padding: "12px 20px",
                color: "var(--bt-white)",
                fontSize: "0.9375rem",
                outline: "none",
              }}
            />
          </div>
        </div>
      </section>

      {/* Category filters */}
      <section style={{ background: "var(--bt-black)", padding: "0 40px 40px" }}>
        <div className="container">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 99,
                  border: "1px solid",
                  borderColor: activeCategory === cat ? "var(--bt-red)" : "var(--bt-border)",
                  background: activeCategory === cat ? "rgba(232,49,42,0.12)" : "transparent",
                  color: activeCategory === cat ? "var(--bt-red)" : "var(--bt-muted)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featured && activeCategory === "All" && !search && (
        <section style={{ background: "var(--bt-black)", padding: "0 40px 60px" }}>
          <div className="container">
            <Link
              href={`/blog/${featured.slug}`}
              className="featured-post-grid post-card card"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 0,
                textDecoration: "none",
                borderRadius: 20,
                overflow: "hidden",
                minHeight: 400,
                transition: "transform 0.3s var(--ease-out), border-color 0.3s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              <div
                className="featured-post-img"
                style={{
                  height: "100%",
                  minHeight: 360,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <img
                  src={featured.coverImage}
                  alt={featured.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "absolute",
                    inset: 0,
                    transition: "transform 0.6s var(--ease-out)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to right, rgba(17,17,17,0.3), transparent)",
                  }}
                />
              </div>
              <div style={{ padding: "40px 40px", display: "flex", flexDirection: "column", justifyContent: "center", background: "var(--bt-card)" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: 99,
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      background: `${CATEGORY_COLORS[featured.category] || "#E8312A"}20`,
                      color: CATEGORY_COLORS[featured.category] || "#E8312A",
                      border: `1px solid ${CATEGORY_COLORS[featured.category] || "#E8312A"}40`,
                    }}
                  >
                    {featured.category}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--bt-muted)" }}>
                    {featured.readTime} read
                  </span>
                </div>
                <h2 style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.875rem)", fontWeight: 800, color: "var(--bt-white)", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 16 }}>
                  {featured.title}
                </h2>
                <p style={{ color: "var(--bt-muted)", fontSize: "0.9375rem", lineHeight: 1.7, marginBottom: 24 }}>
                  {featured.excerpt}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img src={featured.author.avatar} alt={featured.author.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                  <div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--bt-white)" }}>{featured.author.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--bt-muted)" }}>{formatDate(featured.publishedAt)}</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Post grid */}
      <section style={{ background: "var(--bt-black)", padding: "0 40px 80px" }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--bt-muted)" }}>
              Loading articles...
            </div>
          ) : paginated.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--bt-muted)" }}>
              No articles found.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 380px), 1fr))",
                gap: 28,
              }}
            >
              {paginated.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="post-card card"
                  style={{ textDecoration: "none", display: "flex", flexDirection: "column", borderRadius: 16, overflow: "hidden" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                >
                  <div style={{ height: 220, overflow: "hidden", position: "relative", flexShrink: 0 }}>
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s var(--ease-out)" }}
                    />
                    <div style={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      padding: "4px 10px",
                      borderRadius: 99,
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      background: `${CATEGORY_COLORS[post.category] || "#E8312A"}CC`,
                      color: "#fff",
                      backdropFilter: "blur(8px)",
                    }}>
                      {post.category}
                    </div>
                  </div>
                  <div style={{ padding: "22px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--bt-white)", letterSpacing: "-0.02em", lineHeight: 1.4, marginBottom: 10 }}>
                      {post.title}
                    </h3>
                    <p style={{
                      color: "var(--bt-muted)",
                      fontSize: "0.875rem",
                      lineHeight: 1.65,
                      flex: 1,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}>
                      {post.excerpt}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--bt-border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <img src={post.author.avatar} alt={post.author.name} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                        <div>
                          <div style={{ fontSize: "0.75rem", color: "var(--bt-muted)" }}>{formatDate(post.publishedAt)}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--bt-muted)" }}>{post.readTime}</span>
                    </div>
                    <div style={{ marginTop: 16, color: "var(--bt-red)", fontSize: "0.875rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      Read More
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 56 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: "10px 20px",
                  borderRadius: 99,
                  border: "1px solid var(--bt-border)",
                  background: "transparent",
                  color: page === 1 ? "var(--bt-dim)" : "var(--bt-white)",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 99,
                    border: "1px solid",
                    borderColor: n === page ? "var(--bt-red)" : "var(--bt-border)",
                    background: n === page ? "rgba(232,49,42,0.12)" : "transparent",
                    color: n === page ? "var(--bt-red)" : "var(--bt-muted)",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: "10px 20px",
                  borderRadius: 99,
                  border: "1px solid var(--bt-border)",
                  background: "transparent",
                  color: page === totalPages ? "var(--bt-dim)" : "var(--bt-white)",
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section style={{ background: "var(--bt-surface)", padding: "80px 40px" }}>
        <div className="container">
          <div
            style={{
              background: "linear-gradient(135deg, rgba(232,49,42,0.08) 0%, rgba(255,140,25,0.05) 100%)",
              border: "1px solid rgba(232,49,42,0.15)",
              borderRadius: 24,
              padding: "60px 40px",
              textAlign: "center",
            }}
          >
            <span className="chip" style={{ marginBottom: 20 }}>Newsletter</span>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, color: "var(--bt-white)", letterSpacing: "-0.035em", marginBottom: 16 }}>
              Get insights in your inbox.
            </h2>
            <p style={{ color: "var(--bt-muted)", fontSize: "1.0625rem", marginBottom: 32, maxWidth: 460, margin: "0 auto 32px" }}>
              Join 2,400+ marketers who get our best frameworks, case studies, and market intelligence — every two weeks.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <input
                type="email"
                placeholder="your@email.com"
                style={{
                  padding: "14px 20px",
                  borderRadius: 99,
                  border: "1px solid var(--bt-border)",
                  background: "var(--bt-black)",
                  color: "var(--bt-white)",
                  fontSize: "0.9375rem",
                  outline: "none",
                  minWidth: 240,
                }}
              />
              <button className="btn btn-primary">
                Subscribe
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
