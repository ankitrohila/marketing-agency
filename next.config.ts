import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler disabled — can interfere with GSAP useEffect hooks
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
