"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const LINKS = [
  {
    label: "Services",
    href: "/services",
    dropdown: [
      { label: "Brand Strategy",      href: "/services/brand-strategy",    desc: "Positioning & identity" },
      { label: "Creative Studio",     href: "/services/creative-studio",   desc: "Design that converts" },
      { label: "Media Distribution",  href: "/services/media-distribution",desc: "Reach your audience" },
      { label: "Conversion & CRO",    href: "/services/conversion-cro",    desc: "Turn traffic into revenue" },
      { label: "AI & MarTech",        href: "/services/ai-martech",        desc: "Automate & scale" },
    ],
  },
  { label: "Work",     href: "/work" },
  { label: "Insights", href: "/insights" },
  { label: "About",    href: "/about" },
  { label: "Contact",  href: "/contact" },
];

/* ── BrandThink Logo Image ──────────────────────────────────────────── */
function BrandMark({ size = 44 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="BrandThink"
      width={size * 2.8}
      height={size}
      style={{ objectFit: "contain", flexShrink: 0 }}
      priority
    />
  );
}

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDD,   setActiveDD]   = useState<string | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const openDD  = (label: string) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setActiveDD(label);
  };
  const closeDD = () => {
    leaveTimer.current = setTimeout(() => setActiveDD(null), 150);
  };

  return (
    <>
      <nav
        className={`nav ${scrolled || mobileOpen ? "scrolled" : ""}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="nav-inner">
          {/* Logo */}
          <Link
            href="/"
            style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}
            aria-label="BrandThink Home"
          >
            <BrandMark />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {LINKS.map((link) =>
              link.dropdown ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => openDD(link.label)}
                  onMouseLeave={closeDD}
                >
                  <button
                    className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    style={{ color: "var(--bt-muted)", background: "transparent", border: "none", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--bt-white)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--bt-muted)")}
                    aria-expanded={activeDD === link.label}
                  >
                    {link.label}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ transition: "transform 0.2s", transform: activeDD === link.label ? "rotate(180deg)" : "rotate(0)" }}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>

                  {/* Hover bridge */}
                  <div style={{ position: "absolute", top: "100%", left: 0, width: "100%", height: 12 }} />

                  {/* Dropdown */}
                  <div
                    style={{
                      position: "absolute", top: "calc(100% + 12px)", left: "50%",
                      transform: `translateX(-50%) translateY(${activeDD === link.label ? 0 : -8}px)`,
                      opacity: activeDD === link.label ? 1 : 0,
                      pointerEvents: activeDD === link.label ? "auto" : "none",
                      transition: "opacity 0.2s, transform 0.2s var(--ease-out)",
                      background: "var(--bt-surface)", border: "1px solid var(--bt-border)",
                      borderRadius: 12, padding: 8, minWidth: 240,
                      boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
                    }}
                    onMouseEnter={() => openDD(link.label)}
                    onMouseLeave={closeDD}
                  >
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        style={{ display: "flex", flexDirection: "column", gap: 2, padding: "10px 12px", borderRadius: 8, textDecoration: "none", color: "var(--bt-white)", transition: "background 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{item.label}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--bt-muted)" }}>{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{ padding: "8px 16px", borderRadius: 99, fontSize: "0.875rem", fontWeight: 500, color: "var(--bt-muted)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--bt-white)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--bt-muted)")}
                >
                  {link.label}
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
            {[0,1,2].map((n) => (
              <span key={n} style={{
                display: "block", width: 24, height: 1.5, background: "var(--bt-white)",
                transition: "transform 0.3s, opacity 0.3s",
                transform: n === 0 && mobileOpen ? "translateY(5px) rotate(45deg)"
                         : n === 2 && mobileOpen ? "translateY(-5px) rotate(-45deg)"
                         : "none",
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
              {link.dropdown ? (
                <>
                  <button
                    onClick={() => setActiveDD(activeDD === link.label ? null : link.label)}
                    className="mobile-menu-item"
                    style={{
                      width: "100%", background: "none", border: "none",
                      borderBottom: "1px solid var(--bt-border)",
                      cursor: "pointer", textAlign: "left",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      fontSize: "1.75rem", fontWeight: 800,
                      color: "var(--bt-white)", padding: "16px 0",
                      letterSpacing: "-0.03em",
                      transition: "color 0.2s",
                    }}
                  >
                    {link.label}
                    <svg
                      width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5"
                      style={{
                        transition: "transform 0.3s",
                        transform: activeDD === link.label ? "rotate(180deg)" : "rotate(0)",
                        flexShrink: 0,
                      }}
                    >
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  <div style={{
                    maxHeight: activeDD === link.label ? "400px" : "0",
                    overflow: "hidden",
                    transition: "max-height 0.35s var(--ease-out)",
                  }}>
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="mobile-sub-item"
                        style={{ display: "flex", alignItems: "center", gap: 8 }}
                      >
                        <span
                          style={{
                            display: "inline-block", width: 4, height: 4,
                            borderRadius: "50%", background: "var(--bt-red)", flexShrink: 0,
                          }}
                        />
                        <span>{item.label}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--bt-muted)", marginLeft: "auto" }}>{item.desc}</span>
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
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--bt-red)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--bt-white)")}
                >
                  {link.label}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
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
              { label: "Email", href: "mailto:adityaraj@thebrandthink.com", icon: "✉" },
              { label: "Phone", href: "tel:+919571361543", icon: "📞" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: "0.8125rem", color: "var(--bt-muted)", textDecoration: "none",
                  transition: "color 0.2s",
                }}
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
