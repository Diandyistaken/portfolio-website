"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

const inputClassName =
  "w-full rounded-md border border-foreground/15 bg-[rgb(var(--surface))] px-3 py-2.5 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-accent/60";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">
          Kullanıcı adı
        </span>
        <input
          name="username"
          type="text"
          autoComplete="username"
          required
          maxLength={256}
          className={inputClassName}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">
          Şifre
        </span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={256}
          className={inputClassName}
        />
      </label>
      {state.error && (
        <p role="alert" className="font-mono text-xs text-red-400">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-md border border-accent/50 bg-accent/10 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
      >
        {pending ? "Doğrulanıyor…" : "Giriş yap"}
      </button>
    </form>
  );
}
