"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/sections/Footer";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const SERVICES = [
  {
    id: "strategy",  num: "01",
    title:   "Brand Strategy",
    tagline: "Built to be unmistakable.",
    desc:    "We dig deep into your market, audience, and competitive landscape to craft positioning that's impossible to ignore. From naming and identity to messaging architecture — we build the strategic foundation your brand needs to win.",
    features: ["Brand Positioning & Differentiation","Visual Identity Systems","Naming & Verbal Identity","Brand Architecture","Guidelines & Playbooks","Competitive Landscape Mapping"],
    color:  "#0f2f0f", accent: "#E8312A",
    img:    "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=960&h=720&q=80",
  },
  {
    id: "creative",  num: "02",
    title:   "Creative Studio",
    tagline: "Design that earns attention.",
    desc:    "Our in-house creative team produces work that stops scrolling and starts conversations. From campaign ideation to final production — every pixel, frame, and word is crafted to convert.",
    features: ["Campaign Concept & Strategy","Visual Design & Art Direction","Video & Motion Production","Photography & Content","Social & Digital Creatives","OOH & Print"],
    color:  "#1a0f2f", accent: "#8B5CF6",
    img:    "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=960&h=720&q=80",
  },
  {
    id: "distribution", num: "03",
    title:   "Media Distribution",
    tagline: "Right person. Right moment. Right message.",
    desc:    "Precision media planning and buying across paid, earned, and owned channels. We combine data science with creative thinking to reach your exact audience at the lowest cost and highest impact.",
    features: ["Meta & Google Ads","Programmatic Buying","Influencer Marketing","PR & Earned Media","SEO & Content Distribution","Media Analytics & Attribution"],
    color:  "#0f1f2f", accent: "#38BDF8",
    img:    "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=960&h=720&q=80",
  },
  {
    id: "conversion", num: "04",
    title:   "Conversion & CRO",
    tagline: "Turn traffic into revenue.",
    desc:    "We optimize every touchpoint in your funnel — landing pages, email flows, retargeting, and checkout experiences — to maximize revenue from the traffic you already have.",
    features: ["Funnel Audit & Mapping","Landing Page Design & Testing","A/B & Multivariate Testing","Email Marketing & Automation","Retargeting Architecture","Revenue Attribution Modeling"],
    color:  "#2f1a0f", accent: "#FB923C",
    img:    "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=960&h=720&q=80",
  },
  {
    id: "ai", num: "05",
    title:   "AI & MarTech",
    tagline: "Scale without adding headcount.",
    desc:    "We implement and integrate the modern marketing technology stack — CDPs, CRMs, AI personalization engines, and analytics platforms — so your marketing scales intelligently.",
    features: ["MarTech Stack Audit & Design","CDP & CRM Implementation","Marketing Automation Workflows","AI-Driven Personalization","Analytics & Data Infrastructure","Custom Integration & APIs"],
    color:  "#0f0f2f", accent: "#A78BFA",
    img:    "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=960&h=720&q=80",
  },
];

export default function ServicesPage() {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".svc-hero-word", { y: "100%", opacity: 0, stagger: 0.06, duration: 0.9, ease: "power4.out" });
    gsap.from(".svc-hero-sub",  { opacity: 0, y: 20, stagger: 0.1, duration: 0.7, delay: 0.5, ease: "power3.out" });
    gsap.utils.toArray<HTMLElement>(".svc-block").forEach((block) => {
      gsap.from(block, {
        opacity: 0, y: 60, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: block, start: "top 80%", once: true },
      });
    });
  }, { scope: heroRef });

  return (
    <>
      {/* Hero */}
      <section
        ref={heroRef}
        className="page-hero" style={{ minHeight: "60vh" }}
      >
        <div className="bg-grid" style={{ position: "absolute", inset: 0, opacity: 0.3, maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 90%)" }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="svc-hero-sub" style={{ marginBottom: 24 }}><span className="chip">Our Services</span></div>
          <h1 style={{ overflow: "hidden" }}>
            {["Everything", "you need", "to grow."].map((w, i) => (
              <div key={i} style={{ overflow: "hidden" }}>
                <span className="svc-hero-word" style={{
                  display: "block", fontSize: "clamp(2.5rem, 8vw, 7rem)",
                  fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.0,
                  color: i === 2 ? "var(--bt-lime)" : "var(--bt-white)",
                }}>
                  {w}
                </span>
              </div>
            ))}
          </h1>
          <p className="svc-hero-sub" style={{ marginTop: 28, fontSize: "1.125rem", color: "var(--bt-muted)", maxWidth: 520, lineHeight: 1.75 }}>
            Five integrated service lines. One team. Endless possibilities.
          </p>
        </div>
      </section>

      {/* Service blocks */}
      {SERVICES.map((svc, i) => (
        <section
          key={svc.id}
          id={svc.id}
          className="svc-block section"
          style={{ background: i % 2 === 0 ? "var(--bt-black)" : "var(--bt-surface)" }}
        >
          <div className="container">
            <div className="r-grid-2">

              {/* Text side */}
              <div className="svc-detail-text" style={{ order: i % 2 === 0 ? 1 : 2 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: svc.accent, letterSpacing: "0.1em" }}>{svc.num}</span>
                  <span className="chip">{svc.title}</span>
                </div>
                <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, color: "var(--bt-white)", marginBottom: 20 }}>
                  {svc.tagline}
                </h2>
                <p style={{ fontSize: "1.0625rem", color: "var(--bt-muted)", lineHeight: 1.75, marginBottom: 36 }}>
                  {svc.desc}
                </p>
                <ul className="features-list">
                  {svc.features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "0.875rem", color: "var(--bt-white)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={svc.accent} strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 3 }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 40 }}>
                  <a href="/contact" className="btn btn-primary" style={{ fontSize: "0.9375rem" }}>
                    Discuss This Service
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Visual side — real photo */}
              <div className="svc-detail-visual" style={{ order: i % 2 === 0 ? 2 : 1 }}>
                <div style={{
                  aspectRatio: "4/3", borderRadius: 24,
                  overflow: "hidden",
                  border: "1px solid var(--bt-border)",
                  position: "relative",
                  boxShadow: `0 24px 80px rgba(0,0,0,0.4)`,
                }}>
                  <img
                    src={svc.img}
                    alt={svc.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
                      transition: "transform 0.7s var(--ease-out)" }}
                    loading="lazy"
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />
                  {/* Tinted overlay */}
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${svc.color}cc, transparent 60%)` }} />
                  {/* Number badge */}
                  <div style={{
                    position: "absolute", top: 20, right: 20,
                    padding: "8px 16px", borderRadius: 99,
                    background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
                    border: `1px solid ${svc.accent}40`,
                    fontSize: "1rem", fontWeight: 900, color: svc.accent,
                    letterSpacing: "-0.02em",
                  }}>
                    {svc.num}
                  </div>
                  {/* Capability count */}
                  <div style={{
                    position: "absolute", bottom: 20, left: 20,
                    padding: "10px 18px", borderRadius: 12,
                    background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff" }}>{svc.title}</div>
                    <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
                      {svc.features.length} core capabilities
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      ))}

      <Footer />
    </>
  );
}
