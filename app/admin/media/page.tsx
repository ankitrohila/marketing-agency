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

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  size: string;
  date: string;
  width: number;
  height: number;
  altText: string;
  title: string;
  caption: string;
  description: string;
}

const DEMO_MEDIA: MediaItem[] = [
  { id: "1", url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=400&h=300&q=70", filename: "performance-marketing.jpg", size: "342 KB", date: "2025-05-01", width: 800, height: 480, altText: "Performance marketing dashboard overview", title: "Performance Marketing", caption: "Tracking campaign ROI across channels", description: "" },
  { id: "2", url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&h=300&q=70", filename: "healthcare-martech.jpg", size: "287 KB", date: "2025-04-18", width: 800, height: 480, altText: "Healthcare marketing technology setup", title: "Healthcare MarTech", caption: "Digital tools for healthcare marketing", description: "" },
  { id: "3", url: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=400&h=300&q=70", filename: "brand-strategy.jpg", size: "318 KB", date: "2025-04-05", width: 800, height: 480, altText: "Brand strategy planning session", title: "Brand Strategy", caption: "Strategic brand positioning", description: "" },
  { id: "4", url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&h=300&q=70", filename: "novabev-case-study.jpg", size: "401 KB", date: "2025-03-22", width: 800, height: 480, altText: "NovaBev beverage brand case study", title: "NovaBev Case Study", caption: "Brand growth for NovaBev D2C", description: "" },
  { id: "5", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&h=300&q=70", filename: "ai-creative-production.jpg", size: "256 KB", date: "2025-03-10", width: 800, height: 480, altText: "AI-powered creative production workflow", title: "AI Creative Production", caption: "Automating creative with AI", description: "" },
  { id: "6", url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&h=300&q=70", filename: "ecommerce-cro.jpg", size: "374 KB", date: "2025-02-20", width: 800, height: 480, altText: "E-commerce conversion rate optimisation", title: "Ecommerce CRO", caption: "Optimising product pages for conversion", description: "" },
  { id: "7", url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=400&h=300&q=70", filename: "media-distribution.jpg", size: "298 KB", date: "2025-02-05", width: 800, height: 480, altText: "Media distribution across platforms", title: "Media Distribution", caption: "Multi-channel content distribution", description: "" },
  { id: "8", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&h=300&q=70", filename: "analytics-data.jpg", size: "332 KB", date: "2025-01-20", width: 800, height: 480, altText: "Analytics and data visualisation dashboard", title: "Analytics & Data", caption: "Data-driven decision making", description: "" },
  { id: "9", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&h=300&q=70", filename: "growth-marketing.jpg", size: "289 KB", date: "2025-01-10", width: 800, height: 480, altText: "Growth marketing strategy chart", title: "Growth Marketing", caption: "Scaling brands with data-led growth", description: "" },
  { id: "10", url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&h=300&q=70", filename: "team-work.jpg", size: "421 KB", date: "2024-12-15", width: 800, height: 480, altText: "Marketing team collaborating", title: "Team Work", caption: "Collaboration drives brand excellence", description: "" },
  { id: "11", url: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=400&h=300&q=70", filename: "startup-marketing.jpg", size: "310 KB", date: "2024-12-01", width: 800, height: 480, altText: "Startup marketing brainstorm", title: "Startup Marketing", caption: "Marketing strategies for early-stage startups", description: "" },
  { id: "12", url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=400&h=300&q=70", filename: "data-dashboard.jpg", size: "275 KB", date: "2024-11-20", width: 800, height: 480, altText: "Data dashboard metrics overview", title: "Data Dashboard", caption: "Real-time marketing metrics", description: "" },
];

export default function AdminMediaPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [media, setMedia] = useState<MediaItem[]>(DEMO_MEDIA);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploadModal, setUploadModal] = useState(false);
  const [detailItem, setDetailItem] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload form state
  const [newUrl, setNewUrl] = useState("");
  const [newFilename, setNewFilename] = useState("");
  const [newAltText, setNewAltText] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Detail modal edit state
  const [editAltText, setEditAltText] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Hover state for grid items
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("bt_admin_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  function openDetail(item: MediaItem) {
    setDetailItem(item);
    setEditAltText(item.altText);
    setEditTitle(item.title);
    setEditCaption(item.caption);
    setEditDescription(item.description);
  }

  function saveMetadata() {
    if (!detailItem) return;
    setMedia((prev) =>
      prev.map((m) =>
        m.id === detailItem.id
          ? { ...m, altText: editAltText, title: editTitle, caption: editCaption, description: editDescription }
          : m
      )
    );
    setDetailItem(null);
  }

  function handleAdd() {
    if (!newUrl) return;
    const item: MediaItem = {
      id: String(Date.now()),
      url: newUrl,
      filename: newFilename || newUrl.split("/").pop() || "image.jpg",
      size: "—",
      date: new Date().toISOString().split("T")[0],
      width: 800,
      height: 480,
      altText: newAltText,
      title: newTitle,
      caption: newCaption,
      description: newDescription,
    };
    setMedia((prev) => [item, ...prev]);
    setUploadModal(false);
    setNewUrl("");
    setNewFilename("");
    setNewAltText("");
    setNewTitle("");
    setNewCaption("");
    setNewDescription("");
  }

  function copyUrl(item: MediaItem) {
    navigator.clipboard?.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  function deleteItem(id: string) {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--adm-card2)",
    border: "1px solid var(--adm-border2)",
    borderRadius: 8,
    color: "var(--adm-text)",
    fontSize: "0.875rem",
    padding: "9px 12px",
    outline: "none",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    color: "var(--adm-muted2)",
    marginBottom: 5,
    fontWeight: 600,
  };

  return (
    <>
      <AdminHeader title="Media Library" user={user} />
      <main className="adm-page-main" style={{ flex: 1, padding: "28px 32px" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <span style={{ fontSize: "0.875rem", color: "var(--adm-muted)" }}>{media.length} items</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {(["grid", "list"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: "1px solid",
                  borderColor: viewMode === mode ? "#E8312A" : "var(--adm-border2)",
                  background: viewMode === mode ? "rgba(232,49,42,0.1)" : "transparent",
                  color: viewMode === mode ? "#E8312A" : "var(--adm-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {mode === "grid" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                )}
              </button>
            ))}
            <button
              onClick={() => setUploadModal(true)}
              style={{ padding: "9px 18px", borderRadius: 8, background: "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)", border: "none", color: "#fff", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer" }}
            >
              + Upload / Add URL
            </button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {media.map((item) => (
              <div
                key={item.id}
                style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 12, overflow: "hidden" }}
              >
                <div
                  style={{ height: 140, overflow: "hidden", position: "relative", cursor: "pointer" }}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => openDetail(item)}
                >
                  <img src={item.url} alt={item.altText || item.filename} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {/* Pencil overlay on hover */}
                  {hoveredId === item.id && (
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.45)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "var(--adm-card)",
                        border: "1px solid var(--adm-border2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--adm-text)" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--adm-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{item.filename}</div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--adm-muted)", marginBottom: 10 }}>{item.size} · {item.date}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => copyUrl(item)}
                      style={{ flex: 1, padding: "5px", borderRadius: 6, background: copiedId === item.id ? "rgba(52,211,153,0.1)" : "var(--adm-input)", border: "1px solid var(--adm-border2)", color: copiedId === item.id ? "#34D399" : "var(--adm-muted)", fontSize: "0.6875rem", fontWeight: 600, cursor: "pointer" }}
                    >
                      {copiedId === item.id ? "Copied!" : "Copy URL"}
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      style={{ width: 28, borderRadius: 6, background: "rgba(232,49,42,0.08)", border: "1px solid rgba(232,49,42,0.15)", color: "#E8312A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", borderRadius: 14, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--adm-border)" }}>
                  {["Preview", "Filename", "Size", "Date", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {media.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--adm-border)" }}>
                    <td style={{ padding: "10px 16px" }}>
                      <img src={item.url} alt={item.altText || item.filename} style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 6 }} />
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: "0.875rem", color: "var(--adm-text)" }}>{item.filename}</td>
                    <td style={{ padding: "10px 16px", fontSize: "0.8125rem", color: "var(--adm-muted)" }}>{item.size}</td>
                    <td style={{ padding: "10px 16px", fontSize: "0.8125rem", color: "var(--adm-muted)" }}>{item.date}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => openDetail(item)}
                          style={{ padding: "5px 12px", borderRadius: 6, background: "var(--adm-input)", border: "1px solid var(--adm-border2)", color: "var(--adm-muted2)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => copyUrl(item)}
                          style={{ padding: "5px 12px", borderRadius: 6, background: copiedId === item.id ? "rgba(52,211,153,0.1)" : "var(--adm-input)", border: "1px solid var(--adm-border2)", color: copiedId === item.id ? "#34D399" : "var(--adm-muted)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
                        >
                          {copiedId === item.id ? "Copied!" : "Copy URL"}
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          style={{ padding: "5px 12px", borderRadius: 6, background: "rgba(232,49,42,0.08)", border: "1px solid rgba(232,49,42,0.15)", color: "#E8312A", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Image detail modal ── */}
        {detailItem && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
            <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border2)", borderRadius: 16, width: "100%", maxWidth: 640, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--adm-border)" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--adm-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}>{detailItem.filename}</h3>
                <button onClick={() => setDetailItem(null)} style={{ background: "none", border: "none", color: "var(--adm-muted)", cursor: "pointer", fontSize: "1.25rem", lineHeight: 1, flexShrink: 0 }}>✕</button>
              </div>

              {/* Body: two columns */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                {/* Left: image preview */}
                <div style={{ padding: "20px", background: "var(--adm-surface)", borderRight: "1px solid var(--adm-border)", display: "flex", flexDirection: "column", gap: 12 }}>
                  <img
                    src={detailItem.url}
                    alt={editAltText || detailItem.filename}
                    style={{ width: "100%", maxHeight: 280, objectFit: "contain", borderRadius: 8, background: "var(--adm-card2)" }}
                  />
                  <div style={{ fontSize: "0.75rem", color: "var(--adm-muted)", textAlign: "center" }}>
                    {detailItem.width} × {detailItem.height} · {detailItem.size}
                  </div>
                  <button
                    onClick={() => copyUrl(detailItem)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: copiedId === detailItem.id ? "rgba(52,211,153,0.1)" : "var(--adm-card2)",
                      border: `1px solid ${copiedId === detailItem.id ? "rgba(52,211,153,0.3)" : "var(--adm-border2)"}`,
                      color: copiedId === detailItem.id ? "#34D399" : "var(--adm-muted2)",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {copiedId === detailItem.id ? "Copied!" : "Copy URL"}
                  </button>
                </div>

                {/* Right: metadata fields */}
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: 420 }}>
                  <div>
                    <label style={labelStyle}>Alt Text</label>
                    <input
                      type="text"
                      value={editAltText}
                      onChange={(e) => setEditAltText(e.target.value)}
                      placeholder="Descriptive alt text..."
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Image Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Image title..."
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Caption</label>
                    <textarea
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      placeholder="Short caption..."
                      rows={2}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Longer description..."
                      rows={3}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: "flex", gap: 10, padding: "16px 20px", borderTop: "1px solid var(--adm-border)", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setDetailItem(null)}
                  style={{ padding: "9px 20px", borderRadius: 8, background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", color: "var(--adm-muted2)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}
                >
                  Close
                </button>
                <button
                  onClick={saveMetadata}
                  style={{ padding: "9px 20px", borderRadius: 8, background: "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)", border: "none", color: "#fff", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Save Metadata
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Upload modal ── */}
        {uploadModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
            <div style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border2)", borderRadius: 16, padding: "32px", maxWidth: 520, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 20 }}>Add Image by URL</h3>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Image URL *</label>
                <input type="text" placeholder="https://images.unsplash.com/..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Filename (optional)</label>
                <input type="text" placeholder="my-image.jpg" value={newFilename} onChange={(e) => setNewFilename(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Alt Text</label>
                <input type="text" placeholder="Describe the image..." value={newAltText} onChange={(e) => setNewAltText(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Image Title</label>
                <input type="text" placeholder="Image title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Caption</label>
                <input type="text" placeholder="Short caption..." value={newCaption} onChange={(e) => setNewCaption(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Description</label>
                <textarea placeholder="Longer description..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
              </div>

              {newUrl && (
                <img
                  src={newUrl}
                  alt="Preview"
                  style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8, marginBottom: 16 }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setUploadModal(false)}
                  style={{ flex: 1, padding: "10px", borderRadius: 8, background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", color: "var(--adm-muted2)", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  style={{ flex: 1, padding: "10px", borderRadius: 8, background: "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)", border: "none", color: "#fff", cursor: "pointer", fontWeight: 700 }}
                >
                  Add Image
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
