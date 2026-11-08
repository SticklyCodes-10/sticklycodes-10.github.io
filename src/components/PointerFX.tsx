import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../hooks/useMotion";

const INTERACTIVE = "a, button, [role='button'], input, textarea, summary, label, [data-cursor]";

/**
 * Desktop: a neon dot + trailing ring that swells over interactive things.
 * Touch: tapping the page sends a small ripple across the water.
 */
export function PointerFX() {
  const reduced = usePrefersReducedMotion();
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (reduced) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let raf = 0;
    let tx = -100;
    let ty = -100;
    let rx = -100;
    let ry = -100;
    let hot = false;
    let idc = 0;

    const loop = () => {
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${hot ? 1.7 : 1})`;
      raf = requestAnimationFrame(loop);
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !fine) return;
      if (!document.documentElement.classList.contains("has-custom-cursor")) {
        document.documentElement.classList.add("has-custom-cursor");
        rx = e.clientX;
        ry = e.clientY;
        if (dot.current) dot.current.style.opacity = "1";
        if (ring.current) ring.current.style.opacity = "1";
        raf = requestAnimationFrame(loop);
      }
      tx = e.clientX;
      ty = e.clientY;
      hot = !!(e.target as Element | null)?.closest?.(INTERACTIVE);
    };
    const leave = () => {
      if (dot.current) dot.current.style.opacity = "0";
      if (ring.current) ring.current.style.opacity = "0";
    };
    const enter = () => {
      if (document.documentElement.classList.contains("has-custom-cursor")) {
        if (dot.current) dot.current.style.opacity = "1";
        if (ring.current) ring.current.style.opacity = "1";
      }
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const id = ++idc;
      setRipples((r) => [...r.slice(-4), { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 900);
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    document.documentElement.addEventListener("mouseenter", enter);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.documentElement.removeEventListener("mouseenter", enter);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [reduced]);

  if (reduced) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden" aria-hidden="true">
      <div ref={ring} className="absolute left-0 top-0 h-9 w-9 rounded-full border-[1.5px] border-cyan opacity-0 transition-[opacity,scale] duration-200" style={{ boxShadow: "0 0 14px rgba(66,232,255,0.7), inset 0 0 10px rgba(66,232,255,0.35)", mixBlendMode: "screen" }} />
      <div ref={dot} className="absolute left-0 top-0 h-2 w-2 rounded-full bg-pink opacity-0" style={{ boxShadow: "0 0 12px 3px rgba(255,92,154,0.9)" }} />
      {ripples.map((r) => (
        <span key={r.id} className="absolute h-40 w-40 rounded-full border-2 border-cyan" style={{ left: r.x, top: r.y, animation: "ripple 0.9s ease-out forwards", boxShadow: "0 0 24px rgba(66,232,255,0.6), inset 0 0 24px rgba(255,92,154,0.4)" }} />
      ))}
    </div>
  );
}
