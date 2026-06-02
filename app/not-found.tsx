"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

const QUICK_LINKS = [
  { label: "Home",     href: "/",         icon: "⌂", desc: "Back to start"    },
  { label: "Blog",     href: "/blog",     icon: "◈", desc: "Latest insights"  },
  { label: "Work",     href: "/work",     icon: "◉", desc: "Our portfolio"    },
  { label: "Services", href: "/services", icon: "◆", desc: "What we offer"    },
  { label: "About",    href: "/about",    icon: "◎", desc: "Our story"        },
  { label: "Contact",  href: "/contact",  icon: "✉", desc: "Get in touch"     },
];

const CODE_FRAGS = [
  "404 Not Found", "HTTP/1.1", "error: page_missing",
  "redirect(301)", "null reference", "undefined",
  "{ status: 404 }", "return null;", "fetch('/lost')",
  "¯\\_(ツ)_/¯", "throw new Error()", "page?.tsx",
];

export default function NotFound() {
  const [mouse,        setMouse]        = useState({ x: 0, y: 0 });
  const [glitch,       setGlitch]       = useState(false);
  const [typed,        setTyped]        = useState("");
  const [hoveredLink,  setHoveredLink]  = useState<string | null>(null);
  const glitchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const FULL_TEXT = "The page you're looking for doesn't exist — or maybe it never did.";

  /* Mouse parallax */
  useEffect(() => {
    const fn = (e: MouseEvent) => setMouse({
      x: (e.clientX / window.innerWidth  - 0.5) * 28,
      y: (e.clientY / window.innerHeight - 0.5) * 20,
    });
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  /* Typing animation */
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      if (i < FULL_TEXT.length) { setTyped(FULL_TEXT.slice(0, ++i)); }
      else clearInterval(t);
    }, 28);
    return () => clearInterval(t);
  }, []);

  /* Random glitch bursts */
  useEffect(() => {
    const schedule = () => {
      glitchRef.current = setTimeout(() => {
        setGlitch(true);
        setTimeout(() => { setGlitch(false); schedule(); }, 250);
      }, 2500 + Math.random() * 3000);
    };
    schedule();
    return () => { if (glitchRef.current) clearTimeout(glitchRef.current); };
  }, []);

  return (
    <>
      <style>{`
        @keyframes g1 {
          0%  { clip-path:inset(15% 0 65% 0); transform:translate(-5px,0) skewX(-2deg); }
          30% { clip-path:inset(75% 0 8%  0); transform:translate( 5px,0) skewX( 2deg); }
          60% { clip-path:inset(40% 0 45% 0); transform:translate(-3px,0); }
          100%{ clip-path:inset(15% 0 65% 0); transform:translate(-5px,0) skewX(-2deg); }
        }
        @keyframes g2 {
          0%  { clip-path:inset(65% 0 15% 0); transform:translate( 5px,0) skewX( 2deg); }
          30% { clip-path:inset(8%  0 75% 0); transform:translate(-5px,0) skewX(-2deg); }
          60% { clip-path:inset(45% 0 40% 0); transform:translate( 3px,0); }
          100%{ clip-path:inset(65% 0 15% 0); transform:translate( 5px,0) skewX( 2deg); }
        }
        @keyframes floatFrag {
          0%   { transform:translateY(110vh) rotate(-4deg); opacity:0; }
          8%   { opacity:0.18; }
          88%  { opacity:0.18; }
          100% { transform:translateY(-15vh) rotate(4deg); opacity:0; }
        }
        @keyframes scanline {
          from { transform:translateY(-100%); }
          to   { transform:translateY(100vh); }
        }
        @keyframes pulse-grid {
          0%,100% { opacity:0.03; }
          50%     { opacity:0.07; }
        }
        @keyframes blink {
          0%,100% { opacity:1; }
          50%     { opacity:0; }
        }
        @keyframes glow-pulse {
          0%,100% { text-shadow: 0 0 60px rgba(232,49,42,0.25), 0 0 120px rgba(232,49,42,0.1); }
          50%     { text-shadow: 0 0 80px rgba(232,49,42,0.45), 0 0 160px rgba(232,49,42,0.2); }
        }
        .nf-404 {
          font-size: clamp(7rem, 20vw, 17rem);
          font-weight: 900;
          letter-spacing: -0.06em;
          line-height: 1;
          color: #F5F5F5;
          position: relative;
          user-select: none;
          animation: glow-pulse 3s ease-in-out infinite;
        }
        .nf-g1 { position:absolute; inset:0; color:#E8312A; animation:g1 .15s steps(1) infinite; opacity:0; }
        .nf-g2 { position:absolute; inset:0; color:#38BDF8; animation:g2 .15s steps(1) infinite; opacity:0; }
        .glitch-on .nf-g1, .glitch-on .nf-g2 { opacity:1; }
        .nf-card {
          transition: background 0.2s, border-color 0.2s, transform 0.2s !important;
        }
        .nf-card:hover {
          background: rgba(232,49,42,0.07) !important;
          border-color: rgba(232,49,42,0.28) !important;
          transform: translateY(-4px) !important;
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#080808",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "60px 24px",
        position: "relative", overflow: "hidden",
        fontFamily: "Inter, system-ui, sans-serif",
      }}>

        {/* Grid BG */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          animation: "pulse-grid 5s ease-in-out infinite",
        }} />

        {/* Scan line */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: 3, pointerEvents: "none",
          background: "linear-gradient(transparent, rgba(232,49,42,0.12), transparent)",
          animation: "scanline 10s linear infinite",
        }} />

        {/* Floating code fragments */}
        {CODE_FRAGS.map((f, i) => (
          <span key={i} aria-hidden="true" style={{
            position: "absolute",
            left: `${(i * 9 + 4) % 88}%`,
            bottom: 0,
            fontFamily: "monospace",
            fontSize: "0.6875rem",
            color: "rgba(232,49,42,0.18)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            animation: `floatFrag ${14 + i * 1.3}s linear ${i * 1.1}s infinite`,
          }}>{f}</span>
        ))}

        {/* Content */}
        <div style={{
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", maxWidth: 760,
          gap: 0,
        }}>

          {/* Status badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 16px", borderRadius: 99, marginBottom: 40,
            background: "rgba(232,49,42,0.1)", border: "1px solid rgba(232,49,42,0.25)",
            fontSize: "0.6875rem", fontWeight: 700, color: "#E8312A",
            letterSpacing: "0.12em", textTransform: "uppercase",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#E8312A", boxShadow: "0 0 8px #E8312A", animation: "blink 1.5s step-end infinite" }} />
            HTTP 404 — Page Not Found
          </div>

          {/* Glitchy 404 */}
          <div
            className={`nf-404 ${glitch ? "glitch-on" : ""}`}
            style={{
              transform: `translate(${mouse.x * 0.35}px, ${mouse.y * 0.35}px)`,
              transition: "transform 0.12s ease-out",
              marginBottom: 24,
            }}
          >
            <span aria-hidden className="nf-g1">404</span>
            <span aria-hidden className="nf-g2">404</span>
            404
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: "clamp(1.25rem, 3vw, 2rem)",
            fontWeight: 800, color: "#F5F5F5",
            letterSpacing: "-0.03em", marginBottom: 18,
          }}>
            Looks like you&apos;re lost.
          </h1>

          {/* Typed text */}
          <p style={{
            fontFamily: "monospace", fontSize: "0.9375rem",
            color: "rgba(255,255,255,0.38)", lineHeight: 1.7,
            minHeight: "1.7em", marginBottom: 52,
          }}>
            {typed}
            <span style={{ borderRight: "2px solid rgba(255,255,255,0.38)", animation: "blink 1s step-end infinite" }}>&nbsp;</span>
          </p>

          {/* Nav cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10, width: "100%", maxWidth: 580,
            marginBottom: 52,
          }}>
            {QUICK_LINKS.map((lnk) => (
              <Link
                key={lnk.href}
                href={lnk.href}
                className="nf-card"
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start",
                  gap: 6, padding: "16px 14px",
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12, textDecoration: "none",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{lnk.icon}</span>
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F5F5F5" }}>{lnk.label}</span>
                <span style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.32)" }}>{lnk.desc}</span>
              </Link>
            ))}
          </div>

          {/* Terminal hint */}
          <div style={{
            fontFamily: "monospace", fontSize: "0.8125rem",
            color: "rgba(255,255,255,0.18)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: "#34D399" }}>~$</span>
            <span>GET /this-page HTTP/1.1 →&nbsp;</span>
            <span style={{ color: "rgba(232,49,42,0.65)" }}>404 Not Found</span>
          </div>
        </div>
      </div>
    </>
  );
}
