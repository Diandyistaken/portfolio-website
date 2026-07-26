// Theme switching, mirroring the perfLite.ts pattern: the html element carries
// a `dark` / `light` class and a plain event announces changes.
//
// The class is printed by the SERVER from a cookie (layout.tsx), not by an
// inline script. The layout is already `force-dynamic` for the CSP nonce, so
// the cookie is readable per request — which means there is no flash of the
// wrong theme and, more importantly, no inline script that a strict CSP could
// silently block (that failure mode looks like "the toggle just doesn't work").

export type Theme = "dark" | "light";

export const THEME_COOKIE = "mm-theme";
const THEME_EVENT = "app:theme";
/** ~1 year; the choice should outlive a browsing session. */
const MAX_AGE = 60 * 60 * 24 * 365;

export function getTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  // `SameSite=Lax` is enough: this is a display preference, not a credential.
  document.cookie = `${THEME_COOKIE}=${theme};path=/;max-age=${MAX_AGE};SameSite=Lax`;
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === "light" ? "dark" : "light";
  applyTheme(next);
  return next;
}

/** Subscribe to theme changes — for canvas/WebGL layers that cache colours. */
export function onThemeChange(fn: () => void) {
  window.addEventListener(THEME_EVENT, fn);
  return () => window.removeEventListener(THEME_EVENT, fn);
}
