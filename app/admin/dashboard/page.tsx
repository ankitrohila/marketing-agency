"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
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
  return <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, background: "var(--adm-border)", borderRadius: 8, flexShrink: 0 }}>{icons[type] || icons.post_published}</span>;
}

export default function DashboardPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);
  const [themeTick, setThemeTick] = useState(0); // increments on theme toggle → triggers chart rebuild
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("bt_admin_user");
    const token = localStorage.getItem("bt_admin_token");
    if (stored) setUser(JSON.parse(stored));

    // If Chart.js was already loaded by a previous render (e.g., HMR), mark ready now
    if ((window as any).Chart) setChartReady(true);

    fetch("/api/admin/stats", { headers: { "x-admin-token": token || "" } })
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Watch for data-theme changes on <html> and bump themeTick to trigger chart rebuild
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeTick((t) => t + 1);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  // Build/rebuild Chart.js instance when data, script, or theme changes
  useEffect(() => {
    if (!stats || !chartReady || !chartRef.current) return;
    const ChartJS = (window as any).Chart;
    if (!ChartJS) return;

    // Destroy previous instance to avoid canvas reuse error
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const isDark = document.documentElement.getAttribute("data-theme") !== "light";
    const gridColor    = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
    const tickColor    = isDark ? "rgba(255,255,255,0.4)"  : "rgba(0,0,0,0.45)";
    const inactiveBar  = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)";

    const labels = stats.monthlyVisitors.map((m) => m.month);
    const data   = stats.monthlyVisitors.map((m) => m.count);
    const colors = data.map((_, i) =>
      i === data.length - 1
        ? (isDark
            ? { start: "#E8312A", end: "#FF6B1A" }
            : { start: "#E8312A", end: "#FF6B1A" })
        : null
    );

    // Create gradient for last (active) bar
    const ctx = chartRef.current.getContext("2d");
    const gradient = ctx?.createLinearGradient(0, 0, 0, 200);
    gradient?.addColorStop(0, "#E8312A");
    gradient?.addColorStop(1, "#FF6B1A");

    const bgColors = data.map((_, i) =>
      i === data.length - 1 ? (gradient || "#E8312A") : inactiveBar
    );

    chartInstanceRef.current = new ChartJS(chartRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: bgColors,
          borderRadius: 5,
          borderSkipped: false,
          maxBarThickness: 32,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600, easing: "easeOutQuart" },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
            titleColor: isDark ? "#F5F5F5" : "#111111",
            bodyColor: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
            borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx: any) => ` ${ctx.parsed.y.toLocaleString()} visitors`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: tickColor,
              font: { size: 9, weight: "600" },
            },
          },
          y: {
            grid: { color: gridColor },
            border: { display: false },
            ticks: {
              color: tickColor,
              font: { size: 9 },
              maxTicksLimit: 5,
              callback: (val: any) =>
                val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [stats, chartReady, themeTick]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const statCards = [
    { label: "Total Posts",       value: stats?.totalPosts ?? "—",  trend: "+2 this week",       icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, color: "#60A5FA" },
    { label: "Published",         value: stats?.publishedPosts ?? "—", trend: "Live & indexed", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, color: "#34D399" },
    { label: "Total Users",       value: stats?.totalUsers ?? "—",  trend: "+1 this month",      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, color: "#A78BFA" },
    { label: "Monthly Visitors",  value: stats ? stats.monthlyVisitors[stats.monthlyVisitors.length - 1]?.count.toLocaleString() : "—", trend: "+16% vs last month", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, color: "#FB923C" },
  ];

  return (
    <>
      {/* Load Chart.js from public folder */}
      <Script
        src="/js/chart.min.js"
        strategy="afterInteractive"
        onLoad={() => setChartReady(true)}
      />

      <AdminHeader title="Dashboard" user={user} />
      <main className="adm-page-main" style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

        {/* Welcome header */}
        <div
          className="adm-welcome-row"
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}
        >
          <div>
            <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--adm-text)", letterSpacing: "-0.03em", marginBottom: 4 }}>
              {greeting}, {user?.name?.split(" ")[0] || "there"}
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--adm-muted)" }}>{today}</p>
          </div>
          <div className="adm-welcome-btns" style={{ display: "flex", gap: 10 }}>
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
                  background: action.primary ? "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)" : "var(--adm-card)",
                  color: action.primary ? "#fff" : "var(--adm-muted2)",
                  border: action.primary ? "none" : "1px solid var(--adm-border2)",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Stats row — responsive 4→2→2 col */}
        <div className="adm-stats-grid">
          {statCards.map((card) => (
            <div
              key={card.label}
              style={{
                background: "var(--adm-card)",
                border: "1px solid var(--adm-border)",
                borderRadius: 14,
                padding: "20px 20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{card.label}</span>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, background: `${card.color}15`, borderRadius: 8 }}>{card.icon}</span>
              </div>
              <div style={{ fontSize: "1.875rem", fontWeight: 800, color: "var(--adm-text)", letterSpacing: "-0.04em", marginBottom: 6 }}>{loading ? "—" : card.value}</div>
              <div style={{ fontSize: "0.75rem", color: card.color }}>{card.trend}</div>
            </div>
          ))}
        </div>

        {/* Charts row — responsive stacks at 1100px */}
        <div className="adm-charts-row">
          {/* Chart.js bar chart */}
          <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 14, padding: "24px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--adm-text)" }}>Monthly Visitors</h3>
              <span style={{ fontSize: "0.75rem", color: "var(--adm-muted)", padding: "4px 10px", border: "1px solid var(--adm-border2)", borderRadius: 6 }}>Last 12 months</span>
            </div>
            <div style={{ height: 180, position: "relative" }}>
              {loading ? (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--adm-muted)", fontSize: "0.875rem" }}>
                  Loading chart…
                </div>
              ) : (
                <canvas ref={chartRef} style={{ width: "100%", height: "100%" }} />
              )}
            </div>
          </div>

          {/* Top posts */}
          <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 14, padding: "24px 24px" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 18 }}>Top Performing Posts</h3>
            {stats?.topPosts ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {stats.topPosts.map((post, i) => (
                  <div key={post.slug} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, background: "var(--adm-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--adm-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{post.title}</div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--adm-muted)" }}>{post.category}</div>
                    </div>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#FB923C", flexShrink: 0 }}>{post.views.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "var(--adm-muted)", fontSize: "0.875rem" }}>Loading...</div>
            )}
          </div>
        </div>

        {/* Bottom row — responsive stacks at 960px */}
        <div className="adm-bottom-row">
          {/* Recent activity */}
          <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 14, padding: "24px 24px" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 18 }}>Recent Activity</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(stats?.recentActivity || []).map((activity) => (
                <div key={activity.id} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <ActivityIcon type={activity.type} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.8125rem", color: "var(--adm-text)", marginBottom: 2 }}>{activity.description}</div>
                    <div style={{ fontSize: "0.6875rem", color: "var(--adm-muted)" }}>by {activity.user} · {timeAgo(activity.timestamp)}</div>
                  </div>
                </div>
              ))}
              {!stats && <div style={{ color: "var(--adm-muted)", fontSize: "0.875rem" }}>Loading...</div>}
            </div>
          </div>

          {/* Lead stats */}
          <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 14, padding: "24px 24px" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 6 }}>Lead Stats</h3>
            <p style={{ fontSize: "0.75rem", color: "var(--adm-muted)", marginBottom: 20 }}>Form submissions &amp; enquiries</p>
            <div style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "1.875rem", fontWeight: 800, color: "#34D399", letterSpacing: "-0.04em" }}>{stats?.totalLeads || 284}</div>
                <div style={{ fontSize: "0.6875rem", color: "var(--adm-muted)" }}>Total submissions</div>
              </div>
              <div>
                <div style={{ fontSize: "1.875rem", fontWeight: 800, color: "#60A5FA", letterSpacing: "-0.04em" }}>47</div>
                <div style={{ fontSize: "0.6875rem", color: "var(--adm-muted)" }}>This month</div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--adm-border)", paddingTop: 16 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Recent Leads</div>
              {[
                { name: "Vikram Shah",   email: "vikram@startup.in",    time: "2h ago" },
                { name: "Neha Gupta",    email: "neha@d2cbrand.com",    time: "5h ago" },
                { name: "Arjun Mehta",   email: "arjun@scale.io",       time: "1d ago" },
                { name: "Sanya Kapoor",  email: "sanya@brand.in",       time: "2d ago" },
              ].map((lead) => (
                <div key={lead.email} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--adm-border)" }}>
                  <div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--adm-text)" }}>{lead.name}</div>
                    <div style={{ fontSize: "0.6875rem", color: "var(--adm-muted)" }}>{lead.email}</div>
                  </div>
                  <span style={{ fontSize: "0.6875rem", color: "var(--adm-muted)" }}>{lead.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
