"use client";
import { useState } from "react";

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

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 9,
  background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)",
  color: "#F5F5F5", fontSize: "0.875rem",
  outline: "none", fontFamily: "inherit",
  transition: "border-color 0.2s",
};

/* ── Mini Calendar ── */
function MiniCalendar({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (d: string) => void;
}) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay  = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthName = new Date(viewYear, viewMonth).toLocaleString("en-US", { month: "long" });

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
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t || d.getDay() === 0 || d.getDay() === 6; // no past, no weekends
  }

  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  const accentRed = "#E8312A";

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={prevMonth} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: "4px 8px", borderRadius: 6, fontSize: "1rem" }}>‹</button>
        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F5F5F5" }}>
          {monthName} {viewYear}
        </span>
        <button onClick={nextMonth} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: "4px 8px", borderRadius: 6, fontSize: "1rem" }}>›</button>
      </div>

      {/* Day labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: "0.625rem", fontWeight: 700, color: "rgba(255,255,255,0.3)", padding: "4px 0" }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const ds       = dateStr(day);
          const disabled = isDisabled(day);
          const isSelected = ds === selected;
          return (
            <button
              key={i}
              onClick={() => !disabled && onSelect(ds)}
              disabled={disabled}
              style={{
                padding: "6px 0",
                borderRadius: 7,
                border: "none",
                background: isSelected ? accentRed : "transparent",
                color: disabled ? "rgba(255,255,255,0.15)" : isSelected ? "#fff" : "rgba(255,255,255,0.8)",
                cursor: disabled ? "not-allowed" : "pointer",
                fontSize: "0.8125rem",
                fontWeight: isSelected ? 700 : 400,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!disabled && !isSelected) (e.currentTarget as HTMLElement).style.background = "rgba(232,49,42,0.15)";
              }}
              onMouseLeave={(e) => {
                if (!disabled && !isSelected) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const [booking, setBooking] = useState<{zoomLink?: string} | null>(null);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "",
    service: SERVICES[5], date: "", time: "",
    notes: "",
  });

  function update(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function fmtDate(iso: string) {
    if (!iso) return "";
    return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  async function handleSubmit() {
    setState("loading");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setBooking(data);
        setState("success");
        setStep(3);
      } else {
        setState("idle");
      }
    } catch {
      setState("idle");
    }
  }

  if (!isOpen) return null;

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
      <div style={{
        background: "var(--bt-black)", border: "1px solid var(--bt-border)",
        borderRadius: 24, padding: "36px 36px",
        width: "100%", maxWidth: 620,
        position: "relative",
        boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
        maxHeight: "90vh", overflowY: "auto",
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
          }}
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
              padding: "20px 24px",
              background: "rgba(52,211,153,0.06)",
              border: "1px solid rgba(52,211,153,0.2)",
              borderRadius: 16, marginBottom: 24, textAlign: "left",
            }}>
              {[
                ["📅 Date", fmtDate(form.date)],
                ["⏰ Time", form.time + " IST"],
                ["🎯 Service", form.service],
              ].map(([label, value]) => (
                <div key={label as string} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", minWidth: 100 }}>{label}</span>
                  <span style={{ fontSize: "0.875rem", color: "var(--bt-white)", fontWeight: 600 }}>{value}</span>
                </div>
              ))}
              {booking && (booking as {zoomLink?: string}).zoomLink && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#34D399", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    Zoom Meeting
                  </div>
                  <a href={(booking as {zoomLink: string}).zoomLink} style={{ color: "#34D399", fontSize: "0.875rem", wordBreak: "break-all" }}>
                    {(booking as {zoomLink: string}).zoomLink}
                  </a>
                </div>
              )}
            </div>

            <button onClick={onClose} className="btn btn-primary" style={{ fontSize: "0.9375rem" }}>
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Progress steps */}
            <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
              {[1, 2].map((s) => (
                <div key={s} style={{
                  height: 3, flex: 1, borderRadius: 99,
                  background: s < step ? "var(--bt-red)" : s === step ? "var(--bt-red)" : "rgba(255,255,255,0.1)",
                  opacity: s < step ? 0.6 : 1,
                  transition: "background 0.3s",
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
              /* ── Step 1: Personal info ── */
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                      Full Name *
                    </label>
                    <input
                      required value={form.name} onChange={(e) => update("name", e.target.value)}
                      placeholder="Your name"
                      style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(232,49,42,0.45)"; }}
                      onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                      Email *
                    </label>
                    <input
                      required type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                      placeholder="you@company.com"
                      style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(232,49,42,0.45)"; }}
                      onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                      Phone
                    </label>
                    <input
                      type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                      placeholder="+91 9000000000"
                      style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(232,49,42,0.45)"; }}
                      onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                      Company
                    </label>
                    <input
                      value={form.company} onChange={(e) => update("company", e.target.value)}
                      placeholder="Your company"
                      style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(232,49,42,0.45)"; }}
                      onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    Session Type
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {SERVICES.map((svc) => (
                      <button
                        key={svc}
                        type="button"
                        onClick={() => update("service", svc)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 9,
                          border: `1px solid ${form.service === svc ? "rgba(232,49,42,0.4)" : "rgba(255,255,255,0.08)"}`,
                          background: form.service === svc ? "rgba(232,49,42,0.1)" : "transparent",
                          color: form.service === svc ? "#E8312A" : "rgba(255,255,255,0.6)",
                          cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
                          textAlign: "left", transition: "all 0.15s",
                        }}
                      >
                        {svc}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    Anything specific to cover?
                  </label>
                  <textarea
                    value={form.notes} onChange={(e) => update("notes", e.target.value)}
                    placeholder="Share context, goals, or specific questions..."
                    rows={2}
                    style={{ ...inputStyle, resize: "vertical" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(232,49,42,0.45)"; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                  />
                </div>

                <button
                  onClick={() => { if (form.name && form.email) setStep(2); }}
                  disabled={!form.name || !form.email}
                  className="btn btn-primary"
                  style={{ justifyContent: "center", marginTop: 4, opacity: !form.name || !form.email ? 0.5 : 1 }}
                >
                  Choose Date & Time →
                </button>
              </div>
            ) : (
              /* ── Step 2: Calendar + Time ── */
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  {/* Calendar */}
                  <div style={{ padding: "20px", background: "#0d0d0d", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
                    <MiniCalendar selected={form.date} onSelect={(d) => update("date", d)} />
                  </div>

                  {/* Time slots */}
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                      Available Times (IST)
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, maxHeight: 280, overflowY: "auto" }}>
                      {TIMES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => update("time", t)}
                          style={{
                            padding: "9px 10px",
                            borderRadius: 8,
                            border: `1px solid ${form.time === t ? "rgba(232,49,42,0.4)" : "rgba(255,255,255,0.07)"}`,
                            background: form.time === t ? "rgba(232,49,42,0.12)" : "transparent",
                            color: form.time === t ? "#E8312A" : "rgba(255,255,255,0.65)",
                            cursor: "pointer", fontSize: "0.8125rem",
                            fontWeight: form.time === t ? 700 : 500,
                            transition: "all 0.15s",
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {form.date && form.time && (
                  <div style={{
                    marginTop: 20, padding: "14px 18px",
                    background: "rgba(232,49,42,0.06)",
                    border: "1px solid rgba(232,49,42,0.15)",
                    borderRadius: 10, fontSize: "0.8125rem",
                    color: "rgba(255,255,255,0.8)",
                  }}>
                    📅 <strong>{fmtDate(form.date)}</strong> at <strong>{form.time} IST</strong> — {form.service}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button
                    onClick={() => setStep(1)}
                    style={{
                      padding: "11px 20px", borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "transparent", color: "rgba(255,255,255,0.5)",
                      cursor: "pointer", fontSize: "0.875rem",
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
