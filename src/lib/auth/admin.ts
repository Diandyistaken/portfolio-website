import { cookies } from "next/headers";
import { getStoredPasswordHash } from "./adminStore";
import { SESSION_COOKIE, verifySessionToken } from "./session";

/** Server-side check used by layouts/pages: is this request an admin session? */
export async function isAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const passwordHash = await getStoredPasswordHash();
  return verifySessionToken(token, passwordHash ?? undefined);
}
