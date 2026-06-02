"use client";
import { useEffect, useState, useRef } from "react";
import AdminHeader from "@/components/admin/AdminHeader";

interface AdminUser { id: string; name: string; email: string; role: string; avatar: string; }

interface Page {
  id: string;
  title: string;
  slug: string;
  parentId?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  noindex?: boolean;
  ogImage?: string;
  status: "published" | "draft";
  isBuiltIn?: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ── SEO Score ──────────────────────────────────────────────────────── */
function seoScore(page: Page): number {
  let score = 0;
  const mt = (page.metaTitle || "").length;
  const md = (page.metaDescription || "").length;
  if (mt >= 30 && mt <= 60) score += 50; else if (mt > 0) score += 20;
  if (md >= 80 && md <= 160) score += 50; else if (md > 0) score += 20;
  return score;
}

function ScorePill({ score }: { score: number }) {
  const color = score >= 80 ? "#34D399" : score >= 40 ? "#FBBF24" : "var(--adm-muted2)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 99, fontSize: "0.6875rem", fontWeight: 700, background: `${color}18`, color, border: `1px solid ${color}30`, whiteSpace: "nowrap" }}>
      {score === 0 ? "No SEO" : `${score}/100`}
    </span>
  );
}

/* ── Tree builder ───────────────────────────────────────────────────── */
function buildTree(pages: Page[], parentId: string | null = null, depth = 0): Array<Page & { depth: number }> {
  return pages
    .filter((p) => (p.parentId ?? null) === parentId)
    .flatMap((p) => [
      { ...p, depth },
      ...buildTree(pages, p.id, depth + 1),
    ]);
}

/* ── Styles ─────────────────────────────────────────────────────────── */
const S = {
  input: {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    background: "var(--adm-card2)", border: "1px solid var(--adm-border2)",
    color: "var(--adm-text)", fontSize: "0.875rem", outline: "none", fontFamily: "inherit",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  label: {
    display: "block" as const, fontSize: "0.75rem", fontWeight: 700 as const,
    color: "var(--adm-muted2)", marginBottom: 5,
  } as React.CSSProperties,
};

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("bt_admin_token") || "" : "";
}

/* ── Progress bar ───────────────────────────────────────────────────── */
function CharBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const ok  = value <= max;
  return (
    <div style={{ height: 3, background: "var(--adm-border)", borderRadius: 99, marginTop: 4, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: ok ? "#34D399" : "#E8312A", borderRadius: 99, transition: "width 0.2s" }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Main page
══════════════════════════════════════════════════════════════════════ */
export default function AdminPagesPage() {
  const [user, setUser]       = useState<AdminUser | null>(null);
  const [pages, setPages]     = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState<"edit" | "add" | null>(null);
  const [editTarget, setEditTarget] = useState<Page | null>(null);
  const [toast, setToast]     = useState("");
  const [saving, setSaving]   = useState(false);
  const toastRef              = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* form state */
  const [fTitle,    setFTitle]    = useState("");
  const [fSlug,     setFSlug]     = useState("");
  const [fParent,   setFParent]   = useState<string>("");
  const [fStatus,   setFStatus]   = useState<"published" | "draft">("published");
  const [fMetaT,    setFMetaT]    = useState("");
  const [fMetaD,    setFMetaD]    = useState("");
  const [fOgImage,  setFOgImage]  = useState("");
  const [fNoindex,  setFNoindex]  = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(""), 3000);
  }

  async function loadPages() {
    try {
      const res  = await fetch("/api/admin/pages", { headers: { "x-admin-token": token() } });
      const data = await res.json();
      setPages(data.pages || []);
    } catch { /* silent */ }
    setLoading(false);
  }

  useEffect(() => {
    const stored = localStorage.getItem("bt_admin_user");
    if (stored) setUser(JSON.parse(stored));
    loadPages();
  }, []);

  /* populate form */
  function openEdit(page: Page) {
    setFTitle(page.title);
    setFSlug(page.slug);
    setFParent(page.parentId || "");
    setFStatus(page.status);
    setFMetaT(page.metaTitle || "");
    setFMetaD(page.metaDescription || "");
    setFOgImage(page.ogImage || "");
    setFNoindex(page.noindex || false);
    setEditTarget(page);
    setModal("edit");
  }

  function openAdd() {
    setFTitle(""); setFSlug("/"); setFParent(""); setFStatus("published");
    setFMetaT(""); setFMetaD(""); setFOgImage(""); setFNoindex(false);
    setEditTarget(null);
    setModal("add");
  }

  function closeModal() { setModal(null); setEditTarget(null); }

  async function handleSave() {
    if (!fTitle.trim() || !fSlug.trim()) return;
    setSaving(true);
    const payload = {
      ...(editTarget ? { id: editTarget.id } : {}),
      title: fTitle, slug: fSlug, parentId: fParent || null,
      status: fStatus, metaTitle: fMetaT, metaDescription: fMetaD,
      ogImage: fOgImage, noindex: fNoindex,
    };
    await fetch("/api/admin/pages", {
      method: editTarget ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": token() },
      body: JSON.stringify(payload),
    });
    await loadPages();
    closeModal();
    showToast(editTarget ? "Page updated" : "Page created");
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this page? This action cannot be undone.")) return;
    await fetch(`/api/admin/pages?id=${id}`, { method: "DELETE", headers: { "x-admin-token": token() } });
    await loadPages();
    showToast("Page deleted");
  }

  /* Auto-generate slug from title for new pages */
  function handleTitleChange(v: string) {
    setFTitle(v);
    if (!editTarget) {
      const base = "/" + v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      setFSlug(base || "/");
    }
  }

  const tree = buildTree(pages);

  return (
    <>
      <AdminHeader title="Pages" user={user} />

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999, background: "var(--adm-card)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 10, padding: "12px 20px", color: "#34D399", fontSize: "0.875rem", fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          ✓ {toast}
        </div>
      )}

      <main className="adm-page-main" style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

        {/* Header bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--adm-text)", letterSpacing: "-0.03em", marginBottom: 4 }}>
              Pages
            </h1>
            <p style={{ fontSize: "0.8125rem", color: "var(--adm-muted)" }}>
              Manage website pages, URL slugs, and per-page SEO metadata
            </p>
          </div>
          <button
            onClick={openAdd}
            style={{ padding: "9px 18px", background: "var(--adm-text)", border: "none", color: "var(--adm-bg)", borderRadius: 8, cursor: "pointer", fontSize: "0.8125rem", fontWeight: 700, whiteSpace: "nowrap" }}
          >
            + Add Page
          </button>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 20, marginBottom: 16, fontSize: "0.75rem", color: "var(--adm-muted)" }}>
          <span>└─ Indented rows are child pages</span>
          <span style={{ color: "#34D399" }}>●</span><span style={{ color: "var(--adm-muted)", marginLeft: -16 }}>80–100 Good SEO</span>
          <span style={{ color: "#FBBF24" }}>●</span><span style={{ color: "var(--adm-muted)", marginLeft: -16 }}>40–79 Needs work</span>
          <span style={{ color: "var(--adm-muted2)" }}>●</span><span style={{ color: "var(--adm-muted)", marginLeft: -16 }}>0–39 Missing</span>
        </div>

        {/* Pages table */}
        <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--adm-border)" }}>
                  {["Page Title", "URL Slug", "Status", "SEO Score", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "var(--adm-muted)" }}>Loading…</td></tr>
                ) : tree.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "var(--adm-muted)" }}>No pages yet.</td></tr>
                ) : tree.map((page) => (
                  <tr
                    key={page.id}
                    style={{ borderBottom: "1px solid var(--adm-border)", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--adm-card2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Title with tree indent */}
                    <td style={{ padding: "11px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {page.depth > 0 && (
                          <span style={{ flexShrink: 0, paddingLeft: page.depth * 14, color: "var(--adm-border2)", fontSize: "0.75rem", userSelect: "none" }}>└─</span>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: "0.875rem", fontWeight: page.depth === 0 ? 600 : 400, color: "var(--adm-text)" }}>
                            {page.title}
                          </span>
                          {page.isBuiltIn && (
                            <span style={{ marginLeft: 8, fontSize: "0.5625rem", fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: "var(--adm-card2)", color: "var(--adm-muted)", border: "1px solid var(--adm-border2)", textTransform: "uppercase", letterSpacing: "0.06em", verticalAlign: "middle" }}>
                              Built-in
                            </span>
                          )}
                          {page.noindex && (
                            <span style={{ marginLeft: 6, fontSize: "0.5625rem", fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: "rgba(251,191,36,0.1)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.25)", textTransform: "uppercase", letterSpacing: "0.06em", verticalAlign: "middle" }}>
                              noindex
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td style={{ padding: "11px 16px" }}>
                      <code style={{ fontSize: "0.75rem", color: "var(--adm-muted2)", background: "var(--adm-card2)", padding: "2px 7px", borderRadius: 4, fontFamily: "monospace" }}>
                        {page.slug}
                      </code>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: "0.6875rem", fontWeight: 700, background: page.status === "published" ? "rgba(52,211,153,0.1)" : "var(--adm-card2)", color: page.status === "published" ? "#34D399" : "var(--adm-muted)", textTransform: "capitalize" }}>
                        {page.status}
                      </span>
                    </td>

                    {/* SEO score */}
                    <td style={{ padding: "11px 16px" }}>
                      <ScorePill score={seoScore(page)} />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "11px 16px" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "nowrap" }}>
                        <button
                          onClick={() => openEdit(page)}
                          style={{ padding: "5px 12px", borderRadius: 6, background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", color: "var(--adm-text)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                        >
                          Edit SEO
                        </button>
                        <a
                          href={page.slug}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ padding: "5px 12px", borderRadius: 6, background: "transparent", border: "1px solid var(--adm-border2)", color: "var(--adm-muted2)", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}
                        >
                          View
                        </a>
                        {!page.isBuiltIn && (
                          <button
                            onClick={() => handleDelete(page.id)}
                            style={{ padding: "5px 10px", borderRadius: 6, background: "transparent", border: "1px solid var(--adm-border2)", color: "var(--adm-muted)", fontSize: "0.75rem", cursor: "pointer" }}
                            title="Delete page"
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info note */}
        <p style={{ marginTop: 16, fontSize: "0.75rem", color: "var(--adm-muted)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--adm-muted2)" }}>Built-in pages</strong> match your Next.js route files and cannot be deleted. Edit their SEO metadata here — changes apply to search engine results. Add custom pages for landing pages, redirects, or upcoming sections.
        </p>

      </main>

      {/* ═══════════ Edit / Add Modal ═══════════ */}
      {modal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 1000, padding: "32px 20px", overflowY: "auto" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border2)", borderRadius: 16, width: "100%", maxWidth: 680 }}>

            {/* Modal header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--adm-border)" }}>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--adm-text)" }}>
                  {modal === "edit" ? `Edit — ${editTarget?.title}` : "Add New Page"}
                </h2>
                {modal === "edit" && (
                  <p style={{ fontSize: "0.75rem", color: "var(--adm-muted)", marginTop: 2 }}>
                    Update the SEO metadata, slug, and visibility for this page
                  </p>
                )}
              </div>
              <button onClick={closeModal} style={{ background: "none", border: "none", color: "var(--adm-muted)", cursor: "pointer", fontSize: "1.125rem", lineHeight: 1 }}>✕</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Title + Slug */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={S.label}>Page Title *</label>
                  <input value={fTitle} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g. About Us" style={S.input} />
                </div>
                <div>
                  <label style={S.label}>URL Slug *</label>
                  <input value={fSlug} onChange={(e) => setFSlug(e.target.value)} placeholder="/about-us" style={S.input} />
                  <p style={{ fontSize: "0.625rem", color: "var(--adm-muted)", marginTop: 3 }}>Must start with /</p>
                </div>
              </div>

              {/* Parent + Status */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={S.label}>Parent Page</label>
                  <select
                    value={fParent}
                    onChange={(e) => setFParent(e.target.value)}
                    style={{ ...S.input, cursor: "pointer" }}
                  >
                    <option value="">— Top-level (no parent) —</option>
                    {pages
                      .filter((p) => !p.parentId && p.id !== editTarget?.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>{p.title} ({p.slug})</option>
                      ))
                    }
                  </select>
                </div>
                <div>
                  <label style={S.label}>Status</label>
                  <select value={fStatus} onChange={(e) => setFStatus(e.target.value as "published" | "draft")} style={{ ...S.input, cursor: "pointer" }}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Meta Title */}
              <div>
                <label style={S.label}>
                  Meta Title
                  <span style={{ fontWeight: 400, marginLeft: 6, opacity: 0.6 }}>
                    ({fMetaT.length}/60 chars{fMetaT.length >= 30 && fMetaT.length <= 60 ? " ✓" : ""})
                  </span>
                </label>
                <input value={fMetaT} onChange={(e) => setFMetaT(e.target.value)} placeholder="Optimal: 30–60 characters for Google…" style={S.input} maxLength={80} />
                <CharBar value={fMetaT.length} max={60} />
              </div>

              {/* Meta Description */}
              <div>
                <label style={S.label}>
                  Meta Description
                  <span style={{ fontWeight: 400, marginLeft: 6, opacity: 0.6 }}>
                    ({fMetaD.length}/160 chars{fMetaD.length >= 80 && fMetaD.length <= 160 ? " ✓" : ""})
                  </span>
                </label>
                <textarea value={fMetaD} onChange={(e) => setFMetaD(e.target.value)} placeholder="Optimal: 80–160 characters. Appears in Google search results…" rows={3} maxLength={200} style={{ ...S.input, resize: "vertical" }} />
                <CharBar value={fMetaD.length} max={160} />
              </div>

              {/* OG Image */}
              <div>
                <label style={S.label}>OG Image URL</label>
                <input value={fOgImage} onChange={(e) => setFOgImage(e.target.value)} placeholder="https://thebrandthink.com/og/page.jpg" style={S.input} />
                <p style={{ fontSize: "0.625rem", color: "var(--adm-muted)", marginTop: 3 }}>Shown when page is shared on social media. Recommended: 1200×630px</p>
              </div>

              {/* Noindex */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 8 }}>
                <input type="checkbox" id="pg-noindex" checked={fNoindex} onChange={(e) => setFNoindex(e.target.checked)} style={{ cursor: "pointer", width: 14, height: 14 }} />
                <label htmlFor="pg-noindex" style={{ fontSize: "0.8125rem", color: "var(--adm-muted2)", cursor: "pointer" }}>
                  <strong style={{ color: "var(--adm-text)" }}>No Index</strong> — hide this page from search engine results
                </label>
              </div>

              {/* SERP Preview */}
              {(fMetaT || fMetaD) && (
                <div style={{ padding: 14, background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 8 }}>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Google Preview</p>
                  <div style={{ fontSize: "0.75rem", color: "var(--adm-muted)", marginBottom: 2 }}>thebrandthink.com{fSlug}</div>
                  <div style={{ fontSize: "1rem", fontWeight: 600, color: "#4A90D9", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {fMetaT || fTitle || "Page Title"}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--adm-muted2)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {fMetaD || "Add a meta description to show a preview here…"}
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "16px 24px", borderTop: "1px solid var(--adm-border)" }}>
              <button onClick={closeModal} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid var(--adm-border2)", background: "transparent", color: "var(--adm-muted2)", cursor: "pointer", fontSize: "0.875rem" }}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !fTitle.trim() || !fSlug.trim()}
                style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: (saving || !fTitle.trim() || !fSlug.trim()) ? "var(--adm-card)" : "var(--adm-text)", color: (saving || !fTitle.trim() || !fSlug.trim()) ? "var(--adm-muted)" : "var(--adm-bg)", cursor: saving ? "not-allowed" : "pointer", fontSize: "0.875rem", fontWeight: 600 }}
              >
                {saving ? "Saving…" : modal === "edit" ? "Save Changes" : "Create Page"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
