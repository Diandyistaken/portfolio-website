"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionValue } from "framer-motion";

export type RoamMode =
  | "idle" | "stroll" | "follow" | "chase" | "observe" | "chatting" | "sleeping" | "parked";

/** k = yay sertliği, c = sönüm, max = px/s hız tavanı. Kütle 1 → c_crit = 2*sqrt(k). */
const TUNING: Record<RoamMode, { k: number; c: number; max: number }> = {
  idle:     { k: 34,  c: 12, max: 120 },
  stroll:   { k: 26,  c: 9,  max: 140 },
  follow:   { k: 48,  c: 14, max: 320 },
  chase:    { k: 120, c: 20, max: 900 },
  observe:  { k: 90,  c: 22, max: 200 },
  chatting: { k: 90,  c: 20, max: 420 },
  sleeping: { k: 60,  c: 24, max: 60  },
  parked:   { k: 140, c: 24, max: 600 },
};

export const BODY_W = 72;
export const EDGE = 28;

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

export const laneMin = () => EDGE;
export const laneMax = () => Math.max(EDGE, window.innerWidth - BODY_W - EDGE);
export const laneSpan = () => laneMax() - laneMin();

/** Bölüm çapaları: DOM ölçmeden, metin sütununu kapatmayan tarafa. */
export const SECTION_ANCHOR: Record<string, number> = {
  about: 0.14, classified: 0.86, projects: 0.12, skills: 0.88,
  experience: 0.16, education: 0.84, goals: 0.5, services: 0.18,
  arsenal: 0.82, showcase: 0.5, freelance: 0.15, contact: 0.85,
};
export const anchorFor = (id: string) =>
  laneMin() + (SECTION_ANCHOR[id] ?? 0.86) * laneSpan();

/** DURMA yasak bölgeleri — mevcut alt-sabit HUD'ların üstüne park etmesin. */
function blockedZones(chatOpen: boolean): Array<[number, number]> {
  const w = window.innerWidth;
  const zones: Array<[number, number]> = [
    [0, 200],                 // Achievements (bottom-6 left-6) + KeyHunt (bottom-20 left-6)
    [w / 2 - 170, w / 2 + 170], // GyroTilt (bottom-5 left-1/2) + RootShell
  ];
  if (chatOpen) zones.push([w - 380, w]); // RobotChat + IdleSentry
  return zones;
}

export function pickWaypoint(chatOpen: boolean) {
  const zones = blockedZones(chatOpen);
  for (let i = 0; i < 8; i += 1) {
    const candidate = laneMin() + Math.random() * laneSpan();
    const hit = zones.some(([a, b]) => candidate + BODY_W > a && candidate < b);
    if (!hit) return candidate;
  }
  return clamp(laneMax() * 0.8, laneMin(), laneMax());
}

export function useRobotRoam(active: boolean) {
  const x = useMotionValue(0);
  const bobY = useMotionValue(0);
  const lean = useMotionValue(0);
  const speed = useMotionValue(0);

  const [mode, setModeState] = useState<RoamMode>("idle");
  const [facing, setFacing] = useState<1 | -1>(-1);

  const modeRef = useRef<RoamMode>("idle");
  const facingRef = useRef<1 | -1>(-1);
  const targetRef = useRef(0);
  const activeRef = useRef(active);
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const s = useRef({ pos: 0, vel: 0, phase: 0, still: 0 });

  activeRef.current = active;

  const tick = useCallback((now: number) => {
    rafRef.current = 0;
    const st = s.current;
    const dt = Math.min(0.032, (now - lastRef.current) / 1000) || 0.016;
    lastRef.current = now;

    const { k, c, max } = TUNING[modeRef.current];
    const dx = targetRef.current - st.pos;
    st.vel = clamp(st.vel + (k * dx - c * st.vel) * dt, -max, max);
    st.pos = clamp(st.pos + st.vel * dt, laneMin(), laneMax());

    const sp = Math.abs(st.vel);
    st.phase += (1.4 + sp * 0.055) * dt * Math.PI;

    x.set(st.pos);
    bobY.set(Math.sin(st.phase) * Math.min(3.6, 0.6 + sp * 0.012));
    // Lean INTO the direction of travel: moving right (vel > 0) tips the body
    // clockwise. The sign used to be inverted, so the robot leaned backwards
    // while running — it read as being dragged, not running.
    lean.set(clamp(st.vel * 0.016, -9, 9));
    speed.set(sp);

    if (sp > 26) {
      const next: 1 | -1 = st.vel > 0 ? 1 : -1;
      if (next !== facingRef.current) { facingRef.current = next; setFacing(next); }
    }

    // Yerine oturdu → döngüyü tamamen bırak (idle bob'u CSS .robot-body üstlenir).
    if (sp < 1.5 && Math.abs(dx) < 0.4) {
      st.still += 1;
      if (st.still > 8) { st.vel = 0; bobY.set(0); lean.set(0); speed.set(0); return; }
    } else {
      st.still = 0;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [x, bobY, lean, speed]);

  const kick = useCallback(() => {
    if (rafRef.current || !activeRef.current || document.hidden) return;
    lastRef.current = performance.now();
    s.current.still = 0;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const setMode = useCallback((next: RoamMode, target?: number) => {
    if (typeof target === "number") targetRef.current = clamp(target, laneMin(), laneMax());
    if (modeRef.current !== next) { modeRef.current = next; setModeState(next); }
    kick();
  }, [kick]);

  /** Döngüyü kurmadan konumu bir kez yaz (reduced-motion / ilk yerleşim). */
  const snapTo = useCallback((px: number) => {
    const p = clamp(px, laneMin(), laneMax());
    s.current.pos = p; s.current.vel = 0; targetRef.current = p;
    x.set(p); bobY.set(0); lean.set(0); speed.set(0);
  }, [x, bobY, lean, speed]);

  // İlk yerleşim: bugünkü sağ-alt ev konumu.
  useEffect(() => {
    snapTo(laneMin() + 0.86 * laneSpan());
  }, [snapTo]);

  // Sekme arka plandayken rAF tamamen kapalı.
  useEffect(() => {
    if (!active) return;
    const onVisibility = () => {
      if (document.hidden) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      } else {
        kick();
      }
    };
    const onResize = () => { snapTo(s.current.pos); kick(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [active, kick, snapTo]);

  return { x, bobY, lean, speed, mode, modeRef, facing, setMode, snapTo, kick };
}
