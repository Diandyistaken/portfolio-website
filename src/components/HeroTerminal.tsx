"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";

/**
 * Click the "SYSTEM SECURED" badge → a mini security console types out a
 * playful boot sequence. Typing runs on one interval and stops itself;
 * reduced-motion users get the full text instantly.
 */

const LINES = [
  "> whoami",
  "muhammed.maksut // computer engineer",
  "> nmap -sV localhost",
  "3 ports scanned · 0 vulnerabilities",
  "> ./blueteam --engage",
  "FIREWALL ACTIVE · THREAT NEUTRALIZED",
  "> status",
  "■ SYSTEM SECURED",
];

const FULL_TEXT = LINES.join("\n");

export function HeroTerminal() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText(FULL_TEXT);
      return;
    }
    // time-based typing (~65 chars/s): finishes on schedule even if the
    // browser throttles animation frames
    const start = performance.now();
    let raf = 0;
    let lastChars = -1;
    const step = (now: number) => {
      const chars = Math.min(
        Math.floor(((now - start) / 1000) * 65),
        FULL_TEXT.length
      );
      if (chars !== lastChars) {
        lastChars = chars;
        setText(FULL_TEXT.slice(0, chars));
      }
      if (chars < FULL_TEXT.length) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="tap-pop surface inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[0.7rem] tracking-[0.18em] text-accent transition-shadow hover:shadow-[0_0_24px_rgb(var(--accent-rgb)/0.3)]"
      >
        <span className="hud-dot inline-block h-1.5 w-1.5 rounded-full bg-accent" />
        SYSTEM SECURED
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              transformOrigin: "top left",
              background: "rgb(5 7 12 / 0.96)",
              boxShadow:
                "0 14px 44px rgb(0 0 0 / 0.6), 0 0 30px rgb(var(--accent-rgb) / 0.12)",
            }}
            className="absolute left-0 top-full z-30 mt-3 w-[21rem] max-w-[82vw] rounded-lg border border-white/10"
          >
            <div className="flex items-center gap-1.5 border-b border-white/8 px-3.5 py-2.5">
              <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
              <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
              <span className="h-2 w-2 rounded-full bg-[#28c840]" />
              <span className="ml-2 font-mono text-[0.6rem] tracking-[0.15em] text-muted">
                mmç@sec-console
              </span>
            </div>
            <pre className="whitespace-pre-wrap px-4 py-3.5 font-mono text-[0.7rem] leading-relaxed text-foreground/85">
              {text.split("\n").map((line, idx) => (
                <span
                  key={idx}
                  className={
                    line.startsWith(">")
                      ? "text-muted"
                      : line.includes("SECURED") || line.includes("NEUTRALIZED")
                        ? "text-accent"
                        : undefined
                  }
                >
                  {line}
                  {"\n"}
                </span>
              ))}
              <span className="hud-dot inline-block h-3 w-1.5 translate-y-0.5 bg-accent" />
            </pre>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
