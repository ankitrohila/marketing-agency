"use client";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BookingModal from "@/components/BookingModal";
import LeadCaptureModal from "@/components/LeadCaptureModal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ── Floating hero-overlay cards ───────────────────────────────────── */
const FLOATING_CARDS = [
  { img: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=260&h=320&q=80",   label: "Brand Systems",   top: "12%", left:  "2%",   rotate: "-8deg",  side: "left"  },
  { img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=260&h=320&q=80", label: "Creative Tech",   top: "10%", right: "3%",   rotate:  "6deg",  side: "right" },
  { img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=260&h=320&q=80",  label: "Analytics",       top: "58%", left:  "1%",   rotate: "-4deg",  side: "left"  },
  { img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=260&h=320&q=80", label: "Growth Infra",    top: "55%", right: "2%",   rotate: "10deg",  side: "right" },
  { img: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=260&h=320&q=80",  label: "MarTech",         top: "34%", left:  "0%",   rotate: "-12deg", side: "left"  },
  { img: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=260&h=320&q=80", label: "Demand Gen",      top: "30%", right: "0.5%", rotate:  "8deg",  side: "right" },
];

/* ── Circular marketing cards (bottom row) ──────────────────────────── */
const ROUND_CARDS = [
  { img: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=440&h=580&q=80",  label: "Attention Engineering"   },
  { img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=440&h=580&q=80", label: "Distribution Infra"      },
  { img: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=440&h=580&q=80", label: "Conversion Systems"      },
  { img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=440&h=580&q=80", label: "Performance Marketing"   },
  { img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=440&h=580&q=80", label: "MarTech & AI"            },
  { img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=440&h=580&q=80",  label: "Data & Analytics"        },
];

export default function Hero() {
  const sectionRef  = useRef<HTMLElement>(null);
  const cardsRef    = useRef<HTMLDivElement>(null);
  const hScrollRef  = useRef<HTMLElement>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [leadOpen,    setLeadOpen]    = useState(false);

  useGSAP(() => {
    /* ── 1. Hero title reveal ─────────────────────────────────── */
    gsap.from(".hero-word", {
      y: "100%", opacity: 0,
      duration: 1.0, stagger: 0.07,
      ease: "power4.out", delay: 0.2,
    });

    /* ── 2. Floating cards entrance ──────────────────────────── */
    gsap.from(".float-card", {
      opacity: 0, scale: 0.75, y: 30,
      duration: 0.8, stagger: 0.1,
      delay: 0.7, ease: "power3.out",
    });

    /* ── 3. Sub elements ─────────────────────────────────────── */
    gsap.from(".hero-sub", {
      opacity: 0, y: 24,
      duration: 0.8, stagger: 0.1,
      delay: 0.9, ease: "power3.out",
    });

    /* ── 4. Floating cards SUBTLE SCROLL effect ───────────────
       Left cards  (even index) → move right (+x)
       Right cards (odd index)  → move left  (-x)
       Both slightly shrink and fade but remain visible        */
    gsap.utils.toArray<HTMLElement>(".float-card").forEach((card, i) => {
      const isLeft = i % 2 === 0;
      gsap.to(card, {
        x:    isLeft ? 50 : -50,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start:   "top top",
          end:     "bottom top",
          scrub:   1.2,
        },
      });
    });

    /* ── 5. Horizontal card track scroll (L → R on scroll) ───── */
    const track = cardsRef.current;
    if (track) {
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth + 80),
        ease: "none",
        scrollTrigger: {
          trigger: track.parentElement,
          start:   "top bottom",
          end:     "bottom top",
          scrub:   1.5,
        },
      });
    }

    /* ── 6. Circular cards row DIAGONAL TILT on scroll ──────── */
    const hSection = hScrollRef.current;
    if (hSection) {
      gsap.to(hSection, {
        rotateZ:         4,
        transformOrigin: "50% 50%",
        ease:            "none",
        scrollTrigger: {
          trigger: hSection,
          start:   "top bottom",
          end:     "bottom top",
          scrub:   1.5,
        },
      });
    }
  }, { scope: sectionRef });

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        ref={sectionRef}
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          minHeight: "100svh",
          paddingTop: "var(--nav-h)",
          background: "var(--bt-black)",
        }}
        aria-label="Hero"
      >
        {/* Background grid */}
        <div className="bg-grid" aria-hidden="true"
          style={{ position: "absolute", inset: 0, opacity: 0.4,
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 90%)" }} />

        {/* Radial brand glow */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 55% 50% at 50% 40%, rgba(232,49,42,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* ── Floating side cards ── */}
        {FLOATING_CARDS.map((card, i) => {
          const style: React.CSSProperties = {
            position: "absolute", top: card.top,
            width: 130, height: 160,
            borderRadius: 16,
            border: "1px solid var(--bt-border)",
            transform: `rotate(${card.rotate})`,
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.55)",
            zIndex: 1, willChange: "transform",
          };
          if (card.side === "left")  style.left  = card.left;
          else                       style.right = card.right;

          return (
            <div key={i} className="float-card" aria-hidden="true" style={style}>
              {/* Photo */}
              <img
                src={card.img}
                alt=""
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
              {/* Gradient overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.72) 100%)",
              }} />
              {/* Brand accent line */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: 3,
                background: "linear-gradient(90deg, #E8312A, #FF8C19)",
              }} />
              {/* Label */}
              <span style={{
                position: "absolute", bottom: 12, left: 10, right: 10,
                fontSize: "0.5625rem", fontWeight: 700,
                color: "#ffffff", letterSpacing: "0.1em",
                textTransform: "uppercase", zIndex: 1,
              }}>
                {card.label}
              </span>
            </div>
          );
        })}

        {/* ── Centre content ── */}
        <div style={{ textAlign: "center", position: "relative", zIndex: 2, maxWidth: 1000, padding: "0 24px" }}>
          {/* Chip */}
          <div className="hero-sub" style={{ marginBottom: 24 }}>
            <span className="chip">Growth Infrastructure Company</span>
          </div>

          {/* Giant headline */}
          <div style={{ lineHeight: 0.92 }}>
            {[
              { word: "We Build",    accent: false },
              { word: "Systems",     accent: false },
              { word: "That Drive",  accent: false },
              { word: "Measurable",  accent: true  },
              { word: "Growth",      accent: true  },
            ].map(({ word, accent }) => (
              <div key={word} style={{ overflow: "hidden", display: "inline-block", marginRight: "0.2em" }}>
                <span
                  className="hero-word"
                  style={{
                    display: "inline-block",
                    fontSize: "clamp(3rem, 9vw, 9.5rem)",
                    fontWeight: 900, letterSpacing: "-0.05em",
                    color: accent ? "var(--bt-lime)" : "var(--bt-white)",
                  }}
                >
                  {word}
                </span>
              </div>
            ))}
          </div>

          <p className="hero-sub"
            style={{ marginTop: 28, fontSize: "1.125rem", color: "var(--bt-muted)", lineHeight: 1.75, maxWidth: 560, margin: "28px auto 0" }}>
            BrandThink engineers demand generation, distribution infrastructure, and conversion systems — replacing one-off campaigns with scalable growth architecture.
          </p>

          {/* CTAs */}
          <div className="hero-sub" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 40 }}>
            <button onClick={() => setLeadOpen(true)} className="btn btn-primary" style={{ fontSize: "1rem", padding: "14px 32px" }}>
              Start a Project
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button
              onClick={() => setBookingOpen(true)}
              className="btn btn-secondary"
              style={{ fontSize: "1rem", padding: "14px 32px", display: "flex", alignItems: "center", gap: 8 }}
            >
              📅 Book a Free Call
            </button>
          </div>

          {/* Metrics strip */}
          <div className="hero-sub" style={{
            display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap",
            marginTop: 72, paddingTop: 32,
            borderTop: "1px solid var(--bt-border)",
          }}>
            {[
              { num: "150+",    label: "Brands Built" },
              { num: "8.4×",    label: "Avg ROAS" },
              { num: "₹120Cr+", label: "Revenue Generated" },
            ].map((m) => (
              <div key={m.label} style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "clamp(1.75rem,3vw,2.5rem)", fontWeight: 800,
                  letterSpacing: "-0.04em",
                  background: "linear-gradient(135deg, #E8312A, #FF8C19)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                  {m.num}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--bt-muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4 }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Round Cards Scroll Row ─────────────────────────────── */}
      <section
        ref={hScrollRef}
        style={{
          background: "var(--bt-black)",
          paddingBottom: 80,
          overflow: "hidden",
          willChange: "transform",
        }}
        aria-label="Expertise cards"
      >
        <div style={{ padding: "0 0 0 40px" }}>
          <div ref={cardsRef} style={{ display: "flex", gap: 16, width: "max-content" }}>
            {[...ROUND_CARDS, ...ROUND_CARDS].map((card, i) => (
              <div
                key={i}
                style={{
                  width: 220, height: 300,
                  borderRadius: 160,
                  overflow: "hidden",
                  border: "1px solid var(--bt-border)",
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                {/* Photo */}
                <img
                  src={card.img}
                  alt={card.label}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  loading="lazy"
                />
                {/* Gradient overlay */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.80) 100%)",
                }} />
                {/* Label */}
                <span style={{
                  position: "absolute", bottom: 24, left: 0, right: 0, textAlign: "center",
                  fontSize: "0.6875rem", fontWeight: 700,
                  color: "#ffffff", letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}>
                  {card.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
      <LeadCaptureModal isOpen={leadOpen} onClose={() => setLeadOpen(false)} />
    </>
  );
}
