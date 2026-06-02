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

interface SiteSettings {
  siteName: string;
  tagline: string;
  siteUrl: string;
  email: string;
  phone: string;
  address: string;
  socialLinks: { linkedin: string; instagram: string; twitter: string };
  maintenanceMode: boolean;
  allowComments: boolean;
  postsPerPage: number;
  timezone: string;
  language: string;
  currency: string;
}

const TABS = ["General", "Appearance", "Email", "Integrations", "Advanced"];

export default function AdminSettingsPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [tab, setTab] = useState(0);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("bt_admin_user");
    if (stored) setUser(JSON.parse(stored));
    const token = localStorage.getItem("bt_admin_token") || "";
    fetch("/api/admin/settings", { headers: { "x-admin-token": token } })
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    const token = localStorage.getItem("bt_admin_token") || "";
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  function update(key: keyof SiteSettings, value: unknown) {
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev);
  }

  const inputStyle: React.CSSProperties = { width: "100%", background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", borderRadius: 8, color: "var(--adm-text)", fontSize: "0.875rem", padding: "10px 12px", outline: "none" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.8125rem", color: "var(--adm-muted2)", marginBottom: 6 };

  if (!settings) {
    return (
      <>
        <AdminHeader title="Settings" user={user} />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--adm-muted)" }}>Loading...</main>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Site Settings" user={user} />
      <main style={{ flex: 1, overflowY: "auto" }}>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--adm-border)", padding: "0 32px", background: "var(--adm-surface)", position: "sticky", top: 0, zIndex: 10 }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{ padding: "14px 18px", border: "none", background: "transparent", color: tab === i ? "var(--adm-text)" : "var(--adm-muted)", fontSize: "0.875rem", fontWeight: tab === i ? 700 : 400, cursor: "pointer", borderBottom: `2px solid ${tab === i ? "var(--adm-text)" : "transparent"}`, whiteSpace: "nowrap", transition: "all 0.15s" }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ padding: "32px 32px", maxWidth: 700 }}>
          {/* Tab 0: General */}
          {tab === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 4 }}>General Settings</h3>
              <div>
                <label style={labelStyle}>Site Name</label>
                <input type="text" value={settings.siteName} onChange={(e) => update("siteName", e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Tagline</label>
                <input type="text" value={settings.tagline} onChange={(e) => update("tagline", e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Website URL</label>
                <input type="url" value={settings.siteUrl || ""} onChange={(e) => update("siteUrl", e.target.value)} placeholder="https://thebrandthink.com" style={inputStyle} />
                <p style={{ fontSize: "0.6875rem", color: "var(--adm-muted)", marginTop: 4 }}>Used for canonical URLs, sitemaps, and OG tags</p>
              </div>
              <div>
                <label style={labelStyle}>Contact Email</label>
                <input type="email" value={settings.email} onChange={(e) => update("email", e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input type="text" value={settings.phone} onChange={(e) => update("phone", e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Address</label>
                <input type="text" value={settings.address} onChange={(e) => update("address", e.target.value)} style={inputStyle} />
              </div>
              <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--adm-muted2)", marginBottom: 0, marginTop: 8 }}>Social Links</h4>
              {(["linkedin", "instagram", "twitter"] as const).map((s) => (
                <div key={s}>
                  <label style={labelStyle}>{s.charAt(0).toUpperCase() + s.slice(1)}</label>
                  <input type="text" value={settings.socialLinks[s]} onChange={(e) => update("socialLinks", { ...settings.socialLinks, [s]: e.target.value })} style={inputStyle} />
                </div>
              ))}
              <button onClick={handleSave} disabled={saving} style={{ alignSelf: "flex-start", padding: "10px 24px", borderRadius: 8, background: saving ? "var(--adm-card)" : "var(--adm-text)", border: "none", color: saving ? "var(--adm-muted)" : "var(--adm-bg)", fontSize: "0.875rem", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Saving..." : saved ? "✓ Saved" : "Save General Settings"}
              </button>
            </div>
          )}

          {/* Tab 1: Appearance */}
          {tab === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 4 }}>Appearance Settings</h3>
              <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 12, padding: "20px" }}>
                <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 12 }}>Theme</h4>
                <div style={{ display: "flex", gap: 12 }}>
                  {["Dark", "Light", "Auto"].map((t) => (
                    <button key={t} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid var(--adm-border2)", background: "transparent", color: "var(--adm-muted2)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 12, padding: "20px" }}>
                <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 12 }}>Brand Colors</h4>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[
                    { label: "Primary", color: "#E8312A" },
                    { label: "Background", color: "#111111" },
                    { label: "Surface", color: "#191919" },
                    { label: "Card", color: "#222222" },
                  ].map((c) => (
                    <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: c.color, border: "1px solid var(--adm-border2)" }} />
                      <div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--adm-text)" }}>{c.label}</div>
                        <div style={{ fontSize: "0.6875rem", color: "var(--adm-muted)", fontFamily: "monospace" }}>{c.color}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--adm-muted)" }}>Theme and color customization is managed via CSS variables in globals.css.</p>
            </div>
          )}

          {/* Tab 2: Email */}
          {tab === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 4 }}>Email Settings</h3>
              {[
                { label: "SMTP Host", placeholder: "smtp.gmail.com" },
                { label: "SMTP Port", placeholder: "587" },
                { label: "SMTP Username", placeholder: "noreply@thebrandthink.com" },
                { label: "SMTP Password", placeholder: "••••••••••••" },
                { label: "From Email", placeholder: "hello@thebrandthink.com" },
                { label: "From Name", placeholder: "BrandThink" },
              ].map((f) => (
                <div key={f.label}>
                  <label style={labelStyle}>{f.label}</label>
                  <input type={f.label.includes("Password") ? "password" : "text"} placeholder={f.placeholder} style={inputStyle} />
                </div>
              ))}
              <p style={{ fontSize: "0.8125rem", color: "var(--adm-muted)" }}>Email configuration requires server environment variables. Contact your hosting provider.</p>
            </div>
          )}

          {/* Tab 3: Integrations */}
          {tab === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 4 }}>Third-Party Integrations</h3>
              {[
                { name: "Razorpay", desc: "Payment gateway for India", keys: ["API Key", "Secret Key"] },
                { name: "Stripe", desc: "International payments", keys: ["Publishable Key", "Secret Key"] },
                { name: "SendGrid", desc: "Transactional email", keys: ["API Key"] },
                { name: "Twilio", desc: "SMS notifications", keys: ["Account SID", "Auth Token"] },
              ].map((integration) => (
                <div key={integration.name} style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--adm-text)" }}>{integration.name}</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--adm-muted)" }}>{integration.desc}</div>
                    </div>
                    <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: "0.6875rem", fontWeight: 700, background: "rgba(255,255,255,0.05)", color: "var(--adm-muted)" }}>Not connected</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {integration.keys.map((k) => (
                      <div key={k}>
                        <label style={labelStyle}>{k}</label>
                        <input type="password" placeholder={`Enter ${k}...`} style={inputStyle} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Advanced */}
          {tab === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 4 }}>Advanced Settings</h3>
              {[
                { label: "Maintenance Mode", key: "maintenanceMode" as const, type: "toggle", description: "Put the site in maintenance mode — visitors will see a maintenance page." },
                { label: "Allow Comments", key: "allowComments" as const, type: "toggle", description: "Enable or disable comments on blog posts." },
              ].map((field) => (
                <div key={field.key} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, padding: "16px 18px", background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 12 }}>
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--adm-text)", marginBottom: 4 }}>{field.label}</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--adm-muted)" }}>{field.description}</div>
                  </div>
                  <button
                    onClick={() => update(field.key, !settings[field.key])}
                    style={{ width: 44, height: 24, borderRadius: 12, background: settings[field.key] ? "var(--adm-text)" : "var(--adm-border2)", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}
                  >
                    <div style={{ position: "absolute", top: 2, left: settings[field.key] ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
                  </button>
                </div>
              ))}
              <div>
                <label style={labelStyle}>Posts Per Page</label>
                <input type="number" value={settings.postsPerPage} onChange={(e) => update("postsPerPage", parseInt(e.target.value) || 9)} min={1} max={50} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Timezone</label>
                <select value={settings.timezone} onChange={(e) => update("timezone", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  {["Asia/Kolkata", "UTC", "America/New_York", "Europe/London", "Asia/Singapore"].map((tz) => <option key={tz}>{tz}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Language</label>
                <select value={settings.language} onChange={(e) => update("language", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  {["en-IN", "en-US", "en-GB", "hi-IN"].map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <button onClick={handleSave} disabled={saving} style={{ alignSelf: "flex-start", padding: "10px 24px", borderRadius: 8, background: saving ? "var(--adm-card)" : "var(--adm-text)", border: "none", color: saving ? "var(--adm-muted)" : "var(--adm-bg)", fontSize: "0.875rem", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Saving..." : saved ? "✓ Saved" : "Save Advanced Settings"}
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
