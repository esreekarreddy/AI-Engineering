import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empty turbopack config to silence Next.js 16 warning
  // while keeping webpack config for ONNX runtime compatibility
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias = {
        ...config.resolve.alias,
        "sharp$": false,
        "onnxruntime-node$": false,
    }
    return config;
  },
};

export default nextConfig;
