import type { Metadata } from "next";
import Link from "next/link";
import { ARENA_APP_PATH } from "@/lib/arenaPaths";
import { isAdminRequest } from "@/lib/auth/admin";
import { logoutAction } from "../actions";
import { ForgotPassword } from "../ForgotPassword";
import { LoginForm } from "../LoginForm";

export const metadata: Metadata = {
  title: "Yönetici Paneli — Maksut Çakmaktaş",
};

const panelLinkClassName =
  "flex items-center justify-between rounded-md border border-foreground/10 bg-[rgb(var(--surface))] px-4 py-3.5 font-mono text-sm transition-colors hover:border-accent/40";

export default async function AdminPage() {
  const isAdmin = await isAdminRequest();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-16">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
        {isAdmin ? "● oturum aktif" : "○ oturum kapalı"}
      </p>
      <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {isAdmin ? "Hoş geldin, Maksut." : "Yönetici Girişi"}
      </h1>

      {isAdmin ? (
        <>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
            Admin modu açık. Site artık sana özel selamlıyor ve kilitli bölümler bu
            tarayıcıda tamamen erişilebilir durumda.
          </p>
          <div className="mt-8 flex flex-col gap-2.5">
            <a href={ARENA_APP_PATH} className={panelLinkClassName}>
              <span>🛡️ micro1 Mülakat Arenası&apos;nı başlat</span>
              <span className="text-accent">→</span>
            </a>
            <Link href="/mulakatmicro1" className={panelLinkClassName}>
              <span>🔎 Arena tanıtım sayfası (ziyaretçi görünümü)</span>
              <span className="text-accent">→</span>
            </Link>
            <Link href="/" className={panelLinkClassName}>
              <span>🏠 Siteye dön</span>
              <span className="text-accent">→</span>
            </Link>
          </div>
          <form action={logoutAction} className="mt-8">
            <button
              type="submit"
              className="rounded-md border border-red-400/40 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-red-400 transition-colors hover:bg-red-400/10"
            >
              Oturumu kapat
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
            Bu panel yalnızca site sahibine aittir. Giriş yaptığında site sana özel
            hitap eder ve kilitli sekmeler açılır.
          </p>
          <div className="mt-8">
            <LoginForm next="/admin" />
            <ForgotPassword />
          </div>
        </>
      )}

      <p className="mt-12 font-mono text-[0.65rem] tracking-[0.12em] text-muted/70">
        &gt; bu sayfa arama motorlarına kapalıdır ve site menüsünde listelenmez.
      </p>
    </main>
  );
}
