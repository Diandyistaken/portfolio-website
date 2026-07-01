"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionBackground } from "./SectionBackground";
import { SectionHeading } from "./SectionHeading";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "./icons";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function Contact() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(t.personalInfo.email);
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
          kicker={t.contact.kicker}
          title={t.contact.title}
          description={t.contact.description}
        />

        <Reveal delay={0.1} className="mt-12">
          <div className="glass-strong flex flex-col items-center gap-6 rounded-3xl p-8 text-center sm:p-10">
            <motion.button
              type="button"
              onClick={handleCopy}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex flex-col items-center gap-2"
            >
              <span className="font-display text-gradient text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                {t.personalInfo.email}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted transition-colors group-hover:text-foreground">
                {copied ? (
                  <>
                    <Check size={14} className="text-accent" /> {t.contact.copiedLabel}
                  </>
                ) : (
                  <>
                    <Copy size={14} /> {t.contact.copyLabel}
                  </>
                )}
              </span>
            </motion.button>

            <div className="flex items-center gap-4">
              <motion.a
                href={t.personalInfo.linkedin}
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
                href={t.personalInfo.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="glass flex h-12 w-12 items-center justify-center rounded-full text-foreground transition-shadow hover:shadow-[0_0_24px_rgb(var(--surface-border)/0.15)]"
              >
                <InstagramIcon className="h-5 w-5" />
              </motion.a>
              <motion.a
                href={t.personalInfo.github}
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
