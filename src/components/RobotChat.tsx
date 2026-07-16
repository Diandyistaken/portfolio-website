"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion, useSpring } from "framer-motion";
import { Send, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type ChatMessage = { id: number; from: "bot" | "user"; text: string };

const TYPE_MS = 16;
const MAX_INPUT = 200;

/**
 * The robot's "big form": clicking the corner buddy opens this panel — a
 * full-body cute robot (head, torso with a pulsing core, waving arms, stubby
 * legs, all CSS-3D layers) plus a lightweight local chat brain. No API, no
 * cloud: a keyword-intent engine over a localized knowledge base about
 * Maksut, with typing animation, quick-reply chips and playful reactions
 * (asking about "hack" really does trigger the matrix easter egg).
 */
export function RobotChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const chat = t.robotChat;
  const reducedMotion = useReducedMotion();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState<string | null>(null); // bot reply being typed
  const [mood, setMood] = useState<"idle" | "talk" | "happy" | "alert">("idle");

  const idRef = useRef(0);
  const typeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackIndex = useRef(0);
  const pickIndex = useRef(0);
  const [hasSpoken, setHasSpoken] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const greeted = useRef(false);
  // full text of the line currently being typed (for instant flush)
  const pendingTextRef = useRef<string | null>(null);

  // Big-form eyes also track the cursor — same charm, bigger stage.
  const pupilX = useSpring(0, { stiffness: 170, damping: 15 });
  const pupilY = useSpring(0, { stiffness: 170, damping: 15 });

  useEffect(() => {
    return () => {
      if (typeTimer.current) clearInterval(typeTimer.current);
      if (moodTimer.current) clearTimeout(moodTimer.current);
    };
  }, []);

  /** Type a bot line into the chat (stable identity for effect deps). */
  const botSay = useCallback(
    (text: string) => {
      const commit = () => {
        pendingTextRef.current = null;
        idRef.current += 1;
        const id = idRef.current;
        setMessages((previous) => [...previous, { id, from: "bot" as const, text }]);
        requestAnimationFrame(() => {
          const list = listRef.current;
          if (list) list.scrollTop = list.scrollHeight;
        });
      };
      if (reducedMotion) {
        commit();
        return;
      }
      pendingTextRef.current = text;
      setMood("talk");
      if (moodTimer.current) clearTimeout(moodTimer.current);
      moodTimer.current = setTimeout(() => setMood("idle"), text.length * TYPE_MS + 600);
      // Time-based progress (not per-tick increments): if the browser
      // throttles timers in a background tab, the message still completes
      // in a couple of ticks instead of stalling mid-sentence.
      const startedAt = performance.now();
      setTyping("");
      if (typeTimer.current) clearInterval(typeTimer.current);
      typeTimer.current = setInterval(() => {
        const chars = Math.min(text.length, Math.ceil((performance.now() - startedAt) / TYPE_MS));
        setTyping(text.slice(0, chars));
        const list = listRef.current;
        if (list) list.scrollTop = list.scrollHeight;
        if (chars >= text.length) {
          if (typeTimer.current) clearInterval(typeTimer.current);
          setTyping(null);
          commit();
        }
      }, TYPE_MS);
    },
    [reducedMotion],
  );

  // Greet once per open; focus input; ESC closes.
  useEffect(() => {
    if (!open) return;
    const greetTimer = setTimeout(() => {
      if (greeted.current) return;
      greeted.current = true;
      botSay(chat.greeting);
    }, 300);
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 350);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(greetTimer);
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, chat.greeting, onClose, botSay]);

  useEffect(() => {
    if (!open || reducedMotion) return;
    const onMove = (event: MouseEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      const bounds = panel.getBoundingClientRect();
      const dx = (event.clientX - (bounds.left + bounds.width / 2)) / window.innerWidth;
      const dy = (event.clientY - (bounds.top + 90)) / window.innerHeight;
      pupilX.set(Math.max(-5, Math.min(5, dx * 22)));
      pupilY.set(Math.max(-3.5, Math.min(3.5, dy * 16)));
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [open, reducedMotion, pupilX, pupilY]);

  const setMoodFor = (next: typeof mood, ms: number) => {
    setMood(next);
    if (moodTimer.current) clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => setMood("idle"), ms);
  };

  const push = (from: ChatMessage["from"], text: string) => {
    idRef.current += 1;
    setMessages((previous) => [...previous, { id: idRef.current, from, text }]);
  };

  const scrollDown = () => {
    requestAnimationFrame(() => {
      const list = listRef.current;
      if (list) list.scrollTop = list.scrollHeight;
    });
  };

  /** The "light intelligence": lowercase per locale, score every intent by
   *  keyword hits (longer keyword = stronger signal), best score wins. */
  const answer = (raw: string): string => {
    const text = raw.toLocaleLowerCase(t.htmlLang);
    let best: { score: number; responses: string[] } | null = null;
    for (const intent of chat.intents) {
      let score = 0;
      for (const keyword of intent.keywords) {
        if (text.includes(keyword)) score += keyword.length;
      }
      if (score > 0 && (!best || score > best.score)) {
        best = { score, responses: intent.responses };
      }
      if (score > 0 && intent.id === "hack") {
        window.dispatchEvent(new Event("app:hack-egg"));
        setMoodFor("alert", 2600);
      }
      if (score > 0 && (intent.id === "greet" || intent.id === "thanks" || intent.id === "bye")) {
        setMoodFor("happy", 2200);
      }
    }
    if (best) {
      // rotate through variants (render-purity rule bans Math.random here)
      pickIndex.current += 1;
      return best.responses[pickIndex.current % best.responses.length];
    }
    const fallback = chat.fallbacks[fallbackIndex.current % chat.fallbacks.length];
    fallbackIndex.current += 1;
    return fallback;
  };

  const submit = (text: string) => {
    const trimmed = text.trim().slice(0, MAX_INPUT);
    if (!trimmed) return;
    // if the bot is mid-sentence, finish that line instantly instead of
    // swallowing the visitor's input
    if (typing !== null) {
      if (typeTimer.current) clearInterval(typeTimer.current);
      const pending = pendingTextRef.current;
      pendingTextRef.current = null;
      setTyping(null);
      if (pending) {
        idRef.current += 1;
        const id = idRef.current;
        setMessages((previous) => [...previous, { id, from: "bot" as const, text: pending }]);
      }
    }
    push("user", trimmed);
    scrollDown();
    setDraft("");
    setHasSpoken(true);
    window.dispatchEvent(new Event("app:robot-chat"));
    const reply = answer(trimmed);
    setTimeout(() => botSay(reply), reducedMotion ? 0 : 420);
  };

  const talking = typing !== null;

  return (
    <AnimatePresence>
      {open && (
        <m.div
          ref={panelRef}
          role="dialog"
          aria-label={chat.title}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 34, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="terminal-panel fixed bottom-28 right-6 z-50 flex w-[21rem] flex-col overflow-hidden rounded-2xl border border-foreground/15 shadow-[0_30px_90px_rgb(0_0_0/0.65)] sm:w-[23rem]"
        >
          {/* header */}
          <div className="flex items-center gap-2.5 border-b border-foreground/10 px-4 py-2.5">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[0.7rem] tracking-[0.14em] text-foreground">{chat.title}</p>
              <p className="font-mono text-[0.58rem] tracking-[0.1em] text-muted">{chat.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={chat.close}
              className="ml-auto flex h-6 w-6 items-center justify-center rounded-md border border-foreground/15 text-muted transition-colors hover:border-accent/50 hover:text-foreground"
            >
              <X size={12} />
            </button>
          </div>

          {/* the big robot: full body, CSS layers */}
          <div className="relative flex justify-center border-b border-foreground/10 py-4" style={{ perspective: 500 }}>
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(60% 90% at 50% 30%, rgb(var(--accent-rgb) / 0.08), transparent 70%)" }}
              aria-hidden="true"
            />
            <div className={`robot-body relative ${reducedMotion ? "" : ""}`} aria-hidden="true">
              {/* antenna */}
              <span className="absolute -top-3.5 left-1/2 h-3.5 w-px -translate-x-1/2 bg-foreground/30" />
              <span className={`robot-antenna-tip absolute -top-5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full ${mood === "alert" ? "bg-amber-400" : "bg-accent"}`} />

              {/* head */}
              <div className="surface relative mx-auto h-[4.6rem] w-[5.4rem] rounded-2xl border border-foreground/15">
                <div className="absolute inset-1.5 rounded-xl bg-[rgb(var(--background-rgb)/0.85)]">
                  <div className="absolute inset-x-0 top-[46%] flex -translate-y-1/2 items-center justify-center gap-3.5">
                    {[0, 1].map((eye) => (
                      <span
                        key={eye}
                        className={`robot-eye relative h-[1.35rem] w-[0.95rem] overflow-hidden rounded-full border bg-accent/10 transition-colors ${
                          mood === "happy" ? "border-accent/70" : "border-accent/30"
                        }`}
                      >
                        <m.span
                          style={{ x: pupilX, y: pupilY }}
                          className={`absolute inset-x-0 top-1/2 mx-auto h-[0.65rem] w-[0.65rem] -translate-y-1/2 rounded-full shadow-[0_0_8px_rgb(var(--accent-rgb)/1)] ${
                            mood === "alert" ? "bg-amber-400" : "bg-accent"
                          }`}
                        />
                      </span>
                    ))}
                  </div>
                  {/* mouth: waveform bars while talking, smile line when idle */}
                  <div className="absolute bottom-2 left-1/2 flex h-2.5 -translate-x-1/2 items-end gap-[2px]">
                    {talking ? (
                      [0, 1, 2, 3, 4].map((bar) => (
                        <m.span
                          key={bar}
                          animate={{ scaleY: [0.3, 1, 0.4, 0.9, 0.3] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay: bar * 0.09 }}
                          className="w-[3px] origin-bottom rounded-full bg-accent"
                          style={{ height: "10px" }}
                        />
                      ))
                    ) : (
                      <span className={`h-[3px] w-5 rounded-full transition-all duration-300 ${mood === "happy" ? "w-6 rounded-b-full bg-accent" : "bg-accent/50"}`} />
                    )}
                  </div>
                </div>
              </div>

              {/* neck */}
              <div className="mx-auto h-1.5 w-5 bg-foreground/15" />

              {/* torso with pulsing core */}
              <div className="surface relative mx-auto h-[3.4rem] w-[4.2rem] rounded-xl border border-foreground/15">
                <m.span
                  animate={reducedMotion ? undefined : { opacity: [0.5, 1, 0.5], scale: [1, 1.15, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/80 shadow-[0_0_12px_rgb(var(--accent-rgb)/0.9)]"
                />
                <span className="absolute inset-x-3 bottom-1.5 h-px bg-foreground/15" />
                <span className="absolute inset-x-4 bottom-3 h-px bg-foreground/10" />
              </div>

              {/* arms: right one waves on open + when happy */}
              <span className="absolute left-[-0.65rem] top-[6.4rem] h-7 w-2 rounded-full bg-foreground/25" />
              <span
                className={`absolute right-[-0.65rem] top-[6.4rem] h-7 w-2 rounded-full bg-foreground/25 ${
                  mood === "happy" || messages.length === 0 ? "robot-arm--wave bg-accent/70" : ""
                }`}
              />

              {/* legs */}
              <div className="mx-auto mt-0.5 flex justify-center gap-2">
                <span className="h-3.5 w-2 rounded-b-md bg-foreground/25" />
                <span className="h-3.5 w-2 rounded-b-md bg-foreground/25" />
              </div>
              <div className="robot-shadow mx-auto mt-1 h-1.5 w-16 rounded-full" />
            </div>
          </div>

          {/* messages */}
          <div ref={listRef} className="h-44 space-y-2 overflow-y-auto px-3.5 py-3 font-mono text-[0.72rem] leading-relaxed">
            {messages.map((message) => (
              <div key={message.id} className={message.from === "user" ? "flex justify-end" : "flex justify-start"}>
                <p
                  className={
                    message.from === "user"
                      ? "max-w-[85%] rounded-lg rounded-br-sm border border-accent/35 bg-accent/10 px-3 py-1.5 text-foreground"
                      : "max-w-[85%] rounded-lg rounded-bl-sm bg-foreground/[0.06] px-3 py-1.5 text-foreground/90"
                  }
                >
                  {message.text}
                </p>
              </div>
            ))}
            {typing !== null && (
              <div className="flex justify-start">
                <p className="max-w-[85%] rounded-lg rounded-bl-sm bg-foreground/[0.06] px-3 py-1.5 text-foreground/90">
                  {typing}
                  <span className="ops-cursor ml-0.5 inline-block text-accent" aria-hidden="true">▊</span>
                </p>
              </div>
            )}
          </div>

          {/* quick chips (until the visitor has spoken) */}
          {!hasSpoken && (
            <div className="flex flex-wrap gap-1.5 px-3.5 pb-2">
              {chat.chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => submit(chip)}
                  className="tap-pop rounded-full border border-foreground/15 px-2.5 py-1 font-mono text-[0.62rem] text-muted transition-colors hover:border-accent/50 hover:text-accent"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* input */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submit(draft);
            }}
            className="flex items-center gap-2 border-t border-foreground/10 px-3 py-2.5"
          >
            <span className="shrink-0 font-mono text-xs text-accent" aria-hidden="true">$</span>
            <input
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={chat.placeholder}
              maxLength={MAX_INPUT}
              className="min-w-0 flex-1 bg-transparent font-mono text-[0.72rem] text-foreground placeholder:text-muted/60 focus:outline-none"
            />
            <button
              type="submit"
              aria-label={chat.send}
              disabled={!draft.trim() || typing !== null}
              className="tap-pop flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-foreground/15 text-muted transition-colors enabled:hover:border-accent/60 enabled:hover:text-accent disabled:opacity-40"
            >
              <Send size={12} />
            </button>
          </form>
        </m.div>
      )}
    </AnimatePresence>
  );
}
