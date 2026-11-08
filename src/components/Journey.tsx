import { useEffect, useMemo, useRef } from "react";
import { useGithub } from "../hooks/useGithub";
import { Reveal, usePrefersReducedMotion } from "../hooks/useMotion";
import { buildTimeline, fmtDate, type TimelineEvent } from "../lib/derive";
import { cn } from "../utils/cn";
import { Evidence, SectionHeading, Skeleton } from "./ui";

const ICON: Record<TimelineEvent["kind"], string> = { account: "🏝️", repo: "🚀", fork: "🍴", pr: "🔀", commit: "✎", gap: "🌊" };
const STOPS = ["#FFE27A", "#FF9E57", "#FF5C9A", "#8B5CF6", "#42E8FF"];

/** Sunrise yellow → dusk purple → night cyan along the timeline. */
function tint(t: number) {
  const x = Math.min(0.999, Math.max(0, t)) * (STOPS.length - 1);
  const i = Math.floor(x);
  return `color-mix(in oklab, ${STOPS[i]}, ${STOPS[i + 1]} ${((x - i) * 100).toFixed(0)}%)`;
}

export function Journey() {
  const { data, status } = useGithub();
  const reduced = usePrefersReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const events = useMemo(() => (data ? buildTimeline(data) : []), [data]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    if (reduced) {
      el.style.setProperty("--p", "1");
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = (window.innerHeight * 0.55 - r.top) / r.height;
      el.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(4));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced, events.length]);

  const real = events.filter((e) => e.kind !== "gap").length;
  // alternate sides only across real milestones (gap markers are centred)
  const sides = events.reduce<boolean[]>((acc, _e) => {
    const n = acc.filter((_, i) => events[i].kind !== "gap").length;
    acc.push(n % 2 === 1);
    return acc;
  }, []);

  return (
    <section id="journey-section" aria-labelledby="journey-title" className="relative isolate overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "linear-gradient(180deg, transparent, rgba(255,158,87,0.10) 35%, rgba(255,92,154,0.14) 65%, rgba(139,92,246,0.18))" }} aria-hidden="true" />
      <div id="journey" className="mx-auto max-w-5xl px-5">
        <SectionHeading
          id="journey-title"
          kicker="06 · My Journey"
          title="The Sunset Timeline"
          tone="sunset"
          sub={
            <>
              A walk down the beach from the first login to the latest push. Only dated, public GitHub facts appear here — account creation, repositories, pull requests and a few notable commits. <Evidence kind="verified" className="align-middle" />
            </>
          }
        />

        {status === "loading" ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading timeline">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center text-white/75">
            <p className="text-5xl" aria-hidden="true">🌅</p>
            <p className="mt-3">The first milestone hasn't happened yet.</p>
          </div>
        ) : (
          <>
            <p className="mb-8 font-mono text-xs text-white/65">
              {real} milestones · {fmtDate(events[0].date, { month: "short", year: "numeric" })} → {fmtDate(events[events.length - 1].date, { month: "short", year: "numeric" })}
            </p>
            <div ref={wrap} className="relative" style={{ ["--p" as string]: 0 }}>
              {/* rail */}
              <div className="absolute bottom-0 left-[19px] top-0 w-[3px] rounded-full bg-white/10 md:left-1/2 md:-translate-x-1/2" aria-hidden="true" />
              <div
                className="absolute left-[19px] top-0 w-[3px] rounded-full md:left-1/2 md:-translate-x-1/2"
                style={{ height: "calc(var(--p) * 100%)", background: "linear-gradient(180deg, #FFE27A, #FF9E57 30%, #FF5C9A 60%, #8B5CF6 85%, #42E8FF)", boxShadow: "0 0 18px rgba(255,92,154,0.8)" }}
                aria-hidden="true"
              />
              <div
                className="absolute left-[20.5px] z-10 -translate-x-1/2 -translate-y-1/2 md:left-1/2"
                style={{ top: "calc(var(--p) * 100%)" }}
                aria-hidden="true"
              >
                <span className="block h-7 w-7 rounded-full" style={{ background: "radial-gradient(circle at 40% 35%, #fff, #ffd36a 45%, #ff5c9a)", boxShadow: "0 0 30px 10px rgba(255,158,87,0.6)" }} />
              </div>

              <ol className="relative space-y-6 md:space-y-10">
                {events.map((e, i) => {
                  const color = tint(i / Math.max(1, events.length - 1));
                  const right = sides[i];
                  if (e.kind === "gap") {
                    return (
                      <Reveal as="li" key={`gap${i}`} className="relative pl-14 md:pl-0">
                        <div className="mx-auto flex max-w-md items-center gap-3 rounded-full border border-dashed border-white/25 bg-white/[0.04] px-5 py-3 text-center text-sm text-white/75 md:justify-center">
                          <span aria-hidden="true" className="anim-float text-xl">🌊</span>
                          <span>
                            <strong className="text-white">{e.title}.</strong> {e.detail}
                          </span>
                        </div>
                      </Reveal>
                    );
                  }
                  return (
                    <Reveal as="li" key={`${e.kind}${i}`} className="relative pl-14 md:pl-0">
                      <span className="absolute left-[8px] top-5 z-10 grid h-6 w-6 place-items-center rounded-full border-2 border-midnight text-[0.7rem] md:left-1/2 md:-translate-x-1/2" style={{ background: color, boxShadow: `0 0 16px ${color}` }} aria-hidden="true" />
                      <div className={cn("md:grid md:grid-cols-2 md:gap-14")}>
                        <article
                          className={cn("glass group relative rounded-2xl p-5 transition duration-300 hover:-translate-y-1", right ? "md:col-start-2" : "md:col-start-1")}
                          style={{ borderColor: `color-mix(in oklab, ${color} 45%, transparent)` }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <time dateTime={e.date} className="font-mono text-xs uppercase tracking-wider" style={{ color }}>
                              {fmtDate(e.date)}
                            </time>
                            <span className="text-xl" aria-hidden="true">{ICON[e.kind]}</span>
                          </div>
                          <h3 className="mt-2 text-lg font-bold leading-snug text-white">{e.title}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-white/75">{e.detail}</p>
                          {e.url && (
                            <a href={e.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-cyan underline-offset-4 hover:underline">
                              View on GitHub ↗
                            </a>
                          )}
                        </article>
                      </div>
                    </Reveal>
                  );
                })}
              </ol>
            </div>
            <p className="mt-10 text-sm text-white/60">“Notable commits” are picked by keywords (deploy, workflow, rewrite, revert…) — a simple filter, not a judgement of importance. Quiet periods are shown rather than hidden.</p>
          </>
        )}
      </div>
    </section>
  );
}
