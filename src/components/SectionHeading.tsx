import { Reveal } from "./Reveal";

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
      <div className="flex items-center gap-4">
        <span className="kicker shrink-0">
          [ {index} ] // {kicker}
        </span>
        <span
          className="h-px flex-1"
          style={{
            background:
              "linear-gradient(to right, rgb(var(--accent-rgb) / 0.6), rgb(var(--accent-rgb) / 0.05))",
          }}
          aria-hidden="true"
        />
      </div>
      <h2 className="font-display glow-text mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-xl text-sm text-muted sm:text-base">{description}</p>
      )}
    </Reveal>
  );
}
