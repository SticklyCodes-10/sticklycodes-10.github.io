import { memo, type CSSProperties } from "react";

const FROND = "M0 0 C 36 -46 118 -52 176 6 C 120 -16 52 -14 0 8 Z";
const RIB = "M0 3 C 50 -30 120 -30 170 8";
const ANGLES = [-100, -72, -44, -16, 14, 44, 74];

export const Palm = memo(function Palm({ className, style, speed = 7, flip = false }: { className?: string; style?: CSSProperties; speed?: number; flip?: boolean }) {
  return (
    <div className={`anim-sway pointer-events-none ${className ?? ""}`} style={{ ...style, ["--sway" as string]: `${speed}s`, transform: flip ? "scaleX(-1)" : undefined }} aria-hidden="true">
      <svg viewBox="0 0 380 580" className="block h-full w-auto overflow-visible" focusable="false">
        <path d="M146 580 C 156 440, 172 300, 224 130 L 240 132 C 198 300, 198 440, 184 580 Z" style={{ fill: "var(--palm)" }} />
        <path d="M165 580 C 176 440, 186 300, 232 131" fill="none" strokeWidth="13" strokeDasharray="2 13" style={{ stroke: "var(--palm-hi)", opacity: 0.4 }} />
        <g transform="translate(232 130)">
          {[1, -1].map((side) =>
            ANGLES.map((a, i) => (
              <g key={`${side}-${a}`} transform={`scale(${side * (0.82 + ((i * 7) % 5) * 0.07)} ${0.82 + ((i * 7) % 5) * 0.07}) rotate(${a})`}>
                <g className="anim-frond" style={{ ["--fd" as string]: `${4 + ((i * 3) % 4)}s`, ["--dl" as string]: `-${i * 0.7}s` }}>
                  <path d={FROND} style={{ fill: "var(--palm)" }} />
                  <path d={RIB} fill="none" strokeWidth="2" strokeLinecap="round" style={{ stroke: "var(--palm-hi)", opacity: 0.55 }} />
                </g>
              </g>
            )),
          )}
          <circle cx="-6" cy="12" r="9" style={{ fill: "var(--palm-hi)", opacity: 0.7 }} />
          <circle cx="8" cy="14" r="9" style={{ fill: "var(--palm-hi)", opacity: 0.7 }} />
          <circle cx="0" cy="24" r="8" style={{ fill: "var(--palm-hi)", opacity: 0.7 }} />
        </g>
      </svg>
    </div>
  );
});

const LEAF = "M0 0 C 14 -46 62 -86 120 -96 C 96 -52 56 -16 0 0 Z";
const LEAF_ANGLES = [-62, -40, -18, 4, 26];

export const Bush = memo(function Bush({ className, style, speed = 6 }: { className?: string; style?: CSSProperties; speed?: number }) {
  return (
    <div className={`anim-sway pointer-events-none ${className ?? ""}`} style={{ ...style, ["--sway" as string]: `${speed}s` }} aria-hidden="true">
      <svg viewBox="-150 -110 300 120" className="block h-full w-auto overflow-visible" focusable="false">
        {[1, -1].map((side) =>
          LEAF_ANGLES.map((a, i) => (
            <g key={`${side}-${a}`} transform={`scale(${side * (0.9 + (i % 3) * 0.12)} ${0.9 + (i % 3) * 0.12}) rotate(${a})`}>
              <g className="anim-frond" style={{ ["--fd" as string]: `${3.5 + i}s`, ["--dl" as string]: `-${i * 0.9}s` }}>
                <path d={LEAF} style={{ fill: "var(--palm)" }} />
                <path d="M0 0 C 40 -30 80 -60 114 -92" fill="none" strokeWidth="1.8" style={{ stroke: "var(--palm-hi)", opacity: 0.6 }} />
              </g>
            </g>
          )),
        )}
      </svg>
    </div>
  );
});
