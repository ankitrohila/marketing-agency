"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LOGOS = [
  "Growify", "NovaBev", "MedAxis", "StyleVerse",
  "TechPulse", "UrbanEats", "FintechX", "PharmaOne",
  "RetailMax", "EduLaunch", "CleanCo", "BioCore",
];

export default function Brands() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".brands-heading", {
      opacity: 0, y: 30, duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
    });
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="section"
      style={{ background: "#080808", overflow: "hidden" }}
      aria-label="Client brands"
    >
      <div className="container">
        <div className="brands-heading" style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="chip" style={{ marginBottom: 20 }}>Trusted By</span>
          <h2 className="heading-lg">
            Brands that chose<br /><span style={{ color: "var(--bt-lime)" }}>to grow differently.</span>
          </h2>
        </div>

        {/* Marquee row 1 */}
        <div className="marquee-outer" style={{ marginBottom: 20 }}>
          <div className="marquee-track">
            {[...LOGOS, ...LOGOS].map((logo, i) => (
              <div
                key={i}
                style={{
                  flexShrink: 0,
                  padding: "14px 32px",
                  borderRadius: 12,
                  border: "1px solid var(--bt-border)",
                  background: "var(--bt-card)",
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: "var(--bt-muted)",
                  letterSpacing: "-0.02em",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s, border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--bt-white)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--bt-muted)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--bt-border)";
                }}
              >
                {logo}
              </div>
            ))}
          </div>
        </div>

        {/* Marquee row 2 (reverse) */}
        <div className="marquee-outer">
          <div
            className="marquee-track"
            style={{ animationDirection: "reverse" }}
          >
            {[...[...LOGOS].reverse(), ...[...LOGOS].reverse()].map((logo, i) => (
              <div
                key={i}
                style={{
                  flexShrink: 0,
                  padding: "14px 32px",
                  borderRadius: 12,
                  border: "1px solid var(--bt-border)",
                  background: "var(--bt-card)",
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: "var(--bt-muted)",
                  letterSpacing: "-0.02em",
                  whiteSpace: "nowrap",
                }}
              >
                {logo}
              </div>
            ))}
          </div>
        </div>

        {/* CTA strip */}
        <div
          style={{
            marginTop: 64, textAlign: "center",
            padding: "40px", borderRadius: 20,
            background: "var(--bt-card)", border: "1px solid var(--bt-border)",
          }}
        >
          <p style={{ fontSize: "1.0625rem", color: "var(--bt-muted)", marginBottom: 24 }}>
            Ready to join the list?
          </p>
          <a href="/contact" className="btn btn-primary">
            Start a Conversation
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}
