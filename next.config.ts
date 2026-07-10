import type { NextConfig } from "next";

// Next.js statically prerenders this site (no proxy/middleware, so no
// per-request nonce is available - see Next's CSP guide, "Without Nonces").
// script-src therefore needs 'unsafe-inline': besides our own JSON-LD
// snippet, Next's App Router injects its own inline RSC hydration payload
// scripts (`__next_f.push(...)`) whose content isn't stable across builds,
// so a static hash allowlist can't cover them without breaking hydration.
// Locking this down further would require switching the whole app to
// dynamic (per-request) rendering purely for CSP purposes, which isn't
// worth the lost static export/CDN caching for a site with no auth, forms,
// or user data.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    qualities: [75, 90, 95, 100],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // scrub frames never change without a redesign; let browsers and
        // the CDN keep them for a year so repeat visits scrub instantly
        source: "/scrub/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
