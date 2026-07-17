"use client";

import { m, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { usePerfLite } from "./SectionBackdrop";

const GLYPHS = ["0x5E", "0xC8", "0xFF", "0x2A", "0x7F", "0x00", "0x1B", "0x9D"];
const MAX_PACKETS = 9;
const SPAWN_GAP_MS = 130;

type Packet = { id: number; glyph: string; duration: number };

/**
 * #43 Scroll payload injector: a hairline data conduit down the right edge.
 * Scrolling spawns hex-packet glyphs that ride down at a speed bound to the
 * live scroll velocity and burst in a tiny scale-flash near the bottom. Fast
 * scrolling floods the conduit, idling drains it. Desktop, fine-pointer only.
 */
export function PayloadInjector() {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const [enabled, setEnabled] = useState(false);
  const [packets, setPackets] = useState<Packet[]>([]);
  const counter = useRef(0);
  const lastSpawn = useRef(0);
  const lastY = useRef(0);
  const lastT = useRef(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      setEnabled(
        window.matchMedia("(min-width: 1024px)").matches &&
          !window.matchMedia("(hover: none)").matches,
      ),
    );
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!enabled || reducedMotion || perfLite) return;
    lastY.current = window.scrollY;
    lastT.current = performance.now();
    const onScroll = () => {
      const now = performance.now();
      const dy = Math.abs(window.scrollY - lastY.current);
      const dt = Math.max(16, now - lastT.current);
      lastY.current = window.scrollY;
      lastT.current = now;
      if (dy < 6 || now - lastSpawn.current < SPAWN_GAP_MS) return;
      lastSpawn.current = now;
      const velocity = (dy / dt) * 1000; // px/s
      const duration = Math.max(0.45, Math.min(1.5, 1400 / Math.max(300, velocity)));
      counter.current += 1;
      const packet: Packet = {
        id: counter.current,
        glyph: GLYPHS[counter.current % GLYPHS.length],
        duration,
      };
      setPackets((previous) => (previous.length >= MAX_PACKETS ? previous : [...previous, packet]));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled, reducedMotion, perfLite]);

  if (!enabled || reducedMotion || perfLite) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-y-0 right-0 z-30 hidden w-10 lg:block">
      {/* the conduit line */}
      <span className="absolute inset-y-0 right-[3px] w-px bg-gradient-to-b from-transparent via-accent/15 to-transparent" />
      {packets.map((packet) => (
        <m.span
          key={packet.id}
          initial={{ y: "-6vh", opacity: 0, scale: 1 }}
          animate={{ y: ["-6vh", "72vh", "74vh"], opacity: [0, 0.85, 0], scale: [1, 1, 1.8] }}
          transition={{ duration: packet.duration, ease: "linear", times: [0, 0.9, 1] }}
          onAnimationComplete={() =>
            setPackets((previous) => previous.filter((item) => item.id !== packet.id))
          }
          className="absolute right-0 top-0 font-mono text-[0.55rem] text-accent/80"
        >
          {packet.glyph}
        </m.span>
      ))}
    </div>
  );
}
