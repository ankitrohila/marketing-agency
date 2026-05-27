"use client";
import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface SeoData {
  global: {
    siteName: string;
    siteUrl: string;
    defaultTitle: string;
    defaultDescription: string;
    defaultOgImage: string;
    googleTagId: string;
    googleSearchConsoleVerification: string;
    facebookPixelId: string;
    robotsTxt: string;
    schemaOrg: string;
    canonicalUrl: string;
  };
  pages: Record<string, { title: string; description: string; ogImage: string }>;
}

interface Redirect {
  id: string;
  from: string;
  to: string;
  type: string;
  active: boolean;
  createdAt: string;
}

const TABS = ["Global Settings", "Page SEO", "Redirects", "Schema", "Technical", "Sitemap"];
const PAGES = ["/", "/about", "/services", "/work", "/insights", "/blog", "/contact"];

function SeoScore({ title, desc }: { title: string; desc: string }) {
  const titleOk = title.length >= 30 && title.length <= 60;
  const descOk = desc.length >= 80 && desc.length <= 160;
  const score = [titleOk, descOk].filter(Boolean).length;
  const color = score === 2 ? "#34D399" : score === 1 ? "#FBBF24" : "#E8312A";
  const label = score === 2 ? "Good" : score === 1 ? "Needs Work" : "Poor";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${color}20`, border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.125rem", fontWeight: 800, color }}>{score * 50}</div>
      <div>
        <div style={{ fontSize: "0.875rem", fontWeight: 700, color }}>{label}</div>
        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>SEO Score</div>
      </div>
    </div>
  );
}

export default function AdminSeoPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [tab, setTab] = useState(0);
  const [seo, setSeo] = useState<SeoData | null>(null);
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [selectedPage, setSelectedPage] = useState("/");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newRedirect, setNewRedirect] = useState({ from: "", to: "", type: "301" });
  const [noindexPages, setNoindexPages] = useState<Record<string, boolean>>({ "/admin": true });
  const [sitemapUrls] = useState(["/", "/about", "/services", "/work", "/insights", "/blog", "/contact"]);
  const [lastGenerated] = useState("2025-05-27T10:30:00Z");

  useEffect(() => {
    const stored = localStorage.getItem("bt_admin_user");
    if (stored) setUser(JSON.parse(stored));
    const token = localStorage.getItem("bt_admin_token") || "";
    fetch("/api/admin/seo", { headers: { "x-admin-token": token } }).then((r) => r.json()).then(setSeo).catch(() => {});
    fetch("/api/admin/redirects", { headers: { "x-admin-token": token } }).then((r) => r.json()).then((d) => setRedirects(d.redirects || [])).catch(() => {});
  }, []);

  async function saveGlobal() {
    setSaving(true);
    const token = localStorage.getItem("bt_admin_token") || "";
    const res = await fetch("/api/admin/seo", { method: "PUT", headers: { "Content-Type": "application/json", "x-admin-token": token }, body: JSON.stringify({ global: seo?.global }) });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  }

  async function savePageSeo() {
    if (!seo) return;
    setSaving(true);
    const token = localStorage.getItem("bt_admin_token") || "";
    const res = await fetch("/api/admin/seo", { method: "PUT", headers: { "Content-Type": "application/json", "x-admin-token": token }, body: JSON.stringify({ pages: seo.pages }) });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  }

  async function addRedirect() {
    if (!newRedirect.from || !newRedirect.to) return;
    const token = localStorage.getItem("bt_admin_token") || "";
    const res = await fetch("/api/admin/redirects", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-token": token }, body: JSON.stringify(newRedirect) });
    if (res.ok) {
      const d = await res.json();
      setRedirects((prev) => [...prev, d.redirect]);
      setNewRedirect({ from: "", to: "", type: "301" });
    }
  }

  async function toggleRedirect(id: string, active: boolean) {
    const token = localStorage.getItem("bt_admin_token") || "";
    const res = await fetch("/api/admin/redirects", { method: "PUT", headers: { "Content-Type": "application/json", "x-admin-token": token }, body: JSON.stringify({ id, active: !active }) });
    if (res.ok) setRedirects((prev) => prev.map((r) => r.id === id ? { ...r, active: !active } : r));
  }

  async function deleteRedirect(id: string) {
    const token = localStorage.getItem("bt_admin_token") || "";
    const res = await fetch(`/api/admin/redirects?id=${id}`, { method: "DELETE", headers: { "x-admin-token": token } });
    if (res.ok) setRedirects((prev) => prev.filter((r) => r.id !== id));
  }

  const pageSeo = seo?.pages?.[selectedPage] || { title: "", description: "", ogImage: "" };

  return (
    <>
      <AdminHeader title="SEO Settings" user={user} />
      <main style={{ flex: 1, overflowY: "auto" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 32px", background: "#0d0d0d", position: "sticky", top: 0, zIndex: 10 }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              style={{ padding: "14px 18px", border: "none", background: "transparent", color: tab === i ? "#E8312A" : "rgba(255,255,255,0.4)", fontSize: "0.875rem", fontWeight: tab === i ? 700 : 500, cursor: "pointer", borderBottom: `2px solid ${tab === i ? "#E8312A" : "transparent"}`, whiteSpace: "nowrap", transition: "all 0.2s" }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ padding: "32px 32px" }}>
          {/* Tab 0: Global Settings */}
          {tab === 0 && seo && (
            <div style={{ maxWidth: 720 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#F5F5F5", marginBottom: 20 }}>Global SEO Settings</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Site Name", key: "siteName" as const },
                  { label: "Site URL", key: "siteUrl" as const },
                  { label: "Default Meta Title", key: "defaultTitle" as const },
                  { label: "Default OG Image URL", key: "defaultOgImage" as const },
                  { label: "Google Tag ID (GTM-XXXXX or G-XXXXXXXX)", key: "googleTagId" as const },
                  { label: "Google Search Console Verification Code", key: "googleSearchConsoleVerification" as const },
                  { label: "Facebook Pixel ID", key: "facebookPixelId" as const },
                ].map((field) => (
                  <div key={field.key}>
                    <label style={{ display: "block", fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{field.label}</label>
                    <input
                      type="text"
                      value={seo.global[field.key] || ""}
                      onChange={(e) => setSeo((prev) => prev ? { ...prev, global: { ...prev.global, [field.key]: e.target.value } } : prev)}
                      style={{ width: "100%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F5F5F5", fontSize: "0.875rem", padding: "10px 12px", outline: "none" }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Default Meta Description</label>
                  <textarea
                    value={seo.global.defaultDescription || ""}
                    onChange={(e) => setSeo((prev) => prev ? { ...prev, global: { ...prev.global, defaultDescription: e.target.value } } : prev)}
                    rows={3}
                    style={{ width: "100%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F5F5F5", fontSize: "0.875rem", padding: "10px 12px", outline: "none", resize: "vertical" }}
                  />
                </div>
                <button onClick={saveGlobal} disabled={saving} style={{ alignSelf: "flex-start", padding: "10px 24px", borderRadius: 8, background: "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)", border: "none", color: "#fff", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer" }}>
                  {saving ? "Saving..." : saved ? "Saved!" : "Save Global Settings"}
                </button>
              </div>
            </div>
          )}

          {/* Tab 1: Page SEO */}
          {tab === 1 && seo && (
            <div style={{ maxWidth: 720 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#F5F5F5" }}>Page SEO</h3>
                <select
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                  style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F5F5F5", fontSize: "0.875rem", padding: "8px 12px", outline: "none", cursor: "pointer" }}
                >
                  {PAGES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <SeoScore title={pageSeo.title} desc={pageSeo.description} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)" }}>Meta Title</label>
                    <span style={{ fontSize: "0.75rem", color: pageSeo.title.length > 60 ? "#E8312A" : pageSeo.title.length >= 30 ? "#34D399" : "#FBBF24" }}>{pageSeo.title.length}/60</span>
                  </div>
                  <input
                    type="text"
                    value={pageSeo.title}
                    onChange={(e) => setSeo((prev) => prev ? { ...prev, pages: { ...prev.pages, [selectedPage]: { ...pageSeo, title: e.target.value } } } : prev)}
                    style={{ width: "100%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F5F5F5", fontSize: "0.875rem", padding: "10px 12px", outline: "none" }}
                  />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)" }}>Meta Description</label>
                    <span style={{ fontSize: "0.75rem", color: pageSeo.description.length > 160 ? "#E8312A" : pageSeo.description.length >= 80 ? "#34D399" : "#FBBF24" }}>{pageSeo.description.length}/160</span>
                  </div>
                  <textarea
                    value={pageSeo.description}
                    onChange={(e) => setSeo((prev) => prev ? { ...prev, pages: { ...prev.pages, [selectedPage]: { ...pageSeo, description: e.target.value } } } : prev)}
                    rows={3}
                    style={{ width: "100%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F5F5F5", fontSize: "0.875rem", padding: "10px 12px", outline: "none", resize: "vertical" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>OG Image URL</label>
                  <input type="text" value={pageSeo.ogImage} onChange={(e) => setSeo((prev) => prev ? { ...prev, pages: { ...prev.pages, [selectedPage]: { ...pageSeo, ogImage: e.target.value } } } : prev)} style={{ width: "100%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F5F5F5", fontSize: "0.875rem", padding: "10px 12px", outline: "none" }} />
                </div>

                {/* Google preview */}
                {pageSeo.title && (
                  <div style={{ background: "#fff", borderRadius: 8, padding: "16px 18px", marginTop: 8 }}>
                    <div style={{ fontSize: "0.6875rem", color: "#34A853", marginBottom: 2 }}>https://thebrandthink.com{selectedPage}</div>
                    <div style={{ fontSize: "1.125rem", color: "#1a0dab", marginBottom: 4, fontFamily: "Arial, sans-serif" }}>{pageSeo.title || "Page Title"}</div>
                    <div style={{ fontSize: "0.875rem", color: "#545454", lineHeight: 1.5, fontFamily: "Arial, sans-serif" }}>{pageSeo.description || "No description set."}</div>
                  </div>
                )}

                <button onClick={savePageSeo} disabled={saving} style={{ alignSelf: "flex-start", padding: "10px 24px", borderRadius: 8, background: "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)", border: "none", color: "#fff", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer" }}>
                  {saving ? "Saving..." : saved ? "Saved!" : "Save Page SEO"}
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Redirects */}
          {tab === 2 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#F5F5F5" }}>URL Redirects</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem", cursor: "pointer" }}>Import CSV</button>
                  <button style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem", cursor: "pointer" }}>Export CSV</button>
                </div>
              </div>

              {/* Add form */}
              <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
                <h4 style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Add Redirect</h4>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input placeholder="From URL (e.g. /old-page)" value={newRedirect.from} onChange={(e) => setNewRedirect((f) => ({ ...f, from: e.target.value }))} style={{ flex: 1, minWidth: 180, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F5F5F5", fontSize: "0.875rem", padding: "9px 12px", outline: "none" }} />
                  <input placeholder="To URL (e.g. /new-page)" value={newRedirect.to} onChange={(e) => setNewRedirect((f) => ({ ...f, to: e.target.value }))} style={{ flex: 1, minWidth: 180, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F5F5F5", fontSize: "0.875rem", padding: "9px 12px", outline: "none" }} />
                  <select value={newRedirect.type} onChange={(e) => setNewRedirect((f) => ({ ...f, type: e.target.value }))} style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F5F5F5", fontSize: "0.875rem", padding: "9px 12px", outline: "none", cursor: "pointer" }}>
                    <option value="301">301 Permanent</option>
                    <option value="302">302 Temporary</option>
                  </select>
                  <button onClick={addRedirect} style={{ padding: "9px 18px", borderRadius: 8, background: "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)", border: "none", color: "#fff", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer" }}>Add</button>
                </div>
              </div>

              <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      {["From URL", "To URL", "Type", "Status", "Created", "Actions"].map((h) => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.6875rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {redirects.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>No redirects configured.</td></tr>
                    ) : redirects.map((r) => (
                      <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "12px 16px", fontSize: "0.875rem", color: "#F5F5F5", fontFamily: "monospace" }}>{r.from}</td>
                        <td style={{ padding: "12px 16px", fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>{r.to}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: "0.6875rem", fontWeight: 700, background: r.type === "301" ? "rgba(96,165,250,0.12)" : "rgba(251,191,36,0.12)", color: r.type === "301" ? "#60A5FA" : "#FBBF24" }}>{r.type}</span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <button onClick={() => toggleRedirect(r.id, r.active)} style={{ padding: "3px 12px", borderRadius: 99, fontSize: "0.6875rem", fontWeight: 700, background: r.active ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.06)", color: r.active ? "#34D399" : "rgba(255,255,255,0.4)", border: "none", cursor: "pointer" }}>
                            {r.active ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)" }}>
                          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <button onClick={() => deleteRedirect(r.id)} style={{ padding: "5px 12px", borderRadius: 6, background: "rgba(232,49,42,0.08)", border: "1px solid rgba(232,49,42,0.2)", color: "#E8312A", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Schema */}
          {tab === 3 && seo && (
            <div style={{ maxWidth: 720 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#F5F5F5", marginBottom: 20 }}>Structured Data / Schema</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  { label: "Organization Schema JSON-LD", key: "schemaOrg" as const },
                ].map((field) => (
                  <div key={field.key}>
                    <label style={{ display: "block", fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{field.label}</label>
                    <textarea
                      value={seo.global[field.key] || ""}
                      onChange={(e) => setSeo((prev) => prev ? { ...prev, global: { ...prev.global, [field.key]: e.target.value } } : prev)}
                      rows={10}
                      style={{ width: "100%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F5F5F5", fontSize: "0.8125rem", padding: "12px 14px", outline: "none", resize: "vertical", fontFamily: "monospace" }}
                    />
                  </div>
                ))}
                <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "18px 20px" }}>
                  <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>Article Schema Template</h4>
                  <pre style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "12px", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", overflow: "auto", fontFamily: "monospace" }}>
{`{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{title}}",
  "author": { "@type": "Person", "name": "{{author}}" },
  "datePublished": "{{publishedAt}}",
  "publisher": { "@type": "Organization", "name": "BrandThink" }
}`}
                  </pre>
                </div>
                <button onClick={saveGlobal} disabled={saving} style={{ alignSelf: "flex-start", padding: "10px 24px", borderRadius: 8, background: "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)", border: "none", color: "#fff", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer" }}>
                  {saving ? "Saving..." : saved ? "Saved!" : "Save Schema"}
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Technical */}
          {tab === 4 && seo && (
            <div style={{ maxWidth: 720 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#F5F5F5", marginBottom: 20 }}>Technical SEO</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>robots.txt</label>
                  <textarea
                    value={seo.global.robotsTxt || ""}
                    onChange={(e) => setSeo((prev) => prev ? { ...prev, global: { ...prev.global, robotsTxt: e.target.value } } : prev)}
                    rows={8}
                    style={{ width: "100%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F5F5F5", fontSize: "0.8125rem", padding: "12px 14px", outline: "none", resize: "vertical", fontFamily: "monospace" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>noindex Pages</label>
                  {PAGES.map((p) => (
                    <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <input type="checkbox" checked={!!noindexPages[p]} onChange={(e) => setNoindexPages((prev) => ({ ...prev, [p]: e.target.checked }))} style={{ cursor: "pointer", width: 16, height: 16 }} />
                      <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>{p}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "20px" }}>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F5F5F5", marginBottom: 16 }}>Core Web Vitals (Mock)</h4>
                  {[
                    { label: "LCP (Largest Contentful Paint)", value: "2.1s", status: "Good", color: "#34D399" },
                    { label: "FID (First Input Delay)", value: "18ms", status: "Good", color: "#34D399" },
                    { label: "CLS (Cumulative Layout Shift)", value: "0.05", status: "Good", color: "#34D399" },
                  ].map((metric) => (
                    <div key={metric.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)" }}>{metric.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F5F5F5" }}>{metric.value}</span>
                        <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: "0.6875rem", fontWeight: 700, background: `${metric.color}15`, color: metric.color }}>{metric.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {[
                    { label: "HTTPS Redirect", enabled: true },
                    { label: "WWW Redirect", enabled: false },
                  ].map((toggle) => (
                    <div key={toggle.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
                      <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)" }}>{toggle.label}</span>
                      <div style={{ width: 36, height: 20, borderRadius: 10, background: toggle.enabled ? "#34D399" : "rgba(255,255,255,0.12)", position: "relative", cursor: "pointer" }}>
                        <div style={{ position: "absolute", top: 2, left: toggle.enabled ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={saveGlobal} disabled={saving} style={{ alignSelf: "flex-start", padding: "10px 24px", borderRadius: 8, background: "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)", border: "none", color: "#fff", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer" }}>
                  {saving ? "Saving..." : saved ? "Saved!" : "Save Technical Settings"}
                </button>
              </div>
            </div>
          )}

          {/* Tab 5: Sitemap */}
          {tab === 5 && (
            <div style={{ maxWidth: 720 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#F5F5F5" }}>Sitemap</h3>
                <button style={{ padding: "9px 18px", borderRadius: 8, background: "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)", border: "none", color: "#fff", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer" }}>
                  Regenerate Sitemap
                </button>
              </div>
              <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "20px 20px", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Sitemap URL</div>
                    <a href="https://thebrandthink.com/sitemap.xml" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.875rem", color: "#60A5FA", textDecoration: "underline" }}>https://thebrandthink.com/sitemap.xml</a>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Last Generated</div>
                    <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)" }}>{new Date(lastGenerated).toLocaleString("en-IN")}</div>
                  </div>
                </div>
              </div>
              <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      {["URL", "Priority", "Change Freq"].map((h) => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.6875rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sitemapUrls.map((url) => (
                      <tr key={url} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "10px 16px", fontSize: "0.875rem", color: "#F5F5F5", fontFamily: "monospace" }}>https://thebrandthink.com{url}</td>
                        <td style={{ padding: "10px 16px", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)" }}>{url === "/" ? "1.0" : "0.8"}</td>
                        <td style={{ padding: "10px 16px", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)" }}>{url === "/" ? "daily" : "weekly"}</td>
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
