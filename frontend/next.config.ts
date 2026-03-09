import type { NextConfig } from "next";
import crypto from "crypto";

// On Render / any cloud platform set BACKEND_URL to the backend service URL
// e.g. https://dsa-tracker-backend.onrender.com
// Locally it falls back to http://localhost:3001
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

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
          destination: `${BACKEND_URL}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
