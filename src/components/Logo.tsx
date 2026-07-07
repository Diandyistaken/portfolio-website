import type { SVGProps } from "react";

/**
 * Abstract signal-pulse mark instead of literal initials: initials don't
 * hold up at favicon size, a single-stroke pulse line does. Doubles as the
 * cybersecurity "live signal" motif that ties to the rest of the brand.
 */
export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <rect x="1" y="1" width="30" height="30" rx="7" fill="currentColor" />
      <path
        d="M5.5 17.5H10L13 7.5L17.5 24.5L20.5 14.5H26.5"
        stroke="var(--background)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
