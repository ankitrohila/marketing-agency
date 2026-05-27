"use client";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/sections/Footer";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CATEGORIES = ["All", "Performance", "Brand", "Creative", "MarTech"];

const PROJECTS = [
  {
    title:  "Growify",       cat: "Performance", color: "#0f2f0f",  accent: "#E8312A",
    result: "8.4× ROAS",    year: "2024",        img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&h=500&q=80",
    tags:   ["Meta Ads", "CRO", "Analytics"],
    desc:   "Scaled D2C fashion brand from ₹50L/month to ₹4.2Cr/month ad revenue in 90 days through precision audience architecture and creative iteration.",
  },
  {
    title:  "NovaBev",       cat: "Brand",       color: "#1a0f2f",  accent: "#8B5CF6",
    result: "₹12Cr ARR",    year: "2024",        img: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=900&h=500&q=80",
    tags:   ["Identity", "Strategy", "Packaging"],
    desc:   "Built brand from scratch — name, identity, positioning, launch campaign. Took NovaBev from concept to ₹12Cr ARR in Year 1.",
  },
  {
    title:  "MedAxis",       cat: "MarTech",     color: "#0f1f2f",  accent: "#38BDF8",
    result: "40% CAC↓",     year: "2023",        img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&h=500&q=80",
    tags:   ["CRM", "Automation", "CDP"],
    desc:   "Implemented a full MarTech stack — CDP, CRM, attribution modeling — reducing customer acquisition cost by 40%.",
  },
  {
    title:  "StyleVerse",    cat: "Creative",    color: "#2f0f1a",  accent: "#F472B6",
    result: "3M impressions",year: "2023",        img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&h=500&q=80",
    tags:   ["Content", "Influencer", "Video"],
    desc:   "6-month influencer and content campaign for fashion brand, generating 3M+ impressions at ₹0.28 CPM.",
  },
  {
    title:  "TechPulse",     cat: "Performance", color: "#1f2f0f",  accent: "#84CC16",
    result: "5.2× ROAS",    year: "2023",        img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&h=500&q=80",
    tags:   ["Google Ads", "LinkedIn", "B2B"],
    desc:   "B2B SaaS demand generation — LinkedIn + Google — delivering qualified pipeline at 5.2× return.",
  },
  {
    title:  "UrbanEats",     cat: "Brand",       color: "#2f1a0f",  accent: "#FB923C",
    result: "3 cities",      year: "2024",        img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&h=500&q=80",
    tags:   ["Brand", "Campaigns", "OOH"],
    desc:   "City-by-city brand launch for D2C food brand — identity, OOH, digital campaign — across Bangalore, Mumbai, Hyderabad.",
  },
];

export default function WorkPage() {
  const [active, setActive] = useState("All");
  const heroRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = active === "All" ? PROJECTS : PROJECTS.filter((p) => p.cat === active);

  useGSAP(() => {
    gsap.from(".work-hero-word", { y: "100%", stagger: 0.06, duration: 0.9, ease: "power4.out" });
    gsap.from(".work-hero-sub",  { opacity: 0, y: 20, stagger: 0.1, duration: 0.7, delay: 0.5, ease: "power3.out" });
  }, { scope: heroRef });

  useGSAP(() => {
    gsap.from(".project-card", { opacity: 0, y: 40, stagger: 0.08, duration: 0.7, ease: "power3.out" });
  }, { scope: gridRef, dependencies: [active] });

  return (
    <>
      {/* Hero */}
      <section ref={heroRef} className="page-hero">
        <div className="bg-grid" style={{ position: "absolute", inset: 0, opacity: 0.3, maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent 90%)" }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="work-hero-sub" style={{ marginBottom: 24 }}><span className="chip">Our Work</span></div>
          <h1 style={{ overflow: "hidden" }}>
            {["Work that", "changes", "the game."].map((w, i) => (
              <div key={i} style={{ overflow: "hidden" }}>
                <span className="work-hero-word" style={{
                  display: "block", fontSize: "clamp(2.5rem, 8vw, 7rem)",
                  fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.0,
                  color: i === 1 ? "var(--bt-lime)" : "var(--bt-white)",
                }}>
                  {w}
                </span>
              </div>
            ))}
          </h1>
          <p className="work-hero-sub" style={{ marginTop: 28, fontSize: "1.125rem", color: "var(--bt-muted)", maxWidth: 500, lineHeight: 1.75 }}>
            Real campaigns. Real results. Real brands that chose to grow differently.
          </p>
        </div>
      </section>

      {/* Category filters */}
      <section style={{ background: "var(--bt-black)", padding: "0 40px 60px" }}>
        <div className="container">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                style={{
                  padding: "8px 20px", borderRadius: 99, fontSize: "0.875rem",
                  fontWeight: 600, cursor: "pointer", border: active === cat ? "none" : "1px solid var(--bt-border)",
                  transition: "all 0.2s",
                  background: active === cat ? "linear-gradient(135deg,#E8312A,#FF6B1A)" : "transparent",
                  color:      active === cat ? "#ffffff" : "var(--bt-muted)",
                  boxShadow:  active === cat ? "0 4px 16px rgba(232,49,42,0.3)" : "none",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Project grid */}
      <section style={{ background: "var(--bt-black)", padding: "0 40px 100px" }}>
        <div className="container">
          <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 480px), 1fr))", gap: 24 }}>
            {filtered.map((project) => (
              <div
                key={project.title}
                className="project-card card"
                style={{ background: project.color, cursor: "pointer", minHeight: 440, position: "relative", overflow: "hidden" }}
              >
                {/* Image */}
                <div style={{ height: 220, overflow: "hidden", position: "relative" }}>
                  <img
                    src={project.img}
                    alt={project.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.6s var(--ease-out)" }}
                    loading="lazy"
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 40%, ${project.color} 100%)` }} />
                </div>

                {/* Body */}
                <div style={{ padding: "24px 32px 32px", position: "relative" }}>
                  <div aria-hidden="true" style={{ position: "absolute", top: -80, right: 0, width: 260, height: 260, borderRadius: "50%", background: `radial-gradient(circle, ${project.accent}14, transparent 70%)`, pointerEvents: "none" }} />

                  <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                    {project.tags.map((tag) => (
                      <span key={tag} style={{ fontSize: "0.6875rem", fontWeight: 600, padding: "4px 12px", borderRadius: 99, border: `1px solid ${project.accent}40`, color: project.accent, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div style={{ fontSize: "0.75rem", color: "var(--bt-muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                    {project.cat} · {project.year}
                  </div>
                  <h3 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#F5F5F5", marginBottom: 12 }}>
                    {project.title}
                  </h3>
                  <p style={{ fontSize: "0.9375rem", color: "var(--bt-muted)", lineHeight: 1.7, marginBottom: 24 }}>
                    {project.desc}
                  </p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 99, background: `${project.accent}15`, border: `1px solid ${project.accent}30`, color: project.accent, fontSize: "0.875rem", fontWeight: 700 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
                    </svg>
                    {project.result}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
