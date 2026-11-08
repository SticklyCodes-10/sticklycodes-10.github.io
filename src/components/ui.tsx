import type { ReactNode } from "react";
import { Reveal } from "../hooks/useMotion";
import { cn } from "../utils/cn";

export function SectionHeading({
  kicker,
  title,
  sub,
  tone = "pink",
  id,
}: {
  kicker: string;
  title: string;
  sub?: ReactNode;
  tone?: "pink" | "cyan" | "sunset";
  id: string;
}) {
  return (
    <Reveal className="mb-12 max-w-3xl sm:mb-16">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-cyan sm:text-sm">{kicker}</p>
      <h2
        id={id}
        className={cn("font-display text-[2.4rem] leading-[1.02] sm:text-6xl", tone === "pink" && "neon-pink", tone === "cyan" && "neon-cyan", tone === "sunset" && "text-sunset")}
      >
        {title}
      </h2>
      {sub && <p className="mt-4 text-pretty text-base leading-relaxed text-white/80 sm:text-lg">{sub}</p>}
    </Reveal>
  );
}

/** Shows whether a statement is read straight from GitHub or is my reading of it. */
export function Evidence({ kind, className }: { kind: "verified" | "interpretation" | "unavailable"; className?: string }) {
  const map = {
    verified: { t: "Verified · GitHub", c: "border-cyan/50 bg-cyan/10 text-cyan", i: "✓" },
    interpretation: { t: "Interpretation", c: "border-orange/50 bg-orange/10 text-orange", i: "✎" },
    unavailable: { t: "Not available", c: "border-white/30 bg-white/5 text-white/70", i: "∅" },
  }[kind];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-wider", map.c, className)}>
      <span aria-hidden="true">{map.i}</span>
      {map.t}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} role="presentation" />;
}

export function ErrorNote({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div role="status" className="flex flex-wrap items-center gap-3 rounded-2xl border border-orange/40 bg-orange/10 px-4 py-3 text-sm text-sand">
      <span aria-hidden="true">🌴</span>
      <span className="flex-1">{children}</span>
      {action}
    </div>
  );
}

/** Wavy divider that takes its colour from the current atmosphere. */
export function WaveDivider({ flip = false, className }: { flip?: boolean; className?: string }) {
  return (
    <svg className={cn("pointer-events-none block h-10 w-full sm:h-16", flip && "rotate-180", className)} viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M0 30 C 160 0 320 0 480 26 S 800 60 960 30 S 1280 2 1440 28 V60 H0 Z" fill="rgba(66,232,255,0.07)" />
      <path d="M0 40 C 200 14 360 18 520 40 S 880 64 1040 38 S 1320 14 1440 40 V60 H0 Z" fill="rgba(255,92,154,0.07)" />
    </svg>
  );
}
