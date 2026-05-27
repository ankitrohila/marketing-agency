import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR      = path.join(process.cwd(), "data");
const CHANGELOG_FILE = path.join(DATA_DIR, "changelog.json");
const BACKUPS_DIR   = path.join(DATA_DIR, "backups");

function readJSON(filePath: string, defaultVal: unknown = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2));
    }
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return defaultVal;
  }
}

function writeJSON(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// List all data files with sizes + changelog
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "changelog") {
    const log = readJSON(CHANGELOG_FILE, []);
    return NextResponse.json({ changelog: log });
  }

  // List data files
  const files: Array<{name: string; size: number; modified: string}> = [];
  if (fs.existsSync(DATA_DIR)) {
    const entries = fs.readdirSync(DATA_DIR);
    for (const entry of entries) {
      if (!entry.endsWith(".json") || entry === "changelog.json") continue;
      const fp = path.join(DATA_DIR, entry);
      const stat = fs.statSync(fp);
      files.push({
        name: entry,
        size: stat.size,
        modified: stat.mtime.toISOString(),
      });
    }
  }

  // List existing backups
  const backups: Array<{name: string; size: number; created: string}> = [];
  if (fs.existsSync(BACKUPS_DIR)) {
    const entries = fs.readdirSync(BACKUPS_DIR);
    for (const entry of entries) {
      const fp = path.join(BACKUPS_DIR, entry);
      const stat = fs.statSync(fp);
      backups.push({ name: entry, size: stat.size, created: stat.mtime.toISOString() });
    }
  }

  return NextResponse.json({ files, backups });
}

// Create backup
export async function POST(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action, entry } = body;

  if (action === "backup") {
    // Create backup of all JSON files
    if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const backupName = `backup-${timestamp}`;
    const backupPath = path.join(BACKUPS_DIR, backupName);
    fs.mkdirSync(backupPath, { recursive: true });

    const entries = fs.readdirSync(DATA_DIR);
    let count = 0;
    for (const file of entries) {
      if (!file.endsWith(".json") || file === "changelog.json") continue;
      const src = path.join(DATA_DIR, file);
      const dest = path.join(backupPath, file);
      fs.copyFileSync(src, dest);
      count++;
    }

    // Add to changelog
    const log = readJSON(CHANGELOG_FILE, []) as Array<unknown>;
    (log as unknown[]).unshift({
      id: crypto.randomUUID(),
      type: "backup",
      message: `Full backup created: ${backupName} (${count} files)`,
      timestamp: new Date().toISOString(),
      user: "admin",
    });
    writeJSON(CHANGELOG_FILE, log);

    return NextResponse.json({ success: true, backupName, filesCount: count });
  }

  if (action === "log" && entry) {
    // Add custom changelog entry
    const log = readJSON(CHANGELOG_FILE, []) as Array<unknown>;
    (log as unknown[]).unshift({
      id: crypto.randomUUID(),
      type: entry.type || "change",
      message: entry.message,
      timestamp: new Date().toISOString(),
      user: entry.user || "admin",
    });
    writeJSON(CHANGELOG_FILE, log);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
