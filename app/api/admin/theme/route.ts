import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const THEME_FILE = path.join(process.cwd(), "data", "theme_settings.json");

const DEFAULT_THEME = {
  fonts: {
    provider: "google",           // "google" | "adobe" | "custom"
    googleFontsUrl: "",           // full @import URL or googleapis link
    adobeFontsProjectId: "",      // Typekit project id
    customFontImport: "",         // arbitrary @font-face CSS
    headingFont: "Inter",
    bodyFont: "Inter",
    monoFont: "'Fira Code', monospace",
  },
  typography: {
    h1: { size: "clamp(3rem,7vw,7.5rem)", weight: "800", lineHeight: "0.92", letterSpacing: "-0.04em" },
    h2: { size: "clamp(2rem,4vw,3.75rem)",  weight: "800", lineHeight: "1.0",  letterSpacing: "-0.035em" },
    h3: { size: "1.75rem",  weight: "700", lineHeight: "1.1",  letterSpacing: "-0.02em" },
    h4: { size: "1.375rem", weight: "700", lineHeight: "1.2",  letterSpacing: "-0.01em" },
    h5: { size: "1.125rem", weight: "700", lineHeight: "1.3",  letterSpacing: "0" },
    h6: { size: "0.9375rem",weight: "600", lineHeight: "1.4",  letterSpacing: "0" },
    body: { size: "1rem",   weight: "400", lineHeight: "1.7",  letterSpacing: "0" },
    small: { size: "0.875rem", weight: "400", lineHeight: "1.6", letterSpacing: "0" },
  },
  colors: {
    brandPrimary:   "#E8312A",
    brandSecondary: "#FF8C19",
    bgDark:         "#111111",
    bgLight:        "#FAFAFA",
    textDark:       "#F5F5F5",
    textLight:      "#111111",
    mutedDark:      "#888888",
    mutedLight:     "#666666",
    borderDark:     "rgba(255,255,255,0.08)",
    borderLight:    "rgba(0,0,0,0.10)",
    cardDark:       "#222222",
    cardLight:      "#E5E5E5",
    btnPrimaryBg:   "#E8312A",
    btnPrimaryText: "#ffffff",
    btnSecondaryBg: "transparent",
    btnSecondaryText: "inherit",
  },
};

function readTheme() {
  try {
    return JSON.parse(fs.readFileSync(THEME_FILE, "utf-8"));
  } catch {
    return DEFAULT_THEME;
  }
}

function writeTheme(data: unknown) {
  const dir = path.dirname(THEME_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(THEME_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(readTheme());
}

export async function PUT(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const current = readTheme();
  const updated = {
    ...current,
    ...body,
    fonts:       body.fonts       ? { ...current.fonts,       ...body.fonts }       : current.fonts,
    typography:  body.typography  ? { ...current.typography,  ...body.typography }  : current.typography,
    colors:      body.colors      ? { ...current.colors,      ...body.colors }      : current.colors,
  };
  writeTheme(updated);
  return NextResponse.json(updated);
}
