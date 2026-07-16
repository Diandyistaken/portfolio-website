"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#11213f] px-6 text-center text-[#eef2fb]">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#f0787c]">
        Bir şeyler ters gitti
      </p>
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">
        Sayfa yüklenirken bir hata oluştu
      </h1>
      <p className="max-w-md text-sm text-[#9aa5bf]">
        Sorun kaydedildi. Tekrar denemek için aşağıdaki butona tıklayabilir ya da sayfayı
        yenileyebilirsin.
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-[#4fe08d]/40 px-4 py-2 text-sm text-[#4fe08d] transition-colors hover:border-[#4fe08d]"
        >
          Tekrar dene
        </button>
        <Link
          href="/"
          className="rounded-md border border-white/10 px-4 py-2 text-sm text-[#eef2fb] transition-colors hover:border-white/30"
        >
          Ana sayfaya dön
        </Link>
      </div>
    </div>
  );
}
