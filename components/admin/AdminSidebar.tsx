"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navSections = [
  {
    title: "Dashboard",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        label: "Pages",
        href: "/admin/pages",
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        ),
      },
      {
        label: "Posts",
        href: "/admin/posts",
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        ),
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        ),
      },
      {
        label: "Media",
        href: "/admin/media",
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Forms & Leads",
    items: [
      {
        label: "Form Builder",
        href: "/admin/forms",
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
        ),
      },
      {
        label: "Leads",
        href: "/admin/leads",
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/>
          </svg>
        ),
      },
      {
        label: "Subscribers",
        href: "/admin/subscribers",
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        ),
      },
      {
        label: "Bookings",
        href: "/admin/bookings",
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        ),
      },
    ],
  },
  {
    title: "Users",
    items: [
      {
        label: "All Users",
        href: "/admin/users",
        roles: ["super_admin", "admin"],
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "SEO",
    items: [
      {
        label: "SEO Settings",
        href: "/admin/seo",
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Design",
    items: [
      {
        label: "Theme & Fonts",
        href: "/admin/theme",
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
          </svg>
        ),
      },
    ],
  },
  {
    title: "Tools",
    items: [
      {
        label: "Mail Logs",
        href: "/admin/mail-logs",
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
            <line x1="8" y1="17" x2="4" y2="17"/>
            <line x1="11" y1="20" x2="4" y2="20"/>
          </svg>
        ),
      },
      {
        label: "Database Guide",
        href: "/admin/database",
        roles: ["super_admin"],
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
        ),
      },
      {
        label: "Backup & Changelog",
        href: "/admin/backup",
        roles: ["super_admin"],
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.71"/>
          </svg>
        ),
      },
      {
        label: "File Manager",
        href: "/admin/files",
        roles: ["super_admin"],
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        label: "General Settings",
        href: "/admin/settings",
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        ),
      },
    ],
  },
];

interface AdminSidebarProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ user, open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();

  function handleLogout() {
    localStorage.removeItem("bt_admin_token");
    localStorage.removeItem("bt_admin_user");
    router.push("/admin/login");
  }

  function isActive(href: string) {
    if (href === "/admin/dashboard") return pathname === href;
    return pathname.startsWith(href);
  }

  function canSeeItem(item: NavItem) {
    if (!item.roles) return true;
    if (!user) return false;
    return item.roles.includes(user.role);
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid var(--adm-border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Image
            src="/logo.png"
            alt="Logo"
            width={36}
            height={36}
            style={{ objectFit: "contain", borderRadius: 8, flexShrink: 0 }}
            priority
          />
          <button
            onClick={onClose}
            className="admin-sidebar-close"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--adm-muted)", padding: 4, borderRadius: 6, display: "none" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <span style={{
          display: "inline-block", marginTop: 5,
          padding: "2px 7px", borderRadius: 4,
          background: "var(--adm-card2)", border: "1px solid var(--adm-border2)",
          color: "var(--adm-muted)", fontSize: "0.5625rem", fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase",
        }}>
          Admin Panel
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => canSeeItem(item as NavItem));
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.title} style={{ marginBottom: 2 }}>
              <div style={{
                fontSize: "0.5rem", fontWeight: 700,
                color: "var(--adm-muted)", letterSpacing: "0.14em",
                textTransform: "uppercase", padding: "10px 10px 3px",
              }}>
                {section.title}
              </div>
              {visibleItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    style={{
                      display: "flex", alignItems: "center", gap: 9,
                      padding: "8px 10px", borderRadius: 7,
                      textDecoration: "none",
                      fontSize: "0.8125rem",
                      fontWeight: active ? 600 : 400,
                      color: active ? "var(--adm-text)" : "var(--adm-muted)",
                      background: active ? "var(--adm-card)" : "transparent",
                      borderLeft: active ? "2px solid var(--adm-text)" : "2px solid transparent",
                      transition: "all 0.12s", marginBottom: 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "var(--adm-card)";
                        (e.currentTarget as HTMLElement).style.color = "var(--adm-muted2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "var(--adm-muted)";
                      }
                    }}
                  >
                    <span style={{ flexShrink: 0, opacity: active ? 1 : 0.55 }}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--adm-border)", flexShrink: 0 }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <img src={user.avatar} alt={user.name}
              style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid var(--adm-border2)" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--adm-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.name}
              </div>
              <div style={{ fontSize: "0.625rem", color: "var(--adm-muted)", textTransform: "capitalize" }}>
                {user.role.replace("_", " ")}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--adm-muted)", padding: 4, borderRadius: 6, transition: "color 0.15s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--adm-text)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--adm-muted)")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        ) : (
          <div style={{ height: 36 }} />
        )}
      </div>
    </>
  );

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 998, display: "none" }}
          className="admin-sidebar-backdrop"
        />
      )}
      <aside
        className="admin-sidebar"
        style={{
          width: 228, flexShrink: 0,
          background: "var(--adm-surface)",
          borderRight: "1px solid var(--adm-border)",
          display: "flex", flexDirection: "column",
          height: "100vh", position: "sticky", top: 0,
          overflowY: "auto", zIndex: 999,
          transition: "transform 0.25s ease",
        }}
      >
        {sidebarContent}
      </aside>
      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed !important; top: 0 !important; left: 0 !important;
            bottom: 0 !important; height: 100vh !important;
            transform: ${open ? "translateX(0)" : "translateX(-100%)"} !important;
          }
          .admin-sidebar-backdrop { display: block !important; }
          .admin-sidebar-close { display: flex !important; }
        }
      `}</style>
    </>
  );
}
