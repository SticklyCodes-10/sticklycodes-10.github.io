import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useGithub } from "../hooks/useGithub";
import { Reveal } from "../hooks/useMotion";
import { ANALYSIS, accentFor, type RepoAnalysis } from "../lib/analysis";
import { fmtDate, relativeTime, repoFilterTags, repoStatus, repoTechIds, type Status } from "../lib/derive";
import { USERNAME } from "../lib/github";
import { techInfo } from "../lib/tech";
import type { GhData, GhRepo, RepoDeep } from "../lib/types";
import { cn } from "../utils/cn";
import { DataStatus } from "./DataStatus";
import { ProjectArt } from "./ProjectArt";
import { Tilt } from "./Tilt";
import { ErrorNote, Evidence, SectionHeading, Skeleton } from "./ui";

interface Item {
  repo: GhRepo;
  deep?: RepoDeep;
  analysis?: RepoAnalysis;
  accent: [string, string];
  tags: string[];
  status: Status;
}

const TONE: Record<Status["tone"], string> = {
  live: "bg-emerald-400 shadow-[0_0_10px_#34d399]",
  warm: "bg-orange shadow-[0_0_10px_#ff9e57]",
  calm: "bg-cyan shadow-[0_0_10px_#42e8ff]",
  fork: "bg-purple shadow-[0_0_10px_#8b5cf6]",
  muted: "bg-white/50",
};

function buildItems(data: GhData): Item[] {
  return [...data.repos]
    .sort((a, b) => +new Date(b.pushed_at) - +new Date(a.pushed_at))
    .map((repo) => {
      const deep = data.deep[repo.name];
      const analysis = ANALYSIS[repo.name];
      return { repo, deep, analysis, accent: analysis?.accent ?? accentFor(repo.name), tags: repoFilterTags(repo, deep), status: repoStatus(repo) };
    });
}

function LangBar({ languages, fallback }: { languages: Record<string, number>; fallback: string | null }) {
  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (!total) return <p className="font-mono text-xs text-white/60">{fallback ? `Primary language: ${fallback}` : "No language data reported by GitHub."}</p>;
  const top = entries.slice(0, 4);
  const label = top.map(([n, v]) => `${n} ${((v / total) * 100).toFixed(1)}%`).join(", ");
  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-white/10" role="img" aria-label={`Languages by code size: ${label}`}>
        {top.map(([n, v]) => (
          <span key={n} style={{ width: `${Math.max(2, (v / total) * 100)}%`, background: techInfo(n).color }} />
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.7rem] text-white/75">
        {top.map(([n, v]) => (
          <li key={n} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: techInfo(n).color }} aria-hidden="true" />
            {n} {((v / total) * 100).toFixed(v / total < 0.1 ? 1 : 0)}%
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: string; value: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5" title={label}>
      <span aria-hidden="true">{icon}</span>
      <span className="font-semibold text-white">{value}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

function LinkRow({ item, onOpen }: { item: Item; onOpen?: () => void }) {
  const { repo, deep } = item;
  const demo = repo.homepage?.trim();
  return (
    <div className="flex flex-wrap items-center gap-2">
      {onOpen && (
        <button type="button" onClick={onOpen} className="rounded-full bg-gradient-to-r px-4 py-2 text-sm font-bold text-midnight transition hover:brightness-110 hover:shadow-[0_0_24px_var(--a)]" style={{ backgroundImage: `linear-gradient(90deg, ${item.accent[0]}, ${item.accent[1]})` }}>
          Deep dive
        </button>
      )}
      <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/25 px-3.5 py-2 text-sm font-semibold text-white transition hover:border-cyan hover:text-cyan">
        GitHub ↗
      </a>
      {demo && (
        <a href={demo} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/25 px-3.5 py-2 text-sm font-semibold text-white transition hover:border-pink hover:text-pink">
          {repo.fork ? "Project site ↗" : "Live demo ↗"}
        </a>
      )}
      {deep?.hasReadme && (
        <a href={`${repo.html_url}#readme`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/25 px-3.5 py-2 text-sm font-semibold text-white transition hover:border-orange hover:text-orange">
          README ↗
        </a>
      )}
    </div>
  );
}

function ProjectCard({ item, index, onOpen }: { item: Item; index: number; onOpen: () => void }) {
  const { repo, deep, analysis, accent, status } = item;
  const techs = repoTechIds(repo, deep).filter((t) => t.source !== "language" || item.tags.includes(t.id) || t.id === repo.language);
  return (
    <li className="h-full" style={{ animation: `sunrise-in .7s ${index * 90}ms ease both` }}>
      <Tilt className="h-full rounded-3xl" max={5}>
        <article
          style={{ ["--a" as string]: accent[0], ["--b" as string]: accent[1] }}
          className="glass flex h-full flex-col overflow-hidden rounded-3xl transition duration-500 hover:border-[color:var(--a)] hover:shadow-[0_0_0_1px_var(--a),0_0_50px_-8px_var(--a),0_30px_60px_-30px_var(--b)]"
        >
          <div className="relative h-40 overflow-hidden sm:h-44">
            <ProjectArt kind={analysis?.art ?? "generic"} a={accent[0]} b={accent[1]} className="h-full w-full transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-midnight/90 to-transparent" aria-hidden="true" />
            <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-midnight/75 px-3 py-1 font-mono text-[0.7rem] uppercase tracking-wider text-white backdrop-blur">
              <span className={cn("h-2 w-2 rounded-full", TONE[status.tone], status.tone === "live" && "animate-pulse")} aria-hidden="true" />
              {status.label}
            </span>
            {repo.language && (
              <span className="absolute right-3 top-3 rounded-full bg-midnight/75 px-3 py-1 font-mono text-[0.7rem] text-white backdrop-blur">{repo.language}</span>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-4 p-5">
            <div>
              <p className="font-mono text-[0.7rem] uppercase tracking-widest" style={{ color: accent[0] }}>
                {analysis?.kind ?? (repo.fork ? "Fork" : "Repository")}
              </p>
              <h3 className="mt-1 text-2xl font-bold leading-tight text-white">{analysis?.title ?? repo.name}</h3>
              <p className="font-mono text-xs text-white/55">{USERNAME}/{repo.name}</p>
            </div>

            <div className="space-y-2 text-sm leading-relaxed">
              <p className="text-white/90">
                <span className="sr-only">GitHub description: </span>“{repo.description ?? "No description on GitHub."}”
              </p>
              {analysis && (
                <p className="text-white/70">
                  <span className="mr-1.5 inline-block align-middle"><Evidence kind="interpretation" /></span>
                  {analysis.pitch}
                </p>
              )}
            </div>

            <LangBar languages={deep?.languages ?? {}} fallback={repo.language} />

            <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
              {techs.slice(0, 8).map((t) => {
                const info = techInfo(t.id);
                return (
                  <li key={t.id} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/90">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: info.color, boxShadow: `0 0 8px ${info.color}` }} aria-hidden="true" />
                    {info.label}
                  </li>
                );
              })}
            </ul>

            <div className="mt-auto space-y-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/10 pt-3 text-sm text-white/65">
                <Stat icon="★" value={repo.stargazers_count} label="stars" />
                <Stat icon="⑂" value={repo.forks_count} label="forks" />
                <Stat icon="◔" value={repo.open_issues_count} label="open issues" />
                <span className="font-mono text-xs" title={`Created ${fmtDate(repo.created_at)}`}>
                  {status.detail}
                </span>
              </div>
              <LinkRow item={item} onOpen={onOpen} />
            </div>
          </div>
        </article>
      </Tilt>
    </li>
  );
}

function DialogSection({ title, kind, children }: { title: string; kind: "verified" | "interpretation"; children: ReactNode }) {
  return (
    <section className="mt-6">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h4 className="text-lg font-bold text-white">{title}</h4>
        <Evidence kind={kind} />
      </div>
      {children}
    </section>
  );
}

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="space-y-2 text-sm leading-relaxed text-white/80">
    {items.map((t) => (
      <li key={t} className="flex gap-2.5">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan shadow-[0_0_8px_#42e8ff]" aria-hidden="true" />
        <span>{t}</span>
      </li>
    ))}
  </ul>
);

function ProjectDialog({ item, onClose }: { item: Item; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { repo, deep, analysis, accent, status } = item;
  const titleId = `dlg-${repo.name.replace(/\W/g, "")}`;

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const close = () => ref.current?.close();
  const commits = deep?.commits.slice(0, 6) ?? [];
  const pulls = deep?.pulls ?? [];

  return (
    <dialog ref={ref} className="project-dialog" aria-labelledby={titleId} onClose={onClose} onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="h-full overflow-y-auto px-3 py-6 sm:px-8 sm:py-12" onClick={(e) => e.target === e.currentTarget && close()}>
        <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/15 bg-[#071b2d] shadow-[0_0_80px_-10px_var(--a)]" style={{ ["--a" as string]: accent[0] }}>
          <div className="relative h-44 sm:h-56">
            <ProjectArt kind={analysis?.art ?? "generic"} a={accent[0]} b={accent[1]} className="h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071b2d] via-transparent to-transparent" aria-hidden="true" />
            <button type="button" onClick={close} className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-midnight/80 text-xl text-white backdrop-blur transition hover:bg-pink" aria-label="Close project details">
              ✕
            </button>
            <div className="absolute bottom-3 left-5 right-5">
              <p className="font-mono text-xs uppercase tracking-widest text-white/80">{analysis?.kind ?? "Repository"}</p>
              <h3 id={titleId} className="font-display text-3xl text-white sm:text-5xl" style={{ textShadow: `0 0 24px ${accent[0]}` }}>
                {analysis?.title ?? repo.name}
              </h3>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/75">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-mono text-xs uppercase">
                <span className={cn("h-2 w-2 rounded-full", TONE[status.tone])} aria-hidden="true" />
                {status.label}
              </span>
              <span>{status.detail}</span>
              <span className="hidden sm:inline">·</span>
              <span>Created {fmtDate(repo.created_at)}</span>
              {repo.size > 0 && <span>· {repo.size.toLocaleString()} KB</span>}
            </div>

            <div className="mt-5">
              <LinkRow item={item} />
            </div>

            <DialogSection title="Purpose" kind="verified">
              <p className="text-sm leading-relaxed text-white/80">{analysis?.verified.purpose ?? `GitHub description: “${repo.description ?? "none provided"}”.`}</p>
            </DialogSection>

            {analysis ? (
              <>
                <DialogSection title="Key features" kind="verified">
                  <Bullets items={analysis.verified.features} />
                </DialogSection>
                <DialogSection title="Architecture & implementation" kind="verified">
                  <Bullets items={analysis.verified.architecture} />
                </DialogSection>
                <DialogSection title="Interesting technical decisions" kind="interpretation">
                  <Bullets items={analysis.interpretation.decisions} />
                </DialogSection>
                <DialogSection title="Potential improvements" kind="interpretation">
                  <Bullets items={analysis.interpretation.improvements} />
                </DialogSection>
                <DialogSection title="Project status" kind="interpretation">
                  <p className="text-sm leading-relaxed text-white/80">{analysis.interpretation.status}</p>
                </DialogSection>
              </>
            ) : (
              <p className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/75">
                This repository is newer than the written analysis, so only live GitHub facts are shown (languages, commits, pull requests).
              </p>
            )}

            <DialogSection title="Languages by code size" kind="verified">
              <LangBar languages={deep?.languages ?? {}} fallback={repo.language} />
            </DialogSection>

            <DialogSection title="Recent commits by this account" kind="verified">
              {commits.length ? (
                <ul className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
                  {commits.map((c) => (
                    <li key={c.sha} className="flex flex-wrap items-baseline justify-between gap-x-4 px-4 py-2.5 text-sm">
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-white hover:text-cyan">
                        {c.message}
                      </a>
                      <span className="font-mono text-xs text-white/55">
                        {c.sha} · {relativeTime(c.date)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-white/70">GitHub reports no commits authored by {item.repo.fork ? "this account in this fork" : "this account here"}.</p>
              )}
            </DialogSection>

            {pulls.length > 0 && (
              <DialogSection title="Pull requests" kind="verified">
                <ul className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
                  {pulls.map((p) => (
                    <li key={p.number} className="px-4 py-2.5 text-sm">
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-cyan">
                        #{p.number} {p.title}
                      </a>
                      <p className="font-mono text-xs text-white/55">
                        {p.merged_at ? "merged" : p.state} · opened by {p.author} · {fmtDate(p.created_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              </DialogSection>
            )}

            <div className="mt-8 flex justify-end">
              <button type="button" onClick={close} className="btn-ghost">
                Back to the coastline
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export function Projects() {
  const { data, status, reload, refreshing } = useGithub();
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const items = useMemo(() => (data ? buildItems(data) : []), [data]);

  const chips = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((i) => i.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    const base: { id: string; label: string; count: number }[] = [
      { id: "all", label: "All", count: items.length },
      { id: "original", label: "Original work", count: items.filter((i) => !i.repo.fork).length },
      { id: "fork", label: "Forks", count: items.filter((i) => i.repo.fork).length },
      { id: "demo", label: "Live demo", count: items.filter((i) => !i.repo.fork && i.repo.homepage).length },
    ].filter((c) => c.id === "all" || c.count > 0);
    const techs = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 9).map(([id, count]) => ({ id: `t:${id}`, label: techInfo(id).label, count }));
    return [...base, ...techs];
  }, [items]);

  const visible = items.filter((i) => {
    if (filter === "all") return true;
    if (filter === "original") return !i.repo.fork;
    if (filter === "fork") return i.repo.fork;
    if (filter === "demo") return !i.repo.fork && !!i.repo.homepage;
    return i.tags.includes(filter.slice(2));
  });
  const current = items.find((i) => i.repo.name === open);

  return (
    <section id="projects-section" aria-labelledby="projects-title" className="relative isolate overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60" style={{ background: "radial-gradient(60% 50% at 80% 0%, rgba(139,92,246,0.25), transparent 70%), radial-gradient(50% 40% at 0% 70%, rgba(66,232,255,0.14), transparent 70%)" }} aria-hidden="true" />
      <div id="projects" className="mx-auto max-w-6xl px-5">
        <SectionHeading id="projects-title" kicker="03 · My Projects" title="The Digital Coastline" tone="cyan" sub="Every public repository on the account, pulled live from GitHub. Each one has its own scene — hover for neon, open for a deep dive with what's verified and what's my interpretation." />

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label="Filter projects by technology" className="no-scrollbar -mx-5 flex max-w-[100vw] gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:max-w-none sm:flex-wrap sm:px-0">
            {chips.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={filter === c.id}
                onClick={() => setFilter(c.id)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
                  filter === c.id ? "border-transparent bg-gradient-to-r from-cyan to-purple text-midnight shadow-[0_0_24px_rgba(66,232,255,0.6)]" : "border-white/20 bg-white/5 text-white/85 hover:border-cyan/70 hover:text-white",
                )}
              >
                {c.label} <span className="ml-1 font-mono text-xs opacity-70">{c.count}</span>
              </button>
            ))}
          </div>
          <DataStatus />
        </div>

        {data && data.notes.length > 0 && (
          <div className="mb-6">
            <ErrorNote
              action={
                <button type="button" onClick={reload} disabled={refreshing} className="rounded-full border border-orange/60 px-3 py-1 text-xs font-semibold text-orange hover:bg-orange/10 disabled:opacity-50">
                  {refreshing ? "Retrying…" : "Try again"}
                </button>
              }
            >
              {data.notes[0]}
            </ErrorNote>
          </div>
        )}

        {status === "loading" ? (
          <ul className="grid gap-6 md:grid-cols-2" aria-busy="true" aria-label="Loading projects">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="glass overflow-hidden rounded-3xl">
                <Skeleton className="!rounded-none h-44" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-7 w-2/3" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </li>
            ))}
          </ul>
        ) : items.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center">
            <p className="text-5xl" aria-hidden="true">🏝️</p>
            <h3 className="mt-3 font-display text-2xl text-sand">An empty beach — for now</h3>
            <p className="mt-2 text-white/75">No public repositories were found on this account yet.</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center">
            <p className="text-5xl" aria-hidden="true">🐚</p>
            <h3 className="mt-3 font-display text-2xl text-sand">Nothing washed up here</h3>
            <p className="mt-2 text-white/75">No project matches that filter.</p>
            <button type="button" className="btn-ghost mt-5" onClick={() => setFilter("all")}>
              Show everything
            </button>
          </div>
        ) : (
          <ul key={filter} className="grid gap-6 md:grid-cols-2" aria-live="polite">
            {visible.map((item, i) => (
              <ProjectCard key={item.repo.name} item={item} index={i} onOpen={() => setOpen(item.repo.name)} />
            ))}
          </ul>
        )}

        <Reveal className="mt-8">
          <p className="text-sm text-white/65">
            Status badges come only from verifiable fields (fork flag, archived flag and last push date). Stars, forks and issue counts are shown as GitHub reports them — zero is zero.
          </p>
        </Reveal>
      </div>
      {current && <ProjectDialog key={current.repo.name} item={current} onClose={() => setOpen(null)} />}
    </section>
  );
}
