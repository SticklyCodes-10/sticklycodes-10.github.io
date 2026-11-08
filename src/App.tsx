import { About } from "./components/About";
import { Activity } from "./components/Activity";
import { Contact } from "./components/Contact";
import { Hero } from "./components/Hero";
import { Journey } from "./components/Journey";
import { Nav } from "./components/Nav";
import { PointerFX } from "./components/PointerFX";
import { Projects } from "./components/Projects";
import { Splash } from "./components/Splash";
import { TechStack } from "./components/TechStack";
import { GithubProvider } from "./hooks/useGithub";
import { PhaseProvider } from "./hooks/phase";

export default function App() {
  return (
    <PhaseProvider>
      <GithubProvider>
        <Splash />
        <PointerFX />
        <Nav />
        <Hero />
        <main id="main" tabIndex={-1} className="outline-none">
          <About />
          <Projects />
          <TechStack />
          <Activity />
          <Journey />
          <Contact />
        </main>
      </GithubProvider>
    </PhaseProvider>
  );
}
