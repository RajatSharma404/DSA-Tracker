import type { NextConfig } from "next";
import crypto from "crypto";

const nextConfig: NextConfig = {
  // Unique build ID per deploy — busts CDN / browser caches on every redeploy
  generateBuildId: async () => {
    return crypto.randomBytes(8).toString("hex");
  },
};

export default nextConfig;
