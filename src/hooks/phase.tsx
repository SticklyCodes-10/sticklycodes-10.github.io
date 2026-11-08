import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Phase = "morning" | "afternoon" | "evening" | "night";
export type PhaseChoice = Phase | "auto";

/** Uses the visitor's own device clock — never a hard-coded timezone. Midnight falls inside "night". */
export function phaseFor(d: Date): Phase {
  const h = d.getHours() + d.getMinutes() / 60;
  if (h >= 5 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "afternoon";
  if (h >= 17 && h < 20) return "evening";
  return "night"; // 20:00 → 04:59, wraps around midnight
}

export const PHASE_META: Record<Phase, { label: string; emoji: string; greeting: string; aside: string; range: string }> = {
  morning: { label: "Sunrise", emoji: "🌅", greeting: "Good morning, beach explorer.", aside: "Peach skies, calm water, fresh coffee. The day is wide open.", range: "5 AM – 11 AM" },
  afternoon: { label: "Midday", emoji: "☀️", greeting: "Good afternoon, sunshine.", aside: "Turquoise water, loud colours, full energy.", range: "11 AM – 5 PM" },
  evening: { label: "Sunset", emoji: "🌇", greeting: "Good evening, Miami dreamer.", aside: "The skyline is switching its lights on, one window at a time.", range: "5 PM – 8 PM" },
  night: { label: "Nightlife", emoji: "🌙", greeting: "Late night? Let's build something extraordinary.", aside: "Neon on the water, stars overhead, terminal glowing.", range: "8 PM – 5 AM" },
};

interface PhaseCtx {
  now: Date;
  phase: Phase; // effective phase (override or real)
  realPhase: Phase;
  choice: PhaseChoice;
  setChoice: (c: PhaseChoice) => void;
  timeZone: string;
}

const Ctx = createContext<PhaseCtx | null>(null);
const KEY = "sc10:phase-choice";

export function PhaseProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(() => new Date());
  const [choice, setChoiceState] = useState<PhaseChoice>(() => {
    try {
      const v = sessionStorage.getItem(KEY);
      return v === "morning" || v === "afternoon" || v === "evening" || v === "night" ? v : "auto";
    } catch {
      return "auto";
    }
  });

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = window.setInterval(tick, 1000);
    const vis = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  const realPhase = phaseFor(now);
  const phase = choice === "auto" ? realPhase : choice;

  useEffect(() => {
    document.documentElement.dataset.phase = phase;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", phase === "night" ? "#071B2D" : phase === "evening" ? "#2A1050" : "#087CA7");
  }, [phase]);

  const value = useMemo<PhaseCtx>(
    () => ({
      now,
      phase,
      realPhase,
      choice,
      timeZone: (() => {
        try {
          return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {
          return "local time";
        }
      })(),
      setChoice: (c) => {
        setChoiceState(c);
        try {
          if (c === "auto") sessionStorage.removeItem(KEY);
          else sessionStorage.setItem(KEY, c);
        } catch {
          /* ignore */
        }
      },
    }),
    [now, phase, realPhase, choice],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePhase() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePhase must be used inside PhaseProvider");
  return v;
}
