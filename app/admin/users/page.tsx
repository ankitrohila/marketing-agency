"use client";
import { useEffect, useState, useRef } from "react";
import AdminHeader from "@/components/admin/AdminHeader";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: string;
  createdAt: string;
}

const ROLES = ["super_admin", "admin", "editor", "author", "contributor", "viewer"];

const ROLE_COLORS: Record<string, string> = {
  super_admin: "#E8312A",
  admin: "#FB923C",
  editor: "#38BDF8",
  author: "#34D399",
  contributor: "#A78BFA",
  viewer: "rgba(255,255,255,0.35)",
};

const PERMISSIONS: Record<string, Record<string, boolean>> = {
  "Manage Files":     { super_admin: true,  admin: false, editor: false, author: false, contributor: false, viewer: false },
  "Manage Users":     { super_admin: true,  admin: true,  editor: false, author: false, contributor: false, viewer: false },
  "Publish Posts":    { super_admin: true,  admin: true,  editor: true,  author: false, contributor: false, viewer: false },
  "Edit All Posts":   { super_admin: true,  admin: true,  editor: true,  author: false, contributor: false, viewer: false },
  "Edit Own Posts":   { super_admin: true,  admin: true,  editor: true,  author: true,  contributor: false, viewer: false },
  "Create Posts":     { super_admin: true,  admin: true,  editor: true,  author: true,  contributor: true,  viewer: false },
  "View Dashboard":   { super_admin: true,  admin: true,  editor: true,  author: true,  contributor: true,  viewer: true  },
  "Manage SEO":       { super_admin: true,  admin: true,  editor: false, author: false, contributor: false, viewer: false },
  "Manage Redirects": { super_admin: true,  admin: true,  editor: false, author: false, contributor: false, viewer: false },
};

type EditForm = {
  name: string;
  email: string;
  role: string;
  status: string;
  avatar: string;
  password: string;
};

export default function AdminUsersPage() {
  const [currentUser, setCurrentUser]   = useState<AdminUser | null>(null);
  const [users, setUsers]               = useState<AdminUser[]>([]);
  const [loading, setLoading]           = useState(true);
  const [addModal, setAddModal]         = useState(false);
  const [editModal, setEditModal]       = useState<AdminUser | null>(null);
  const [editForm, setEditForm]         = useState<EditForm>({ name: "", email: "", role: "", status: "", avatar: "", password: "" });
  const [newUser, setNewUser]           = useState({ name: "", email: "", password: "", role: "author" });
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState("");
  const [error, setError]               = useState("");
  const fileRef                         = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("bt_admin_user");
    if (stored) setCurrentUser(JSON.parse(stored));
    loadUsers();
  }, []);

  function loadUsers() {
    const token = localStorage.getItem("bt_admin_token") || "";
    fetch("/api/admin/users", { headers: { "x-admin-token": token } })
      .then((r) => r.json())
      .then((d) => { setUsers(d.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function openEdit(u: AdminUser) {
    setEditModal(u);
    setEditForm({ name: u.name, email: u.email, role: u.role, status: u.status, avatar: u.avatar, password: "" });
    setError("");
  }

  // Convert uploaded file to base64 data URL
  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditForm((f) => ({ ...f, avatar: reader.result as string }));
    reader.readAsDataURL(file);
  }

  async function saveEdit() {
    if (!editModal) return;
    setSaving(true);
    setError("");
    const token = localStorage.getItem("bt_admin_token") || "";
    const payload: Record<string, string> = {
      id:     editModal.id,
      name:   editForm.name,
      email:  editForm.email,
      role:   editForm.role,
      status: editForm.status,
      avatar: editForm.avatar,
    };
    if (editForm.password.trim()) payload.password = editForm.password;

    const res = await fetch("/api/admin/users", {
      method:  "PUT",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === editModal.id ? { ...u, ...data.user } : u));
      setEditModal(null);
      showToast("User updated successfully");
    } else {
      setError(data.error || "Failed to save changes.");
    }
  }

  async function deleteUser(userId: string) {
    const token = localStorage.getItem("bt_admin_token") || "";
    const res = await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE", headers: { "x-admin-token": token } });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast("User removed");
    }
  }

  async function handleAddUser() {
    setSaving(true);
    setError("");
    const token = localStorage.getItem("bt_admin_token") || "";
    const res = await fetch("/api/admin/users", {
      method:  "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body:    JSON.stringify(newUser),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setUsers((prev) => [...prev, data.user]);
      setAddModal(false);
      setNewUser({ name: "", email: "", password: "", role: "author" });
      showToast("User added successfully");
    } else {
      setError(data.error || "Failed to add user.");
    }
  }

  const isSuperAdmin = currentUser?.role === "super_admin";
  const isAdmin      = isSuperAdmin || currentUser?.role === "admin";

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px",
    background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8, color: "#F5F5F5", fontSize: "0.875rem", outline: "none",
    boxSizing: "border-box",
  };

  return (
    <>
      <AdminHeader title="Users" user={currentUser} />

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999, background: "#141414", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 10, padding: "12px 20px", color: "#34D399", fontSize: "0.875rem", fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          ✓ {toast}
        </div>
      )}

      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

        {/* Actions bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          {isAdmin && (
            <button onClick={() => setAddModal(true)} style={{ padding: "9px 20px", borderRadius: 8, background: "linear-gradient(135deg,#E8312A,#FF6B1A)", border: "none", color: "#fff", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer" }}>
              + Add User
            </button>
          )}
        </div>

        {/* Users table */}
        <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden", marginBottom: 32 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["User", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.6875rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>Loading...</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ position: "relative" }}>
                        <img src={u.avatar} alt={u.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: `2px solid ${ROLE_COLORS[u.role] || "rgba(255,255,255,0.1)"}` }} />
                      </div>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#F5F5F5" }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)" }}>{u.email}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: "0.6875rem", fontWeight: 700, background: `${ROLE_COLORS[u.role]}18`, color: ROLE_COLORS[u.role] || "rgba(255,255,255,0.4)", border: `1px solid ${ROLE_COLORS[u.role]}30`, textTransform: "capitalize" }}>
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ padding: "3px 12px", borderRadius: 99, fontSize: "0.6875rem", fontWeight: 700, background: u.status === "active" ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.06)", color: u.status === "active" ? "#34D399" : "rgba(255,255,255,0.4)", textTransform: "capitalize" }}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)" }}>
                    {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {isAdmin && (
                        <button onClick={() => openEdit(u)} style={{ padding: "5px 14px", borderRadius: 6, background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", color: "#38BDF8", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                          Edit
                        </button>
                      )}
                      {isSuperAdmin && u.id !== currentUser?.id && (
                        <button onClick={() => deleteUser(u.id)} style={{ padding: "5px 14px", borderRadius: 6, background: "rgba(232,49,42,0.08)", border: "1px solid rgba(232,49,42,0.2)", color: "#E8312A", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Permissions matrix */}
        <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F5F5F5" }}>Role Permissions Matrix</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", minWidth: 180 }}>Permission</th>
                  {ROLES.map((r) => (
                    <th key={r} style={{ padding: "12px 16px", textAlign: "center", fontSize: "0.6875rem", fontWeight: 700, color: ROLE_COLORS[r], textTransform: "capitalize", whiteSpace: "nowrap" }}>
                      {r.replace("_", " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(PERMISSIONS).map(([perm, roles]) => (
                  <tr key={perm} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "10px 16px", fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{perm}</td>
                    {ROLES.map((r) => (
                      <td key={r} style={{ padding: "10px 16px", textAlign: "center" }}>
                        {roles[r]
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ───── EDIT USER MODAL ───── */}
      {editModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditModal(null); }}
        >
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "36px 32px", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#F5F5F5" }}>Edit User</h2>
              <button onClick={() => setEditModal(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "1.25rem", lineHeight: 1 }}>✕</button>
            </div>

            {error && <div style={{ padding: "10px 14px", background: "rgba(232,49,42,0.1)", border: "1px solid rgba(232,49,42,0.25)", borderRadius: 8, color: "#FF6B5B", fontSize: "0.875rem", marginBottom: 20 }}>{error}</div>}

            {/* Avatar section */}
            <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ position: "relative" }}>
                <img
                  src={editForm.avatar || "https://i.pravatar.cc/80"}
                  alt="Avatar preview"
                  style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: `3px solid ${ROLE_COLORS[editForm.role] || "#E8312A"}` }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: "#E8312A", border: "2px solid #141414", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarFile} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Avatar URL (or upload above)</label>
                <input
                  type="text"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm((f) => ({ ...f, avatar: e.target.value }))}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Full Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Email Address</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                    disabled={!isSuperAdmin}
                    style={{ ...inputStyle, cursor: isSuperAdmin ? "pointer" : "not-allowed", opacity: isSuperAdmin ? 1 : 0.5 }}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                    disabled={!isSuperAdmin}
                    style={{ ...inputStyle, cursor: isSuperAdmin ? "pointer" : "not-allowed", opacity: isSuperAdmin ? 1 : 0.5 }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>
                  New Password <span style={{ fontWeight: 400, opacity: 0.5 }}>(leave blank to keep current)</span>
                </label>
                <input type="password" value={editForm.password} onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" style={inputStyle} />
              </div>
            </div>

            {/* Role preview badge */}
            <div style={{ marginTop: 20, padding: "12px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <img src={editForm.avatar || "https://i.pravatar.cc/32"} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#F5F5F5" }}>{editForm.name || "—"}</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>{editForm.email}</div>
              </div>
              <span style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 99, fontSize: "0.6875rem", fontWeight: 700, background: `${ROLE_COLORS[editForm.role]}18`, color: ROLE_COLORS[editForm.role], border: `1px solid ${ROLE_COLORS[editForm.role]}30`, textTransform: "capitalize" }}>
                {editForm.role.replace("_", " ")}
              </span>
            </div>

            {/* Save / Cancel */}
            <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
              <button onClick={() => setEditModal(null)} style={{ flex: 1, padding: "11px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
                Cancel
              </button>
              <button onClick={saveEdit} disabled={saving} style={{ flex: 2, padding: "11px", borderRadius: 8, background: saving ? "#333" : "linear-gradient(135deg,#E8312A,#FF6B1A)", border: "none", color: "#fff", cursor: saving ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "0.875rem" }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───── ADD USER MODAL ───── */}
      {addModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) setAddModal(false); }}
        >
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "36px 32px", width: "100%", maxWidth: 440 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#F5F5F5" }}>Add New User</h2>
              <button onClick={() => setAddModal(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "1.25rem" }}>✕</button>
            </div>
            {error && <div style={{ padding: "10px 14px", background: "rgba(232,49,42,0.1)", border: "1px solid rgba(232,49,42,0.25)", borderRadius: 8, color: "#FF6B5B", fontSize: "0.875rem", marginBottom: 16 }}>{error}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              {[{ label: "Full Name", key: "name", type: "text" }, { label: "Email", key: "email", type: "email" }, { label: "Password", key: "password", type: "password" }].map((field) => (
                <div key={field.key}>
                  <label style={{ display: "block", fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{field.label}</label>
                  <input type={field.type} value={newUser[field.key as keyof typeof newUser]} onChange={(e) => setNewUser((f) => ({ ...f, [field.key]: e.target.value }))} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Role</label>
                <select value={newUser.role} onChange={(e) => setNewUser((f) => ({ ...f, role: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                  {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setAddModal(false)} style={{ flex: 1, padding: "11px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={handleAddUser} disabled={saving} style={{ flex: 2, padding: "11px", borderRadius: 8, background: saving ? "#333" : "linear-gradient(135deg,#E8312A,#FF6B1A)", border: "none", color: "#fff", cursor: saving ? "not-allowed" : "pointer", fontWeight: 700 }}>
                {saving ? "Adding..." : "Add User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
