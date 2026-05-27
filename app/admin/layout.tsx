"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

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
        minHeight: "100vh", background: "#0a0a0a",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(255,255,255,0.4)", fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "0.875rem",
      }}>
        Authenticating...
      </div>
    );
  }

  return (
    <>
      {/* Responsive admin CSS */}
      <style>{`
        .admin-main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow-x: hidden;
        }
        .admin-mobile-topbar {
          display: none;
          position: sticky;
          top: 0;
          z-index: 100;
          background: #0d0d0d;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0 16px;
          height: 56px;
          align-items: center;
          justify-content: space-between;
        }
        @media (max-width: 768px) {
          .admin-mobile-topbar {
            display: flex !important;
          }
          .admin-sidebar-desktop {
            display: none;
          }
          .admin-main-content > *:not(.admin-mobile-topbar) {
            padding-left: 0 !important;
          }
        }
      `}</style>

      <div style={{
        display: "flex", minHeight: "100vh",
        background: "#0a0a0a",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#F5F5F5",
      }}>
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
                color: "rgba(255,255,255,0.7)", padding: "8px",
                borderRadius: 8, display: "flex", alignItems: "center",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <span style={{ fontSize: "1rem", fontWeight: 800, color: "#E8312A", letterSpacing: "-0.04em" }}>
              BrandThink Admin
            </span>
            {user ? (
              <img src={user.avatar} alt={user.name}
                style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
            ) : <div style={{ width: 32 }} />}
          </div>

          {children}
        </div>
      </div>

      {/* Mobile: show mobile sidebar div, hide desktop */}
      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-sidebar-mobile { display: block !important; }
        }
        @media (min-width: 769px) {
          .admin-sidebar-mobile { display: none !important; }
          .admin-sidebar-desktop { display: block !important; }
        }
      `}</style>
    </>
  );
}
