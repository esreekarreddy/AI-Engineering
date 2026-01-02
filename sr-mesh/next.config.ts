import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  async headers() {
    const securityHeaders = [
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];

    // Only add CSP in production (breaks hot reload in dev)
    if (isProd) {
      securityHeaders.push({ 
        key: 'Content-Security-Policy', 
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'wasm-eval' blob:",
          "worker-src 'self' blob:",
          "connect-src 'self' https://huggingface.co https://cdn-lfs.huggingface.co https://*.huggingface.co",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob:",
          "font-src 'self' data:",
        ].join('; ')
      });
    }

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  // Empty turbopack config to silence Next.js 16 warning
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
