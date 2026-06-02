import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import fs from "fs";
import path from "path";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BrandThink — MarTech & Creative Agency",
  description:
    "BrandThink crafts standout campaigns that drive real growth through creativity, data, and cutting-edge technology.",
  keywords: "marketing agency, brand strategy, creative technology, MarTech, digital campaigns",
  openGraph: {
    title: "BrandThink — MarTech & Creative Agency",
    description: "360° Marketing and Advertising Agency",
    type: "website",
  },
};

/* ─── Helpers ──────────────────────────────────────────────────────────── */
function readJson<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

/** Extract inner content of a specific HTML tag (strips the wrapper tag). */
function extractTag(html: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = html.match(re);
  return (m ? m[1] : html).trim();
}

/* ─── Data interfaces ──────────────────────────────────────────────────── */
interface SeoData {
  gaTagId?: string;
  gtmHeadCode?: string;
  gtmBodyCode?: string;
  customHeadCode?: string;
  customBodyCode?: string;
  fbPixelId?: string;
  microsoftClarityId?: string;
}

interface ThemeFonts {
  provider?: string;
  googleFontsUrl?: string;
  adobeFontsProjectId?: string;
  customFontImport?: string;
  headingFont?: string;
  bodyFont?: string;
}

interface ThemeColors {
  brandPrimary?: string;
  brandSecondary?: string;
  bgDark?: string;
  bgLight?: string;
  textDark?: string;
  textLight?: string;
  mutedDark?: string;
  mutedLight?: string;
  cardDark?: string;
  cardLight?: string;
  btnPrimaryBg?: string;
}

interface ThemeTypo {
  size?: string;
  weight?: string;
  lineHeight?: string;
  letterSpacing?: string;
}

interface ThemeData {
  fonts?: ThemeFonts;
  colors?: ThemeColors;
  typography?: Record<string, ThemeTypo>;
}

/* ─── Root Layout ──────────────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const DATA_DIR = path.join(process.cwd(), "data");
  const seo: SeoData     = readJson(path.join(DATA_DIR, "seo.json"), {});
  const theme: ThemeData = readJson(path.join(DATA_DIR, "theme_settings.json"), {});

  const colors = theme.colors    ?? {};
  const fonts  = theme.fonts     ?? {};
  const typo   = theme.typography ?? {};

  /* ── Build CSS variable overrides (theme settings → site tokens) ─── */
  const rootVars = [
    colors.brandPrimary   ? `--bt-red:${colors.brandPrimary};--bt-lime:${colors.brandPrimary};` : "",
    colors.brandSecondary ? `--bt-gold:${colors.brandSecondary};` : "",
    colors.bgDark         ? `--bt-black:${colors.bgDark};` : "",
    colors.textDark       ? `--bt-white:${colors.textDark};` : "",
    colors.mutedDark      ? `--bt-muted:${colors.mutedDark};` : "",
    colors.cardDark       ? `--bt-card:${colors.cardDark};` : "",
    fonts.headingFont     ? `--font-heading:'${fonts.headingFont}',sans-serif;` : "",
    fonts.bodyFont        ? `--font-body:'${fonts.bodyFont}',sans-serif;` : "",
  ].filter((s) => s.length > 0);

  const lightVars = [
    colors.bgLight    ? `--bt-black:${colors.bgLight};` : "",
    colors.textLight  ? `--bt-white:${colors.textLight};` : "",
    colors.mutedLight ? `--bt-muted:${colors.mutedLight};` : "",
    colors.cardLight  ? `--bt-card:${colors.cardLight};` : "",
  ].filter((s) => s.length > 0);

  const typoCss = (["h1", "h2", "h3", "h4", "h5", "h6", "body"] as const)
    .filter((tag) => !!typo[tag])
    .map((tag) => {
      const t = typo[tag] as ThemeTypo;
      const rules = [
        t.size          ? `font-size:${t.size}` : "",
        t.weight        ? `font-weight:${t.weight}` : "",
        t.lineHeight    ? `line-height:${t.lineHeight}` : "",
        t.letterSpacing ? `letter-spacing:${t.letterSpacing}` : "",
      ].filter((s) => s.length > 0).join(";");
      return rules ? `${tag}{${rules}}` : "";
    })
    .filter((s) => s.length > 0);

  const inlineCss = [
    rootVars.length  ? `:root{${rootVars.join("")}}` : "",
    lightVars.length ? `[data-theme="light"]{${lightVars.join("")}}` : "",
    ...typoCss,
  ].filter((s) => s.length > 0).join("\n");

  /* ── Font provider ──────────────────────────────────────────────── */
  const gFontsUrl   = fonts.provider === "google" && fonts.googleFontsUrl     ? fonts.googleFontsUrl     : null;
  const adobeProjId = fonts.provider === "adobe"  && fonts.adobeFontsProjectId ? fonts.adobeFontsProjectId : null;
  const customFont  = fonts.provider === "custom" && fonts.customFontImport   ? fonts.customFontImport   : null;

  /* ── Google Analytics 4 (standalone — only if not already in GTM) ── */
  const ga4Id = seo.gaTagId && !(seo.gtmHeadCode ?? "").includes(seo.gaTagId)
    ? seo.gaTagId : null;
  const ga4Init = ga4Id
    ? `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');`
    : null;

  /* ── GTM — extract inner script / noscript content ─────────────── */
  const gtmHead = seo.gtmHeadCode ? extractTag(seo.gtmHeadCode, "script")   : null;
  const gtmBody = seo.gtmBodyCode ? extractTag(seo.gtmBodyCode, "noscript") : null;

  /* ── Custom injections ──────────────────────────────────────────── */
  const customHead = seo.customHeadCode
    ? (seo.customHeadCode.trimStart().startsWith("<script")
        ? extractTag(seo.customHeadCode, "script")
        : seo.customHeadCode)
    : null;
  const customBody = seo.customBodyCode ?? null;

  /* ── Facebook Pixel inline script ──────────────────────────────── */
  const fbPixel = seo.fbPixelId
    ? `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?` +
      `n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;` +
      `n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;` +
      `t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}` +
      `(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');` +
      `fbq('init','${seo.fbPixelId}');fbq('track','PageView');`
    : null;

  /* ── Microsoft Clarity ──────────────────────────────────────────── */
  const clarity = seo.microsoftClarityId
    ? `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};` +
      `t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;` +
      `y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)}` +
      `(window,document,"clarity","script","${seo.microsoftClarityId}");`
    : null;

  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* ── Theme CSS variable overrides from admin Theme settings ── */}
        {inlineCss && <style dangerouslySetInnerHTML={{ __html: inlineCss }} />}

        {/* ── Font provider ── */}
        {gFontsUrl && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link rel="stylesheet" href={gFontsUrl} />
          </>
        )}
        {adobeProjId && (
          // eslint-disable-next-line @next/next/no-page-custom-font
          <link rel="stylesheet" href={`https://use.typekit.net/${adobeProjId}.css`} />
        )}
        {customFont && <style dangerouslySetInnerHTML={{ __html: customFont }} />}

        {/* ── Google Analytics 4 (standalone, no GTM) ── */}
        {ga4Id && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script async={true} src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} />
        )}
        {ga4Init && <script dangerouslySetInnerHTML={{ __html: ga4Init }} />}

        {/* ── Google Tag Manager (head snippet) ── */}
        {gtmHead && <script dangerouslySetInnerHTML={{ __html: gtmHead }} />}

        {/* ── Facebook Pixel ── */}
        {fbPixel && <script dangerouslySetInnerHTML={{ __html: fbPixel }} />}

        {/* ── Microsoft Clarity ── */}
        {clarity && <script dangerouslySetInnerHTML={{ __html: clarity }} />}

        {/* ── Custom head code injection ── */}
        {customHead && <script dangerouslySetInnerHTML={{ __html: customHead }} />}
      </head>
      <body
        className="min-h-screen overflow-x-hidden"
        style={{ backgroundColor: "var(--bt-black)", color: "var(--bt-white)" }}
        suppressHydrationWarning
      >
        {/* ── Google Tag Manager (noscript body fallback) ── */}
        {gtmBody && <noscript dangerouslySetInnerHTML={{ __html: gtmBody }} />}

        {/* ── Custom body code injection ── */}
        {customBody && (
          <div
            dangerouslySetInnerHTML={{ __html: customBody }}
            suppressHydrationWarning
          />
        )}

        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
