"use client";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/sections/Footer";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ACCENT = "#FB923C";

const PROCESS = [
  { step: "01", title: "Funnel Audit", desc: "A full diagnostic of your existing funnel — from ad to landing page to checkout — mapping where value leaks and why." },
  { step: "02", title: "Hypothesis Building", desc: "Data-driven hypotheses ranked by potential impact and ease of implementation, with a prioritised testing roadmap." },
  { step: "03", title: "Design & Build", desc: "Our design and dev team builds optimised variants — landing pages, email flows, checkout experiences — ready for testing." },
  { step: "04", title: "A/B Testing", desc: "Statistically rigorous A/B and multivariate tests across every touchpoint, with clear win criteria before we start." },
  { step: "05", title: "Email Automation", desc: "Lifecycle email sequences — welcome, nurture, abandon, win-back — built to convert at every stage of the customer journey." },
  { step: "06", title: "Revenue Attribution", desc: "Multi-touch attribution modelling so you know exactly which channels and touchpoints are driving your revenue." },
];

const RESULTS = [
  { num: "40%", label: "Average CAC reduction" },
  { num: "2.3×", label: "Landing page conversion lift" },
  { num: "₹120Cr+", label: "Revenue attributed" },
];

const FEATURES = [
  "Funnel Mapping",
  "Landing Page Design",
  "A/B Testing",
  "Email Automation",
  "Retargeting",
  "Revenue Attribution",
  "Checkout Optimization",
  "Lead Scoring",
  "CRO Analytics",
  "UX Research",
  "Push Notifications",
  "Loyalty Systems",
];

export default function ConversionCROPage() {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".cro-word", { y: "100%", stagger: 0.06, duration: 0.9, ease: "power4.out" });
    gsap.from(".cro-sub", { opacity: 0, y: 20, stagger: 0.1, duration: 0.7, delay: 0.5 });
    gsap.utils.toArray<HTMLElement>(".cro-card").forEach((card) => {
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
          <div className="cro-sub" style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/services" style={{ fontSize: "0.8125rem", color: "var(--bt-muted)", textDecoration: "none" }}>Services</Link>
            <span style={{ color: "var(--bt-muted)" }}>→</span>
            <span className="chip">Conversion & CRO</span>
          </div>
          <h1 style={{ overflow: "hidden" }}>
            {["Turn traffic", "into revenue."].map((w, i) => (
              <div key={i} style={{ overflow: "hidden" }}>
                <span className="cro-word" style={{
                  display: "block",
                  fontSize: "clamp(2.5rem, 8vw, 7rem)",
                  fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.0,
                  color: i === 1 ? ACCENT : "var(--bt-white)",
                }}>{w}</span>
              </div>
            ))}
          </h1>
          <p className="cro-sub" style={{ marginTop: 28, fontSize: "1.125rem", color: "var(--bt-muted)", maxWidth: 560, lineHeight: 1.75 }}>
            We optimize every touchpoint in your funnel — landing pages, email flows, retargeting, and checkout — to maximize revenue from the traffic you already have.
          </p>
          <div className="cro-sub" style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
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
              <div key={r.label} className="cro-card" style={{ textAlign: "center", padding: "32px 24px", borderRadius: 16, background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
                <div style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.04em",
                  background: `linear-gradient(135deg,${ACCENT},#FCD34D)`,
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
                More revenue from<br />
                <span style={{ background: `linear-gradient(135deg,${ACCENT},#FCD34D)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  existing traffic.
                </span>
              </h2>
              <p style={{ fontSize: "1.0625rem", color: "var(--bt-muted)", lineHeight: 1.75, marginBottom: 20 }}>
                Most brands spend more and more on acquisition while leaving huge amounts of revenue on the table — leaky funnels, poor landing pages, abandoned carts, and disconnected email sequences.
              </p>
              <p style={{ fontSize: "1.0625rem", color: "var(--bt-muted)", lineHeight: 1.75 }}>
                Our CRO practice systematically identifies and fixes every conversion leak in your funnel, turning existing traffic into incremental revenue without increasing your ad spend.
              </p>
            </div>
            <div>
              <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid var(--bt-border)", aspectRatio: "4/3" }}>
                <img src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=960&h=720&q=80"
                  alt="Conversion & CRO" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
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
            <h2 className="heading-lg">How we unlock<br /><span style={{ color: ACCENT }}>hidden revenue.</span></h2>
          </div>
          <div className="process-grid">
            {PROCESS.map((p) => (
              <div key={p.step} className="cro-card card" style={{ padding: 32 }}>
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
            <h2 className="heading-lg">Full-funnel optimization.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
            {FEATURES.map((f) => (
              <div key={f} className="cro-card" style={{ display: "flex", gap: 12, alignItems: "center", padding: "16px 20px", borderRadius: 12, background: "var(--bt-surface)", border: "1px solid var(--bt-border)" }}>
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
          <h2 className="heading-lg" style={{ marginBottom: 20 }}>Ready to unlock<br /><span style={{ color: ACCENT }}>hidden revenue?</span></h2>
          <p style={{ fontSize: "1.0625rem", color: "var(--bt-muted)", maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.75 }}>Book a free funnel audit and we'll identify exactly where your revenue is leaking.</p>
          <Link href="/contact" className="btn btn-primary" style={{ fontSize: "1rem", padding: "16px 40px" }}>
            Book a Free Funnel Audit
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
