"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getStoredPasswordHash, setStoredPasswordHash, canPersistPasswordHash } from "@/lib/auth/adminStore";
import { hashPassword, verifyCredentials } from "@/lib/auth/credentials";
import { isMailerConfigured, sendResetEmail } from "@/lib/auth/mailer";
import { createResetToken, verifyResetToken } from "@/lib/auth/resetToken";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
} from "@/lib/auth/session";

export type LoginState = { error: string | null };

// flat delay on failure: keeps credential stuffing slow without state
const FAILED_LOGIN_DELAY_MS = 450;

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

  if (!(await verifyCredentials(username, password))) {
    await new Promise((resolve) => setTimeout(resolve, FAILED_LOGIN_DELAY_MS));
    return { error: "Kullanıcı adı veya şifre hatalı." };
  }

  const token = await createSessionToken();
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

async function currentBaseUrl(): Promise<string> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "maksutcakmaktas.com";
  const proto = headerStore.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function requestPasswordResetAction(
  _prev: ResetRequestState,
  _formData: FormData,
): Promise<ResetRequestState> {
  await new Promise((resolve) => setTimeout(resolve, FAILED_LOGIN_DELAY_MS));
  if (!isMailerConfigured()) {
    return {
      ok: false,
      message: "E-posta servisi henüz yapılandırılmamış (SMTP_USER + SMTP_PASS env değişkenleri gerekli).",
    };
  }
  const storedHash = await getStoredPasswordHash();
  if (!storedHash) {
    return { ok: false, message: "Şifre kaydı bulunamadı — sunucu yapılandırmasını kontrol et." };
  }
  try {
    const token = await createResetToken(storedHash);
    const link = `${await currentBaseUrl()}/admin/sifre-yenile?token=${encodeURIComponent(token)}`;
    await sendResetEmail(link);
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : "bilinmeyen hata";
    return { ok: false, message: `E-posta gönderilemedi: ${detail}` };
  }
  return {
    ok: true,
    message: "Yenileme bağlantısı mo.maksut@gmail.com ve greengamegf@gmail.com adreslerine gönderildi (30 dk geçerli).",
  };
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
    const detail = error instanceof Error ? error.message : "bilinmeyen hata";
    return { ok: false, message: `Şifre kaydedilemedi: ${detail}` };
  }
  return { ok: true, message: "Şifren güncellendi — yeni şifrenle giriş yapabilirsin." };
}
