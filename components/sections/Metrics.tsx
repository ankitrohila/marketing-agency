"use client";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STATS = [
  { value: 150, suffix: "+",   label: "Brands Grown",      sub: "across India & SEA"       },
  { value: 8.4, suffix: "×",   label: "Average ROAS",      sub: "across performance brands" },
  { value: 120, suffix: "Cr+", label: "Revenue Generated", sub: "for our clients in FY24"  },
  { value: 97,  suffix: "%",   label: "Client Retention",  sub: "year-over-year"            },
];

const GALLERY = [
  { img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=520&h=640&q=80", w: 260, h: 320, top:   0, left:   0, rotate: -5  },
  { img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&h=520&q=80",   w: 200, h: 260, top:  40, left: 280, rotate:  3  },
  { img: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=440&h=580&q=80", w: 220, h: 290, top:  10, left: 500, rotate: -2  },
  { img: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=360&h=480&q=80", w: 180, h: 240, top: 300, left:  20, rotate:  6  },
  { img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=480&h=600&q=80", w: 240, h: 300, top: 280, left: 220, rotate: -4  },
];

/* Floating stat badges overlaid on gallery images */
const GALLERY_BADGES = [
  { idx: 0, value: "150+", label: "Brands" },
  { idx: 2, value: "8.4×", label: "ROAS"   },
];

function AnimatedNumber({ target, suffix, decimals = 0 }: { target: number; suffix: string; decimals?: number }) {
  const [display, setDisplay] = useState("0");
  const numRef    = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = numRef.current;
    if (!el || triggered.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || triggered.current) return;
        triggered.current = true;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: 2, ease: "power2.out",
          onUpdate() {
            setDisplay(decimals > 0 ? obj.val.toFixed(decimals) : Math.round(obj.val).toString());
          },
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, decimals]);

  return (
    <span ref={numRef} style={{ fontVariantNumeric: "tabular-nums" }}>
      {display}
    </span>
  );
}

export default function Metrics() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>(".gallery-img").forEach((img, i) => {
      gsap.to(img, {
        y: i % 2 === 0 ? -40 : 40,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom", end: "bottom top",
          scrub: 1,
        },
      });
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="section" style={{ background: "var(--bt-surface)", overflow: "hidden" }}>
      <div className="container">
        <div className="r-metrics-wrap">

          {/* Left: Stats */}
          <div className="r-metrics-stats">
            <span className="chip" style={{ marginBottom: 24 }}>By The Numbers</span>
            <h2 className="heading-lg" style={{ marginBottom: 48 }}>
              Results that<br />
              <span style={{
                background: "linear-gradient(135deg,#E8312A,#FF8C19)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>speak loudest.</span>
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div style={{
                    fontSize: "clamp(2rem, 5vw, 3.5rem)",
                    fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1,
                    background: "linear-gradient(135deg,#E8312A,#FF8C19)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>
                    <AnimatedNumber target={stat.value} suffix={stat.suffix} decimals={stat.value % 1 !== 0 ? 1 : 0} />
                    {stat.suffix}
                  </div>
                  <div style={{ marginTop: 8, fontWeight: 700, fontSize: "0.9375rem", color: "var(--bt-white)" }}>
                    {stat.label}
                  </div>
                  <div style={{ marginTop: 4, fontSize: "0.75rem", color: "var(--bt-muted)" }}>
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 48 }}>
              <a href="/work" className="btn btn-primary" style={{ fontSize: "0.9375rem" }}>
                See Case Studies
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right: Photo gallery */}
          <div className="r-metrics-gallery">
            {GALLERY.map((item, i) => (
              <div
                key={i}
                className="gallery-img"
                style={{
                  position: "absolute",
                  top: item.top, left: item.left,
                  width: item.w, height: item.h,
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1px solid var(--bt-border)",
                  transform: `rotate(${item.rotate}deg)`,
                  boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
                }}
              >
                <img
                  src={item.img}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  loading="lazy"
                />
                {/* Dark tint */}
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.28)" }} />

                {/* Badge overlay on selected cards */}
                {GALLERY_BADGES.find(b => b.idx === i) && (() => {
                  const badge = GALLERY_BADGES.find(b => b.idx === i)!;
                  return (
                    <div style={{
                      position: "absolute", bottom: 14, left: "50%",
                      transform: "translateX(-50%)",
                      textAlign: "center", padding: "10px 18px",
                      background: "rgba(5,5,5,0.75)",
                      backdropFilter: "blur(8px)",
                      borderRadius: 99,
                      border: "1px solid rgba(232,49,42,0.35)",
                    }}>
                      <div style={{
                        fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.04em",
                        background: "linear-gradient(135deg,#E8312A,#FF8C19)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      }}>
                        {badge.value}
                      </div>
                      <div style={{ fontSize: "0.5625rem", color: "var(--bt-muted)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        {badge.label}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
