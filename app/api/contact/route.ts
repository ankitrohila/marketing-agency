import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { sendMail, contactFormEmailHtml } from "@/lib/mailer";

const DB_PATH = path.join(process.cwd(), "data", "contacts.json");

function ensureDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({ contacts: [] }, null, 2));
}

export async function GET() {
  try {
    ensureDB();
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const db  = JSON.parse(raw);
    return NextResponse.json({ contacts: db.contacts, total: db.contacts.length });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, budget, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });
    }

    ensureDB();
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const db  = JSON.parse(raw);

    const entry = {
      id: Date.now().toString(),
      name, email, company: company || "", budget: budget || "", message,
      createdAt: new Date().toISOString(),
      status: "new",
    };

    db.contacts.push(entry);
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

    // Send email notification (non-blocking)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (adminEmail) {
      sendMail({
        to:      adminEmail,
        subject: `New contact from ${name} — BrandThink`,
        html:    contactFormEmailHtml({ name, email, company, budget, message }),
        replyTo: email,
        source:  "contact",
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, message: "We'll get back to you within 24 hours." });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
