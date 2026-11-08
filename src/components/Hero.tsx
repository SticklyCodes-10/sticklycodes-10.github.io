import { useRef, type CSSProperties } from "react";
import { PHASE_META, usePhase } from "../hooks/phase";
import { useParallax, usePrefersReducedMotion } from "../hooks/useMotion";
import { Skyline } from "./scenery/Skyline";
import { Bush, Palm } from "./scenery/Palms";
import { Clouds, Stars, SunMoon } from "./scenery/Sky";
import { Glitter, RetroGrid, Wave } from "./scenery/Water";

/** translate by scroll (k) + pointer drift (m) using CSS variables written by useParallax */
const par = (k: number, m = 0, extra = ""): CSSProperties => ({
  transform: `translate3d(calc(var(--mx, 0) * ${m}px), calc(var(--sy, 0) * ${k} * 1px), 0) ${extra}`,
});

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  useParallax(ref, !reduced);
  const { now, phase, realPhase, choice, setChoice, timeZone } = usePhase();
  const meta = PHASE_META[phase];
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <header
      id="top"
      ref={ref}
      className="relative isolate overflow-hidden"
      style={{ ["--S" as string]: "clamp(260px, 36svh, 420px)", minHeight: "max(100svh, 700px)" }}
    >
      {/* sky */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, var(--sky-1) 0%, var(--sky-2) 30%, var(--sky-3) 58%, var(--sky-4) 80%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{ opacity: "var(--sun-o)", background: "radial-gradient(60% 38% at var(--sun-x) 80%, var(--sun-glow), transparent 70%)" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0" style={{ ...par(0.2, -6), opacity: "var(--star-o)" }} aria-hidden="true">
        <Stars />
      </div>
      <div className="absolute inset-0" style={par(0.32, -10)} aria-hidden="true">
        <SunMoon />
      </div>
      <div className="absolute inset-0" style={par(0.25, -16)} aria-hidden="true">
        <Clouds />
      </div>

      {/* skyline */}
      <div className="pointer-events-none absolute inset-x-0" style={{ bottom: "calc(var(--S) * 0.5)", ...par(0.14, -8) }} aria-hidden="true">
        <div className="absolute bottom-0 left-1/2 w-[max(1200px,104%)] -translate-x-1/2">
          <Skyline className="block h-auto w-full" />
        </div>
      </div>

      {/* sea */}
      <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ height: "calc(var(--S) * 0.5)", background: "linear-gradient(180deg, var(--sea-1), var(--sea-2))", ...par(0.05) }} aria-hidden="true">
        <div
          className="absolute left-1/2 top-0 w-[max(1200px,104%)]"
          style={{
            transform: "translateX(-50%) scaleY(-1)",
            opacity: 0.28,
            filter: "blur(1.4px)",
            WebkitMaskImage: "linear-gradient(0deg, #000 0%, transparent 85%)",
            maskImage: "linear-gradient(0deg, #000 0%, transparent 85%)",
          }}
        >
          <Skyline className="block h-auto w-full" />
        </div>
        <RetroGrid />
        <Glitter />
        <Wave fill="var(--wave-1)" dur={44} bob={6} className="h-[26%]" style={{ bottom: "58%", opacity: 0.5 }} />
        <Wave fill="var(--wave-2)" dur={32} bob={5} reverse className="h-[30%]" style={{ bottom: "36%", opacity: 0.6 }} />
        <Wave fill="var(--wave-1)" dur={22} bob={4.5} className="h-[34%]" style={{ bottom: "12%", opacity: 0.8 }} />
      </div>

      {/* shoreline + sand */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: "calc(var(--S) * 0.2)" }} aria-hidden="true">
        <Wave fill="var(--foam)" dur={17} bob={4} className="h-[44px]" style={{ top: -34 }} />
        <Wave fill="var(--sand-1)" dur={60} bob={7} reverse className="h-[40px]" style={{ top: -22 }} />
        <div
          className="absolute inset-x-0 bottom-0 top-[16px]"
          style={{
            background: "radial-gradient(rgba(60,30,10,0.16) 1px, transparent 1.4px) 0 0 / 9px 9px, linear-gradient(180deg, var(--sand-1), var(--sand-2))",
          }}
        />
      </div>

      {/* palms & plants */}
      <div className="pointer-events-none absolute left-[-3%] z-[3]" style={{ bottom: "calc(var(--S) * 0.1)", height: "min(clamp(300px, 66svh, 640px), 66vw)", ...par(-0.03) }} aria-hidden="true">
        <Palm className="h-full" speed={8} />
      </div>
      <div className="pointer-events-none absolute left-[11%] z-[2] hidden opacity-80 sm:block" style={{ bottom: "calc(var(--S) * 0.12)", height: "clamp(180px, 38svh, 360px)", ...par(0.02) }} aria-hidden="true">
        <Palm className="h-full" speed={6.5} />
      </div>
      <div className="pointer-events-none absolute right-[-5%] z-[3]" style={{ bottom: "calc(var(--S) * 0.1)", height: "min(clamp(260px, 56svh, 540px), 58vw)", ...par(-0.02, 0, "scaleX(-1)") }} aria-hidden="true">
        <Palm className="h-full" speed={9} />
      </div>
      <div className="pointer-events-none absolute bottom-[calc(var(--S)*0.05)] left-[2%] z-[4] h-[clamp(70px,13svh,130px)]" aria-hidden="true">
        <Bush className="h-full" speed={5.5} />
      </div>
      <div className="pointer-events-none absolute bottom-[calc(var(--S)*0.04)] right-[3%] z-[4] h-[clamp(60px,11svh,110px)]" aria-hidden="true">
        <Bush className="h-full" speed={6.5} />
      </div>

      <div className="grain pointer-events-none absolute inset-0 z-[5]" aria-hidden="true" />

      {/* hero copy */}
      <div
        className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 text-center"
        style={{ paddingTop: "clamp(6rem, 13svh, 8.5rem)", paddingBottom: "calc(var(--S) * 0.5 + 72px)", color: "var(--hero-ink)" }}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-[44%] -z-10 h-[120%] w-[min(1000px,120vw)] -translate-x-1/2 -translate-y-1/2"
          style={{ background: "radial-gradient(closest-side, var(--scrim), transparent)" }}
          aria-hidden="true"
        />

        <div
          className="mb-5 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border px-4 py-2 font-mono text-xs backdrop-blur-md sm:text-sm"
          style={{ background: "var(--pill-bg)", borderColor: "var(--pill-border)", color: "var(--hero-ink)", animation: "sunrise-in 1s ease both" }}
        >
          <span aria-hidden="true">{meta.emoji}</span>
          <span className="sr-only">Time of day on your device: {meta.label}.</span>
          <span className="font-bold uppercase tracking-widest">{meta.label}</span>
          <span aria-hidden="true" className="opacity-60">·</span>
          <time dateTime={now.toISOString()} aria-hidden="true" className="tabular-nums">
            {time}
          </time>
          <span aria-hidden="true" className="hidden opacity-70 sm:inline">
            · your clock ({timeZone})
          </span>
        </div>

        <p className="font-mono text-[0.7rem] uppercase tracking-[0.5em] sm:text-sm" style={{ animation: "sunrise-in 1s 0.1s ease both" }}>
          Welcome to my Miami
        </p>

        <h1
          className="font-display mt-3 leading-[0.95] tracking-[0.02em]"
          style={{ fontSize: "clamp(2.6rem, 7.4vw, 6.2rem)", textShadow: "var(--hero-title-shadow)", animation: "sunrise-in 1.1s 0.2s ease both" }}
        >
          <span className="sr-only">SticklyCodes-10</span>
          <span aria-hidden="true">
            <span className="inline-block">Stickly</span>
            <wbr />
            <span className="inline-block">Codes-10</span>
          </span>
        </h1>

        <p
          aria-live="polite"
          className="mt-5 text-balance text-xl font-semibold sm:text-2xl md:text-3xl"
          style={{ color: "var(--hero-ink)", textShadow: "var(--hero-soft-shadow)", animation: "sunrise-in 1.1s 0.35s ease both" }}
        >
          {meta.greeting}
        </p>
        <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed sm:text-lg" style={{ color: "var(--hero-ink-soft)", textShadow: "var(--hero-soft-shadow)", animation: "sunrise-in 1.1s 0.45s ease both" }}>
          A student programmer learning in public — building browser games, web apps and the occasional experiment, with my own code and a little vibe-coding on the side.
        </p>

        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row" style={{ animation: "sunrise-in 1.1s 0.6s ease both" }}>
          <a href="#about" className="btn-neon text-base sm:text-lg">
            Explore My World <span aria-hidden="true">↓</span>
          </a>
          <a href="#projects" className="btn-ghost hero-ghost">
            See the projects
          </a>
        </div>

        {choice !== "auto" && (
          <button
            type="button"
            onClick={() => setChoice("auto")}
            className="mt-4 rounded-full border px-3 py-1 font-mono text-xs underline-offset-4 hover:underline"
            style={{ background: "var(--pill-bg)", borderColor: "var(--pill-border)", color: "var(--hero-ink)" }}
          >
            Previewing {meta.label.toLowerCase()} · back to my clock ({PHASE_META[realPhase].label.toLowerCase()})
          </button>
        )}
      </div>

      {/* transition into the page */}
      <svg className="absolute inset-x-0 bottom-[-1px] z-[6] block h-[46px] w-full" viewBox="0 0 1440 46" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M0 24 C 120 4 240 4 360 22 S 600 44 720 24 S 960 2 1080 22 S 1320 40 1440 20 V46 H0 Z" style={{ fill: "var(--page-1)" }} />
      </svg>
    </header>
  );
}
