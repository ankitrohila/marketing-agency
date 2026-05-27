"use client";
import { useEffect, useState } from "react";
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

const PERMISSIONS: Record<string, Record<string, boolean>> = {
  "Manage Files": { super_admin: true, admin: false, editor: false, author: false, contributor: false, viewer: false },
  "Manage Users": { super_admin: true, admin: true, editor: false, author: false, contributor: false, viewer: false },
  "Publish Posts": { super_admin: true, admin: true, editor: true, author: false, contributor: false, viewer: false },
  "Edit All Posts": { super_admin: true, admin: true, editor: true, author: false, contributor: false, viewer: false },
  "Edit Own Posts": { super_admin: true, admin: true, editor: true, author: true, contributor: false, viewer: false },
  "Create Posts": { super_admin: true, admin: true, editor: true, author: true, contributor: true, viewer: false },
  "View Dashboard": { super_admin: true, admin: true, editor: true, author: true, contributor: true, viewer: true },
  "Manage SEO": { super_admin: true, admin: true, editor: false, author: false, contributor: false, viewer: false },
  "Manage Redirects": { super_admin: true, admin: true, editor: false, author: false, contributor: false, viewer: false },
};

export default function AdminUsersPage() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "author" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("bt_admin_user");
    if (stored) setCurrentUser(JSON.parse(stored));
    const token = localStorage.getItem("bt_admin_token") || "";
    fetch("/api/admin/users", { headers: { "x-admin-token": token } })
      .then((r) => r.json())
      .then((d) => { setUsers(d.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function updateRole(userId: string, role: string) {
    const token = localStorage.getItem("bt_admin_token") || "";
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ id: userId, role }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
    }
  }

  async function toggleStatus(userId: string, status: string) {
    const token = localStorage.getItem("bt_admin_token") || "";
    const newStatus = status === "active" ? "inactive" : "active";
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ id: userId, status: newStatus }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: newStatus } : u));
    }
  }

  async function deleteUser(userId: string) {
    const token = localStorage.getItem("bt_admin_token") || "";
    const res = await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE", headers: { "x-admin-token": token } });
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== userId));
  }

  async function handleAddUser() {
    setSaving(true);
    setError("");
    const token = localStorage.getItem("bt_admin_token") || "";
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify(newUser),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setUsers((prev) => [...prev, data.user]);
      setAddModal(false);
      setNewUser({ name: "", email: "", password: "", role: "author" });
    } else {
      setError(data.error || "Failed to add user.");
    }
  }

  const isSuperAdmin = currentUser?.role === "super_admin";

  return (
    <>
      <AdminHeader title="Users" user={currentUser} />
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        {/* User table */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          {isSuperAdmin && (
            <button onClick={() => setAddModal(true)} style={{ padding: "9px 18px", borderRadius: 8, background: "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)", border: "none", color: "#fff", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer" }}>
              + Add User
            </button>
          )}
        </div>

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
                <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>Loading...</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img src={u.avatar} alt={u.name} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#F5F5F5" }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)" }}>{u.email}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      disabled={!isSuperAdmin || u.id === currentUser?.id}
                      style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, color: "#F5F5F5", fontSize: "0.8125rem", padding: "4px 8px", outline: "none", cursor: isSuperAdmin ? "pointer" : "not-allowed" }}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <button
                      onClick={() => toggleStatus(u.id, u.status)}
                      disabled={!isSuperAdmin}
                      style={{ padding: "3px 12px", borderRadius: 99, fontSize: "0.6875rem", fontWeight: 700, background: u.status === "active" ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.06)", color: u.status === "active" ? "#34D399" : "rgba(255,255,255,0.4)", border: "none", cursor: isSuperAdmin ? "pointer" : "default", textTransform: "capitalize" }}
                    >
                      {u.status}
                    </button>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)" }}>
                    {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {isSuperAdmin && u.id !== currentUser?.id && (
                      <button onClick={() => deleteUser(u.id)} style={{ padding: "5px 12px", borderRadius: 6, background: "rgba(232,49,42,0.08)", border: "1px solid rgba(232,49,42,0.2)", color: "#E8312A", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Permissions matrix */}
        <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F5F5F5" }}>Role Permissions Matrix</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", minWidth: 180 }}>Permission</th>
                  {ROLES.map((r) => (
                    <th key={r} style={{ padding: "12px 16px", textAlign: "center", fontSize: "0.6875rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "capitalize", whiteSpace: "nowrap" }}>
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
                        {roles[r] ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add user modal */}
        {addModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "32px", maxWidth: 440, width: "90%" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#F5F5F5", marginBottom: 20 }}>Add New User</h3>
              {error && <div style={{ padding: "10px 14px", background: "rgba(232,49,42,0.1)", border: "1px solid rgba(232,49,42,0.25)", borderRadius: 8, color: "#FF6B5B", fontSize: "0.875rem", marginBottom: 16 }}>{error}</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
                {[
                  { label: "Full Name", key: "name", type: "text" },
                  { label: "Email", key: "email", type: "email" },
                  { label: "Password", key: "password", type: "password" },
                ].map((field) => (
                  <div key={field.key}>
                    <label style={{ display: "block", fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{field.label}</label>
                    <input
                      type={field.type}
                      value={newUser[field.key as keyof typeof newUser]}
                      onChange={(e) => setNewUser((f) => ({ ...f, [field.key]: e.target.value }))}
                      style={{ width: "100%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F5F5F5", fontSize: "0.875rem", padding: "10px 12px", outline: "none" }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Role</label>
                  <select value={newUser.role} onChange={(e) => setNewUser((f) => ({ ...f, role: e.target.value }))} style={{ width: "100%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F5F5F5", fontSize: "0.875rem", padding: "10px 12px", outline: "none", cursor: "pointer" }}>
                    {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setAddModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                <button onClick={handleAddUser} disabled={saving} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)", border: "none", color: "#fff", cursor: "pointer", fontWeight: 700 }}>
                  {saving ? "Adding..." : "Add User"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
