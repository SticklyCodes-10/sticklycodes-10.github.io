import { memo } from "react";

/* Deterministic generator so the skyline never changes between renders. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

const W = 1600;
const H = 260;

type Kind = "box" | "stepped" | "spire" | "dome" | "slant" | "taper";
interface Building {
  x: number;
  w: number;
  h: number;
  kind: Kind;
  neon?: "pink" | "cyan";
}

function build() {
  const r = rng(7);
  const near: Building[] = [];
  const landmarks: Record<number, Partial<Building>> = {
    2: { kind: "stepped", h: 215, neon: "pink" },
    7: { kind: "spire", h: 235, neon: "cyan" },
    20: { kind: "dome", h: 190, neon: "pink" },
    24: { kind: "taper", h: 225, neon: "cyan" },
    26: { kind: "slant", h: 175, neon: "pink" },
  };
  let x = -10;
  let i = 0;
  while (x < W) {
    const w = 38 + Math.floor(r() * 40);
    const c = Math.abs(x + w / 2 - W / 2) / (W / 2); // 0 centre → 1 edge
    const base = 52 + Math.pow(c, 1.5) * 110;
    let h = base + r() * 52;
    if (c < 0.2) h = Math.min(h, 92); // keep the middle low so the headline has room
    const kinds: Kind[] = ["box", "box", "stepped", "slant", "taper", "spire"];
    const b: Building = { x, w, h, kind: kinds[Math.floor(r() * kinds.length)], neon: r() > 0.62 ? (r() > 0.5 ? "pink" : "cyan") : undefined };
    const lm = landmarks[i];
    if (lm) Object.assign(b, lm);
    near.push(b);
    x += w + 2 + Math.floor(r() * 7);
    i++;
  }
  const far: Building[] = [];
  x = -20;
  while (x < W) {
    const w = 46 + Math.floor(r() * 56);
    const c = Math.abs(x + w / 2 - W / 2) / (W / 2);
    far.push({ x, w, h: 50 + Math.pow(c, 1.2) * 70 + r() * 40, kind: r() > 0.7 ? "stepped" : "box" });
    x += w - 6;
  }
  return { near, far };
}

const { near, far } = build();

function shape(b: Building) {
  const y = H - b.h;
  const { x, w } = b;
  switch (b.kind) {
    case "stepped":
      return (
        <>
          <rect x={x} y={y + b.h * 0.35} width={w} height={b.h * 0.65} />
          <rect x={x + w * 0.14} y={y + b.h * 0.15} width={w * 0.72} height={b.h * 0.3} />
          <rect x={x + w * 0.3} y={y} width={w * 0.4} height={b.h * 0.2} />
          <rect x={x + w * 0.48} y={y - 22} width={3} height={24} />
        </>
      );
    case "spire":
      return (
        <>
          <rect x={x} y={y} width={w} height={b.h} />
          <polygon points={`${x + w * 0.2},${y} ${x + w * 0.5},${y - 26} ${x + w * 0.8},${y}`} />
          <rect x={x + w / 2 - 1.5} y={y - 56} width={3} height={32} />
        </>
      );
    case "dome":
      return (
        <>
          <rect x={x} y={y + w * 0.3} width={w} height={b.h - w * 0.3} />
          <ellipse cx={x + w / 2} cy={y + w * 0.32} rx={w / 2} ry={w * 0.34} />
          <rect x={x + w / 2 - 1.5} y={y - 14} width={3} height={22} />
        </>
      );
    case "slant":
      return <polygon points={`${x},${H} ${x},${y + 36} ${x + w},${y} ${x + w},${H}`} />;
    case "taper":
      return (
        <>
          <polygon points={`${x},${H} ${x + w * 0.1},${y + 26} ${x + w * 0.5},${y} ${x + w * 0.9},${y + 26} ${x + w},${H}`} />
          <rect x={x + w / 2 - 1.5} y={y - 34} width={3} height={36} />
        </>
      );
    default:
      return <rect x={x} y={y} width={w} height={b.h} />;
  }
}

/* Windows – all steady ones in one path, flickering ones as separate rects. */
const winPath: string[] = [];
const flicker: { x: number; y: number; d: number }[] = [];
(() => {
  const r = rng(99);
  near.forEach((b) => {
    if (b.w < 34) return;
    const cols = Math.max(2, Math.floor((b.w - 12) / 9));
    const rows = Math.floor((b.h - 28) / 13);
    const x0 = b.x + (b.w - cols * 9 + 4) / 2;
    for (let c = 0; c < cols; c++)
      for (let ro = 0; ro < rows; ro++) {
        if (r() > 0.4) continue;
        const wx = x0 + c * 9;
        const wy = H - b.h + 18 + ro * 13;
        if (r() > 0.93) flicker.push({ x: wx, y: wy, d: r() * 7 });
        else winPath.push(`M${wx.toFixed(1)} ${wy.toFixed(1)}h4v6h-4z`);
      }
  });
})();

export const Skyline = memo(function Skyline({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
      <g style={{ fill: "var(--skyline-far)" }}>{far.map((b, i) => <g key={i}>{shape(b)}</g>)}</g>
      <g style={{ fill: "var(--skyline)" }}>{near.map((b, i) => <g key={i}>{shape(b)}</g>)}</g>
      <path d={winPath.join("")} style={{ fill: "var(--window)", opacity: "calc(var(--win-o) * 0.8)" }} />
      <g style={{ fill: "var(--window)", opacity: "var(--win-o)" }}>
        {flicker.map((f, i) => (
          <rect key={i} x={f.x} y={f.y} width={4} height={6} className="win-flicker" style={{ animationDelay: `-${f.d}s` }} />
        ))}
      </g>
      <g style={{ opacity: "var(--neon-o)", filter: "drop-shadow(0 0 5px currentColor)" }}>
        {near
          .filter((b) => b.neon)
          .map((b, i) => (
            <g key={i} style={{ color: b.neon === "pink" ? "#ff5c9a" : "#42e8ff" }} fill="currentColor">
              <rect x={b.x} y={H - b.h + (b.kind === "slant" ? 0 : 0)} width={b.w} height={2.5} opacity={b.kind === "dome" ? 0 : 1} />
              <rect x={b.x + b.w - 3} y={H - b.h + 6} width={2} height={Math.min(b.h - 12, 70)} opacity={0.9} />
            </g>
          ))}
        {/* aircraft-warning beacons */}
        {[7, 24, 2].map((i) => {
          const b = near[i];
          if (!b) return null;
          return <circle key={i} cx={b.x + b.w / 2} cy={H - b.h - (b.kind === "spire" ? 56 : b.kind === "taper" ? 34 : 22)} r={2.4} fill="#ff3b6b" className="win-flicker" />;
        })}
      </g>
    </svg>
  );
});
