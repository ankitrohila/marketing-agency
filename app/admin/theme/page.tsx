"use client";
import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";

interface AdminUser { id: string; name: string; email: string; role: string; avatar: string; }

interface ThemeSettings {
  fonts: {
    provider: string;
    googleFontsUrl: string;
    adobeFontsProjectId: string;
    customFontImport: string;
    headingFont: string;
    bodyFont: string;
    monoFont: string;
  };
  typography: Record<string, { size: string; weight: string; lineHeight: string; letterSpacing: string }>;
  colors: Record<string, string>;
}

const TABS = ["Typography & Fonts", "Color System", "Preview"];
const TYPO_TAGS = ["h1","h2","h3","h4","h5","h6","body","small"] as const;
const TYPO_LABELS: Record<string, string> = { h1: "H1 — Display", h2: "H2 — Section Heading", h3: "H3 — Sub-heading", h4: "H4 — Card Title", h5: "H5 — Label Large", h6: "H6 — Label Small", body: "Body Text", small: "Small / Caption" };

const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
  width: "100%", padding: "8px 11px", borderRadius: 7,
  background: "var(--adm-card2)", border: "1px solid var(--adm-border2)",
  color: "var(--adm-text)", fontSize: "0.8125rem", outline: "none", fontFamily: "inherit", ...extra,
});
const lbl: React.CSSProperties = { display: "block", fontSize: "0.5625rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 };
const card = (extra?: React.CSSProperties): React.CSSProperties => ({ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 10, padding: "20px 22px", marginBottom: 16, ...extra });

const DEFAULT: ThemeSettings = {
  fonts: { provider: "google", googleFontsUrl: "", adobeFontsProjectId: "", customFontImport: "", headingFont: "Inter", bodyFont: "Inter", monoFont: "'Fira Code', monospace" },
  typography: {
    h1:    { size: "clamp(3rem,7vw,7.5rem)", weight: "800", lineHeight: "0.92", letterSpacing: "-0.04em" },
    h2:    { size: "clamp(2rem,4vw,3.75rem)",  weight: "800", lineHeight: "1.0",  letterSpacing: "-0.035em" },
    h3:    { size: "1.75rem",  weight: "700", lineHeight: "1.1",  letterSpacing: "-0.02em" },
    h4:    { size: "1.375rem", weight: "700", lineHeight: "1.2",  letterSpacing: "-0.01em" },
    h5:    { size: "1.125rem", weight: "700", lineHeight: "1.3",  letterSpacing: "0" },
    h6:    { size: "0.9375rem",weight: "600", lineHeight: "1.4",  letterSpacing: "0" },
    body:  { size: "1rem",     weight: "400", lineHeight: "1.7",  letterSpacing: "0" },
    small: { size: "0.875rem", weight: "400", lineHeight: "1.6",  letterSpacing: "0" },
  },
  colors: {
    brandPrimary: "#E8312A", brandSecondary: "#FF8C19",
    bgDark: "#111111", bgLight: "#FAFAFA",
    textDark: "#F5F5F5", textLight: "#111111",
    mutedDark: "#888888", mutedLight: "#666666",
    borderDark: "rgba(255,255,255,0.08)", borderLight: "rgba(0,0,0,0.10)",
    cardDark: "#222222", cardLight: "#E5E5E5",
    btnPrimaryBg: "#E8312A", btnPrimaryText: "#ffffff",
    btnSecondaryBg: "transparent", btnSecondaryText: "inherit",
  },
};

function token() { return typeof window !== "undefined" ? localStorage.getItem("bt_admin_token") || "" : ""; }

export default function AdminThemePage() {
  const [user,    setUser]    = useState<AdminUser | null>(null);
  const [tab,     setTab]     = useState(0);
  const [theme,   setTheme]   = useState<ThemeSettings>(DEFAULT);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("bt_admin_user");
    if (s) setUser(JSON.parse(s));
    fetch("/api/admin/theme", { headers: { "x-admin-token": token() } })
      .then(r => r.json())
      .then(d => { if (d && d.fonts) setTheme({ ...DEFAULT, ...d, fonts: { ...DEFAULT.fonts, ...d.fonts }, typography: { ...DEFAULT.typography, ...d.typography }, colors: { ...DEFAULT.colors, ...d.colors } }); })
      .catch(() => {});
  }, []);

  async function saveAll() {
    setSaving(true);
    await fetch("/api/admin/theme", { method: "PUT", headers: { "Content-Type": "application/json", "x-admin-token": token() }, body: JSON.stringify(theme) });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  }

  function updateFont(k: keyof ThemeSettings["fonts"], v: string) {
    setTheme(p => ({ ...p, fonts: { ...p.fonts, [k]: v } }));
  }
  function updateTypo(tag: string, k: string, v: string) {
    setTheme(p => ({ ...p, typography: { ...p.typography, [tag]: { ...p.typography[tag], [k]: v } } }));
  }
  function updateColor(k: string, v: string) {
    setTheme(p => ({ ...p, colors: { ...p.colors, [k]: v } }));
  }

  const colorFields: [string, string][] = [
    ["brandPrimary",     "Brand Primary"],
    ["brandSecondary",   "Brand Secondary"],
    ["bgDark",           "Background — Dark Mode"],
    ["bgLight",          "Background — Light Mode"],
    ["textDark",         "Text — Dark Mode"],
    ["textLight",        "Text — Light Mode"],
    ["mutedDark",        "Muted Text — Dark"],
    ["mutedLight",       "Muted Text — Light"],
    ["borderDark",       "Border — Dark"],
    ["borderLight",      "Border — Light"],
    ["cardDark",         "Card Surface — Dark"],
    ["cardLight",        "Card Surface — Light"],
    ["btnPrimaryBg",     "Button Primary BG"],
    ["btnPrimaryText",   "Button Primary Text"],
  ];

  return (
    <>
      <AdminHeader title="Theme & Fonts" user={user} />
      <main style={{ flex: 1, overflowY: "auto" }}>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--adm-border)", padding: "0 28px", background: "var(--adm-surface)", position: "sticky", top: 0, zIndex: 10 }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{ padding: "13px 16px", border: "none", background: "transparent", color: tab === i ? "var(--adm-text)" : "var(--adm-muted)", fontSize: "0.8125rem", fontWeight: tab === i ? 600 : 400, cursor: "pointer", borderBottom: `2px solid ${tab === i ? "var(--adm-text)" : "transparent"}`, whiteSpace: "nowrap", transition: "all 0.15s" }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ padding: 28, maxWidth: 820 }}>

          {/* ── Tab 0: Typography & Fonts ── */}
          {tab === 0 && (
            <div>
              {/* Font Source */}
              <div style={card()}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 14 }}>Font Source</h3>
                <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
                  {[["google","Google Fonts"],["adobe","Adobe Fonts"],["custom","Custom CSS"]].map(([v,l]) => (
                    <button key={v} onClick={() => updateFont("provider", v)}
                      style={{ padding: "7px 14px", borderRadius: 7, border: `1px solid ${theme.fonts.provider === v ? "var(--adm-border2)" : "var(--adm-border)"}`, background: theme.fonts.provider === v ? "var(--adm-card2)" : "transparent", color: theme.fonts.provider === v ? "var(--adm-text)" : "var(--adm-muted)", fontSize: "0.8125rem", fontWeight: theme.fonts.provider === v ? 600 : 400, cursor: "pointer" }}>
                      {l}
                    </button>
                  ))}
                </div>

                {theme.fonts.provider === "google" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={lbl}>Google Fonts Import URL</label>
                      <input value={theme.fonts.googleFontsUrl} onChange={e => updateFont("googleFontsUrl", e.target.value)}
                        placeholder="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
                        style={inp()}
                      />
                      <p style={{ fontSize: "0.6875rem", color: "var(--adm-muted)", marginTop: 5 }}>
                        Go to <a href="https://fonts.google.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--adm-muted2)" }}>fonts.google.com</a>, select a font, copy the CSS @import URL and paste here.
                      </p>
                    </div>
                  </div>
                )}

                {theme.fonts.provider === "adobe" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={lbl}>Adobe Fonts Project ID (Typekit)</label>
                      <input value={theme.fonts.adobeFontsProjectId} onChange={e => updateFont("adobeFontsProjectId", e.target.value)}
                        placeholder="e.g. abc1234"
                        style={inp()}
                      />
                      <p style={{ fontSize: "0.6875rem", color: "var(--adm-muted)", marginTop: 5 }}>
                        Find your project ID at <a href="https://fonts.adobe.com/my_fonts" target="_blank" rel="noopener noreferrer" style={{ color: "var(--adm-muted2)" }}>fonts.adobe.com/my_fonts</a> → Web Projects. The kit embed code contains your Project ID.
                      </p>
                    </div>
                  </div>
                )}

                {theme.fonts.provider === "custom" && (
                  <div>
                    <label style={lbl}>Custom @font-face CSS</label>
                    <textarea value={theme.fonts.customFontImport} onChange={e => updateFont("customFontImport", e.target.value)}
                      rows={6} placeholder={"@font-face {\n  font-family: 'MyFont';\n  src: url('/fonts/myfont.woff2') format('woff2');\n}"}
                      style={{ ...inp({ fontFamily: "monospace", fontSize: "0.75rem", resize: "vertical" }) }}
                    />
                  </div>
                )}
              </div>

              {/* Font assignments */}
              <div style={card()}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 14 }}>Font Assignments</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {([["headingFont","Heading Font"],["bodyFont","Body Font"],["monoFont","Monospace Font"]] as [keyof ThemeSettings["fonts"], string][]).map(([k, label]) => (
                    <div key={k}>
                      <label style={lbl}>{label}</label>
                      <input value={theme.fonts[k]} onChange={e => updateFont(k, e.target.value)} placeholder="Inter" style={inp()} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography scale */}
              <div style={card()}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 14 }}>Typography Scale</h3>
                <p style={{ fontSize: "0.75rem", color: "var(--adm-muted)", marginBottom: 16 }}>
                  These values map directly to CSS custom properties loaded on every page.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {/* Header row */}
                  <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 80px 80px 110px", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--adm-border)", marginBottom: 8 }}>
                    {["Tag","Size","Weight","Line H.","Letter Sp."].map(h => (
                      <span key={h} style={{ fontSize: "0.5625rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</span>
                    ))}
                  </div>
                  {TYPO_TAGS.map(tag => {
                    const t = theme.typography[tag] || DEFAULT.typography[tag];
                    return (
                      <div key={tag} style={{ display: "grid", gridTemplateColumns: "100px 1fr 80px 80px 110px", gap: 8, marginBottom: 8, alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-text)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{tag.toUpperCase()}</span>
                          <div style={{ fontSize: "0.5625rem", color: "var(--adm-muted)" }}>{TYPO_LABELS[tag]}</div>
                        </div>
                        <input value={t.size} onChange={e => updateTypo(tag, "size", e.target.value)} style={inp({ fontSize: "0.75rem" })} />
                        <input value={t.weight} onChange={e => updateTypo(tag, "weight", e.target.value)} placeholder="700" style={inp({ fontSize: "0.75rem" })} />
                        <input value={t.lineHeight} onChange={e => updateTypo(tag, "lineHeight", e.target.value)} placeholder="1.2" style={inp({ fontSize: "0.75rem" })} />
                        <input value={t.letterSpacing} onChange={e => updateTypo(tag, "letterSpacing", e.target.value)} placeholder="-0.03em" style={inp({ fontSize: "0.75rem" })} />
                      </div>
                    );
                  })}
                </div>
              </div>

              <button onClick={saveAll} disabled={saving}
                style={{ padding: "9px 22px", borderRadius: 7, border: "none", background: "var(--adm-text)", color: "var(--adm-bg)", fontSize: "0.8125rem", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Saving…" : saved ? "Saved ✓" : "Save Typography & Fonts"}
              </button>
            </div>
          )}

          {/* ── Tab 1: Color System ── */}
          {tab === 1 && (
            <div>
              <div style={card()}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 6 }}>Global Color Palette</h3>
                <p style={{ fontSize: "0.75rem", color: "var(--adm-muted)", marginBottom: 18 }}>
                  These values override the default CSS custom properties across the entire site. Changes take effect on next page load.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {colorFields.map(([key, label]) => {
                    const val = theme.colors[key] || "";
                    const isHex = /^#[0-9a-fA-F]{3,8}$/.test(val.trim());
                    return (
                      <div key={key}>
                        <label style={lbl}>{label}</label>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {isHex && (
                            <input type="color" value={val} onChange={e => updateColor(key, e.target.value)}
                              style={{ width: 36, height: 36, padding: 2, borderRadius: 6, border: "1px solid var(--adm-border2)", background: "none", cursor: "pointer", flexShrink: 0 }}
                            />
                          )}
                          <input value={val} onChange={e => updateColor(key, e.target.value)}
                            placeholder="#E8312A or rgba(0,0,0,0.08)"
                            style={inp({ flex: "1" as unknown as React.CSSProperties["flex"] })}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={card()}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 10 }}>Generated CSS Variables</h3>
                <p style={{ fontSize: "0.75rem", color: "var(--adm-muted)", marginBottom: 10 }}>Preview of what will be injected into the site stylesheet.</p>
                <pre style={{ fontSize: "0.6875rem", color: "var(--adm-muted2)", background: "var(--adm-card2)", padding: 14, borderRadius: 8, overflow: "auto", lineHeight: 1.8, fontFamily: "monospace" }}>
{`:root {
  --bt-red: ${theme.colors.brandPrimary};
  --bt-gold: ${theme.colors.brandSecondary};
  --bt-black: ${theme.colors.bgDark};
  --bt-white: ${theme.colors.textDark};
  --bt-muted: ${theme.colors.mutedDark};
  --bt-border: ${theme.colors.borderDark};
  --bt-card: ${theme.colors.cardDark};
}
[data-theme="light"] {
  --bt-black: ${theme.colors.bgLight};
  --bt-white: ${theme.colors.textLight};
  --bt-muted: ${theme.colors.mutedLight};
  --bt-border: ${theme.colors.borderLight};
  --bt-card: ${theme.colors.cardLight};
}`}
                </pre>
              </div>

              <button onClick={saveAll} disabled={saving}
                style={{ padding: "9px 22px", borderRadius: 7, border: "none", background: "var(--adm-text)", color: "var(--adm-bg)", fontSize: "0.8125rem", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Saving…" : saved ? "Saved ✓" : "Save Colors"}
              </button>
            </div>
          )}

          {/* ── Tab 2: Preview ── */}
          {tab === 2 && (
            <div>
              <div style={card()}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 14 }}>Typography Preview</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {TYPO_TAGS.map(tag => {
                    const t = theme.typography[tag] || DEFAULT.typography[tag];
                    return (
                      <div key={tag} style={{ borderBottom: "1px solid var(--adm-border)", paddingBottom: 10 }}>
                        <div style={{ fontSize: "0.5625rem", color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{TYPO_LABELS[tag]}</div>
                        <div style={{ fontSize: t.size, fontWeight: t.weight, lineHeight: t.lineHeight, letterSpacing: t.letterSpacing, color: "var(--adm-text)", fontFamily: tag === "body" || tag === "small" ? theme.fonts.bodyFont : theme.fonts.headingFont, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                          The quick brown fox jumps
                        </div>
                        <div style={{ fontSize: "0.5625rem", color: "var(--adm-muted)", marginTop: 3 }}>
                          {t.size} · {t.weight} · lh {t.lineHeight} · ls {t.letterSpacing}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={card()}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 14 }}>Color Swatches</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {colorFields.slice(0, 10).map(([key, label]) => {
                    const val = theme.colors[key];
                    const isHex = /^#[0-9a-fA-F]{3,8}$/.test((val || "").trim());
                    return (
                      <div key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 8, background: val, border: "1px solid var(--adm-border)", flexShrink: 0 }} />
                        <div style={{ fontSize: "0.5625rem", color: "var(--adm-muted)", textAlign: "center", maxWidth: 60, lineHeight: 1.3 }}>{label}</div>
                        {isHex && <div style={{ fontSize: "0.5625rem", color: "var(--adm-muted2)", fontFamily: "monospace" }}>{val}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={card()}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 14 }}>Button Preview</h3>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <button style={{ padding: "12px 28px", borderRadius: 99, background: theme.colors.btnPrimaryBg, color: theme.colors.btnPrimaryText, border: "none", fontSize: "0.9375rem", fontWeight: 700, cursor: "pointer" }}>
                    Primary Button
                  </button>
                  <button style={{ padding: "12px 28px", borderRadius: 99, background: "transparent", color: "var(--adm-text)", border: `1px solid var(--adm-border2)`, fontSize: "0.9375rem", fontWeight: 600, cursor: "pointer" }}>
                    Secondary Button
                  </button>
                  <button style={{ padding: "12px 28px", borderRadius: 99, background: "var(--adm-card)", color: "var(--adm-muted2)", border: `1px solid var(--adm-border)`, fontSize: "0.9375rem", fontWeight: 500, cursor: "pointer" }}>
                    Ghost Button
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
