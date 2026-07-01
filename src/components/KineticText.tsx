"use client";

import { motion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.045, delayChildren: 0.15 },
  },
};

const letter: Variants = {
  hidden: { y: "110%", opacity: 0 },
  visible: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

export function KineticText({
  text,
  className,
  as: Tag = "h1",
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "span";
}) {
  const words = text.split(" ");

  return (
    <Tag className={className}>
      <motion.span
        className="inline"
        initial="hidden"
        animate="visible"
        variants={container}
        aria-label={text}
      >
        {words.map((word, wi) => (
          <span key={wi} className="inline-block whitespace-nowrap">
            <span className="inline-flex overflow-hidden pb-[0.1em]">
              {word.split("").map((char, ci) => (
                <motion.span key={ci} variants={letter} className="inline-block">
                  {char}
                </motion.span>
              ))}
            </span>
            {wi < words.length - 1 ? " " : ""}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
