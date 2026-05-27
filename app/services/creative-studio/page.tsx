"use client";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/sections/Footer";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ACCENT = "#8B5CF6";

const PROCESS = [
  { step: "01", title: "Concept & Strategy", desc: "We start with the brief, market context, and audience insight to develop a creative direction that's rooted in strategy." },
  { step: "02", title: "Art Direction", desc: "Mood boards, visual references, typography, and colour — defining the look and feel before a single pixel is placed." },
  { step: "03", title: "Production", desc: "In-house design, motion, photography, and video teams produce the work at speed without sacrificing craft." },
  { step: "04", title: "Distribution Ready", desc: "Every asset is sized, optimised, and spec'd for every channel — social, digital, print, OOH, and beyond." },
  { step: "05", title: "Analysis & Iteration", desc: "We review performance data and iterate on creative to continuously improve engagement and conversion." },
  { step: "06", title: "Creative Scaling", desc: "Build a library of modular creative assets that your team can deploy at scale without losing brand consistency." },
];

const RESULTS = [
  { num: "3M+", label: "Impressions per campaign" },
  { num: "4.8×", label: "Higher CTR vs industry avg" },
  { num: "200+", label: "Creatives produced/month" },
];

const FEATURES = [
  "Campaign Concept",
  "Visual Design",
  "Video & Motion",
  "Photography",
  "Social Creatives",
  "OOH & Print",
  "Brand Campaigns",
  "Reels & Shorts",
  "UI/UX Design",
  "Infographic Production",
  "Email Design",
  "Ad Creative Systems",
];

export default function CreativeStudioPage() {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".cs-word", { y: "100%", stagger: 0.06, duration: 0.9, ease: "power4.out" });
    gsap.from(".cs-sub", { opacity: 0, y: 20, stagger: 0.1, duration: 0.7, delay: 0.5 });
    gsap.utils.toArray<HTMLElement>(".cs-card").forEach((card) => {
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
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 50% 50% at 30% 50%, ${ACCENT}12, transparent 70%)`, pointerEvents: "none" }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="cs-sub" style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/services" style={{ fontSize: "0.8125rem", color: "var(--bt-muted)", textDecoration: "none" }}>Services</Link>
            <span style={{ color: "var(--bt-muted)" }}>→</span>
            <span className="chip">Creative Studio</span>
          </div>
          <h1 style={{ overflow: "hidden" }}>
            {["Design that earns", "attention."].map((w, i) => (
              <div key={i} style={{ overflow: "hidden" }}>
                <span className="cs-word" style={{
                  display: "block",
                  fontSize: "clamp(2.5rem, 8vw, 7rem)",
                  fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.0,
                  color: i === 1 ? ACCENT : "var(--bt-white)",
                }}>{w}</span>
              </div>
            ))}
          </h1>
          <p className="cs-sub" style={{ marginTop: 28, fontSize: "1.125rem", color: "var(--bt-muted)", maxWidth: 560, lineHeight: 1.75 }}>
            Our in-house creative team produces work that stops scrolling and starts conversations — from campaign ideation to final production.
          </p>
          <div className="cs-sub" style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
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
              <div key={r.label} className="cs-card" style={{ textAlign: "center", padding: "32px 24px", borderRadius: 16, background: "var(--bt-card)", border: "1px solid var(--bt-border)" }}>
                <div style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.04em",
                  background: `linear-gradient(135deg,${ACCENT},#C4B5FD)`,
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
                Creative that<br />
                <span style={{ background: `linear-gradient(135deg,${ACCENT},#C4B5FD)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  drives results.
                </span>
              </h2>
              <p style={{ fontSize: "1.0625rem", color: "var(--bt-muted)", lineHeight: 1.75, marginBottom: 20 }}>
                In an attention economy, creative quality is a direct business lever. The right visual, the right message, the right moment — that's what our studio is built to deliver, at scale.
              </p>
              <p style={{ fontSize: "1.0625rem", color: "var(--bt-muted)", lineHeight: 1.75 }}>
                From single hero campaigns to high-volume social content engines, we produce work that earns attention and converts it into action.
              </p>
            </div>
            <div>
              <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid var(--bt-border)", aspectRatio: "4/3" }}>
                <img src="https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=960&h=720&q=80"
                  alt="Creative Studio" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
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
            <h2 className="heading-lg">How we make<br /><span style={{ color: ACCENT }}>work that works.</span></h2>
          </div>
          <div className="process-grid">
            {PROCESS.map((p) => (
              <div key={p.step} className="cs-card card" style={{ padding: 32 }}>
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
            <h2 className="heading-lg">Everything included.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
            {FEATURES.map((f) => (
              <div key={f} className="cs-card" style={{ display: "flex", gap: 12, alignItems: "center", padding: "16px 20px", borderRadius: 12, background: "var(--bt-surface)", border: "1px solid var(--bt-border)" }}>
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
          <h2 className="heading-lg" style={{ marginBottom: 20 }}>Ready to make work<br /><span style={{ color: ACCENT }}>that earns attention?</span></h2>
          <p style={{ fontSize: "1.0625rem", color: "var(--bt-muted)", maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.75 }}>Book a free creative consultation and let's talk about what your brand needs to stand out.</p>
          <Link href="/contact" className="btn btn-primary" style={{ fontSize: "1rem", padding: "16px 40px" }}>
            Book a Free Consultation
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
