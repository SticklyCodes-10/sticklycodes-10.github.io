import { memo, type CSSProperties } from "react";

const WAVE_PATH = (() => {
  let d = "M0 60";
  d += " Q150 18 300 60";
  for (let x = 600; x <= 2400; x += 300) d += ` T${x} 60`;
  return d + " V120 H0 Z";
})();

/** Seamless sliding wave: path period divides the 50% translate, so the loop never jumps. */
export const Wave = memo(function Wave({
  fill,
  dur = 24,
  bob = 5,
  reverse = false,
  className,
  style,
}: {
  fill: string;
  dur?: number;
  bob?: number;
  reverse?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 overflow-hidden anim-bob ${className ?? ""}`} style={{ ...style, ["--bob" as string]: `${bob}s` }} aria-hidden="true">
      <div className="anim-wave h-full" style={{ width: "200%", ["--dur" as string]: `${dur}s`, animationDirection: reverse ? "reverse" : "normal" }}>
        <svg viewBox="0 0 2400 120" preserveAspectRatio="none" className="block h-full w-full" focusable="false">
          <path d={WAVE_PATH} style={{ fill }} />
        </svg>
      </div>
    </div>
  );
});

/** Light dashes shimmering under the sun / moon. */
export const Glitter = memo(function Glitter() {
  const dashes = Array.from({ length: 20 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute top-0 h-[70%] w-0" style={{ left: "var(--sun-x)", opacity: "var(--glitter-o)" }} aria-hidden="true">
      {dashes.map((i) => (
        <span
          key={i}
          className="absolute block h-[2px] rounded-full"
          style={{
            top: `${i * 5 + (i % 3)}%`,
            left: `${((i * 37) % 17) - 8}px`,
            width: `${14 + i * 6}px`,
            marginLeft: `${-(14 + i * 6) / 2}px`,
            background: "var(--glitter)",
            animation: `glitter ${1.6 + (i % 5) * 0.45}s ease-in-out ${-(i * 0.37)}s infinite`,
          }}
        />
      ))}
    </div>
  );
});

export const RetroGrid = memo(function RetroGrid() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-full overflow-hidden" style={{ opacity: "var(--grid-o)", perspective: "260px" }} aria-hidden="true">
      <div
        className="retro-grid absolute left-[-50%] top-[18%] h-[260%] w-[200%] origin-top"
        style={{
          transform: "rotateX(68deg)",
          WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 60%)",
          maskImage: "linear-gradient(180deg, transparent 0%, #000 60%)",
        }}
      />
    </div>
  );
});
