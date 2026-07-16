import type { NextConfig } from "next";

// The CSP moved to src/proxy.ts: securityheaders.com caps the grade at A
// while script-src carries a bare 'unsafe-inline', and the only sound way
// past that is a per-request nonce — which needs the proxy + dynamic
// rendering (see the layout's force-dynamic). The static headers below stay
// here; everything script-execution-related lives with the nonce.
const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90, 95, 100],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            // no camera/mic/geolocation/etc. anywhere on a portfolio —
            // deny the lot (securityheaders.com A+ requires this header)
            key: "Permissions-Policy",
            value:
              "accelerometer=(), autoplay=(), browsing-topics=(), camera=(), display-capture=(), encrypted-media=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), usb=(), xr-spatial-tracking=()",
          },
          {
            // origin isolation (also a Lighthouse best-practices audit)
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
