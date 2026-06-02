"use client";
import { useEffect, useRef, useState } from "react";

interface Booking {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
  zoomLink?: string;
  status: "confirmed" | "completed" | "cancelled" | "no_show";
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed:  "#38BDF8",
  completed:  "#34D399",
  cancelled:  "#F87171",
  no_show:    "#FB923C",
};

const TIMES = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM", "5:00 PM",
];

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function fmtDate(yyyymmdd: string) {
  if (!yyyymmdd) return "";
  return new Date(yyyymmdd + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("bt_admin_token") || "" : "";
}

/* ── Input style for reschedule form (admin dark surface) ── */
const rescheduleInputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  background: "var(--adm-input)", border: "1px solid var(--adm-border2)",
  color: "var(--adm-text)", fontSize: "0.8125rem",
  outline: "none", fontFamily: "inherit",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [toast,    setToast]    = useState<string | null>(null);

  /* Reschedule sub-form state */
  const [showReschedule,   setShowReschedule]   = useState(false);
  const [rescheduleData,   setRescheduleData]   = useState({ date: "", time: "", note: "" });
  const [actionLoading,    setActionLoading]    = useState(false);

  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function showToast(msg: string) {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3500);
  }

  async function loadBookings() {
    try {
      const res = await fetch("/api/bookings", { headers: { "x-admin-token": token() } });
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch { /* silent */ }
    setLoading(false);
  }

  useEffect(() => { loadBookings(); }, []);

  function closeModal() {
    setSelected(null);
    setShowReschedule(false);
    setRescheduleData({ date: "", time: "", note: "" });
  }

  async function triggerAction(
    id: string,
    action: "accept" | "reschedule" | "decline" | "complete" | "no_show",
    extra?: { rescheduleDate?: string; rescheduleTime?: string; rescheduleNote?: string },
  ) {
    setActionLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method:  "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": token() },
        body:    JSON.stringify({ id, action, ...extra }),
      });
      if (res.ok) {
        await loadBookings();
        const msgs: Record<string, string> = {
          accept:    "✓ Booking accepted — confirmation email sent",
          reschedule:"📅 Reschedule email sent to client",
          decline:   "✕ Booking declined — cancellation email sent",
          complete:  "✅ Marked as completed",
          no_show:   "⚠ Marked as no-show",
        };
        showToast(msgs[action] || "Status updated");
        setShowReschedule(false);
        setRescheduleData({ date: "", time: "", note: "" });
        setSelected((b) => {
          if (!b || b.id !== id) return b;
          const statusMap: Record<string, Booking["status"]> = {
            accept: "confirmed", decline: "cancelled",
            complete: "completed", no_show: "no_show", reschedule: b.status,
          };
          return { ...b, status: statusMap[action] || b.status };
        });
      } else {
        showToast("Action failed — please try again");
      }
    } catch {
      showToast("Action failed — please try again");
    }
    setActionLoading(false);
  }

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const counts: Record<string, number> = { all: bookings.length };
  for (const b of bookings) counts[b.status] = (counts[b.status] || 0) + 1;

  const today    = new Date().toISOString().slice(0, 10);
  const upcoming = filtered.filter((b) => b.date >= today && b.status !== "cancelled");
  const past     = filtered.filter((b) => b.date < today  || b.status === "cancelled");

  /* Gmail compose URL helper */
  function gmailCompose(email: string, subject: string) {
    return `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}`;
  }

  return (
    <div className="adm-page-main" style={{ padding: 32, minHeight: "100vh" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 2000, background: "#1a2e1a", border: "1px solid rgba(52,211,153,0.3)", color: "#34D399", padding: "12px 20px", borderRadius: 10, fontSize: "0.875rem", fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          {toast}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border2)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 580, position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
            <button onClick={closeModal} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--adm-muted)", cursor: "pointer", fontSize: "1.25rem" }}>✕</button>

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--adm-text)" }}>{selected.name}</h2>
              <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: `${STATUS_COLORS[selected.status]}15`, color: STATUS_COLORS[selected.status], border: `1px solid ${STATUS_COLORS[selected.status]}30` }}>
                {selected.status.replace("_", " ")}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              {[
                ["Email",   selected.email],
                ["Phone",   selected.phone || "—"],
                ["Company", selected.company || "—"],
                ["Service", selected.service],
                ["Date",    fmtDate(selected.date)],
                ["Time",    selected.time + " IST"],
                ["Booked",  fmt(selected.createdAt)],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--adm-text)" }}>{value}</div>
                </div>
              ))}
            </div>

            {selected.zoomLink && (
              <div style={{ padding: "12px 16px", background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: 10, marginBottom: 20 }}>
                <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "#34D399", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Zoom Link</div>
                <a href={selected.zoomLink} target="_blank" rel="noopener noreferrer" style={{ color: "#34D399", fontSize: "0.8125rem", wordBreak: "break-all" }}>{selected.zoomLink}</a>
              </div>
            )}

            {selected.notes && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>Notes</div>
                <p style={{ fontSize: "0.875rem", color: "var(--adm-muted2)", lineHeight: 1.6, margin: 0 }}>{selected.notes}</p>
              </div>
            )}

            {/* ── Action Buttons ── */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: showReschedule ? 16 : 0 }}>
              {/* Accept */}
              {selected.status !== "confirmed" && (
                <button
                  disabled={actionLoading}
                  onClick={() => triggerAction(selected.id, "accept")}
                  style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.1)", color: "#34D399", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, opacity: actionLoading ? 0.5 : 1 }}
                >
                  ✓ Accept
                </button>
              )}
              {/* Reschedule toggle */}
              <button
                disabled={actionLoading}
                onClick={() => setShowReschedule((v) => !v)}
                style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${showReschedule ? "rgba(251,146,60,0.5)" : "rgba(251,146,60,0.3)"}`, background: showReschedule ? "rgba(251,146,60,0.2)" : "rgba(251,146,60,0.08)", color: "#FB923C", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, opacity: actionLoading ? 0.5 : 1 }}
              >
                📅 {showReschedule ? "Cancel" : "Reschedule"}
              </button>
              {/* Complete */}
              {selected.status !== "completed" && (
                <button
                  disabled={actionLoading}
                  onClick={() => triggerAction(selected.id, "complete")}
                  style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(56,189,248,0.3)", background: "rgba(56,189,248,0.08)", color: "#38BDF8", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, opacity: actionLoading ? 0.5 : 1 }}
                >
                  ✅ Complete
                </button>
              )}
              {/* Decline */}
              {selected.status !== "cancelled" && (
                <button
                  disabled={actionLoading}
                  onClick={() => triggerAction(selected.id, "decline")}
                  style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.08)", color: "#F87171", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, opacity: actionLoading ? 0.5 : 1 }}
                >
                  ✕ Decline
                </button>
              )}
              {/* No Show */}
              {selected.status !== "no_show" && (
                <button
                  disabled={actionLoading}
                  onClick={() => triggerAction(selected.id, "no_show")}
                  style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(251,146,60,0.25)", background: "rgba(251,146,60,0.06)", color: "#FB923C", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, opacity: actionLoading ? 0.5 : 1 }}
                >
                  ⚠ No Show
                </button>
              )}
              {/* Email Client → Gmail compose */}
              <a
                href={gmailCompose(selected.email, `Re: ${selected.service} — BrandThink`)}
                target="_blank" rel="noopener noreferrer"
                style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(232,49,42,0.08)", border: "1px solid rgba(232,49,42,0.2)", color: "#E8312A", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none" }}
              >
                ✉ Email Client
              </a>
            </div>

            {/* ── Reschedule sub-form ── */}
            {showReschedule && (
              <div style={{ marginTop: 16, padding: 20, background: "var(--adm-card)", border: "1px solid var(--adm-border2)", borderRadius: 12 }}>
                <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#FB923C", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
                  Propose New Date & Time
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>New Date</div>
                    <input
                      type="date"
                      value={rescheduleData.date}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setRescheduleData((d) => ({ ...d, date: e.target.value }))}
                      style={rescheduleInputStyle}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>New Time</div>
                    <select
                      value={rescheduleData.time}
                      onChange={(e) => setRescheduleData((d) => ({ ...d, time: e.target.value }))}
                      style={rescheduleInputStyle}
                    >
                      <option value="">Select time…</option>
                      {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Note to Client (optional)</div>
                  <textarea
                    rows={2}
                    placeholder="Reason for reschedule, apology, etc."
                    value={rescheduleData.note}
                    onChange={(e) => setRescheduleData((d) => ({ ...d, note: e.target.value }))}
                    style={{ ...rescheduleInputStyle, resize: "vertical" }}
                  />
                </div>
                <button
                  disabled={!rescheduleData.date || !rescheduleData.time || actionLoading}
                  onClick={() => triggerAction(selected.id, "reschedule", {
                    rescheduleDate: rescheduleData.date,
                    rescheduleTime: rescheduleData.time,
                    rescheduleNote: rescheduleData.note,
                  })}
                  style={{
                    padding: "9px 20px", borderRadius: 9,
                    background: "linear-gradient(135deg,#FB923C,#F59E0B)",
                    border: "none", color: "#fff",
                    fontSize: "0.8125rem", fontWeight: 700,
                    cursor: !rescheduleData.date || !rescheduleData.time || actionLoading ? "not-allowed" : "pointer",
                    opacity: !rescheduleData.date || !rescheduleData.time || actionLoading ? 0.5 : 1,
                  }}
                >
                  📅 Send Reschedule Email
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--adm-text)", letterSpacing: "-0.03em" }}>Bookings</h1>
        <p style={{ fontSize: "0.875rem", color: "var(--adm-muted)", marginTop: 4 }}>All strategy session bookings from the website</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        {Object.entries(counts).map(([status, count]) => (
          <button key={status} onClick={() => setFilter(status)}
            style={{
              padding: "16px 16px",
              background: filter === status ? "rgba(232,49,42,0.1)" : "var(--adm-surface)",
              border: `1px solid ${filter === status ? "rgba(232,49,42,0.3)" : "var(--adm-border)"}`,
              borderRadius: 12, cursor: "pointer", textAlign: "left",
            }}
          >
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: filter === status ? "#E8312A" : (STATUS_COLORS[status] || "#E8312A"), letterSpacing: "-0.04em" }}>{count}</div>
            <div style={{ fontSize: "0.6875rem", color: "var(--adm-muted)", textTransform: "capitalize", marginTop: 2, fontWeight: 600 }}>
              {status === "all" ? "Total" : status.replace("_", " ")}
            </div>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 80, color: "var(--adm-muted)" }}>Loading bookings…</div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 40px", background: "var(--adm-surface)", borderRadius: 16, border: "2px dashed var(--adm-border)" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📅</div>
          <h3 style={{ color: "var(--adm-text)", fontWeight: 700, marginBottom: 8 }}>No bookings yet</h3>
          <p style={{ color: "var(--adm-muted)" }}>Bookings from the website will appear here.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--adm-muted2)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Upcoming ({upcoming.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {upcoming.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} onClick={() => { setSelected(booking); setShowReschedule(false); }} />
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Past ({past.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {past.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} onClick={() => { setSelected(booking); setShowReschedule(false); }} faded />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BookingRow({ booking, onClick, faded }: { booking: Booking; onClick: () => void; faded?: boolean }) {
  function fmtDate(yyyymmdd: string) {
    if (!yyyymmdd) return "";
    return new Date(yyyymmdd + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  }
  return (
    <div
      onClick={onClick}
      style={{
        padding: "16px 20px", background: "var(--adm-surface)",
        border: "1px solid var(--adm-border)",
        borderRadius: 12, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 16,
        opacity: faded ? 0.6 : 1, transition: "opacity 0.2s, background 0.15s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--adm-card)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--adm-surface)"; }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: "50%",
        background: `${STATUS_COLORS[booking.status] || "#38BDF8"}20`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.875rem", fontWeight: 800, color: STATUS_COLORS[booking.status] || "#38BDF8",
        flexShrink: 0,
      }}>
        {booking.name.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--adm-text)" }}>{booking.name}</div>
        <div style={{ fontSize: "0.75rem", color: "var(--adm-muted)", marginTop: 2 }}>{booking.service}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--adm-text)" }}>{fmtDate(booking.date)}</div>
        <div style={{ fontSize: "0.75rem", color: "var(--adm-muted)" }}>{booking.time}</div>
      </div>
      <span style={{
        padding: "3px 10px", borderRadius: 99, fontSize: "0.625rem",
        fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
        background: `${STATUS_COLORS[booking.status]}15`,
        color: STATUS_COLORS[booking.status],
        border: `1px solid ${STATUS_COLORS[booking.status]}30`,
        flexShrink: 0,
      }}>
        {booking.status.replace("_", " ")}
      </span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" style={{ flexShrink: 0 }}>
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </div>
  );
}
