import { useGithub } from "../hooks/useGithub";
import { relativeTime } from "../lib/derive";
import { cn } from "../utils/cn";

const LABEL = {
  live: { t: "Live from the GitHub API", c: "bg-emerald-400", note: "" },
  cache: { t: "From this browser's cache of the GitHub API", c: "bg-cyan", note: "" },
  snapshot: { t: "Build-time snapshot (API unavailable)", c: "bg-orange", note: "" },
} as const;

export function DataStatus({ className }: { className?: string }) {
  const { data, refreshing, reload, status } = useGithub();
  if (status === "loading" || !data) {
    return (
      <p className={cn("inline-flex items-center gap-2 font-mono text-xs text-white/70", className)} role="status">
        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan" /> Contacting GitHub…
      </p>
    );
  }
  const l = LABEL[data.source];
  return (
    <p className={cn("inline-flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-white/75", className)}>
      <span className={cn("h-2 w-2 rounded-full", l.c, data.source === "live" && "animate-pulse")} aria-hidden="true" />
      <span>
        {l.t} · synced {relativeTime(new Date(data.fetchedAt).toISOString())}
      </span>
      <button
        type="button"
        onClick={reload}
        disabled={refreshing}
        className="rounded-full border border-white/25 px-2.5 py-0.5 text-[0.7rem] text-cyan transition hover:bg-white/10 disabled:opacity-50"
      >
        {refreshing ? "Refreshing…" : "Refresh"}
      </button>
    </p>
  );
}
