"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPasswordAction, type ResetPasswordState } from "../../actions";

const initialState: ResetPasswordState = { ok: false, message: null };

const inputClassName =
  "w-full rounded-md border border-foreground/15 bg-[rgb(var(--surface))] px-3 py-2.5 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-accent/60";

export function ResetForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  if (state.ok) {
    return (
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-5">
        <p className="font-mono text-sm text-accent">✓ {state.message}</p>
        <Link
          href="/admin"
          className="mt-4 inline-block rounded-md border border-accent/50 bg-accent/10 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-accent transition-colors hover:bg-accent/20"
        >
          Giriş sayfasına git →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-3">
      <input type="hidden" name="token" value={token} />
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">
          Yeni şifre (en az 10 karakter)
        </span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          maxLength={256}
          className={inputClassName}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">
          Yeni şifre (tekrar)
        </span>
        <input
          name="passwordAgain"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          maxLength={256}
          className={inputClassName}
        />
      </label>
      {state.message && (
        <p role="alert" className="font-mono text-xs leading-relaxed text-red-400">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-md border border-accent/50 bg-accent/10 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
      >
        {pending ? "Kaydediliyor…" : "Şifreyi güncelle"}
      </button>
    </form>
  );
}
