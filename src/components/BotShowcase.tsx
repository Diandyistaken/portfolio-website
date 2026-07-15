"use client";

import { m, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function BotShowcase() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const { messages, typing, time, label } = t.projects.botShowcase;

  return (
    <div
      aria-label={label}
      className="relative isolate overflow-hidden rounded-2xl border border-foreground/10 bg-[#080c15] shadow-[0_28px_80px_rgb(0_0_0/0.35)]"
    >
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
      <div className="relative flex items-center gap-3 border-b border-white/10 bg-white/[0.035] px-5 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-cyan-400 font-display font-bold text-[#05070c]">
          D
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Daily AI Researcher</p>
          <p className="mt-0.5 font-mono text-[0.65rem] text-accent">bot</p>
        </div>
        <span className="ml-auto font-mono text-[0.62rem] text-white/35">{time}</span>
      </div>

      <div className="relative min-h-[27rem] space-y-4 p-5 sm:p-6">
        {messages.map((message, index) => {
          const start = index * 1;
          return (
            <div key={message} className="relative min-h-14">
              {!reduceMotion && (
                <m.div
                  aria-label={typing}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: [0, 1, 1, 0], scale: [0.96, 1, 1, 0.98] }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: start, times: [0, 0.15, 0.75, 1] }}
                  className="absolute flex w-14 items-center justify-center gap-1 rounded-xl rounded-tl-sm bg-white/[0.08] px-3 py-3"
                >
                  {[0, 1, 2].map((dot) => (
                    <m.span
                      key={dot}
                      animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay: dot * 0.12 }}
                      className="h-1.5 w-1.5 rounded-full bg-white/55"
                    />
                  ))}
                </m.div>
              )}
              <m.div
                initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : start + 0.5 }}
                className="max-w-[92%] rounded-2xl rounded-tl-sm border border-white/[0.06] bg-white/[0.075] px-4 py-3 text-[0.78rem] leading-relaxed text-white/80 shadow-sm sm:text-sm"
              >
                {message}
                <span className="ml-2 whitespace-nowrap font-mono text-[0.56rem] text-white/30">{time}</span>
              </m.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
