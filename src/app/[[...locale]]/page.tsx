import dynamic from "next/dynamic";
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
import { TechMarquee } from "@/components/TechMarquee";
import { ScrollProgress } from "@/components/ScrollProgress";
import { NameMarquee } from "@/components/NameMarquee";
import { IntroLoader } from "@/components/IntroLoader";
import { GenerativeDivider } from "@/components/GenerativeDivider";
import { ClassifiedWork } from "@/components/ClassifiedWork";
import { ClientChrome } from "@/components/ClientChrome";

// Real content below the fold: keep SSR (SEO), just split out of the main chunk.
const ShowcaseLab = dynamic(() => import("@/components/ShowcaseLab").then((mod) => mod.ShowcaseLab));
const FreelanceHub = dynamic(() => import("@/components/FreelanceHub").then((mod) => mod.FreelanceHub));

export default function Home() {
  return (
    <>
      <IntroLoader />
      <ClientChrome />
      <ScrollProgress />
      <SkipLink />
      <Navbar />
      <div className="relative z-10 flex flex-1 flex-col">
        <main id="main-content" className="flex-1">
          <Hero />
          <TechMarquee />
          <About />
          <Skills />
          <GenerativeDivider quoteId="day" />
          <Services />
          <Experience />
          <Education />
          <Projects />
          <ClassifiedWork />
          <ShowcaseLab />
          <FreelanceHub />
          <Goals />
          <GenerativeDivider quoteId="sunset" />
          <Contact />
        </main>
        <NameMarquee />
        <Footer />
      </div>
    </>
  );
}
