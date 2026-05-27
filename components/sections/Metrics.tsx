"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STATS = [
  {
    value: 150, suffix: "+", label: "Brands Grown", sub: "across India & SEA",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=320&h=220&q=80",
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=320&h=220&q=80",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=320&h=220&q=80",
    ],
  },
  {
    value: 8.4, suffix: "×", label: "Average ROAS", sub: "across performance brands",
    images: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=320&h=220&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=320&h=220&q=80",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=320&h=220&q=80",
    ],
  },
  {
    value: 120, suffix: "Cr+", label: "Revenue Generated", sub: "for clients in FY24",
    images: [
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=320&h=220&q=80",
      "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=320&h=220&q=80",
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=320&h=220&q=80",
    ],
  },
  {
    value: 97, suffix: "%", label: "Client Retention", sub: "year-over-year",
    images: [
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=320&h=220&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=320&h=220&q=80",
      "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=320&h=220&q=80",
    ],
  },
];

/* ── Animated Number ── */
function AnimatedNumber({
  target,
  suffix,
  decimals = 0,
}: {
  target: number;
  suffix: string;
  decimals?: number;
}) {
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
          val: target,
          duration: 2.2,
          ease: "power2.out",
          onUpdate() {
            setDisplay(
              decimals > 0
                ? obj.val.toFixed(decimals)
                : Math.round(obj.val).toString()
            );
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

/* ── Hover Image Flip Card ── */
function HoverImageCard({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startFlipping = useCallback(() => {
    setActive(0);
    timerRef.current = setInterval(() => {
      setActive((a) => (a + 1) % images.length);
    }, 600);
  }, [images.length]);

  const stopFlipping = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => () => stopFlipping(), [stopFlipping]);

  return (
    <div
      onMouseEnter={startFlipping}
      onMouseLeave={stopFlipping}
      style={{
        position: "relative",
        width: 280,
        height: 180,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: active === i ? 1 : 0,
            transition: active === i ? "opacity 0.25s ease" : "opacity 0.1s ease",
            backfaceVisibility: "hidden",
          }}
          loading="lazy"
        />
      ))}
      {/* Flip indicator dots */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 5,
        }}
      >
        {images.map((_, i) => (
          <span
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: active === i ? "#E8312A" : "rgba(255,255,255,0.4)",
              transition: "background 0.2s",
              display: "block",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Stat Card with Hover Pop ── */
function StatCard({
  stat,
}: {
  stat: (typeof STATS)[number];
}) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative", cursor: "pointer" }}
    >
      {/* Floating image card (appears on hover) */}
      <div
        style={{
          position: "absolute",
          bottom: "calc(100% + 16px)",
          left: "50%",
          transform: `translateX(-50%) translateY(${hovered ? 0 : 12}px)`,
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? "auto" : "none",
          transition: "opacity 0.25s ease, transform 0.25s ease",
          zIndex: 10,
        }}
      >
        <HoverImageCard images={stat.images} />
      </div>

      {/* The stat number */}
      <div
        style={{
          padding: "28px 24px",
          borderRadius: 20,
          background: hovered
            ? "rgba(232,49,42,0.08)"
            : "rgba(255,255,255,0.03)",
          border: `1px solid ${hovered ? "rgba(232,49,42,0.3)" : "rgba(255,255,255,0.06)"}`,
          transition: "background 0.3s, border-color 0.3s",
        }}
      >
        <div
          style={{
            fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            background: "linear-gradient(135deg,#E8312A,#FF8C19)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          <AnimatedNumber
            target={stat.value}
            suffix={stat.suffix}
            decimals={stat.value % 1 !== 0 ? 1 : 0}
          />
          {stat.suffix}
        </div>
        <div
          style={{
            marginTop: 10,
            fontWeight: 700,
            fontSize: "0.9375rem",
            color: "var(--bt-white)",
          }}
        >
          {stat.label}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: "0.75rem",
            color: "var(--bt-muted)",
          }}
        >
          {stat.sub}
        </div>
        {/* Hint */}
        <div
          style={{
            marginTop: 12,
            fontSize: "0.625rem",
            color: hovered ? "#E8312A" : "rgba(255,255,255,0.2)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 600,
            transition: "color 0.2s",
          }}
        >
          Hover to explore ↑
        </div>
      </div>
    </div>
  );
}

/* ── Main Section ── */
export default function Metrics() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="section"
      style={{ background: "var(--bt-surface)", overflow: "visible" }}
    >
      <div className="container">
        <div style={{ marginBottom: 56 }}>
          <span className="chip" style={{ marginBottom: 16 }}>
            By The Numbers
          </span>
          <h2 className="heading-lg">
            Results that
            <br />
            <span
              style={{
                background: "linear-gradient(135deg,#E8312A,#FF8C19)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              speak loudest.
            </span>
          </h2>
          <p
            style={{
              marginTop: 16,
              fontSize: "1rem",
              color: "var(--bt-muted)",
              maxWidth: 480,
              lineHeight: 1.7,
            }}
          >
            Hover over any metric to see real client stories behind the number.
          </p>
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 20,
          }}
        >
          {STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>

        <div style={{ marginTop: 48 }}>
          <a
            href="/work"
            className="btn btn-primary"
            style={{ fontSize: "0.9375rem" }}
          >
            See Case Studies
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
