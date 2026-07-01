import { GraduationCap } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { education } from "@/lib/data";

export function Education() {
  return (
    <section id="education" className="relative px-6 py-28 sm:py-32">
      <div className="mx-auto max-w-2xl">
        <SectionHeading kicker="Eğitim" title="Akademik altyapı" />

        <Reveal delay={0.1} className="mt-10">
          <div className="glass flex flex-col items-center gap-4 rounded-3xl p-8 text-center sm:flex-row sm:text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent">
              <GraduationCap size={26} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold">
                {education.school}
              </h3>
              <p className="text-sm text-muted">{education.department}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-accent">
                Mezuniyet: {education.graduation}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
