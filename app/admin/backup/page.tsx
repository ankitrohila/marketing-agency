"use client";
import { useEffect, useRef, useState } from "react";

interface DataFile {
  name: string;
  size: number;
  modified: string;
}

interface Backup {
  name: string;
  size: number;
  created: string;
}

interface ChangelogEntry {
  id: string;
  type: "backup" | "change" | "deploy" | "fix" | "feature" | "note";
  message: string;
  timestamp: string;
  user: string;
}

const TYPE_COLORS: Record<string, string> = {
  backup:  "#38BDF8",
  change:  "#FB923C",
  deploy:  "#34D399",
  fix:     "#F472B6",
  feature: "#A78BFA",
  note:    "#94A3B8",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtSize(bytes: number) {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("bt_admin_token") || "" : "";
}

export default function BackupPage() {
  const [files,     setFiles]     = useState<DataFile[]>([]);
  const [backups,   setBackups]   = useState<Backup[]>([]);
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [backing,   setBacking]   = useState(false);
  const [toast,     setToast]     = useState<string | null>(null);

  // New log form
  const [logMsg,  setLogMsg]  = useState("");
  const [logType, setLogType] = useState<ChangelogEntry["type"]>("note");
  const [addingLog, setAddingLog] = useState(false);

  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function showToast(msg: string) {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3000);
  }

  async function loadData() {
    try {
      const [filesRes, logRes] = await Promise.all([
        fetch("/api/admin/backup", { headers: { "x-admin-token": token() } }),
        fetch("/api/admin/backup?action=changelog", { headers: { "x-admin-token": token() } }),
      ]);
      const filesData = await filesRes.json();
      const logData   = await logRes.json();
      setFiles(filesData.files || []);
      setBackups(filesData.backups || []);
      setChangelog(logData.changelog || []);
    } catch { /* silent */ }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function createBackup() {
    setBacking(true);
    try {
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token() },
        body: JSON.stringify({ action: "backup" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Backup created: ${data.backupName} (${data.filesCount} files)`);
        await loadData();
      }
    } catch { /* silent */ }
    setBacking(false);
  }

  async function addLogEntry() {
    if (!logMsg.trim()) return;
    setAddingLog(true);
    try {
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token() },
        body: JSON.stringify({ action: "log", entry: { type: logType, message: logMsg } }),
      });
      if ((await res.json()).success) {
        setLogMsg("");
        await loadData();
        showToast("Changelog entry added");
      }
    } catch { /* silent */ }
    setAddingLog(false);
  }

  return (
    <div className="adm-page-main" style={{ padding: 32, minHeight: "100vh" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 2000,
          background: "#1a2e1a", border: "1px solid rgba(52,211,153,0.3)",
          color: "#34D399", padding: "12px 20px", borderRadius: 10,
          fontSize: "0.875rem", fontWeight: 600,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}>
          ✓ {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--adm-text)", letterSpacing: "-0.03em" }}>
            Backup &amp; Changelog
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--adm-muted)", marginTop: 4 }}>
            Create full data backups and track all site changes
          </p>
        </div>
        <button
          onClick={createBackup}
          disabled={backing}
          style={{
            background: "linear-gradient(135deg,#38BDF8,#0284C7)",
            border: "none", color: "#fff", padding: "11px 22px",
            borderRadius: 10, cursor: backing ? "not-allowed" : "pointer",
            fontSize: "0.875rem", fontWeight: 700,
            display: "flex", alignItems: "center", gap: 8,
            opacity: backing ? 0.7 : 1,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.71"/>
          </svg>
          {backing ? "Creating Backup…" : "Create Backup Now"}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 80, color: "var(--adm-muted)" }}>Loading…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Left: Data files + Backups */}
          <div>
            {/* Data Files */}
            <div style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)", borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 16 }}>
                Data Files ({files.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {files.map((file) => (
                  <div key={file.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, background: "var(--adm-card)" }}>
                    <span style={{ fontSize: "1rem" }}>📄</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--adm-text)" }}>{file.name}</div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--adm-muted)" }}>
                        {fmtSize(file.size)} · Modified {fmt(file.modified)}
                      </div>
                    </div>
                    <span style={{ padding: "2px 8px", borderRadius: 99, background: "rgba(56,189,248,0.1)", color: "#38BDF8", fontSize: "0.625rem", fontWeight: 700 }}>
                      JSON
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Backup History */}
            <div style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)", borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 16 }}>
                Backup History ({backups.length})
              </h2>
              {backups.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "var(--adm-muted)", fontSize: "0.875rem" }}>
                  No backups yet. Click "Create Backup Now" above.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {backups.slice().reverse().map((backup) => (
                    <div key={backup.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, background: "var(--adm-card)" }}>
                      <span style={{ fontSize: "1rem" }}>💾</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--adm-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {backup.name}
                        </div>
                        <div style={{ fontSize: "0.6875rem", color: "var(--adm-muted)" }}>
                          {fmtSize(backup.size)} · {fmt(backup.created)}
                        </div>
                      </div>
                      <span style={{ padding: "2px 8px", borderRadius: 99, background: "rgba(52,211,153,0.1)", color: "#34D399", fontSize: "0.625rem", fontWeight: 700 }}>
                        Backup
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Changelog */}
          <div>
            {/* Add entry form */}
            <div style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)", borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 16 }}>
                Add Changelog Entry
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    Type
                  </label>
                  <select
                    value={logType}
                    onChange={(e) => setLogType(e.target.value as ChangelogEntry["type"])}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", color: "var(--adm-text)", fontSize: "0.875rem", outline: "none" }}
                  >
                    <option value="note">📝 Note</option>
                    <option value="feature">✨ Feature</option>
                    <option value="change">🔄 Change</option>
                    <option value="fix">🐛 Fix</option>
                    <option value="deploy">🚀 Deploy</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    Message
                  </label>
                  <textarea
                    value={logMsg}
                    onChange={(e) => setLogMsg(e.target.value)}
                    placeholder="Describe what changed..."
                    rows={3}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "var(--adm-card2)", border: "1px solid var(--adm-border2)", color: "var(--adm-text)", fontSize: "0.875rem", outline: "none", fontFamily: "inherit", resize: "vertical" }}
                  />
                </div>
                <button
                  onClick={addLogEntry}
                  disabled={addingLog || !logMsg.trim()}
                  style={{
                    alignSelf: "flex-end",
                    padding: "9px 20px", borderRadius: 8,
                    background: "linear-gradient(135deg,#E8312A,#FF6B1A)",
                    border: "none", color: "#fff",
                    cursor: addingLog || !logMsg.trim() ? "not-allowed" : "pointer",
                    fontSize: "0.8125rem", fontWeight: 700,
                    opacity: addingLog || !logMsg.trim() ? 0.6 : 1,
                  }}
                >
                  {addingLog ? "Adding…" : "Add Entry"}
                </button>
              </div>
            </div>

            {/* Changelog list */}
            <div style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border)", borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: 16 }}>
                Changelog ({changelog.length} entries)
              </h2>
              {changelog.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "var(--adm-muted)", fontSize: "0.875rem" }}>
                  No changelog entries yet. Backups and manual entries appear here.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {changelog.slice(0, 50).map((entry, i) => (
                    <div key={entry.id} style={{ display: "flex", gap: 14, paddingBottom: 16, paddingTop: i > 0 ? 16 : 0, borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      {/* Timeline dot */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 20 }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: "50%",
                          background: TYPE_COLORS[entry.type] || "#94A3B8",
                          flexShrink: 0, marginTop: 4,
                        }} />
                        {i < changelog.length - 1 && (
                          <div style={{ flex: 1, width: 1, background: "rgba(255,255,255,0.06)", marginTop: 6 }} />
                        )}
                      </div>
                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                          <span style={{
                            padding: "1px 7px", borderRadius: 99,
                            fontSize: "0.5625rem", fontWeight: 700,
                            letterSpacing: "0.08em", textTransform: "uppercase",
                            background: `${TYPE_COLORS[entry.type] || "#94A3B8"}18`,
                            color: TYPE_COLORS[entry.type] || "#94A3B8",
                            border: `1px solid ${TYPE_COLORS[entry.type] || "#94A3B8"}30`,
                          }}>
                            {entry.type}
                          </span>
                          <span style={{ fontSize: "0.6875rem", color: "var(--adm-muted)" }}>
                            {fmt(entry.timestamp)}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.5, margin: 0 }}>
                          {entry.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
