import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { sendMail, bookingConfirmHtml, bookingStatusUpdateHtml } from "@/lib/mailer";

const DB_PATH = path.join(process.cwd(), "data", "bookings.json");

function ensureDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ bookings: [] }, null, 2));
  }
}

interface BookingBody {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
  zoomLink?: string;
}

export async function GET() {
  try {
    ensureDB();
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const db  = JSON.parse(raw);
    return NextResponse.json({ bookings: db.bookings, total: db.bookings.length });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: BookingBody = await req.json();
    const { name, email, service, date, time } = body;

    if (!name || !email || !service || !date || !time) {
      return NextResponse.json({ error: "Name, email, service, date and time are required" }, { status: 400 });
    }

    ensureDB();
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const db  = JSON.parse(raw);

    // Auto-generate zoom link placeholder (can be replaced with real Zoom API)
    const zoomLink = body.zoomLink || `https://zoom.us/j/${Math.random().toString().slice(2, 12)}`;

    const booking = {
      id: crypto.randomUUID(),
      name, email,
      phone:   body.phone   || "",
      company: body.company || "",
      service, date, time,
      notes:    body.notes   || "",
      zoomLink,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    db.bookings.unshift(booking);
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

    // Send confirmation to client
    sendMail({
      to:      email,
      subject: `Booking confirmed — ${service} with BrandThink`,
      html:    bookingConfirmHtml({ name, email, date, time, service, notes: body.notes, zoomLink }),
      source:  "booking-client",
    }).catch(console.error);

    // Notify admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (adminEmail) {
      sendMail({
        to:      adminEmail,
        subject: `New booking: ${name} — ${service} on ${date} at ${time}`,
        html:    bookingConfirmHtml({ name, email, date, time, service, notes: body.notes, zoomLink }),
        replyTo: email,
        source:  "booking-admin",
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, booking, zoomLink });
  } catch (err) {
    console.error("Booking API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, action, status: rawStatus, rescheduleDate, rescheduleTime, rescheduleNote } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  ensureDB();
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  const db  = JSON.parse(raw);
  const idx = db.bookings.findIndex((b: {id: string}) => b.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const booking = db.bookings[idx];

  // Map action → status + email action
  let newStatus: string = rawStatus || booking.status;
  let emailAction: "accepted" | "rescheduled" | "declined" | null = null;

  if (action === "accept") {
    newStatus    = "confirmed";
    emailAction  = "accepted";
  } else if (action === "decline") {
    newStatus    = "cancelled";
    emailAction  = "declined";
  } else if (action === "reschedule") {
    newStatus   = "confirmed";
    emailAction = "rescheduled";
    // Update booking dates in place
    if (rescheduleDate) booking.date = rescheduleDate;
    if (rescheduleTime) booking.time = rescheduleTime;
  } else if (action === "complete") {
    newStatus = "completed";
  } else if (action === "no_show") {
    newStatus = "no_show";
  }

  booking.status = newStatus;
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

  // Send auto-reply email when action warrants it
  if (emailAction) {
    const subjectMap = {
      accepted:    `Your booking is confirmed — ${booking.service} with BrandThink`,
      rescheduled: `Your session has been rescheduled — ${booking.service}`,
      declined:    `Booking cancellation — ${booking.service} with BrandThink`,
    };
    sendMail({
      to:      booking.email,
      subject: subjectMap[emailAction],
      html:    bookingStatusUpdateHtml({
        name:           booking.name,
        email:          booking.email,
        service:        booking.service,
        action:         emailAction,
        date:           booking.date,
        time:           booking.time,
        rescheduleNote: rescheduleNote || "",
        zoomLink:       booking.zoomLink,
      }),
      source: `booking-${emailAction}`,
    }).catch(console.error);
  }

  return NextResponse.json({ success: true });
}
