import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CustomCursor from "@/components/CustomCursor";
import SmoothScroll from "@/components/SmoothScroll";
import ThemeToggle from "@/components/ThemeToggle";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body
        className="min-h-screen overflow-x-hidden"
        style={{ backgroundColor: "var(--bt-black)", color: "var(--bt-white)" }}
        suppressHydrationWarning
      >
        <CustomCursor />
        <ThemeToggle />
        <SmoothScroll>
          <Navbar />
          <main>{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}
