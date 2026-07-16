"use client";

import { useEffect, useRef, useState } from "react";

const DECRYPT_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$@%&";
const DECRYPT_TARGET = "ERİŞİM: GÜVENLİ";

function scramble(text: string, resolved: number) {
  return Array.from(text)
    .map((char, i) => (i < resolved || char === " " || char === ":" ? char : DECRYPT_CHARSET[Math.floor(Math.random() * DECRYPT_CHARSET.length)]))
    .join("");
}

// 21 — a big, centered decrypt-reveal: scrambled characters resolve into a
// short security phrase, hold, then scramble again and repeat.
export function DecryptRevealBig() {
  const [display, setDisplay] = useState(() => scramble(DECRYPT_TARGET, 0));

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) => timers.push(setTimeout(() => !cancelled && fn(), ms));

    const runCycle = () => {
      let resolved = 0;
      const tick = () => {
        resolved += 1;
        setDisplay(scramble(DECRYPT_TARGET, resolved));
        if (resolved < DECRYPT_TARGET.length) schedule(tick, 70);
        else schedule(() => { setDisplay(scramble(DECRYPT_TARGET, 0)); schedule(runCycle, 900); }, 2400);
      };
      tick();
    };

    runCycle();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="flex h-full w-full items-center justify-center px-4">
      <span className="font-mono text-lg tracking-widest text-[#5ec8ff]">{display}</span>
    </div>
  );
}

const BOOT_LINES = [
  "$ init secure_env",
  "loading modules ... ok",
  "checking integrity ... ok",
  "firewall: ACTIVE",
  "> ready",
];

// 28 — a larger fake boot sequence typing itself out, line by line, looping.
export function TerminalBootBig() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) => timers.push(setTimeout(() => !cancelled && fn(), ms));

    const runCycle = () => {
      const completed: string[] = [];
      setLines([]);
      const typeLine = (lineIndex: number) => {
        if (lineIndex >= BOOT_LINES.length) {
          schedule(runCycle, 2000);
          return;
        }
        const line = BOOT_LINES[lineIndex];
        const typeChar = (charIndex: number) => {
          setLines([...completed, line.slice(0, charIndex)]);
          if (charIndex < line.length) schedule(() => typeChar(charIndex + 1), 26);
          else {
            completed.push(line);
            schedule(() => typeLine(lineIndex + 1), 220);
          }
        };
        typeChar(0);
      };
      typeLine(0);
    };

    runCycle();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="flex h-full w-full items-center justify-center px-6">
      <div className="w-full font-mono text-xs leading-relaxed text-[#5ec8ff]">
        {lines.map((line, i) => (
          <div key={i}>{line || " "}</div>
        ))}
      </div>
    </div>
  );
}

// 29 — a rapid stream of hex byte pairs, evoking "data being processed".
export function HexTicker() {
  const [bytes, setBytes] = useState<string[]>([]);
  const ref = useRef<string[]>([]);

  useEffect(() => {
    const id = setInterval(() => {
      ref.current = [...ref.current, Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, "0")].slice(-24);
      setBytes([...ref.current]);
    }, 90);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden px-4">
      <div className="font-mono text-xs tracking-widest text-[#5ec8ff]/70">{bytes.join(" ")}</div>
    </div>
  );
}
