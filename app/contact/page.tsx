"use client";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Footer from "@/components/sections/Footer";
import BookingModal from "@/components/BookingModal";

gsap.registerPlugin(useGSAP);

const FAQ = [
  { q: "How quickly can you get started?",       a: "We typically onboard within 1 week of signing. Strategy work starts in Week 1 for most engagements." },
  { q: "What's your minimum engagement size?",   a: "We work with brands at ₹3L/month minimum retainer. Project-based work starts at ₹5L." },
  { q: "Do you work with early-stage startups?", a: "Yes — we have a dedicated startup program with flexible structures for pre-revenue and Series A brands." },
  { q: "How do you measure success?",            a: "Every engagement has clear KPIs agreed upfront — ROAS, CAC, revenue, impressions — with monthly reporting." },
];

/* Shared input style */
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "14px 16px", borderRadius: 10, fontSize: "0.9375rem",
  background: "var(--bt-card)", border: "1px solid var(--bt-border)",
  color: "var(--bt-white)", outline: "none", transition: "border-color 0.2s",
  fontFamily: "inherit",
};

export default function ContactPage() {
  const heroRef = useRef<HTMLElement>(null);
  const [open,        setOpen]        = useState<number | null>(null);
  const [sending,     setSending]     = useState(false);
  const [sent,        setSent]        = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  useGSAP(() => {
    gsap.from(".contact-word", { y: "100%", stagger: 0.06, duration: 0.9, ease: "power4.out" });
    gsap.from(".contact-sub",  { opacity: 0, y: 20, stagger: 0.1, duration: 0.7, delay: 0.5 });
  }, { scope: heroRef });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) { setSent(true); form.reset(); }
    } catch {
      /* silent fail */
    } finally {
      setSending(false);
    }
  };

  const focusStyle  = { borderColor: "rgba(232,49,42,0.45)" };
  const blurStyle   = { borderColor: "var(--bt-border)"    };

  return (
    <>
      {/* Hero */}
      <section ref={heroRef} className="page-hero">
        <div className="bg-grid" style={{ position: "absolute", inset: 0, opacity: 0.3, maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent 90%)" }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="contact-sub" style={{ marginBottom: 24 }}><span className="chip">Get In Touch</span></div>
          <h1 style={{ overflow: "hidden" }}>
            {["Let's build", "something", "remarkable."].map((w, i) => (
              <div key={i} style={{ overflow: "hidden" }}>
                <span className="contact-word" style={{ display: "block", fontSize: "clamp(2rem, 7vw, 6rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.0, color: i === 2 ? "var(--bt-lime)" : "var(--bt-white)" }}>
                  {w}
                </span>
              </div>
            ))}
          </h1>
        </div>
      </section>

      {/* Contact split */}
      <section className="section" style={{ background: "var(--bt-black)" }}>
        <div className="container">
          <div className="r-grid-2">

            {/* Info panel */}
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 32, color: "var(--bt-white)" }}>
                Start the conversation
              </h2>

              {[
                { icon: "✉",  label: "Email",  value: "rohilla77@gmail.com",   href: "mailto:rohilla77@gmail.com" },
                { icon: "📞", label: "Phone",  value: "+91-8950205038",       href: "tel:+918950205038" },
                { icon: "📍", label: "Office", value: "Sonipat, Haryana",     href: "#" },
              ].map((item) => (
                <a key={item.label} href={item.href} style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 28, textDecoration: "none" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--bt-card)", border: "1px solid var(--bt-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--bt-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: "0.9375rem", color: "var(--bt-white)", fontWeight: 500 }}>{item.value}</div>
                  </div>
                </a>
              ))}

              <div style={{ marginTop: 48, padding: 28, borderRadius: 16, background: "var(--bt-surface)", border: "1px solid var(--bt-border)" }}>
                <div style={{ fontWeight: 700, color: "var(--bt-white)", marginBottom: 8 }}>Free Strategy Session</div>
                <p style={{ fontSize: "0.875rem", color: "var(--bt-muted)", lineHeight: 1.65, marginBottom: 16 }}>
                  Not sure where to start? Book a free 30-minute strategy call and we'll map out exactly what growth levers are available for your brand.
                </p>
                <button
                  onClick={() => setBookingOpen(true)}
                  className="btn btn-primary"
                  style={{ fontSize: "0.875rem", padding: "10px 20px" }}
                >
                  📅 Book Free Strategy Call
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <div>
              {sent ? (
                <div style={{ padding: 40, borderRadius: 20, background: "rgba(232,49,42,0.08)", border: "1px solid rgba(232,49,42,0.22)", textAlign: "center" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>✓</div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--bt-lime)", marginBottom: 12 }}>Message received!</h3>
                  <p style={{ color: "var(--bt-muted)" }}>We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {[
                    { name: "name",    label: "Your Name",      type: "text",  placeholder: "Ankit Rohilla"      },
                    { name: "email",   label: "Email Address",  type: "email", placeholder: "you@company.com"    },
                    { name: "company", label: "Company",        type: "text",  placeholder: "Your Company"       },
                    { name: "budget",  label: "Monthly Budget", type: "text",  placeholder: "e.g. ₹5L–10L/month" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--bt-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                        {field.label}
                      </label>
                      <input
                        name={field.name} type={field.type} placeholder={field.placeholder} required
                        style={inputStyle}
                        onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                        onBlur={(e)  => Object.assign(e.currentTarget.style, blurStyle)}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--bt-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                      Tell us about your project
                    </label>
                    <textarea
                      name="message" placeholder="Share your goals, challenges, and timeline..." rows={5} required
                      style={{ ...inputStyle, resize: "vertical" }}
                      onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={(e)  => Object.assign(e.currentTarget.style, blurStyle)}
                    />
                  </div>
                  <button type="submit" disabled={sending} className="btn btn-primary" style={{ justifyContent: "center", fontSize: "1rem", opacity: sending ? 0.7 : 1 }}>
                    {sending ? "Sending…" : "Send Message"}
                    {!sending && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ background: "var(--bt-surface)" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div style={{ marginBottom: 48 }}>
            <span className="chip" style={{ marginBottom: 16 }}>FAQ</span>
            <h2 className="heading-lg">Common<br /><span style={{ color: "var(--bt-lime)" }}>questions.</span></h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQ.map((item, i) => (
              <div key={i} style={{ borderRadius: 12, border: "1px solid var(--bt-border)", background: "var(--bt-card)", overflow: "hidden" }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{ width: "100%", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", color: "var(--bt-white)", fontWeight: 600, fontSize: "0.9375rem", textAlign: "left", gap: 12 }}
                >
                  <span>{item.q}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, transition: "transform 0.2s", transform: open === i ? "rotate(180deg)" : "none" }}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                {open === i && (
                  <div style={{ padding: "0 24px 20px", fontSize: "0.9375rem", color: "var(--bt-muted)", lineHeight: 1.7 }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
