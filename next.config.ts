import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true, // Allow imports from outside the project directory
  },
  webpack: (config) => {
    // Add alias for the shared lib directory
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/lib': require('path').resolve(__dirname, '../lib'),
    }
    return config
  },
};

export default nextConfig;
