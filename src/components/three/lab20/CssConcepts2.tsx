"use client";

// Second batch — 11 CSS/SVG-only candidates, tuned toward what worked in
// round 1: iconic/recognizable motifs, a single clear "event" per loop,
// slow and steady rather than continuously busy. No WebGL this round.

export function LockUnlock() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-2/3 w-2/3">
        <rect x="28" y="46" width="44" height="36" rx="6" fill="none" stroke="#5ec8ff" strokeWidth="3" />
        <circle cx="50" cy="64" r="4" fill="#5ec8ff" style={{ animation: "lab2-flash 4s ease-in-out infinite" }} />
        <path
          d="M34 46 V34 a16 16 0 0 1 32 0 V46"
          fill="none"
          stroke="#5ec8ff"
          strokeWidth="3"
          style={{ transformOrigin: "66px 46px", animation: "lab2-shackle 4s ease-in-out infinite" }}
        />
      </svg>
      <style>{`
        @keyframes lab2-shackle { 0%, 30% { transform: rotate(0deg); } 55%, 100% { transform: rotate(-28deg); } }
        @keyframes lab2-flash { 0%, 30% { opacity: 0.6; } 40% { opacity: 1; } 55%, 100% { opacity: 0.6; } }
      `}</style>
    </div>
  );
}

export function PlanetSatellites() {
  const moons = [
    { size: 70, duration: 5, dot: 5 },
    { size: 100, duration: 8, dot: 4 },
    { size: 130, duration: 12, dot: 3 },
  ];
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #8fdaff, #5ec8ff 60%, #1c3a4d)" }} />
      {moons.map((moon, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-[#5ec8ff]/10"
          style={{ width: moon.size, height: moon.size, animation: `lab2-spin ${moon.duration}s linear infinite` }}
        >
          <div className="absolute rounded-full bg-[#5ec8ff]" style={{ width: moon.dot, height: moon.dot, top: -moon.dot / 2, left: "50%", transform: "translateX(-50%)" }} />
        </div>
      ))}
      <style>{`@keyframes lab2-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function ServerRackBlink() {
  const cells = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="grid grid-cols-6 gap-2">
        {cells.map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-sm bg-[#5ec8ff]"
            style={{ animation: `lab2-blink ${1.4 + (i % 5) * 0.3}s ease-in-out ${(i % 7) * 0.15}s infinite` }}
          />
        ))}
      </div>
      <style>{`@keyframes lab2-blink { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.9; } }`}</style>
    </div>
  );
}

export function LightningFlash() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 60 100" className="h-2/3 w-1/3">
        <polygon points="34,0 10,52 26,52 18,100 50,40 32,40" fill="#5ec8ff" style={{ animation: "lab2-strike 3.5s ease-in-out infinite" }} />
      </svg>
      <style>{`
        @keyframes lab2-strike {
          0%, 82% { opacity: 0; }
          84% { opacity: 1; }
          87% { opacity: 0.3; }
          90% { opacity: 0.9; }
          96%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export function AudioEqualizerBars() {
  const bars = Array.from({ length: 9 }, (_, i) => i);
  return (
    <div className="flex h-full w-full items-end justify-center gap-1.5 pb-10">
      {bars.map((i) => (
        <span
          key={i}
          className="w-2 rounded-t bg-[#5ec8ff]"
          style={{ height: "10%", animation: `lab2-eq ${0.6 + (i % 4) * 0.18}s ease-in-out ${(i % 5) * 0.1}s infinite alternate` }}
        />
      ))}
      <style>{`@keyframes lab2-eq { from { height: 12%; } to { height: 85%; } }`}</style>
    </div>
  );
}

export function LoadingRingProgress() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-2/3 w-2/3 -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#5ec8ff" strokeOpacity="0.15" strokeWidth="4" />
        <circle
          cx="50" cy="50" r="42" fill="none" stroke="#5ec8ff" strokeWidth="4" strokeLinecap="round"
          pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: "lab2-progress 3.6s ease-in-out infinite" }}
        />
      </svg>
      <style>{`
        @keyframes lab2-progress {
          0% { stroke-dashoffset: 1; opacity: 0.6; }
          75% { stroke-dashoffset: 0; opacity: 1; }
          85% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: -1; opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

export function NeuronPulseRings() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="h-2.5 w-2.5 rounded-full bg-[#5ec8ff]" />
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute h-2.5 w-2.5 rounded-full border border-[#5ec8ff]"
          style={{ animation: `lab2-ping 3s ease-out ${i}s infinite` }}
        />
      ))}
      <style>{`
        @keyframes lab2-ping {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(14); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export function SignalBars() {
  return (
    <div className="relative flex h-full w-full items-end justify-start pb-8 pl-10">
      <div className="h-2 w-2 rounded-full bg-[#5ec8ff]" />
      {[18, 32, 46].map((r, i) => (
        <span
          key={r}
          className="absolute rounded-full border-2 border-[#5ec8ff]"
          style={{
            width: r * 2, height: r * 2, left: 4 - r, bottom: 28 - r,
            clipPath: "polygon(50% 50%, 100% 0%, 100% 100%)",
            animation: `lab2-signal 2.4s ease-in-out ${i * 0.3}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes lab2-signal { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.8; } }`}</style>
    </div>
  );
}

export function KeyRotation() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 100 60" className="h-1/2 w-2/3" style={{ animation: "lab2-key-spin 5s ease-in-out infinite" }}>
        <circle cx="20" cy="30" r="16" fill="none" stroke="#5ec8ff" strokeWidth="4" />
        <rect x="34" y="27" width="55" height="6" fill="#5ec8ff" />
        <rect x="72" y="33" width="6" height="12" fill="#5ec8ff" />
        <rect x="82" y="33" width="6" height="16" fill="#5ec8ff" />
      </svg>
      <style>{`
        @keyframes lab2-key-spin {
          0%, 60% { transform: rotate(0deg); }
          75% { transform: rotate(90deg); }
          100% { transform: rotate(90deg); }
        }
      `}</style>
    </div>
  );
}

export function HudPulseFrame() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="absolute inset-6 border-l-2 border-t-2 border-[#5ec8ff]/50" style={{ width: 16, height: 16 }} />
      <div className="absolute inset-6 right-6 border-r-2 border-t-2 border-[#5ec8ff]/50" style={{ width: 16, height: 16, left: "auto" }} />
      <div className="absolute bottom-6 left-6 border-b-2 border-l-2 border-[#5ec8ff]/50" style={{ width: 16, height: 16 }} />
      <div className="absolute bottom-6 right-6 border-b-2 border-r-2 border-[#5ec8ff]/50" style={{ width: 16, height: 16 }} />
      <svg viewBox="0 0 200 60" className="h-1/3 w-3/5">
        <polyline
          points="0,30 60,30 72,8 84,52 96,30 200,30"
          fill="none" stroke="#5ec8ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: "lab2-draw 2.4s linear infinite" }}
        />
      </svg>
      <style>{`
        @keyframes lab2-draw { 0% { stroke-dashoffset: 1; } 70% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -1; } }
      `}</style>
    </div>
  );
}

export function SinglePing() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="h-2 w-2 rounded-full bg-[#5ec8ff]" />
      <span className="absolute h-2 w-2 rounded-full border border-[#5ec8ff]" style={{ animation: "lab2-single-ping 2.8s ease-out infinite" }} />
      <style>{`
        @keyframes lab2-single-ping {
          0% { transform: scale(1); opacity: 0.9; }
          100% { transform: scale(20); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
