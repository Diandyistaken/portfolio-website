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

export default function Home() {
  return (
    <>
      <SkipLink />
      <Navbar />
      <main id="main-content" className="flex-1">
        <Hero />
        <About />
        <Skills />
        <Services />
        <Experience />
        <Education />
        <Projects />
        <Goals />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
