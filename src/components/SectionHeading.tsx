import { Reveal } from "./Reveal";

export function SectionHeading({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description?: string;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <span className="text-xs font-medium uppercase tracking-[0.25em] text-accent">
        {kicker}
      </span>
      <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-sm text-muted sm:text-base">{description}</p>
      )}
    </Reveal>
  );
}
