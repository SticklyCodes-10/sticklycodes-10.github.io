import { useEffect, useState } from "react";
import { PHASE_META, usePhase } from "../hooks/phase";
import { usePrefersReducedMotion } from "../hooks/useMotion";

/** A short neon "welcome" sign that fades out into the beach scene. */
export function Splash() {
  const reduced = usePrefersReducedMotion();
  const { phase } = usePhase();
  const [stage, setStage] = useState<"show" | "leave" | "gone">(reduced ? "gone" : "show");

  useEffect(() => {
    if (reduced) return;
    const a = window.setTimeout(() => setStage("leave"), 1300);
    const b = window.setTimeout(() => setStage("gone"), 2100);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [reduced]);

  if (stage === "gone") return null;
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[150] grid place-items-center bg-midnight transition-all duration-700"
      style={{ opacity: stage === "leave" ? 0 : 1, transform: stage === "leave" ? "scale(1.06)" : "none", pointerEvents: stage === "leave" ? "none" : "auto", background: "radial-gradient(circle at 50% 60%, #2a1163, #071b2d 70%)" }}
    >
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.6em] text-cyan">{PHASE_META[phase].emoji} entering</p>
        <p className="font-display neon-pink anim-flicker mt-3 text-5xl sm:text-7xl">Miami</p>
        <div className="mx-auto mt-5 h-1 w-40 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan via-pink to-orange" style={{ animation: "shimmer 1.2s linear infinite", backgroundSize: "200% 100%" }} />
        </div>
      </div>
    </div>
  );
}
