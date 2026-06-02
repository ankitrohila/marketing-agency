"use client";
import Link from "next/link";
import Image from "next/image";

const LINKS = {
  Services: [
    { label: "Brand Strategy",     href: "/services#strategy"    },
    { label: "Creative Studio",    href: "/services#creative"    },
    { label: "Media Distribution", href: "/services#distribution"},
    { label: "Conversion & CRO",   href: "/services#conversion"  },
    { label: "AI & MarTech",       href: "/services#ai"          },
  ],
  Company: [
    { label: "About Us", href: "/about"          },
    { label: "Our Work", href: "/work"           },
    { label: "Careers",  href: "/about#careers"  },
    { label: "Contact",  href: "/contact"        },
  ],
  Legal: [
    { label: "Privacy Policy",   href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    label: "Instagram",
    href:  "https://instagram.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5"/>
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
  {
    label: "Twitter",
    href:  "https://twitter.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer style={{ background: "var(--bt-surface)", borderTop: "1px solid var(--bt-border)" }}>
      {/* Ghost wordmark */}
      <div className="container footer-wordmark" style={{ textAlign: "center", overflow: "hidden" }}>
        <div
          style={{
            fontSize: "clamp(3rem, 12vw, 10rem)",
            fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9,
            color: "transparent",
            WebkitTextStroke: "1px rgba(255,255,255,0.06)",
            userSelect: "none", marginBottom: -20,
          }}
          aria-hidden="true"
        >
          BrandThink
        </div>
      </div>

      {/* Links grid */}
      <div className="container footer-content">
        <div className="footer-grid">
          {/* Brand col */}
          <div>
            <Link href="/" style={{ display: "inline-block", textDecoration: "none", marginBottom: 20 }}>
              <Image
                src="/logo.png"
                alt="BrandThink"
                width={56}
                height={56}
                style={{ objectFit: "contain", borderRadius: 8 }}
              />
            </Link>
            <p style={{ fontSize: "0.9375rem", color: "var(--bt-muted)", lineHeight: 1.7, maxWidth: 280, marginBottom: 28 }}>
              We build growth infrastructure — demand generation, distribution systems, and conversion engines — that replace campaigns with compounding results.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{
                    width: 40, height: 40, borderRadius: "50%",
                    border: "1px solid var(--bt-border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--bt-muted)", textDecoration: "none",
                    transition: "color 0.2s, border-color 0.2s, background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color        = "#E8312A";
                    el.style.borderColor  = "rgba(232,49,42,0.4)";
                    el.style.background   = "rgba(232,49,42,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color        = "var(--bt-muted)";
                    el.style.borderColor  = "var(--bt-border)";
                    el.style.background   = "transparent";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links cols */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <h3 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--bt-white)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
                {group}
              </h3>
              <ul style={{ listStyle: "none" }}>
                {links.map((link) => (
                  <li key={link.label} style={{ marginBottom: 12 }}>
                    <Link href={link.href} className="footer-link">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p style={{ fontSize: "0.8125rem", color: "var(--bt-dim)" }}>
          © {new Date().getFullYear()} BrandThink. All rights reserved.
        </p>
        <p style={{ fontSize: "0.8125rem", color: "var(--bt-dim)" }}>
          Sonipat, Haryana · rohilla77@gmail.com
        </p>
      </div>
    </footer>
  );
}
