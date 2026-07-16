// "perf-lite" mode: on weak devices the html element gets a `perf-lite`
// class (CSS drops backdrop blurs / glows / decorative animations, see
// globals.css). Enabled statically for low-core/low-memory/Save-Data
// devices — see ClientChrome for where that check runs once at startup.

const PERF_LITE_EVENT = "app:perf-lite";

export function isPerfLite() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("perf-lite")
  );
}

export function enablePerfLite() {
  if (isPerfLite()) return;
  document.documentElement.classList.add("perf-lite");
  window.dispatchEvent(new Event(PERF_LITE_EVENT));
}

export function onPerfLite(fn: () => void) {
  window.addEventListener(PERF_LITE_EVENT, fn);
  return () => window.removeEventListener(PERF_LITE_EVENT, fn);
}

type DeviceHints = {
  hardwareConcurrency?: number;
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

export function detectLowEndDevice() {
  const nav = navigator as Navigator & DeviceHints;
  return (
    (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 4) ||
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
    nav.connection?.saveData === true
  );
}
