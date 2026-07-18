import type { Metadata } from "next";
import Link from "next/link";
import { isAdminRequest } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Maksut Şu An Nerede? — Maksut Çakmaktaş",
  description:
    "Neon bir siber şehirde Maksut'un öğrenme yolculuğunu canlı izle: AI Maksut binadan binaya gezer, sen de şehri keşfedebilirsin.",
  // the (arena) layout defaults to noindex for the admin surfaces — this
  // page is a public feature of the site, so crawlers are welcome
  robots: { index: true, follow: true },
};

const features = [
  { icon: "🏙️", name: "Neon Şehir", detail: "Her öğrendiğim konu bir gökdelen — cam kuleler, ıslak asfalt, yağmur" },
  { icon: "🛰️", name: "Canlı Durum", detail: "Maksut şu an hangi binada, ne çalışıyor — üst şeritte anlık akış" },
  { icon: "👩‍💻", name: "Bina Sakinleri", detail: "Her binanın önünde o konunun uzmanı bir karakter; yaklaş ve konuş" },
  { icon: "🛸", name: "Dron", detail: "Site maskotu şehirde geziyor — sürükle, bırak, sohbet et" },
  { icon: "🎮", name: "Sen de Oyna", detail: "A/D ile koş, F ile jetpack, E ile binalara gir — mobilde dokunmatik" },
  { icon: "🎓", name: "Gerçek Müfredat", detail: "Binaların içi gerçek çalışma haritam: kaynaklar, komutlar, rehberler" },
] as const;

export default async function NeredePage() {
  const isAdmin = await isAdminRequest();
  const appHref = isAdmin
    ? "/nerede/app?mode=admin&autostart=1"
    : "/nerede/app?mode=visitor&autostart=1";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-16">
      <header>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
          🌃 canlı şehir · herkese açık
        </p>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
          Maksut Şu An Nerede?
        </h1>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted sm:text-base">
          Siber güvenlik yolculuğumu bir neon şehre çevirdim: öğrendiğim her konu
          bir bina, her bina gerçek çalışma notlarımla dolu. AI Maksut şehirde
          gezinir, hangi binaya girdiyse o an onu çalışıyordur. İstersen sadece
          izle, istersen kendi karakterinle caddeye in.
        </p>
      </header>

      <section aria-label="Şehirde neler var" className="mt-10 grid gap-2.5 sm:grid-cols-2">
        {features.map((feature) => (
          <div
            key={feature.name}
            className="relative rounded-md border border-foreground/10 bg-[rgb(var(--surface))] px-4 py-3.5"
          >
            <p className="font-mono text-sm text-foreground">
              {feature.icon} {feature.name}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{feature.detail}</p>
          </div>
        ))}
      </section>

      {isAdmin ? (
        <section className="mt-10 rounded-lg border border-accent/30 bg-accent/5 p-6">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
            ● yönetici oturumu — Maksut olarak oynarsın
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Şehre kendi karakterinle girersin; ziyaretçiler AI Maksut&apos;u izlerken
            sen doğrudan kontrol edersin. Ses için şehre girince bir tuşa basman
            yeterli.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={appHref}
              className="rounded-md border border-accent/50 bg-accent/10 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-accent transition-colors hover:bg-accent/20"
            >
              Şehre gir →
            </a>
            <Link
              href="/admin"
              className="rounded-md border border-foreground/15 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:border-accent/40 hover:text-foreground"
            >
              Yönetici paneli
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-10 rounded-lg border border-foreground/10 bg-[rgb(var(--surface))] p-6">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">
            🚶 ziyaretçi olarak keşfet
          </p>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
            Misafir karakterinle şehre in: AI Maksut&apos;un o an nerede olduğunu
            gör, bina sakinleriyle sohbet et, dronu sürükle. Binalara girip benim
            gerçek çalışma haritamı da inceleyebilirsin.
          </p>
          <div className="mt-6">
            <a
              href={appHref}
              className="inline-block rounded-md border border-accent/50 bg-accent/10 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-accent transition-colors hover:bg-accent/20"
            >
              Şehri ziyaret et →
            </a>
          </div>
        </section>
      )}

      <footer className="mt-12 flex items-center justify-between font-mono text-[0.65rem] tracking-[0.12em] text-muted/70">
        <span>&gt; maksut nerede · canlı simülasyon</span>
        <Link href="/" className="transition-colors hover:text-foreground">
          ← siteye dön
        </Link>
      </footer>
    </main>
  );
}
