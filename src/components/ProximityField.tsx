"use client";

import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { isPerfLite } from "@/lib/perfLite";

/**
 * Cursor-proximity engine: every element carrying `data-prox` gets a live
 * `--prox` CSS variable (0..1) based on how close the cursor is — so chips,
 * icons and links warm toward the accent color BEFORE the cursor ever
 * touches them. One rAF-throttled listener drives the whole site.
 */
export function ProximityField() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || isPerfLite()) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    let elements: HTMLElement[] = [];
    let dirty = true;

    const collect = () => {
      dirty = true;
    };

    const observer = new MutationObserver(collect);
    observer.observe(document.body, { subtree: true, childList: true });
    window.addEventListener("resize", collect);

    const onMove = (event: MouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (dirty) {
          elements = Array.from(document.querySelectorAll<HTMLElement>("[data-prox]"));
          dirty = false;
        }
        const viewportHeight = window.innerHeight;
        for (const element of elements) {
          const bounds = element.getBoundingClientRect();
          // skip offscreen elements entirely (and clear stale glow)
          if (bounds.bottom < -80 || bounds.top > viewportHeight + 80) {
            if (element.style.getPropertyValue("--prox") !== "") {
              element.style.removeProperty("--prox");
            }
            continue;
          }
          const centerX = bounds.left + bounds.width / 2;
          const centerY = bounds.top + bounds.height / 2;
          const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
          const radius = Number(element.dataset.proxRadius ?? 300);
          const proximity = Math.max(0, 1 - distance / radius);
          element.style.setProperty("--prox", proximity < 0.01 ? "0" : proximity.toFixed(3));
          // #89 lean field: elements opting in via data-prox-lean also get a
          // horizontal direction channel (-1..1) so CSS can tilt them AWAY
          // from the cursor like grass in wind.
          if (element.dataset.proxLean !== undefined) {
            const direction = Math.max(-1, Math.min(1, (centerX - event.clientX) / Math.max(40, radius / 2)));
            element.style.setProperty("--prox-dx", direction.toFixed(3));
          }
        }
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", collect);
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return null;
}
