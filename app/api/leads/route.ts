import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "leads.json");

function ensureDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({ leads: [] }, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, phone, service, budget, message } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    ensureDB();
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const db  = JSON.parse(raw);

    db.leads.push({
      id: Date.now().toString(),
      name, email,
      company: company || "", phone: phone || "",
      service: service || "", budget: budget || "",
      message: message || "",
      createdAt: new Date().toISOString(),
      status: "new",
    });

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

    return NextResponse.json({ success: true, message: "Lead captured. We'll reach out shortly." });
  } catch (err) {
    console.error("Leads API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    ensureDB();
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const db  = JSON.parse(raw);
    return NextResponse.json({ leads: db.leads, total: db.leads.length });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
