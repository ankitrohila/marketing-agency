"use client";
import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";

interface AdminUser { id: string; name: string; email: string; role: string; avatar: string; }

interface SeoGlobal {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage: string;
  googleTagId: string;
  googleSearchConsoleVerification: string;
  facebookPixelId: string;
  microsoftClarityId: string;
  robotsTxt: string;
  schemaOrg: string;
  canonicalUrl: string;
  // Tag injection
  gtmHeadCode: string;
  gtmBodyCode: string;
  customHeadCode: string;
  customBodyCode: string;
}

interface SeoData {
  global: SeoGlobal;
  pages: Record<string, { title: string; description: string; ogImage: string; noindex?: boolean }>;
}

interface Redirect {
  id: string; from: string; to: string;
  type: string; active: boolean; createdAt: string;
}

const TABS = ["Global", "Pages", "Tag Injection", "Redirects", "Schema", "Technical", "Sitemap"];

const ALL_PAGES = [
  { path: "/",           label: "Home" },
  { path: "/about",      label: "About" },
  { path: "/services",   label: "Services" },
  { path: "/work",       label: "Work / Portfolio" },
  { path: "/insights",   label: "Insights" },
  { path: "/blog",       label: "Blog" },
  { path: "/contact",    label: "Contact" },
  { path: "/admin",      label: "Admin Panel" },
];

/* ── Shared input style ── */
const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
  width: "100%", padding: "9px 12px", borderRadius: 7,
  background: "var(--adm-card2)", border: "1px solid var(--adm-border2)",
  color: "var(--adm-text)", fontSize: "0.8125rem", outline: "none",
  fontFamily: "inherit", ...extra,
});

const lbl: React.CSSProperties = {
  display: "block", fontSize: "0.6875rem", fontWeight: 600,
  color: "var(--adm-muted2)", textTransform: "uppercase",
  letterSpacing: "0.08em", marginBottom: 5,
};

/* ── SEO Score pill ── */
function ScorePill({ title, desc }: { title: string; desc: string }) {
  const t = title.length >= 30 && title.length <= 60;
  const d = desc.length >= 80  && desc.length <= 160;
  const s = (t ? 1 : 0) + (d ? 1 : 0);
  const score = s * 50;
  const [bg, txt] = score === 100 ? ["rgba(52,211,153,0.12)","#34D399"]
                  : score === 50  ? ["rgba(251,191,36,0.1)","#FBBF24"]
                  :                 ["rgba(255,255,255,0.06)","var(--adm-muted)"];
  return (
    <span style={{ padding: "2px 9px", borderRadius: 99, background: bg, color: txt, fontSize: "0.6875rem", fontWeight: 700, whiteSpace: "nowrap" }}>
      {score}/100
    </span>
  );
}

/* ── Primary action button ── */
function SaveBtn({ label, onClick, loading }: { label: string; onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{ padding: "9px 22px", borderRadius: 7, border: "none", background: "var(--adm-text)", color: "var(--adm-bg)", fontSize: "0.8125rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
    >
      {loading ? "Saving…" : label}
    </button>
  );
}

/* ── Code textarea ── */
function CodeBlock({ label, hint, value, onChange, rows = 6 }: {
  label: string; hint?: string; value: string;
  onChange: (v: string) => void; rows?: number;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <label style={lbl}>{label}</label>
        {hint && <span style={{ fontSize: "0.6875rem", color: "var(--adm-muted)" }}>{hint}</span>}
      </div>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
        spellCheck={false}
        style={{ ...inp({ fontFamily: "'SF Mono','Fira Code',monospace", fontSize: "0.75rem", resize: "vertical" }) }}
      />
    </div>
  );
}

const DEFAULT_SEO: SeoData = {
  global: {
    siteName: "BrandThink", siteUrl: "https://thebrandthink.com",
    defaultTitle: "BrandThink — MarTech & Creative Agency",
    defaultDescription: "BrandThink crafts standout campaigns that drive real growth.",
    defaultOgImage: "", googleTagId: "", googleSearchConsoleVerification: "",
    facebookPixelId: "", microsoftClarityId: "", robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: https://thebrandthink.com/sitemap.xml",
    schemaOrg: "", canonicalUrl: "",
    gtmHeadCode: "", gtmBodyCode: "", customHeadCode: "", customBodyCode: "",
  },
  pages: {},
};

export default function AdminSeoPage() {
  const [user,        setUser]      = useState<AdminUser | null>(null);
  const [tab,         setTab]       = useState(0);
  const [seo,         setSeo]       = useState<SeoData>(DEFAULT_SEO);
  const [redirects,   setRedirects] = useState<Redirect[]>([]);
  const [selPage,     setSelPage]   = useState("/");
  const [saving,      setSaving]    = useState(false);
  const [saved,       setSaved]     = useState(false);
  const [newRed,      setNewRed]    = useState({ from: "", to: "", type: "301" });

  useEffect(() => {
    const stored = localStorage.getItem("bt_admin_user");
    if (stored) setUser(JSON.parse(stored));
    const tok = localStorage.getItem("bt_admin_token") || "";
    fetch("/api/admin/seo", { headers: { "x-admin-token": tok } })
      .then(r => r.json())
      .then(d => {
        if (d && d.global) setSeo({ global: { ...DEFAULT_SEO.global, ...d.global }, pages: d.pages || {} });
      }).catch(() => {});
    fetch("/api/admin/redirects", { headers: { "x-admin-token": tok } })
      .then(r => r.json()).then(d => setRedirects(d.redirects || [])).catch(() => {});
  }, []);

  async function save(payload: Partial<SeoData>) {
    setSaving(true);
    const tok = localStorage.getItem("bt_admin_token") || "";
    await fetch("/api/admin/seo", { method: "PUT", headers: { "Content-Type": "application/json", "x-admin-token": tok }, body: JSON.stringify(payload) });
    setSaved(true); setTimeout(() => setSaved(false), 2200);
    setSaving(false);
  }

  async function addRedirect() {
    if (!newRed.from || !newRed.to) return;
    const tok = localStorage.getItem("bt_admin_token") || "";
    const r = await fetch("/api/admin/redirects", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-token": tok }, body: JSON.stringify(newRed) });
    if (r.ok) { const d = await r.json(); setRedirects(p => [...p, d.redirect]); setNewRed({ from: "", to: "", type: "301" }); }
  }

  async function toggleRedirect(id: string, active: boolean) {
    const tok = localStorage.getItem("bt_admin_token") || "";
    await fetch("/api/admin/redirects", { method: "PUT", headers: { "Content-Type": "application/json", "x-admin-token": tok }, body: JSON.stringify({ id, active: !active }) });
    setRedirects(p => p.map(r => r.id === id ? { ...r, active: !active } : r));
  }

  async function deleteRedirect(id: string) {
    const tok = localStorage.getItem("bt_admin_token") || "";
    await fetch(`/api/admin/redirects?id=${id}`, { method: "DELETE", headers: { "x-admin-token": tok } });
    setRedirects(p => p.filter(r => r.id !== id));
  }

  function updateGlobal(k: keyof SeoGlobal, v: string) {
    setSeo(prev => ({ ...prev, global: { ...prev.global, [k]: v } }));
  }

  const pg = seo.pages?.[selPage] || { title: "", description: "", ogImage: "", noindex: false };
  function updatePage(k: string, v: string | boolean) {
    setSeo(prev => ({ ...prev, pages: { ...prev.pages, [selPage]: { ...pg, [k]: v } } }));
  }

  /* shared card style */
  const card: React.CSSProperties = { background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 10, padding: "18px 20px", marginBottom: 16 };

  return (
    <>
      <AdminHeader title="SEO Settings" user={user} />
      <main style={{ flex: 1, overflowY: "auto" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--adm-border)", padding: "0 28px", background: "var(--adm-surface)", position: "sticky", top: 0, zIndex: 10, overflowX: "auto" }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{
              padding: "13px 16px", border: "none", background: "transparent",
              color: tab === i ? "var(--adm-text)" : "var(--adm-muted)",
              fontSize: "0.8125rem", fontWeight: tab === i ? 600 : 400,
              cursor: "pointer", whiteSpace: "nowrap",
              borderBottom: `2px solid ${tab === i ? "var(--adm-text)" : "transparent"}`,
              transition: "all 0.15s",
            }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ padding: 28, maxWidth: 800 }}>

          {/* ── Tab 0: Global ── */}
          {tab === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: "0.8125rem", color: "var(--adm-muted)", marginBottom: 4 }}>
                Default SEO values used when a page doesn't have specific overrides.
              </p>
              {([ ["Site Name",                "siteName"],
                  ["Site URL",                 "siteUrl"],
                  ["Default Meta Title",        "defaultTitle"],
                  ["Default OG Image URL",      "defaultOgImage"],
                  ["Google Tag ID (G-… or GTM-…)", "googleTagId"],
                  ["Search Console Verification", "googleSearchConsoleVerification"],
                  ["Facebook Pixel ID",         "facebookPixelId"],
                  ["Microsoft Clarity ID",      "microsoftClarityId"],
              ] as [string, keyof SeoGlobal][]).map(([label, key]) => (
                <div key={key}>
                  <label style={lbl}>{label}</label>
                  <input value={seo.global[key] || ""} onChange={e => updateGlobal(key, e.target.value)} style={inp()} />
                </div>
              ))}
              <div>
                <label style={lbl}>Default Meta Description</label>
                <textarea value={seo.global.defaultDescription || ""} onChange={e => updateGlobal("defaultDescription", e.target.value)} rows={3} style={inp({ resize: "vertical" })} />
              </div>
              <div>
                <SaveBtn label={saved ? "Saved ✓" : "Save Global"} onClick={() => save({ global: seo.global })} loading={saving} />
              </div>
            </div>
          )}

          {/* ── Tab 1: Pages ── */}
          {tab === 1 && (
            <div>
              <p style={{ fontSize: "0.8125rem", color: "var(--adm-muted)", marginBottom: 20 }}>
                Per-page meta title, description and OG image. Click a page to edit.
              </p>

              {/* Pages list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
                {ALL_PAGES.map(({ path, label }) => {
                  const p = seo.pages?.[path] || { title: "", description: "", ogImage: "" };
                  const isSelected = selPage === path;
                  return (
                    <div key={path}
                      onClick={() => setSelPage(path)}
                      style={{ padding: "13px 16px", background: isSelected ? "var(--adm-card)" : "var(--adm-surface)", border: `1px solid ${isSelected ? "var(--adm-border2)" : "var(--adm-border)"}`, borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "background 0.12s" }}
                      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "var(--adm-card)"; }}
                      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "var(--adm-surface)"; }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--adm-text)" }}>{label}</span>
                          <span style={{ fontSize: "0.6875rem", color: "var(--adm-muted)", fontFamily: "monospace" }}>{path}</span>
                          {p.noindex && <span style={{ fontSize: "0.5625rem", fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "var(--adm-card2)", color: "var(--adm-muted)", letterSpacing: "0.1em" }}>NOINDEX</span>}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--adm-muted)", marginTop: 2, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                          {p.title || <span style={{ opacity: 0.4 }}>No meta title set</span>}
                        </div>
                      </div>
                      <ScorePill title={p.title || ""} desc={p.description || ""} />
                    </div>
                  );
                })}
              </div>

              {/* Edit selected page */}
              <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--adm-text)" }}>
                    Editing: {ALL_PAGES.find(p => p.path === selPage)?.label}
                  </span>
                  <code style={{ fontSize: "0.6875rem", color: "var(--adm-muted)", background: "var(--adm-card2)", padding: "2px 7px", borderRadius: 4 }}>{selPage}</code>
                  <ScorePill title={pg.title} desc={pg.description} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <label style={lbl}>Meta Title</label>
                      <span style={{ fontSize: "0.6875rem", color: pg.title.length > 60 ? "#F87171" : pg.title.length >= 30 ? "#34D399" : "var(--adm-muted)" }}>{pg.title.length}/60</span>
                    </div>
                    <input value={pg.title} onChange={e => updatePage("title", e.target.value)} placeholder="Page title (30–60 chars ideal)" style={inp()} />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <label style={lbl}>Meta Description</label>
                      <span style={{ fontSize: "0.6875rem", color: pg.description.length > 160 ? "#F87171" : pg.description.length >= 80 ? "#34D399" : "var(--adm-muted)" }}>{pg.description.length}/160</span>
                    </div>
                    <textarea value={pg.description} onChange={e => updatePage("description", e.target.value)} rows={3} placeholder="Description (80–160 chars ideal)" style={inp({ resize: "vertical" })} />
                  </div>
                  <div>
                    <label style={lbl}>OG Image URL</label>
                    <input value={pg.ogImage || ""} onChange={e => updatePage("ogImage", e.target.value)} placeholder="https://…/og-image.jpg" style={inp()} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="checkbox" id="noindex" checked={!!pg.noindex} onChange={e => updatePage("noindex", e.target.checked)} style={{ cursor: "pointer" }} />
                    <label htmlFor="noindex" style={{ fontSize: "0.8125rem", color: "var(--adm-muted2)", cursor: "pointer" }}>Exclude from search engines (noindex)</label>
                  </div>

                  {/* Google SERP preview */}
                  {pg.title && (
                    <div style={{ background: "#fff", borderRadius: 8, padding: "14px 16px", border: "1px solid rgba(0,0,0,0.08)" }}>
                      <div style={{ fontSize: "0.6875rem", color: "#188038", marginBottom: 2, fontFamily: "Arial,sans-serif" }}>https://thebrandthink.com{selPage}</div>
                      <div style={{ fontSize: "1rem", color: "#1558d6", marginBottom: 4, fontFamily: "Arial,sans-serif", fontWeight: 400 }}>{pg.title}</div>
                      <div style={{ fontSize: "0.8125rem", color: "#4d5156", lineHeight: 1.5, fontFamily: "Arial,sans-serif" }}>{pg.description || "—"}</div>
                    </div>
                  )}

                  <div>
                    <SaveBtn label={saved ? "Saved ✓" : "Save Page SEO"} onClick={() => save({ pages: seo.pages })} loading={saving} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab 2: Tag Injection ── */}
          {tab === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ fontSize: "0.8125rem", color: "var(--adm-muted)" }}>
                Paste analytics tags, tracking pixels, and custom scripts. These are injected into every page of the site.
              </p>

              {/* Quick IDs */}
              <div style={card}>
                <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 14 }}>Quick Setup — Tag IDs</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {([
                    ["Google Tag (GA4 / GTM)",  "googleTagId",               "G-XXXXXXXX or GTM-XXXXX"],
                    ["Facebook Pixel ID",        "facebookPixelId",           "123456789012345"],
                    ["Microsoft Clarity ID",     "microsoftClarityId",        "xxxxxxxxxx"],
                    ["Search Console Verify",    "googleSearchConsoleVerification", "verification-code"],
                  ] as [string, keyof SeoGlobal, string][]).map(([label, key, ph]) => (
                    <div key={key}>
                      <label style={lbl}>{label}</label>
                      <input value={seo.global[key] || ""} onChange={e => updateGlobal(key, e.target.value)} placeholder={ph} style={inp()} />
                    </div>
                  ))}
                </div>
              </div>

              {/* GTM */}
              <div style={card}>
                <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 4 }}>Google Tag Manager</h4>
                <p style={{ fontSize: "0.75rem", color: "var(--adm-muted)", marginBottom: 14 }}>
                  Paste the full GTM snippet from your GTM workspace → Install → Standard.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <CodeBlock label="GTM — &lt;head&gt; snippet" hint="Paste inside <head>" rows={5}
                    value={seo.global.gtmHeadCode}
                    onChange={v => updateGlobal("gtmHeadCode", v)}
                  />
                  <CodeBlock label="GTM — &lt;body&gt; snippet" hint="Paste after <body> opens" rows={4}
                    value={seo.global.gtmBodyCode}
                    onChange={v => updateGlobal("gtmBodyCode", v)}
                  />
                </div>
              </div>

              {/* Custom code */}
              <div style={card}>
                <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 4 }}>Custom Code Injection</h4>
                <p style={{ fontSize: "0.75rem", color: "var(--adm-muted)", marginBottom: 14 }}>
                  Any additional tracking pixels, verification meta tags, or third-party scripts.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <CodeBlock label="Custom &lt;head&gt; code" hint="Schema markup, canonical, other meta"
                    value={seo.global.customHeadCode}
                    onChange={v => updateGlobal("customHeadCode", v)}
                  />
                  <CodeBlock label="Custom &lt;body&gt; code" hint="Chat widgets, heatmaps, live-chat scripts"
                    value={seo.global.customBodyCode}
                    onChange={v => updateGlobal("customBodyCode", v)}
                  />
                </div>
              </div>

              <div>
                <SaveBtn label={saved ? "Saved ✓" : "Save Tags"} onClick={() => save({ global: seo.global })} loading={saving} />
                <p style={{ fontSize: "0.75rem", color: "var(--adm-muted)", marginTop: 8 }}>
                  Changes take effect on next page load. Restart the dev server to see updates locally.
                </p>
              </div>
            </div>
          )}

          {/* ── Tab 3: Redirects ── */}
          {tab === 3 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--adm-text)" }}>URL Redirects</h3>
                  <p style={{ fontSize: "0.75rem", color: "var(--adm-muted)", marginTop: 2 }}>{redirects.length} redirect{redirects.length !== 1 ? "s" : ""} configured</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ padding: "7px 13px", borderRadius: 7, border: "1px solid var(--adm-border2)", background: "transparent", color: "var(--adm-muted2)", fontSize: "0.75rem", cursor: "pointer" }}>Import CSV</button>
                  <button style={{ padding: "7px 13px", borderRadius: 7, border: "1px solid var(--adm-border2)", background: "transparent", color: "var(--adm-muted2)", fontSize: "0.75rem", cursor: "pointer" }}>Export CSV</button>
                </div>
              </div>

              <div style={card}>
                <h4 style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Add Redirect</h4>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input placeholder="From URL (e.g. /old-page)" value={newRed.from} onChange={e => setNewRed(f => ({ ...f, from: e.target.value }))} style={{ ...inp(), flex: 1, minWidth: 160 }} />
                  <input placeholder="To URL (e.g. /new-page)" value={newRed.to} onChange={e => setNewRed(f => ({ ...f, to: e.target.value }))} style={{ ...inp(), flex: 1, minWidth: 160 }} />
                  <select value={newRed.type} onChange={e => setNewRed(f => ({ ...f, type: e.target.value }))} style={{ ...inp(), width: "auto" }}>
                    <option value="301">301 Permanent</option>
                    <option value="302">302 Temporary</option>
                  </select>
                  <button onClick={addRedirect} style={{ padding: "9px 18px", borderRadius: 7, background: "var(--adm-text)", color: "var(--adm-bg)", border: "none", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}>Add</button>
                </div>
              </div>

              <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 10, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--adm-border)" }}>
                      {["From URL","To URL","Type","Status","Created","Actions"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "0.5625rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {redirects.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: 28, textAlign: "center", color: "var(--adm-muted)", fontSize: "0.8125rem" }}>No redirects configured.</td></tr>
                    ) : redirects.map(r => (
                      <tr key={r.id} style={{ borderBottom: "1px solid var(--adm-border)" }}>
                        <td style={{ padding: "10px 14px", fontSize: "0.8125rem", color: "var(--adm-text)", fontFamily: "monospace" }}>{r.from}</td>
                        <td style={{ padding: "10px 14px", fontSize: "0.8125rem", color: "var(--adm-muted2)", fontFamily: "monospace" }}>{r.to}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: "0.625rem", fontWeight: 700, background: "var(--adm-card2)", color: "var(--adm-muted2)" }}>{r.type}</span>
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <button onClick={() => toggleRedirect(r.id, r.active)} style={{ padding: "2px 10px", borderRadius: 4, fontSize: "0.625rem", fontWeight: 700, background: r.active ? "rgba(52,211,153,0.1)" : "var(--adm-card2)", color: r.active ? "#34D399" : "var(--adm-muted)", border: "none", cursor: "pointer" }}>
                            {r.active ? "Active" : "Off"}
                          </button>
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: "0.75rem", color: "var(--adm-muted)" }}>
                          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <button onClick={() => deleteRedirect(r.id)} style={{ padding: "4px 10px", borderRadius: 6, background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", color: "var(--adm-muted)", fontSize: "0.6875rem", fontWeight: 600, cursor: "pointer" }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Tab 4: Schema ── */}
          {tab === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontSize: "0.8125rem", color: "var(--adm-muted)" }}>
                JSON-LD structured data injected in &lt;head&gt; sitewide. Use Google's Rich Results Test to validate.
              </p>
              <CodeBlock label="Organization Schema (JSON-LD)" rows={12}
                hint='{"@context":"https://schema.org","@type":"Organization"…}'
                value={seo.global.schemaOrg || ""}
                onChange={v => updateGlobal("schemaOrg", v)}
              />
              <div style={card}>
                <h4 style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--adm-text)", marginBottom: 10 }}>Article Schema Template</h4>
                <pre style={{ fontSize: "0.6875rem", color: "var(--adm-muted2)", background: "var(--adm-card2)", padding: 12, borderRadius: 7, overflow: "auto", lineHeight: 1.7 }}>{`{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{title}}",
  "author": { "@type": "Person", "name": "{{author}}" },
  "datePublished": "{{publishedAt}}",
  "publisher": { "@type": "Organization", "name": "BrandThink" }
}`}</pre>
              </div>
              <div><SaveBtn label={saved ? "Saved ✓" : "Save Schema"} onClick={() => save({ global: seo.global })} loading={saving} /></div>
            </div>
          )}

          {/* ── Tab 5: Technical ── */}
          {tab === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={card}>
                <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 12 }}>robots.txt</h4>
                <CodeBlock label="" rows={8}
                  value={seo.global.robotsTxt || ""}
                  onChange={v => updateGlobal("robotsTxt", v)}
                />
              </div>

              <div style={card}>
                <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 12 }}>noindex Pages</h4>
                {ALL_PAGES.map(({ path, label }) => {
                  const noindex = seo.pages?.[path]?.noindex || false;
                  return (
                    <div key={path} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                      <input type="checkbox" id={`ni-${path}`} checked={noindex}
                        onChange={e => setSeo(prev => ({ ...prev, pages: { ...prev.pages, [path]: { ...(prev.pages?.[path] || { title: "", description: "", ogImage: "" }), noindex: e.target.checked } } }))}
                        style={{ cursor: "pointer", width: 14, height: 14 }}
                      />
                      <label htmlFor={`ni-${path}`} style={{ fontSize: "0.8125rem", color: "var(--adm-muted2)", cursor: "pointer", fontFamily: "monospace" }}>{path}</label>
                      <span style={{ fontSize: "0.6875rem", color: "var(--adm-muted)" }}>({label})</span>
                    </div>
                  );
                })}
              </div>

              <div style={card}>
                <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 14 }}>Core Web Vitals</h4>
                <p style={{ fontSize: "0.75rem", color: "var(--adm-muted)", marginBottom: 12 }}>
                  Connect Google Search Console for live data. Showing reference targets below.
                </p>
                {[
                  { label: "LCP (Largest Contentful Paint)", target: "≤ 2.5s", good: true },
                  { label: "INP (Interaction to Next Paint)", target: "≤ 200ms", good: true },
                  { label: "CLS (Cumulative Layout Shift)", target: "≤ 0.1", good: true },
                  { label: "FCP (First Contentful Paint)", target: "≤ 1.8s", good: true },
                  { label: "TTFB (Time to First Byte)", target: "≤ 800ms", good: true },
                ].map(m => (
                  <div key={m.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--adm-border)" }}>
                    <span style={{ fontSize: "0.8125rem", color: "var(--adm-muted2)" }}>{m.label}</span>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--adm-text)" }}>{m.target}</span>
                  </div>
                ))}
                <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-block", marginTop: 12, fontSize: "0.75rem", color: "var(--adm-muted2)", textDecoration: "underline" }}>
                  Open Google Search Console →
                </a>
              </div>

              <div style={card}>
                <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 14 }}>HTTPS & URL Settings</h4>
                {[
                  { label: "Force HTTPS redirect",     key: "httpsRedirect" },
                  { label: "Redirect www → non-www",   key: "wwwRedirect" },
                  { label: "Trailing slash redirect",  key: "trailingSlash" },
                ].map(t => (
                  <div key={t.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--adm-border)" }}>
                    <span style={{ fontSize: "0.8125rem", color: "var(--adm-muted2)" }}>{t.label}</span>
                    <span style={{ fontSize: "0.6875rem", color: "var(--adm-muted)", background: "var(--adm-card2)", padding: "2px 8px", borderRadius: 4 }}>Configure in next.config.js</span>
                  </div>
                ))}
              </div>

              <div>
                <SaveBtn label={saved ? "Saved ✓" : "Save Technical"} onClick={() => save({ global: seo.global, pages: seo.pages })} loading={saving} />
              </div>
            </div>
          )}

          {/* ── Tab 6: Sitemap ── */}
          {tab === 6 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--adm-text)" }}>XML Sitemap</h3>
                  <p style={{ fontSize: "0.75rem", color: "var(--adm-muted)", marginTop: 2 }}>Auto-generated from site pages</p>
                </div>
                <button style={{ padding: "8px 16px", borderRadius: 7, background: "var(--adm-text)", color: "var(--adm-bg)", border: "none", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}>
                  Regenerate
                </button>
              </div>

              <div style={{ ...card, display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--adm-muted)", marginBottom: 4 }}>Sitemap URL</div>
                  <a href="https://thebrandthink.com/sitemap.xml" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8125rem", color: "var(--adm-text)", textDecoration: "underline" }}>
                    thebrandthink.com/sitemap.xml
                  </a>
                </div>
                <div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--adm-muted)", marginBottom: 4 }}>Submit to</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "var(--adm-muted2)", textDecoration: "underline" }}>Google Search Console</a>
                    <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "var(--adm-muted2)", textDecoration: "underline" }}>Bing Webmaster</a>
                  </div>
                </div>
              </div>

              <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 10, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--adm-border)" }}>
                      {["URL","Priority","Freq"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "0.5625rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_PAGES.filter(p => !p.path.startsWith("/admin")).map(({ path }) => (
                      <tr key={path} style={{ borderBottom: "1px solid var(--adm-border)" }}>
                        <td style={{ padding: "9px 14px", fontSize: "0.8125rem", color: "var(--adm-text)", fontFamily: "monospace" }}>thebrandthink.com{path}</td>
                        <td style={{ padding: "9px 14px", fontSize: "0.8125rem", color: "var(--adm-muted2)" }}>{path === "/" ? "1.0" : "0.8"}</td>
                        <td style={{ padding: "9px 14px", fontSize: "0.8125rem", color: "var(--adm-muted2)" }}>{path === "/" ? "daily" : "weekly"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
