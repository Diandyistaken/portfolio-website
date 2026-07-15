"use client";

import { useEffect } from "react";

// Replaces the entire root layout when it throws, so it must own its own
// <html>/<body> — this is the last line of defense if RootLayout itself fails.
export default function GlobalError({
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
    <html lang="tr">
      <body style={{ background: "#05070c", color: "#e9eef6" }}>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            padding: "1.5rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Bir şeyler ters gitti</h1>
          <p style={{ maxWidth: "28rem", fontSize: "0.875rem", color: "#94a0b3" }}>
            Sayfa yüklenemedi. Tekrar denemek için aşağıdaki butona tıkla.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              borderRadius: "0.375rem",
              border: "1px solid rgba(79,224,141,0.4)",
              padding: "0.5rem 1rem",
              color: "#4fe08d",
              background: "transparent",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Tekrar dene
          </button>
        </div>
      </body>
    </html>
  );
}
