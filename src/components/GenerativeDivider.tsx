"use client";

import type { ReactNode } from "react";

/**
 * Section-break "breather" — replaces the old Istanbul photo dividers.
 * Pure CSS, no photo, no 3D: a calm panel whose glow follows the site's
 * scroll-driven accent color (see AccentCycler).
 */
export function GenerativeDivider({
  children,
  heightClass = "h-[30vh] 3xl:h-[36vh]",
}: {
  children: ReactNode;
  heightClass?: string;
}) {
  return (
    <section className={`relative flex w-full items-center justify-center overflow-hidden bg-background ${heightClass}`}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 90% at 50% 50%, rgb(var(--accent-rgb) / 0.14), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="relative px-6 text-center sm:px-10">
        <p className="font-mono text-sm tracking-wide text-accent sm:text-base">
          {children}
        </p>
      </div>
    </section>
  );
}
