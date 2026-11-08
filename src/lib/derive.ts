import { ANALYSIS } from "./analysis";
import { DEP_TO_TECH, techInfo } from "./tech";
import type { Category } from "./tech";
import type { CommitLite, GhData, GhRepo, PullLite, RepoDeep } from "./types";

const DAY = 86_400_000;

export function daysSince(iso: string, now = Date.now()) {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / DAY));
}

export function relativeTime(iso: string, now = Date.now()) {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo} month${mo === 1 ? "" : "s"} ago`;
  const y = Math.floor(d / 365);
  return `${y} year${y === 1 ? "" : "s"} ago`;
}

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  new Date(iso).toLocaleDateString(undefined, opts);

export interface Status {
  label: string;
  tone: "live" | "warm" | "calm" | "fork" | "muted";
  detail: string;
}

/** Status derived only from verifiable fields (fork flag, archived flag, last push date). */
export function repoStatus(repo: GhRepo, now = Date.now()): Status {
  const d = daysSince(repo.pushed_at, now);
  const when = `Last pushed ${relativeTime(repo.pushed_at, now)}`;
  if (repo.archived) return { label: "Archived", tone: "muted", detail: when };
  if (repo.fork) return { label: "Fork", tone: "fork", detail: `${when} · forked ${relativeTime(repo.created_at, now)}` };
  if (d <= 30) return { label: "Active", tone: "live", detail: when };
  if (d <= 120) return { label: "Recently active", tone: "warm", detail: when };
  if (d <= 365) return { label: "Resting", tone: "calm", detail: when };
  return { label: "Dormant", tone: "muted", detail: when };
}

export interface TechUse {
  id: string;
  sources: Set<"language" | "package.json" | "repo files">;
  repos: Set<string>;
  bytes: number;
}

export function repoTechIds(repo: GhRepo, deep?: RepoDeep): { id: string; source: "language" | "package.json" | "repo files" }[] {
  const out: { id: string; source: "language" | "package.json" | "repo files" }[] = [];
  const seen = new Set<string>();
  const push = (id: string, source: "language" | "package.json" | "repo files") => {
    if (!seen.has(id)) {
      seen.add(id);
      out.push({ id, source });
    }
  };
  Object.keys(deep?.languages ?? {}).forEach((l) => push(l, "language"));
  if (!Object.keys(deep?.languages ?? {}).length && repo.language) push(repo.language, "language");
  (deep?.deps ?? []).forEach((dep) => {
    const id = DEP_TO_TECH[dep];
    if (id) push(id, "package.json");
  });
  (ANALYSIS[repo.name]?.extraTech ?? []).forEach((id) => push(id, "repo files"));
  return out;
}

/** The handful of technologies worth using as filter tags (skips markup/config noise on huge forks). */
export function repoFilterTags(repo: GhRepo, deep?: RepoDeep): string[] {
  const ids = repoTechIds(repo, deep);
  const langs = Object.entries(deep?.languages ?? {}).sort((a, b) => b[1] - a[1]);
  const mainLangs = new Set(langs.slice(0, repo.fork ? 2 : 3).map(([l]) => l));
  return ids
    .filter(({ id, source }) => {
      if (source === "language") return mainLangs.has(id) && id !== "HTML" && id !== "CSS";
      return techInfo(id).category !== "Tools & Build";
    })
    .map(({ id }) => id);
}

export function aggregateTech(data: GhData): TechUse[] {
  const map = new Map<string, TechUse>();
  data.repos.forEach((repo) => {
    const deep = data.deep[repo.name];
    const bytes = deep?.languages ?? {};
    repoTechIds(repo, deep).forEach(({ id, source }) => {
      const cur = map.get(id) ?? { id, sources: new Set(), repos: new Set(), bytes: 0 };
      cur.sources.add(source);
      cur.repos.add(repo.name);
      if (source === "language") cur.bytes += bytes[id] ?? 0;
      map.set(id, cur);
    });
  });
  return [...map.values()];
}

export function languageTotals(data: GhData, includeForks: boolean) {
  const totals = new Map<string, number>();
  data.repos
    .filter((r) => includeForks || !r.fork)
    .forEach((r) => {
      Object.entries(data.deep[r.name]?.languages ?? {}).forEach(([l, b]) => totals.set(l, (totals.get(l) ?? 0) + b));
    });
  const sum = [...totals.values()].reduce((a, b) => a + b, 0);
  return {
    sum,
    list: [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([name, bytes]) => ({ name, bytes, pct: sum ? (bytes / sum) * 100 : 0 })),
  };
}

export function categoryOf(id: string): Category {
  return techInfo(id).category;
}

export function allCommits(data: GhData): CommitLite[] {
  return Object.values(data.deep)
    .flatMap((d) => d.commits)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function allPulls(data: GhData): PullLite[] {
  return Object.values(data.deep)
    .flatMap((d) => d.pulls)
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

/* ───────────── Timeline ───────────── */
export interface TimelineEvent {
  date: string;
  kind: "account" | "repo" | "fork" | "pr" | "commit" | "gap";
  title: string;
  detail: string;
  repo?: string;
  url?: string;
}

const NOTABLE = /(deploy|workflow|pages|rewrit|upload|revert|merge pull|auto-sync|sample website|loading messages)/i;

export function buildTimeline(data: GhData): TimelineEvent[] {
  const ev: TimelineEvent[] = [
    {
      date: data.user.created_at,
      kind: "account",
      title: "Joined GitHub",
      detail: `The ${data.user.login} account was created.`,
      url: data.user.html_url,
    },
  ];
  data.repos.forEach((r) =>
    ev.push({
      date: r.created_at,
      kind: r.fork ? "fork" : "repo",
      title: r.fork ? `Forked ${r.name}` : `Created ${r.name}`,
      detail: r.description ?? "No description provided.",
      repo: r.name,
      url: r.html_url,
    }),
  );
  allPulls(data).forEach((p) =>
    ev.push({
      date: p.merged_at ?? p.created_at,
      kind: "pr",
      title: `PR #${p.number} ${p.merged_at ? "merged" : p.state} in ${p.repo}`,
      detail: `“${p.title}” — opened by ${p.author}${p.author.includes("[bot]") ? " (AI coding agent bot)" : ""}`,
      repo: p.repo,
      url: p.url,
    }),
  );
  const perRepo = new Map<string, number>();
  [...allCommits(data)]
    .reverse()
    .filter((c) => NOTABLE.test(c.message) && !/^merge pull/i.test(c.message))
    .forEach((c) => {
      const n = perRepo.get(c.repo) ?? 0;
      if (n >= 2) return;
      perRepo.set(c.repo, n + 1);
      ev.push({ date: c.date, kind: "commit", title: c.message, detail: `Commit ${c.sha} in ${c.repo}`, repo: c.repo, url: c.url });
    });

  ev.sort((a, b) => +new Date(a.date) - +new Date(b.date));

  // Honest quiet periods: show gaps larger than ~3 months instead of hiding them
  const withGaps: TimelineEvent[] = [];
  ev.forEach((e, i) => {
    if (i > 0) {
      const gap = (+new Date(e.date) - +new Date(ev[i - 1].date)) / DAY;
      if (gap > 90) {
        const months = Math.round(gap / 30);
        withGaps.push({
          date: new Date((+new Date(e.date) + +new Date(ev[i - 1].date)) / 2).toISOString(),
          kind: "gap",
          title: "Quiet tide",
          detail: `No public repositories or activity found for about ${months} months.`,
        });
      }
    }
    withGaps.push(e);
  });
  return withGaps;
}
