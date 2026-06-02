"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ThemeToggle from "@/components/ThemeToggle";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user,     setUser]     = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [sideOpen, setSideOpen] = useState(false);
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token  = localStorage.getItem("bt_admin_token");
    const stored = localStorage.getItem("bt_admin_user");

    if (pathname === "/admin/login") {
      setChecking(false);
      return;
    }

    if (!token || !stored) {
      router.replace("/admin/login");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
    } catch {
      router.replace("/admin/login");
      return;
    }

    setChecking(false);
  }, [pathname, router]);

  // Refresh user state when profile is updated from any admin page
  useEffect(() => {
    const refreshUser = () => {
      const stored = localStorage.getItem("bt_admin_user");
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
      }
    };
    window.addEventListener("admin:profileUpdated", refreshUser);
    return () => window.removeEventListener("admin:profileUpdated", refreshUser);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSideOpen(false);
  }, [pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--adm-bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--adm-muted)", fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "0.875rem",
      }}>
        Authenticating...
      </div>
    );
  }

  return (
    <>
      {/* ── Admin-wide responsive + theme CSS ── */}
      <style>{`
        .admin-shell {
          display: flex;
          min-height: 100vh;
          background: var(--adm-bg);
          font-family: Inter, system-ui, sans-serif;
          color: var(--adm-text);
          transition: background 0.25s, color 0.25s;
        }
        .admin-main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow-x: hidden;
          background: var(--adm-bg);
          transition: background 0.25s;
        }
        .admin-mobile-topbar {
          display: none;
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--adm-surface);
          border-bottom: 1px solid var(--adm-border);
          padding: 0 16px;
          height: 56px;
          align-items: center;
          justify-content: space-between;
        }
        @media (max-width: 768px) {
          .admin-mobile-topbar  { display: flex !important; }
          .admin-sidebar-desktop { display: none !important; }
          .admin-sidebar-mobile  { display: block !important; }
          .admin-main-content > *:not(.admin-mobile-topbar) { padding-left: 0 !important; }
        }
        @media (min-width: 769px) {
          .admin-sidebar-mobile  { display: none !important; }
          .admin-sidebar-desktop { display: block !important; }
        }

        /* ── Admin theme toggle — bottom-right corner ── */
        .admin-theme-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9500;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--adm-card);
          border: 1px solid var(--adm-border2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--adm-muted2);
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          transition: background 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .admin-theme-btn:hover {
          background: var(--adm-card2);
          color: var(--adm-text);
          transform: scale(1.1);
          box-shadow: 0 6px 28px rgba(232,49,42,0.22);
        }
      `}</style>

      <div className="admin-shell">
        {/* Desktop sidebar */}
        <div className="admin-sidebar-desktop">
          <AdminSidebar user={user} open={false} onClose={() => {}} />
        </div>

        {/* Mobile sidebar (controlled) */}
        <div className="admin-sidebar-mobile" style={{ display: "none" }}>
          <AdminSidebar user={user} open={sideOpen} onClose={() => setSideOpen(false)} />
        </div>

        <div className="admin-main-content">
          {/* Mobile top bar */}
          <div className="admin-mobile-topbar">
            <button
              onClick={() => setSideOpen(true)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--adm-muted2)", padding: "8px",
                borderRadius: 8, display: "flex", alignItems: "center",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              style={{ objectFit: "contain", borderRadius: 7 }}
            />
            {user ? (
              <img src={user.avatar} alt={user.name}
                style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
            ) : <div style={{ width: 32 }} />}
          </div>

          {children}
        </div>
      </div>

      {/* Admin theme toggle — always visible, bottom-right */}
      <AdminThemeToggle />
    </>
  );
}

/* ── Inline admin theme toggle (isolated from public ThemeToggle) ── */
function AdminThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("bt-theme");
    const isDark = saved !== "light";
    setDark(isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    const theme = next ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("bt-theme", theme);
  };

  return (
    <button
      className="admin-theme-btn"
      onClick={toggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? (
        /* Sun — switch to light */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1"  x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1"  y1="12" x2="3"  y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        /* Moon — switch to dark */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}
