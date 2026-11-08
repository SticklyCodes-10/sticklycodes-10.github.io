export interface GhUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  blog: string | null;
  location: string | null;
  email: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GhRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  pushed_at: string;
  updated_at: string;
  size: number;
  default_branch: string;
  topics: string[];
  has_pages: boolean;
  has_issues: boolean;
}

export interface CommitLite {
  sha: string;
  message: string;
  date: string;
  url: string;
  repo: string;
}

export interface PullLite {
  number: number;
  title: string;
  state: string;
  merged_at: string | null;
  created_at: string;
  author: string;
  url: string;
  repo: string;
}

export interface RepoDeep {
  languages: Record<string, number>;
  commits: CommitLite[];
  pulls: PullLite[];
  deps: string[];
  hasReadme: boolean;
}

export interface EventLite {
  type: string;
  repo: string;
  date: string;
}

export interface Contributions {
  total: number;
  /** [YYYY-MM-DD, count] for days with at least one contribution */
  days: [string, number][];
  source: "github-mirror" | "commits";
}

export type DataSource = "live" | "cache" | "snapshot";

export interface GhData {
  fetchedAt: number;
  source: DataSource;
  user: GhUser;
  repos: GhRepo[];
  deep: Record<string, RepoDeep>;
  events: EventLite[];
  contributions: Contributions | null;
  /** human-readable notes about anything that could not be fetched */
  notes: string[];
}
