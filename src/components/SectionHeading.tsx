"use client";

import { Reveal } from "./Reveal";
import { DecryptText } from "./DecryptText";

export function SectionHeading({
  index,
  kicker,
  title,
  description,
}: {
  index: string;
  kicker: string;
  title: string;
  description?: string;
}) {
  return (
    <Reveal>
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <DecryptText
          text={`[ ${index} ] // ${kicker}`}
          className="kicker shrink-0"
          delay={0.1}
        />
        <span
          className="h-px flex-1"
          style={{
            background:
              "linear-gradient(to right, rgb(var(--accent-rgb) / 0.6), rgb(var(--accent-rgb) / 0.05))",
          }}
          aria-hidden="true"
        />
      </div>
      <h2 className="font-display glow-text mt-4 max-w-2xl text-section font-medium tracking-tight 3xl:max-w-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-xl text-sm text-muted [text-shadow:0_2px_16px_rgb(0_0_0/0.7)] sm:text-base 3xl:max-w-2xl 3xl:text-lg">
          {description}
        </p>
      )}
    </Reveal>
  );
}
