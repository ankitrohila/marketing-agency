"use client";
import { useEffect, useState, useRef } from "react";
import AdminHeader from "@/components/admin/AdminHeader";

interface AdminUser { id: string; name: string; email: string; role: string; avatar: string; }

interface MailLog {
  id: string;
  to: string;
  subject: string;
  source: string;
  status: "sent" | "failed" | "skipped";
  messageId: string | null;
  error: string | null;
  sentAt: string;
}

interface Stats { sent: number; failed: number; skipped: number; total: number; }

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("bt_admin_token") || "" : "";
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

const SOURCE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  contact:        { label: "Contact Form",  color: "#60A5FA", bg: "rgba(96,165,250,0.1)"  },
  lead:           { label: "Lead Capture",  color: "#A78BFA", bg: "rgba(167,139,250,0.1)" },
  "booking-client": { label: "Booking (Client)", color: "#34D399", bg: "rgba(52,211,153,0.1)" },
  "booking-admin":  { label: "Booking (Admin)",  color: "#34D399", bg: "rgba(52,211,153,0.1)" },
  subscribe:      { label: "Newsletter",    color: "#FB923C", bg: "rgba(251,146,60,0.1)"  },
  test:           { label: "Test Mail",     color: "#FBBF24", bg: "rgba(251,191,36,0.1)"  },
  system:         { label: "System",        color: "#9CA3AF", bg: "rgba(156,163,175,0.1)" },
};

const STATUS_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  sent:    { color: "#34D399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.25)"  },
  failed:  { color: "#F87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.25)" },
  skipped: { color: "#9CA3AF", bg: "rgba(156,163,175,0.1)",  border: "rgba(156,163,175,0.2)"  },
};

export default function MailLogsPage() {
  const [user,     setUser]     = useState<AdminUser | null>(null);
  const [logs,     setLogs]     = useState<MailLog[]>([]);
  const [stats,    setStats]    = useState<Stats>({ sent: 0, failed: 0, skipped: 0, total: 0 });
  const [loading,  setLoading]  = useState(true);
  const [testing,  setTesting]  = useState(false);
  const [clearing, setClearing] = useState(false);
  const [toast,    setToast]    = useState<{ msg: string; ok: boolean } | null>(null);
  const [filter,   setFilter]   = useState<string>("all"); // all | sent | failed | skipped
  const [srcFilter,setSrcFilter]= useState<string>("all");
  const [testTo,   setTestTo]   = useState("");
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    const stored = localStorage.getItem("bt_admin_user");
    if (stored) { try { setUser(JSON.parse(stored)); } catch { /* */ } }
    loadLogs();
  }, []);

  async function loadLogs() {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/mail-logs?limit=200", { headers: { "x-admin-token": token() } });
      const data = await res.json();
      setLogs(data.logs  || []);
      setStats(data.stats || { sent: 0, failed: 0, skipped: 0, total: 0 });
    } catch { /* */ }
    setLoading(false);
  }

  async function sendTestMail() {
    setTesting(true);
    try {
      const to  = testTo.trim() || undefined;
      const res = await fetch("/api/admin/test-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token() },
        body: JSON.stringify(to ? { to } : {}),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Test email sent! Check ${testTo || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "your inbox"}`);
      } else {
        showToast(`❌ Failed: ${data.reason || data.error}`, false);
      }
      await loadLogs();
    } catch (e) {
      showToast(`❌ Error: ${e}`, false);
    }
    setTesting(false);
  }

  async function clearLogs() {
    if (!confirm("Clear all mail logs? This cannot be undone.")) return;
    setClearing(true);
    await fetch("/api/admin/mail-logs", { method: "DELETE", headers: { "x-admin-token": token() } });
    await loadLogs();
    showToast("Mail logs cleared");
    setClearing(false);
  }

  const filtered = logs.filter((l) => {
    const statusOk = filter    === "all" || l.status === filter;
    const srcOk    = srcFilter === "all" || l.source === srcFilter;
    return statusOk && srcOk;
  });

  const sources = Array.from(new Set(logs.map((l) => l.source)));

  return (
    <div className="adm-page-main" style={{ padding: 32, minHeight: "100vh" }}>
      <AdminHeader title="Mail Logs" user={user} />

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 2000,
          background: "var(--adm-card)",
          border: `1px solid ${toast.ok ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
          color: toast.ok ? "#34D399" : "#F87171",
          padding: "12px 20px", borderRadius: 10,
          fontSize: "0.875rem", fontWeight: 600,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)", maxWidth: 400,
        }}>
          {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 28, marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--adm-text)", letterSpacing: "-0.03em" }}>
            Mail Logs
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--adm-muted)", marginTop: 4 }}>
            Every email sent or attempted from BrandThink
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={loadLogs}
            style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid var(--adm-border2)", background: "transparent", color: "var(--adm-muted2)", cursor: "pointer", fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: 6 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.71"/>
            </svg>
            Refresh
          </button>
          <button
            onClick={clearLogs}
            disabled={clearing || logs.length === 0}
            style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid rgba(248,113,113,0.25)", background: "transparent", color: "#F87171", cursor: logs.length === 0 ? "not-allowed" : "pointer", fontSize: "0.8125rem", opacity: logs.length === 0 ? 0.4 : 1 }}
          >
            {clearing ? "Clearing…" : "Clear Logs"}
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Emails",   value: stats.total,   color: "var(--adm-text)" },
          { label: "Sent",           value: stats.sent,    color: "#34D399" },
          { label: "Failed",         value: stats.failed,  color: "#F87171" },
          { label: "Skipped (SMTP)", value: stats.skipped, color: "#9CA3AF" },
        ].map((s) => (
          <div key={s.label} style={{ padding: "20px 24px", background: "var(--adm-surface)", borderRadius: 14, border: "1px solid var(--adm-border)" }}>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: s.color, letterSpacing: "-0.04em" }}>{s.value}</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--adm-muted2)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Test mail panel */}
      <div style={{ padding: "20px 24px", background: "var(--adm-surface)", borderRadius: 14, border: "1px solid var(--adm-border)", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--adm-text)", flexShrink: 0 }}>
            📨 Send Test Email
          </div>
          <input
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="Recipient email (leave blank for ADMIN_EMAIL)"
            style={{
              flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 8,
              background: "var(--adm-card2)", border: "1px solid var(--adm-border2)",
              color: "var(--adm-text)", fontSize: "0.875rem", outline: "none", fontFamily: "inherit",
            }}
          />
          <button
            onClick={sendTestMail}
            disabled={testing}
            style={{
              padding: "9px 20px", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg,#E8312A,#FF6B1A)",
              color: "#fff", cursor: testing ? "not-allowed" : "pointer",
              fontSize: "0.875rem", fontWeight: 700, flexShrink: 0,
              opacity: testing ? 0.7 : 1,
            }}
          >
            {testing ? "Sending…" : "Send Test"}
          </button>
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--adm-muted)", marginTop: 10, marginBottom: 0 }}>
          This sends a real email via Gmail SMTP. Check your inbox to confirm delivery.
          SMTP: <strong style={{ color: "var(--adm-text)" }}>{process.env.NEXT_PUBLIC_SMTP_USER || "rohilla77@gmail.com"}</strong>
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "sent", "failed", "skipped"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px", borderRadius: 20,
                border: `1px solid ${filter === f ? "rgba(232,49,42,0.4)" : "var(--adm-border2)"}`,
                background: filter === f ? "rgba(232,49,42,0.1)" : "transparent",
                color: filter === f ? "#E8312A" : "var(--adm-muted2)",
                cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600, textTransform: "capitalize",
              }}
            >
              {f === "all" ? `All (${stats.total})` : f}
            </button>
          ))}
        </div>
        {sources.length > 1 && (
          <select
            value={srcFilter}
            onChange={(e) => setSrcFilter(e.target.value)}
            style={{
              padding: "6px 12px", borderRadius: 8,
              background: "var(--adm-card2)", border: "1px solid var(--adm-border2)",
              color: "var(--adm-text)", fontSize: "0.8125rem", outline: "none",
            }}
          >
            <option value="all">All Sources</option>
            {sources.map((s) => <option key={s} value={s}>{SOURCE_LABELS[s]?.label || s}</option>)}
          </select>
        )}
        <span style={{ marginLeft: "auto", fontSize: "0.8125rem", color: "var(--adm-muted)" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Log table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 80, color: "var(--adm-muted)" }}>Loading mail logs…</div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "80px 40px",
          background: "var(--adm-surface)", borderRadius: 16,
          border: "2px dashed var(--adm-border)",
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>📭</div>
          <h3 style={{ color: "var(--adm-text)", fontWeight: 700, marginBottom: 8 }}>
            {logs.length === 0 ? "No emails logged yet" : "No results for this filter"}
          </h3>
          <p style={{ color: "var(--adm-muted)", fontSize: "0.875rem" }}>
            {logs.length === 0
              ? "Send a test email above or trigger a form submission on the site."
              : "Try changing the status or source filter."}
          </p>
        </div>
      ) : (
        <div style={{ background: "var(--adm-surface)", borderRadius: 14, border: "1px solid var(--adm-border)", overflow: "hidden" }}>
          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1.6fr 120px 120px 160px",
            padding: "10px 20px",
            background: "var(--adm-card)", borderBottom: "1px solid var(--adm-border)",
            fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            <span>Recipient</span>
            <span>Subject</span>
            <span>Source</span>
            <span>Status</span>
            <span>Time</span>
          </div>

          {/* Rows */}
          {filtered.map((log, i) => {
            const src = SOURCE_LABELS[log.source] || { label: log.source, color: "#9CA3AF", bg: "rgba(156,163,175,0.1)" };
            const st  = STATUS_STYLE[log.status]  || STATUS_STYLE.skipped;
            return (
              <div
                key={log.id}
                style={{
                  display: "grid", gridTemplateColumns: "1fr 1.6fr 120px 120px 160px",
                  padding: "13px 20px", alignItems: "center",
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--adm-border)" : "none",
                  transition: "background 0.15s",
                  cursor: log.error ? "pointer" : "default",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--adm-card)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                title={log.error || log.messageId || ""}
              >
                {/* Recipient */}
                <div style={{ fontSize: "0.8125rem", color: "var(--adm-text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 12 }}>
                  {log.to}
                </div>

                {/* Subject */}
                <div style={{ fontSize: "0.8125rem", color: "var(--adm-muted2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 12 }}>
                  {log.subject}
                  {log.error && (
                    <div style={{ fontSize: "0.6875rem", color: "#F87171", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis" }}>
                      ↳ {log.error.length > 80 ? log.error.slice(0, 80) + "…" : log.error}
                    </div>
                  )}
                </div>

                {/* Source badge */}
                <div>
                  <span style={{
                    fontSize: "0.625rem", fontWeight: 700, padding: "3px 8px", borderRadius: 99,
                    background: src.bg, color: src.color,
                    border: `1px solid ${src.color}33`,
                    whiteSpace: "nowrap",
                  }}>
                    {src.label}
                  </span>
                </div>

                {/* Status badge */}
                <div>
                  <span style={{
                    fontSize: "0.625rem", fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                    background: st.bg, color: st.color,
                    border: `1px solid ${st.border}`,
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
                    {log.status === "sent" ? "✓ Sent" : log.status === "failed" ? "✗ Failed" : "— Skipped"}
                  </span>
                </div>

                {/* Time */}
                <div style={{ fontSize: "0.75rem", color: "var(--adm-muted)" }}>
                  {fmt(log.sentAt)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
