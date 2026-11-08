import { useId } from "react";
import type { ArtKind } from "../lib/analysis";

/** Each repository gets its own little illustrated scene, tinted by its accent colours. */
export function ProjectArt({ kind, a, b, className }: { kind: ArtKind; a: string; b: string; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const g = `g${id}`;
  return (
    <svg viewBox="0 0 400 200" className={className} preserveAspectRatio="xMidYMid slice" role="presentation" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <linearGradient id={`${g}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill={`url(#${g})`} />
      <rect width="400" height="200" fill="#071b2d" opacity="0.28" />

      {kind === "arcade" && (
        <g>
          <circle cx="300" cy="96" r="50" fill={`url(#${g}f)`} opacity="0.9" />
          {[78, 92, 106, 120].map((y, i) => (
            <rect key={y} x="240" y={y} width="120" height={2 + i} fill="#071b2d" opacity="0.45" />
          ))}
          <g stroke="#fff" strokeOpacity="0.45" strokeWidth="1.2">
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1="0" x2="400" y1={150 + i * i * 3.2} y2={150 + i * i * 3.2} />
            ))}
            {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={200 + i * 16} y1="150" x2={200 + i * 70} y2="200" />
            ))}
          </g>
          {/* flying ragdoll */}
          <path d="M60 170 Q110 20 170 62" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="4 7" opacity="0.75" />
          <g stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" transform="rotate(28 170 78)">
            <circle cx="170" cy="58" r="12" fill="#fff" />
            <line x1="170" y1="70" x2="170" y2="104" />
            <line x1="170" y1="80" x2="150" y2="94" />
            <line x1="170" y1="80" x2="192" y2="70" />
            <line x1="170" y1="104" x2="154" y2="128" />
            <line x1="170" y1="104" x2="188" y2="124" />
          </g>
          <polygon points="76,40 88,52 104,42 102,60 122,62 106,72 116,90 96,82 84,98 80,80 62,78 76,66" fill="#ffe27a" stroke="#071b2d" strokeWidth="2" />
          <text x="68" y="75" fontSize="15" fontWeight="800" fill="#071b2d" fontFamily="Outfit, sans-serif" transform="rotate(-8 90 70)">POW!</text>
        </g>
      )}

      {kind === "screen" && (
        <g>
          <rect x="60" y="30" width="280" height="150" rx="14" fill="#071b2d" opacity="0.88" stroke="#fff" strokeOpacity="0.5" />
          <rect x="60" y="30" width="280" height="22" rx="14" fill="#fff" opacity="0.12" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={78 + i * 16} cy="41" r="4" fill={["#ff5c9a", "#ff9e57", "#42e8ff"][i]} />
          ))}
          <rect x="74" y="62" width="252" height="52" rx="8" fill={`url(#${g})`} />
          <polygon points="188,76 188,100 208,88" fill="#fff" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={74 + i * 86} y="124" width="80" height="44" rx="7" fill="#fff" opacity={0.14 + i * 0.05} />
          ))}
          <path d="M300 128 L300 158 L308 151 L314 164 L320 161 L314 148 L324 148 Z" fill="#fff" stroke="#071b2d" strokeWidth="1.5" />
          <g fill="#fff" opacity="0.75">
            <circle cx="40" cy="60" r="3" />
            <circle cx="366" cy="150" r="4" />
            <circle cx="372" cy="50" r="2.4" />
          </g>
        </g>
      )}

      {kind === "prism" && (
        <g>
          <line x1="0" y1="112" x2="168" y2="104" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.95" />
          {["#ff5c9a", "#ff9e57", "#ffe27a", "#9be86a", "#42e8ff", "#8b5cf6"].map((c, i) => (
            <line key={c} x1="206" y1="104" x2="400" y2={40 + i * 24} stroke={c} strokeWidth="5" strokeLinecap="round" opacity="0.9" />
          ))}
          <polygon points="200,36 258,148 142,148" fill="#fff" fillOpacity="0.22" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="200,56 238,134 162,134" fill="#fff" fillOpacity="0.1" />
          <g fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.5">
            <rect x="40" y="30" width="22" height="22" rx="3" transform="rotate(18 51 41)" />
            <rect x="330" y="160" width="18" height="18" rx="3" transform="rotate(-14 339 169)" />
          </g>
        </g>
      )}

      {kind === "terminal" && (
        <g>
          <rect x="40" y="34" width="250" height="132" rx="12" fill="#050f1c" opacity="0.92" stroke="#fff" strokeOpacity="0.45" />
          <rect x="40" y="34" width="250" height="20" rx="12" fill="#fff" opacity="0.12" />
          <g fontFamily="'Space Mono', monospace" fontSize="11" fill="#42e8ff">
            <text x="54" y="76">C:\&gt; whoami</text>
            <text x="54" y="94" fill="#ffe4bd">STATUS: Online</text>
            <text x="54" y="112" fill="#ffe4bd">LOCATION: /dev/null</text>
            <text x="54" y="130" fill="#ff9e57">SUDO_ACCESS: Pending</text>
            <text x="54" y="150">C:\&gt; </text>
          </g>
          <rect x="94" y="141" width="8" height="12" fill="#ff5c9a" className="anim-flicker" />
          <circle cx="340" cy="70" r="26" fill="#fff" opacity="0.8" />
          <path d="M310 190 C 322 140, 330 110, 352 88" stroke="#071b2d" strokeWidth="6" fill="none" opacity="0.85" />
          {[-70, -35, 0, 35, 70].map((r) => (
            <path key={r} d="M352 88 q22 -14 40 4" stroke="#071b2d" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.85" transform={`rotate(${r} 352 88)`} />
          ))}
        </g>
      )}

      {kind === "generic" && (
        <g>
          <circle cx="280" cy="96" r="42" fill={`url(#${g}f)`} />
          <path d="M0 140 Q50 120 100 140 T200 140 T300 140 T400 140 V200 H0Z" fill="#fff" opacity="0.28" />
          <path d="M0 160 Q50 142 100 160 T200 160 T300 160 T400 160 V200 H0Z" fill="#071b2d" opacity="0.4" />
        </g>
      )}
      <rect width="400" height="200" fill="none" stroke="#fff" strokeOpacity="0.12" />
    </svg>
  );
}
