"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────── */
/*  DATA                                            */
/* ─────────────────────────────────────────────── */
const SERVICES = [
  {
    label: "Brand Strategy",
    href: "/services/brand-strategy",
    desc: "Positioning, identity & messaging",
    icon: "🎯",
    color: "#8B5CF6",
    stat: "240+ brands positioned",
  },
  {
    label: "Creative Studio",
    href: "/services/creative-studio",
    desc: "Design systems that convert",
    icon: "✏️",
    color: "#F472B6",
    stat: "50M+ creatives served",
  },
  {
    label: "Media Distribution",
    href: "/services/media-distribution",
    desc: "Reach the right audience at scale",
    icon: "📡",
    color: "#38BDF8",
    stat: "₹80Cr+ media managed",
  },
  {
    label: "Conversion & CRO",
    href: "/services/conversion-cro",
    desc: "Turn traffic into revenue",
    icon: "📈",
    color: "#FB923C",
    stat: "3.4× avg. conversion lift",
  },
  {
    label: "AI & MarTech",
    href: "/services/ai-martech",
    desc: "Automate, personalise & scale",
    icon: "🤖",
    color: "#34D399",
    stat: "40% CAC reduction avg.",
  },
];

const LINKS: Array<{
  label: string;
  href: string;
  megaMenu?: boolean;
}> = [
  { label: "Services", href: "/services", megaMenu: true },
  { label: "Work",     href: "/work"     },
  { label: "Blog",     href: "/blog"     },
  { label: "Insights", href: "/insights" },
  { label: "About",    href: "/about"    },
  { label: "Contact",  href: "/contact"  },
];

/* ─────────────────────────────────────────────── */
/*  LABEL                                          */
/* ─────────────────────────────────────────────── */
function FlipLabel({ label }: { label: string }) {
  return <span>{label}</span>;
}

/* ─────────────────────────────────────────────── */
/*  MEGA MENU for Services                         */
/* ─────────────────────────────────────────────── */
function MegaMenu({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <div
      onMouseLeave={onClose}
      style={{
        position: "absolute",
        top: "calc(100% + 16px)",
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? 0 : -12}px)`,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.22s, transform 0.22s var(--ease-out)",
        background: "var(--bt-surface)",
        border: "1px solid var(--bt-border)",
        borderRadius: 20,
        padding: 0,
        minWidth: 680,
        boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
        overflow: "hidden",
        zIndex: 1001,
      }}
    >
      {/* Top strip */}
      <div style={{
        padding: "20px 28px",
        borderBottom: "1px solid var(--bt-border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(255,255,255,0.02)",
      }}>
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--bt-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Our Services
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--bt-white)", marginTop: 2 }}>
            360° marketing &amp; growth infrastructure
          </div>
        </div>
        <Link
          href="/services"
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "#E8312A",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          All Services →
        </Link>
      </div>

      {/* Service grid */}
      <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {SERVICES.map((svc) => (
          <Link
            key={svc.label}
            href={svc.href}
            onClick={onClose}
            style={{
              display: "flex",
              gap: 14,
              padding: "14px 16px",
              borderRadius: 12,
              textDecoration: "none",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            {/* Icon */}
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `${svc.color}18`,
              border: `1px solid ${svc.color}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem",
              flexShrink: 0,
            }}>
              {svc.icon}
            </div>
            {/* Text */}
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--bt-white)", marginBottom: 2 }}>
                {svc.label}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--bt-muted)", lineHeight: 1.4 }}>
                {svc.desc}
              </div>
              <div style={{ marginTop: 5, fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: svc.color }}>
                {svc.stat}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA strip */}
      <div style={{
        padding: "16px 28px",
        borderTop: "1px solid var(--bt-border)",
        background: "rgba(232,49,42,0.04)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontSize: "0.8125rem", color: "var(--bt-muted)" }}>
          Not sure where to start?
        </span>
        <Link
          href="/contact"
          onClick={onClose}
          style={{
            padding: "8px 18px",
            borderRadius: 99,
            background: "linear-gradient(135deg,#E8312A,#FF8C19)",
            color: "#fff",
            fontSize: "0.8125rem",
            fontWeight: 700,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          Book a Free Strategy Call →
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── */
/*  LOGO                                           */
/* ─────────────────────────────────────────────── */
function BrandMark({ size = 44 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="BrandThink"
      width={size}
      height={size}
      style={{ objectFit: "contain", flexShrink: 0, borderRadius: 8 }}
      priority
    />
  );
}

/* ─────────────────────────────────────────────── */
/*  NAVBAR                                         */
/* ─────────────────────────────────────────────── */
export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen,   setMegaOpen]   = useState(false);
  const [mobileDD,   setMobileDD]   = useState<string | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const openMega  = () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); setMegaOpen(true); };
  const closeMega = () => { leaveTimer.current = setTimeout(() => setMegaOpen(false), 150); };

  return (
    <>
      <nav
        className={`nav ${scrolled || mobileOpen ? "scrolled" : ""}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="nav-inner">
          {/* Logo */}
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }} aria-label="BrandThink Home">
            <BrandMark />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {LINKS.map((link) =>
              link.megaMenu ? (
                /* Services — Mega menu trigger */
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={openMega}
                  onMouseLeave={closeMega}
                >
                  <button
                    className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    style={{ color: megaOpen ? "var(--bt-white)" : "var(--bt-muted)", background: "transparent", border: "none", cursor: "pointer" }}
                    aria-expanded={megaOpen}
                  >
                    <FlipLabel label={link.label} />
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ transition: "transform 0.2s", transform: megaOpen ? "rotate(180deg)" : "rotate(0)" }}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  {/* Hover bridge */}
                  <div style={{ position: "absolute", top: "100%", left: 0, width: "100%", height: 16 }} />
                  <MegaMenu visible={megaOpen} onClose={() => setMegaOpen(false)} />
                </div>
              ) : (
                /* Regular links */
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 99,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "var(--bt-muted)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--bt-white)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--bt-muted)")}
                >
                  <FlipLabel label={link.label} />
                </Link>
              )
            )}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/contact" className="btn btn-primary" style={{ padding: "10px 22px", fontSize: "0.875rem" }}>
              Start a Project
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
          >
            {[0, 1, 2].map((n) => (
              <span key={n} style={{
                display: "block", width: 24, height: 1.5, background: "var(--bt-white)",
                transition: "transform 0.3s, opacity 0.3s",
                transform: n === 0 && mobileOpen ? "translateY(5px) rotate(45deg)" : n === 2 && mobileOpen ? "translateY(-5px) rotate(-45deg)" : "none",
                opacity: n === 1 && mobileOpen ? 0 : 1,
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        style={{
          position: "fixed", top: "var(--nav-h)", left: 0, right: 0, bottom: 0,
          background: "var(--bt-black)", zIndex: 999,
          display: "flex", flexDirection: "column",
          padding: "24px 24px 40px",
          transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s var(--ease-out)",
          overflowY: "auto",
          borderTop: "1px solid var(--bt-border)",
        }}
        aria-hidden={!mobileOpen}
      >
        <nav style={{ flex: 1 }}>
          {LINKS.map((link) => (
            <div key={link.label}>
              {link.megaMenu ? (
                <>
                  <button
                    onClick={() => setMobileDD(mobileDD === link.label ? null : link.label)}
                    className="mobile-menu-item"
                    style={{
                      width: "100%", background: "none", border: "none",
                      borderBottom: "1px solid var(--bt-border)",
                      cursor: "pointer", textAlign: "left",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      fontSize: "1.75rem", fontWeight: 800,
                      color: "var(--bt-white)", padding: "16px 0",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {link.label}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ transition: "transform 0.3s", transform: mobileDD === link.label ? "rotate(180deg)" : "rotate(0)", flexShrink: 0 }}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  <div style={{ maxHeight: mobileDD === link.label ? "600px" : "0", overflow: "hidden", transition: "max-height 0.35s var(--ease-out)" }}>
                    {SERVICES.map((svc) => (
                      <Link
                        key={svc.label}
                        href={svc.href}
                        onClick={() => setMobileOpen(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
                          textDecoration: "none",
                        }}
                      >
                        <span style={{
                          width: 36, height: 36, borderRadius: 9,
                          background: `${svc.color}18`, display: "flex",
                          alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0,
                        }}>{svc.icon}</span>
                        <div>
                          <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--bt-white)" }}>{svc.label}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--bt-muted)" }}>{svc.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    fontSize: "1.75rem", fontWeight: 800,
                    color: "var(--bt-white)", textDecoration: "none",
                    padding: "16px 0", letterSpacing: "-0.03em",
                    borderBottom: "1px solid var(--bt-border)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--bt-red)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--bt-white)")}
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div style={{ paddingTop: 32 }}>
          <Link
            href="/contact"
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", fontSize: "1rem" }}
            onClick={() => setMobileOpen(false)}
          >
            Start a Project
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <div style={{ marginTop: 24, display: "flex", gap: 16, justifyContent: "center" }}>
            {[
              { label: "Email", href: "mailto:rohilla77@gmail.com", icon: "✉" },
              { label: "Phone", href: "tel:+918950205038", icon: "📞" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "var(--bt-muted)", textDecoration: "none" }}
              >
                {item.icon} {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
