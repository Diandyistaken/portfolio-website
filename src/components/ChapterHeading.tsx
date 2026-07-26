"use client";

import { Reveal } from "./Reveal";
import { DecryptText } from "./DecryptText";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

/**
 * Sub-heading for one chapter inside the work archive. Deliberately a tier
 * below SectionHeading: no diff-correct skit, no glyph inspector, no
 * scroll-direction kicker — the umbrella owns the big moment. Motion comes
 * from Reveal + DecryptText, so reduced-motion / perf-lite are inherited.
 */
export function ChapterHeading({
  step,
  label,
  title,
  description,
}: {
  /** dossier number, e.g. "06.1" */
  step: string;
  /** chapter label — same text as the jump-strip chip */
  label: string;
  title: string;
  description?: string;
}) {
  const { t } = useLanguage();

  return (
    <Reveal y={16}>
      <div className="flex min-w-0 items-center gap-3">
        <span className="font-mono shrink-0 rounded-sm border border-accent/30 px-2 py-0.5 text-[0.6rem] tracking-[0.16em] text-accent">
          {step}
        </span>
        <DecryptText
          // Locale-correct casing: Turkish maps i→İ, which is wrong in en/de.
          text={label.toLocaleUpperCase(t.htmlLang)}
          className="font-mono shrink-0 text-[0.62rem] uppercase tracking-[0.18em] text-muted"
          delay={0.08}
        />
        <span
          aria-hidden="true"
          className="h-px flex-1"
          style={{
            background:
              "linear-gradient(to right, rgb(var(--accent-rgb) / 0.35), rgb(var(--accent-rgb) / 0.03))",
          }}
        />
      </div>
      <h3 className="font-display mt-3 max-w-2xl text-2xl font-medium tracking-tight sm:text-3xl 3xl:max-w-4xl 3xl:text-4xl">
        {title}
      </h3>
      {description && (
        <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-muted [text-shadow:0_2px_16px_rgb(0_0_0/0.7)] sm:text-[0.95rem] 3xl:max-w-2xl">
          {description}
        </p>
      )}
    </Reveal>
  );
}
