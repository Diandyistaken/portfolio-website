import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRobotRoam } from "./useRobotRoam";

/**
 * The roam loop re-arms itself from inside its own rAF callback. That self
 * reference goes through a ref, so the thing most likely to break silently is
 * the loop running exactly one frame and then stopping — the mascot would
 * twitch once and freeze. These tests pin that behaviour down.
 */

let frames: FrameRequestCallback[] = [];
let nextId = 1;
let clock = 0;

/** Run every currently queued frame callback, advancing the fake clock. */
function flushFrame(deltaMs = 16) {
  clock += deltaMs;
  const queued = frames;
  frames = [];
  for (const cb of queued) cb(clock);
}

beforeEach(() => {
  frames = [];
  nextId = 1;
  clock = 0;
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    frames.push(cb);
    return nextId++;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  vi.spyOn(performance, "now").mockImplementation(() => clock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("useRobotRoam", () => {
  it("keeps re-scheduling frames while travelling to its target", () => {
    const { result } = renderHook(() => useRobotRoam(true));

    act(() => result.current.snapTo(100));
    act(() => result.current.setMode("stroll", 800));

    // kick() queued the first frame
    expect(frames).toHaveLength(1);

    act(() => flushFrame());
    // REGRESSION GUARD: the callback must have queued its own successor.
    // If the self-reference breaks, this is 0 and the mascot freezes.
    expect(frames).toHaveLength(1);

    const afterFirst = result.current.x.get();
    act(() => {
      flushFrame();
      flushFrame();
    });

    expect(frames).toHaveLength(1);
    expect(result.current.x.get()).toBeGreaterThan(afterFirst);
  });

  it("does not start the loop when inactive", () => {
    const { result } = renderHook(() => useRobotRoam(false));
    act(() => result.current.setMode("stroll", 800));
    expect(frames).toHaveLength(0);
  });

  it("settles and stops the loop once it reaches the target", () => {
    const { result } = renderHook(() => useRobotRoam(true));

    act(() => result.current.snapTo(400));
    act(() => result.current.setMode("stroll", 400)); // already there

    // Give it plenty of frames; the loop should decide it has settled and
    // stop queueing rather than spinning rAF forever at rest.
    act(() => {
      for (let i = 0; i < 40 && frames.length > 0; i += 1) flushFrame();
    });

    expect(frames).toHaveLength(0);
    expect(result.current.x.get()).toBeCloseTo(400, 0);
  });
});
