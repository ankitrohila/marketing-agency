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

interface Stats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalUsers: number;
  totalViews: number;
  totalLeads: number;
  monthlyVisitors: { month: string; count: number }[];
  topPosts: { title: string; slug: string; category: string; views: number }[];
  recentActivity: { id: string; type: string; description: string; user: string; timestamp: string }[];
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ActivityIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    post_published: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    post_draft: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    user_login: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>,
    user_created: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
    settings_updated: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4"/></svg>,
    redirect_created: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  };
  return <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, background: "rgba(255,255,255,0.04)", borderRadius: 8, flexShrink: 0 }}>{icons[type] || icons.post_published}</span>;
}

export default function DashboardPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("bt_admin_user");
    const token = localStorage.getItem("bt_admin_token");
    if (stored) setUser(JSON.parse(stored));

    fetch("/api/admin/stats", { headers: { "x-admin-token": token || "" } })
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const statCards = [
    { label: "Total Posts", value: stats?.totalPosts ?? "—", trend: "+2 this week", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, color: "#60A5FA" },
    { label: "Published", value: stats?.publishedPosts ?? "—", trend: "Live & indexed", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, color: "#34D399" },
    { label: "Total Users", value: stats?.totalUsers ?? "—", trend: "+1 this month", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, color: "#A78BFA" },
    { label: "Monthly Visitors", value: stats ? stats.monthlyVisitors[stats.monthlyVisitors.length - 1]?.count.toLocaleString() : "—", trend: "+16% vs last month", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, color: "#FB923C" },
  ];

  const maxVisitors = stats ? Math.max(...stats.monthlyVisitors.map((m) => m.count)) : 1;

  return (
    <>
      <AdminHeader title="Dashboard" user={user} />
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        {/* Welcome header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#F5F5F5", letterSpacing: "-0.03em", marginBottom: 4 }}>
              {greeting}, {user?.name?.split(" ")[0] || "there"}
            </h2>
            <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.4)" }}>{today}</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { label: "New Post", href: "/admin/posts/new", primary: true },
              { label: "Add User", href: "/admin/users", primary: false },
              { label: "View Site", href: "/", primary: false },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                target={action.href === "/" ? "_blank" : undefined}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  background: action.primary ? "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)" : "rgba(255,255,255,0.05)",
                  color: action.primary ? "#fff" : "rgba(255,255,255,0.6)",
                  border: action.primary ? "none" : "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.2s",
                }}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {statCards.map((card) => (
            <div
              key={card.label}
              style={{
                background: "#141414",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14,
                padding: "20px 20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{card.label}</span>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, background: `${card.color}15`, borderRadius: 8 }}>{card.icon}</span>
              </div>
              <div style={{ fontSize: "1.875rem", fontWeight: 800, color: "#F5F5F5", letterSpacing: "-0.04em", marginBottom: 6 }}>{loading ? "—" : card.value}</div>
              <div style={{ fontSize: "0.75rem", color: card.color }}>{card.trend}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, marginBottom: 28 }}>
          {/* Bar chart */}
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "24px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F5F5F5" }}>Monthly Visitors</h3>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", padding: "4px 10px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6 }}>Last 12 months</span>
            </div>
            {stats ? (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140 }}>
                {stats.monthlyVisitors.map((m, i) => {
                  const heightPct = (m.count / maxVisitors) * 100;
                  const isLast = i === stats.monthlyVisitors.length - 1;
                  return (
                    <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                      <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                        <div
                          style={{
                            width: "100%",
                            height: `${heightPct}%`,
                            background: isLast ? "linear-gradient(180deg, #E8312A 0%, #FF6B1A 100%)" : "rgba(255,255,255,0.08)",
                            borderRadius: "4px 4px 0 0",
                            transition: "height 0.5s ease",
                            minHeight: 4,
                          }}
                          title={`${m.month}: ${m.count.toLocaleString()}`}
                        />
                      </div>
                      <span style={{ fontSize: "0.5625rem", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>{m.month}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)" }}>Loading...</div>
            )}
          </div>

          {/* Top posts */}
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "24px 24px" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F5F5F5", marginBottom: 18 }}>Top Performing Posts</h3>
            {stats?.topPosts ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {stats.topPosts.map((post, i) => (
                  <div key={post.slug} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6875rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#F5F5F5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{post.title}</div>
                      <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.35)" }}>{post.category}</div>
                    </div>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#FB923C", flexShrink: 0 }}>{post.views.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem" }}>Loading...</div>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
          {/* Recent activity */}
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "24px 24px" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F5F5F5", marginBottom: 18 }}>Recent Activity</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(stats?.recentActivity || []).map((activity) => (
                <div key={activity.id} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <ActivityIcon type={activity.type} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.8125rem", color: "#F5F5F5", marginBottom: 2 }}>{activity.description}</div>
                    <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.35)" }}>by {activity.user} · {timeAgo(activity.timestamp)}</div>
                  </div>
                </div>
              ))}
              {!stats && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem" }}>Loading...</div>}
            </div>
          </div>

          {/* Lead stats */}
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "24px 24px" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F5F5F5", marginBottom: 6 }}>Lead Stats</h3>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>Form submissions & enquiries</p>
            <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: "1.875rem", fontWeight: 800, color: "#34D399", letterSpacing: "-0.04em" }}>{stats?.totalLeads || 284}</div>
                <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.35)" }}>Total submissions</div>
              </div>
              <div>
                <div style={{ fontSize: "1.875rem", fontWeight: 800, color: "#60A5FA", letterSpacing: "-0.04em" }}>47</div>
                <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.35)" }}>This month</div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Recent Leads</div>
              {[
                { name: "Vikram Shah", email: "vikram@startup.in", time: "2h ago" },
                { name: "Neha Gupta", email: "neha@d2cbrand.com", time: "5h ago" },
                { name: "Arjun Mehta", email: "arjun@scale.io", time: "1d ago" },
                { name: "Sanya Kapoor", email: "sanya@brand.in", time: "2d ago" },
              ].map((lead) => (
                <div key={lead.email} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#F5F5F5" }}>{lead.name}</div>
                    <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.35)" }}>{lead.email}</div>
                  </div>
                  <span style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.3)" }}>{lead.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
