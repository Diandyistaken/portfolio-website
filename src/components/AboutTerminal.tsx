"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePerfLite } from "./SectionBackdrop";

type Line = { kind: "cmd" | "out"; text: string };

/**
 * On-brand replacement for the old 15-second scroll-scrubbed reel: a compact
 * terminal that types out a `whoami`-style self-introduction. Commands type
 * character by character; their output prints instantly, the way a real shell
 * behaves. Reduced-motion / perf-lite renders the whole session at once.
 */
export function AboutTerminal() {
  const { t } = useLanguage();
  const { title, commands, extras, extraHint } = t.about.terminal;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const instant = reducedMotion || perfLite;

  // Bonus commands typed on click, one per click, cycling through `extras`.
  const [extraLines, setExtraLines] = useState<Line[]>([]);
  const [extraPartial, setExtraPartial] = useState<string | null>(null);
  const extraIndex = useRef(0);
  const extraTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (extraTimer.current) clearInterval(extraTimer.current);
    };
  }, []);

  const lines = useMemo<Line[]>(
    () =>
      commands.flatMap((command) => [
        { kind: "cmd" as const, text: command.cmd },
        { kind: "out" as const, text: command.out },
      ]),
    [commands],
  );

  // Number of fully-printed lines, plus the partial text of the command
  // currently being typed (empty unless a "cmd" line is mid-type).
  // `instant` derives the final state at render time instead of via effect.
  const [typedCount, setTypedCount] = useState(0);
  const [partial, setPartial] = useState("");
  const printed = instant ? lines.length : typedCount;

  useEffect(() => {
    if (instant || !inView) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let index = 0;
    let chars = 0;

    const step = () => {
      if (cancelled || index >= lines.length) return;
      const line = lines[index];

      if (line.kind === "out") {
        setTypedCount(index + 1);
        setPartial("");
        index += 1;
        chars = 0;
        timer = setTimeout(step, 480);
        return;
      }

      if (chars < line.text.length) {
        chars += 1;
        setPartial(line.text.slice(0, chars));
        timer = setTimeout(step, 32 + Math.random() * 34);
        return;
      }

      // command fully typed → commit it, pause as if Enter was pressed
      setTypedCount(index + 1);
      setPartial("");
      index += 1;
      chars = 0;
      timer = setTimeout(step, 220);
    };

    timer = setTimeout(step, 360);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [inView, instant, lines]);

  const activeLine = lines[printed];
  const typingCmd = !instant && activeLine?.kind === "cmd";
  const done = printed >= lines.length;

  const runExtra = () => {
    if (!done || extraPartial !== null) return;
    const extra = extras[extraIndex.current % extras.length];
    extraIndex.current += 1;
    window.dispatchEvent(new Event("app:terminal-extra"));

    if (instant) {
      setExtraLines((previous) => [
        ...previous,
        { kind: "cmd", text: extra.cmd },
        { kind: "out", text: extra.out },
      ]);
      return;
    }

    let chars = 0;
    setExtraPartial("");
    extraTimer.current = setInterval(() => {
      chars += 1;
      setExtraPartial(extra.cmd.slice(0, chars));
      if (chars >= extra.cmd.length) {
        if (extraTimer.current) clearInterval(extraTimer.current);
        setTimeout(() => {
          setExtraLines((previous) => [
            ...previous,
            { kind: "cmd", text: extra.cmd },
            { kind: "out", text: extra.out },
          ]);
          setExtraPartial(null);
        }, 260);
      }
    }, 34);
  };

  return (
    <div
      ref={ref}
      onClick={runExtra}
      className={`terminal-panel group overflow-hidden rounded-xl border border-foreground/10 shadow-[0_24px_80px_rgb(0_0_0/0.42)] ${
        done ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center gap-3 border-b border-foreground/10 px-4 py-3">
        <span className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
        </span>
        <span className="truncate font-mono text-[0.7rem] tracking-wide text-muted">
          {title}
        </span>
      </div>

      <div className="min-h-[15rem] px-4 py-5 font-mono text-xs leading-relaxed sm:min-h-[16rem] sm:px-6 sm:text-sm 3xl:text-base">
        {lines.map((line, i) => {
          if (i > printed) return null;
          const isTyping = i === printed && line.kind === "cmd" && !instant;
          if (i === printed && !isTyping) return null; // output not printed yet
          const text = isTyping ? partial : line.text;

          if (line.kind === "cmd") {
            return (
              <p key={i} className="mt-3 flex items-baseline gap-2 first:mt-0">
                <span className="shrink-0 text-accent">$</span>
                <span className="text-foreground/90">
                  {text}
                  {isTyping && (
                    <span className="ops-cursor ml-0.5 inline-block text-accent" aria-hidden="true">
                      ▊
                    </span>
                  )}
                </span>
              </p>
            );
          }

          return (
            <p key={i} className="mt-1.5 pl-4 text-muted">
              {text}
            </p>
          );
        })}

        {extraLines.map((line, i) =>
          line.kind === "cmd" ? (
            <p key={`extra-${i}`} className="mt-3 flex items-baseline gap-2">
              <span className="shrink-0 text-accent">$</span>
              <span className="text-foreground/90">{line.text}</span>
            </p>
          ) : (
            <p key={`extra-${i}`} className="mt-1.5 pl-4 text-muted">
              {line.text}
            </p>
          ),
        )}

        {extraPartial !== null && (
          <p className="mt-3 flex items-baseline gap-2" aria-hidden="true">
            <span className="shrink-0 text-accent">$</span>
            <span className="text-foreground/90">
              {extraPartial}
              <span className="ops-cursor ml-0.5 inline-block text-accent">▊</span>
            </span>
          </p>
        )}

        {(instant || (!typingCmd && extraPartial === null)) && (
          <p className="mt-3 flex items-baseline gap-2" aria-hidden="true">
            <span className="shrink-0 text-accent">$</span>
            <span className="ops-cursor inline-block text-accent">▊</span>
            {done && (
              <span className="ml-2 select-none text-[0.65rem] text-muted/75 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                {extraHint}
              </span>
            )}
          </p>
        )}

        {done && (
          <p className="sr-only" aria-live="polite">
            {commands.map((command) => `${command.cmd}: ${command.out}`).join(". ")}
          </p>
        )}
      </div>
    </div>
  );
}
