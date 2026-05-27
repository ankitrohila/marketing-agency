"use client";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const MOSAIC = [
  { img: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&h=560&q=80", span: "col-span-2", h: 280, label: "Brand Strategy"       },
  { img: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=400&h=560&q=80", span: "",           h: 280, label: "Creative Studio"       },
  { img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&h=520&q=80", span: "",        h: 260, label: "Performance Marketing" },
  { img: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&h=520&q=80", span: "col-span-2", h: 260, label: "MarTech & Automation"  },
];

export default function GridImages() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".mosaic-cell", {
      opacity: 0, scale: 0.92, y: 30,
      stagger: 0.1, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="section" style={{ background: "var(--bt-black)" }}>
      <div className="container">

        {/* Section header */}
        <div style={{ marginBottom: 40 }}>
          <span className="chip" style={{ marginBottom: 16 }}>Our Craft</span>
          <h2 className="heading-lg">
            Every channel.<br />
            <span style={{
              background: "linear-gradient(135deg,#E8312A,#FF8C19)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>One vision.</span>
          </h2>
        </div>

        {/* Mosaic grid */}
        <div className="r-grid-mosaic">
          {MOSAIC.map((cell, i) => (
            <div
              key={i}
              className={`mosaic-cell${cell.span ? " r-mosaic-wide" : ""}`}
              style={{
                height:     cell.h,
                borderRadius: 16,
                border:     "1px solid var(--bt-border)",
                overflow:   "hidden",
                position:   "relative",
              }}
            >
              <img
                src={cell.img}
                alt={cell.label}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
                  transition: "transform 0.6s var(--ease-out)" }}
                loading="lazy"
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.68) 100%)",
              }} />
              <span style={{
                position: "absolute", bottom: 20, left: 20,
                fontSize: "0.75rem", fontWeight: 700,
                color: "#ffffff", letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                {cell.label}
              </span>
              {i % 2 === 0 && (
                <div style={{
                  position: "absolute", top: 16, left: 16,
                  width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(232,49,42,0.18)", border: "1px solid rgba(232,49,42,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E8312A" }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA bar */}
        <div className="r-cta-bar" style={{
          marginTop: 48, padding: "56px 48px", borderRadius: 20,
          background: "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)",
        }}>
          <div>
            <h2 style={{
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              fontWeight: 900, letterSpacing: "-0.04em",
              color: "#ffffff", lineHeight: 1.1,
            }}>
              Ready to build your<br />growth engine?
            </h2>
            <p style={{ marginTop: 12, fontSize: "1rem", color: "rgba(255,255,255,0.75)" }}>
              Let&apos;s talk about your next big move.
            </p>
          </div>
          <Link
            href="/contact"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "16px 36px", borderRadius: 99,
              background: "#ffffff", color: "#E8312A",
              fontWeight: 700, fontSize: "1rem", textDecoration: "none",
              transition: "transform 0.2s, box-shadow 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.04)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            Book a Strategy Call
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}
