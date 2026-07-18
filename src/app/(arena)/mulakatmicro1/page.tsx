import type { Metadata } from "next";
import Link from "next/link";
import { ARENA_APP_PATH } from "@/lib/arenaPaths";
import { isAdminRequest } from "@/lib/auth/admin";
import { logoutAction } from "../actions";
import { LoginForm } from "../LoginForm";

export const metadata: Metadata = {
  title: "micro1 Mülakat Arenası — Maksut Çakmaktaş",
  description: "micro1 mülakat hazırlık arenası — erişim izni gerektirir.",
};

const APP_PATH = ARENA_APP_PATH;

const modules = [
  { icon: "📚", name: "Öğren", detail: "Rol bazlı hazırlık patikaları ve konu anlatımları" },
  { icon: "🎮", name: "Oyunlar", detail: "Hız ve refleks tabanlı bilgi oyunları" },
  { icon: "📖", name: "Soru Bankası", detail: "Analist + pentester rolleri için yüzlerce soru" },
  { icon: "🇬🇧", name: "İngilizce", detail: "Sesli telaffuz ve mülakat İngilizcesi pratiği" },
  { icon: "🎤", name: "STAR Hikayeleri", detail: "Davranışsal sorular için sesli hikâye provası" },
  { icon: "🤖", name: "AI Mülakat", detail: "Mikrofonlu, gerçek zamanlı mülakat simülasyonu" },
  { icon: "🕵️", name: "Intel", detail: "Şirket ve süreç istihbaratı derlemesi" },
] as const;

export default async function MulakatMicro1Page({
  searchParams,
}: {
  searchParams: Promise<{ erisim?: string }>;
}) {
  const [isAdmin, params] = await Promise.all([isAdminRequest(), searchParams]);
  const deniedRedirect = params.erisim === "red";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-16">
      <header>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
          🛡️ özel sekme · site menüsünde listelenmez
        </p>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
          micro1 Mülakat Arenası
        </h1>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted sm:text-base">
          Siber güvenlik mülakatlarına hazırlık için kurduğum kişisel antrenman
          platformu: soru bankaları, sesli mülakat simülasyonu, İngilizce pratik ve
          şirket istihbaratı tek yerde. Aşağıda içeriden neler olduğunu
          görebilirsin — ekipmanları kullanmak ise erişim izni ister.
        </p>
      </header>

      {deniedRedirect && !isAdmin && (
        <div
          role="alert"
          className="mt-8 rounded-md border border-red-400/40 bg-red-400/5 px-4 py-3 font-mono text-xs text-red-400"
        >
          ⛔ Bu alan kilitli. Uygulamayı açmak için yönetici girişi gerekli.
        </div>
      )}

      <section aria-label="Arena modülleri" className="mt-10 grid gap-2.5 sm:grid-cols-2">
        {modules.map((module) => (
          <div
            key={module.name}
            className="relative rounded-md border border-foreground/10 bg-[rgb(var(--surface))] px-4 py-3.5"
          >
            <p className="font-mono text-sm text-foreground">
              {module.icon} {module.name}
              {!isAdmin && (
                <span aria-hidden="true" className="float-right text-muted/70">
                  🔒
                </span>
              )}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{module.detail}</p>
          </div>
        ))}
      </section>

      {isAdmin ? (
        <section className="mt-10 rounded-lg border border-accent/30 bg-accent/5 p-6">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
            ● erişim açık — hoş geldin maksut
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Tüm modüller bu tarayıcıda kilitsiz. Mikrofonlu bölümler için Chrome/Edge
            önerilir.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={APP_PATH}
              className="rounded-md border border-accent/50 bg-accent/10 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-accent transition-colors hover:bg-accent/20"
            >
              Arenayı başlat →
            </a>
            <Link
              href="/admin"
              className="rounded-md border border-foreground/15 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:border-accent/40 hover:text-foreground"
            >
              Yönetici paneli
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md border border-red-400/40 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-red-400 transition-colors hover:bg-red-400/10"
              >
                Çıkış
              </button>
            </form>
          </div>
        </section>
      ) : (
        <section className="mt-10 rounded-lg border border-foreground/10 bg-[rgb(var(--surface))] p-6">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">
            🔒 erişim izni gerekli
          </p>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
            Bu arena kişisel bir antrenman alanıdır; içeriği görebilirsin ama
            ekipmanları (soru bankası, sesli simülasyon, oyunlar) yalnızca yetkili
            oturum kullanabilir. Erişim için yönetici bilgileriyle giriş yap.
          </p>
          <div className="mt-6">
            <LoginForm next={APP_PATH} />
          </div>
        </section>
      )}

      <footer className="mt-12 flex items-center justify-between font-mono text-[0.65rem] tracking-[0.12em] text-muted/70">
        <span>&gt; micro1 prep arena · özel erişim</span>
        <Link href="/" className="transition-colors hover:text-foreground">
          ← siteye dön
        </Link>
      </footer>
    </main>
  );
}
