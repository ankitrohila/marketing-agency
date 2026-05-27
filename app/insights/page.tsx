"use client";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/sections/Footer";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const POSTS = [
  {
    title: "Why D2C Brands Fail at Performance Marketing (And How to Fix It)",
    category: "Performance",
    date: "May 2025",
    readTime: "8 min",
    img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&h=480&q=80",
    slug: "#",
    excerpt: "Most D2C brands chase ROAS but miss the three structural things that actually make paid acquisition profitable at scale.",
    accent: "#E8312A",
    featured: true,
  },
  {
    title: "The MarTech Stack That Drove 40% CAC Reduction for MedAxis",
    category: "MarTech",
    date: "Apr 2025",
    readTime: "6 min",
    img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&h=480&q=80",
    slug: "#",
    excerpt: "A breakdown of the CDP, CRM, and attribution architecture we built — and the exact decisions that moved the needle.",
    accent: "#38BDF8",
    featured: false,
  },
  {
    title: "Brand vs Performance: The False Dichotomy Costing You Growth",
    category: "Brand",
    date: "Apr 2025",
    readTime: "5 min",
    img: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&h=480&q=80",
    slug: "#",
    excerpt: "The brands that grow fastest don't choose between brand-building and performance — they treat them as a unified system.",
    accent: "#8B5CF6",
    featured: false,
  },
  {
    title: "How We Took NovaBev from Zero to ₹12Cr ARR in Year 1",
    category: "Case Study",
    date: "Mar 2025",
    readTime: "10 min",
    img: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&h=480&q=80",
    slug: "#",
    excerpt: "The full story of building NovaBev — from naming, identity, and positioning to the go-to-market engine that hit ₹1Cr/month.",
    accent: "#A78BFA",
    featured: false,
  },
  {
    title: "AI Creative Production: How We 3× Output Without Hiring",
    category: "AI & MarTech",
    date: "Mar 2025",
    readTime: "7 min",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&h=480&q=80",
    slug: "#",
    excerpt: "Our internal AI-assisted creative pipeline — built on top of standard production workflows — and what it actually saves us.",
    accent: "#FB923C",
    featured: false,
  },
  {
    title: "The Influencer Playbook: Beyond Vanity Metrics",
    category: "Creative",
    date: "Feb 2025",
    readTime: "6 min",
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&h=480&q=80",
    slug: "#",
    excerpt: "Why CPM and impressions are the wrong metrics for influencer marketing — and what to measure instead if you want revenue.",
    accent: "#F472B6",
    featured: false,
  },
];

const CATEGORIES = ["All", "Performance", "Brand", "MarTech", "Creative", "Case Study", "AI & MarTech"];

export default function InsightsPage() {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".ins-word", { y: "100%", stagger: 0.06, duration: 0.9, ease: "power4.out" });
    gsap.from(".ins-sub", { opacity: 0, y: 20, stagger: 0.1, duration: 0.7, delay: 0.5 });
    gsap.utils.toArray<HTMLElement>(".post-card").forEach((card) => {
      gsap.from(card, {
        opacity: 0, y: 40, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 88%", once: true },
      });
    });
  }, { scope: heroRef });

  const featured = POSTS.find((p) => p.featured)!;
  const rest = POSTS.filter((p) => !p.featured);

  return (
    <>
      {/* Hero */}
      <section ref={heroRef} className="page-hero">
        <div className="bg-grid" style={{ position: "absolute", inset: 0, opacity: 0.3,
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent 90%)" }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="ins-sub" style={{ marginBottom: 24 }}><span className="chip">Insights</span></div>
          <h1 style={{ overflow: "hidden" }}>
            {["Thinking that", "moves business."].map((w, i) => (
              <div key={i} style={{ overflow: "hidden" }}>
                <span className="ins-word" style={{
                  display: "block",
                  fontSize: "clamp(2.5rem, 8vw, 7rem)",
                  fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.0,
                  color: i === 1 ? "var(--bt-lime)" : "var(--bt-white)",
                }}>{w}</span>
              </div>
            ))}
          </h1>
          <p className="ins-sub" style={{ marginTop: 28, fontSize: "1.125rem", color: "var(--bt-muted)", maxWidth: 500, lineHeight: 1.75 }}>
            Strategy frameworks, case studies, and market intelligence from the BrandThink team.
          </p>
        </div>
      </section>

      {/* Category filters */}
      <section style={{ background: "var(--bt-black)", padding: "0 24px 40px" }}>
        <div className="container">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => (
              <button key={cat} style={{
                padding: "8px 20px", borderRadius: 99, fontSize: "0.875rem",
                fontWeight: 600, cursor: "pointer",
                background: cat === "All" ? "linear-gradient(135deg,#E8312A,#FF6B1A)" : "transparent",
                color: cat === "All" ? "#ffffff" : "var(--bt-muted)",
                border: cat === "All" ? "none" : "1px solid var(--bt-border)",
              }}>{cat}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured post */}
      <section className="section-sm" style={{ background: "var(--bt-black)", paddingTop: 0 }}>
        <div className="container">
          <Link href={featured.slug} className="post-card featured-post-grid" style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 0, borderRadius: 20, overflow: "hidden",
            border: "1px solid var(--bt-border)", textDecoration: "none",
            transition: "border-color 0.3s",
          }}>
            <div className="featured-post-img" style={{ height: 400, overflow: "hidden" }}>
              <img src={featured.img} alt={featured.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.6s" }}
                loading="lazy" />
            </div>
            <div style={{ padding: "48px 48px", background: "var(--bt-surface)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                <span style={{ padding: "4px 12px", borderRadius: 99, background: "rgba(232,49,42,0.12)", border: "1px solid rgba(232,49,42,0.25)", color: "#E8312A", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Featured
                </span>
                <span style={{ padding: "4px 12px", borderRadius: 99, border: "1px solid var(--bt-border)", color: "var(--bt-muted)", fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {featured.category}
                </span>
              </div>
              <h2 style={{ fontSize: "clamp(1.25rem, 2vw, 1.875rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--bt-white)", marginBottom: 16, lineHeight: 1.2 }}>{featured.title}</h2>
              <p style={{ fontSize: "0.9375rem", color: "var(--bt-muted)", lineHeight: 1.7, marginBottom: 24 }}>{featured.excerpt}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: "0.8125rem", color: "var(--bt-muted)" }}>
                <span>{featured.date}</span>
                <span>·</span>
                <span>{featured.readTime} read</span>
                <span style={{ marginLeft: "auto", color: "var(--bt-red)", fontWeight: 600 }}>Read →</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Post grid */}
      <section style={{ background: "var(--bt-surface)", padding: "80px 40px" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 380px), 1fr))", gap: 24 }}>
            {rest.map((post) => (
              <Link
                key={post.title}
                href={post.slug}
                className="post-card card"
                style={{ textDecoration: "none", display: "block", background: "var(--bt-card)", overflow: "hidden" }}
              >
                <div style={{ height: 220, overflow: "hidden" }}>
                  <img src={post.img} alt={post.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.6s" }}
                    loading="lazy" />
                </div>
                <div style={{ padding: "24px 28px 28px" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <span style={{ padding: "3px 10px", borderRadius: 99, border: `1px solid ${post.accent}40`, color: post.accent, fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {post.category}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--bt-white)", marginBottom: 10, lineHeight: 1.3 }}>{post.title}</h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--bt-muted)", lineHeight: 1.65, marginBottom: 20 }}>{post.excerpt}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "0.75rem", color: "var(--bt-muted)" }}>
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime} read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section style={{ background: "var(--bt-black)", padding: "80px 40px" }}>
        <div className="container" style={{ maxWidth: 600, textAlign: "center" }}>
          <span className="chip" style={{ marginBottom: 20 }}>Newsletter</span>
          <h2 className="heading-lg" style={{ marginBottom: 16 }}>
            Growth intelligence,<br /><span style={{ color: "var(--bt-lime)" }}>weekly.</span>
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--bt-muted)", lineHeight: 1.75, marginBottom: 32 }}>
            One email every week. No fluff — just strategy, frameworks, and what&apos;s actually working in growth marketing right now.
          </p>
          <div style={{ display: "flex", gap: 12, maxWidth: 480, margin: "0 auto", flexWrap: "wrap" }}>
            <input
              type="email"
              placeholder="your@email.com"
              style={{
                flex: 1, minWidth: 200, padding: "14px 20px", borderRadius: 99,
                background: "var(--bt-card)", border: "1px solid var(--bt-border)",
                color: "var(--bt-white)", fontSize: "0.9375rem", outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button className="btn btn-primary" style={{ padding: "14px 28px", whiteSpace: "nowrap" }}>
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
