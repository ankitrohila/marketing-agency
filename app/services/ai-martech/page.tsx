"use client";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/sections/Footer";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ACCENT = "#A78BFA";

const PROCESS = [
  { step: "01", title: "Stack Audit", desc: "A comprehensive audit of your existing MarTech stack — tools, integrations, data flows, and gaps — with a clear picture of what's working and what isn't." },
  { step: "02", title: "Architecture Design", desc: "We design your ideal MarTech architecture: the right tools, in the right order, connected the right way — built for your specific growth stage and goals." },
  { step: "03", title: "CDP Implementation", desc: "Customer Data Platform implementation to unify all your customer data into a single source of truth that every tool in your stack can access." },
  { step: "04", title: "Automation Build", desc: "Marketing automation workflows — onboarding, lifecycle, re-engagement — built to run without manual intervention and improve with every interaction." },
  { step: "05", title: "AI Layer", desc: "AI-powered personalization, predictive scoring, and recommendation engines layered on top of your unified data to deliver 1:1 experiences at scale." },
  { step: "06", title: "Ongoing Optimisation", desc: "Monthly stack reviews, performance monitoring, and continuous optimisation to ensure your MarTech investment keeps delivering ROI as you scale." },
];

const RESULTS = [
  { num: "60%", label: "Reduction in manual work" },
  { num: "3×", label: "Faster campaign deployment" },
  { num: "50+", label: "Stacks audited & rebuilt" },
];

const FEATURES = [
  "MarTech Audit",
  "CDP & CRM Setup",
  "Marketing Automation",
  "AI Personalization",
  "Analytics Infrastructure",
  "Custom APIs",
  "Data Warehouse",
  "Predictive Scoring",
  "Attribution Modeling",
  "Real-time Triggers",
  "Customer Journey Mapping",
  "ROI Dashboards",
];

export default function AIMartechPage() {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".ai-word", { y: "100%", stagger: 0.06, duration: 0.9, ease: "power4.out" });
    gsap.from(".ai-sub", { opacity: 0, y: 20, stagger: 0.1, duration: 0.7, delay: 0.5 });
    gsap.utils.toArray<HTMLElement>(".ai-card").forEach((card) => {
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
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 50% 50% at 30% 50%, ${ACCENT}10, transparent 70%)`, pointerEvents: "none" }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="ai-sub" style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/services" style={{ fontSize: "0.8125rem", color: "var(--bt-muted)", textDecoration: "none" }}>Services</Link>
            <span style={{ color: "var(--bt-muted)" }}>→</span>
            <span className="chip">AI & MarTech</span>
          </div>
          <h1 style={{ overflow: "hidden" }}>
            {["Scale without", "adding headcount."].map((w, i) => (
              <div key={i} style={{ overflow: "hidden" }}>
                <span className="ai-word" style={{
                  display: "block",
                  fontSize: "clamp(2.5rem, 8vw, 7rem)",
                  fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.0,
                  color: i === 1 ? ACCENT : "var(--bt-white)",
                }}>{w}</span>
              </div>
            ))}
          </h1>
          <p className="ai-sub" style={{ marginTop: 28, fontSize: "1.125rem", color: "var(--bt-muted)", maxWidth: 560, lineHeight: 1.75 }}>
            We implement and integrate the modern marketing technology stack — CDPs, CRMs, AI personalization engines, and analytics platforms — so your marketing scales intelligently.
          </p>
          <div className="ai-sub" style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
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
              <div key={r.label} className="ai-card" style={{ textAlign: "center", padding: "32px 24px", borderRadius: 16, background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
                <div style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.04em",
                  background: `linear-gradient(135deg,${ACCENT},#DDD6FE)`,
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
                Marketing that<br />
                <span style={{ background: `linear-gradient(135deg,${ACCENT},#DDD6FE)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  runs itself.
                </span>
              </h2>
              <p style={{ fontSize: "1.0625rem", color: "var(--bt-muted)", lineHeight: 1.75, marginBottom: 20 }}>
                Most marketing teams are drowning in manual work — copying data between tools, building the same reports every week, running campaigns that could be automated. That's not a people problem. It's a technology problem.
              </p>
              <p style={{ fontSize: "1.0625rem", color: "var(--bt-muted)", lineHeight: 1.75 }}>
                We audit, design, and implement the MarTech stacks that let your team focus on strategy and creativity — while the technology handles the repetitive, data-heavy work at scale.
              </p>
            </div>
            <div>
              <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid var(--bt-border)", aspectRatio: "4/3" }}>
                <img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=960&h=720&q=80"
                  alt="AI & MarTech" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
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
            <h2 className="heading-lg">How we build your<br /><span style={{ color: ACCENT }}>growth machine.</span></h2>
          </div>
          <div className="process-grid">
            {PROCESS.map((p) => (
              <div key={p.step} className="ai-card card" style={{ padding: 32 }}>
                <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: ACCENT, letterSpacing: "0.1em", marginBottom: 12 }}>{p.step}</div>
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
            <h2 className="heading-lg">The full tech stack.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
            {FEATURES.map((f) => (
              <div key={f} className="ai-card" style={{ display: "flex", gap: 12, alignItems: "center", padding: "16px 20px", borderRadius: 12, background: "var(--bt-surface)", border: "1px solid var(--bt-border)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.5" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize: "0.9375rem", color: "var(--bt-white)", fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--bt-surface)", padding: "80px 40px" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="heading-lg" style={{ marginBottom: 20 }}>Ready to build a<br /><span style={{ color: ACCENT }}>scalable tech stack?</span></h2>
          <p style={{ fontSize: "1.0625rem", color: "var(--bt-muted)", maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.75 }}>Book a free MarTech audit and we'll map out the gaps and opportunities in your current stack.</p>
          <Link href="/contact" className="btn btn-primary" style={{ fontSize: "1rem", padding: "16px 40px" }}>
            Book a Free MarTech Audit
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
