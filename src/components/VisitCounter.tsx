"use client";

import { useEffect, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Stats = { today: number; total: number };

/**
 * Daily visitor / total visit readout.
 *
 * Renders nothing at all until the API confirms a store is configured — an
 * invented number on a portfolio is a credibility claim, and a false one.
 */
export function VisitCounter() {
  const { t, locale } = useLanguage();
  const reducedMotion = useReducedMotion();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    // One POST per page load: that is the "visit" being counted.
    fetch("/api/visits", { method: "POST", signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.configured) setStats({ today: data.today, total: data.total });
      })
      .catch(() => {
        // offline / aborted — the counter simply stays hidden
      });
    return () => controller.abort();
  }, []);

  if (!stats) return null;

  const format = (value: number) => value.toLocaleString(locale);

  return (
    <m.div
      initial={reducedMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.62rem] tracking-[0.1em] text-muted"
    >
      <span className="flex items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
        {t.footer.visitsToday}: <span className="text-foreground/80">{format(stats.today)}</span>
      </span>
      <span aria-hidden="true" className="text-muted/40">
        ·
      </span>
      <span>
        {t.footer.visitsTotal}: <span className="text-foreground/80">{format(stats.total)}</span>
      </span>
    </m.div>
  );
}
