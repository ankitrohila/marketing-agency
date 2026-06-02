"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  publishedAt: string;
  author: { name: string; avatar: string };
  readTime: string;
  featured: boolean;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  published: { bg: "rgba(52,211,153,0.12)", text: "#34D399" },
  draft: { bg: "rgba(251,191,36,0.12)", text: "#FBBF24" },
  pending: { bg: "rgba(251,146,60,0.12)", text: "#FB923C" },
};

const CATEGORIES = [
  "All", "Performance Marketing", "Brand Strategy", "Creative Studio",
  "Media Distribution", "Conversion & CRO", "AI & MarTech", "Case Studies",
  "Growth Insights", "Industry Trends", "D2C Growth", "Startup Marketing", "Analytics & Data",
];

export default function AdminPostsPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const PER_PAGE = 10;

  useEffect(() => {
    const stored = localStorage.getItem("bt_admin_user");
    if (stored) setUser(JSON.parse(stored));

    const token = localStorage.getItem("bt_admin_token") || "";
    fetch("/api/posts?status=all", { headers: { "x-admin-token": token } })
      .then((r) => r.json())
      .then((d) => { setPosts(d.posts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function filtered() {
    return posts.filter((p) => {
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "All" || p.category === categoryFilter;
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }

  const filteredPosts = filtered();
  const totalPages = Math.ceil(filteredPosts.length / PER_PAGE);
  const paginated = filteredPosts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  async function deletePost(id: string) {
    const token = localStorage.getItem("bt_admin_token") || "";
    await fetch(`/api/posts/${id}`, { method: "DELETE", headers: { "x-admin-token": token } });
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setDeleteModal(null);
    setSelected((prev) => prev.filter((s) => s !== id));
  }

  async function bulkDelete() {
    const token = localStorage.getItem("bt_admin_token") || "";
    await Promise.all(selected.map((id) => fetch(`/api/posts/${id}`, { method: "DELETE", headers: { "x-admin-token": token } })));
    setPosts((prev) => prev.filter((p) => !selected.includes(p.id)));
    setSelected([]);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  }

  function toggleAll() {
    if (selected.length === paginated.length) {
      setSelected([]);
    } else {
      setSelected(paginated.map((p) => p.id));
    }
  }

  return (
    <>
      <AdminHeader title="Posts" user={user} />
      <main className="adm-page-main" style={{ flex: 1, padding: "28px 32px" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ flex: 1, minWidth: 200, padding: "9px 14px", background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", borderRadius: 8, color: "var(--adm-text)", fontSize: "0.875rem", outline: "none" }}
          />
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            style={{ padding: "9px 12px", background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", borderRadius: 8, color: "var(--adm-text)", fontSize: "0.8125rem", outline: "none", cursor: "pointer" }}
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ padding: "9px 12px", background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", borderRadius: 8, color: "var(--adm-text)", fontSize: "0.8125rem", outline: "none", cursor: "pointer" }}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
          </select>
          {selected.length > 0 && (
            <button
              onClick={bulkDelete}
              style={{ padding: "9px 16px", background: "var(--adm-card)", border: "1px solid var(--adm-border2)", borderRadius: 8, color: "var(--adm-muted2)", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}
            >
              Delete {selected.length} selected
            </button>
          )}
          <Link
            href="/admin/posts/new"
            style={{ marginLeft: "auto", padding: "9px 18px", background: "var(--adm-text)", borderRadius: 8, color: "var(--adm-bg)", fontSize: "0.8125rem", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}
          >
            + New Post
          </Link>
        </div>

        {/* Table */}
        <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--adm-border)" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", width: 40 }}>
                    <input type="checkbox" checked={selected.length === paginated.length && paginated.length > 0} onChange={toggleAll} style={{ cursor: "pointer" }} />
                  </th>
                  {["Title", "Category", "Author", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: "40px 16px", textAlign: "center", color: "var(--adm-muted)" }}>Loading...</td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: "40px 16px", textAlign: "center", color: "var(--adm-muted)" }}>No posts found.</td></tr>
                ) : paginated.map((post) => {
                  const statusStyle = STATUS_COLORS[post.status] || STATUS_COLORS.draft;
                  return (
                    <tr
                      key={post.id}
                      style={{ borderBottom: "1px solid var(--adm-border)", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--adm-card2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <input type="checkbox" checked={selected.includes(post.id)} onChange={() => toggleSelect(post.id)} style={{ cursor: "pointer" }} />
                      </td>
                      <td style={{ padding: "14px 16px", maxWidth: 300 }}>
                        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--adm-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.title}</div>
                        {post.featured && <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#FBBF24", textTransform: "uppercase", letterSpacing: "0.08em" }}>★ Featured</span>}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--adm-muted2)", whiteSpace: "nowrap" }}>{post.category}</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <img src={post.author.avatar} alt={post.author.name} style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} />
                          <span style={{ fontSize: "0.8125rem", color: "var(--adm-muted2)", whiteSpace: "nowrap" }}>{post.author.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: "0.6875rem", fontWeight: 700, background: statusStyle.bg, color: statusStyle.text, textTransform: "capitalize" }}>
                          {post.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "0.8125rem", color: "var(--adm-muted)", whiteSpace: "nowrap" }}>
                          {new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <Link href={`/admin/posts/${post.id}`} style={{ padding: "5px 12px", borderRadius: 6, background: "var(--adm-border)", border: "1px solid var(--adm-border2)", color: "var(--adm-muted2)", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none" }}>
                            Edit
                          </Link>
                          <Link href={`/blog/${post.slug}`} target="_blank" style={{ padding: "5px 12px", borderRadius: 6, background: "var(--adm-border)", border: "1px solid var(--adm-border2)", color: "var(--adm-muted2)", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none" }}>
                            View
                          </Link>
                          <button
                            onClick={() => setDeleteModal(post.id)}
                            style={{ padding: "5px 12px", borderRadius: 6, background: "transparent", border: "1px solid var(--adm-border2)", color: "var(--adm-muted2)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderTop: "1px solid var(--adm-border)" }}>
              <span style={{ fontSize: "0.8125rem", color: "var(--adm-muted)" }}>
                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filteredPosts.length)} of {filteredPosts.length}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--adm-border2)", background: "transparent", color: page === 1 ? "var(--adm-border2)" : "var(--adm-muted2)", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: "0.8125rem" }}>Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)} style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid", borderColor: n === page ? "var(--adm-text)" : "var(--adm-border2)", background: n === page ? "var(--adm-card)" : "transparent", color: n === page ? "var(--adm-text)" : "var(--adm-muted2)", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>{n}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--adm-border2)", background: "transparent", color: page === totalPages ? "var(--adm-border2)" : "var(--adm-muted2)", cursor: page === totalPages ? "not-allowed" : "pointer", fontSize: "0.8125rem" }}>Next</button>
              </div>
            </div>
          )}
        </div>

        {/* Delete confirmation modal */}
        {deleteModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border2)", borderRadius: 16, padding: "32px", maxWidth: 400, width: "90%" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 12 }}>Delete Post?</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--adm-muted2)", marginBottom: 24 }}>This action cannot be undone. The post will be permanently deleted.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setDeleteModal(null)} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "var(--adm-border)", border: "1px solid var(--adm-border2)", color: "var(--adm-muted2)", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                <button onClick={() => deletePost(deleteModal)} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "#E8312A", border: "none", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
