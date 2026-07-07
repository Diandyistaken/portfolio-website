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
          {index} / {kicker}
        </span>
        <span className="h-px flex-1 bg-foreground/10" aria-hidden="true" />
      </div>
      <h2 className="font-display mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-xl text-sm text-muted sm:text-base">{description}</p>
      )}
    </Reveal>
  );
}
