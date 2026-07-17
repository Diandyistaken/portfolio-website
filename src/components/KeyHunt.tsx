"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { KeyRound, X } from "lucide-react";
import { CvDownload } from "./CvDownload";

const STORE_KEY = "mm-keys-v1";
const ALL_KEYS = ["divider", "photo", "project", "footer", "skills"] as const;

/**
 * #67 hidden access key: a tiny key glyph tucked into a host component.
 * Clicking it reports to the KeyHunt collector. Deliberately faint — finding
 * one should feel like spotting a secret, not pressing a button.
 */
export function AccessKey({ id, className }: { id: string; className?: string }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        window.dispatchEvent(new CustomEvent("app:key-found", { detail: id }));
      }}
      className={`access-key ${className ?? ""}`}
    >
      <KeyRound size={11} />
    </button>
  );
}

/**
 * #67 Hidden access keys hunt: five key glyphs are scattered across the site
 * (divider, hero photo, project row, footer, skills). Each click toasts
 * "KEY_03 ACQUIRED" and ticks a keyring HUD; collecting all five unlocks a
 * vault overlay with a note, the CV download and a robot celebration.
 */
export function KeyHunt() {
  const reducedMotion = useReducedMotion();
  const [found, setFound] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [vaultOpen, setVaultOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const vaultTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) setFound(JSON.parse(raw) as string[]);
      } catch {
        // storage unavailable — hunt resets per visit
      }
    });

    const onFound = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (!id) return;
      setFound((previous) => {
        if (previous.includes(id)) return previous;
        const next = [...previous, id];
        try {
          localStorage.setItem(STORE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        setToast(`KEY_${String(next.length).padStart(2, "0")} ACQUIRED — ${next.length}/${ALL_KEYS.length}`);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 2600);
        if (next.length >= ALL_KEYS.length) {
          if (vaultTimer.current) clearTimeout(vaultTimer.current);
          vaultTimer.current = setTimeout(() => {
            setVaultOpen(true);
            window.dispatchEvent(new Event("app:vault-open"));
          }, 900);
        }
        return next;
      });
    };
    window.addEventListener("app:key-found", onFound);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("app:key-found", onFound);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (vaultTimer.current) clearTimeout(vaultTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!vaultOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setVaultOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [vaultOpen]);

  return (
    <>
      {/* keyring HUD — appears once the hunt has started */}
      {found.length > 0 && found.length < ALL_KEYS.length && (
        <div
          aria-hidden="true"
          className="fixed bottom-20 left-6 z-40 hidden items-center gap-1.5 rounded-full border border-foreground/15 bg-background/85 px-2.5 py-1 font-mono text-[0.6rem] text-muted lg:flex"
        >
          <KeyRound size={10} className="text-accent" /> {found.length}/{ALL_KEYS.length}
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <m.p
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-28 left-6 z-40 rounded border border-accent/50 bg-background/95 px-3 py-1.5 font-mono text-[0.65rem] text-accent"
            aria-hidden="true"
          >
            {toast}
          </m.p>
        )}
      </AnimatePresence>

      {/* the vault */}
      <AnimatePresence>
        {vaultOpen && (
          <m.div
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgb(5_7_12/0.85)] p-6 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setVaultOpen(false);
            }}
          >
            <m.div
              initial={reducedMotion ? false : { scale: 0.85, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="terminal-panel relative w-full max-w-sm rounded-xl border border-accent/50 p-6 shadow-[0_30px_100px_rgb(0_0_0/0.7),0_0_40px_rgb(var(--accent-rgb)/0.15)]"
            >
              <button
                type="button"
                onClick={() => setVaultOpen(false)}
                aria-label="close"
                className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full border border-foreground/15 text-muted hover:text-foreground"
              >
                <X size={12} />
              </button>
              <p className="font-mono text-[0.6rem] tracking-[0.3em] text-accent">VAULT UNLOCKED</p>
              <p className="mt-3 font-mono text-sm leading-relaxed text-foreground/90">
                5/5 keys. you explored every corner of this site — that is
                exactly the kind of curiosity I hire for. here is the full
                dossier:
              </p>
              <div className="mt-4">
                <CvDownload />
              </div>
              <p className="mt-4 border-t border-foreground/10 pt-3 font-mono text-[0.6rem] text-muted">
                — maksut · EOF
              </p>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
