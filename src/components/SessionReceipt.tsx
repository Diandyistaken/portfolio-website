"use client";

import { useEffect, useRef, useState } from "react";
import { m, useInView, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

/**
 * #28 Session receipt: when the footer scrolls into view, a little thermal
 * printout unrolls with the visitor's session stats — sections visited,
 * badges unlocked, time on page — like a shop receipt at checkout. A quiet,
 * personal "thanks for visiting" that rewards reaching the very bottom.
 */
export function SessionReceipt() {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  const startRef = useRef<number>(0);
  const [stats, setStats] = useState({ sections: 0, badges: 0, seconds: 0 });

  useEffect(() => {
    // performance.now()-based so it survives tab throttling
    startRef.current = performance.now();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const seenSections = new Set<string>();
    const sections = document.querySelectorAll<HTMLElement>("main section[id]");
    let badges = 0;
    try {
      const raw = localStorage.getItem("mm-achievements-v1");
      badges = raw ? (JSON.parse(raw) as unknown[]).length : 0;
    } catch {
      badges = 0;
    }
    // count sections the visitor actually reached (top above viewport middle)
    const mid = window.innerHeight / 2;
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top < mid) seenSections.add(section.id);
    });
    setStats({
      sections: seenSections.size,
      badges,
      seconds: Math.round((performance.now() - startRef.current) / 1000),
    });
  }, [inView]);

  const rows = [
    { label: t.receipt.sections, value: String(stats.sections) },
    { label: t.receipt.badges, value: `${stats.badges}/8` },
    { label: t.receipt.duration, value: `${stats.seconds}s` },
  ];

  return (
    <div ref={ref} className="mx-auto mt-10 w-full max-w-xs">
      <m.div
        initial={reducedMotion ? false : { clipPath: "inset(0 0 100% 0)", opacity: 0 }}
        animate={inView ? { clipPath: "inset(0 0 0% 0)", opacity: 1 } : undefined}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="receipt rounded-md px-4 py-3.5 font-mono text-[0.65rem] text-muted"
      >
        <p className="text-center tracking-[0.2em] text-foreground/80">{t.receipt.title}</p>
        <div className="my-2 border-t border-dashed border-foreground/15" />
        <dl className="space-y-1">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3">
              <dt className="truncate">{row.label}</dt>
              <dd className="tabular-nums text-accent">{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="my-2 border-t border-dashed border-foreground/15" />
        <p className="text-center leading-relaxed text-foreground/70">{t.receipt.thanks}</p>
      </m.div>
    </div>
  );
}
