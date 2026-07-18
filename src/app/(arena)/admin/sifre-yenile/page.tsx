import type { Metadata } from "next";
import Link from "next/link";
import { getStoredPasswordHash } from "@/lib/auth/adminStore";
import { verifyResetToken } from "@/lib/auth/resetToken";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = {
  title: "Şifre Yenileme — Maksut Çakmaktaş",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const storedHash = await getStoredPasswordHash();
  const tokenValid = Boolean(storedHash && (await verifyResetToken(token, storedHash)));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-16">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
        🔑 şifre yenileme
      </p>
      <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Yeni şifre belirle
      </h1>

      {tokenValid && token ? (
        <>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
            Bağlantı doğrulandı. Yeni şifreni belirle — kaydettiğin anda eski şifre ve
            açık kalan tüm yenileme bağlantıları geçersiz olur.
          </p>
          <div className="mt-8">
            <ResetForm token={token} />
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
            Bu bağlantı geçersiz ya da süresi dolmuş (bağlantılar 30 dakika geçerlidir ve
            şifre değiştiğinde kullanılamaz hale gelir). Giriş sayfasındaki
            &quot;Şifremi unuttum&quot; ile yeni bir bağlantı isteyebilirsin.
          </p>
          <Link
            href="/admin"
            className="mt-8 inline-block w-fit rounded-md border border-foreground/15 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:border-accent/40 hover:text-foreground"
          >
            ← Giriş sayfasına dön
          </Link>
        </>
      )}
    </main>
  );
}
