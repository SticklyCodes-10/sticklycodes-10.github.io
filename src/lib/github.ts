import snapshotJson from "../data/snapshot.json";
import type {
  CommitLite,
  Contributions,
  EventLite,
  GhData,
  GhRepo,
  GhUser,
  PullLite,
  RepoDeep,
} from "./types";

export const USERNAME = "SticklyCodes-10";
const API = "https://api.github.com";
const CACHE_KEY = "sc10:github:v1";
const CACHE_TTL = 20 * 60 * 1000; // 20 minutes – keeps us far below the 60 req/h anonymous limit
const MAX_DEEP_REPOS = 12;

interface Snapshot {
  fetchedAt: string;
  user: GhUser;
  repos: GhRepo[];
  deep: Record<string, RepoDeep>;
  events: EventLite[];
  contributions: { total: number; days: [string, number][] } | null;
}
const snapshot = snapshotJson as unknown as Snapshot;

export class RateLimitError extends Error {
  reset: number | null;
  constructor(reset: number | null) {
    super("GitHub API rate limit reached");
    this.reset = reset;
  }
}

async function api<T>(path: string): Promise<T> {
  const res = await fetch(API + path, { headers: { Accept: "application/vnd.github+json" } });
  if (res.status === 403 || res.status === 429) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    const reset = res.headers.get("x-ratelimit-reset");
    if (remaining === "0" || res.status === 429) throw new RateLimitError(reset ? Number(reset) * 1000 : null);
  }
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${path}`);
  return res.json() as Promise<T>;
}

async function raw(repo: string, branch: string, file: string): Promise<string | null> {
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${USERNAME}/${repo}/${branch}/${file}`);
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

function pick<T extends object, K extends keyof T>(o: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  keys.forEach((k) => (out[k] = o[k]));
  return out;
}

const REPO_KEYS: (keyof GhRepo)[] = [
  "name", "description", "html_url", "homepage", "language", "fork", "archived", "stargazers_count",
  "forks_count", "open_issues_count", "created_at", "pushed_at", "updated_at", "size", "default_branch",
  "topics", "has_pages", "has_issues",
];

async function loadDeep(repo: GhRepo, notes: string[]): Promise<RepoDeep> {
  const fallback = snapshot.deep[repo.name];
  const [languages, commits, pulls, pkg, readme] = await Promise.all([
    api<Record<string, number>>(`/repos/${USERNAME}/${repo.name}/languages`).catch((e) => {
      if (e instanceof RateLimitError) throw e;
      notes.push(`Languages for ${repo.name} unavailable`);
      return fallback?.languages ?? {};
    }),
    api<
      { sha: string; html_url: string; commit: { message: string; author: { date: string } } }[]
    >(`/repos/${USERNAME}/${repo.name}/commits?per_page=30&author=${USERNAME}`)
      .then((list) =>
        list.map<CommitLite>((c) => ({
          sha: c.sha.slice(0, 7),
          message: c.commit.message.split("\n")[0],
          date: c.commit.author.date,
          url: c.html_url,
          repo: repo.name,
        })),
      )
      .catch((e) => {
        if (e instanceof RateLimitError) throw e;
        // 409 = empty repo, anything else = fall back quietly
        return fallback?.commits ?? [];
      }),
    repo.fork
      ? Promise.resolve<PullLite[]>([])
      : api<
          { number: number; title: string; state: string; merged_at: string | null; created_at: string; user: { login: string }; html_url: string }[]
        >(`/repos/${USERNAME}/${repo.name}/pulls?state=all&per_page=30`)
          .then((list) =>
            list.map<PullLite>((p) => ({
              number: p.number,
              title: p.title,
              state: p.state,
              merged_at: p.merged_at,
              created_at: p.created_at,
              author: p.user.login,
              url: p.html_url,
              repo: repo.name,
            })),
          )
          .catch((e) => {
            if (e instanceof RateLimitError) throw e;
            return fallback?.pulls ?? [];
          }),
    repo.fork || !["TypeScript", "JavaScript"].includes(repo.language ?? "") ? Promise.resolve(null) : raw(repo.name, repo.default_branch, "package.json"),
    raw(repo.name, repo.default_branch, "README.md"),
  ]);

  let deps: string[] = fallback?.deps ?? [];
  if (pkg) {
    try {
      const j = JSON.parse(pkg) as { dependencies?: object; devDependencies?: object };
      deps = [...Object.keys(j.dependencies ?? {}), ...Object.keys(j.devDependencies ?? {})];
    } catch {
      /* keep fallback */
    }
  } else if (!repo.fork && !fallback) {
    deps = [];
  }
  return { languages, commits, pulls, deps, hasReadme: readme !== null };
}

async function loadContributions(): Promise<Contributions | null> {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`);
    if (!res.ok) throw new Error("mirror");
    const j = (await res.json()) as { total: Record<string, number>; contributions: { date: string; count: number }[] };
    const total = Object.values(j.total).reduce((a, b) => a + b, 0);
    return {
      total,
      days: j.contributions.filter((d) => d.count > 0).map<[string, number]>((d) => [d.date, d.count]),
      source: "github-mirror",
    };
  } catch {
    return null;
  }
}

export function contributionsFromCommits(commits: CommitLite[]): Contributions {
  const map = new Map<string, number>();
  commits.forEach((c) => {
    const d = c.date.slice(0, 10);
    map.set(d, (map.get(d) ?? 0) + 1);
  });
  return { total: commits.length, days: [...map.entries()].sort(), source: "commits" };
}

function allCommits(deep: Record<string, RepoDeep>) {
  return Object.values(deep).flatMap((d) => d.commits);
}

function fromSnapshot(notes: string[]): GhData {
  const contributions: Contributions | null = snapshot.contributions
    ? { ...snapshot.contributions, source: "github-mirror" }
    : contributionsFromCommits(allCommits(snapshot.deep));
  return {
    fetchedAt: new Date(snapshot.fetchedAt).getTime(),
    source: "snapshot",
    user: snapshot.user,
    repos: snapshot.repos,
    deep: snapshot.deep,
    events: snapshot.events,
    contributions,
    notes,
  };
}

function readCache(): { t: number; data: GhData } | null {
  try {
    const s = localStorage.getItem(CACHE_KEY);
    return s ? (JSON.parse(s) as { t: number; data: GhData }) : null;
  } catch {
    return null;
  }
}

export function peekCache(): GhData | null {
  const c = readCache();
  return c && Date.now() - c.t < CACHE_TTL ? { ...c.data, source: "cache" } : null;
}

export async function loadGithub(force = false): Promise<GhData> {
  const cached = readCache();
  if (!force && cached && Date.now() - cached.t < CACHE_TTL) return { ...cached.data, source: "cache" };

  const notes: string[] = [];
  try {
    const [user, repoList, events] = await Promise.all([
      api<GhUser>(`/users/${USERNAME}`),
      api<GhRepo[]>(`/users/${USERNAME}/repos?per_page=100&sort=pushed`),
      api<{ type: string; repo: { name: string }; created_at: string }[]>(`/users/${USERNAME}/events/public?per_page=30`).catch(
        () => null,
      ),
    ]);
    const repos = repoList.map((r) => pick(r, REPO_KEYS) as GhRepo);
    const deepList = repos.slice(0, MAX_DEEP_REPOS);
    const deepEntries = await Promise.all(deepList.map(async (r) => [r.name, await loadDeep(r, notes)] as const));
    const deep = Object.fromEntries(deepEntries);
    const contributions = (await loadContributions()) ?? contributionsFromCommits(allCommits(deep));
    if (contributions.source === "commits") notes.push("Contribution calendar mirror unreachable — heatmap is derived from public commits.");

    const data: GhData = {
      fetchedAt: Date.now(),
      source: "live",
      user: pick(user, ["login", "name", "bio", "avatar_url", "html_url", "blog", "location", "email", "twitter_username", "public_repos", "followers", "following", "created_at"]) as GhUser,
      repos,
      deep,
      events: events ? events.map((e) => ({ type: e.type, repo: e.repo.name, date: e.created_at })) : snapshot.events,
      contributions,
      notes,
    };
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data }));
    } catch {
      /* storage may be full or disabled */
    }
    return data;
  } catch (e) {
    const msg =
      e instanceof RateLimitError
        ? `GitHub's anonymous API limit was reached${e.reset ? ` (resets around ${new Date(e.reset).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})` : ""}.`
        : "GitHub couldn't be reached right now.";
    if (cached) return { ...cached.data, source: "cache", notes: [`${msg} Showing the last data saved in this browser.`] };
    return fromSnapshot([`${msg} Showing the build-time snapshot of the profile instead.`]);
  }
}
