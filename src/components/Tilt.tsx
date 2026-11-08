import { useRef, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { usePrefersReducedMotion } from "../hooks/useMotion";
import { cn } from "../utils/cn";

/** Pointer-driven 3D tilt with a soft light that follows the cursor. Touch & reduced-motion: no tilt. */
export function Tilt({ children, className, style, max = 7 }: { children: ReactNode; className?: string; style?: CSSProperties; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const move = (e: RPointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${((0.5 - py) * max * 2).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((px - 0.5) * max * 2).toFixed(2)}deg`);
    el.style.setProperty("--px", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--py", `${(py * 100).toFixed(1)}%`);
  };
  const leave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={cn("group relative", className)}
      style={{ transform: "perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))", transition: "transform .25s ease-out", transformStyle: "preserve-3d", ...style }}
    >
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--px, 50%) var(--py, 50%), rgba(255,255,255,0.16), transparent 45%)" }}
      />
    </div>
  );
}
