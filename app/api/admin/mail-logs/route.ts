import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LOGS_FILE = path.join(process.cwd(), "data", "mail_logs.json");

function readLogs() {
  try {
    if (!fs.existsSync(LOGS_FILE)) return { logs: [] };
    return JSON.parse(fs.readFileSync(LOGS_FILE, "utf-8"));
  } catch {
    return { logs: [] };
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source");
  const status = searchParams.get("status");
  const limit  = parseInt(searchParams.get("limit") || "100", 10);

  const data = readLogs();
  let logs = data.logs || [];

  if (source) logs = logs.filter((l: { source: string }) => l.source === source);
  if (status) logs = logs.filter((l: { status: string }) => l.status === status);

  return NextResponse.json({
    logs:  logs.slice(0, limit),
    total: logs.length,
    stats: {
      sent:    (data.logs || []).filter((l: { status: string }) => l.status === "sent").length,
      failed:  (data.logs || []).filter((l: { status: string }) => l.status === "failed").length,
      skipped: (data.logs || []).filter((l: { status: string }) => l.status === "skipped").length,
      total:   (data.logs || []).length,
    },
  });
}

export async function DELETE() {
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify({ logs: [] }, null, 2));
    return NextResponse.json({ success: true, message: "Mail logs cleared" });
  } catch {
    return NextResponse.json({ error: "Failed to clear logs" }, { status: 500 });
  }
}
