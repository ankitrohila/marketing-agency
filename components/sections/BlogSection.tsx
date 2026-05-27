"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  category: string;
  coverImage: string;
  publishedAt: string;
  readTime: string;
  author: { name: string; avatar: string };
  featured: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function BlogSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/posts?limit=3&status=published")
      .then((r) => r.json())
      .then((d) => {
        setPosts(d.posts || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  useGSAP(() => {
    gsap.from(".blog-section-header > *", {
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: ".blog-section-header", start: "top 80%", once: true },
    });
    gsap.utils.toArray<HTMLElement>(".blog-preview-card").forEach((card) => {
      gsap.from(card, {
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 88%", once: true },
      });
    });
  }, { scope: sectionRef, dependencies: [posts] });

  return (
    <section
      ref={sectionRef}
      className="section"
      style={{ background: "var(--bt-black)" }}
    >
      <div className="container">
        {/* Header */}
        <div
          className="blog-section-header"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 24,
            marginBottom: 56,
            flexWrap: "wrap",
          }}
        >
          <div>
            <span className="chip" style={{ marginBottom: 18 }}>Latest Insights</span>
            <h2 style={{
              fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "var(--bt-white)",
            }}>
              Fresh thinking,<br />
              <span style={{ color: "var(--bt-red)" }}>straight from the team.</span>
            </h2>
          </div>
          <Link
            href="/blog"
            className="btn btn-secondary"
            style={{ flexShrink: 0 }}
          >
            Explore All Articles
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Cards grid */}
        {!loaded ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  background: "var(--bt-card)",
                  border: "1px solid var(--bt-border)",
                  borderRadius: 16,
                  height: 380,
                  animation: "pulse 2s infinite",
                }}
              />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
            }}
          >
            {posts.map((post) => {
              const accentColor = CATEGORY_COLORS[post.category] || "#E8312A";
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="blog-preview-card card"
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 16,
                    overflow: "hidden",
                    transition: "transform 0.3s var(--ease-out), border-color 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  {/* Cover image */}
                  <div
                    style={{
                      height: 220,
                      overflow: "hidden",
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s var(--ease-out)",
                      }}
                      loading="lazy"
                    />
                    {/* Category badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: 14,
                        left: 14,
                        padding: "4px 10px",
                        borderRadius: 99,
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        background: `${accentColor}CC`,
                        color: "#fff",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {post.category}
                    </div>
                  </div>

                  {/* Content */}
                  <div
                    style={{
                      padding: "20px 22px",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "var(--bt-white)",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.4,
                        marginBottom: 10,
                      }}
                    >
                      {post.title}
                    </h3>
                    <p
                      style={{
                        color: "var(--bt-muted)",
                        fontSize: "0.875rem",
                        lineHeight: 1.65,
                        flex: 1,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        marginBottom: 16,
                      }}
                    >
                      {post.excerpt}
                    </p>

                    {/* Footer */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: 14,
                        borderTop: "1px solid var(--bt-border)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }}
                        />
                        <span style={{ fontSize: "0.75rem", color: "var(--bt-muted)" }}>
                          {formatDate(post.publishedAt)}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--bt-muted)" }}>
                        {post.readTime}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 14,
                        color: accentColor,
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        transition: "gap 0.2s",
                      }}
                    >
                      Read More
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--bt-muted)" }}>
            No posts available yet.
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", marginTop: 56 }}>
          <Link href="/blog" className="btn btn-primary">
            Explore All Articles
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .blog-preview-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .blog-preview-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
