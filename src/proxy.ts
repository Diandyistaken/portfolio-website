import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";
import { getStoredPasswordHash } from "@/lib/auth/adminStore";

const ARENA_APP_PREFIX = "/mulakatmicro1/app";
const ARENA_TR_PREFIX = "/mülakatmicro1"; // hand-typed Turkish URL variant

// "Maksut şu an nerede?" — a static canvas game under public/nerede/app with
// plain <script src> tags. Like the arena it can't run under the nonce/
// strict-dynamic CSP, so it gets a conservative self-only CSP. Unlike the
// arena the VISITOR view is PUBLIC (guests watch the AI Maksut), but the ADMIN
// mode (?mode=admin — you play as Maksut, through his curriculum records) is
// gated to a real admin session below.
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
 * Is this request a valid admin session? The session token is bound to the
 * current password hash, so we read the hash and hand it to the verifier; a
 * missing hash (store down / not configured) fails closed.
 */
async function isAdminSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const passwordHash = await getStoredPasswordHash();
  return verifySessionToken(token, passwordHash ?? undefined);
}

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
  const rawPath = request.nextUrl.pathname;

  // SECURITY: decide every route gate on the DECODED path, not the raw one.
  // The static-file layer decodes percent-escapes before it looks a file up,
  // so comparing the still-encoded path let `/mulakatmicro1/%61pp/...` (%61 =
  // 'a') sail past the admin gate and fetch the file anyway. Decode once here,
  // and reject anything that still contains a '%' afterwards (double-encoding
  // like %2561) — fail closed rather than guess.
  let path: string;
  try {
    path = decodeURIComponent(rawPath);
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }
  if (path.includes("%")) {
    return new NextResponse("Bad Request", { status: 400 });
  }
  // collapse duplicate slashes so `/mulakatmicro1//app` can't dodge startsWith
  path = path.replace(/\/{2,}/g, "/");

  // /mülakatmicro1... → /mulakatmicro1... (browsers send it percent-encoded;
  // decodeURIComponent above has already turned %C3%BC back into ü)
  if (path.startsWith(ARENA_TR_PREFIX)) {
    const url = request.nextUrl.clone();
    url.pathname = "/mulakatmicro1" + path.slice(ARENA_TR_PREFIX.length);
    return NextResponse.redirect(url, 308);
  }

  // The city game is public in VISITOR mode. ADMIN mode (playing as Maksut,
  // walking his real curriculum/progress records) is gated: a non-admin asking
  // for ?mode=admin is bounced to ?mode=visitor before the app ever loads.
  if (path.startsWith(GAME_APP_PREFIX)) {
    const isDocument =
      path === GAME_APP_PREFIX || path === `${GAME_APP_PREFIX}/` || path.endsWith("/index.html");
    if (isDocument && request.nextUrl.searchParams.get("mode") === "admin") {
      if (!(await isAdminSession(request))) {
        const url = request.nextUrl.clone();
        url.searchParams.set("mode", "visitor");
        return NextResponse.redirect(url, 307);
      }
    }
    const response = NextResponse.next();
    response.headers.set(
      "Content-Security-Policy",
      ARENA_APP_CSP.replace("frame-ancestors 'none'", "frame-ancestors 'self'"),
    );
    // The HTML document URL is stable (…/index.html?mode=…&autostart=1), so a
    // cached copy would keep pointing at stale ?v= asset URLs and never pull an
    // update. Force revalidation of the document; the assets carry ?v= and stay
    // cacheable, so this costs one conditional request, not the whole game.
    if (isDocument) {
      response.headers.set("Cache-Control", "no-cache, must-revalidate");
    }
    return response;
  }

  // Access gate: the static arena app is admin-only. Everything else under
  // /mulakatmicro1 (the preview page) stays public.
  if (path.startsWith(ARENA_APP_PREFIX)) {
    if (!(await isAdminSession(request))) {
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
    // dotted path) still receives the conservative game CSP and mode gate
    { source: "/nerede/:path*" },
  ],
};
