"use client";

// Eight hero-centerpiece candidates built from pure CSS/SVG animation only
// (transform + opacity, no per-frame JS) — guaranteed smooth regardless of
// device, unlike the particle-morph system that caused the frame drops.

export function RadarSweep() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 200 200" className="h-4/5 w-4/5">
        {[70, 50, 30].map((r) => (
          <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#5ec8ff" strokeOpacity="0.25" strokeWidth="1" />
        ))}
        <circle cx="100" cy="100" r="3" fill="#5ec8ff" />
        <g style={{ transformOrigin: "100px 100px", animation: "lab-spin 3.2s linear infinite" }}>
          <path d="M100 100 L100 30 A70 70 0 0 1 148 52 Z" fill="url(#radarGradient)" />
        </g>
        <defs>
          <linearGradient id="radarGradient" x1="100" y1="30" x2="148" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#5ec8ff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#5ec8ff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <style>{`@keyframes lab-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function OrbitDots() {
  const orbits = [
    { size: 60, duration: 6 },
    { size: 100, duration: 9 },
    { size: 140, duration: 13 },
  ];
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="h-3 w-3 rounded-full bg-[#5ec8ff]" />
      {orbits.map((orbit, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-[#5ec8ff]/15"
          style={{
            width: orbit.size,
            height: orbit.size,
            animation: `lab-spin ${orbit.duration}s linear infinite`,
          }}
        >
          <div
            className="absolute h-2 w-2 rounded-full bg-[#5ec8ff]"
            style={{ top: -3, left: "50%", transform: "translateX(-50%)" }}
          />
        </div>
      ))}
      <style>{`@keyframes lab-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function BreathingOrb() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div
        className="h-24 w-24 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(94,200,255,0.55), rgba(94,200,255,0) 70%)",
          animation: "lab-breathe 3.6s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes lab-breathe {
          0%, 100% { transform: scale(0.85); opacity: 0.6; }
          50% { transform: scale(1.25); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function DualRings() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 200 200" className="h-4/5 w-4/5">
        <circle cx="100" cy="100" r="70" fill="none" stroke="#5ec8ff" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="6 10" style={{ transformOrigin: "100px 100px", animation: "lab-spin 10s linear infinite" }} />
        <circle cx="100" cy="100" r="48" fill="none" stroke="#5ec8ff" strokeOpacity="0.55" strokeWidth="1.5" strokeDasharray="4 8" style={{ transformOrigin: "100px 100px", animation: "lab-spin-reverse 7s linear infinite" }} />
        <circle cx="100" cy="100" r="4" fill="#5ec8ff" />
      </svg>
      <style>{`
        @keyframes lab-spin { to { transform: rotate(360deg); } }
        @keyframes lab-spin-reverse { to { transform: rotate(-360deg); } }
      `}</style>
    </div>
  );
}

export function TerminalCursor() {
  return (
    <div className="flex h-full w-full items-center justify-center font-mono">
      <span className="text-5xl text-[#5ec8ff]">{">"}</span>
      <span className="ml-2 h-12 w-4 bg-[#5ec8ff]" style={{ animation: "lab-blink 1s steps(1,end) infinite" }} />
      <style>{`
        @keyframes lab-blink { 0%, 45% { opacity: 1; } 46%, 100% { opacity: 0; } }
      `}</style>
    </div>
  );
}

export function LiquidBlobSvg() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 200 200" className="h-4/5 w-4/5">
        <path fill="#5ec8ff" fillOpacity="0.55">
          <animate
            attributeName="d"
            dur="6s"
            repeatCount="indefinite"
            values="
              M100,30 C140,30 170,60 170,100 C170,140 140,170 100,170 C60,170 30,140 30,100 C30,60 60,30 100,30 Z;
              M100,36 C136,24 172,66 164,100 C176,138 132,176 100,164 C64,176 26,134 36,100 C22,64 66,26 100,36 Z;
              M100,30 C140,30 170,60 170,100 C170,140 140,170 100,170 C60,170 30,140 30,100 C30,60 60,30 100,30 Z
            "
          />
        </path>
      </svg>
    </div>
  );
}

const CONSTELLATION_POINTS = [
  [30, 40], [90, 20], [150, 55], [170, 110], [120, 150], [60, 140], [20, 90], [100, 90],
];
const CONSTELLATION_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [0, 7], [2, 7], [4, 7],
];

export function Constellation() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 200 190" className="h-4/5 w-4/5">
        {CONSTELLATION_EDGES.map(([a, b], i) => {
          const [x1, y1] = CONSTELLATION_POINTS[a];
          const [x2, y2] = CONSTELLATION_POINTS[b];
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#5ec8ff"
              strokeWidth="1"
              style={{ opacity: 0.18, animation: `lab-fade 4.5s ease-in-out ${i * 0.3}s infinite` }}
            />
          );
        })}
        {CONSTELLATION_POINTS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#5ec8ff" />
        ))}
      </svg>
      <style>{`
        @keyframes lab-fade { 0%, 100% { opacity: 0.08; } 50% { opacity: 0.45; } }
      `}</style>
    </div>
  );
}

export function EkgWave() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 200 80" className="h-1/2 w-4/5">
        <polyline
          points="0,40 40,40 55,10 70,70 85,40 200,40"
          fill="none"
          stroke="#5ec8ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: 1,
            animation: "lab-draw 2.4s linear infinite",
          }}
        />
      </svg>
      <style>{`
        @keyframes lab-draw {
          0% { stroke-dashoffset: 1; }
          70% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -1; }
        }
      `}</style>
    </div>
  );
}
