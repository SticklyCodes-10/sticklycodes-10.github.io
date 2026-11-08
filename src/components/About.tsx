import { useGithub } from "../hooks/useGithub";
import { Reveal } from "../hooks/useMotion";
import { fmtDate, languageTotals } from "../lib/derive";
import { USERNAME } from "../lib/github";
import { CountUp } from "./CountUp";
import { Tilt } from "./Tilt";
import { Evidence, SectionHeading, Skeleton, WaveDivider } from "./ui";

/** The profile README, verbatim (re-indented). Source: github.com/SticklyCodes-10/SticklyCodes-10 */
const README_TEXT = `C:\\Users\\Guest> whoami request
WHOAMI - Information requested

C:\\Users\\Guest> whoami type profile.txt

=========== USER PROFILE ===========

NAME:         SticklyCodes-10
STATUS:       Online
LOCATION:     /dev/null
SHELL:        Asking for README files
LAST_LOGIN:   Just now

DESCRIPTION:
- Learning as a Student
- Prefers own Coding and a little
  bit of Vibe-Coding
- Wants to be a programmer
- Programming enthusiast

CURRENT_TASK: Thinking whats next on my life
SUDO_ACCESS:  Pending

============ END OF WHOAMI ============`;

const AMENITIES: { emoji: string; title: string; text: string; kind: "verified" | "interpretation" }[] = [
  { emoji: "🎓", title: "Learning as a student", text: "Straight from the profile README: a student and a programming enthusiast who wants to be a programmer.", kind: "verified" },
  { emoji: "⌨️", title: "Own code first, a little vibe-coding", text: "Also from the README. The repo history is consistent with it: some pull requests in editorweb were opened by an AI coding agent bot and merged by the owner.", kind: "verified" },
  { emoji: "🎮", title: "Browser games & physics", text: "WhatBash combines Three.js rendering with a cannon-es physics ragdoll, synthesised sound and 10 tools. A real engine, not a tutorial clone.", kind: "interpretation" },
  { emoji: "🎞️", title: "Web UI with motion", text: "Editorweb is a React + Tailwind + Framer Motion site with a themed dark/light mode — an interest in interfaces that move.", kind: "interpretation" },
  { emoji: "🔍", title: "Curious about big codebases", text: "A fork of Prism Launcher (≈4 MB of C++) sits in the account. No own commits yet, but it signals curiosity about how large apps are built.", kind: "interpretation" },
  { emoji: "😎", title: "Terminal humour", text: "The profile name field says “sudo: name not found”, the location is /dev/null, the sudo access is “Pending”. Personality is part of the stack.", kind: "interpretation" },
];

function StringLights() {
  const colors = ["#ff5c9a", "#42e8ff", "#ff9e57", "#8b5cf6", "#ffe4bd"];
  return (
    <svg viewBox="0 0 1200 70" className="pointer-events-none absolute inset-x-0 top-0 h-14 w-full sm:h-16" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M0 6 Q150 60 300 8 T600 8 T900 8 T1200 6" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
      {Array.from({ length: 22 }, (_, i) => {
        const x = 30 + i * 54;
        const t = (x % 300) / 300;
        const y = 8 + Math.sin(t * Math.PI) * 28;
        const c = colors[i % colors.length];
        return <circle key={i} cx={x} cy={y} r="5" fill={c} style={{ filter: `drop-shadow(0 0 7px ${c})`, animation: `twinkle ${2.4 + (i % 4) * 0.6}s ease-in-out ${-i * 0.4}s infinite`, transformBox: "fill-box", transformOrigin: "center" }} />;
      })}
    </svg>
  );
}

export function About() {
  const { data, status } = useGithub();
  const user = data?.user;
  const since = user ? new Date(user.created_at) : null;
  const own = data?.repos.filter((r) => !r.fork).length ?? 0;
  const forks = data ? data.repos.length - own : 0;
  const langCount = data ? languageTotals(data, true).list.length : 0;

  const stats: { label: string; value: number | null; hint: string }[] = [
    { label: "Public repos", value: data ? data.repos.length : null, hint: `${own} original · ${forks} fork${forks === 1 ? "" : "s"}` },
    { label: "Languages seen", value: data ? langCount : null, hint: "across all public repos" },
    { label: "Contributions · 12 mo", value: data?.contributions ? data.contributions.total : null, hint: data?.contributions?.source === "commits" ? "derived from commits" : "public calendar" },
    { label: "Followers", value: user ? user.followers : null, hint: "on GitHub" },
  ];

  return (
    <section id="about-section" aria-labelledby="about-title" className="relative isolate overflow-hidden pb-24 pt-8 sm:pb-32">
      <div className="pointer-events-none absolute -left-32 top-24 -z-10 h-96 w-96 rounded-full bg-pink/20 blur-[110px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 top-[40%] -z-10 h-96 w-96 rounded-full bg-cyan/15 blur-[110px]" aria-hidden="true" />
      <div id="about" className="relative mx-auto max-w-6xl px-5 pt-16">
        <StringLights />
        <div className="pt-10">
          <SectionHeading id="about-title" kicker="02 · The Beach Club" title="Beyond the Screen" tone="pink" sub={<>Behind the neon is a student programmer who writes their own code and is still working out what comes next. Everything on this page is built from the public GitHub profile — <Evidence kind="verified" className="align-middle" /> marks facts, <Evidence kind="interpretation" className="align-middle" /> marks my reading of them.</>} />
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-12">
          {/* Membership pass */}
          <Reveal>
            <Tilt className="mx-auto w-full max-w-[380px] rounded-[2rem]">
              <div className="glass relative overflow-hidden rounded-[2rem] p-6 shadow-[0_30px_80px_-30px_rgba(255,92,154,0.55)]">
                <div className="absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(90deg,#ff5c9a_0_22px,#ffe4bd_22px_44px)]" aria-hidden="true" />
                <p className="mt-2 flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.3em] text-white/70">
                  <span>Club Stickly</span>
                  <span className="neon-cyan">● Online</span>
                </p>
                <div className="relative mx-auto mt-5 grid h-44 w-44 place-items-center rounded-full p-1.5" style={{ background: "conic-gradient(from 0deg, #ff5c9a, #ff9e57, #42e8ff, #8b5cf6, #ff5c9a)", boxShadow: "0 0 40px rgba(255,92,154,0.55)" }}>
                  {user ? (
                    <img src={`${user.avatar_url}&s=360`} alt={`GitHub avatar of ${user.login}`} width={168} height={168} className="h-full w-full rounded-full border-4 border-midnight bg-midnight object-cover" loading="lazy" />
                  ) : (
                    <Skeleton className="h-full w-full !rounded-full" />
                  )}
                </div>
                <h3 className="mt-5 text-center font-display text-2xl tracking-wide text-sand">{USERNAME}</h3>
                <p className="text-center font-mono text-xs text-white/60">GitHub display name: “{user?.name ?? "…"}”</p>
                <dl className="mt-5 space-y-2 border-t border-dashed border-white/20 pt-4 font-mono text-[0.78rem]">
                  {[
                    ["Member since", since ? fmtDate(since.toISOString(), { month: "long", year: "numeric" }) : "…"],
                    ["Shell", "Asking for README files"],
                    ["Home", "/dev/null"],
                    ["Goal", "Wants to be a programmer"],
                    ["Sudo", "Pending"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="text-white/55">{k}</dt>
                      <dd className="text-right text-white">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-center text-[0.7rem] text-white/50">Shell, home and sudo are quoted from the profile README, jokes included.</p>
                <div className="mt-4 flex h-9 items-end gap-[3px] opacity-80" aria-hidden="true">
                  {Array.from({ length: 46 }, (_, i) => (
                    <span key={i} className="block flex-1 rounded-sm bg-white" style={{ height: `${30 + ((i * 53) % 70)}%` }} />
                  ))}
                </div>
              </div>
            </Tilt>
          </Reveal>

          {/* Terminal */}
          <Reveal delay={120}>
            <figure className="overflow-hidden rounded-3xl border border-cyan/30 bg-[#050f1c]/85 shadow-[0_0_60px_-20px_rgba(66,232,255,0.55)] backdrop-blur">
              <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-pink" />
                <span className="h-3 w-3 rounded-full bg-orange" />
                <span className="h-3 w-3 rounded-full bg-cyan" />
                <figcaption className="ml-3 truncate font-mono text-xs text-white/65">The Tiki Bar Terminal — README.md of github.com/{USERNAME}/{USERNAME}</figcaption>
              </div>
              <pre tabIndex={0} aria-label="Profile README content" className="overflow-x-auto p-5 font-mono text-[0.72rem] leading-relaxed text-cyan/95 sm:text-[0.82rem]">
                {README_TEXT}
                <span className="ml-0.5 inline-block h-[1em] w-[0.55em] translate-y-[2px] bg-pink" style={{ animation: "neon-flicker 1.1s steps(1) infinite" }} aria-hidden="true" />
              </pre>
            </figure>
            <p className="mt-3 flex items-center gap-2 text-sm text-white/65">
              <Evidence kind="verified" /> Quoted verbatim from the profile repository.
            </p>
          </Reveal>
        </div>

        {/* Stats */}
        <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="glass rounded-2xl p-4 sm:p-5">
                <p className="font-mono text-[0.68rem] uppercase tracking-widest text-white/60">{s.label}</p>
                <p className="mt-1 font-display text-4xl text-sand sm:text-5xl">
                  {status === "loading" || s.value === null ? <Skeleton className="mt-2 h-9 w-16" /> : <CountUp value={s.value} />}
                </p>
                <p className="mt-1 text-xs text-white/60">{s.hint}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Amenities */}
        <div className="relative mt-16">
          <div className="absolute inset-x-0 -top-3 h-7 rounded-t-3xl bg-[repeating-linear-gradient(90deg,#ff5c9a_0_36px,#ffe4bd_36px_72px)] opacity-90" style={{ WebkitMaskImage: "radial-gradient(circle at 18px 100%, transparent 17px, #000 18px)", maskImage: "radial-gradient(circle at 18px 100%, transparent 17px, #000 18px)", WebkitMaskSize: "36px 100%", maskSize: "36px 100%" }} aria-hidden="true" />
          <div className="glass rounded-3xl px-4 pb-6 pt-9 sm:px-8 sm:pb-8">
            <h3 className="font-display text-2xl text-sand sm:text-3xl">Club amenities</h3>
            <p className="mb-6 mt-1 text-sm text-white/70">What the public record says about how this developer works and what they're drawn to.</p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {AMENITIES.map((a, i) => (
                <Reveal as="li" key={a.title} delay={i * 70}>
                  <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition duration-300 hover:-translate-y-1 hover:border-cyan/50 hover:bg-white/[0.08] hover:shadow-[0_0_30px_-8px_rgba(66,232,255,0.6)]">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-3xl" aria-hidden="true">{a.emoji}</span>
                      <Evidence kind={a.kind} />
                    </div>
                    <h4 className="mt-3 text-lg font-semibold text-white">{a.title}</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/75">{a.text}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <WaveDivider className="absolute inset-x-0 bottom-0 -z-10" />
    </section>
  );
}
