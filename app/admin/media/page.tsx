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
}

const DEMO_MEDIA: MediaItem[] = [
  { id: "1", url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=400&h=300&q=70", filename: "performance-marketing.jpg", size: "342 KB", date: "2025-05-01", width: 800, height: 480 },
  { id: "2", url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&h=300&q=70", filename: "healthcare-martech.jpg", size: "287 KB", date: "2025-04-18", width: 800, height: 480 },
  { id: "3", url: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=400&h=300&q=70", filename: "brand-strategy.jpg", size: "318 KB", date: "2025-04-05", width: 800, height: 480 },
  { id: "4", url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&h=300&q=70", filename: "novabev-case-study.jpg", size: "401 KB", date: "2025-03-22", width: 800, height: 480 },
  { id: "5", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&h=300&q=70", filename: "ai-creative-production.jpg", size: "256 KB", date: "2025-03-10", width: 800, height: 480 },
  { id: "6", url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&h=300&q=70", filename: "ecommerce-cro.jpg", size: "374 KB", date: "2025-02-20", width: 800, height: 480 },
  { id: "7", url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=400&h=300&q=70", filename: "media-distribution.jpg", size: "298 KB", date: "2025-02-05", width: 800, height: 480 },
  { id: "8", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&h=300&q=70", filename: "analytics-data.jpg", size: "332 KB", date: "2025-01-20", width: 800, height: 480 },
  { id: "9", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&h=300&q=70", filename: "growth-marketing.jpg", size: "289 KB", date: "2025-01-10", width: 800, height: 480 },
  { id: "10", url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&h=300&q=70", filename: "team-work.jpg", size: "421 KB", date: "2024-12-15", width: 800, height: 480 },
  { id: "11", url: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=400&h=300&q=70", filename: "startup-marketing.jpg", size: "310 KB", date: "2024-12-01", width: 800, height: 480 },
  { id: "12", url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=400&h=300&q=70", filename: "data-dashboard.jpg", size: "275 KB", date: "2024-11-20", width: 800, height: 480 },
];

export default function AdminMediaPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [media, setMedia] = useState<MediaItem[]>(DEMO_MEDIA);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploadModal, setUploadModal] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newFilename, setNewFilename] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("bt_admin_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

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
    };
    setMedia((prev) => [item, ...prev]);
    setUploadModal(false);
    setNewUrl("");
    setNewFilename("");
  }

  function copyUrl(item: MediaItem) {
    navigator.clipboard?.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  function deleteItem(id: string) {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <>
      <AdminHeader title="Media Library" user={user} />
      <main style={{ flex: 1, padding: "28px 32px" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.4)" }}>{media.length} items</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {/* View toggle */}
            {(["grid", "list"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid", borderColor: viewMode === mode ? "#E8312A" : "rgba(255,255,255,0.08)", background: viewMode === mode ? "rgba(232,49,42,0.1)" : "transparent", color: viewMode === mode ? "#E8312A" : "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
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
                style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}
              >
                <div style={{ height: 140, overflow: "hidden", position: "relative" }}>
                  <img src={item.url} alt={item.filename} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#F5F5F5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{item.filename}</div>
                  <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>{item.size} · {item.date}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => copyUrl(item)} style={{ flex: 1, padding: "5px", borderRadius: 6, background: copiedId === item.id ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: copiedId === item.id ? "#34D399" : "rgba(255,255,255,0.5)", fontSize: "0.6875rem", fontWeight: 600, cursor: "pointer" }}>
                      {copiedId === item.id ? "Copied!" : "Copy URL"}
                    </button>
                    <button onClick={() => deleteItem(item.id)} style={{ width: 28, borderRadius: 6, background: "rgba(232,49,42,0.08)", border: "1px solid rgba(232,49,42,0.15)", color: "#E8312A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Preview", "Filename", "Size", "Date", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.6875rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {media.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "10px 16px" }}>
                      <img src={item.url} alt={item.filename} style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 6 }} />
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: "0.875rem", color: "#F5F5F5" }}>{item.filename}</td>
                    <td style={{ padding: "10px 16px", fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)" }}>{item.size}</td>
                    <td style={{ padding: "10px 16px", fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)" }}>{item.date}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => copyUrl(item)} style={{ padding: "5px 12px", borderRadius: 6, background: copiedId === item.id ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: copiedId === item.id ? "#34D399" : "rgba(255,255,255,0.5)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                          {copiedId === item.id ? "Copied!" : "Copy URL"}
                        </button>
                        <button onClick={() => deleteItem(item.id)} style={{ padding: "5px 12px", borderRadius: 6, background: "rgba(232,49,42,0.08)", border: "1px solid rgba(232,49,42,0.15)", color: "#E8312A", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Upload modal */}
        {uploadModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "32px", maxWidth: 480, width: "90%" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#F5F5F5", marginBottom: 20 }}>Add Image by URL</h3>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Image URL</label>
                <input type="text" placeholder="https://images.unsplash.com/..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} style={{ width: "100%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F5F5F5", fontSize: "0.875rem", padding: "10px 12px", outline: "none" }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Filename (optional)</label>
                <input type="text" placeholder="my-image.jpg" value={newFilename} onChange={(e) => setNewFilename(e.target.value)} style={{ width: "100%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F5F5F5", fontSize: "0.875rem", padding: "10px 12px", outline: "none" }} />
              </div>
              {newUrl && <img src={newUrl} alt="Preview" style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8, marginBottom: 16 }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setUploadModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                <button onClick={handleAdd} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)", border: "none", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Add Image</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
