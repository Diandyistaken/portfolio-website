import type { CSSProperties } from "react";

type Variant =
  | "hero"
  | "waves"
  | "lines"
  | "mesh"
  | "warm"
  | "grid"
  | "beacon"
  | "circuit"
  | "orbit";

const lineStyle: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(115deg, rgb(var(--surface-border) / 0.08) 0px, rgb(var(--surface-border) / 0.08) 1px, transparent 1px, transparent 42px)",
};

const gridStyle: CSSProperties = {
  backgroundImage:
    "radial-gradient(rgb(var(--surface-border) / 0.16) 1px, transparent 1px)",
  backgroundSize: "24px 24px",
};

export function SectionBackground({ variant }: { variant: Variant }) {
  switch (variant) {
    case "hero":
      return (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="bg-anim absolute left-1/2 top-1/3 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-[120px] animate-[drift-a_16s_ease-in-out_infinite]" />
          <div className="bg-anim absolute right-0 bottom-0 h-[24rem] w-[24rem] rounded-full bg-accent-2/20 blur-[110px] animate-[drift-b_20s_ease-in-out_infinite]" />
          <div
            className="bg-anim absolute inset-0 opacity-30 animate-[beam-sweep_14s_ease-in-out_infinite]"
            style={{
              background:
                "linear-gradient(100deg, transparent 30%, rgb(var(--accent-2-rgb) / 0.25) 48%, transparent 65%)",
            }}
          />
        </div>
      );

    case "waves":
      return (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="bg-anim absolute -left-16 top-10 h-72 w-72 rounded-[60%_40%_55%_45%/45%_55%_40%_60%] bg-accent/15 blur-3xl animate-[float-y_11s_ease-in-out_infinite]" />
          <div className="bg-anim absolute -right-10 bottom-0 h-80 w-80 rounded-[45%_55%_60%_40%/55%_45%_60%_40%] bg-accent-2/15 blur-3xl animate-[float-y-slow_15s_ease-in-out_infinite]" />
        </div>
      );

    case "lines":
      return (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="bg-anim absolute -inset-24 opacity-60 animate-[pan-lines_18s_linear_infinite]"
            style={lineStyle}
          />
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[100px]" />
        </div>
      );

    case "mesh":
      return (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="bg-anim absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 opacity-40 blur-[90px] animate-[spin-slow_40s_linear_infinite]"
            style={{
              background: `conic-gradient(from 0deg, rgb(var(--accent-rgb) / 0.3), transparent 30%, rgb(var(--accent-2-rgb) / 0.3) 55%, transparent 80%, rgb(var(--accent-rgb) / 0.3))`,
            }}
          />
        </div>
      );

    case "warm":
      return (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="bg-anim absolute left-10 top-0 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl animate-[float-y_12s_ease-in-out_infinite]" />
          <div className="bg-anim absolute right-10 bottom-0 h-80 w-80 rounded-full bg-rose-400/15 blur-3xl animate-[float-y-slow_16s_ease-in-out_infinite]" />
          <div className="bg-anim absolute left-1/3 bottom-1/4 h-56 w-56 rounded-full bg-accent-2/10 blur-3xl animate-[drift-a_18s_ease-in-out_infinite]" />
        </div>
      );

    case "grid":
      return (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="bg-anim absolute -inset-12 animate-[pan-grid_10s_linear_infinite]"
            style={gridStyle}
          />
          <div className="bg-anim absolute right-0 top-0 h-72 w-72 rounded-full bg-accent/10 blur-[100px] animate-[pulse-soft_9s_ease-in-out_infinite]" />
        </div>
      );

    case "beacon":
      return (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="bg-anim absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-[110px] animate-[pulse-soft_7s_ease-in-out_infinite]" />
          <div className="bg-anim absolute left-1/2 top-1/2 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-2/20 blur-[80px] animate-[pulse-soft_7s_ease-in-out_infinite_1.5s]" />
        </div>
      );

    case "circuit":
      return (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="bg-anim absolute -inset-16 opacity-25 animate-[pan-grid_24s_linear_infinite]"
            style={{
              backgroundImage:
                "linear-gradient(rgb(var(--accent-2-rgb) / 0.28) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--accent-2-rgb) / 0.28) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
          <div className="bg-anim absolute left-[15%] top-1/4 h-2 w-2 rounded-full bg-accent-2/70 shadow-[0_0_12px_2px_rgb(var(--accent-2-rgb)/0.6)] animate-[pulse-soft_5s_ease-in-out_infinite]" />
          <div className="bg-anim absolute right-[20%] top-[62%] h-2 w-2 rounded-full bg-accent/70 shadow-[0_0_12px_2px_rgb(var(--accent-rgb)/0.6)] animate-[pulse-soft_6s_ease-in-out_infinite_1s]" />
          <div className="bg-anim absolute left-[55%] top-[18%] h-1.5 w-1.5 rounded-full bg-accent-2/60 shadow-[0_0_10px_2px_rgb(var(--accent-2-rgb)/0.5)] animate-[pulse-soft_7s_ease-in-out_infinite_2s]" />
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-2/10 blur-[100px]" />
        </div>
      );

    case "orbit":
      return (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="bg-anim absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/15 animate-[spin-slow_50s_linear_infinite]" />
          <div className="bg-anim absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-2/10 animate-[spin-slow_70s_linear_infinite]" />
          <div className="bg-anim absolute right-[18%] top-1/4 h-2 w-2 rounded-full bg-accent shadow-[0_0_14px_2px_rgb(var(--accent-rgb)/0.6)] animate-[pulse-soft_6s_ease-in-out_infinite]" />
          <div className="bg-anim absolute left-[20%] bottom-1/4 h-2 w-2 rounded-full bg-accent-2 shadow-[0_0_14px_2px_rgb(var(--accent-2-rgb)/0.6)] animate-[pulse-soft_8s_ease-in-out_infinite_1s]" />
          <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[110px]" />
        </div>
      );

    default:
      return null;
  }
}
