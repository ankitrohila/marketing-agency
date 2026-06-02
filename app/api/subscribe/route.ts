import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { sendMail, subscribeConfirmHtml } from "@/lib/mailer";

const DB_PATH = path.join(process.cwd(), "data", "subscribers.json");

function ensureDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ subscribers: [] }, null, 2));
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, source = "website" } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    ensureDB();
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const db  = JSON.parse(raw);

    // Check for duplicate
    const exists = db.subscribers.some(
      (s: { email: string }) => s.email.toLowerCase() === email.toLowerCase()
    );

    if (exists) {
      return NextResponse.json({ success: true, message: "You're already subscribed!" });
    }

    db.subscribers.push({
      id: Date.now().toString(),
      email: email.toLowerCase().trim(),
      source,
      subscribedAt: new Date().toISOString(),
      status: "active",
    });

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

    // Send confirmation email (non-blocking)
    sendMail({
      to:      email.toLowerCase().trim(),
      subject: "Welcome to BrandThink Insights 🎉",
      html:    subscribeConfirmHtml(email.toLowerCase().trim()),
      source:  "subscribe",
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: "You're subscribed! Welcome to BrandThink Insights.",
    });
  } catch (err) {
    console.error("Subscribe API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    ensureDB();
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const db  = JSON.parse(raw);
    return NextResponse.json({
      subscribers: db.subscribers,
      total: db.subscribers.length,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
