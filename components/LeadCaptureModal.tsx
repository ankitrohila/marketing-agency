"use client";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  source?: string;
}

/* ── Validators ── */
function validateName(v: string): string {
  if (!v.trim()) return "Full name is required";
  if (v.trim().length < 2) return "Name must be at least 2 characters";
  if (!/^[a-zA-Z\s'\-\.]+$/.test(v.trim())) return "Name should only contain letters";
  return "";
}

function validateEmail(v: string): string {
  if (!v.trim()) return "Email address is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return "Enter a valid email address";
  return "";
}

function validatePhone(v: string): string {
  if (!v.trim()) return ""; // optional
  const stripped = v.replace(/[\s\-\(\)]/g, "");
  if (!/^\+?[0-9]{7,15}$/.test(stripped)) return "Enter a valid phone number";
  const digits = stripped.replace(/^\+91/, "").replace(/^0/, "");
  if (digits.length === 10 && !/^[6-9]/.test(digits)) return "Indian mobile numbers start with 6–9";
  return "";
}

/* ── Input style factory ── */
function getInputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    background: "var(--bt-card)",
    border: `1px solid ${hasError ? "rgba(232,49,42,0.7)" : "var(--bt-border)"}`,
    color: "var(--bt-white)", fontSize: "0.9375rem",
    outline: "none", fontFamily: "inherit",
    transition: "border-color 0.2s",
  };
}

/* ── Error text ── */
function FieldError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <span style={{
      display: "flex", alignItems: "center", gap: 4,
      fontSize: "0.6875rem", color: "#FF6B5B",
      marginTop: 5, fontWeight: 500,
    }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {msg}
    </span>
  );
}

const SERVICES = [
  "Brand Strategy", "Creative Studio", "Media Distribution",
  "Conversion & CRO", "AI & MarTech", "Full Service Retainer", "Other",
];

const BUDGETS = [
  "Under ₹1L/month", "₹1L–3L/month", "₹3L–5L/month",
  "₹5L–10L/month", "₹10L+/month", "Project-based",
];

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.6875rem", fontWeight: 700,
  color: "var(--bt-muted)", textTransform: "uppercase",
  letterSpacing: "0.08em", marginBottom: 8,
};

export default function LeadCaptureModal({ isOpen, onClose, title, subtitle, source = "popup" }: Props) {
  const [step,  setStep]  = useState(1);
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const [form,  setForm]  = useState({
    name: "", email: "", company: "", phone: "",
    service: "", budget: "", message: "",
  });

  /* ── Validation state ── */
  const [errors,  setErrors]  = useState({ name: "", email: "", phone: "" });
  const [touched, setTouched] = useState({ name: false, email: false, phone: false });

  function update(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    if (k === "name")  setErrors((e) => ({ ...e, name:  validateName(v)  }));
    if (k === "email") setErrors((e) => ({ ...e, email: validateEmail(v) }));
    if (k === "phone") setErrors((e) => ({ ...e, phone: validatePhone(v) }));
  }

  function handleBlur(k: "name" | "email" | "phone") {
    setTouched((t) => ({ ...t, [k]: true }));
    if (k === "name")  setErrors((e) => ({ ...e, name:  validateName(form.name)   }));
    if (k === "email") setErrors((e) => ({ ...e, email: validateEmail(form.email) }));
    if (k === "phone") setErrors((e) => ({ ...e, phone: validatePhone(form.phone) }));
  }

  /* Only allow numeric input + formatting chars in phone */
  function handlePhoneInput(v: string) {
    update("phone", v.replace(/[^0-9\+\-\(\)\s]/g, ""));
  }

  function validateStep1(): boolean {
    const nameErr  = validateName(form.name);
    const emailErr = validateEmail(form.email);
    const phoneErr = validatePhone(form.phone);
    setErrors({ name: nameErr, email: emailErr, phone: phoneErr });
    setTouched({ name: true, email: true, phone: true });
    return !nameErr && !emailErr && !phoneErr;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) {
      if (validateStep1()) setStep(2);
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source }),
      });
      if (res.ok) setState("success");
    } catch { /* silent */ }
    setState("success");
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.8)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px", backdropFilter: "blur(4px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--bt-black)", border: "1px solid var(--bt-border)",
        borderRadius: 24, padding: "40px 40px",
        width: "100%", maxWidth: 520,
        position: "relative",
        boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "rgba(255,255,255,0.06)", border: "none",
            color: "rgba(255,255,255,0.5)", borderRadius: 99,
            width: 32, height: 32, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.1rem",
          }}
        >✕</button>

        {state === "success" ? (
          /* ── Success ── */
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(52,211,153,0.12)",
              border: "2px solid rgba(52,211,153,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.75rem", margin: "0 auto 24px",
            }}>✓</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--bt-white)", letterSpacing: "-0.03em", marginBottom: 12 }}>
              You&apos;re in the queue!
            </h2>
            <p style={{ color: "var(--bt-muted)", lineHeight: 1.7, marginBottom: 28 }}>
              We&apos;ve received your details and will reach out within 24 hours to schedule your strategy call.
            </p>
            <button onClick={onClose} className="btn btn-primary" style={{ fontSize: "0.9375rem" }}>
              Close
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
              {[1, 2].map((s) => (
                <div key={s} style={{
                  height: 3, flex: 1, borderRadius: 99,
                  background: s <= step ? "var(--bt-red)" : "rgba(255,255,255,0.1)",
                  transition: "background 0.3s",
                }} />
              ))}
            </div>

            <h2 style={{ fontSize: "1.375rem", fontWeight: 900, color: "var(--bt-white)", letterSpacing: "-0.03em", marginBottom: 6 }}>
              {title || "Let's grow your brand"}
            </h2>
            <p style={{ color: "var(--bt-muted)", fontSize: "0.9375rem", marginBottom: 28, lineHeight: 1.6 }}>
              {subtitle || (step === 1 ? "Tell us about yourself" : "Tell us about your project")}
            </p>

            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {step === 1 ? (
                <>
                  {/* Name */}
                  <div>
                    <label style={labelStyle}>Your Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      placeholder="Ankit Rohilla"
                      style={getInputStyle(touched.name && !!errors.name)}
                      onFocus={(e) => { e.currentTarget.style.borderColor = touched.name && errors.name ? "rgba(232,49,42,0.7)" : "rgba(232,49,42,0.45)"; }}
                    />
                    {touched.name && <FieldError msg={errors.name} />}
                  </div>

                  {/* Email */}
                  <div>
                    <label style={labelStyle}>Email Address *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      placeholder="you@company.com"
                      style={getInputStyle(touched.email && !!errors.email)}
                      onFocus={(e) => { e.currentTarget.style.borderColor = touched.email && errors.email ? "rgba(232,49,42,0.7)" : "rgba(232,49,42,0.45)"; }}
                    />
                    {touched.email && <FieldError msg={errors.email} />}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {/* Company */}
                    <div>
                      <label style={labelStyle}>Company</label>
                      <input
                        value={form.company}
                        onChange={(e) => update("company", e.target.value)}
                        placeholder="Your company"
                        style={getInputStyle(false)}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(232,49,42,0.45)"; }}
                        onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--bt-border)"; }}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label style={labelStyle}>Phone</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => handlePhoneInput(e.target.value)}
                        onBlur={() => handleBlur("phone")}
                        placeholder="+91 98765 43210"
                        maxLength={16}
                        style={getInputStyle(touched.phone && !!errors.phone)}
                        onFocus={(e) => { e.currentTarget.style.borderColor = touched.phone && errors.phone ? "rgba(232,49,42,0.7)" : "rgba(232,49,42,0.45)"; }}
                      />
                      {touched.phone && <FieldError msg={errors.phone} />}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Service */}
                  <div>
                    <label style={labelStyle}>Service Interested In</label>
                    <select
                      value={form.service}
                      onChange={(e) => update("service", e.target.value)}
                      style={{ ...getInputStyle(false), cursor: "pointer" }}
                    >
                      <option value="">Select a service…</option>
                      {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Budget */}
                  <div>
                    <label style={labelStyle}>Monthly Budget</label>
                    <select
                      value={form.budget}
                      onChange={(e) => update("budget", e.target.value)}
                      style={{ ...getInputStyle(false), cursor: "pointer" }}
                    >
                      <option value="">Select budget range…</option>
                      {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label style={labelStyle}>Tell us more</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      placeholder="Share your goals, current challenges, timeline..."
                      rows={3}
                      style={{ ...getInputStyle(false), resize: "vertical" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(232,49,42,0.45)"; }}
                      onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--bt-border)"; }}
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={state === "loading"}
                className="btn btn-primary"
                style={{ justifyContent: "center", fontSize: "1rem", marginTop: 4 }}
              >
                {state === "loading" ? "Submitting…" : step === 1 ? "Continue →" : "Send Request"}
                {state !== "loading" && step === 2 && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
