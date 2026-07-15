const COLOR_STOPS: { p: number; h: number; s: number; l: number }[] = [
  { p: 0.0, h: 145, s: 70, l: 62 },
  { p: 0.1, h: 145, s: 70, l: 62 },
  { p: 0.235, h: 351, s: 87, l: 61 },
  { p: 0.37, h: 351, s: 87, l: 61 },
  { p: 0.48, h: 203, s: 79, l: 64 },
  { p: 0.86, h: 203, s: 79, l: 64 },
  { p: 0.91, h: 120, s: 16, l: 70 },
  { p: 0.96, h: 38, s: 84, l: 68 },
  { p: 1.0, h: 38, s: 84, l: 68 },
];

export const PHASE_BOUNDS = [0, 0.235, 0.48, 0.91, 1] as const;

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return ln - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
  };
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpHue(a: number, b: number, t: number) {
  const d = ((b - a + 540) % 360) - 180;
  return (a + d * t + 360) % 360;
}

export function accentAt(p: number): [number, number, number] {
  const progress = Math.min(1, Math.max(0, p));
  if (progress <= COLOR_STOPS[0].p) {
    const first = COLOR_STOPS[0];
    return hslToRgb(first.h, first.s, first.l);
  }
  for (let i = 1; i < COLOR_STOPS.length; i++) {
    if (progress <= COLOR_STOPS[i].p) {
      const a = COLOR_STOPS[i - 1];
      const b = COLOR_STOPS[i];
      const t = (progress - a.p) / (b.p - a.p || 1);
      return hslToRgb(lerpHue(a.h, b.h, t), lerp(a.s, b.s, t), lerp(a.l, b.l, t));
    }
  }
  const last = COLOR_STOPS[COLOR_STOPS.length - 1];
  return hslToRgb(last.h, last.s, last.l);
}

export function phaseAt(p: number): { index: 0 | 1 | 2 | 3; t: number } {
  const progress = Math.min(1, Math.max(0, p));
  let index: 0 | 1 | 2 | 3 = 3;
  for (let i = 0; i < PHASE_BOUNDS.length - 1; i++) {
    if (progress < PHASE_BOUNDS[i + 1]) {
      index = i as 0 | 1 | 2 | 3;
      break;
    }
  }
  const start = PHASE_BOUNDS[index];
  const end = PHASE_BOUNDS[index + 1];
  const linear = Math.min(1, Math.max(0, (progress - start) / (end - start)));
  return { index, t: linear * linear * (3 - 2 * linear) };
}
