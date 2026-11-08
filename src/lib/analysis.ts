/**
 * Hand-written repository analysis.
 *
 * Everything under `verified` was read directly from the public repositories (source, file tree, commits, PRs)
 * when this site was built. Everything under `interpretation` is a reasonable technical reading of that evidence
 * and is labelled as such in the UI. Nothing here is invented profile information.
 */
export type ArtKind = "arcade" | "screen" | "prism" | "terminal" | "generic";

export interface RepoAnalysis {
  title: string;
  kind: string;
  accent: [string, string];
  art: ArtKind;
  pitch: string; // interpretation
  extraTech: string[]; // detected from the repo file tree
  verified: { purpose: string; features: string[]; architecture: string[] };
  interpretation: { decisions: string[]; improvements: string[]; status: string };
}

export const ANALYSIS: Record<string, RepoAnalysis> = {
  whatbash: {
    title: "WhatBash",
    kind: "Browser game · 3D physics sandbox",
    accent: ["#FF9E57", "#FF5C9A"],
    art: "arcade",
    pitch: "A cartoon ragdoll sandbox that runs in the browser: pick a tool, tap the buddy, let the physics engine do the rest.",
    extraTech: ["GitHub Actions", "GitHub Pages", "Web Audio API"],
    verified: {
      purpose:
        "The repository description says it is “the source code for WhatBash”, made specially for someone referred to as “sr”. It is deployed to GitHub Pages.",
      features: [
        "Ten tools bound to number keys: Kick, Punch, Bat, Hammer, Bomb, Rocket, Cannon, Anvil, Zapper and Grab.",
        "Eight random arenas, including Moon Base (low gravity), Neon Arena, Sunny Beach and Candy Land.",
        "HUD with money, pain, combo and KO counters, plus slow-motion, sound and follow-camera toggles.",
        "Sound effects synthesised with the Web Audio API — no audio files shipped.",
        "Optional custom rigged model (What.glb) is mapped onto the ragdoll; a procedural cartoon buddy is the fallback.",
        "Dedicated loading screen and a friendly error state when WebGL is unavailable.",
      ],
      architecture: [
        "React 19 UI shell (App.tsx) wrapped around an imperative Game class in src/game/engine.ts (≈1,000 lines).",
        "Three.js for rendering and OrbitControls, cannon-es for the physics world and joint-based ragdoll.",
        "Separate modules for ragdoll, procedural buddy, GLB loader, environments, particles, audio and tools.",
        "GitHub Actions workflow publishes the Vite build to GitHub Pages.",
      ],
    },
    interpretation: {
      decisions: [
        "The game loop lives outside React and reports back through callbacks, so a 60 fps simulation does not trigger 60 React renders a second.",
        "Particles use two pre-sized pools (additive and normal blending) instead of creating objects per hit.",
        "The GLB loader accepts Mixamo, Blender and Unreal bone naming, which makes swapping the character a drop-in job.",
      ],
      improvements: [
        "Add a README with controls and a screenshot — the repo currently has none (public/README.txt only covers the model slot).",
        "Split the Three.js bundle so the loading screen appears sooner.",
        "Verify touch controls on phones; the key bindings are keyboard-first.",
      ],
      status:
        "Young and fast-moving: at the time of analysis all commits landed within about an hour of the repo being created, including the Pages deployment. It looks like a project still taking shape.",
    },
  },
  "editorweb.github.io": {
    title: "Editorweb",
    kind: "Web app · animation channel showcase",
    accent: ["#42E8FF", "#8B5CF6"],
    art: "screen",
    pitch: "A React + Tailwind + Framer Motion showcase site for a stick-figure animation channel (@the.stickly), with dark/light theming.",
    extraTech: ["GitHub Pages"],
    verified: {
      purpose:
        "The description reads “have to be pushed to organization repo”, so this is a working prototype waiting to move. The README references the YouTube channel @the.stickly.",
      features: [
        "Single-page site with Hero, About, Videos, Gear, Stats, Timeline, FAQ, Contact, Marquee and Footer components.",
        "Dark/light theme saved in localStorage that respects prefers-color-scheme.",
        "Animated with Framer Motion, icons from lucide-react, an OS-window style component for the retro flavour.",
        "Published through GitHub Pages.",
      ],
      architecture: [
        "Vite 7 + React 19 + TypeScript + Tailwind CSS 4, bundled to a single file with vite-plugin-singlefile.",
        "One component per section; all copy lives in src/data/channel.json.",
        "Pull-request history: PRs #1–#3 were opened by an AI coding agent bot (arena-ai-coding-agent[bot]); PR #4, a revert, was opened by the owner.",
      ],
    },
    interpretation: {
      decisions: [
        "Keeping content in one JSON file makes the template reusable for any channel.",
        "The history shows a real deployment hiccup — shipping the raw /src/main.tsx caused a Pages 404, a fix was merged, then reverted. Debugging in public.",
        "The numbers in channel.json (subscribers, views…) look like sample content — a commit is literally titled “Add sample website content” — so they are intentionally not repeated on this site.",
      ],
      improvements: [
        "The README documents a 6-hourly YouTube scraping workflow that was later deleted; it needs updating.",
        "Swap sample data for verified channel data before publishing from the organisation repo.",
      ],
      status: "Prototype / waiting for its final home. The last meaningful changes were the Pages fix and its revert on the day it was created.",
    },
  },
  PrismLauncher: {
    title: "Prism Launcher (fork)",
    kind: "Fork · open-source Minecraft launcher",
    accent: ["#087CA7", "#42E8FF"],
    art: "prism",
    pitch: "A fork of Prism Launcher — itself a fork of MultiMC — kept as a place to study a large, real-world C++ desktop codebase.",
    extraTech: ["GitHub Actions"],
    verified: {
      purpose:
        "Description: “WARN: PROCEED WITH CAUTION ~ A custom launcher for Minecraft that allows you to easily manage multiple installations of Minecraft at once (Fork of MultiMC)”. Licensed GPL-3.0.",
      features: [
        "Upstream feature set: manage multiple Minecraft installations side by side.",
        "Upstream ships packaging for Linux, macOS and Windows through reusable GitHub Actions.",
      ],
      architecture: [
        "≈4.1 MB of C++ with CMake, a little Java, C, Objective-C++, Nix, Python, Shell and GLSL.",
        "Nix flake, Dockerfile and clang-format / clang-tidy configs in the tree.",
        "No commits authored by this account exist in the fork — all visible history belongs to upstream contributors.",
      ],
    },
    interpretation: {
      decisions: [
        "Forking before experimenting is the safe way to read and tinker with a project of this size.",
        "The “PROCEED WITH CAUTION” note reads like a self-reminder that this is not a polished personal product.",
      ],
      improvements: [
        "To turn it into a portfolio piece: push a branch with one small change, and document what was learned.",
      ],
      status: "Fork without own commits (verified). Treat it as a bookmark and learning resource, not a project built here.",
    },
  },
  "SticklyCodes-10": {
    title: "whoami.txt",
    kind: "Profile README",
    accent: ["#FFE4BD", "#FF9E57"],
    art: "terminal",
    pitch: "A tiny README dressed up as a Windows command prompt: “whoami” answers with the developer's status, shell and goals.",
    extraTech: [],
    verified: {
      purpose: "Description: “ME!!!!!!!!!!!!!!!!!!”. The README is the profile page that appears on github.com/SticklyCodes-10.",
      features: [
        "Terminal-style layout with NAME, STATUS, LOCATION (/dev/null), SHELL and LAST_LOGIN fields.",
        "Self-description: learning as a student, prefers own coding with a little vibe-coding, wants to be a programmer.",
        "CURRENT_TASK: “Thinking whats next on my life”, SUDO_ACCESS: “Pending”.",
      ],
      architecture: ["A single README.md — three commits: initial commit, a rewrite, then formatting for readability."],
    },
    interpretation: {
      decisions: ["Personality over polish: the format itself tells you the owner likes terminals and jokes."],
      improvements: ["Link the projects and list the tech stack so visitors can jump straight to the work."],
      status: "Complete for what it is. Edited on the day it was created.",
    },
  },
};

const PALETTE: [string, string][] = [
  ["#FF5C9A", "#8B5CF6"],
  ["#42E8FF", "#087CA7"],
  ["#FF9E57", "#FF5C9A"],
  ["#8B5CF6", "#42E8FF"],
];

export function accentFor(name: string): [string, string] {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
