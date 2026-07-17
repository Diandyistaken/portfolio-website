"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { cvFiles } from "@/lib/data";

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];

type ShellLine = { kind: "cmd" | "out"; text: string };

/**
 * #64 sudo Konami root shell: typing "sudo" anywhere (or entering the Konami
 * code) opens a fake password prompt. Two attempts print "permission denied —
 * nice try"; the third "succeeds" and drops a mini root shell with three joke
 * commands: `ls /secrets`, `cat resume.txt` (downloads the CV) and `exit`.
 * All output is a terminal artifact — English on purpose.
 */
export function RootShell() {
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"password" | "shell">("password");
  const [attempts, setAttempts] = useState(0);
  const [masked, setMasked] = useState("");
  const [lines, setLines] = useState<ShellLine[]>([]);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const openRef = useRef(false);

  // global triggers: "sudo" typed anywhere, or the Konami code
  useEffect(() => {
    let buffer = "";
    let konamiAt = 0;
    const onKey = (event: KeyboardEvent) => {
      if (openRef.current) return;
      const key = event.key.toLowerCase();
      // konami sequence
      if (key === KONAMI[konamiAt]) {
        konamiAt += 1;
        if (konamiAt >= KONAMI.length) {
          konamiAt = 0;
          openRef.current = true;
          setOpen(true);
          setPhase("shell"); // konami skips straight to root
          setLines([{ kind: "out", text: "konami override accepted. root shell granted." }]);
          return;
        }
      } else {
        konamiAt = key === KONAMI[0] ? 1 : 0;
      }
      // "sudo" typed outside inputs
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.key.length !== 1) return;
      buffer = (buffer + key).slice(-4);
      if (buffer === "sudo") {
        buffer = "";
        openRef.current = true;
        setOpen(true);
        setPhase("password");
        setLines([]);
        setMasked("");
        setAttempts(0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) {
      openRef.current = false;
      return;
    }
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, phase]);

  const submitPassword = () => {
    const attempt = attempts + 1;
    setAttempts(attempt);
    setMasked("");
    if (attempt >= 3) {
      setPhase("shell");
      setLines([{ kind: "out", text: "…fine. root shell granted (against my better judgment)." }]);
    } else {
      setLines((previous) => [
        ...previous,
        { kind: "out", text: attempt === 1 ? "sudo: permission denied — nice try" : "sudo: permission denied — bold of you to try again" },
      ]);
    }
  };

  const runCommand = () => {
    const cmd = draft.trim().toLowerCase();
    setDraft("");
    if (!cmd) return;
    const echo: ShellLine = { kind: "cmd", text: cmd };
    if (cmd === "exit") {
      setOpen(false);
      return;
    }
    if (cmd === "ls" || cmd === "ls /secrets") {
      setLines((previous) => [
        ...previous,
        echo,
        { kind: "out", text: "resume.txt   real_hourly_rate.enc   robot_feelings.db   todo_before_30.md" },
      ]);
      return;
    }
    if (cmd === "cat resume.txt" || cmd === "cat /secrets/resume.txt") {
      setLines((previous) => [...previous, echo, { kind: "out", text: "decrypting resume.txt → download starting…" }]);
      const link = document.createElement("a");
      link.href = cvFiles.en;
      link.download = "";
      link.click();
      return;
    }
    if (cmd === "help") {
      setLines((previous) => [...previous, echo, { kind: "out", text: "commands: ls /secrets · cat resume.txt · exit" }]);
      return;
    }
    setLines((previous) => [...previous, echo, { kind: "out", text: `sh: ${cmd}: command not found (try 'help')` }]);
  };

  return (
    <AnimatePresence>
      {open && (
        <m.div
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25 }}
          className="terminal-panel fixed bottom-6 left-1/2 z-[85] w-[min(92vw,26rem)] -translate-x-1/2 rounded-lg border border-accent/50 p-4 font-mono text-xs shadow-[0_24px_80px_rgb(0_0_0/0.7)]"
          aria-hidden="true"
        >
          <p className="text-[0.6rem] tracking-[0.24em] text-accent">ROOT SHELL — UNAUTHORIZED</p>
          <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
            {lines.map((line, index) =>
              line.kind === "cmd" ? (
                <p key={index} className="text-foreground/90">
                  <span className="text-accent"># </span>
                  {line.text}
                </p>
              ) : (
                <p key={index} className="pl-3 text-muted">
                  {line.text}
                </p>
              ),
            )}
          </div>
          {phase === "password" ? (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-foreground/80">[sudo] password for visitor:</span>
              <input
                ref={inputRef}
                type="password"
                value={masked}
                onChange={(event) => setMasked(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submitPassword();
                }}
                className="min-w-0 flex-1 bg-transparent text-accent outline-none"
                aria-label="password"
              />
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-accent">#</span>
              <input
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") runCommand();
                }}
                placeholder="ls /secrets · cat resume.txt · exit"
                className="min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted/40 focus:outline-none"
                aria-label="root shell"
              />
            </div>
          )}
          <p className="mt-2 text-[0.55rem] text-muted/60">ESC to abort</p>
        </m.div>
      )}
    </AnimatePresence>
  );
}
