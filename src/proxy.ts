import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

const ARENA_APP_PREFIX = "/mulakatmicro1/app";
const ARENA_TR_PREFIX = "/mülakatmicro1"; // hand-typed Turkish URL variant

// "Maksut şu an nerede?" — a static canvas game under public/nerede/app with
// plain <script src> tags. Like the arena it can't run under the nonce/
// strict-dynamic CSP, so it gets a conservative self-only CSP. Unlike the
// arena it is PUBLIC (visitors watch the AI Maksut), so no admin gate.
const GAME_APP_PREFIX = "/nerede/app";

/**
 * The micro1 arena is a static app under public/ with plain <script src> tags
 * and inline handlers — the nonce/strict-dynamic CSP would break it. It gets
 * its own conservative CSP instead (everything self, no external hosts).
 */
const ARENA_APP_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

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
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // /mülakatmicro1... → /mulakatmicro1... (browsers send it percent-encoded)
  let decodedPathname = pathname;
  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    // malformed escape sequence — fall through with the raw path
  }
  if (decodedPathname.startsWith(ARENA_TR_PREFIX)) {
    const url = request.nextUrl.clone();
    url.pathname = "/mulakatmicro1" + decodedPathname.slice(ARENA_TR_PREFIX.length);
    return NextResponse.redirect(url, 308);
  }

  // The game is public: give it the conservative static-app CSP (self +
  // inline for its plain scripts) and let it frame only within our own site.
  if (pathname.startsWith(GAME_APP_PREFIX)) {
    const response = NextResponse.next();
    response.headers.set(
      "Content-Security-Policy",
      ARENA_APP_CSP.replace("frame-ancestors 'none'", "frame-ancestors 'self'"),
    );
    // The HTML document URL is stable (…/index.html?mode=…&autostart=1), so a
    // cached copy would keep pointing at stale ?v= asset URLs and never pull an
    // update. Force revalidation of the document; the assets carry ?v= and stay
    // cacheable, so this costs one conditional request, not the whole game.
    if (pathname.endsWith("/index.html") || pathname === GAME_APP_PREFIX) {
      response.headers.set("Cache-Control", "no-cache, must-revalidate");
    }
    return response;
  }

  // Access gate: the static arena app is admin-only. Everything else under
  // /mulakatmicro1 (the preview page) stays public.
  if (pathname.startsWith(ARENA_APP_PREFIX)) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const isAdmin = await verifySessionToken(token);
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/mulakatmicro1";
      url.search = "?erisim=red";
      return NextResponse.redirect(url);
    }
    const response = NextResponse.next();
    response.headers.set("Content-Security-Policy", ARENA_APP_CSP);
    return response;
  }

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
    // the arena's static files (dotted paths the rule above skips) must
    // still pass the access gate — no prefetch exception here on purpose
    { source: "/mulakatmicro1/:path*" },
    // the game's static files need the same treatment so index.html (a
    // dotted path) still receives the conservative game CSP
    { source: "/nerede/:path*" },
  ],
};
