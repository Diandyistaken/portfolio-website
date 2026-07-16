import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#11213f] px-6 text-center text-[#eef2fb]">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4fe08d]">404</p>
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Bu sayfa bulunamadı</h1>
      <p className="max-w-md text-sm text-[#9aa5bf]">
        Aradığın adres taşınmış ya da hiç var olmamış olabilir.
      </p>
      <Link
        href="/"
        className="rounded-md border border-[#4fe08d]/40 px-4 py-2 text-sm text-[#4fe08d] transition-colors hover:border-[#4fe08d]"
      >
        Ana sayfaya dön
      </Link>
    </div>
  );
}
