"use client";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/sections/Footer";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const PROCESS = [
  { step: "01", title: "Discovery Sprint", desc: "Deep-dive into your market, competitors, audience, and current brand perception. 2-week intensive audit." },
  { step: "02", title: "Positioning Workshop", desc: "Collaborative sessions to define your unique territory, brand promise, and differentiated value proposition." },
  { step: "03", title: "Identity System", desc: "Visual language, typography, colour systems, and brand mark — built to scale across every touchpoint." },
  { step: "04", title: "Verbal Identity", desc: "Naming (if needed), tone of voice, messaging hierarchy, and the words that make your brand unmistakable." },
  { step: "05", title: "Playbook & Rollout", desc: "A definitive brand guidelines document and rollout plan your entire team can execute from Day 1." },
  { step: "06", title: "Ongoing Governance", desc: "Quarterly brand health checks, asset creation, and consistency audits as you scale." },
];

const RESULTS = [
  { num: "3×", label: "Average brand recall lift" },
  { num: "58%", label: "Higher conversion from brand-led ads" },
  { num: "12+", label: "Full brand systems built in 2024" },
];

const FEATURES = [
  "Brand Positioning & Differentiation",
  "Visual Identity Systems",
  "Naming & Verbal Identity",
  "Brand Architecture",
  "Guidelines & Playbooks",
  "Competitive Landscape Mapping",
  "Brand Audit & Equity Analysis",
  "Brand Campaign Strategy",
  "Launch & Activation Planning",
  "Employer Brand Systems",
  "Sub-brand Architecture",
  "Brand Health Tracking",
];

export default function BrandStrategyPage() {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".bs-word", { y: "100%", stagger: 0.06, duration: 0.9, ease: "power4.out" });
    gsap.from(".bs-sub", { opacity: 0, y: 20, stagger: 0.1, duration: 0.7, delay: 0.5 });
    gsap.utils.toArray<HTMLElement>(".bs-card").forEach((card) => {
      gsap.from(card, {
        opacity: 0, y: 40, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 85%", once: true },
      });
    });
  }, { scope: heroRef });

  return (
    <>
      {/* Hero */}
      <section ref={heroRef} className="page-hero" style={{ minHeight: "60vh" }}>
        <div className="bg-grid" style={{ position: "absolute", inset: 0, opacity: 0.3,
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent 90%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 50% at 30% 50%, rgba(232,49,42,0.07), transparent 70%)", pointerEvents: "none" }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="bs-sub" style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/services" style={{ fontSize: "0.8125rem", color: "var(--bt-muted)", textDecoration: "none" }}>Services</Link>
            <span style={{ color: "var(--bt-muted)" }}>→</span>
            <span className="chip">Brand Strategy</span>
          </div>
          <h1 style={{ overflow: "hidden" }}>
            {["Built to be", "unmistakable."].map((w, i) => (
              <div key={i} style={{ overflow: "hidden" }}>
                <span className="bs-word" style={{
                  display: "block",
                  fontSize: "clamp(2.5rem, 8vw, 7rem)",
                  fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.0,
                  color: i === 1 ? "var(--bt-lime)" : "var(--bt-white)",
                }}>{w}</span>
              </div>
            ))}
          </h1>
          <p className="bs-sub" style={{ marginTop: 28, fontSize: "1.125rem", color: "var(--bt-muted)", maxWidth: 560, lineHeight: 1.75 }}>
            We build brand foundations that make positioning impossible to ignore — from naming and identity to messaging architecture that wins markets.
          </p>
          <div className="bs-sub" style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/contact" className="btn btn-primary">
              Start a Project
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link href="/work" className="btn btn-secondary">See Our Work</Link>
          </div>
        </div>
      </section>

      {/* Results strip */}
      <section style={{ background: "var(--bt-surface)", padding: "48px 40px", borderBottom: "1px solid var(--bt-border)" }}>
        <div className="container">
          <div className="results-grid">
            {RESULTS.map((r) => (
              <div key={r.label} className="bs-card" style={{ textAlign: "center", padding: "32px 24px", borderRadius: 16, background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
                <div style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.04em",
                  background: "linear-gradient(135deg,#E8312A,#FF8C19)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{r.num}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--bt-muted)", fontWeight: 600, marginTop: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="section" style={{ background: "var(--bt-black)" }}>
        <div className="container">
          <div className="r-grid-2">
            <div>
              <span className="chip" style={{ marginBottom: 20 }}>What We Do</span>
              <h2 className="heading-lg" style={{ marginBottom: 24 }}>
                Your brand is your<br />
                <span style={{ background: "linear-gradient(135deg,#E8312A,#FF8C19)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  most valuable asset.
                </span>
              </h2>
              <p style={{ fontSize: "1.0625rem", color: "var(--bt-muted)", lineHeight: 1.75, marginBottom: 20 }}>
                In a world of infinite choices, the brands that win aren't just the ones with the best product — they're the ones with the clearest identity, the sharpest positioning, and the most consistent story.
              </p>
              <p style={{ fontSize: "1.0625rem", color: "var(--bt-muted)", lineHeight: 1.75 }}>
                Our Brand Strategy practice builds the strategic and creative foundation your brand needs to own a clear market position — and grow from it.
              </p>
            </div>
            <div>
              <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid var(--bt-border)", aspectRatio: "4/3" }}>
                <img src="https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=960&h=720&q=80"
                  alt="Brand Strategy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section" style={{ background: "var(--bt-surface)" }}>
        <div className="container">
          <div style={{ marginBottom: 56 }}>
            <span className="chip" style={{ marginBottom: 16 }}>Our Process</span>
            <h2 className="heading-lg">How we build<br /><span style={{ color: "var(--bt-lime)" }}>iconic brands.</span></h2>
          </div>
          <div className="process-grid">
            {PROCESS.map((p) => (
              <div key={p.step} className="bs-card card" style={{ padding: 32 }}>
                <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--bt-red)", letterSpacing: "0.1em", marginBottom: 12 }}>{p.step}</div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--bt-white)", marginBottom: 12 }}>{p.title}</h3>
                <p style={{ fontSize: "0.9375rem", color: "var(--bt-muted)", lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features list */}
      <section className="section" style={{ background: "var(--bt-black)" }}>
        <div className="container">
          <div style={{ marginBottom: 48 }}>
            <span className="chip" style={{ marginBottom: 16 }}>Capabilities</span>
            <h2 className="heading-lg">Everything included.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
            {FEATURES.map((f) => (
              <div key={f} className="bs-card" style={{ display: "flex", gap: 12, alignItems: "center", padding: "16px 20px", borderRadius: 12, background: "var(--bt-surface)", border: "1px solid var(--bt-border)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8312A" strokeWidth="2.5" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize: "0.9375rem", color: "var(--bt-white)", fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--bt-surface)", padding: "80px 40px" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="heading-lg" style={{ marginBottom: 20 }}>Ready to build an<br /><span style={{ color: "var(--bt-lime)" }}>unmistakable brand?</span></h2>
          <p style={{ fontSize: "1.0625rem", color: "var(--bt-muted)", maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.75 }}>Book a free strategy call and we'll map out exactly what your brand needs to win.</p>
          <Link href="/contact" className="btn btn-primary" style={{ fontSize: "1rem", padding: "16px 40px" }}>
            Book a Free Strategy Call
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
