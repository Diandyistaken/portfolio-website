"use client";

import { m, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export type EmoteAction = "chat" | "wave" | "come" | "trick" | "sleep";

/**
 * The mascot's visible action list.
 *
 * "How do I even talk to this thing?" is not answered by hoping the visitor
 * guesses a gesture — it is answered by showing the verbs. Every trick the
 * robot can do is reachable from here, which also makes the whole mascot
 * keyboard- and screen-reader-operable instead of mouse-only sugar.
 *
 * Every button needs `data-robot-hit`: the lane sets `pointer-events: none`
 * on all descendants and only re-enables that attribute.
 */
export function RobotEmotes({
  open,
  onAction,
}: {
  open: boolean;
  onAction: (action: EmoteAction) => void;
}) {
  const { t } = useLanguage();
  const menu = t.robot.emotes;

  const items: { id: EmoteAction; label: string; icon: string }[] = [
    { id: "chat", label: menu.chat, icon: "💬" },
    { id: "wave", label: menu.wave, icon: "👋" },
    { id: "come", label: menu.come, icon: "🧲" },
    { id: "trick", label: menu.trick, icon: "🤸" },
    { id: "sleep", label: menu.sleep, icon: "💤" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <m.div
          role="menu"
          aria-label={menu.label}
          data-robot-hit
          initial={{ opacity: 0, y: 6, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 340, damping: 24 }}
          className="surface absolute bottom-full left-1/2 mb-3 w-max -translate-x-1/2 rounded-xl p-1.5"
        >
          <ul className="flex flex-col gap-0.5">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  role="menuitem"
                  data-robot-hit
                  onClick={() => onAction(item.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left font-mono text-[0.66rem] text-foreground/85 transition-colors hover:bg-accent/12 hover:text-accent focus-visible:bg-accent/12 focus-visible:text-accent focus-visible:outline-none"
                >
                  <span aria-hidden="true" className="text-[0.8rem] leading-none">
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </m.div>
      )}
    </AnimatePresence>
  );
}
