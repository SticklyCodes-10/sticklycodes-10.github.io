export type Category = "Languages" | "Frontend" | "Graphics & Games" | "Backend" | "Databases" | "Tools & Build";

export const CATEGORIES: { id: Category; blurb: string; accent: string; emoji: string }[] = [
  { id: "Languages", blurb: "What the repos are written in", accent: "#42E8FF", emoji: "🌊" },
  { id: "Frontend", blurb: "Interfaces, styling and motion", accent: "#FF5C9A", emoji: "🌺" },
  { id: "Graphics & Games", blurb: "3D, physics and sound in the browser", accent: "#FF9E57", emoji: "🎮" },
  { id: "Backend", blurb: "Servers, APIs and runtimes", accent: "#8B5CF6", emoji: "🛰️" },
  { id: "Databases", blurb: "Where data lives", accent: "#087CA7", emoji: "🗄️" },
  { id: "Tools & Build", blurb: "Bundlers, CI and deployment", accent: "#FFE4BD", emoji: "🛠️" },
];

export interface TechInfo {
  label: string;
  category: Category;
  color: string;
  glyph: string;
}

const t = (label: string, category: Category, color: string, glyph: string): TechInfo => ({ label, category, color, glyph });

/** Registry keyed by the label GitHub uses for languages, or our own label for libraries/tools. */
export const TECH: Record<string, TechInfo> = {
  TypeScript: t("TypeScript", "Languages", "#3b9cff", "TS"),
  JavaScript: t("JavaScript", "Languages", "#ffd84a", "JS"),
  "C++": t("C++", "Languages", "#ff5c9a", "C++"),
  C: t("C", "Languages", "#9aa7ff", "C"),
  Java: t("Java", "Languages", "#ff9e57", "Jv"),
  Python: t("Python", "Languages", "#42e8ff", "Py"),
  "Objective-C++": t("Objective-C++", "Languages", "#6ab0ff", "O++"),
  Shell: t("Shell", "Languages", "#9be86a", "$_"),
  GLSL: t("GLSL", "Languages", "#c28bff", "GL"),
  HTML: t("HTML", "Frontend", "#ff7a45", "<>"),
  CSS: t("CSS", "Frontend", "#42b4ff", "{}"),
  React: t("React", "Frontend", "#42e8ff", "⚛"),
  "Tailwind CSS": t("Tailwind CSS", "Frontend", "#38e0d0", "TW"),
  "Framer Motion": t("Framer Motion", "Frontend", "#ff5c9a", "FM"),
  "Lucide Icons": t("Lucide Icons", "Frontend", "#ffb27a", "Lu"),
  "Three.js": t("Three.js", "Graphics & Games", "#ffffff", "3D"),
  "cannon-es": t("cannon-es physics", "Graphics & Games", "#ff9e57", "⚙"),
  "Web Audio API": t("Web Audio API", "Graphics & Games", "#8b5cf6", "♪"),
  Vite: t("Vite", "Tools & Build", "#b78bff", "⚡"),
  CMake: t("CMake", "Tools & Build", "#6ab0ff", "CM"),
  Nix: t("Nix", "Tools & Build", "#7ab6ff", "❄"),
  Dockerfile: t("Docker", "Tools & Build", "#42a5ff", "🐳"),
  "GitHub Actions": t("GitHub Actions", "Tools & Build", "#ffe4bd", "CI"),
  "GitHub Pages": t("GitHub Pages", "Tools & Build", "#ffe4bd", "Pg"),
};

export function techInfo(id: string): TechInfo {
  return TECH[id] ?? t(id, "Languages", "#cfe6ff", id.slice(0, 2).toUpperCase());
}

/** npm dependency → technology id (only things worth showing as skills) */
export const DEP_TO_TECH: Record<string, string> = {
  react: "React",
  "react-dom": "React",
  tailwindcss: "Tailwind CSS",
  "@tailwindcss/vite": "Tailwind CSS",
  vite: "Vite",
  three: "Three.js",
  "cannon-es": "cannon-es",
  "framer-motion": "Framer Motion",
  "lucide-react": "Lucide Icons",
  typescript: "TypeScript",
};
