"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { Projects } from "./Projects";
import { ClassifiedWork } from "./ClassifiedWork";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { CONTAINER } from "@/lib/layout";

// Same split page.tsx used to do: real below-the-fold content, still SSR'd
// (no ssr:false) so it stays in the HTML for SEO, just out of the main chunk.
const ShowcaseLab = dynamic(() => import("./ShowcaseLab").then((mod) => mod.ShowcaseLab));
const LiveArsenal = dynamic(() => import("./LiveArsenal").then((mod) => mod.LiveArsenal));

/** Single source for both the jump strip and the chapter headings. */
export const WORK_CHAPTERS = [
  { id: "arsenal", step: "06.1" },
  { id: "showcase", step: "06.2" },
  { id: "classified", step: "06.3" },
  { id: "projects", step: "06.4" },
] as const;

/**
 * The work archive: one umbrella heading over the four chapters that all show
 * "work I've done" (live products, sealed showcase, redacted client records,
 * open archive).
 *
 * The wrapper is a <div>, NOT a <section> — on purpose. Eight components query
 * `main section[id]` (Navbar HUD, Achievements "explorer", SectionRail,
 * SectionScanline, RobotBuddy, SysLog, SessionReceipt, GhostTrace); adding a
 * 12th section that contains the others would make the umbrella intersect at
 * the same time as its children and leave active-section state flickering.
 */
export function WorkArchive() {
  const { t } = useLanguage();
  const [active, setActive] = useState<string>("arsenal");

  const labels: Record<string, string> = {
    arsenal: t.arsenal.kicker,
    showcase: t.showcase.kicker,
    classified: t.classified.kicker,
    projects: t.projects.kicker,
  };

  // "You are here" for the strip. Its own observer, watching only these four
  // nodes — it never touches the global active-section state.
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    // Two chapters mount via next/dynamic, so they can miss the first effect
    // tick; the rAF defer is the pattern already used elsewhere in the app.
    const raf = requestAnimationFrame(() => {
      const nodes = WORK_CHAPTERS.map((chapter) => document.getElementById(chapter.id)).filter(
        (node): node is HTMLElement => node !== null,
      );
      if (nodes.length === 0) return;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) setActive(entry.target.id);
          }
        },
        { rootMargin: "-30% 0px -60% 0px" },
      );
      nodes.forEach((node) => observer?.observe(node));
    });
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, []);

  return (
    <div id="work" className="relative">
      <div className="px-6 pt-24 sm:px-10 sm:pt-28 3xl:px-16">
        <div className={CONTAINER}>
          <SectionHeading
            index="06"
            kicker={t.work.kicker}
            title={t.work.title}
            description={t.work.description}
            diffCorrect
          />
        </div>
      </div>

      {/* Jump strip: NOT tabs — real anchors, keyboard reachable, hides
          nothing. Only a colour transition, so there is no motion to gate. */}
      <nav
        aria-label={t.work.jumpLabel}
        className="sticky top-[4.25rem] z-30 mt-8 border-y border-foreground/10 bg-[rgb(var(--background-rgb)/0.72)] backdrop-blur-md"
      >
        <div className={`${CONTAINER} flex gap-2 overflow-x-auto px-6 py-2.5 sm:px-10 3xl:px-16`}>
          {WORK_CHAPTERS.map((chapter) => (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              aria-current={active === chapter.id ? "true" : undefined}
              data-prox
              data-prox-radius="140"
              className={`flex shrink-0 items-center gap-2 rounded-sm border px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                active === chapter.id
                  ? "border-accent/55 bg-accent/10 text-accent"
                  : "border-foreground/12 text-muted hover:border-accent/35 hover:text-foreground"
              }`}
            >
              <span aria-hidden="true" className="text-[0.55rem] opacity-70">
                {chapter.step}
              </span>
              {labels[chapter.id]}
            </a>
          ))}
        </div>
      </nav>

      <LiveArsenal />
      <ShowcaseLab />
      <ClassifiedWork />
      <Projects />
    </div>
  );
}
