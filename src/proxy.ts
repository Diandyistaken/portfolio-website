import { NextRequest, NextResponse } from "next/server";

/**
 * Per-request nonce CSP (securityheaders.com A+ requirement: no bare
 * 'unsafe-inline' in script-src). Pattern per Next's CSP guide:
 * - fresh nonce per request, passed via the Content-Security-Policy request
 *   header so Next stamps it onto every framework/inline script it renders
 * - 'strict-dynamic' lets nonce'd bundles inject further scripts (analytics)
 * - `https: 'unsafe-inline'` is the CSP2 fallback — CSP3 browsers ignore
 *   both when a nonce is present, old browsers keep working
 * Pages therefore render dynamically (see layout's force-dynamic).
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    // style ATTRIBUTES (framer-motion) have no nonce mechanism; keeping
    // unsafe-inline in style-src is the accepted pattern and does not cap
    // the securityheaders grade (only script-src does).
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    // skip static assets, image optimizer, public files (anything with a
    // dot) and next/link prefetches — they don't execute scripts
    {
      source: "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
