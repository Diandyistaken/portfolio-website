"use client";

import { ArrowUpRight } from "lucide-react";
import { m } from "framer-motion";
import { SectionHeading } from "./SectionHeading";
import { RevealGroup, revealItem } from "./Reveal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { FreelancePlatformId } from "@/lib/i18n/types";
import { CONTAINER } from "@/lib/layout";
import { useSpotlight } from "@/lib/useSpotlight";
import { useTilt3D } from "@/lib/useTilt3D";

const platforms: Array<{
  id: FreelancePlatformId;
  name: string;
  handle: string;
  monogram: string;
  href: string;
  tint: string;
}> = [
  {
    id: "freelancer",
    name: "Freelancer",
    handle: "@muhammedmaksut",
    monogram: "F",
    href: "https://www.freelancer.com/u/muhammedmaksut",
    tint: "#29B2FE",
  },
  {
    id: "upwork",
    name: "Upwork",
    handle: "@~01221182b8c340bf9a",
    monogram: "Up",
    href: "https://www.upwork.com/freelancers/~01221182b8c340bf9a",
    tint: "#14A800",
  },
  {
    id: "fiverr",
    name: "Fiverr",
    handle: "@diandy_",
    monogram: "fi",
    href: "https://www.fiverr.com/diandy_",
    tint: "#1DBF73",
  },
  {
    id: "bionluk",
    name: "Bionluk",
    handle: "@muhammedmaksut",
    monogram: "b",
    href: "https://bionluk.com/muhammedmaksut",
    tint: "#00c853",
  },
];

const FIVERR_GIG =
  "https://www.fiverr.com/diandy_/design-a-modern-3d-animated-website-with-scroll-effects";

function PlatformCard({ platform }: { platform: (typeof platforms)[number] }) {
  const { t } = useLanguage();
  const spotlight = useSpotlight<HTMLElement>();
  const tilt = useTilt3D<HTMLElement>();

  return (
    <m.article
      {...tilt.handlers}
      style={{
        ...tilt.motionStyle,
        borderTopColor: `${platform.tint}2e`,
      }}
      variants={revealItem}
      onMouseMove={spotlight.onMouseMove}
      className="spotlight-card surface surface-hover group relative flex min-w-0 flex-col overflow-hidden rounded-lg border-t p-6 sm:p-7 3xl:min-h-80 3xl:p-8"
    >
      <div className="spotlight-overlay" aria-hidden="true" />
      <div className="relative z-10 flex flex-1 flex-col [transform:translateZ(18px)]">
        <div className="flex items-start justify-between gap-4">
          <div
            className="grid h-11 w-11 place-items-center rounded-md border font-mono text-sm font-semibold text-accent"
            style={{
              borderColor: `${platform.tint}2e`,
              backgroundColor: `${platform.tint}14`,
            }}
            aria-hidden="true"
          >
            {platform.monogram}
          </div>
          <span className="font-mono text-[0.68rem] text-muted">{platform.handle}</span>
        </div>

        <h3 className="font-display mt-7 text-xl font-semibold 3xl:text-2xl">{platform.name}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
          {t.freelance.platforms[platform.id].pitch}
        </p>

        {platform.id === "fiverr" && (
          <a
            href={FIVERR_GIG}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 border-l border-accent/30 pl-3 text-xs leading-relaxed text-foreground/75 transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {t.freelance.featuredGig}
          </a>
        )}

        <a
          href={platform.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 self-start font-mono text-xs uppercase tracking-[0.08em] text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          {t.freelance.visit}
          <ArrowUpRight
            aria-hidden="true"
            size={15}
            className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      </div>
    </m.article>
  );
}

export function FreelanceHub() {
  const { t } = useLanguage();

  return (
    <section id="freelance" className="px-6 py-24 sm:px-10 sm:py-28 3xl:px-16">
      <div className={CONTAINER}>
        <SectionHeading
        index="08"
          kicker={t.freelance.kicker}
          title={t.freelance.title}
          description={t.freelance.description}
        />
        <p className="font-mono mt-4 text-xs text-accent/80">{t.freelance.disclaimer}</p>
        <RevealGroup
          stagger={0.07}
          className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-2 3xl:grid-cols-4 3xl:gap-6"
        >
          {platforms.map((platform) => (
            <PlatformCard key={platform.id} platform={platform} />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
