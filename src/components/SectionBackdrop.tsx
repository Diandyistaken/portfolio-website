"use client";

import { useSyncExternalStore } from "react";

type SectionBackdropProps = {
  variant: "hex" | "circuit" | "orbits" | "target" | "waves";
  flip?: boolean;
};

const hexagons = [
  [60, 55], [128, 55], [196, 55], [264, 55],
  [94, 114], [162, 114], [230, 114], [298, 114],
  [60, 173], [128, 173], [196, 173], [264, 173],
];

function Artwork({ variant }: Pick<SectionBackdropProps, "variant">) {
  const node = "rgb(var(--accent-rgb) / 0.12)";

  if (variant === "hex") {
    return (
      <>
        {hexagons.map(([x, y]) => (
          <polygon key={`${x}-${y}`} points={`${x},${y - 34} ${x + 30},${y - 17} ${x + 30},${y + 17} ${x},${y + 34} ${x - 30},${y + 17} ${x - 30},${y - 17}`} />
        ))}
        <circle cx="298" cy="114" r="4" fill={node} stroke="none" />
        <circle cx="60" cy="173" r="4" fill={node} stroke="none" />
      </>
    );
  }

  if (variant === "circuit") {
    return (
      <>
        <path d="M28 52h92v50h72v-34h104" />
        <path d="M52 196h72v-58h114v62h92" />
        <path d="M22 126h66v-38h68" />
        <path d="M184 22v74h76v54h94" />
        <path d="M112 226v-46h72" />
        {["120,52", "192,102", "296,68", "124,138", "238,200", "260,150", "88,126"].map((point) => {
          const [cx, cy] = point.split(",");
          return <circle key={point} cx={cx} cy={cy} r="5" fill={node} stroke="none" />;
        })}
      </>
    );
  }

  if (variant === "orbits") {
    return (
      <>
        <ellipse cx="190" cy="125" rx="150" ry="52" />
        <ellipse cx="190" cy="125" rx="118" ry="82" transform="rotate(38 190 125)" />
        <ellipse cx="190" cy="125" rx="118" ry="82" transform="rotate(-38 190 125)" />
        <circle cx="190" cy="125" r="10" fill={node} stroke="none" />
        <circle cx="332" cy="108" r="6" fill={node} stroke="none" />
        <circle cx="98" cy="67" r="5" fill={node} stroke="none" />
        <circle cx="114" cy="198" r="5" fill={node} stroke="none" />
      </>
    );
  }

  if (variant === "target") {
    return (
      <>
        <circle cx="190" cy="125" r="96" />
        <circle cx="190" cy="125" r="64" />
        <circle cx="190" cy="125" r="28" />
        <path d="M190 8v42m0 150v42M48 125h54m176 0h54" />
        <path d="M126 28l10 18m108 158 10 18M92 61l18 10m160 108 18 10M92 189l18-10m160-108 18-10" />
        <circle cx="190" cy="125" r="5" fill={node} stroke="none" />
        <circle cx="254" cy="125" r="5" fill={node} stroke="none" />
      </>
    );
  }

  return (
    <>
      <path d="M-10 60c48-44 96-44 144 0s96 44 144 0 96-44 144 0" />
      <path d="M-10 98c48-44 96-44 144 0s96 44 144 0 96-44 144 0" />
      <path d="M-10 136c48-44 96-44 144 0s96 44 144 0 96-44 144 0" />
      <path d="M-10 174c48-44 96-44 144 0s96 44 144 0 96-44 144 0" />
      <circle cx="134" cy="98" r="5" fill={node} stroke="none" />
      <circle cx="278" cy="136" r="5" fill={node} stroke="none" />
    </>
  );
}

function subscribeToPerfLite(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getPerfLiteSnapshot() {
  return document.documentElement.classList.contains("perf-lite");
}

export function usePerfLite() {
  return useSyncExternalStore(subscribeToPerfLite, getPerfLiteSnapshot, () => false);
}

export function SectionBackdrop({ variant, flip = false }: SectionBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-[10%] w-[72%] max-w-4xl opacity-90 ${flip ? "-left-[22%]" : "-right-[22%]"}`}
    >
      <svg viewBox="0 0 380 250" className="h-full w-full" fill="none" stroke="rgb(var(--accent-rgb) / 0.07)" strokeWidth="1.2" vectorEffect="non-scaling-stroke">
        <Artwork variant={variant} />
      </svg>
    </div>
  );
}
