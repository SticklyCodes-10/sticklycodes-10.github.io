import { useEffect, useMemo, useRef, useState } from "react";
import { useGithub } from "../hooks/useGithub";
import { Reveal } from "../hooks/useMotion";
import { allCommits, allPulls, fmtDate, languageTotals, relativeTime, repoStatus } from "../lib/derive";
import { techInfo } from "../lib/tech";
import type { Contributions, GhData } from "../lib/types";
import { cn } from "../utils/cn";
import { CountUp } from "./CountUp";
import { DataStatus } from "./DataStatus";
import { Evidence, SectionHeading, Skeleton } from "./ui";

const LEVELS = ["rgba(255,255,255,0.07)", "#157f99", "#42E8FF", "#FF5C9A", "#FF9E57"];
const level = (n: number) => (n <= 0 ? 0 : n <= 1 ? 1 : n <= 3 ? 2 : n <= 7 ? 3 : 4);
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function Heatmap({ contrib }: { contrib: Contributions }) {
  const scroller = useRef<HTMLDivElement>(null);
  const { weeks, months, active } = useMemo(() => {
    const map = new Map(contrib.days);
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(start.getDate() - 52 * 7 - end.getDay());
    const weeks: { date: string; count: number; future: boolean }[][] = [];
    const months: { i: number; label: string }[] = [];
    let lastMonth = -1;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0) {
        weeks.push([]);
        if (d.getMonth() !== lastMonth) {
          months.push({ i: weeks.length - 1, label: d.toLocaleDateString(undefined, { month: "short" }) });
          lastMonth = d.getMonth();
        }
      }
      const key = iso(d);
      weeks[weeks.length - 1].push({ date: key, count: map.get(key) ?? 0, future: false });
    }
    const active = [...map.entries()].filter(([k]) => k >= iso(start)).sort();
    return { weeks, months, active };
  }, [contrib]);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth;
  }, [weeks.length]);

  return (
    <div>
      <div ref={scroller} className="no-scrollbar overflow-x-auto pb-2" tabIndex={0} aria-label="Contribution calendar, scrollable">
        <div className="inline-block min-w-max pl-8" role="img" aria-label={`Contribution calendar for the last 12 months: ${contrib.total} contributions on ${active.length} days.`}>
          <div className="relative mb-1 h-4 font-mono text-[0.65rem] text-white/60" style={{ width: weeks.length * 16 }}>
            {months.map((m) => (
              <span key={m.i} className="absolute" style={{ left: m.i * 16 }}>
                {m.label}
              </span>
            ))}
          </div>
          <div className="relative flex gap-1">
            <div className="absolute -left-8 top-0 grid h-[108px] grid-rows-7 font-mono text-[0.6rem] leading-[12px] text-white/50" aria-hidden="true">
              {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
            {weeks.map((w, wi) => (
              <div key={wi} className="grid grid-rows-7 gap-1">
                {w.map((c) => (
                  <span
                    key={c.date}
                    title={`${c.count} contribution${c.count === 1 ? "" : "s"} on ${fmtDate(c.date + "T12:00:00")}`}
                    className="block h-3 w-3 rounded-[3px] transition-transform duration-150 hover:scale-150"
                    style={{ background: LEVELS[level(c.count)], boxShadow: c.count > 0 ? `0 0 8px ${LEVELS[level(c.count)]}` : undefined, animation: c.count > 0 ? `twinkle ${3 + (wi % 4)}s ease-in-out ${-(wi % 7)}s infinite` : undefined }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[0.7rem] text-white/65">
        <span className="flex items-center gap-1.5" aria-hidden="true">
          Less {LEVELS.map((c) => <span key={c} className="h-3 w-3 rounded-[3px]" style={{ background: c }} />)} More
        </span>
        <span>
          {contrib.source === "github-mirror" ? "Source: GitHub's public contribution calendar (read via the github-contributions-api mirror)." : "Source: derived from public commits — GitHub's calendar mirror could not be reached."}
        </span>
      </div>
      <ul className="sr-only">
        {active.map(([d, n]) => (
          <li key={d}>
            {d}: {n} contributions
          </li>
        ))}
      </ul>
    </div>
  );
}

function Donut({ data }: { data: GhData }) {
  const [forks, setForks] = useState(false);
  const [hot, setHot] = useState<string | null>(null);
  const { list, sum } = languageTotals(data, forks);
  const top = list.slice(0, 6);
  const rest = list.slice(6).reduce((s, l) => s + l.pct, 0);
  const segs = [...top.map((l) => ({ name: l.name, pct: l.pct, color: techInfo(l.name).color })), ...(rest > 0 ? [{ name: "Other", pct: rest, color: "#8aa0b8" }] : [])];
  const R = 70;
  const C = 2 * Math.PI * R;
  let acc = 0;
  const focus = segs.find((s) => s.name === hot);
  return (
    <div>
      <div className="relative mx-auto h-48 w-48">
        <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90" role="img" aria-label={`Language distribution: ${segs.map((s) => `${s.name} ${s.pct.toFixed(1)}%`).join(", ")}`}>
          <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="18" />
          {segs.map((s) => {
            const len = Math.max(1.5, (s.pct / 100) * C - 2);
            const off = -acc;
            acc += (s.pct / 100) * C;
            return (
              <circle
                key={s.name}
                cx="90"
                cy="90"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={hot === s.name ? 24 : 18}
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={off}
                style={{ transition: "stroke-width .25s, opacity .25s", opacity: hot && hot !== s.name ? 0.35 : 1, filter: `drop-shadow(0 0 6px ${s.color})` }}
                onMouseEnter={() => setHot(s.name)}
                onMouseLeave={() => setHot(null)}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-2xl text-sand">{focus ? `${focus.pct.toFixed(focus.pct < 10 ? 1 : 0)}%` : `${Math.round(sum / 1024).toLocaleString()}`}</p>
            <p className="font-mono text-[0.65rem] uppercase tracking-wider text-white/65">{focus ? focus.name : "KB of code"}</p>
          </div>
        </div>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
        {segs.map((s) => (
          <li key={s.name}>
            <button type="button" onMouseEnter={() => setHot(s.name)} onMouseLeave={() => setHot(null)} onFocus={() => setHot(s.name)} onBlur={() => setHot(null)} className="flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-left text-white/85 hover:bg-white/10">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} aria-hidden="true" />
              <span className="truncate">{s.name}</span>
              <span className="ml-auto font-mono text-xs text-white/60">{s.pct.toFixed(s.pct < 10 ? 1 : 0)}%</span>
            </button>
          </li>
        ))}
      </ul>
      <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-white/80">
        <input type="checkbox" checked={forks} onChange={(e) => setForks(e.target.checked)} className="peer sr-only" />
        <span className="relative h-6 w-11 shrink-0 rounded-full bg-white/15 transition peer-checked:bg-pink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cyan after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" aria-hidden="true" />
        Include forked repositories
      </label>
      <p className="mt-2 text-xs text-white/55">{forks ? "Forks include upstream code that was not written here." : "Original repositories only — forks are excluded by default."}</p>
    </div>
  );
}

const EVENT_NAMES: Record<string, string> = {
  ForkEvent: "Forked",
  PushEvent: "Pushed to",
  CreateEvent: "Created",
  PullRequestEvent: "Pull request in",
  WatchEvent: "Starred",
  IssuesEvent: "Issue in",
  IssueCommentEvent: "Commented in",
  DeleteEvent: "Deleted a branch in",
  ReleaseEvent: "Released in",
};

export function Activity() {
  const { data, status } = useGithub();

  const view = useMemo(() => {
    if (!data) return null;
    const commits = allCommits(data);
    const pulls = allPulls(data);
    return {
      commits,
      pulls,
      stars: data.repos.reduce((s, r) => s + r.stargazers_count, 0),
      forks: data.repos.reduce((s, r) => s + r.forks_count, 0),
      issues: data.repos.reduce((s, r) => s + r.open_issues_count, 0),
      recent: [...data.repos].sort((a, b) => +new Date(b.pushed_at) - +new Date(a.pushed_at)).slice(0, 3),
    };
  }, [data]);

  const tiles = view
    ? [
        { l: "Stars received", v: view.stars, h: "across public repos" },
        { l: "Forks of my repos", v: view.forks, h: "made by others" },
        { l: "Open issues", v: view.issues, h: "currently open" },
        { l: "Pull requests", v: view.pulls.length, h: `${view.pulls.filter((p) => p.merged_at).length} merged` },
        { l: "Commits sampled", v: view.commits.length, h: "authored here (≤30 per repo)" },
      ]
    : [];

  return (
    <section id="activity-section" aria-labelledby="activity-title" className="relative isolate overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 h-[60%] opacity-40" style={{ background: "radial-gradient(60% 60% at 50% 50%, rgba(255,158,87,0.2), transparent 70%)" }} aria-hidden="true" />
      <div id="activity" className="mx-auto max-w-6xl px-5">
        <SectionHeading id="activity-title" kicker="05 · GitHub Activity" title="My Development Rhythm" tone="pink" sub="The pulse of the account, straight from GitHub's public data. Where GitHub doesn't expose something, the card says so instead of guessing." />
        <div className="-mt-6 mb-8 sm:-mt-10">
          <DataStatus />
        </div>

        {status === "loading" || !data || !view ? (
          <div className="space-y-5" aria-busy="true" aria-label="Loading activity">
            <Skeleton className="h-52" />
            <div className="grid gap-5 lg:grid-cols-3">
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Heatmap */}
            <Reveal>
              <div className="glass rounded-3xl p-5 sm:p-7">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">Contribution calendar</h3>
                    <p className="text-sm text-white/70">
                      {data.contributions ? (
                        <>
                          <span className="font-display text-2xl text-sand">{data.contributions.total}</span> contributions in the last 12 months
                        </>
                      ) : (
                        "Contribution calendar unavailable."
                      )}
                    </p>
                  </div>
                  <Evidence kind={data.contributions?.source === "github-mirror" ? "verified" : data.contributions ? "interpretation" : "unavailable"} />
                </div>
                {data.contributions ? <Heatmap contrib={data.contributions} /> : <p className="rounded-xl border border-dashed border-white/25 p-6 text-sm text-white/70">GitHub's calendar couldn't be loaded right now. Try refreshing.</p>}
                <p className="mt-3 text-xs text-white/55">Private-repository contributions are never visible in public data, so they are not counted here.</p>
              </div>
            </Reveal>

            {/* Stat tiles */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {tiles.map((t, i) => (
                <Reveal key={t.l} delay={i * 60}>
                  <div className="glass h-full rounded-2xl p-4">
                    <p className="font-mono text-[0.66rem] uppercase tracking-widest text-white/60">{t.l}</p>
                    <p className="mt-1 font-display text-4xl text-sand">
                      <CountUp value={t.v} />
                    </p>
                    <p className="text-xs text-white/60">{t.h}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <Reveal>
                <div className="glass h-full rounded-3xl p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <h3 className="text-xl font-bold text-white">Language mix</h3>
                    <Evidence kind="verified" />
                  </div>
                  <Donut data={data} />
                </div>
              </Reveal>

              <Reveal delay={90}>
                <div className="glass h-full rounded-3xl p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <h3 className="text-xl font-bold text-white">Recent commits</h3>
                    <Evidence kind="verified" />
                  </div>
                  {view.commits.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-white/25 p-5 text-sm text-white/70">No commits authored by this account were found in the public repositories.</p>
                  ) : (
                    <ol className="relative space-y-3 border-l border-white/15 pl-5">
                      {view.commits.slice(0, 8).map((c) => (
                        <li key={c.repo + c.sha} className="relative">
                          <span className="absolute -left-[1.62rem] top-1.5 h-2.5 w-2.5 rounded-full bg-cyan shadow-[0_0_10px_#42e8ff]" aria-hidden="true" />
                          <a href={c.url} target="_blank" rel="noopener noreferrer" className="block text-sm font-medium leading-snug text-white hover:text-cyan">
                            {c.message}
                          </a>
                          <p className="font-mono text-[0.68rem] text-white/55">
                            <span className="text-pink">{c.repo}</span> · {c.sha} · {relativeTime(c.date)}
                          </p>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </Reveal>

              <Reveal delay={180}>
                <div className="glass flex h-full flex-col gap-6 rounded-3xl p-5 sm:p-6">
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="text-xl font-bold text-white">Recent projects</h3>
                      <Evidence kind="verified" />
                    </div>
                    <ul className="space-y-2.5">
                      {view.recent.map((r) => {
                        const s = repoStatus(r);
                        return (
                          <li key={r.name}>
                            <a href={r.html_url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 transition hover:border-pink/60 hover:bg-white/10">
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold text-white group-hover:text-pink">{r.name}</span>
                                <span className="font-mono text-[0.68rem] text-white/55">pushed {relativeTime(r.pushed_at)}</span>
                              </span>
                              <span className={cn("shrink-0 rounded-full px-2 py-0.5 font-mono text-[0.65rem] uppercase", s.tone === "live" ? "bg-emerald-400/20 text-emerald-300" : s.tone === "fork" ? "bg-purple/25 text-purple-200" : "bg-white/10 text-white/70")}>{s.label}</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-white">Latest public events</h3>
                      <Evidence kind="verified" />
                    </div>
                    {data.events.length === 0 ? (
                      <p className="text-sm text-white/65">GitHub only keeps ~90 days of public events, and none were found in that window.</p>
                    ) : (
                      <ul className="space-y-1.5 text-sm text-white/80">
                        {data.events.slice(0, 4).map((e, i) => (
                          <li key={i}>
                            {EVENT_NAMES[e.type] ?? e.type.replace("Event", "")} <span className="text-cyan">{e.repo}</span> <span className="font-mono text-xs text-white/50">· {relativeTime(e.date)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal>
              <div className="rounded-3xl border border-dashed border-white/25 bg-white/[0.03] p-5 sm:p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Evidence kind="unavailable" />
                  <h3 className="text-lg font-bold text-white">What public data can't tell you</h3>
                </div>
                <ul className="grid gap-x-8 gap-y-2 text-sm text-white/75 sm:grid-cols-2">
                  <li>• Private repository work and contributions to private organisations.</li>
                  <li>• Code-review activity and discussions that GitHub doesn't expose anonymously.</li>
                  <li>• Contribution streaks or "productivity" scores — not computed, to avoid fake precision.</li>
                  <li>• Traffic, clones and visitor counts of the repositories (owner-only data).</li>
                </ul>
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
