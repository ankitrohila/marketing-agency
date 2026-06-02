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

interface Category {
  name: string;
  slug: string;
  description: string;
  color: string;
  postCount: number;
}

export default function AdminCategoriesPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("bt_admin_user");
    if (stored) setUser(JSON.parse(stored));
    const token = localStorage.getItem("bt_admin_token") || "";
    fetch("/api/admin/categories", { headers: { "x-admin-token": token } })
      .then((r) => r.json())
      .then((d) => { setCategories(d.categories || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function startEdit(cat: Category) {
    setEditing(cat.slug);
    setEditForm({ name: cat.name, description: cat.description });
  }

  function cancelEdit() {
    setEditing(null);
    setEditForm({ name: "", description: "" });
  }

  function saveEdit(slug: string) {
    setSaving(true);
    setCategories((prev) => prev.map((c) => c.slug === slug ? { ...c, name: editForm.name, description: editForm.description } : c));
    setTimeout(() => { setSaving(false); setEditing(null); }, 500);
  }

  const isSuperAdmin = user?.role === "super_admin";

  return (
    <>
      <AdminHeader title="Categories" user={user} />
      <main className="adm-page-main" style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <p style={{ fontSize: "0.875rem", color: "var(--adm-muted)" }}>{categories.length} categories · Categories cannot be deleted to maintain content integrity.</p>
        </div>

        <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--adm-border)" }}>
                {["Category", "Slug", "Description", "Posts", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--adm-muted)" }}>Loading...</td></tr>
              ) : categories.map((cat) => (
                <tr key={cat.slug} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "14px 16px" }}>
                    {editing === cat.slug ? (
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        style={{ background: "var(--adm-card2)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "var(--adm-text)", fontSize: "0.875rem", padding: "6px 10px", outline: "none" }}
                      />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--adm-text)" }}>{cat.name}</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: "0.8125rem", color: "var(--adm-muted)", fontFamily: "monospace" }}>{cat.slug}</span>
                  </td>
                  <td style={{ padding: "14px 16px", maxWidth: 280 }}>
                    {editing === cat.slug ? (
                      <input
                        value={editForm.description}
                        onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                        style={{ width: "100%", background: "var(--adm-card2)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "var(--adm-text)", fontSize: "0.8125rem", padding: "6px 10px", outline: "none" }}
                      />
                    ) : (
                      <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{cat.description}</span>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 99, background: "rgba(255,255,255,0.05)", fontSize: "0.8125rem", fontWeight: 700, color: cat.color }}>
                      {cat.postCount}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {editing === cat.slug ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => saveEdit(cat.slug)} disabled={saving} style={{ padding: "5px 12px", borderRadius: 6, background: "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)", border: "none", color: "#fff", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                          {saving ? "..." : "Save"}
                        </button>
                        <button onClick={cancelEdit} style={{ padding: "5px 12px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid var(--adm-border2)", color: "var(--adm-muted2)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(cat)} style={{ padding: "5px 12px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid var(--adm-border2)", color: "var(--adm-muted2)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
