"use client";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const PROJECTS = [
  {
    title:    "Growify — D2C Scale-Up",
    category: "Demand Generation System",
    result:   "8.4× ROAS in 90 days",
    year:     "2024",
    color:    "#0f2f0f",
    accent:   "#E8312A",
    img:      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&h=400&q=80",
    tags:     ["Meta Ads", "CRO", "Analytics"],
    desc:     "Built full demand-gen infrastructure: audience architecture, creative testing system, and attribution pipeline — scaling from ₹50L to ₹4.2Cr/month.",
  },
  {
    title:    "NovaBev — Brand Launch",
    category: "Brand Growth System",
    result:   "Zero to ₹12Cr ARR",
    year:     "2024",
    color:    "#1a0f2f",
    accent:   "#8B5CF6",
    img:      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&h=400&q=80",
    tags:     ["Positioning", "Identity", "Campaigns"],
    desc:     "Engineered brand from concept: name, identity, positioning, and go-to-market system — driving ₹12Cr ARR in Year 1.",
  },
  {
    title:    "MedAxis — HealthTech",
    category: "MarTech Infrastructure",
    result:   "40% CAC reduction",
    year:     "2023",
    color:    "#0f1f2f",
    accent:   "#38BDF8",
    img:      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&h=400&q=80",
    tags:     ["CRM", "Automation", "CDP"],
    desc:     "Implemented full MarTech stack — CDP, CRM, and attribution modeling — replacing manual workflows with automated acquisition pipelines.",
  },
  {
    title:    "StyleVerse — Fashion",
    category: "Distribution System",
    result:   "3M+ impressions / campaign",
    year:     "2023",
    color:    "#2f0f1a",
    accent:   "#F472B6",
    img:      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&h=400&q=80",
    tags:     ["Content", "Influencer", "Video"],
    desc:     "Built creator distribution network + content production system — generating 3M+ campaign impressions at ₹0.28 CPM.",
  },
];

export default function Works() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>(".work-project").forEach((card) => {
      gsap.from(card, {
        y: "8rem", opacity: 0,
        duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 85%", once: true },
      });
    });

    /* Tilt the 2nd card on scroll */
    const secondCard = document.querySelectorAll(".work-project")[1] as HTMLElement | undefined;
    if (secondCard) {
      gsap.to(secondCard, {
        rotateZ: -4,
        ease:    "none",
        scrollTrigger: {
          trigger: secondCard,
          start:   "top bottom",
          end:     "bottom top",
          scrub:   1.5,
        },
      });
    }
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="section" style={{ background: "var(--bt-black)" }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 64, flexWrap: "wrap", gap: 20 }}>
          <div>
            <span className="chip" style={{ marginBottom: 16 }}>Selected Work</span>
            <h2 className="heading-lg">
              Work that<br />
              <span style={{
                background: "linear-gradient(135deg,#E8312A,#FF8C19)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>moves needles.</span>
            </h2>
          </div>
          <Link href="/work" className="btn-ghost">
            View all projects
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))", gap: 24 }}>
          {PROJECTS.map((project, i) => (
            <div
              key={project.title}
              className="work-project card"
              style={{
                background: project.color,
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                minHeight: 420,
              }}
            >
              {/* Project hero image */}
              <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
                <img
                  src={project.img}
                  alt={project.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover",
                    transition: "transform 0.6s var(--ease-out)" }}
                  loading="lazy"
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
                {/* Accent overlay */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: `linear-gradient(to bottom, transparent 40%, ${project.color} 100%)`,
                }} />
              </div>

              {/* Content */}
              <div style={{ padding: 28, position: "relative" }}>
                {/* Glow */}
                <div aria-hidden="true" style={{
                  position: "absolute", top: -50, right: 0,
                  width: 240, height: 240, borderRadius: "50%",
                  background: `radial-gradient(circle, ${project.accent}12, transparent 70%)`,
                  pointerEvents: "none",
                }} />

                {/* Tags */}
                <div className="proj-tags" style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                  {project.tags.map((tag) => (
                    <span key={tag} style={{
                      fontSize: "0.6875rem", fontWeight: 600,
                      padding: "4px 12px", borderRadius: 99,
                      border: `1px solid ${project.accent}40`,
                      color: project.accent,
                      letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div style={{ fontSize: "0.75rem", color: "rgba(245,245,245,0.65)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                  {project.category} · {project.year}
                </div>
                <h3 style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.875rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#F5F5F5", marginBottom: 12 }}>
                  {project.title}
                </h3>

                <p className="proj-desc" style={{ fontSize: "0.9375rem", color: "rgba(245,245,245,0.65)", lineHeight: 1.7, marginBottom: 20 }}>
                  {project.desc}
                </p>

                {/* Result badge */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 16px", borderRadius: 99,
                  background: `${project.accent}15`, border: `1px solid ${project.accent}30`,
                  color: project.accent, fontSize: "0.875rem", fontWeight: 700,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                    <polyline points="16 7 22 7 22 13"/>
                  </svg>
                  {project.result}
                </div>

                {/* Ghost number */}
                <div aria-hidden="true" style={{
                  position: "absolute", bottom: -12, right: 16,
                  fontSize: "7rem", fontWeight: 900, letterSpacing: "-0.05em",
                  color: "rgba(255,255,255,0.03)", lineHeight: 1, userSelect: "none",
                }}>
                  {String(i + 1).padStart(2, "0")}
                </div>

                {/* Arrow button */}
                <div style={{ position: "absolute", bottom: 20, right: 20 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)", border: "1px solid var(--bt-border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={project.accent} strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
