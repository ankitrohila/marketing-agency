import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "BrandThink Next.js",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
  });
}
