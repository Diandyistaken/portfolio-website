import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { personalInfo } from "@/lib/data";

export function About() {
  return (
    <section id="about" className="relative px-6 py-28 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <SectionHeading kicker="Hakkımda" title="Kim bu Muhammed Maksut?" />
        <Reveal delay={0.1} className="mt-10">
          <p className="glass-strong rounded-3xl p-8 text-center text-base leading-relaxed text-muted sm:p-12 sm:text-lg">
            {personalInfo.bio}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
