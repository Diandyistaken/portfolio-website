import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// vitest.config.ts doesn't enable `globals`, so Testing Library can't
// auto-detect an `afterEach` to hook into — without this, the DOM from one
// test leaks into the next and every query starts matching duplicates.
afterEach(() => {
  cleanup();
});

// jsdom doesn't implement these; framer-motion and our perf/reduced-motion
// hooks probe them on mount, so component tests need a stand-in or they
// throw before the component under test ever renders.
if (typeof window !== "undefined") {
  window.matchMedia =
    window.matchMedia ||
    ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));

  class ObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }

  window.ResizeObserver = window.ResizeObserver || (ObserverStub as unknown as typeof ResizeObserver);
  window.IntersectionObserver =
    window.IntersectionObserver || (ObserverStub as unknown as typeof IntersectionObserver);
}
