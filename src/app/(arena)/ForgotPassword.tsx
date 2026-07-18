"use client";

import { useActionState } from "react";
import { requestPasswordResetAction, type ResetRequestState } from "./actions";

const initialState: ResetRequestState = { ok: false, message: null };

export function ForgotPassword() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

  return (
    <form action={formAction} className="mt-4">
      <button
        type="submit"
        disabled={pending}
        className="font-mono text-xs text-muted underline decoration-dotted underline-offset-4 transition-colors hover:text-accent disabled:opacity-50"
      >
        {pending ? "Gönderiliyor…" : "Şifremi unuttum"}
      </button>
      {state.message && (
        <p
          role="status"
          className={`mt-2 max-w-sm font-mono text-xs leading-relaxed ${state.ok ? "text-accent" : "text-red-400"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
