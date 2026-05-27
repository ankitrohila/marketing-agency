/**
 * BrandThink Mailer — Nodemailer + Gmail SMTP
 *
 * To configure:
 *   1. Create .env.local in project root
 *   2. Add:
 *        SMTP_HOST=smtp.gmail.com
 *        SMTP_PORT=587
 *        SMTP_USER=your@gmail.com
 *        SMTP_PASS=your_app_password   ← Use Gmail App Password, NOT your login password
 *        SMTP_FROM="BrandThink <your@gmail.com>"
 *        ADMIN_EMAIL=admin@thebrandthink.com
 *
 *   3. Enable 2FA on your Gmail account
 *   4. Go to Google Account → Security → App passwords → create one for "Mail"
 *   5. Use that 16-char app password as SMTP_PASS
 */

import nodemailer from "nodemailer";

function createTransport() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn("[Mailer] SMTP credentials not configured. Set SMTP_USER and SMTP_PASS in .env.local");
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
}

export async function sendMail(opts: MailOptions) {
  const transport = createTransport();
  if (!transport) {
    console.log("[Mailer] Skipping email (SMTP not configured):", opts.subject);
    return { success: false, reason: "SMTP not configured" };
  }

  const from = process.env.SMTP_FROM || `BrandThink <${process.env.SMTP_USER}>`;

  try {
    const info = await transport.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    console.log("[Mailer] Sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("[Mailer] Send error:", err);
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
        ["Name", data.name],
        ["Email", data.email],
        ["Company", data.company || "—"],
        ["Budget", data.budget || "—"],
      ].map(([label, value]) => `
        <div style="margin-bottom: 16px;">
          <div style="font-size: 0.6875rem; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">${label}</div>
          <div style="font-size: 0.9375rem; color: #F5F5F5;">${value}</div>
        </div>
      `).join("")}
      <div style="margin-bottom: 0; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06);">
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
      BrandThink — MarTech &amp; Creative Agency · Bangalore, India
    </div>
  </div>
</body>
</html>
  `;
}

export function bookingConfirmHtml(data: {
  name: string; email: string; date: string; time: string; service: string; notes?: string; zoomLink?: string;
}) {
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
        ["Name", data.name],
        ["Date", data.date],
        ["Time", data.time],
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
    </div>
    <div style="padding: 16px 32px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.75rem; color: rgba(255,255,255,0.3);">
      BrandThink — MarTech &amp; Creative Agency · adityaraj@thebrandthink.com
    </div>
  </div>
</body>
</html>
  `;
}
