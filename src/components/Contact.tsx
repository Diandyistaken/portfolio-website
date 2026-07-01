"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Mail } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionBackground } from "./SectionBackground";
import { SectionHeading } from "./SectionHeading";
import { GithubIcon, LinkedinIcon } from "./icons";
import { personalInfo } from "@/lib/data";

export function Contact() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(personalInfo.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable, ignore silently
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden px-6 py-28 sm:py-32">
      <SectionBackground variant="beacon" />
      <div className="mx-auto max-w-2xl">
        <SectionHeading
          kicker="İletişim"
          title="Hadi konuşalım"
          description="Bir fikri, bir fırsatı ya da sadece merhaba demeyi konuşmak için."
        />

        <Reveal delay={0.1} className="mt-12">
          <div className="glass-strong flex flex-col items-center gap-6 rounded-3xl p-8 sm:p-10">
            <motion.button
              type="button"
              onClick={handleCopy}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left"
            >
              <span className="flex items-center gap-3 text-sm sm:text-base">
                <Mail size={18} className="text-accent" />
                {personalInfo.email}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted">
                {copied ? (
                  <>
                    <Check size={14} className="text-accent" /> Kopyalandı
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Kopyala
                  </>
                )}
              </span>
            </motion.button>

            <div className="flex items-center gap-4">
              <motion.a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="glass flex h-12 w-12 items-center justify-center rounded-full text-foreground transition-shadow hover:shadow-[0_0_24px_rgb(var(--surface-border)/0.15)]"
              >
                <LinkedinIcon className="h-5 w-5" />
              </motion.a>
              <motion.a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="glass flex h-12 w-12 items-center justify-center rounded-full text-foreground transition-shadow hover:shadow-[0_0_24px_rgb(var(--surface-border)/0.15)]"
              >
                <GithubIcon className="h-5 w-5" />
              </motion.a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
