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

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [toast,    setToast]    = useState<string | null>(null);

  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function showToast(msg: string) {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3000);
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

  async function updateStatus(id: string, status: string) {
    const res = await fetch("/api/bookings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-token": token() },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      await loadBookings();
      showToast("Booking status updated");
      if (selected?.id === id) setSelected((b) => b ? { ...b, status: status as Booking["status"] } : null);
    }
  }

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const counts: Record<string, number> = { all: bookings.length };
  for (const b of bookings) counts[b.status] = (counts[b.status] || 0) + 1;

  // Upcoming vs past
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = filtered.filter((b) => b.date >= today && b.status !== "cancelled");
  const past     = filtered.filter((b) => b.date < today  || b.status === "cancelled");

  return (
    <div style={{ padding: 32, minHeight: "100vh" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 2000, background: "#1a2e1a", border: "1px solid rgba(52,211,153,0.3)", color: "#34D399", padding: "12px 20px", borderRadius: 10, fontSize: "0.875rem", fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          ✓ {toast}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 560, position: "relative" }}>
            <button onClick={() => setSelected(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "1.25rem" }}>✕</button>

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#F5F5F5" }}>{selected.name}</h2>
              <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: `${STATUS_COLORS[selected.status]}15`, color: STATUS_COLORS[selected.status], border: `1px solid ${STATUS_COLORS[selected.status]}30` }}>
                {selected.status.replace("_", " ")}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              {[
                ["Email", selected.email],
                ["Phone", selected.phone || "—"],
                ["Company", selected.company || "—"],
                ["Service", selected.service],
                ["Date", fmtDate(selected.date)],
                ["Time", selected.time + " IST"],
                ["Booked", fmt(selected.createdAt)],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: "0.875rem", color: "#F5F5F5" }}>{value}</div>
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
                <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>Notes</div>
                <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: 0 }}>{selected.notes}</p>
              </div>
            )}

            {/* Status actions */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(["confirmed", "completed", "cancelled", "no_show"] as const).filter((s) => s !== selected.status).map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(selected.id, s)}
                  style={{
                    padding: "8px 14px", borderRadius: 8,
                    border: `1px solid ${STATUS_COLORS[s]}30`,
                    background: `${STATUS_COLORS[s]}10`,
                    color: STATUS_COLORS[s],
                    cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  Mark as {s.replace("_", " ")}
                </button>
              ))}
              <a
                href={`mailto:${selected.email}`}
                style={{
                  padding: "8px 14px", borderRadius: 8,
                  background: "rgba(232,49,42,0.1)",
                  border: "1px solid rgba(232,49,42,0.2)",
                  color: "#E8312A", fontSize: "0.75rem", fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                ✉ Email Client
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#F5F5F5", letterSpacing: "-0.03em" }}>Bookings</h1>
        <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", marginTop: 4 }}>All strategy session bookings from the website</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        {Object.entries(counts).map(([status, count]) => (
          <button key={status} onClick={() => setFilter(status)}
            style={{
              padding: "16px 16px", background: filter === status ? "rgba(232,49,42,0.1)" : "#0d0d0d",
              border: `1px solid ${filter === status ? "rgba(232,49,42,0.3)" : "rgba(255,255,255,0.06)"}`,
              borderRadius: 12, cursor: "pointer", textAlign: "left",
            }}
          >
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: filter === status ? "#E8312A" : (STATUS_COLORS[status] || "#E8312A"), letterSpacing: "-0.04em" }}>{count}</div>
            <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.4)", textTransform: "capitalize", marginTop: 2, fontWeight: 600 }}>
              {status === "all" ? "Total" : status.replace("_", " ")}
            </div>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 80, color: "rgba(255,255,255,0.3)" }}>Loading bookings…</div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 40px", background: "#0d0d0d", borderRadius: 16, border: "2px dashed rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📅</div>
          <h3 style={{ color: "#F5F5F5", fontWeight: 700, marginBottom: 8 }}>No bookings yet</h3>
          <p style={{ color: "rgba(255,255,255,0.4)" }}>Bookings from the website will appear here.</p>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: "0.875rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Upcoming ({upcoming.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {upcoming.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} onClick={() => setSelected(booking)} />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 style={{ fontSize: "0.875rem", fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Past ({past.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {past.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} onClick={() => setSelected(booking)} faded />
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
        padding: "16px 20px", background: "#0d0d0d",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 16,
        opacity: faded ? 0.6 : 1, transition: "opacity 0.2s, background 0.2s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#141414"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#0d0d0d"; }}
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
        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#F5F5F5" }}>{booking.name}</div>
        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
          {booking.service}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#F5F5F5" }}>{fmtDate(booking.date)}</div>
        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>{booking.time}</div>
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
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" style={{ flexShrink: 0 }}>
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </div>
  );
}
