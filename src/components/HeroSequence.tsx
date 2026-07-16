"use client";

import { CrossfadeSequence, type SequenceItem } from "./three/lab20/CrossfadeSequence";
import { RadarSweep, OrbitDots, TerminalCursor, EkgWave } from "./three/lab20/CssConcepts";
import { GalaxyStatic, StarfieldDepth, CodeToLock } from "./three/lab20/CanvasConcepts";
import { LockUnlock } from "./three/lab20/CssConcepts2";
import { PacketFlow, QrScan, Vortex } from "./three/lab20/CanvasConcepts2";
import { DecryptRevealBig, HexTicker } from "./three/lab20/DomConcepts2";

// The 13 hero-lab picks, in the order they'll play — see /hero-lab for the
// full 40-candidate gallery this was chosen from. Each hold time is tuned
// to that animation's own loop length (a 4s CSS cycle and a continuous
// starfield don't want the same hold), not one flat duration for all 13.
const SEQUENCE: SequenceItem[] = [
  { Component: RadarSweep, holdMs: 7000 },
  { Component: OrbitDots, holdMs: 7000 },
  { Component: TerminalCursor, holdMs: 5000 },
  { Component: EkgWave, holdMs: 7000 },
  { Component: GalaxyStatic, holdMs: 8000 },
  { Component: StarfieldDepth, holdMs: 8000 },
  { Component: CodeToLock, holdMs: 9000 },
  { Component: DecryptRevealBig, holdMs: 8500 },
  { Component: PacketFlow, holdMs: 7000 },
  { Component: LockUnlock, holdMs: 8000 },
  { Component: QrScan, holdMs: 7000 },
  { Component: Vortex, holdMs: 7000 },
  { Component: HexTicker, holdMs: 6000 },
];

export function HeroSequence() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
      style={{
        maskImage: "radial-gradient(60% 60% at 50% 45%, black, transparent 75%)",
        WebkitMaskImage: "radial-gradient(60% 60% at 50% 45%, black, transparent 75%)",
      }}
    >
      <div className="aspect-[4/3] w-full max-w-2xl">
        <CrossfadeSequence items={SEQUENCE} fadeMs={2200} />
      </div>
    </div>
  );
}
