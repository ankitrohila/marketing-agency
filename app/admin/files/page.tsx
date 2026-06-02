"use client";
import { useEffect, useState, useCallback } from "react";
import AdminHeader from "@/components/admin/AdminHeader";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface FileEntry {
  name: string;
  type: "file" | "dir";
  path: string;
  size?: number;
  modified?: string;
  children?: FileEntry[];
}

const LANGUAGE_MAP: Record<string, string> = {
  ts: "TypeScript", tsx: "TSX", js: "JavaScript", jsx: "JSX",
  json: "JSON", css: "CSS", md: "Markdown", txt: "Text",
  html: "HTML", env: "Env", mjs: "ESM JS",
};

const TOP_DIRS = ["app", "components", "data", "public", "lib"];

function formatSize(bytes?: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTreeNode({ entry, depth, onSelect, selectedPath }: {
  entry: FileEntry;
  depth: number;
  onSelect: (path: string, type: string) => void;
  selectedPath: string;
}) {
  const [open, setOpen] = useState(depth === 0);
  const isSelected = entry.path === selectedPath;

  if (entry.type === "dir") {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            width: "100%",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: `6px 8px 6px ${12 + depth * 14}px`,
            color: "var(--adm-muted2)",
            fontSize: "0.8125rem",
            fontWeight: 500,
            textAlign: "left",
            borderRadius: 6,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: open ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>
            <path d="M9 18l6-6-6-6" />
          </svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={open ? "rgba(232,49,42,0.4)" : "rgba(255,255,255,0.15)"} stroke={open ? "#E8312A" : "rgba(255,255,255,0.35)"} strokeWidth="2" style={{ flexShrink: 0 }}>
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.name}</span>
        </button>
        {open && entry.children && (
          <div>
            {entry.children.map((child) => (
              <FileTreeNode key={child.path} entry={child} depth={depth + 1} onSelect={onSelect} selectedPath={selectedPath} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(entry.path, "file")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        width: "100%",
        background: isSelected ? "rgba(232,49,42,0.1)" : "none",
        border: "none",
        cursor: "pointer",
        padding: `6px 8px 6px ${12 + depth * 14}px`,
        color: isSelected ? "#E8312A" : "rgba(255,255,255,0.5)",
        fontSize: "0.8125rem",
        textAlign: "left",
        borderRadius: 6,
        transition: "all 0.15s",
        borderLeft: `2px solid ${isSelected ? "#E8312A" : "transparent"}`,
      }}
      onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      </svg>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.name}</span>
    </button>
  );
}

export default function AdminFilesPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [trees, setTrees] = useState<Record<string, FileEntry[]>>({});
  const [selectedPath, setSelectedPath] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileInfo, setFileInfo] = useState<{ size?: number; modified?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("bt_admin_user");
    if (stored) setUser(JSON.parse(stored));
    const token = localStorage.getItem("bt_admin_token") || "";
    // Load root dirs
    TOP_DIRS.forEach((dir) => {
      fetch(`/api/admin/files?path=${dir}`, { headers: { "x-admin-token": token } })
        .then((r) => r.json())
        .then((d) => {
          if (d.entries) setTrees((prev) => ({ ...prev, [dir]: d.entries }));
        })
        .catch(() => {});
    });
  }, []);

  const handleSelectFile = useCallback(async (path: string, type: string) => {
    if (type !== "file") return;
    setSelectedPath(path);
    setError("");
    setReadOnly(false);

    const lowerPath = path.toLowerCase();
    if (lowerPath.includes(".env") || lowerPath.endsWith(".env")) {
      setReadOnly(true);
      setFileContent("// Protected file — cannot be edited.");
      setFileInfo(null);
      return;
    }

    const ext = path.split(".").pop()?.toLowerCase() || "";
    const binaryExts = ["png", "jpg", "jpeg", "gif", "svg", "ico", "webp", "woff", "woff2", "ttf", "eot"];
    if (binaryExts.includes(ext)) {
      setReadOnly(true);
      setFileContent("// Binary file — cannot be displayed as text.");
      setFileInfo(null);
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("bt_admin_token") || "";
    const res = await fetch(`/api/admin/files?path=${encodeURIComponent(path)}&read=1`, { headers: { "x-admin-token": token } });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setFileContent(data.content || "");
      setFileInfo({ size: data.size, modified: data.modified });
    } else {
      setError(data.error || "Failed to load file.");
      setFileContent("");
      setFileInfo(null);
    }
  }, []);

  async function handleSave() {
    if (readOnly || !selectedPath) return;
    setSaving(true);
    setError("");
    const token = localStorage.getItem("bt_admin_token") || "";
    const res = await fetch("/api/admin/files", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ path: selectedPath, content: fileContent }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (data.size) setFileInfo((prev) => ({ ...prev, size: data.size, modified: data.modified }));
    } else {
      setError(data.error || "Save failed.");
    }
  }

  const ext = selectedPath.split(".").pop()?.toLowerCase() || "";
  const language = LANGUAGE_MAP[ext] || ext.toUpperCase() || "Text";
  const filename = selectedPath.split("/").pop() || selectedPath.split("\\").pop() || "";

  return (
    <>
      <AdminHeader title="File Manager" user={user} />
      <div style={{ flex: 1, display: "flex", overflow: "hidden", height: "calc(100vh - 56px)" }}>
        {/* Left panel: Directory tree */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            background: "var(--adm-surface)",
            borderRight: "1px solid var(--adm-border)",
            overflowY: "auto",
            padding: "12px 8px",
          }}
        >
          <div style={{ fontSize: "0.5625rem", fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.12em", padding: "4px 12px 10px" }}>
            Project Files
          </div>
          {TOP_DIRS.map((dir) => (
            <div key={dir}>
              {trees[dir] ? (
                <FileTreeNode
                  entry={{ name: dir, type: "dir", path: dir, children: trees[dir] }}
                  depth={0}
                  onSelect={handleSelectFile}
                  selectedPath={selectedPath}
                />
              ) : (
                <div style={{ padding: "6px 12px", fontSize: "0.8125rem", color: "rgba(255,255,255,0.25)" }}>/{dir}/</div>
              )}
            </div>
          ))}
        </div>

        {/* Right panel: Editor */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Editor header */}
          <div style={{ padding: "10px 20px", background: "var(--adm-surface)", borderBottom: "1px solid var(--adm-border)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            {selectedPath ? (
              <>
                <span style={{ fontSize: "0.75rem", color: "var(--adm-muted)", fontFamily: "monospace" }}>
                  {selectedPath.split(/[\\/]/).join(" / ")}
                </span>
                <span style={{ padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.06)", fontSize: "0.6875rem", fontWeight: 600, color: "var(--adm-muted)", textTransform: "uppercase" }}>
                  {language}
                </span>
                {readOnly && <span style={{ padding: "2px 8px", borderRadius: 4, background: "rgba(232,49,42,0.1)", fontSize: "0.6875rem", fontWeight: 600, color: "#E8312A" }}>Protected</span>}
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  {!readOnly && (
                    <button onClick={handleSave} disabled={saving} style={{ padding: "6px 16px", borderRadius: 6, background: "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)", border: "none", color: "#fff", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                      {saving ? "Saving..." : saved ? "Saved!" : "Save"}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.25)" }}>Select a file to edit</span>
            )}
          </div>

          {error && (
            <div style={{ padding: "10px 20px", background: "rgba(232,49,42,0.08)", borderBottom: "1px solid rgba(232,49,42,0.2)", color: "#FF6B5B", fontSize: "0.8125rem" }}>{error}</div>
          )}

          {/* Code area */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            {loading ? (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--adm-muted)" }}>Loading file...</div>
            ) : (
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                readOnly={readOnly || !selectedPath}
                spellCheck={false}
                style={{
                  width: "100%",
                  height: "100%",
                  background: "#111111",
                  border: "none",
                  color: "var(--adm-text)",
                  fontSize: "0.8125rem",
                  lineHeight: 1.7,
                  padding: "20px 24px",
                  outline: "none",
                  resize: "none",
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                  tabSize: 2,
                }}
                placeholder={selectedPath ? "" : "Select a file from the tree on the left to view and edit it."}
              />
            )}
          </div>

          {/* Status bar */}
          <div style={{ padding: "6px 20px", background: "var(--adm-surface)", borderTop: "1px solid var(--adm-border)", display: "flex", gap: 20, flexShrink: 0 }}>
            <span style={{ fontSize: "0.6875rem", color: "var(--adm-muted)" }}>{filename || "No file selected"}</span>
            {fileInfo?.size && <span style={{ fontSize: "0.6875rem", color: "var(--adm-muted)" }}>{formatSize(fileInfo.size)}</span>}
            {fileInfo?.modified && <span style={{ fontSize: "0.6875rem", color: "var(--adm-muted)" }}>Modified: {new Date(fileInfo.modified).toLocaleString("en-IN")}</span>}
            <span style={{ fontSize: "0.6875rem", color: "var(--adm-muted)", marginLeft: "auto" }}>UTF-8</span>
          </div>
        </div>
      </div>
    </>
  );
}
