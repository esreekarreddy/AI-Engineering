import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile tldraw for proper ESM handling
  transpilePackages: [
    'tldraw',
    '@tldraw/editor',
    '@tldraw/state',
    '@tldraw/state-react',
    '@tldraw/store',
    '@tldraw/tlschema',
    '@tldraw/utils',
    '@tldraw/validate',
  ],
  
  // Empty turbopack config to silence the build warning
  // Turbopack handles tldraw deduplication automatically
  turbopack: {},
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
             key: 'Permissions-Policy',
             value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },
};

export default nextConfig;
