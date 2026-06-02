"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface CheckItem {
  label: string;
  pass: boolean;
  tip: string;
}

const CATEGORIES = [
  "Performance Marketing", "Brand Strategy", "Creative Studio",
  "Media Distribution", "Conversion & CRO", "AI & MarTech", "Case Studies",
  "Growth Insights", "Industry Trends", "D2C Growth", "Startup Marketing", "Analytics & Data",
];

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function countWords(html: string) {
  return html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
}

function calcSeoScore(form: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string;
  coverImage: string;
  readTime: string;
  seo: { metaTitle: string; metaDesc: string; ogImage: string };
}): { score: number; items: CheckItem[] } {
  const words = countWords(form.content);
  const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
  const hasH2orH3 = /<h[23]/i.test(form.content);
  const slugOk = /^[a-z0-9-]+$/.test(form.slug) && form.slug.length > 0;

  const items: CheckItem[] = [
    {
      label: "Meta title present & ≤60 chars",
      pass: form.seo.metaTitle.length > 0 && form.seo.metaTitle.length <= 60,
      tip: "Add a meta title under 60 characters for best search display.",
    },
    {
      label: "Meta description present & ≤160 chars",
      pass: form.seo.metaDesc.length > 0 && form.seo.metaDesc.length <= 160,
      tip: "Write a meta description under 160 characters summarising the post.",
    },
    {
      label: "Excerpt present (>20 chars)",
      pass: form.excerpt.trim().length > 20,
      tip: "Add a meaningful excerpt of at least 20 characters.",
    },
    {
      label: "Cover image URL set",
      pass: form.coverImage.trim().length > 0,
      tip: "Set a cover image for social sharing and visual appeal.",
    },
    {
      label: "At least 2 tags added",
      pass: tags.length >= 2,
      tip: "Add at least 2 relevant tags to improve discoverability.",
    },
    {
      label: "Content word count ≥300",
      pass: words >= 300,
      tip: `Current word count is ${words}. Aim for at least 300 words.`,
    },
    {
      label: "Content contains H2 or H3 heading",
      pass: hasH2orH3,
      tip: "Use H2 or H3 headings to structure content for readers and search engines.",
    },
    {
      label: "Slug is URL-friendly",
      pass: slugOk,
      tip: "Slug must be lowercase, contain only letters, numbers, and hyphens.",
    },
    {
      label: "Title length 40–70 characters",
      pass: form.title.length >= 40 && form.title.length <= 70,
      tip: `Title is ${form.title.length} chars. Ideal range is 40–70 characters.`,
    },
    {
      label: "Read time is set",
      pass: form.readTime.trim().length > 0,
      tip: "Set an estimated read time (e.g. '5 min read').",
    },
  ];

  const score = items.filter((i) => i.pass).length * 10;
  return { score, items };
}

function scoreColor(score: number) {
  if (score >= 70) return "#34D399";
  if (score >= 40) return "#FBBF24";
  return "#F87171";
}

function insertTag(
  textarea: HTMLTextAreaElement,
  openTag: string,
  closeTag: string,
  currentValue: string,
  onChange: (val: string) => void
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = currentValue.slice(start, end);
  const newValue =
    currentValue.slice(0, start) + openTag + selected + closeTag + currentValue.slice(end);
  onChange(newValue);
  setTimeout(() => {
    textarea.focus();
    const cursor = start + openTag.length + selected.length + closeTag.length;
    textarea.setSelectionRange(cursor, cursor);
  }, 0);
}

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: CATEGORIES[0],
    tags: "",
    coverImage: "",
    status: "draft",
    featured: false,
    readTime: "5 min",
    seo: { metaTitle: "", metaDesc: "", ogImage: "" },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [seoOpen, setSeoOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiSeed, setAiSeed] = useState(0);
  const autoSlug = useRef(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("bt_admin_user");
    if (stored) setUser(JSON.parse(stored));

    const token = localStorage.getItem("bt_admin_token") || "";
    fetch(`/api/posts/${id}`, { headers: { "x-admin-token": token } })
      .then((r) => r.json())
      .then((d) => {
        if (d.post) {
          const p = d.post;
          setForm({
            title: p.title || "",
            slug: p.slug || "",
            excerpt: p.excerpt || "",
            content: p.content || "",
            category: p.category || CATEGORIES[0],
            tags: Array.isArray(p.tags) ? p.tags.join(", ") : (p.tags || ""),
            coverImage: p.coverImage || "",
            status: p.status || "draft",
            featured: p.featured || false,
            readTime: p.readTime || "5 min",
            seo: p.seo || { metaTitle: "", metaDesc: "", ogImage: "" },
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  function handleTitleChange(title: string) {
    setForm((f) => ({
      ...f,
      title,
      slug: autoSlug.current ? slugify(title) : f.slug,
    }));
  }

  async function handleSave(status?: string) {
    setSaving(true);
    setError("");
    const token = localStorage.getItem("bt_admin_token") || "";
    const payload = {
      ...form,
      status: status || form.status,
      tags: form.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
    };
    const res = await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (status === "published") router.push("/admin/posts");
    } else {
      setError(data.error || "Save failed.");
    }
  }

  const wordCount = countWords(form.content);
  const { score: seoScore, items: seoItems } = calcSeoScore(form);
  const seoColor = scoreColor(seoScore);

  // GEO checks
  const geoChecks = [
    { label: "Structured headings (H2/H3) used", pass: /<h[23]/i.test(form.content) },
    { label: "Content length >500 words", pass: wordCount > 500 },
    {
      label: "Meta description answers a question or benefit",
      pass: /\?|how|why|best|top|guide|tips|proven|increase|improve|grow|save|boost/i.test(form.seo.metaDesc),
    },
    {
      label: "Title is specific (>4 words)",
      pass: form.title.trim().split(/\s+/).length > 4,
    },
    { label: "Excerpt acts as TL;DR (>50 chars)", pass: form.excerpt.trim().length > 50 },
  ];
  const geoScore = geoChecks.filter((g) => g.pass).length;

  // AI title & tag suggestions
  const titleWords = form.title.trim().split(/\s+/);
  const first4 = titleWords.slice(0, 4).join(" ");
  const randomN = ((aiSeed % 5) + 5);
  const aiTitles = form.title.trim()
    ? [
        (form.title.trim().toLowerCase().startsWith("how") ? "The Ultimate Guide to " : "How to ") + form.title,
        "The Complete Guide to " + form.title,
        "Why " + first4 + " Matters for Your Brand",
        `${randomN} Proven Ways to ` + form.title,
      ]
    : [];
  const aiTagSuggestions = titleWords.slice(0, 5).filter((w) => w.length > 2);

  // Toolbar helpers
  function tb(openTag: string, closeTag: string) {
    if (!contentRef.current) return;
    insertTag(contentRef.current, openTag, closeTag, form.content, (val) =>
      setForm((f) => ({ ...f, content: val }))
    );
  }

  function tbLink() {
    const url = prompt("Enter URL:");
    if (!url || !contentRef.current) return;
    const ta = contentRef.current;
    const sel = form.content.slice(ta.selectionStart, ta.selectionEnd) || "link text";
    insertTag(ta, `<a href="${url}">`, `</a>`, form.content, (val) =>
      setForm((f) => ({ ...f, content: val }))
    );
  }

  function tbImage() {
    const url = prompt("Image URL:");
    if (!url || !contentRef.current) return;
    const alt = prompt("Alt text:") || "";
    const tag = `<img src="${url}" alt="${alt}" style="max-width:100%;border-radius:8px;margin:16px 0;" />`;
    const ta = contentRef.current;
    const start = ta.selectionStart;
    const newVal = form.content.slice(0, start) + tag + form.content.slice(start);
    setForm((f) => ({ ...f, content: newVal }));
  }

  const tbBtnStyle: React.CSSProperties = {
    width: 30,
    height: 30,
    borderRadius: 6,
    background: "transparent",
    border: "none",
    color: "var(--adm-muted2)",
    cursor: "pointer",
    fontSize: "0.8125rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const metaTitleLen = form.seo.metaTitle.length;
  const metaDescLen = form.seo.metaDesc.length;

  function metaTitleBarColor() {
    if (metaTitleLen === 0) return "var(--adm-border2)";
    if (metaTitleLen <= 60) return metaTitleLen >= 40 ? "#34D399" : "#FBBF24";
    return "#F87171";
  }

  function metaDescBarColor() {
    if (metaDescLen === 0) return "var(--adm-border2)";
    if (metaDescLen <= 160) return metaDescLen >= 80 ? "#34D399" : "#FBBF24";
    return "#F87171";
  }

  if (loading) {
    return (
      <>
        <AdminHeader title="Edit Post" user={user} />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--adm-muted)" }}>Loading...</main>
      </>
    );
  }

  return (
    <>
      <AdminHeader title={`Edit: ${form.title || "Post"}`} user={user} />
      <main className="adm-page-main" style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
        {error && (
          <div style={{ padding: "10px 16px", background: "rgba(232,49,42,0.1)", border: "1px solid rgba(232,49,42,0.25)", borderRadius: 8, color: "#FF6B5B", fontSize: "0.875rem", marginBottom: 16 }}>{error}</div>
        )}

        {/* Sticky action bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
          padding: "10px 16px",
          background: "var(--adm-card)",
          border: "1px solid var(--adm-border)",
          borderRadius: 12,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}>
          {/* Word count chip */}
          <span style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            padding: "4px 12px",
            borderRadius: 99,
            background: "var(--adm-card2)",
            border: "1px solid var(--adm-border2)",
            color: "var(--adm-muted2)",
          }}>
            {wordCount} words
          </span>
          {/* Right actions */}
          <div className="adm-action-bar" style={{ gap: 8, alignItems: "center" }}>
            <button
              onClick={() => setPreviewMode((v) => !v)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: previewMode ? "var(--adm-card2)" : "transparent",
                border: `1px solid ${previewMode ? "var(--adm-border)" : "var(--adm-border2)"}`,
                color: previewMode ? "var(--adm-text)" : "var(--adm-muted2)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {previewMode ? "◀ Editor" : "Preview Draft"}
            </button>
            <button
              onClick={() => handleSave()}
              disabled={saving}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                background: "var(--adm-card2)",
                border: "1px solid var(--adm-border2)",
                color: "var(--adm-muted2)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving…" : "Save Draft"}
            </button>
            <button
              onClick={() => handleSave("published")}
              disabled={saving}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                background: "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)",
                border: "none",
                color: "#fff",
                fontSize: "0.8125rem",
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "…" : "Publish"}
            </button>
            {saved && <span style={{ fontSize: "0.75rem", color: "#34D399" }}>Saved!</span>}
          </div>
        </div>

        <div className="adm-post-layout">
          {/* ── Left column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Title + Slug */}
            <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 12, padding: "20px 20px" }}>
              <input
                type="text"
                placeholder="Post Title"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                style={{ width: "100%", background: "transparent", border: "none", color: "var(--adm-text)", fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em", outline: "none" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                <span style={{ fontSize: "0.75rem", color: "var(--adm-muted)" }}>Slug:</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  style={{ flex: 1, background: "var(--adm-input)", border: "1px solid var(--adm-border2)", borderRadius: 6, padding: "4px 10px", color: "var(--adm-muted2)", fontSize: "0.8125rem", outline: "none", fontFamily: "monospace" }}
                />
              </div>
            </div>

            {/* Excerpt */}
            <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 12, padding: "16px 20px" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Excerpt</label>
              <textarea
                placeholder="2-3 sentence summary..."
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                rows={3}
                style={{ width: "100%", background: "transparent", border: "none", color: "var(--adm-muted2)", fontSize: "0.9375rem", lineHeight: 1.7, outline: "none", resize: "vertical" }}
              />
            </div>

            {/* Meta SEO box */}
            <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 12, padding: "18px 18px" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Meta SEO</label>
              <div className="adm-meta-grid">
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--adm-muted)", marginBottom: 6 }}>
                    Meta Title ({metaTitleLen}/60)
                  </label>
                  <input
                    type="text"
                    value={form.seo.metaTitle}
                    onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, metaTitle: e.target.value } }))}
                    style={{ width: "100%", background: "var(--adm-input)", border: "1px solid var(--adm-border2)", borderRadius: 8, color: "var(--adm-text)", fontSize: "0.8125rem", padding: "8px 10px", outline: "none" }}
                  />
                  <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: "var(--adm-border2)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min((metaTitleLen / 60) * 100, 100)}%`,
                      background: metaTitleBarColor(),
                      borderRadius: 2,
                      transition: "width 0.2s, background 0.2s",
                    }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--adm-muted)", marginBottom: 6 }}>
                    Meta Description ({metaDescLen}/160)
                  </label>
                  <input
                    type="text"
                    value={form.seo.metaDesc}
                    onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, metaDesc: e.target.value } }))}
                    style={{ width: "100%", background: "var(--adm-input)", border: "1px solid var(--adm-border2)", borderRadius: 8, color: "var(--adm-text)", fontSize: "0.8125rem", padding: "8px 10px", outline: "none" }}
                  />
                  <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: "var(--adm-border2)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min((metaDescLen / 160) * 100, 100)}%`,
                      background: metaDescBarColor(),
                      borderRadius: 2,
                      transition: "width 0.2s, background 0.2s",
                    }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Rich-text editor */}
            <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <label style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Content (HTML)</label>
                <span style={{ fontSize: "0.6875rem", color: "var(--adm-muted)" }}>{wordCount} words</span>
              </div>

              {/* Toolbar */}
              {!previewMode && (
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  padding: "6px 8px",
                  background: "var(--adm-card2)",
                  border: "1px solid var(--adm-border)",
                  borderRadius: "8px 8px 0 0",
                  marginBottom: 0,
                }}>
                  {[
                    { label: "H1", open: "<h1>", close: "</h1>" },
                    { label: "H2", open: "<h2>", close: "</h2>" },
                    { label: "H3", open: "<h3>", close: "</h3>" },
                    { label: "H4", open: "<h4>", close: "</h4>" },
                    { label: "P", open: "<p>", close: "</p>" },
                  ].map((btn) => (
                    <button key={btn.label} onClick={() => tb(btn.open, btn.close)} style={tbBtnStyle} title={btn.label}>{btn.label}</button>
                  ))}
                  <span style={{ width: 1, height: 20, background: "var(--adm-border)", margin: "5px 4px", alignSelf: "center" }} />
                  <button onClick={() => tb("<strong>", "</strong>")} style={{ ...tbBtnStyle, fontWeight: 900 }} title="Bold">B</button>
                  <button onClick={() => tb("<em>", "</em>")} style={{ ...tbBtnStyle, fontStyle: "italic" }} title="Italic">I</button>
                  <button onClick={() => tb("<blockquote>", "</blockquote>")} style={tbBtnStyle} title="Blockquote">"</button>
                  <span style={{ width: 1, height: 20, background: "var(--adm-border)", margin: "5px 4px", alignSelf: "center" }} />
                  <button onClick={tbLink} style={tbBtnStyle} title="Link">🔗</button>
                  <button onClick={tbImage} style={tbBtnStyle} title="Image">🖼</button>
                  <span style={{ width: 1, height: 20, background: "var(--adm-border)", margin: "5px 4px", alignSelf: "center" }} />
                  <button onClick={() => tb("<ul>\n  <li>", "</li>\n</ul>")} style={tbBtnStyle} title="Bullet List">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
                  </button>
                  <button onClick={() => tb("<ol>\n  <li>", "</li>\n</ol>")} style={tbBtnStyle} title="Numbered List">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
                  </button>
                  <button
                    onClick={() => {
                      if (!contentRef.current) return;
                      const ta = contentRef.current;
                      const start = ta.selectionStart;
                      const hr = "\n<hr />\n";
                      const newVal = form.content.slice(0, start) + hr + form.content.slice(start);
                      setForm((f) => ({ ...f, content: newVal }));
                    }}
                    style={tbBtnStyle}
                    title="Horizontal Rule"
                  >—</button>
                </div>
              )}

              {previewMode ? (
                <div
                  dangerouslySetInnerHTML={{ __html: form.content || "<p style='color:var(--adm-muted);'>Nothing to preview yet.</p>" }}
                  style={{
                    minHeight: 400,
                    padding: "16px 18px",
                    background: "var(--adm-input)",
                    border: "1px solid var(--adm-border)",
                    borderRadius: 8,
                    color: "var(--adm-text)",
                    fontSize: "0.9375rem",
                    lineHeight: 1.8,
                    overflowY: "auto",
                  }}
                />
              ) : (
                <textarea
                  ref={contentRef}
                  placeholder="<h2>Heading</h2><p>Content...</p>"
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={22}
                  style={{
                    width: "100%",
                    background: "var(--adm-input)",
                    border: "1px solid var(--adm-border)",
                    borderTop: "none",
                    borderRadius: "0 0 8px 8px",
                    padding: "12px 14px",
                    color: "var(--adm-muted2)",
                    fontSize: "0.875rem",
                    lineHeight: 1.7,
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "monospace",
                  }}
                />
              )}
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="adm-post-sidebar" style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 72, maxHeight: "calc(100vh - 96px)", overflowY: "auto", paddingRight: 2 }}>

            {/* Publish card */}
            <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 12, padding: "18px 18px" }}>
              <h4 style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Publish</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.8125rem", color: "var(--adm-muted2)" }}>Status</span>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} style={{ background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", borderRadius: 6, color: "var(--adm-text)", fontSize: "0.8125rem", padding: "4px 8px", outline: "none", cursor: "pointer" }}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.8125rem", color: "var(--adm-muted2)" }}>Featured</span>
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} style={{ cursor: "pointer", width: 16, height: 16 }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.8125rem", color: "var(--adm-muted2)" }}>Read Time</span>
                  <input type="text" value={form.readTime} onChange={(e) => setForm((f) => ({ ...f, readTime: e.target.value }))} style={{ width: 80, background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", borderRadius: 6, color: "var(--adm-text)", fontSize: "0.8125rem", padding: "4px 8px", outline: "none", textAlign: "right" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => handleSave()} disabled={saving} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", color: "var(--adm-muted2)", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}>
                  {saving ? "…" : "Save Draft"}
                </button>
                <button onClick={() => handleSave("published")} disabled={saving} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)", border: "none", color: "#fff", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer" }}>
                  {saving ? "…" : "Publish"}
                </button>
              </div>
              {saved && <div style={{ marginTop: 10, fontSize: "0.75rem", color: "#34D399", textAlign: "center" }}>Saved!</div>}
            </div>

            {/* SEO & GEO Score card */}
            <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 12, padding: "18px 18px" }}>
              <button
                onClick={() => setSeoOpen((v) => !v)}
                style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <h4 style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>SEO & GEO Score</h4>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Score badge */}
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    border: `3px solid ${seoColor}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.875rem",
                    fontWeight: 800,
                    color: seoColor,
                    background: "var(--adm-card2)",
                    flexShrink: 0,
                  }}>
                    {seoScore}
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--adm-muted)", transform: seoOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                </div>
              </button>

              {seoOpen && (
                <div style={{ marginTop: 14 }}>
                  {/* SEO Checklist */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
                    {seoItems.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ fontSize: "0.75rem", color: item.pass ? "#34D399" : "#F87171", flexShrink: 0, marginTop: 1 }}>
                          {item.pass ? "✓" : "✗"}
                        </span>
                        <div>
                          <div style={{ fontSize: "0.75rem", color: item.pass ? "var(--adm-text)" : "var(--adm-muted)", lineHeight: 1.4 }}>{item.label}</div>
                          {!item.pass && <div style={{ fontSize: "0.6875rem", color: "var(--adm-muted)", marginTop: 2 }}>{item.tip}</div>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* GEO sub-section */}
                  <div style={{ borderTop: "1px solid var(--adm-border)", paddingTop: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>GEO Score</span>
                      <span style={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        padding: "2px 10px",
                        borderRadius: 99,
                        background: geoScore >= 4 ? "rgba(52,211,153,0.12)" : geoScore >= 2 ? "rgba(251,191,36,0.12)" : "rgba(248,113,113,0.12)",
                        color: geoScore >= 4 ? "#34D399" : geoScore >= 2 ? "#FBBF24" : "#F87171",
                        border: `1px solid ${geoScore >= 4 ? "rgba(52,211,153,0.25)" : geoScore >= 2 ? "rgba(251,191,36,0.25)" : "rgba(248,113,113,0.25)"}`,
                      }}>
                        {geoScore}/5
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {geoChecks.map((g, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: "0.75rem", color: g.pass ? "#34D399" : "#F87171", flexShrink: 0 }}>{g.pass ? "✓" : "✗"}</span>
                          <span style={{ fontSize: "0.75rem", color: g.pass ? "var(--adm-text)" : "var(--adm-muted)" }}>{g.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Suggestions card */}
            <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 12, padding: "18px 18px" }}>
              <button
                onClick={() => setAiOpen((v) => !v)}
                style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <h4 style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>✨ AI Title & Tag Ideas</h4>
                <span style={{ fontSize: "0.75rem", color: "var(--adm-muted)", transform: aiOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
              </button>

              {aiOpen && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setAiSeed((s) => s + 1); }}
                      style={{ padding: "4px 12px", borderRadius: 6, background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", color: "var(--adm-muted2)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
                    >
                      Refresh
                    </button>
                  </div>

                  {aiTitles.length === 0 ? (
                    <p style={{ fontSize: "0.8125rem", color: "var(--adm-muted)", textAlign: "center", padding: "12px 0" }}>Enter a title to get suggestions.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                      {aiTitles.map((t, i) => (
                        <button
                          key={i}
                          onClick={() => setForm((f) => ({ ...f, title: t }))}
                          style={{
                            textAlign: "left",
                            padding: "8px 12px",
                            borderRadius: 8,
                            background: "var(--adm-card2)",
                            border: "1px solid var(--adm-border2)",
                            color: "var(--adm-muted2)",
                            fontSize: "0.8125rem",
                            lineHeight: 1.4,
                            cursor: "pointer",
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}

                  {aiTagSuggestions.length > 0 && (
                    <div>
                      <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Tag Suggestions</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {aiTagSuggestions.map((tag, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              const existing = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
                              if (!existing.includes(tag)) {
                                setForm((f) => ({ ...f, tags: [...existing, tag].join(", ") }));
                              }
                            }}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 99,
                              background: "var(--adm-card2)",
                              border: "1px solid var(--adm-border2)",
                              color: "var(--adm-muted2)",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                            }}
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Category */}
            <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 12, padding: "18px 18px" }}>
              <h4 style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Category</h4>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} style={{ width: "100%", background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", borderRadius: 8, color: "var(--adm-text)", fontSize: "0.875rem", padding: "9px 10px", outline: "none", cursor: "pointer" }}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Tags */}
            <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 12, padding: "18px 18px" }}>
              <h4 style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Tags</h4>
              <input type="text" placeholder="tag1, tag2" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} style={{ width: "100%", background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", borderRadius: 8, color: "var(--adm-text)", fontSize: "0.875rem", padding: "9px 10px", outline: "none" }} />
            </div>

            {/* Cover Image */}
            <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 12, padding: "18px 18px" }}>
              <h4 style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Cover Image</h4>
              <input type="text" placeholder="https://..." value={form.coverImage} onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))} style={{ width: "100%", background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", borderRadius: 8, color: "var(--adm-text)", fontSize: "0.8125rem", padding: "9px 10px", outline: "none" }} />
              {form.coverImage && <img src={form.coverImage} alt="Cover" style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 8, marginTop: 10 }} />}
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
