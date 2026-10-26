import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.STANDALONE === "true" ? "standalone" : undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    ...(process.platform === "win32" ? { cpus: 1, workerThreads: false } : {}),
  },
};

export default nextConfig;
