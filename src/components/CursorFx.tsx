"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { usePerfLite } from "./SectionBackdrop";

/**
 * Cursor-layer toys, all in one lightweight listener set:
 *  #59 Combo counter — rapid clicks on toys build an x2, x3… counter by the
 *      cursor; x10 fires a CHAIN REACTION achievement.
 *  #93 Selection hex readout — selecting text pops a "0x2A bytes" tooltip.
 *  #117 Cursor trail packet train — holding the mouse still spawns 3 follower
 *      packets that trail the pointer like ducklings.
 * All disabled on touch / reduced-motion / perf-lite.
 */
export function CursorFx() {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();

  const [combo, setCombo] = useState(0);
  const [comboPos, setComboPos] = useState({ x: 0, y: 0 });
  const [selection, setSelection] = useState<{ bytes: number; x: number; y: number } | null>(null);
  const [packets, setPackets] = useState(false);
  const packetPos = useRef({ x: 0, y: 0 });
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);

  const comboTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const raf = useRef(0);

  useEffect(() => {
    if (reducedMotion || perfLite) return;
    if (window.matchMedia("(hover: none)").matches) return;

    // #59 combo
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("a, button, [role='button'], [data-prox]")) return;
      setComboPos({ x: event.clientX, y: event.clientY });
      setCombo((current) => {
        const next = current + 1;
        if (next === 10) window.dispatchEvent(new Event("app:achievement-unlocked"));
        return next;
      });
      if (comboTimer.current) clearTimeout(comboTimer.current);
      comboTimer.current = setTimeout(() => setCombo(0), 1200);
    };

    // #93 selection hex
    const onSelectionChange = () => {
      const sel = window.getSelection();
      const text = sel?.toString() ?? "";
      if (!text || !sel || sel.rangeCount === 0) {
        setSelection(null);
        return;
      }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setSelection({ bytes: new Blob([text]).size, x: rect.left + rect.width / 2, y: rect.top });
    };

    // #117 packet train
    const onMove = (event: MouseEvent) => {
      packetPos.current = { x: event.clientX, y: event.clientY };
      setPackets(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setPackets(true), 2000);
    };

    window.addEventListener("click", onClick);
    document.addEventListener("selectionchange", onSelectionChange);
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("click", onClick);
      document.removeEventListener("selectionchange", onSelectionChange);
      window.removeEventListener("mousemove", onMove);
      if (comboTimer.current) clearTimeout(comboTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [reducedMotion, perfLite]);

  // packet-train follow loop (runs only while packets are showing)
  useEffect(() => {
    if (!packets) return;
    const positions = [
      { x: packetPos.current.x, y: packetPos.current.y },
      { x: packetPos.current.x, y: packetPos.current.y },
      { x: packetPos.current.x, y: packetPos.current.y },
    ];
    const loop = () => {
      let leadX = packetPos.current.x;
      let leadY = packetPos.current.y;
      for (const p of positions) {
        p.x += (leadX - p.x) * 0.25;
        p.y += (leadY - p.y) * 0.25;
        leadX = p.x;
        leadY = p.y;
      }
      setTrail(positions.map((p) => ({ x: p.x, y: p.y })));
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [packets]);

  if (reducedMotion || perfLite) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[65]" aria-hidden="true">
      <AnimatePresence>
        {combo >= 2 && (
          <m.span
            key={`${comboPos.x}-${combo}`}
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: -14 }}
            exit={{ opacity: 0, y: -24 }}
            className="absolute font-mono text-xs font-bold text-accent"
            style={{ left: comboPos.x + 14, top: comboPos.y - 10 }}
          >
            x{combo}
            {combo >= 10 && <span className="ml-1 text-[0.6rem] uppercase tracking-wider">chain!</span>}
          </m.span>
        )}
      </AnimatePresence>

      {selection && (
        <span
          className="absolute -translate-x-1/2 -translate-y-full rounded border border-accent/40 bg-background/90 px-1.5 py-0.5 font-mono text-[0.55rem] text-accent"
          style={{ left: selection.x, top: selection.y - 6 }}
        >
          0x{selection.bytes.toString(16).toUpperCase()} bytes
        </span>
      )}

      {packets &&
        trail.map((p, index) => (
          <span
            key={index}
            className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/70"
            style={{ left: p.x, top: p.y, opacity: 0.7 - index * 0.18 }}
          />
        ))}
    </div>
  );
}
