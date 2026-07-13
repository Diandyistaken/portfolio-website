"use client";

import { type MouseEvent } from "react";

export function useSpotlight<T extends HTMLElement>() {
  const onMouseMove = (event: MouseEvent<T>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  };

  return { onMouseMove };
}
