import { Navbar } from "@/components/Navbar";
import { SkipLink } from "@/components/SkipLink";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Services } from "@/components/Services";
import { Experience } from "@/components/Experience";
import { Education } from "@/components/Education";
import { Projects } from "@/components/Projects";
import { Goals } from "@/components/Goals";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { ScrollVideoProvider } from "@/components/scrub/ScrollVideoProvider";
import { VideoScrubCanvas } from "@/components/scrub/VideoScrubCanvas";
import { PhaseHud } from "@/components/scrub/PhaseHud";
import { ClickSparks } from "@/components/ClickSparks";
import { TechMarquee } from "@/components/TechMarquee";
import { ShowcaseLab } from "@/components/ShowcaseLab";
import { ScrollProgress } from "@/components/ScrollProgress";
import { NameMarquee } from "@/components/NameMarquee";
import { IntroLoader } from "@/components/IntroLoader";
import { CustomCursor } from "@/components/CustomCursor";

export default function Home() {
  return (
    <ScrollVideoProvider>
      <IntroLoader />
      <CustomCursor />
      <VideoScrubCanvas />
      <PhaseHud />
      <ClickSparks />
      <ScrollProgress />
      <SkipLink />
      <Navbar />
      <div className="relative z-10 flex flex-1 flex-col">
        <main id="main-content" className="flex-1">
          <Hero />
          <TechMarquee />
          <About />
          <Skills />
          <Services />
          <Experience />
          <Education />
          <Projects />
          <ShowcaseLab />
          <Goals />
          <Contact />
        </main>
        <NameMarquee />
        <Footer />
      </div>
    </ScrollVideoProvider>
  );
}
