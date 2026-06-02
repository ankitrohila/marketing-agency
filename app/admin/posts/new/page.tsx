"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
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

export default function NewPostPage() {
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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const autoSlug = useRef(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("bt_admin_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  function handleTitleChange(title: string) {
    setForm((f) => ({
      ...f,
      title,
      slug: autoSlug.current ? slugify(title) : f.slug,
    }));
  }

  function handleSlugChange(slug: string) {
    autoSlug.current = false;
    setForm((f) => ({ ...f, slug }));
  }

  async function handleSave(status?: string) {
    setSaving(true);
    setError("");
    const token = localStorage.getItem("bt_admin_token") || "";
    const payload = {
      ...form,
      status: status || form.status,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      author: user ? { name: user.name, role: "Author", avatar: user.avatar } : { name: "Ankit Rohilla", role: "Founder & CEO", avatar: "https://i.pravatar.cc/64?img=68" },
      publishedAt: new Date().toISOString(),
    };
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (status === "published") {
        router.push("/admin/posts");
      }
    } else {
      setError(data.error || "Save failed.");
    }
  }

  const wordCount = countWords(form.content);

  return (
    <>
      <AdminHeader title="New Post" user={user} />
      <main className="adm-page-main" style={{ flex: 1, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 0, overflowY: "auto" }}>
        {error && (
          <div style={{ padding: "10px 16px", background: "rgba(232,49,42,0.1)", border: "1px solid rgba(232,49,42,0.25)", borderRadius: 8, color: "#FF6B5B", fontSize: "0.875rem", marginBottom: 16 }}>{error}</div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
          {/* Main editor */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Title */}
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
                  onChange={(e) => handleSlugChange(e.target.value)}
                  style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid var(--adm-border2)", borderRadius: 6, padding: "4px 10px", color: "var(--adm-muted2)", fontSize: "0.8125rem", outline: "none", fontFamily: "monospace" }}
                />
              </div>
            </div>

            {/* Excerpt */}
            <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 12, padding: "16px 20px" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Excerpt</label>
              <textarea
                placeholder="2-3 sentence summary of the post..."
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                rows={3}
                style={{ width: "100%", background: "transparent", border: "none", color: "rgba(255,255,255,0.7)", fontSize: "0.9375rem", lineHeight: 1.7, outline: "none", resize: "vertical" }}
              />
            </div>

            {/* Content */}
            <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <label style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Content (HTML)</label>
                <span style={{ fontSize: "0.6875rem", color: "var(--adm-muted)" }}>{wordCount} words</span>
              </div>
              <textarea
                placeholder="<h2>Heading</h2><p>Your content here...</p>"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={20}
                style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid var(--adm-border)", borderRadius: 8, padding: "12px 14px", color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", lineHeight: 1.7, outline: "none", resize: "vertical", fontFamily: "monospace" }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 20 }}>
            {/* Publish */}
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
                <button onClick={() => handleSave("draft")} disabled={saving} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--adm-border2)", color: "rgba(255,255,255,0.7)", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}>
                  {saving ? "..." : "Save Draft"}
                </button>
                <button onClick={() => handleSave("published")} disabled={saving} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)", border: "none", color: "#fff", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer" }}>
                  {saving ? "..." : "Publish"}
                </button>
              </div>
              {saved && <div style={{ marginTop: 10, fontSize: "0.75rem", color: "#34D399", textAlign: "center" }}>Saved successfully!</div>}
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
              <input type="text" placeholder="tag1, tag2, tag3" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} style={{ width: "100%", background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", borderRadius: 8, color: "var(--adm-text)", fontSize: "0.875rem", padding: "9px 10px", outline: "none" }} />
              <p style={{ fontSize: "0.6875rem", color: "var(--adm-muted)", marginTop: 6 }}>Separate with commas</p>
            </div>

            {/* Cover image */}
            <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 12, padding: "18px 18px" }}>
              <h4 style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Cover Image</h4>
              <input type="text" placeholder="https://images.unsplash.com/..." value={form.coverImage} onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))} style={{ width: "100%", background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", borderRadius: 8, color: "var(--adm-text)", fontSize: "0.8125rem", padding: "9px 10px", outline: "none" }} />
              {form.coverImage && <img src={form.coverImage} alt="Cover preview" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginTop: 10 }} />}
            </div>

            {/* SEO */}
            <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 12, padding: "18px 18px" }}>
              <h4 style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>SEO</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--adm-muted)", marginBottom: 5 }}>Meta Title ({form.seo.metaTitle.length}/60)</label>
                  <input type="text" value={form.seo.metaTitle} onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, metaTitle: e.target.value } }))} style={{ width: "100%", background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", borderRadius: 6, color: "var(--adm-text)", fontSize: "0.8125rem", padding: "7px 10px", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--adm-muted)", marginBottom: 5 }}>Meta Description ({form.seo.metaDesc.length}/160)</label>
                  <textarea value={form.seo.metaDesc} onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, metaDesc: e.target.value } }))} rows={3} style={{ width: "100%", background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", borderRadius: 6, color: "var(--adm-text)", fontSize: "0.8125rem", padding: "7px 10px", outline: "none", resize: "vertical" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
