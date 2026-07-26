import { NextResponse } from "next/server";
import { isVisitStoreConfigured, readVisits, recordVisit } from "@/lib/visits";

export const dynamic = "force-dynamic";

const COOKIE = "mm-visitor";
/** Long enough that a returning reader is not double-counted as "new today". */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

function newVisitorId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 24);
}

/** Read the figures (no write) — used if something else wants to display them. */
export async function GET() {
  if (!isVisitStoreConfigured()) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }
  try {
    const stats = await readVisits();
    return NextResponse.json({ configured: true, ...stats });
  } catch {
    // A counter is decoration: never turn a storage hiccup into a visible error.
    return NextResponse.json({ configured: false }, { status: 200 });
  }
}

/**
 * Record a visit. Called once per page load from the client.
 *
 * The visitor id is a random token in a first-party cookie. No IP, no
 * fingerprint, nothing derived from either — and it is only ever fed to a
 * HyperLogLog, so the store keeps a count, not a guest list.
 */
export async function POST(request: Request) {
  if (!isVisitStoreConfigured()) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const existing = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);

  const visitorId = existing && existing.length >= 8 ? existing : newVisitorId();

  try {
    const stats = await recordVisit(visitorId);
    const response = NextResponse.json({ configured: true, ...stats });
    if (!existing) {
      response.cookies.set(COOKIE, visitorId, {
        path: "/",
        maxAge: COOKIE_MAX_AGE,
        sameSite: "lax",
        httpOnly: true,
      });
    }
    return response;
  } catch {
    return NextResponse.json({ configured: false }, { status: 200 });
  }
}
