import type { SVGProps } from "react";

/**
 * Shield + "M" monogram: the shield carries the cybersecurity brand, the M
 * anchors the name. Strokes read the fixed --accent token.
 */
export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <path
        d="M16 2L27.5 6.8V15.2C27.5 21.8 22.9 27.5 16 30C9.1 27.5 4.5 21.8 4.5 15.2V6.8L16 2Z"
        fill="rgb(var(--accent-rgb) / 0.12)"
        stroke="var(--accent)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 20.5V12L16 17L21.5 12V20.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
