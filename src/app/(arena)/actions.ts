"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getStoredPasswordHash, setStoredPasswordHash, canPersistPasswordHash } from "@/lib/auth/adminStore";
import { hashPassword, verifyCredentials } from "@/lib/auth/credentials";
import { isMailerConfigured, sendResetEmail } from "@/lib/auth/mailer";
import { createResetToken, verifyResetToken } from "@/lib/auth/resetToken";
import { clientIp, rateLimitGuard } from "@/lib/rateLimit";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
} from "@/lib/auth/session";

export type LoginState = { error: string | null };

// flat delay on failure: keeps a single guess slow even when the rate limiter
// fails open (Redis down). The real throttle is rateLimitGuard below.
const FAILED_LOGIN_DELAY_MS = 450;

// A uniform reply for every password-reset outcome — sent/blocked/misconfigured
// all look the same to the caller. Recipients are fixed (owner-only), so there
// is nothing to enumerate; hiding the branch just avoids leaking SMTP/config
// state and rate-limit status to an anonymous prober. Real errors are logged.
const RESET_UNIFORM_MESSAGE =
  "İşlem alındı. Kayıtlı bir hesap varsa, yenileme bağlantısı e-posta ile gönderildi (30 dk geçerli).";

function safeNextPath(value: FormDataEntryValue | null): string {
  // only same-site absolute paths — never protocol-relative or external URLs
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/admin";
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const nextPath = safeNextPath(formData.get("next"));

  // Throttle BEFORE any expensive work (scrypt + Edge Config read) so a flood
  // can't be used to burn CPU/egress or to brute-force the password.
  const ip = clientIp(await headers());
  const limit = await rateLimitGuard({
    scope: "login",
    ip,
    perIp: { limit: 10, windowSeconds: 15 * 60 },
    global: { limit: 60, windowSeconds: 15 * 60 },
  });
  if (!limit.allowed) {
    return { error: "Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar dene." };
  }

  if (!(await verifyCredentials(username, password))) {
    await new Promise((resolve) => setTimeout(resolve, FAILED_LOGIN_DELAY_MS));
    return { error: "Kullanıcı adı veya şifre hatalı." };
  }

  // Bind the session to the hash it was minted against so a later reset revokes
  // it. If the hash vanished between verify and here, refuse rather than mint an
  // unbindable token.
  const passwordHash = await getStoredPasswordHash();
  if (!passwordHash) {
    return { error: "Oturum başlatılamadı. Lütfen tekrar dene." };
  }
  const token = await createSessionToken(passwordHash);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  redirect(nextPath);
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/");
}

export type ResetRequestState = { ok: boolean; message: string | null };

// The reset link must never follow an attacker-controlled Host header: only
// the site's own hosts are echoed back, everything else falls to the canonical
// URL (the token still works there — same store behind both).
const ALLOWED_LINK_HOSTS = new Set(["maksutcakmaktas.com", "www.maksutcakmaktas.com"]);
const CANONICAL_BASE_URL = "https://www.maksutcakmaktas.com";

async function currentBaseUrl(): Promise<string> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "";
  if (ALLOWED_LINK_HOSTS.has(host)) return `https://${host}`;
  if (host === "localhost" || host.startsWith("localhost:") || host.startsWith("127.0.0.1")) {
    return `http://${host}`;
  }
  return CANONICAL_BASE_URL;
}

export async function requestPasswordResetAction(
  _prev: ResetRequestState,
  _formData: FormData,
): Promise<ResetRequestState> {
  await new Promise((resolve) => setTimeout(resolve, FAILED_LOGIN_DELAY_MS));

  // Hard cap the mail-sending endpoint: an anonymous flood otherwise exhausts
  // the SMTP account's daily quota and takes the recovery channel down.
  const ip = clientIp(await headers());
  const limit = await rateLimitGuard({
    scope: "reset",
    ip,
    perIp: { limit: 3, windowSeconds: 60 * 60 },
    global: { limit: 10, windowSeconds: 60 * 60 },
  });
  if (!limit.allowed) {
    return { ok: true, message: RESET_UNIFORM_MESSAGE };
  }

  // From here every path returns the same uniform message; details go to logs.
  if (!isMailerConfigured()) {
    console.error("[reset] mailer not configured (SMTP_USER/SMTP_PASS missing)");
    return { ok: true, message: RESET_UNIFORM_MESSAGE };
  }
  const storedHash = await getStoredPasswordHash();
  if (!storedHash) {
    console.error("[reset] no stored password hash available");
    return { ok: true, message: RESET_UNIFORM_MESSAGE };
  }
  try {
    const token = await createResetToken(storedHash);
    const link = `${await currentBaseUrl()}/admin/sifre-yenile?token=${encodeURIComponent(token)}`;
    await sendResetEmail(link);
  } catch (error: unknown) {
    console.error("[reset] send failed:", error);
  }
  return { ok: true, message: RESET_UNIFORM_MESSAGE };
}

export type ResetPasswordState = { ok: boolean; message: string | null };

const MIN_PASSWORD_LENGTH = 10;

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const passwordAgain = String(formData.get("passwordAgain") ?? "");

  const storedHash = await getStoredPasswordHash();
  if (!storedHash || !(await verifyResetToken(token, storedHash))) {
    return { ok: false, message: "Bağlantı geçersiz veya süresi dolmuş. Yeni bir yenileme isteği gönder." };
  }
  if (password.length < MIN_PASSWORD_LENGTH || password.length > 256) {
    return { ok: false, message: `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalı.` };
  }
  if (password !== passwordAgain) {
    return { ok: false, message: "Şifreler birbiriyle uyuşmuyor." };
  }
  if (!canPersistPasswordHash()) {
    return {
      ok: false,
      message: "Kalıcı kayıt yapılandırılmamış (EDGE_CONFIG + VERCEL_TOKEN env değişkenleri gerekli).",
    };
  }
  try {
    await setStoredPasswordHash(hashPassword(password));
  } catch (error: unknown) {
    // Don't echo the upstream Vercel API response back to the client.
    console.error("[reset] persist failed:", error);
    return { ok: false, message: "Şifre kaydedilemedi. Lütfen daha sonra tekrar dene." };
  }
  return { ok: true, message: "Şifren güncellendi — yeni şifrenle giriş yapabilirsin." };
}
