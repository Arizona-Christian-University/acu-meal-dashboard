import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  // Enable experimental features for edge compatibility
  experimental: {
    // Cloudflare Pages uses edge runtime
  },
  // Optimize for serverless deployment
  output: 'standalone',
};

export default nextConfig;
