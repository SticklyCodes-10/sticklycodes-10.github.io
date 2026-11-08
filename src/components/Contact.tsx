import { PHASE_META, usePhase } from "../hooks/phase";
import { useGithub } from "../hooks/useGithub";
import { Reveal } from "../hooks/useMotion";
import { USERNAME } from "../lib/github";
import { DataStatus } from "./DataStatus";
import { Palm } from "./scenery/Palms";
import { Wave } from "./scenery/Water";
import { Evidence, SectionHeading } from "./ui";

const PROFILE = `https://github.com/${USERNAME}`;

export function Contact() {
  const { data } = useGithub();
  const { phase, now } = usePhase();
  const profileRepo = data?.repos.find((r) => r.name === USERNAME);
  const issuesOpen = profileRepo ? profileRepo.has_issues : true;
  const u = data?.user;

  const menu: { icon: string; name: string; note: string; href: string; cta: string }[] = [
    { icon: "🐙", name: "Follow on GitHub", note: `@${USERNAME} — the one verified home for everything on this page.`, href: PROFILE, cta: "Open profile" },
    { icon: "📚", name: "Browse every repository", note: "Read the code behind the cards above.", href: `${PROFILE}?tab=repositories`, cta: "See repos" },
    ...(issuesOpen ? [{ icon: "💬", name: "Say hi in an issue", note: "Issues are enabled on the profile repository — the public way to reach out.", href: `${PROFILE}/${USERNAME}/issues/new`, cta: "Start a thread" }] : []),
  ];

  const unlisted = [
    ["Email", u?.email],
    ["Website", u?.blog],
    ["X / Twitter", u?.twitter_username],
    ["Location", u?.location],
  ] as const;

  return (
    <section id="contact-section" aria-labelledby="contact-title" className="relative">
      <div className="relative isolate overflow-hidden pt-24 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(139,92,246,0.28) 35%, rgba(255,92,154,0.4) 70%, rgba(255,158,87,0.55) 100%)" }} aria-hidden="true" />
      {/* distant sun melting into the sea */}
      <div className="pointer-events-none absolute bottom-[78px] left-1/2 -z-10 h-56 w-56 -translate-x-1/2 rounded-full sm:h-72 sm:w-72" style={{ background: "radial-gradient(circle at 50% 35%, #ffe27a, #ff5c9a 80%)", boxShadow: "0 0 120px 40px rgba(255,92,154,0.55)" }} aria-hidden="true">
        <div className="absolute inset-0 rounded-full" style={{ background: "repeating-linear-gradient(180deg, transparent 0 14px, rgba(42,15,85,0.9) 14px 17px, transparent 17px 28px, rgba(42,15,85,0.9) 28px 33px)", WebkitMaskImage: "linear-gradient(180deg, transparent 40%, #000 80%)", maskImage: "linear-gradient(180deg, transparent 40%, #000 80%)" }} />
      </div>
      <div className="pointer-events-none absolute -left-10 bottom-[56px] -z-0 h-[340px] opacity-95 sm:h-[460px]" aria-hidden="true">
        <Palm className="h-full" speed={8} />
      </div>
      <div className="pointer-events-none absolute -right-14 bottom-[56px] -z-0 hidden h-[380px] opacity-95 sm:block" style={{ transform: "scaleX(-1)" }} aria-hidden="true">
        <Palm className="h-full" speed={9.5} />
      </div>

      <div id="contact" className="relative z-10 mx-auto max-w-5xl px-5 pb-44 sm:pb-52">
        <SectionHeading
          id="contact-title"
          kicker="07 · Contact"
          title="Let's Catch the Sunset"
          tone="pink"
          sub={`${PHASE_META[phase].emoji} The sun's going down, the Wi-Fi's still up. Pull up a chair at the lounge — ${phase === "morning" ? "coffee's on, and sunrise looks good from here too" : phase === "night" ? "the neon is on and the terminal is open" : "the best ideas start over golden light"}.`}
        />

        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-pink/40 bg-midnight/75 p-6 shadow-[0_0_70px_-20px_rgba(255,92,154,0.8)] backdrop-blur-md sm:p-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="font-display text-3xl text-sand">Lounge menu</h3>
                <span className="neon-cyan anim-flicker rounded-md border-2 border-cyan px-2.5 py-0.5 font-display text-lg tracking-widest" aria-hidden="true">OPEN</span>
              </div>
              <ul className="divide-y divide-dashed divide-white/20">
                {menu.map((m) => (
                  <li key={m.name} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <span className="text-3xl" aria-hidden="true">{m.icon}</span>
                    <div className="min-w-[180px] flex-1">
                      <p className="text-lg font-bold text-white">{m.name}</p>
                      <p className="text-sm text-white/70">{m.note}</p>
                    </div>
                    <a href={m.href} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-4 !py-2 text-sm">
                      {m.cta} ↗
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/15 pt-6">
                <a href={PROFILE} target="_blank" rel="noopener noreferrer" className="btn-neon text-base">
                  Catch up on GitHub <span aria-hidden="true">→</span>
                </a>
                <Evidence kind="verified" />
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="h-full rounded-3xl border border-dashed border-white/30 bg-midnight/60 p-6 backdrop-blur-md">
              <div className="mb-3 flex items-center gap-2">
                <Evidence kind="unavailable" />
              </div>
              <h3 className="text-lg font-bold text-white">Not listed on the profile</h3>
              <p className="mt-1 text-sm text-white/70">Only verified contact details are shown. These fields are empty on the public GitHub profile, so there's nothing to invent:</p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {unlisted.map(([k, v]) => (
                  <li key={k} className="flex justify-between gap-3 border-b border-white/10 pb-1.5">
                    <span className="text-white/70">{k}</span>
                    <span className={v ? "text-cyan" : "font-mono text-xs text-white/50"}>{v || "not provided"}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-white/60">
                For context only: the editorweb README links the YouTube channel{" "}
                <a href="https://youtube.com/@the.stickly" target="_blank" rel="noopener noreferrer" className="text-cyan underline underline-offset-2">
                  @the.stickly
                </a>
                . It isn't confirmed as a personal account, so it isn't listed as a contact.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* shore */}
      <div className="absolute inset-x-0 bottom-0 z-[1]" aria-hidden="true">
        <div className="relative h-[120px] overflow-hidden" style={{ background: "linear-gradient(180deg, #ff5c9a, #8b2f7a 55%, #3a1465)" }}>
          <Wave fill="rgba(255,158,87,0.5)" dur={36} bob={5} className="h-[50%]" style={{ bottom: "40%" }} />
          <Wave fill="rgba(139,92,246,0.55)" dur={26} reverse bob={4} className="h-[55%]" style={{ bottom: "15%" }} />
          <Wave fill="rgba(255,255,255,0.35)" dur={18} bob={3.5} className="h-[40%]" style={{ bottom: "-6%" }} />
        </div>
      </div>
      </div>
      <footer className="relative z-10 border-t-4 border-[#fff3dc]/70 px-5 pb-8 pt-7 text-center text-midnight" style={{ background: "linear-gradient(180deg, #ffe4bd, #f1c994)" }}>
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3">
          <p className="font-display text-2xl tracking-wider text-[#b0245f]">Miami state of mind</p>
          <p className="max-w-xl text-sm font-medium">
            Every number and date on this page comes from the public GitHub API for <a className="underline underline-offset-2" href={PROFILE} target="_blank" rel="noopener noreferrer">@{USERNAME}</a>. If something isn't there, the page says so.
          </p>
          <div className="rounded-full bg-midnight/90 px-4 py-2 text-white">
            <DataStatus />
          </div>
          <p className="font-mono text-xs text-midnight/80">
            © {now.getFullYear()} {USERNAME} · sky follows your local clock · <a href="#top" className="font-bold underline underline-offset-2">Back to the top ↑</a>
          </p>
        </div>
      </footer>
    </section>
  );
}
