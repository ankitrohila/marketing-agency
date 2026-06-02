"use client";
import { useEffect, useState } from "react";

interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  service?: string;
  budget?: string;
  message?: string;
  createdAt: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
}

const STATUS_COLORS: Record<string, string> = {
  new:       "#38BDF8",
  contacted: "#FB923C",
  qualified: "#A78BFA",
  converted: "#34D399",
  lost:      "#F87171",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("bt_admin_token") || "" : "";
}

export default function AdminLeadsPage() {
  const [leads,   setLeads]   = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<string>("all");
  const [search,  setSearch]  = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);

  async function loadLeads() {
    try {
      const res = await fetch("/api/leads", { headers: { "x-admin-token": token() } });
      const data = await res.json();
      setLeads(data.leads || []);
    } catch { /* silent */ }
    setLoading(false);
  }

  useEffect(() => { loadLeads(); }, []);

  const filtered = leads.filter((l) => {
    if (filter !== "all" && l.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.company || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts: Record<string, number> = { all: leads.length };
  for (const l of leads) counts[l.status] = (counts[l.status] || 0) + 1;

  return (
    <div className="adm-page-main" style={{ padding: 32, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--adm-text)", letterSpacing: "-0.03em" }}>
          Leads
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--adm-muted)", marginTop: 4 }}>
          All contact form and lead capture submissions
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        {Object.entries(counts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: "16px 16px",
              background: filter === status ? "rgba(232,49,42,0.1)" : "var(--adm-surface)",
              border: `1px solid ${filter === status ? "rgba(232,49,42,0.3)" : "var(--adm-border)"}`,
              borderRadius: 12, cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: filter === status ? "#E8312A" : (STATUS_COLORS[status] || "#E8312A"), letterSpacing: "-0.04em" }}>
              {count}
            </div>
            <div style={{ fontSize: "0.6875rem", color: "var(--adm-muted)", textTransform: "capitalize", marginTop: 2, fontWeight: 600 }}>
              {status === "all" ? "All Leads" : status}
            </div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Search by name, email, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "11px 16px", borderRadius: 10,
            background: "var(--adm-surface)", border: "1px solid var(--adm-border2)",
            color: "var(--adm-text)", fontSize: "0.875rem", outline: "none",
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Lead detail modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border2)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 560, position: "relative" }}>
            <button onClick={() => setSelected(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--adm-muted)", cursor: "pointer", fontSize: "1.25rem" }}>✕</button>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--adm-text)", marginBottom: 20 }}>{selected.name}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                ["Email", selected.email],
                ["Company", selected.company || "—"],
                ["Phone", selected.phone || "—"],
                ["Service", selected.service || "—"],
                ["Budget", selected.budget || "—"],
                ["Date", fmt(selected.createdAt)],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--adm-text)" }}>{value}</div>
                </div>
              ))}
            </div>
            {selected.message && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--adm-border)" }}>
                <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Message</div>
                <p style={{ fontSize: "0.875rem", color: "var(--adm-muted2)", lineHeight: 1.65, margin: 0 }}>{selected.message}</p>
              </div>
            )}
            <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <a
                href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(selected.email)}&su=${encodeURIComponent(`Re: ${selected.service || "Your enquiry"} — BrandThink`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "9px 18px", borderRadius: 9,
                  background: "linear-gradient(135deg,#E8312A,#FF6B1A)",
                  color: "#fff", fontSize: "0.8125rem", fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                ✉ Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Leads table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 80, color: "var(--adm-muted)" }}>Loading leads…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--adm-muted)", fontSize: "0.9375rem" }}>
          No leads found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((lead) => (
            <div
              key={lead.id}
              onClick={() => setSelected(lead)}
              style={{
                padding: "16px 20px",
                background: "var(--adm-surface)",
                border: "1px solid var(--adm-border)",
                borderRadius: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 16,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--adm-card)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--adm-surface)"; }}
            >
              {/* Avatar */}
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: `linear-gradient(135deg, ${STATUS_COLORS[lead.status] || "#E8312A"}, rgba(0,0,0,0.3))`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, fontWeight: 800, fontSize: "0.875rem", color: "#fff",
              }}>
                {lead.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--adm-text)" }}>{lead.name}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--adm-muted)", marginTop: 2 }}>
                  {lead.email}
                  {lead.company ? ` · ${lead.company}` : ""}
                </div>
              </div>

              {/* Service */}
              {lead.service && (
                <span style={{ fontSize: "0.6875rem", color: "var(--adm-muted2)", display: "none", whiteSpace: "nowrap" }}
                  className="lead-service">
                  {lead.service}
                </span>
              )}

              {/* Date */}
              <span style={{ fontSize: "0.75rem", color: "var(--adm-muted)", flexShrink: 0 }}>
                {fmt(lead.createdAt)}
              </span>

              {/* Status */}
              <span style={{
                padding: "3px 10px", borderRadius: 99,
                fontSize: "0.625rem", fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase",
                background: `${STATUS_COLORS[lead.status] || "#38BDF8"}15`,
                color: STATUS_COLORS[lead.status] || "#38BDF8",
                border: `1px solid ${STATUS_COLORS[lead.status] || "#38BDF8"}30`,
                flexShrink: 0,
              }}>
                {lead.status}
              </span>

              {/* Arrow */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
