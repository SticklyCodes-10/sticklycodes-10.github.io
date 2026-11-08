import { useEffect, useState } from "react";
import { PHASE_META, usePhase, type Phase, type PhaseChoice } from "../hooks/phase";
import { useActiveSection } from "../hooks/useMotion";
import { cn } from "../utils/cn";

export const SECTIONS = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "stack", label: "Stack" },
  { id: "activity", label: "Activity" },
  { id: "journey", label: "Journey" },
  { id: "contact", label: "Contact" },
];

const CHOICES: { id: PhaseChoice; label: string; emoji: string }[] = [
  { id: "auto", label: "Auto", emoji: "⟲" },
  ...(["morning", "afternoon", "evening", "night"] as Phase[]).map((p) => ({ id: p as PhaseChoice, label: PHASE_META[p].label, emoji: PHASE_META[p].emoji })),
];

export function SkySwitch({ className }: { className?: string }) {
  const { choice, setChoice, realPhase } = usePhase();
  return (
    <div role="group" aria-label="Sky preview: follow my clock or preview a time of day" className={cn("inline-flex items-center gap-0.5 rounded-full border border-white/15 bg-black/20 p-0.5", className)}>
      {CHOICES.map((c) => {
        const on = choice === c.id;
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={on}
            title={c.id === "auto" ? `Follow my clock (now: ${PHASE_META[realPhase].label})` : `Preview ${c.label} · ${PHASE_META[c.id as Phase].range}`}
            onClick={() => setChoice(c.id)}
            className={cn(
              "grid h-8 min-w-8 place-items-center rounded-full px-2 text-sm transition",
              on ? "bg-gradient-to-br from-pink to-purple text-white shadow-[0_0_14px_rgba(255,92,154,0.7)]" : "text-white/80 hover:bg-white/10",
            )}
          >
            <span aria-hidden="true">{c.emoji}</span>
            <span className="sr-only">{c.id === "auto" ? "Auto (my clock)" : c.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const active = useActiveSection(SECTIONS.map((s) => s.id));
  const { phase } = usePhase();

  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? window.scrollY / max : 0);
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <a href="#main" className="sr-only z-[90] rounded-lg bg-white px-4 py-2 font-semibold text-midnight focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <nav aria-label="Primary" className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
        <div
          className={cn(
            "mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border px-3 py-2 text-white transition-all duration-500 sm:px-4",
            scrolled || open ? "border-white/15 bg-midnight/70 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl" : "border-white/10 bg-midnight/35 backdrop-blur-md",
          )}
        >
          <a href="#top" className="group flex items-center gap-2 pl-1 font-display text-lg tracking-wider" aria-label="SticklyCodes-10 — back to the top">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-orange via-pink to-purple text-[0.8rem] shadow-[0_0_16px_rgba(255,92,154,0.7)] transition group-hover:rotate-[20deg]" aria-hidden="true">
              S
            </span>
            <span className="neon-pink hidden sm:inline">Stickly</span>
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={active === s.id ? "true" : undefined}
                  className={cn("group relative block rounded-full px-3.5 py-2 text-sm font-medium tracking-wide transition", active === s.id ? "text-white" : "text-white/75 hover:text-white")}
                >
                  {s.label}
                  <span
                    className={cn(
                      "absolute inset-x-3.5 -bottom-0.5 h-[2px] origin-left rounded-full bg-gradient-to-r from-cyan to-pink shadow-[0_0_10px_#42e8ff] transition-transform duration-500",
                      active === s.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50",
                    )}
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <SkySwitch className="hidden md:inline-flex" />
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/5 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative block h-3.5 w-5" aria-hidden="true">
                <span className={cn("absolute left-0 h-0.5 w-5 rounded bg-white transition-all", open ? "top-1.5 rotate-45" : "top-0")} />
                <span className={cn("absolute left-0 top-1.5 h-0.5 w-5 rounded bg-white transition-opacity", open && "opacity-0")} />
                <span className={cn("absolute left-0 h-0.5 w-5 rounded bg-white transition-all", open ? "top-1.5 -rotate-45" : "top-3")} />
              </span>
            </button>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-6 bottom-[-6px] h-[3px] overflow-hidden rounded-full sm:inset-x-10" aria-hidden="true">
          <div className="h-full origin-left rounded-full bg-gradient-to-r from-orange via-pink to-cyan" style={{ transform: `scaleX(${progress})`, opacity: scrolled ? 1 : 0, transition: "opacity .4s" }} />
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 z-40 flex flex-col justify-center bg-midnight/92 px-8 backdrop-blur-2xl transition-all duration-500 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
        aria-hidden={!open}
      >
        <ul className="space-y-1">
          {SECTIONS.map((s, i) => (
            <li key={s.id} style={{ transitionDelay: open ? `${i * 55}ms` : "0ms" }} className={cn("transition-all duration-500", open ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-0")}>
              <a href={`#${s.id}`} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} className={cn("font-display block py-2 text-4xl tracking-wide", active === s.id ? "neon-pink" : "text-white/85")}>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-white/60">Sky · now: {PHASE_META[phase].label}</p>
          <SkySwitch />
        </div>
      </div>
    </>
  );
}
