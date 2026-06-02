"use client";
import { useState } from "react";
import { buildGoogleCalUrl } from "@/lib/googleCal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SERVICES = [
  "Brand Strategy Session",
  "Creative Studio Kickoff",
  "Performance Marketing Audit",
  "Conversion & CRO Review",
  "AI & MarTech Consultation",
  "Free 30-min Strategy Call",
];

const TIMES = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM", "5:00 PM",
];

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
  if (!v.trim()) return ""; // optional field — blank is OK
  const stripped = v.replace(/[\s\-\(\)]/g, "");
  if (!/^\+?[0-9]{7,15}$/.test(stripped)) return "Enter a valid phone number";
  const digits = stripped.replace(/^\+91/, "").replace(/^0/, "");
  if (digits.length === 10 && !/^[6-9]/.test(digits)) return "Indian mobile numbers start with 6–9";
  return "";
}

/* ── Input style factory — theme-aware via CSS vars ── */
function getInputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: "100%", padding: "11px 14px", borderRadius: 9,
    background: "var(--bt-card)",
    border: `1px solid ${hasError ? "rgba(232,49,42,0.7)" : "var(--bt-border)"}`,
    color: "var(--bt-white)", fontSize: "0.875rem",
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
      marginTop: 4, fontWeight: 500,
    }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {msg}
    </span>
  );
}

/* ── Mini Calendar — theme-aware ── */
function MiniCalendar({ selected, onSelect }: { selected: string; onSelect: (d: string) => void }) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthName   = new Date(viewYear, viewMonth).toLocaleString("en-US", { month: "long" });

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }
  function dateStr(day: number) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  function isDisabled(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return d < t || d.getDay() === 0 || d.getDay() === 6;
  }

  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button
          onClick={prevMonth}
          style={{ background: "none", border: "none", color: "var(--bt-muted)", cursor: "pointer", padding: "4px 8px", borderRadius: 6, fontSize: "1rem" }}
        >‹</button>
        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--bt-white)" }}>
          {monthName} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          style={{ background: "none", border: "none", color: "var(--bt-muted)", cursor: "pointer", padding: "4px 8px", borderRadius: 6, fontSize: "1rem" }}
        >›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: "0.625rem", fontWeight: 700, color: "var(--bt-muted)", padding: "4px 0", opacity: 0.7 }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const ds = dateStr(day);
          const disabled = isDisabled(day);
          const isSelected = ds === selected;
          return (
            <button
              key={i}
              onClick={() => !disabled && onSelect(ds)}
              disabled={disabled}
              style={{
                padding: "6px 0", borderRadius: 7, border: "none",
                background: isSelected ? "#E8312A" : "transparent",
                color: isSelected ? "#fff" : "var(--bt-white)",
                opacity: disabled ? 0.25 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
                fontSize: "0.8125rem", fontWeight: isSelected ? 700 : 400,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (!disabled && !isSelected) (e.currentTarget as HTMLElement).style.background = "rgba(232,49,42,0.15)"; }}
              onMouseLeave={(e) => { if (!disabled && !isSelected) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Booking Modal ── */
export default function BookingModal({ isOpen, onClose }: Props) {
  const [step,    setStep]    = useState<1 | 2 | 3>(1);
  const [state,   setState]   = useState<"idle" | "loading" | "success">("idle");
  const [booking, setBooking] = useState<{ zoomLink?: string } | null>(null);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "",
    service: SERVICES[5], date: "", time: "", notes: "",
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

  function handlePhoneInput(v: string) {
    const cleaned = v.replace(/[^0-9\+\-\(\)\s]/g, "");
    update("phone", cleaned);
  }

  function validateStep1(): boolean {
    const nameErr  = validateName(form.name);
    const emailErr = validateEmail(form.email);
    const phoneErr = validatePhone(form.phone);
    setErrors({ name: nameErr, email: emailErr, phone: phoneErr });
    setTouched({ name: true, email: true, phone: true });
    return !nameErr && !emailErr && !phoneErr;
  }

  function fmtDate(iso: string) {
    if (!iso) return "";
    return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  async function handleSubmit() {
    setState("loading");
    try {
      const res  = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) { setBooking(data); setState("success"); setStep(3); }
      else setState("idle");
    } catch {
      setState("idle");
    }
  }

  if (!isOpen) return null;

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.6875rem", fontWeight: 700,
    color: "var(--bt-muted)", textTransform: "uppercase",
    letterSpacing: "0.08em", marginBottom: 6,
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px", backdropFilter: "blur(4px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Placeholder colour — scoped to this modal */}
      <style>{`
        .bm-input::placeholder { color: var(--bt-muted); opacity: 0.65; }
        .bm-input::-webkit-input-placeholder { color: var(--bt-muted); opacity: 0.65; }
        .bm-input:-ms-input-placeholder { color: var(--bt-muted); }
      `}</style>

      <div style={{
        background: "var(--bt-black)", border: "1px solid var(--bt-border)",
        borderRadius: 24, padding: "36px 36px",
        width: "100%", maxWidth: 620, position: "relative",
        boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "rgba(128,128,128,0.12)", border: "1px solid var(--bt-border)",
            color: "var(--bt-muted)", borderRadius: 99,
            width: 32, height: 32, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(232,49,42,0.12)"; (e.currentTarget as HTMLElement).style.color = "#E8312A"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(128,128,128,0.12)"; (e.currentTarget as HTMLElement).style.color = "var(--bt-muted)"; }}
        >✕</button>

        {step === 3 && state === "success" ? (
          /* ── Confirmation ── */
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(52,211,153,0.12)",
              border: "2px solid rgba(52,211,153,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem", margin: "0 auto 20px",
            }}>📅</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--bt-white)", letterSpacing: "-0.03em", marginBottom: 10 }}>
              Booking Confirmed!
            </h2>
            <p style={{ color: "var(--bt-muted)", lineHeight: 1.7, marginBottom: 24 }}>
              A confirmation email has been sent to <strong style={{ color: "var(--bt-white)" }}>{form.email}</strong> with all the details.
            </p>
            <div style={{
              padding: "20px 24px", background: "rgba(52,211,153,0.06)",
              border: "1px solid rgba(52,211,153,0.2)",
              borderRadius: 16, marginBottom: 24, textAlign: "left",
            }}>
              {[
                ["📅 Date", fmtDate(form.date)],
                ["⏰ Time", form.time + " IST"],
                ["🎯 Service", form.service],
              ].map(([label, value]) => (
                <div key={label as string} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: "0.875rem", color: "var(--bt-muted)", minWidth: 100 }}>{label}</span>
                  <span style={{ fontSize: "0.875rem", color: "var(--bt-white)", fontWeight: 600 }}>{value}</span>
                </div>
              ))}
              {booking?.zoomLink && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--bt-border)" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#34D399", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    Zoom Meeting
                  </div>
                  <a href={booking.zoomLink} style={{ color: "#34D399", fontSize: "0.875rem", wordBreak: "break-all" }}>
                    {booking.zoomLink}
                  </a>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href={buildGoogleCalUrl({
                  name: form.name,
                  email: form.email,
                  date: form.date,
                  time: form.time,
                  service: form.service,
                  zoomLink: booking?.zoomLink,
                })}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "11px 22px", borderRadius: 10,
                  background: "#4285F4", color: "#fff",
                  fontSize: "0.875rem", fontWeight: 700,
                  textDecoration: "none", letterSpacing: "0.01em",
                }}
              >
                📅 Add to Google Calendar
              </a>
              <button onClick={onClose} className="btn btn-primary" style={{ fontSize: "0.9375rem" }}>Done</button>
            </div>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
              {[1, 2].map((s) => (
                <div key={s} style={{
                  height: 3, flex: 1, borderRadius: 99,
                  background: s <= step ? "var(--bt-red)" : "var(--bt-border)",
                  opacity: s < step ? 0.6 : 1, transition: "background 0.3s",
                }} />
              ))}
            </div>

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--bt-white)", letterSpacing: "-0.03em", marginBottom: 4 }}>
                {step === 1 ? "Book a Strategy Session" : "Choose Your Date & Time"}
              </h2>
              <p style={{ color: "var(--bt-muted)", fontSize: "0.875rem" }}>
                {step === 1 ? "Tell us how to reach you" : "Pick a time that works for you"}
              </p>
            </div>

            {step === 1 ? (
              /* ── Step 1 ── */
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

                  {/* Full Name */}
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input
                      className="bm-input"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      placeholder="Your name"
                      style={getInputStyle(touched.name && !!errors.name)}
                      onFocus={(e) => { e.currentTarget.style.borderColor = errors.name && touched.name ? "rgba(232,49,42,0.7)" : "rgba(232,49,42,0.45)"; }}
                    />
                    {touched.name && <FieldError msg={errors.name} />}
                  </div>

                  {/* Email */}
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input
                      className="bm-input"
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      placeholder="you@company.com"
                      style={getInputStyle(touched.email && !!errors.email)}
                      onFocus={(e) => { e.currentTarget.style.borderColor = errors.email && touched.email ? "rgba(232,49,42,0.7)" : "rgba(232,49,42,0.45)"; }}
                    />
                    {touched.email && <FieldError msg={errors.email} />}
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input
                      className="bm-input"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handlePhoneInput(e.target.value)}
                      onBlur={() => handleBlur("phone")}
                      placeholder="+91 98765 43210"
                      maxLength={16}
                      style={getInputStyle(touched.phone && !!errors.phone)}
                      onFocus={(e) => { e.currentTarget.style.borderColor = errors.phone && touched.phone ? "rgba(232,49,42,0.7)" : "rgba(232,49,42,0.45)"; }}
                    />
                    {touched.phone && <FieldError msg={errors.phone} />}
                  </div>

                  {/* Company */}
                  <div>
                    <label style={labelStyle}>Company</label>
                    <input
                      className="bm-input"
                      value={form.company}
                      onChange={(e) => update("company", e.target.value)}
                      placeholder="Your company"
                      style={getInputStyle(false)}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(232,49,42,0.45)"; }}
                      onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--bt-border)"; }}
                    />
                  </div>
                </div>

                {/* Session type */}
                <div>
                  <label style={labelStyle}>Session Type</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {SERVICES.map((svc) => (
                      <button
                        key={svc}
                        type="button"
                        onClick={() => update("service", svc)}
                        style={{
                          padding: "10px 14px", borderRadius: 9,
                          border: `1px solid ${form.service === svc ? "rgba(232,49,42,0.4)" : "var(--bt-border)"}`,
                          background: form.service === svc ? "rgba(232,49,42,0.1)" : "transparent",
                          color: form.service === svc ? "#E8312A" : "var(--bt-muted)",
                          cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
                          textAlign: "left", transition: "all 0.15s",
                        }}
                      >
                        {svc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label style={labelStyle}>Anything specific to cover?</label>
                  <textarea
                    className="bm-input"
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Share context, goals, or specific questions..."
                    rows={2}
                    style={{ ...getInputStyle(false), resize: "vertical" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(232,49,42,0.45)"; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--bt-border)"; }}
                  />
                </div>

                <button
                  onClick={() => { if (validateStep1()) setStep(2); }}
                  className="btn btn-primary"
                  style={{ justifyContent: "center", marginTop: 4 }}
                >
                  Choose Date &amp; Time →
                </button>
              </div>
            ) : (
              /* ── Step 2 ── */
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <div style={{ padding: "20px", background: "var(--bt-black)", borderRadius: 14, border: "1px solid var(--bt-border)" }}>
                    <MiniCalendar selected={form.date} onSelect={(d) => update("date", d)} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--bt-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                      Available Times (IST)
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, maxHeight: 280, overflowY: "auto" }}>
                      {TIMES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => update("time", t)}
                          style={{
                            padding: "9px 10px", borderRadius: 8,
                            border: `1px solid ${form.time === t ? "rgba(232,49,42,0.4)" : "var(--bt-border)"}`,
                            background: form.time === t ? "rgba(232,49,42,0.12)" : "transparent",
                            color: form.time === t ? "#E8312A" : "var(--bt-muted)",
                            cursor: "pointer", fontSize: "0.8125rem",
                            fontWeight: form.time === t ? 700 : 500, transition: "all 0.15s",
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {form.date && form.time && (
                  <div style={{
                    marginTop: 20, padding: "14px 18px",
                    background: "rgba(232,49,42,0.06)",
                    border: "1px solid rgba(232,49,42,0.15)",
                    borderRadius: 10, fontSize: "0.8125rem", color: "var(--bt-white)",
                  }}>
                    📅 <strong>{fmtDate(form.date)}</strong> at <strong>{form.time} IST</strong> — {form.service}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button
                    onClick={() => setStep(1)}
                    style={{
                      padding: "11px 20px", borderRadius: 10,
                      border: "1px solid var(--bt-border)",
                      background: "transparent", color: "var(--bt-muted)",
                      cursor: "pointer", fontSize: "0.875rem",
                      transition: "all 0.15s",
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!form.date || !form.time || state === "loading"}
                    className="btn btn-primary"
                    style={{
                      flex: 1, justifyContent: "center",
                      opacity: !form.date || !form.time || state === "loading" ? 0.5 : 1,
                    }}
                  >
                    {state === "loading" ? "Confirming…" : "Confirm Booking"}
                    {state !== "loading" && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
