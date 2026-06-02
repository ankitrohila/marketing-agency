import { NextRequest, NextResponse } from "next/server";
import { sendMail, testMailHtml } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const to   = body.to || process.env.ADMIN_EMAIL || process.env.SMTP_USER;

    if (!to) {
      return NextResponse.json({ error: "No recipient — set ADMIN_EMAIL in .env.local" }, { status: 400 });
    }

    const result = await sendMail({
      to,
      subject: `✅ SMTP Test — BrandThink (${new Date().toLocaleTimeString("en-IN")})`,
      html:    testMailHtml(to),
      source:  "test",
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${to}`,
        messageId: (result as { messageId?: string }).messageId,
      });
    } else {
      return NextResponse.json({
        success: false,
        reason:  (result as { reason?: string; error?: string }).reason || (result as { error?: string }).error,
      }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
