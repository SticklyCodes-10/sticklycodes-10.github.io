import { useMemo, useState } from "react";
import { useGithub } from "../hooks/useGithub";
import { Reveal } from "../hooks/useMotion";
import { aggregateTech, languageTotals } from "../lib/derive";
import { CATEGORIES, techInfo, type Category } from "../lib/tech";
import { cn } from "../utils/cn";
import { Evidence, SectionHeading, Skeleton } from "./ui";

const SOURCE_TEXT = {
  language: "GitHub language stats",
  "package.json": "package.json dependencies",
  "repo files": "repository files",
} as const;

const EMPTY_NOTE: Partial<Record<Category, string>> = {
  Backend: "No server code lives in the public repos yet. Closest clue: editorweb's README describes a Node.js data-fetch script that was later deleted.",
  Databases: "No database technology appears in any public repository yet — this shelf stays honestly empty.",
};

function Glyph({ glyph, color, active }: { glyph: string; color: string; active: boolean }) {
  return (
    <span className="relative grid h-14 w-14 shrink-0 place-items-center" aria-hidden="true">
      <span className="absolute inset-0 rounded-full opacity-70" style={{ background: `conic-gradient(from 0deg, ${color}, transparent 40%, ${color})`, animation: `spin-slow ${active ? 3 : 9}s linear infinite`, filter: `drop-shadow(0 0 8px ${color})` }} />
      <span className="absolute inset-[3px] rounded-full bg-midnight" />
      <span className="relative text-sm font-bold" style={{ color, textShadow: `0 0 10px ${color}` }}>
        {glyph}
      </span>
    </span>
  );
}

export function TechStack() {
  const { data, status } = useGithub();
  const [cat, setCat] = useState<"all" | Category>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const model = useMemo(() => {
    if (!data) return null;
    const uses = aggregateTech(data);
    const original = languageTotals(data, false);
    const pct = new Map(original.list.map((l) => [l.name, l.pct]));
    const repoFork = new Map(data.repos.map((r) => [r.name, r.fork]));
    return CATEGORIES.map((c) => ({
      ...c,
      items: uses
        .filter((u) => techInfo(u.id).category === c.id)
        .map((u) => ({
          ...u,
          info: techInfo(u.id),
          pct: pct.get(u.id) ?? null,
          forkOnly: [...u.repos].every((r) => repoFork.get(r)),
        }))
        .sort((a, b) => Number(a.forkOnly) - Number(b.forkOnly) || (b.pct ?? -1) - (a.pct ?? -1) || b.repos.size - a.repos.size || a.info.label.localeCompare(b.info.label)),
    }));
  }, [data]);

  const shown = model?.filter((c) => cat === "all" || c.id === cat) ?? [];

  return (
    <section id="stack-section" aria-labelledby="stack-title" className="relative isolate overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(50% 40% at 15% 20%, rgba(255,92,154,0.18), transparent 70%), radial-gradient(50% 40% at 90% 80%, rgba(66,232,255,0.15), transparent 70%)" }} aria-hidden="true" />
      <div id="stack" className="mx-auto max-w-6xl px-5">
        <SectionHeading
          id="stack-title"
          kicker="04 · Tech Stack"
          title="My Creative Arsenal"
          tone="sunset"
          sub={
            <>
              Detected from the repositories themselves — language statistics, <code className="font-mono text-cyan">package.json</code> dependencies and the file tree. No self-rated skill percentages: the bars show only what share of the code in original repos is written in that language, not how good anyone is at it.
            </>
          }
        />

        <div role="group" aria-label="Filter technologies by category" className="no-scrollbar -mx-5 mb-10 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {[{ id: "all" as const, emoji: "🌴", count: model?.reduce((s, c) => s + c.items.length, 0) ?? 0 }, ...(model ?? CATEGORIES.map((c) => ({ ...c, items: [] }))).map((c) => ({ id: c.id, emoji: c.emoji, count: c.items.length }))].map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={cat === c.id}
              onClick={() => setCat(c.id)}
              className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition", cat === c.id ? "border-transparent bg-gradient-to-r from-pink to-orange text-midnight shadow-[0_0_24px_rgba(255,92,154,0.55)]" : "border-white/20 bg-white/5 text-white/85 hover:border-pink/70")}
            >
              <span aria-hidden="true">{c.emoji}</span> {c.id === "all" ? "Everything" : c.id} <span className="ml-1 font-mono text-xs opacity-70">{c.count}</span>
            </button>
          ))}
        </div>

        {status === "loading" || !model ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="Loading technologies">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : (
          <div className="space-y-14">
            {shown.map((c) => (
              <div key={c.id}>
                <Reveal className="mb-5 flex flex-wrap items-end gap-x-4 gap-y-1">
                  <h3 className="flex items-center gap-3 text-2xl font-bold text-white">
                    <span className="grid h-10 w-10 place-items-center rounded-xl text-xl" style={{ background: `${c.accent}26`, boxShadow: `0 0 20px ${c.accent}55` }} aria-hidden="true">
                      {c.emoji}
                    </span>
                    {c.id}
                  </h3>
                  <p className="text-sm text-white/65">{c.blurb}</p>
                </Reveal>

                {c.items.length === 0 ? (
                  <Reveal>
                    <div className="rounded-2xl border border-dashed border-white/25 bg-white/[0.03] p-6 text-sm text-white/75">
                      <div className="mb-2 flex items-center gap-2">
                        <Evidence kind="unavailable" />
                      </div>
                      {EMPTY_NOTE[c.id] ?? "Nothing detected in this category yet."}
                    </div>
                  </Reveal>
                ) : (
                  <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {c.items.map((t, i) => {
                      const open = openId === `${c.id}:${t.id}`;
                      return (
                        <Reveal as="li" key={t.id} delay={(i % 6) * 60}>
                          <button
                            type="button"
                            aria-expanded={open}
                            onClick={() => setOpenId(open ? null : `${c.id}:${t.id}`)}
                            className="glass group w-full rounded-2xl p-4 text-left transition duration-300 hover:-translate-y-1 focus-visible:-translate-y-1"
                            style={{ boxShadow: open ? `0 0 0 1px ${t.info.color}, 0 0 36px -6px ${t.info.color}` : undefined }}
                          >
                            <div className="flex items-center gap-4">
                              <span className="transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                                <Glyph glyph={t.info.glyph} color={t.info.color} active={open} />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-lg font-bold text-white">{t.info.label}</p>
                                <p className="text-xs text-white/65">
                                  {t.repos.size} repo{t.repos.size === 1 ? "" : "s"} · {[...t.sources].map((s) => SOURCE_TEXT[s]).join(" + ")}
                                </p>
                              </div>
                              <span className={cn("text-white/60 transition-transform", open && "rotate-180")} aria-hidden="true">⌄</span>
                            </div>

                            {t.pct !== null && !t.forkOnly && (
                              <div className="mt-3">
                                <div className="flex items-baseline justify-between font-mono text-[0.7rem] text-white/70">
                                  <span>share of code in original repos</span>
                                  <span style={{ color: t.info.color }}>{t.pct.toFixed(t.pct < 10 ? 1 : 0)}%</span>
                                </div>
                                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10" role="img" aria-label={`${t.pct.toFixed(1)} percent of the code in original repositories`}>
                                  <div className="bar-fill h-full rounded-full" style={{ ["--w" as string]: `${Math.max(2, t.pct)}%`, background: `linear-gradient(90deg, ${t.info.color}, #fff)`, boxShadow: `0 0 12px ${t.info.color}` }} />
                                </div>
                              </div>
                            )}

                            {t.forkOnly && <p className="mt-3 rounded-lg bg-purple/15 px-2.5 py-1.5 text-xs text-white/80">Only seen in a forked repo — upstream code, not claimed as a personal skill.</p>}

                            <div className={cn("grid transition-all duration-500", open ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                              <div className="overflow-hidden">
                                <p className="border-t border-white/10 pt-3 text-xs leading-relaxed text-white/75">
                                  <span className="font-semibold text-white">Evidence:</span> {[...t.repos].join(", ")}
                                </p>
                              </div>
                            </div>
                          </button>
                        </Reveal>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
