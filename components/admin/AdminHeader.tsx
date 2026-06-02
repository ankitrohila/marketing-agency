"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

const S: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  background: "var(--adm-card2)", border: "1px solid var(--adm-border2)",
  color: "var(--adm-text)", fontSize: "0.875rem", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};
const L: React.CSSProperties = {
  display: "block", fontSize: "0.75rem", fontWeight: 700,
  color: "var(--adm-muted2)", marginBottom: 5,
};

export default function AdminHeader({
  title,
  user,
}: {
  title: string;
  user: AdminUser | null;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModal, setProfileModal] = useState(false);

  /* ── Local copy of the user — stays in sync via prop + custom event ── */
  const [localUser, setLocalUser] = useState<AdminUser | null>(user);

  useEffect(() => {
    if (user) setLocalUser(user);
  }, [user]);

  /* Listen for profile-updated events dispatched anywhere in the admin */
  useEffect(() => {
    const refresh = () => {
      const stored = localStorage.getItem("bt_admin_user");
      if (stored) setLocalUser(JSON.parse(stored));
    };
    window.addEventListener("admin:profileUpdated", refresh);
    return () => window.removeEventListener("admin:profileUpdated", refresh);
  }, []);

  /* ── Profile edit state ─────────────────────────────────────────── */
  const [editName,   setEditName]   = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError,  setEditError]  = useState("");
  const [editOk,     setEditOk]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function openProfileModal() {
    setEditName(localUser?.name || "");
    setEditAvatar(localUser?.avatar || "");
    setEditError("");
    setEditOk(false);
    setDropdownOpen(false);
    setProfileModal(true);
  }

  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditAvatar(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSaveProfile() {
    if (!localUser) return;
    setEditSaving(true);
    setEditError("");
    const token = localStorage.getItem("bt_admin_token") || "";
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ id: localUser.id, name: editName.trim(), avatar: editAvatar }),
    });
    const data = await res.json();
    setEditSaving(false);
    if (!res.ok) {
      setEditError(data.error || "Failed to save profile.");
      return;
    }
    const updated = { ...localUser, ...data.user };
    localStorage.setItem("bt_admin_user", JSON.stringify(updated));
    setLocalUser(updated);
    /* Notify AdminLayout (sidebar) and any other listeners */
    window.dispatchEvent(new CustomEvent("admin:profileUpdated"));
    setEditOk(true);
    setTimeout(() => { setProfileModal(false); setEditOk(false); }, 900);
  }

  return (
    <>
      <header
        style={{
          height: 56,
          background: "var(--adm-surface)",
          borderBottom: "1px solid var(--adm-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <h1 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--adm-text)", margin: 0 }}>
          {title}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* View Site */}
          <Link
            href="/"
            target="_blank"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "1px solid var(--adm-border2)", color: "var(--adm-muted2)", fontSize: "0.8125rem", fontWeight: 500, textDecoration: "none", transition: "all 0.2s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--adm-text)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--adm-muted2)"; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            View Site
          </Link>

          {/* Notification bell */}
          <button style={{ width: 34, height: 34, borderRadius: 8, background: "var(--adm-border)", border: "1px solid var(--adm-border2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--adm-muted2)", position: "relative" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: "#E8312A", border: "1.5px solid var(--adm-surface)" }} />
          </button>

          {/* User dropdown */}
          {localUser && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 8, transition: "background 0.2s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--adm-border)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                <img src={localUser.avatar} alt={localUser.name} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", border: "1.5px solid var(--adm-border2)" }} />
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--adm-text)" }}>{localUser.name}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--adm-muted)" }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {dropdownOpen && (
                <>
                  {/* Click-outside overlay */}
                  <div style={{ position: "fixed", inset: 0, zIndex: 98 }} onClick={() => setDropdownOpen(false)} />

                  <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "var(--adm-card)", border: "1px solid var(--adm-border2)", borderRadius: 12, padding: 6, minWidth: 210, boxShadow: "0 16px 48px rgba(0,0,0,0.5)", zIndex: 99 }}>

                    {/* User info + avatar */}
                    <div style={{ padding: "10px 12px 12px", borderBottom: "1px solid var(--adm-border)", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <img src={localUser.avatar} alt={localUser.name} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--adm-border2)", display: "block" }} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--adm-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{localUser.name}</div>
                          <div style={{ fontSize: "0.6875rem", color: "var(--adm-muted)", textTransform: "capitalize" }}>{localUser.role.replace("_", " ")}</div>
                        </div>
                      </div>
                      {/* Edit Profile button */}
                      <button
                        onClick={openProfileModal}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 7, background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", color: "var(--adm-muted2)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", textAlign: "center" }}
                      >
                        ✏ Edit Profile & Photo
                      </button>
                    </div>

                    {[
                      { label: "Dashboard",   href: "/admin/dashboard" },
                      { label: "Site Settings", href: "/admin/settings" },
                    ].map((item) => (
                      <Link key={item.label} href={item.href} onClick={() => setDropdownOpen(false)}
                        style={{ display: "block", padding: "8px 12px", borderRadius: 6, fontSize: "0.8125rem", color: "var(--adm-muted2)", textDecoration: "none", transition: "all 0.15s" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--adm-border)"; (e.currentTarget as HTMLElement).style.color = "var(--adm-text)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--adm-muted2)"; }}
                      >
                        {item.label}
                      </Link>
                    ))}

                    <div style={{ borderTop: "1px solid var(--adm-border)", marginTop: 4, paddingTop: 4 }}>
                      <button
                        onClick={() => { localStorage.removeItem("bt_admin_token"); localStorage.removeItem("bt_admin_user"); window.location.href = "/admin/login"; }}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: 6, fontSize: "0.8125rem", color: "var(--adm-muted2)", background: "none", border: "none", cursor: "pointer", transition: "background 0.15s" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--adm-border)"; (e.currentTarget as HTMLElement).style.color = "var(--adm-text)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--adm-muted2)"; }}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ══════════════ Edit Profile Modal ══════════════ */}
      {profileModal && localUser && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) setProfileModal(false); }}
        >
          <div style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border2)", borderRadius: 18, width: "100%", maxWidth: 480, overflow: "hidden" }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--adm-border)" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--adm-text)" }}>Edit Profile</h2>
              <button onClick={() => setProfileModal(false)} style={{ background: "none", border: "none", color: "var(--adm-muted)", cursor: "pointer", fontSize: "1.125rem", lineHeight: 1 }}>✕</button>
            </div>

            {/* Body */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Avatar picker */}
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {/* Avatar preview + upload click zone */}
                <div
                  style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}
                  onClick={() => fileRef.current?.click()}
                  title="Click to upload a photo"
                >
                  <img
                    src={editAvatar || "https://i.pravatar.cc/80"}
                    alt="Avatar"
                    style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--adm-border2)", display: "block" }}
                  />
                  {/* Camera overlay */}
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0"; }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarFile} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--adm-text)", marginBottom: 4 }}>Profile Photo</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--adm-muted)", marginBottom: 10, lineHeight: 1.5 }}>
                    Click the circle to upload a photo, or paste a URL below. Updated photo will appear everywhere — header, sidebar, and posts.
                  </p>
                  <button
                    onClick={() => fileRef.current?.click()}
                    style={{ padding: "6px 14px", borderRadius: 7, background: "var(--adm-card)", border: "1px solid var(--adm-border2)", color: "var(--adm-muted2)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
                  >
                    Upload Photo
                  </button>
                </div>
              </div>

              {/* Avatar URL */}
              <div>
                <label style={L}>Photo URL</label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  style={S}
                />
              </div>

              {/* Name */}
              <div>
                <label style={L}>Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your name"
                  style={S}
                />
              </div>

              {/* Email — read only */}
              <div>
                <label style={{ ...L, display: "flex", justifyContent: "space-between" }}>
                  <span>Email</span>
                  <span style={{ fontWeight: 400, opacity: 0.5 }}>Cannot be changed here</span>
                </label>
                <input type="email" value={localUser.email} readOnly style={{ ...S, opacity: 0.5, cursor: "not-allowed" }} />
              </div>

              {/* Error / success */}
              {editError && (
                <div style={{ padding: "10px 14px", background: "rgba(232,49,42,0.08)", border: "1px solid rgba(232,49,42,0.2)", borderRadius: 8, color: "#FF6B5B", fontSize: "0.8125rem" }}>
                  {editError}
                </div>
              )}
              {editOk && (
                <div style={{ padding: "10px 14px", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 8, color: "#34D399", fontSize: "0.8125rem" }}>
                  ✓ Profile updated successfully!
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ display: "flex", gap: 10, padding: "16px 24px", borderTop: "1px solid var(--adm-border)" }}>
              <button onClick={() => setProfileModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid var(--adm-border2)", background: "transparent", color: "var(--adm-muted2)", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600 }}>
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={editSaving || !editName.trim()}
                style={{ flex: 2, padding: "10px", borderRadius: 8, border: "none", background: (editSaving || !editName.trim()) ? "var(--adm-card)" : "var(--adm-text)", color: (editSaving || !editName.trim()) ? "var(--adm-muted)" : "var(--adm-bg)", cursor: editSaving ? "not-allowed" : "pointer", fontSize: "0.875rem", fontWeight: 700 }}
              >
                {editSaving ? "Saving…" : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
