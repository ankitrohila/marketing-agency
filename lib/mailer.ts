/**
 * BrandThink Mailer — Nodemailer + Gmail SMTP
 * Logs every email attempt to data/mail_logs.json
 */

import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { buildGoogleCalUrl } from "./googleCal";

const LOGS_FILE = path.join(process.cwd(), "data", "mail_logs.json");

/* ── Mail log writer ── */
function writeMailLog(entry: {
  to: string; subject: string; source: string;
  status: "sent" | "failed" | "skipped";
  messageId?: string; error?: string;
}) {
  try {
    const dir = path.dirname(LOGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const existing = fs.existsSync(LOGS_FILE)
      ? JSON.parse(fs.readFileSync(LOGS_FILE, "utf-8"))
      : { logs: [] };
    existing.logs.unshift({
      id:        Date.now().toString() + Math.random().toString(36).slice(2, 6),
      to:        entry.to,
      subject:   entry.subject,
      source:    entry.source,
      status:    entry.status,
      messageId: entry.messageId || null,
      error:     entry.error     || null,
      sentAt:    new Date().toISOString(),
    });
    // Keep last 500 logs
    if (existing.logs.length > 500) existing.logs = existing.logs.slice(0, 500);
    fs.writeFileSync(LOGS_FILE, JSON.stringify(existing, null, 2));
  } catch (e) {
    console.error("[Mailer] Failed to write log:", e);
  }
}

function createTransport() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass || user === "your@gmail.com") {
    console.warn("[Mailer] SMTP credentials not configured.");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  source?: string; // for log labelling
}

export async function sendMail(opts: MailOptions) {
  const transport = createTransport();
  const source    = opts.source || "system";

  if (!transport) {
    writeMailLog({ to: opts.to, subject: opts.subject, source, status: "skipped", error: "SMTP not configured" });
    console.log("[Mailer] Skipping email (SMTP not configured):", opts.subject);
    return { success: false, reason: "SMTP not configured" };
  }

  const from = process.env.SMTP_FROM || `BrandThink <${process.env.SMTP_USER}>`;

  try {
    const info = await transport.sendMail({
      from,
      to:      opts.to,
      subject: opts.subject,
      html:    opts.html,
      replyTo: opts.replyTo,
    });
    console.log("[Mailer] Sent:", info.messageId);
    writeMailLog({ to: opts.to, subject: opts.subject, source, status: "sent", messageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("[Mailer] Send error:", err);
    writeMailLog({ to: opts.to, subject: opts.subject, source, status: "failed", error: String(err) });
    return { success: false, error: String(err) };
  }
}

/* ─── Email Templates ──────────────────────────── */

export function contactFormEmailHtml(data: {
  name: string; email: string; company?: string; budget?: string; message: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Contact Form Submission</title></head>
<body style="font-family: Inter, Arial, sans-serif; background: #0a0a0a; color: #F5F5F5; margin:0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #141414; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden;">
    <div style="background: linear-gradient(135deg,#E8312A,#FF6B1A); padding: 24px 32px;">
      <h1 style="margin:0; font-size: 1.25rem; font-weight: 800; color: #fff;">New Contact Submission</h1>
      <p style="margin: 6px 0 0; color: rgba(255,255,255,0.8); font-size: 0.875rem;">From BrandThink.com contact form</p>
    </div>
    <div style="padding: 28px 32px;">
      ${[
        ["Name",    data.name],
        ["Email",   data.email],
        ["Company", data.company || "—"],
        ["Budget",  data.budget  || "—"],
      ].map(([label, value]) => `
        <div style="margin-bottom: 16px;">
          <div style="font-size: 0.6875rem; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">${label}</div>
          <div style="font-size: 0.9375rem; color: #F5F5F5;">${value}</div>
        </div>
      `).join("")}
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06);">
        <div style="font-size: 0.6875rem; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Message</div>
        <div style="font-size: 0.9375rem; color: #F5F5F5; line-height: 1.65; white-space: pre-wrap;">${data.message}</div>
      </div>
    </div>
    <div style="padding: 16px 32px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.75rem; color: rgba(255,255,255,0.3);">
      Sent via BrandThink.com · ${new Date().toLocaleString("en-IN")}
    </div>
  </div>
</body>
</html>
  `;
}

export function leadFormEmailHtml(data: {
  name: string; email: string; company?: string; phone?: string;
  service?: string; budget?: string; message?: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Lead Captured</title></head>
<body style="font-family: Inter, Arial, sans-serif; background: #0a0a0a; color: #F5F5F5; margin:0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #141414; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden;">
    <div style="background: linear-gradient(135deg,#7C3AED,#E8312A); padding: 24px 32px;">
      <h1 style="margin:0; font-size: 1.25rem; font-weight: 800; color: #fff;">🎯 New Lead Captured</h1>
      <p style="margin: 6px 0 0; color: rgba(255,255,255,0.8); font-size: 0.875rem;">From BrandThink.com lead capture modal</p>
    </div>
    <div style="padding: 28px 32px;">
      ${[
        ["Name",    data.name],
        ["Email",   data.email],
        ["Company", data.company || "—"],
        ["Phone",   data.phone   || "—"],
        ["Service", data.service || "—"],
        ["Budget",  data.budget  || "—"],
      ].map(([label, value]) => `
        <div style="margin-bottom: 14px; display: flex; gap: 12px; align-items: baseline;">
          <div style="font-size: 0.75rem; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.08em; min-width: 80px;">${label}</div>
          <div style="font-size: 0.9375rem; color: #F5F5F5;">${value}</div>
        </div>
      `).join("")}
      ${data.message ? `
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06);">
        <div style="font-size: 0.6875rem; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Message</div>
        <div style="font-size: 0.9375rem; color: #F5F5F5; line-height: 1.65; white-space: pre-wrap;">${data.message}</div>
      </div>` : ""}
    </div>
    <div style="padding: 16px 32px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.75rem; color: rgba(255,255,255,0.3);">
      Sent via BrandThink.com · ${new Date().toLocaleString("en-IN")}
    </div>
  </div>
</body>
</html>
  `;
}

export function subscribeConfirmHtml(email: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Welcome to BrandThink Insights</title></head>
<body style="font-family: Inter, Arial, sans-serif; background: #0a0a0a; color: #F5F5F5; margin:0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #141414; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden;">
    <div style="background: linear-gradient(135deg,#E8312A,#FF6B1A); padding: 32px;">
      <h1 style="margin:0; font-size: 1.5rem; font-weight: 900; color: #fff; letter-spacing: -0.03em;">You're in. 🎉</h1>
    </div>
    <div style="padding: 32px;">
      <p style="font-size: 1rem; line-height: 1.7; color: rgba(255,255,255,0.8); margin-top: 0;">
        Welcome to BrandThink Insights. You'll receive our best frameworks, case studies, and market intelligence every two weeks.
      </p>
      <p style="font-size: 0.875rem; color: rgba(255,255,255,0.4);">
        Subscribed as: <strong style="color: #F5F5F5;">${email}</strong>
      </p>
    </div>
    <div style="padding: 16px 32px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.75rem; color: rgba(255,255,255,0.3);">
      BrandThink — MarTech &amp; Creative Agency · Sonipat, Haryana
    </div>
  </div>
</body>
</html>
  `;
}

export function bookingConfirmHtml(data: {
  name: string; email: string; date: string; time: string; service: string; notes?: string; zoomLink?: string;
}) {
  const calUrl = buildGoogleCalUrl({ name: data.name, email: data.email, date: data.date, time: data.time, service: data.service, zoomLink: data.zoomLink });
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Booking Confirmed</title></head>
<body style="font-family: Inter, Arial, sans-serif; background: #0a0a0a; color: #F5F5F5; margin:0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #141414; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden;">
    <div style="background: linear-gradient(135deg,#34D399,#0EA5E9); padding: 24px 32px;">
      <h1 style="margin:0; font-size: 1.25rem; font-weight: 800; color: #fff;">Booking Confirmed ✓</h1>
      <p style="margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 0.875rem;">Your strategy session is scheduled</p>
    </div>
    <div style="padding: 28px 32px;">
      ${[
        ["Name",    data.name],
        ["Date",    data.date],
        ["Time",    data.time],
        ["Service", data.service],
      ].map(([label, value]) => `
        <div style="margin-bottom: 14px; display: flex; gap: 12px; align-items: baseline;">
          <div style="font-size: 0.75rem; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.08em; min-width: 80px;">${label}</div>
          <div style="font-size: 0.9375rem; color: #F5F5F5; font-weight: 600;">${value}</div>
        </div>
      `).join("")}
      ${data.zoomLink ? `
      <div style="margin-top: 24px; padding: 16px 20px; background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.2); border-radius: 10px;">
        <div style="font-size: 0.75rem; font-weight: 700; color: #34D399; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Zoom Meeting Link</div>
        <a href="${data.zoomLink}" style="color: #34D399; font-size: 0.9375rem; word-break: break-all;">${data.zoomLink}</a>
      </div>
      ` : ""}
      ${data.notes ? `<div style="margin-top: 20px; font-size: 0.875rem; color: rgba(255,255,255,0.5); line-height: 1.6;"><strong>Notes:</strong> ${data.notes}</div>` : ""}
      <!-- Google Calendar CTA -->
      <div style="margin-top: 24px; text-align: center;">
        <a href="${calUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; background: #4285F4; color: #fff; font-size: 0.875rem; font-weight: 700; border-radius: 10px; text-decoration: none; letter-spacing: 0.01em;">
          📅 Add to Google Calendar
        </a>
      </div>
    </div>
    <div style="padding: 16px 32px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.75rem; color: rgba(255,255,255,0.3);">
      BrandThink — MarTech &amp; Creative Agency · rohilla77@gmail.com
    </div>
  </div>
</body>
</html>
  `;
}

export function bookingStatusUpdateHtml(data: {
  name: string; email: string; service: string;
  action: "accepted" | "rescheduled" | "declined";
  date?: string; time?: string;
  rescheduleNote?: string;
  zoomLink?: string;
}) {
  const cfg = {
    accepted:    { gradient: "linear-gradient(135deg,#34D399,#0EA5E9)", title: "Booking Accepted ✓",         subtitle: "Your strategy session has been confirmed.",            emoji: "✅" },
    rescheduled: { gradient: "linear-gradient(135deg,#FB923C,#F59E0B)", title: "Session Rescheduled 📅",     subtitle: "Your session has been moved to a new date & time.",    emoji: "📅" },
    declined:    { gradient: "linear-gradient(135deg,#F87171,#E8312A)", title: "Booking Cancelled",          subtitle: "Unfortunately your booking has been cancelled.",       emoji: "❌" },
  }[data.action];

  const calUrl = (data.action !== "declined" && data.date && data.time)
    ? buildGoogleCalUrl({ name: data.name, email: data.email, date: data.date, time: data.time, service: data.service, zoomLink: data.zoomLink })
    : null;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${cfg.title}</title></head>
<body style="font-family: Inter, Arial, sans-serif; background: #0a0a0a; color: #F5F5F5; margin:0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #141414; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden;">
    <div style="background: ${cfg.gradient}; padding: 24px 32px;">
      <h1 style="margin:0; font-size: 1.25rem; font-weight: 800; color: #fff;">${cfg.title}</h1>
      <p style="margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 0.875rem;">${cfg.subtitle}</p>
    </div>
    <div style="padding: 28px 32px;">
      <p style="font-size: 0.9375rem; color: rgba(255,255,255,0.8); margin: 0 0 20px; line-height: 1.65;">Hi ${data.name},</p>

      ${data.action === "accepted" || data.action === "rescheduled" ? `
      <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        ${[
          ["Service", data.service],
          ...(data.date  ? [["Date",    data.date ]] : []),
          ...(data.time  ? [["Time",    data.time  ]] : []),
        ].map(([label, value]) => `
          <div style="margin-bottom: 12px; display: flex; gap: 12px; align-items: baseline;">
            <div style="font-size: 0.75rem; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.08em; min-width: 72px;">${label}</div>
            <div style="font-size: 0.9375rem; color: #F5F5F5; font-weight: 600;">${value}</div>
          </div>
        `).join("")}
        ${data.zoomLink ? `
        <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.75rem; font-weight: 700; color: #34D399; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">Zoom Meeting</div>
          <a href="${data.zoomLink}" style="color: #34D399; font-size: 0.875rem; word-break: break-all;">${data.zoomLink}</a>
        </div>` : ""}
      </div>
      ` : ""}

      ${data.rescheduleNote ? `
      <div style="padding: 14px 18px; background: rgba(251,146,60,0.06); border: 1px solid rgba(251,146,60,0.2); border-radius: 10px; margin-bottom: 20px;">
        <div style="font-size: 0.75rem; font-weight: 700; color: #FB923C; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">Note from BrandThink</div>
        <p style="font-size: 0.875rem; color: rgba(255,255,255,0.75); margin: 0; line-height: 1.6;">${data.rescheduleNote}</p>
      </div>` : ""}

      ${data.action === "declined" ? `
      <p style="font-size: 0.875rem; color: rgba(255,255,255,0.6); line-height: 1.65; margin: 0 0 16px;">
        We're sorry for the inconvenience. Please feel free to <a href="https://thebrandthink.com/book" style="color: #E8312A;">rebook at a time that suits you</a>.
      </p>` : ""}

      ${calUrl ? `
      <div style="text-align: center; margin-top: 8px;">
        <a href="${calUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; background: #4285F4; color: #fff; font-size: 0.875rem; font-weight: 700; border-radius: 10px; text-decoration: none;">
          📅 Add to Google Calendar
        </a>
      </div>` : ""}
    </div>
    <div style="padding: 16px 32px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.75rem; color: rgba(255,255,255,0.3);">
      BrandThink — MarTech &amp; Creative Agency · rohilla77@gmail.com
    </div>
  </div>
</body>
</html>
  `;
}

export function testMailHtml(to: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>SMTP Test — BrandThink</title></head>
<body style="font-family: Inter, Arial, sans-serif; background: #0a0a0a; color: #F5F5F5; margin:0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #141414; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden;">
    <div style="background: linear-gradient(135deg,#34D399,#0EA5E9); padding: 24px 32px;">
      <h1 style="margin:0; font-size: 1.25rem; font-weight: 800; color: #fff;">✅ SMTP Test Successful</h1>
      <p style="margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 0.875rem;">Your BrandThink email integration is working</p>
    </div>
    <div style="padding: 28px 32px;">
      <p style="font-size: 0.9375rem; color: rgba(255,255,255,0.8); line-height: 1.7; margin-top: 0;">
        This is a test email sent from the BrandThink admin panel. If you received this, your SMTP configuration is working correctly.
      </p>
      <div style="margin-top: 20px; padding: 16px 20px; background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.2); border-radius: 10px;">
        <div style="font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Delivered to</div>
        <div style="font-size: 0.9375rem; color: #34D399; font-weight: 600;">${to}</div>
      </div>
      <div style="margin-top: 16px; padding: 16px 20px; background: rgba(255,255,255,0.03); border-radius: 10px; font-size: 0.8125rem; color: rgba(255,255,255,0.5);">
        <strong style="color: rgba(255,255,255,0.7);">What's next:</strong> All contact forms, bookings, lead captures and newsletter subscriptions will now send real email notifications.
      </div>
    </div>
    <div style="padding: 16px 32px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.75rem; color: rgba(255,255,255,0.3);">
      Sent at ${new Date().toLocaleString("en-IN")} · BrandThink Admin Panel
    </div>
  </div>
</body>
</html>
  `;
}
