import type { NextConfig } from "next";
import crypto from "crypto";

const nextConfig: NextConfig = {
  // Unique build ID per deploy — busts Vercel/CDN caches automatically
  generateBuildId: async () => {
    return crypto.randomBytes(8).toString("hex");
  },
  async rewrites() {
    return {
      // These rewrites are checked before Next.js pages/API routes
      beforeFiles: [],
      // These rewrites are checked after pages but before fallback
      afterFiles: [
        {
          source: "/api/auth/:path*",
          destination: "/api/auth/:path*", // Keep NextAuth on Next.js
        },
      ],
      // Fallback rewrites — only if no Next.js page/API matched
      fallback: [
        {
          source: "/api/:path*",
          destination: "http://localhost:3001/api/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
