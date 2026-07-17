/**
 * #88 WebAudio sonar: one lazy AudioContext, whisper-quiet synthesized blips.
 * Opt-in via the navbar AUDIO toggle; every helper no-ops while disabled, so
 * call sites can ping unconditionally. No assets, no loops — just short sines.
 */

let context: AudioContext | null = null;
let enabled = false;

export function isSonarEnabled(): boolean {
  return enabled;
}

export function setSonarEnabled(value: boolean): void {
  enabled = value;
}

function ensureContext(): AudioContext | null {
  try {
    if (!context) context = new AudioContext();
    if (context.state === "suspended") void context.resume();
    return context;
  } catch {
    return null;
  }
}

/** Short sonar blip; optional exponential sweep for the "alarm" flavor. */
export function ping(frequency = 440, duration = 0.07, gain = 0.02, sweepTo?: number): void {
  if (!enabled) return;
  const audio = ensureContext();
  if (!audio) return;
  try {
    const oscillator = audio.createOscillator();
    const volume = audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
    if (sweepTo) oscillator.frequency.exponentialRampToValueAtTime(sweepTo, audio.currentTime + duration);
    volume.gain.setValueAtTime(gain, audio.currentTime);
    volume.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
    oscillator.connect(volume).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + duration + 0.03);
  } catch {
    // audio unavailable — stay silent
  }
}
