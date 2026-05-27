"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/sections/Footer";

gsap.registerPlugin(useGSAP, ScrollTrigger);

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
  content: string;
  category: string;
  tags: string[];
  author: { name: string; role: string; avatar: string };
  coverImage: string;
  publishedAt: string;
  readTime: string;
  featured: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function extractHeadings(html: string) {
  const matches = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)];
  return matches.map((m, i) => ({
    id: `heading-${i}`,
    text: m[1].replace(/<[^>]+>/g, ""),
  }));
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeHeading, setActiveHeading] = useState(0);
  const articleRef = useRef<HTMLElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/posts/${slug}`)
      .then((r) => r.json())
      .then(async (d) => {
        setPost(d.post);
        // Fetch related posts
        const rel = await fetch(`/api/posts?category=${encodeURIComponent(d.post?.category || "")}&limit=4`).then((r) => r.json());
        setRelated((rel.posts || []).filter((p: Post) => p.slug !== slug).slice(0, 3));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  useGSAP(() => {
    if (!post) return;
    gsap.from(".post-hero-content > *", {
      opacity: 0,
      y: 30,
      stagger: 0.12,
      duration: 0.8,
      ease: "power3.out",
    });
    gsap.from(".post-cover-img", {
      opacity: 0,
      scale: 1.04,
      duration: 1.2,
      ease: "power3.out",
      delay: 0.3,
    });
    gsap.utils.toArray<HTMLElement>(".related-card").forEach((card) => {
      gsap.from(card, {
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 88%", once: true },
      });
    });
  }, { scope: pageRef, dependencies: [post] });

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bt-black)", color: "var(--bt-muted)", fontSize: "1.125rem" }}>
        Loading...
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bt-black)", color: "var(--bt-white)", gap: 20 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Post not found</h1>
        <Link href="/blog" className="btn btn-primary">Back to Blog</Link>
      </div>
    );
  }

  const headings = extractHeadings(post.content);
  const categoryColor = CATEGORY_COLORS[post.category] || "#E8312A";

  return (
    <div ref={pageRef}>
      {/* Hero */}
      <section
        style={{
          background: "var(--bt-black)",
          paddingTop: "calc(var(--nav-h) + 60px)",
          paddingBottom: 0,
          overflow: "hidden",
        }}
      >
        <div className="container post-hero-content" style={{ padding: "0 40px", maxWidth: 900, margin: "0 auto" }}>
          {/* Back link */}
          <Link
            href="/blog"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--bt-muted)", fontSize: "0.875rem", textDecoration: "none", marginBottom: 28, transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--bt-white)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--bt-muted)")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>

          {/* Category + Meta */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            <span style={{
              padding: "5px 14px",
              borderRadius: 99,
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: `${categoryColor}20`,
              color: categoryColor,
              border: `1px solid ${categoryColor}40`,
            }}>
              {post.category}
            </span>
            <span style={{ fontSize: "0.8125rem", color: "var(--bt-muted)" }}>{formatDate(post.publishedAt)}</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--bt-dim)", flexShrink: 0 }} />
            <span style={{ fontSize: "0.8125rem", color: "var(--bt-muted)" }}>{post.readTime} read</span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 900,
            color: "var(--bt-white)",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            marginBottom: 24,
          }}>
            {post.title}
          </h1>

          {/* Excerpt */}
          <p style={{ fontSize: "1.125rem", color: "var(--bt-muted)", lineHeight: 1.75, marginBottom: 32 }}>
            {post.excerpt}
          </p>

          {/* Author */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 40, borderBottom: "1px solid var(--bt-border)" }}>
            <img src={post.author.avatar} alt={post.author.name} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
            <div>
              <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--bt-white)" }}>{post.author.name}</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--bt-muted)" }}>{post.author.role}</div>
            </div>
            {/* Share buttons */}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              {[
                { label: "Twitter", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://thebrandthink.com/blog/${post.slug}`)}` },
                { label: "LinkedIn", href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://thebrandthink.com/blog/${post.slug}`)}&title=${encodeURIComponent(post.title)}` },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "8px 14px",
                    borderRadius: 99,
                    border: "1px solid var(--bt-border)",
                    color: "var(--bt-muted)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--bt-red)"; (e.currentTarget as HTMLElement).style.color = "var(--bt-red)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--bt-border)"; (e.currentTarget as HTMLElement).style.color = "var(--bt-muted)"; }}
                >
                  Share on {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Cover image */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 40px 0" }}>
          <div style={{ borderRadius: 20, overflow: "hidden", height: 480 }}>
            <img
              src={post.coverImage}
              alt={post.title}
              className="post-cover-img"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* Article body */}
      <section
        ref={articleRef}
        style={{ background: "var(--bt-black)", padding: "60px 40px 100px" }}
      >
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: 60,
            alignItems: "start",
          }}
        >
          {/* Content */}
          <article>
            <div
              className="post-body"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--bt-border)" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 99,
                        border: "1px solid var(--bt-border)",
                        color: "var(--bt-muted)",
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author card */}
            <div
              style={{
                marginTop: 48,
                padding: 28,
                background: "var(--bt-surface)",
                border: "1px solid var(--bt-border)",
                borderRadius: 16,
                display: "flex",
                gap: 20,
                alignItems: "flex-start",
              }}
            >
              <img src={post.author.avatar} alt={post.author.name} style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--bt-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Written by</div>
                <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--bt-white)", marginBottom: 4 }}>{post.author.name}</div>
                <div style={{ fontSize: "0.875rem", color: "var(--bt-red)", marginBottom: 10 }}>{post.author.role}</div>
                <p style={{ fontSize: "0.875rem", color: "var(--bt-muted)", lineHeight: 1.65 }}>
                  Founder & CEO at BrandThink. Growth strategist, performance marketer, and builder of brands that compound.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div
              style={{
                marginTop: 48,
                padding: "40px 36px",
                background: "linear-gradient(135deg, rgba(232,49,42,0.08) 0%, rgba(255,140,25,0.05) 100%)",
                border: "1px solid rgba(232,49,42,0.2)",
                borderRadius: 20,
                textAlign: "center",
              }}
            >
              <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--bt-white)", letterSpacing: "-0.03em", marginBottom: 12 }}>
                Ready to grow your brand?
              </h3>
              <p style={{ color: "var(--bt-muted)", fontSize: "0.9375rem", lineHeight: 1.7, marginBottom: 24 }}>
                We build demand generation, distribution systems, and conversion engines for ambitious brands. Let's talk.
              </p>
              <Link href="/contact" className="btn btn-primary">
                Start a Project
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside style={{ position: "sticky", top: "calc(var(--nav-h) + 24px)" }}>
            {/* Table of Contents */}
            {headings.length > 0 && (
              <div
                style={{
                  padding: 24,
                  background: "var(--bt-surface)",
                  border: "1px solid var(--bt-border)",
                  borderRadius: 16,
                  marginBottom: 24,
                }}
              >
                <h4 style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--bt-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
                  Table of Contents
                </h4>
                <nav>
                  {headings.map((h, i) => (
                    <button
                      key={h.id}
                      onClick={() => setActiveHeading(i)}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "6px 0 6px 12px",
                        borderLeft: `2px solid ${activeHeading === i ? "var(--bt-red)" : "var(--bt-border)"}`,
                        color: activeHeading === i ? "var(--bt-white)" : "var(--bt-muted)",
                        fontSize: "0.875rem",
                        lineHeight: 1.5,
                        transition: "all 0.2s",
                        marginBottom: 4,
                      }}
                    >
                      {h.text}
                    </button>
                  ))}
                </nav>
              </div>
            )}

            {/* Related posts */}
            {related.length > 0 && (
              <div
                style={{
                  padding: 24,
                  background: "var(--bt-surface)",
                  border: "1px solid var(--bt-border)",
                  borderRadius: 16,
                  marginBottom: 24,
                }}
              >
                <h4 style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--bt-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
                  Related Posts
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={`/blog/${r.slug}`}
                      className="related-card"
                      style={{ display: "flex", gap: 12, textDecoration: "none", alignItems: "flex-start" }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                      <img src={r.coverImage} alt={r.title} style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--bt-white)", lineHeight: 1.4, marginBottom: 4 }}>{r.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--bt-muted)" }}>{r.readTime} read</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div
              style={{
                padding: 24,
                background: "var(--bt-surface)",
                border: "1px solid var(--bt-border)",
                borderRadius: 16,
              }}
            >
              <h4 style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--bt-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
                Share This Article
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Share on Twitter / X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://thebrandthink.com/blog/${post.slug}`)}` },
                  { label: "Share on LinkedIn", href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://thebrandthink.com/blog/${post.slug}`)}&title=${encodeURIComponent(post.title)}` },
                  { label: "Copy Link", href: "#" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href !== "#" ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    onClick={s.href === "#" ? (e) => { e.preventDefault(); navigator.clipboard?.writeText(window.location.href); } : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid var(--bt-border)",
                      color: "var(--bt-muted)",
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)"; (e.currentTarget as HTMLElement).style.color = "var(--bt-white)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--bt-border)"; (e.currentTarget as HTMLElement).style.color = "var(--bt-muted)"; }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}
