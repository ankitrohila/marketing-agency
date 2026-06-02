"use client";
import { useEffect, useState } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    setGlitch(true);
    const t = setTimeout(() => setGlitch(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <style>{`
          * { box-sizing: border-box; }
          @keyframes gg1 {
            0%  { clip-path:inset(10% 0 70% 0); transform:translate(-7px,0); }
            50% { clip-path:inset(70% 0 10% 0); transform:translate( 7px,0); }
            100%{ clip-path:inset(10% 0 70% 0); transform:translate(-7px,0); }
          }
          @keyframes gg2 {
            0%  { clip-path:inset(70% 0 10% 0); transform:translate( 7px,0); }
            50% { clip-path:inset(10% 0 70% 0); transform:translate(-7px,0); }
            100%{ clip-path:inset(70% 0 10% 0); transform:translate( 7px,0); }
          }
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
          @keyframes grid-p { 0%,100%{opacity:0.03} 50%{opacity:0.08} }
          .ge-code { position:relative; user-select:none; }
          .ge-g1 { position:absolute; inset:0; color:#E8312A; animation:gg1 .1s steps(1) infinite; opacity:0; }
          .ge-g2 { position:absolute; inset:0; color:#38BDF8; animation:gg2 .1s steps(1) infinite; opacity:0; }
          .glitch-on .ge-g1, .glitch-on .ge-g2 { opacity:1; }
          .ge-btn { transition:all 0.2s; }
          .ge-btn:hover { transform:translateY(-2px); opacity:0.9; }
        `}</style>

        <div style={{
          minHeight: "100vh",
          background: "#080808",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "60px 24px", position: "relative", overflow: "hidden",
          fontFamily: "Inter, system-ui, sans-serif",
        }}>

          {/* Grid */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "56px 56px", animation: "grid-p 5s ease-in-out infinite",
          }} />

          {/* Content */}
          <div style={{
            position: "relative", zIndex: 1,
            display: "flex", flexDirection: "column",
            alignItems: "center", textAlign: "center", maxWidth: 600,
          }}>

            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 16px", borderRadius: 99, marginBottom: 40,
              background: "rgba(232,49,42,0.1)", border: "1px solid rgba(232,49,42,0.25)",
              fontSize: "0.6875rem", fontWeight: 700, color: "#E8312A",
              letterSpacing: "0.12em", textTransform: "uppercase",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#E8312A", boxShadow: "0 0 8px #E8312A", animation: "blink 1.5s step-end infinite" }} />
              Critical Error
            </div>

            {/* Glitch code */}
            <div
              className={`ge-code ${glitch ? "glitch-on" : ""}`}
              style={{
                fontSize: "clamp(5rem, 16vw, 12rem)",
                fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 1,
                color: "#F5F5F5", marginBottom: 24,
              }}
            >
              <span aria-hidden className="ge-g1">500</span>
              <span aria-hidden className="ge-g2">500</span>
              500
            </div>

            <h1 style={{
              fontSize: "clamp(1.25rem, 3vw, 1.75rem)", fontWeight: 800,
              color: "#F5F5F5", letterSpacing: "-0.03em", marginBottom: 16,
            }}>
              Something critically failed.
            </h1>

            <p style={{
              fontSize: "0.9375rem", color: "rgba(255,255,255,0.38)",
              lineHeight: 1.7, maxWidth: 400, marginBottom: 48,
            }}>
              An unrecoverable error occurred in the application root. Our team has been notified.
              {error?.digest && (
                <span style={{ display: "block", fontFamily: "monospace", fontSize: "0.75rem", marginTop: 12, color: "rgba(232,49,42,0.6)" }}>
                  Error ID: {error.digest}
                </span>
              )}
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <button
                className="ge-btn"
                onClick={reset}
                style={{
                  padding: "12px 28px", borderRadius: 99,
                  background: "#E8312A", border: "none",
                  color: "#fff", fontSize: "0.875rem", fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Reload Page
              </button>
              <button
                className="ge-btn"
                onClick={() => { window.location.href = "/"; }}
                style={{
                  padding: "12px 28px", borderRadius: 99,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#F5F5F5", fontSize: "0.875rem", fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
