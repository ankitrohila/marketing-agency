"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const ERROR_TYPES: Record<string, { code: string; title: string; desc: string; color: string; hint: string }> = {
  "500": {
    code: "500", title: "Internal Server Error",
    desc: "Something broke on our end. It's not you — it's us.",
    color: "#FB923C",
    hint: "This is usually a temporary issue. Try again or contact us if it persists.",
  },
  "503": {
    code: "503", title: "Service Unavailable",
    desc: "The server is temporarily unable to handle the request.",
    color: "#FBBF24",
    hint: "We may be doing maintenance or experiencing high traffic. Give us a minute.",
  },
  "502": {
    code: "502", title: "Bad Gateway",
    desc: "The server received an invalid response from an upstream server.",
    color: "#F472B6",
    hint: "This is typically a network or infrastructure issue on our side.",
  },
  "default": {
    code: "5XX", title: "Something Went Wrong",
    desc: "An unexpected error occurred while processing your request.",
    color: "#FB923C",
    hint: "Our team has been notified. Try refreshing or go back home.",
  },
};

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string; status?: number };
  reset: () => void;
}) {
  const [glitch, setGlitch] = useState(false);
  const [details, setDetails] = useState(false);

  const status  = error?.status?.toString() ?? "default";
  const errType = ERROR_TYPES[status] ?? ERROR_TYPES["default"];

  /* Trigger glitch on mount */
  useEffect(() => {
    setGlitch(true);
    const t = setTimeout(() => setGlitch(false), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes eg1 {
          0%  { clip-path:inset(10% 0 70% 0); transform:translate(-6px,0); }
          40% { clip-path:inset(70% 0 10% 0); transform:translate( 6px,0); }
          70% { clip-path:inset(40% 0 40% 0); transform:translate(-3px,0); }
          100%{ clip-path:inset(10% 0 70% 0); transform:translate(-6px,0); }
        }
        @keyframes eg2 {
          0%  { clip-path:inset(70% 0 10% 0); transform:translate( 6px,0); }
          40% { clip-path:inset(10% 0 70% 0); transform:translate(-6px,0); }
          70% { clip-path:inset(40% 0 40% 0); transform:translate( 3px,0); }
          100%{ clip-path:inset(70% 0 10% 0); transform:translate( 6px,0); }
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes scanline-err {
          from { transform:translateY(-100%); }
          to   { transform:translateY(100vh); }
        }
        @keyframes err-pulse {
          0%,100% { opacity:0.04; }
          50%     { opacity:0.09; }
        }
        .err-code { position:relative; user-select:none; }
        .err-g1 { position:absolute; inset:0; animation:eg1 .12s steps(1) infinite; opacity:0; }
        .err-g2 { position:absolute; inset:0; animation:eg2 .12s steps(1) infinite; opacity:0; }
        .glitch-on .err-g1, .glitch-on .err-g2 { opacity:1; }
        .err-btn { transition: all 0.2s !important; }
        .err-btn:hover { transform: translateY(-2px) !important; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#080808",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "60px 24px", position: "relative", overflow: "hidden",
        fontFamily: "Inter, system-ui, sans-serif",
      }}>

        {/* BG Grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px", animation: "err-pulse 5s ease-in-out infinite",
        }} />

        {/* Scan line */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: 2, pointerEvents: "none",
          background: `linear-gradient(transparent, ${errType.color}22, transparent)`,
          animation: "scanline-err 9s linear infinite",
        }} />

        {/* Content */}
        <div style={{
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column",
          alignItems: "center", textAlign: "center", maxWidth: 680,
        }}>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 16px", borderRadius: 99, marginBottom: 40,
            background: `${errType.color}18`, border: `1px solid ${errType.color}33`,
            fontSize: "0.6875rem", fontWeight: 700, color: errType.color,
            letterSpacing: "0.12em", textTransform: "uppercase",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: errType.color, boxShadow: `0 0 8px ${errType.color}`, animation: "blink 1.5s step-end infinite" }} />
            HTTP {errType.code}
          </div>

          {/* Code */}
          <div
            className={`err-code ${glitch ? "glitch-on" : ""}`}
            style={{
              fontSize: "clamp(6rem, 18vw, 14rem)",
              fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 1,
              color: "#F5F5F5", marginBottom: 24,
            }}
          >
            <span aria-hidden className="err-g1" style={{ color: errType.color }}>{errType.code}</span>
            <span aria-hidden className="err-g2" style={{ color: "#38BDF8" }}>{errType.code}</span>
            {errType.code}
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: "clamp(1.25rem, 3vw, 1.875rem)",
            fontWeight: 800, color: "#F5F5F5",
            letterSpacing: "-0.03em", marginBottom: 16,
          }}>
            {errType.title}
          </h1>

          <p style={{
            fontSize: "1rem", color: "rgba(255,255,255,0.4)",
            lineHeight: 1.7, maxWidth: 460, marginBottom: 12,
          }}>
            {errType.desc}
          </p>
          <p style={{
            fontFamily: "monospace", fontSize: "0.8125rem",
            color: "rgba(255,255,255,0.25)", lineHeight: 1.7, marginBottom: 48,
          }}>
            {errType.hint}
          </p>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
            <button
              onClick={reset}
              className="err-btn"
              style={{
                padding: "12px 28px", borderRadius: 99,
                background: errType.color, border: "none",
                color: "#fff", fontSize: "0.875rem", fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
              </svg>
              Try Again
            </button>
            <Link
              href="/"
              className="err-btn"
              style={{
                padding: "12px 28px", borderRadius: 99,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#F5F5F5", fontSize: "0.875rem", fontWeight: 600,
                textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Go Home
            </Link>
            <Link
              href="/contact"
              className="err-btn"
              style={{
                padding: "12px 28px", borderRadius: 99,
                background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", fontWeight: 600,
                textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
              }}
            >
              Report Issue →
            </Link>
          </div>

          {/* Error digest / details toggle */}
          {error?.digest && (
            <div style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
              <button
                onClick={() => setDetails(!details)}
                style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.2)",
                  cursor: "pointer", fontSize: "0.75rem", fontFamily: "monospace",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <span style={{ color: errType.color }}>▶</span>
                {details ? "Hide" : "Show"} error details
              </button>
              {details && (
                <div style={{
                  marginTop: 12, padding: "12px 16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 8, textAlign: "left",
                  color: "rgba(255,255,255,0.35)",
                }}>
                  <div>Digest: <span style={{ color: errType.color }}>{error.digest}</span></div>
                  {error.message && <div style={{ marginTop: 4 }}>Message: {error.message}</div>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
