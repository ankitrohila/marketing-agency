"use client";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const SERVICES = [
  {
    num: "01",
    title: "Attention Engineering",
    desc: "Brand strategy, identity systems, and creative technology that stop scrolling, build authority, and create cultural relevance for modern brands.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    tags: ["Brand Strategy", "Creative Systems", "Storytelling"],
    href: "/services#strategy",
    color: "#0f2f0f",
    accent: "var(--bt-lime)",
  },
  {
    num: "02",
    title: "Distribution Infrastructure",
    desc: "Precision media buying, creator networks, and paid amplification systems that reach your exact audience at the lowest cost and highest impact.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
    tags: ["Paid Media", "Influencer", "Programmatic"],
    href: "/services#distribution",
    color: "#1a0f2f",
    accent: "#8B5CF6",
  },
  {
    num: "03",
    title: "Conversion Systems",
    desc: "Funnel architecture, CRO, and lead generation systems that maximize revenue from the traffic you already have — built for predictable growth.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    tags: ["CRO", "Funnels", "Lead Gen"],
    href: "/services#conversion",
    color: "#0f1f2f",
    accent: "#38BDF8",
  },
  {
    num: "04",
    title: "AI & MarTech Stack",
    desc: "Marketing automation, CDP implementation, AI-driven personalization, and analytics infrastructure that scales growth without adding headcount.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/>
      </svg>
    ),
    tags: ["Automation", "CDP/CRM", "AI Pipelines"],
    href: "/services#ai",
    color: "#2f1a0f",
    accent: "#FB923C",
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>(".svc-card").forEach((card, i) => {
      gsap.from(card, {
        opacity: 0, y: 50,
        duration: 0.8, delay: i * 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 85%", once: true },
      });
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="section" style={{ background: "var(--bt-surface)" }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 64, flexWrap: "wrap", gap: 20 }}>
          <div>
            <span className="chip" style={{ marginBottom: 16 }}>Growth Pillars</span>
            <h2 className="heading-lg">
              The Growth Engine<br />
              <span style={{
                background: "linear-gradient(135deg,#E8312A,#FF8C19)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>we deploy.</span>
            </h2>
          </div>
          <Link href="/services" className="btn-ghost">
            Explore all services
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>

        {/* 2×2 grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))", gap: 24 }}>
          {SERVICES.map((svc) => (
            <Link
              key={svc.num}
              href={svc.href}
              className="svc-card card"
              style={{
                background: svc.color, padding: 40,
                textDecoration: "none", display: "block",
                position: "relative", overflow: "hidden",
                transition: "transform 0.3s var(--ease-out), border-color 0.3s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "none"; }}
            >
              {/* Glow */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute", top: 0, right: 0,
                  width: 250, height: 250, borderRadius: "50%",
                  background: `radial-gradient(circle, ${svc.accent}12, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />

              {/* Icon */}
              <div
                style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: `${svc.accent}15`,
                  border: `1px solid ${svc.accent}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: svc.accent, marginBottom: 24,
                }}
              >
                {svc.icon}
              </div>

              {/* Number */}
              <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: svc.accent, letterSpacing: "0.1em", marginBottom: 8 }}>
                {svc.num}
              </div>

              <h3
                style={{
                  fontSize: "clamp(1.25rem, 2vw, 1.75rem)", fontWeight: 800,
                  letterSpacing: "-0.03em", color: "#F5F5F5", marginBottom: 12,
                }}
              >
                {svc.title}
              </h3>
              <p style={{ fontSize: "0.9375rem", color: "rgba(245,245,245,0.65)", lineHeight: 1.7, marginBottom: 24 }}>
                {svc.desc}
              </p>

              {/* Tags */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {svc.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: "0.6875rem", fontWeight: 600, padding: "4px 12px",
                      borderRadius: 99, border: `1px solid ${svc.accent}30`,
                      color: svc.accent, letterSpacing: "0.08em", textTransform: "uppercase",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Arrow */}
              <div style={{ position: "absolute", bottom: 28, right: 28, color: svc.accent }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
