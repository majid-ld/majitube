import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mark native Node modules as server-only externals
  serverExternalPackages: ["better-sqlite3"],

  // Increase the body size limit for chunked video uploads (default: 4MB)
  // Each chunk is 5MB so we set this to 8MB for safety
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },

  // Fix Turbopack root detection when multiple lockfiles are present
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
