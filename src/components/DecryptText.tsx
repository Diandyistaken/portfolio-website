"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

const DEFAULT_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$@%&<>/\\|=+*";
const RESOLVE_DURATION = 900;
const SHUFFLE_INTERVAL = 30;

const subscribeToRootClass = (onStoreChange: () => void) => {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
};

const getPerfLiteSnapshot = () =>
  document.documentElement.classList.contains("perf-lite");

type DecryptTextProps = {
  text: string;
  className?: string;
  delay?: number;
  charset?: string;
};

const isAlphaNumeric = (character: string) => /[\p{L}\p{N}]/u.test(character);

function makeScramble(
  text: string,
  charset: string,
  resolvedCharacters: number,
  random = false,
) {
  let seen = 0;

  return Array.from(text, (character, index) => {
    if (!isAlphaNumeric(character)) return character;

    const resolved = seen < resolvedCharacters;
    seen += 1;
    if (resolved) return character;

    const charsetIndex = random
      ? Math.floor(Math.random() * charset.length)
      : (index * 17 + text.length) % charset.length;
    return charset[charsetIndex];
  }).join("");
}

export function DecryptText({
  text,
  className,
  delay = 0,
  charset = DEFAULT_CHARSET,
}: DecryptTextProps) {
  const reduceMotion = useReducedMotion();
  const elementRef = useRef<HTMLSpanElement>(null);
  const safeCharset = charset || DEFAULT_CHARSET;
  const perfLite = useSyncExternalStore(
    subscribeToRootClass,
    getPerfLiteSnapshot,
    () => false,
  );
  const [displayText, setDisplayText] = useState(() =>
    makeScramble(text, safeCharset, 0),
  );

  useEffect(() => {
    if (reduceMotion || perfLite) return;

    const element = elementRef.current;
    if (!element) return;

    let animationFrame = 0;
    let delayTimer: ReturnType<typeof setTimeout> | undefined;
    let lastShuffle = 0;
    const resolvableCount = Array.from(text).filter(isAlphaNumeric).length;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        delayTimer = setTimeout(() => {
          const startedAt = performance.now();

          const animate = (now: number) => {
            const progress = Math.min((now - startedAt) / RESOLVE_DURATION, 1);
            const resolved = Math.floor(progress * resolvableCount);

            if (now - lastShuffle >= SHUFFLE_INTERVAL || progress === 1) {
              setDisplayText(
                progress === 1
                  ? text
                  : makeScramble(text, safeCharset, resolved, true),
              );
              lastShuffle = now;
            }

            if (progress < 1) animationFrame = requestAnimationFrame(animate);
          };

          animationFrame = requestAnimationFrame(animate);
        }, Math.max(0, delay * 1000));
      },
      { threshold: 0.35 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (delayTimer) clearTimeout(delayTimer);
      cancelAnimationFrame(animationFrame);
    };
  }, [delay, perfLite, reduceMotion, safeCharset, text]);

  return (
    <span ref={elementRef} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {reduceMotion || perfLite ? text : displayText}
      </span>
    </span>
  );
}
