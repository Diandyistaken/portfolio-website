"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Reveal } from "./Reveal";
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
    <section id="contact" className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-2xl">
        <SectionHeading
          index="08"
          kicker={t.contact.kicker}
          title={t.contact.title}
          description={t.contact.description}
        />

        <Reveal delay={0.1} className="mt-12">
          <div className="surface flex flex-col items-center gap-6 rounded-lg p-8 text-center sm:p-10">
            <button
              type="button"
              onClick={handleCopy}
              className="group flex flex-col items-center gap-2"
            >
              <span className="font-display text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
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
            </button>

            <div className="flex items-center gap-3">
              <a
                href={t.personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-11 w-11 items-center justify-center rounded-md border border-foreground/12 text-foreground transition-colors hover:border-foreground/30"
              >
                <LinkedinIcon className="h-4.5 w-4.5" />
              </a>
              <a
                href={t.personalInfo.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-md border border-foreground/12 text-foreground transition-colors hover:border-foreground/30"
              >
                <InstagramIcon className="h-4.5 w-4.5" />
              </a>
              <a
                href={t.personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex h-11 w-11 items-center justify-center rounded-md border border-foreground/12 text-foreground transition-colors hover:border-foreground/30"
              >
                <GithubIcon className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
