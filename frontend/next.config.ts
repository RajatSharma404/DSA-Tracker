import type { NextConfig } from "next";
import crypto from "crypto";

const isDevelopment = process.env.NODE_ENV !== "production";

// Prefer BACKEND_URL when explicitly set.
// In local development, default to localhost so frontend and backend stay in sync.
// In production, NEXT_PUBLIC_API_URL remains a backward-compatible fallback.
const RAW_BACKEND_URL = process.env.BACKEND_URL
  ? process.env.BACKEND_URL
  : isDevelopment
    ? "http://localhost:3001"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Normalize env value to an origin-like base so both:
// - https://service.onrender.com
// - https://service.onrender.com/api
// work correctly with the rewrite destination below.
const BACKEND_BASE_URL = RAW_BACKEND_URL.replace(/\/+$/, "").replace(
  /\/api$/,
  "",
);

const nextConfig: NextConfig = {
  // Unique build ID per deploy — busts CDN / browser caches on every redeploy
  generateBuildId: async () => {
    return crypto.randomBytes(8).toString("hex");
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: "/api/auth/:path*",
          destination: "/api/auth/:path*", // Keep NextAuth on Next.js
        },
      ],
      // Proxy all other /api/* calls to the Express backend
      fallback: [
        {
          source: "/api/:path*",
          destination: `${BACKEND_BASE_URL}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
