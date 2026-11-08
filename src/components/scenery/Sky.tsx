import { memo } from "react";

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

const STARS = (() => {
  const r = rng(2024);
  return Array.from({ length: 90 }, () => ({
    left: r() * 100,
    top: r() * 58,
    size: 1 + r() * 2.2,
    dur: 2.5 + r() * 4,
    delay: -r() * 6,
    pink: r() > 0.86,
  }));
})();

export const Stars = memo(function Stars() {
  return (
    <div className="pointer-events-none absolute inset-0" style={{ opacity: "var(--star-o)" }} aria-hidden="true">
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: s.pink ? "#ffb3d1" : "#ffffff",
            boxShadow: `0 0 ${s.size * 3}px ${s.pink ? "#ff5c9a" : "#bfe9ff"}`,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
      {[{ top: "10%", left: "78%", delay: "2s" }, { top: "22%", left: "95%", delay: "9s" }].map((s, i) => (
        <span
          key={i}
          className="absolute block h-[2px] w-24 rounded-full"
          style={{
            top: s.top,
            left: s.left,
            background: "linear-gradient(90deg, #fff, transparent)",
            opacity: 0,
            animation: `shoot 14s linear ${s.delay} infinite`,
            filter: "drop-shadow(0 0 6px #42e8ff)",
          }}
        />
      ))}
    </div>
  );
});

const CLOUDS = [
  { cx: 6, top: 14, scale: 1.25, dur: 190, delay: -40, o: 0.9 },
  { cx: 38, top: 26, scale: 0.8, dur: 240, delay: -150, o: 0.7 },
  { cx: 62, top: 9, scale: 1, dur: 210, delay: -90, o: 0.8 },
  { cx: 82, top: 31, scale: 0.65, dur: 280, delay: -210, o: 0.6 },
  { cx: 20, top: 38, scale: 0.9, dur: 260, delay: -20, o: 0.55 },
];

export const Clouds = memo(function Clouds() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: "var(--cloud-o)" }} aria-hidden="true">
      {CLOUDS.map((c, i) => (
        <svg
          key={i}
          viewBox="0 0 200 70"
          className="cloud absolute"
          focusable="false"
          style={{
            top: `${c.top}%`,
            left: `${c.cx}vw`,
            ["--cx" as string]: `${c.cx}vw`,
            width: `${220 * c.scale}px`,
            opacity: c.o,
            animation: `cloud-drift ${c.dur}s linear ${c.delay}s infinite`,
            filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.12))",
          }}
        >
          <g style={{ fill: "var(--cloud)" }}>
            <circle cx="52" cy="42" r="22" />
            <circle cx="88" cy="30" r="28" />
            <circle cx="128" cy="38" r="24" />
            <circle cx="158" cy="46" r="16" />
            <rect x="30" y="42" width="140" height="20" rx="10" />
          </g>
        </svg>
      ))}
    </div>
  );
});

/** Retro sun (with scan-line slits) and a moon. Position comes from CSS variables, so the phase change glides. */
export const SunMoon = memo(function SunMoon() {
  const size = "clamp(120px, 17vw, 230px)";
  const bottom = (h: string) => `calc(var(--S) * 0.5 + var(${h}) * (100svh - var(--S) * 0.5 - 300px) - ${size} * 0.35)`;
  return (
    <>
      <div
        className="pointer-events-none absolute -translate-x-1/2 rounded-full"
        style={{
          left: "var(--sun-x)",
          bottom: bottom("--sun-h"),
          width: size,
          height: size,
          opacity: "var(--sun-o)",
          background: "radial-gradient(circle at 50% 35%, var(--sun-1), var(--sun-2) 78%)",
          boxShadow: "0 0 70px 18px var(--sun-glow)",
        }}
        aria-hidden="true"
      >
        <div className="pointer-events-none absolute -inset-[45%] rounded-full" style={{ background: "radial-gradient(circle, var(--sun-glow) 0%, transparent 62%)", opacity: 0.55 }} />
        <div className="sun-slits absolute inset-0 rounded-full" />
      </div>
      <div
        className="pointer-events-none absolute -translate-x-1/2 rounded-full"
        style={{
          left: "var(--sun-x)",
          bottom: bottom("--moon-h"),
          width: `calc(${size} * 0.55)`,
          height: `calc(${size} * 0.55)`,
          opacity: "var(--moon-o)",
          background: "radial-gradient(circle at 36% 34%, #ffffff, #dfe8ff 55%, #aebcf0)",
          boxShadow: "0 0 40px 10px rgba(190,210,255,0.55), 0 0 140px 50px rgba(139,92,246,0.35)",
        }}
        aria-hidden="true"
      >
        <span className="absolute left-[58%] top-[22%] h-[16%] w-[16%] rounded-full bg-[#9aa8dd]/40" />
        <span className="absolute left-[30%] top-[56%] h-[22%] w-[22%] rounded-full bg-[#9aa8dd]/35" />
        <span className="absolute left-[64%] top-[60%] h-[11%] w-[11%] rounded-full bg-[#9aa8dd]/40" />
      </div>
    </>
  );
});
