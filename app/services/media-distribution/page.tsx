"use client";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/sections/Footer";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ACCENT = "#38BDF8";

const PROCESS = [
  { step: "01", title: "Audience Architecture", desc: "We build precise audience segments from first-party data, behavioural signals, and lookalike modelling before a single rupee is spent." },
  { step: "02", title: "Channel Strategy", desc: "Matching your audience to the right mix of paid, earned, and owned channels — with budget allocation rooted in expected ROAS by channel." },
  { step: "03", title: "Creative Briefing", desc: "Channel-specific creative briefs that give our studio team exactly what they need to produce high-performance assets for each placement." },
  { step: "04", title: "Launch & Optimise", desc: "Campaigns go live with tight feedback loops — daily performance reviews, automated rules, and rapid creative iteration in the first 2 weeks." },
  { step: "05", title: "Attribution Modelling", desc: "Multi-touch attribution across every channel so you know exactly where your revenue is coming from and where to reinvest." },
  { step: "06", title: "Scale", desc: "Once a channel is profitable, we have proven playbooks to scale spend without eroding ROAS — systematically and sustainably." },
];

const RESULTS = [
  { num: "₹80Cr+", label: "Ad spend managed" },
  { num: "2.8×", label: "Avg ROAS improvement" },
  { num: "15+", label: "Platforms integrated" },
];

const FEATURES = [
  "Meta & Google Ads",
  "Programmatic",
  "Influencer Marketing",
  "PR & Earned Media",
  "SEO",
  "YouTube Ads",
  "CTV/OTT",
  "Native Ads",
  "Email Distribution",
  "LinkedIn Ads",
  "Regional OTT",
  "Affiliate Networks",
];

export default function MediaDistributionPage() {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".md-word", { y: "100%", stagger: 0.06, duration: 0.9, ease: "power4.out" });
    gsap.from(".md-sub", { opacity: 0, y: 20, stagger: 0.1, duration: 0.7, delay: 0.5 });
    gsap.utils.toArray<HTMLElement>(".md-card").forEach((card) => {
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
          <div className="md-sub" style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/services" style={{ fontSize: "0.8125rem", color: "var(--bt-muted)", textDecoration: "none" }}>Services</Link>
            <span style={{ color: "var(--bt-muted)" }}>→</span>
            <span className="chip">Media Distribution</span>
          </div>
          <h1 style={{ overflow: "hidden" }}>
            {["Right person.", "Right moment.", "Right message."].map((w, i) => (
              <div key={i} style={{ overflow: "hidden" }}>
                <span className="md-word" style={{
                  display: "block",
                  fontSize: "clamp(2rem, 7vw, 6rem)",
                  fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05,
                  color: i === 2 ? ACCENT : "var(--bt-white)",
                }}>{w}</span>
              </div>
            ))}
          </h1>
          <p className="md-sub" style={{ marginTop: 28, fontSize: "1.125rem", color: "var(--bt-muted)", maxWidth: 560, lineHeight: 1.75 }}>
            Precision media planning and buying across paid, earned, and owned channels — reaching your exact audience at the lowest cost and highest impact.
          </p>
          <div className="md-sub" style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
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
              <div key={r.label} className="md-card" style={{ textAlign: "center", padding: "32px 24px", borderRadius: 16, background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
                <div style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.04em",
                  background: `linear-gradient(135deg,${ACCENT},#7DD3FC)`,
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
                Reach the right<br />
                <span style={{ background: `linear-gradient(135deg,${ACCENT},#7DD3FC)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  audience, every time.
                </span>
              </h2>
              <p style={{ fontSize: "1.0625rem", color: "var(--bt-muted)", lineHeight: 1.75, marginBottom: 20 }}>
                Spray-and-pray media is dead. We combine data science with creative thinking to precision-target your audience across every relevant channel — at a cost that makes business sense.
              </p>
              <p style={{ fontSize: "1.0625rem", color: "var(--bt-muted)", lineHeight: 1.75 }}>
                From managed ₹80Cr+ in annual ad spend, we've built proven frameworks for every growth stage — from early-stage D2C brands to large enterprise media budgets.
              </p>
            </div>
            <div>
              <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid var(--bt-border)", aspectRatio: "4/3" }}>
                <img src="https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=960&h=720&q=80"
                  alt="Media Distribution" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
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
            <h2 className="heading-lg">How we reach<br /><span style={{ color: ACCENT }}>the right people.</span></h2>
          </div>
          <div className="process-grid">
            {PROCESS.map((p) => (
              <div key={p.step} className="md-card card" style={{ padding: 32 }}>
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
            <h2 className="heading-lg">Every channel covered.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
            {FEATURES.map((f) => (
              <div key={f} className="md-card" style={{ display: "flex", gap: 12, alignItems: "center", padding: "16px 20px", borderRadius: 12, background: "var(--bt-surface)", border: "1px solid var(--bt-border)" }}>
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
          <h2 className="heading-lg" style={{ marginBottom: 20 }}>Ready to reach your<br /><span style={{ color: ACCENT }}>perfect audience?</span></h2>
          <p style={{ fontSize: "1.0625rem", color: "var(--bt-muted)", maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.75 }}>Book a free media audit and we'll identify the highest-ROI channels for your brand.</p>
          <Link href="/contact" className="btn btn-primary" style={{ fontSize: "1rem", padding: "16px 40px" }}>
            Book a Free Media Audit
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
