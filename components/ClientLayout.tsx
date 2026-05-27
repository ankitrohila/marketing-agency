"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import CustomCursor from "@/components/CustomCursor";
import SmoothScroll from "@/components/SmoothScroll";
import ThemeToggle from "@/components/ThemeToggle";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    // Admin pages: no navbar, no smooth scroll, no cursor, no theme toggle
    return <>{children}</>;
  }

  return (
    <>
      <CustomCursor />
      <ThemeToggle />
      <SmoothScroll>
        <Navbar />
        <main>{children}</main>
      </SmoothScroll>
    </>
  );
}
