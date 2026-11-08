// Generates src/data/snapshot.json from the public GitHub API (no token needed).
// Used by the site only as a fallback when the live API is rate-limited / offline.
import { writeFileSync } from "node:fs";
const USER = "SticklyCodes-10";
const gh = async (p) => { const r = await fetch("https://api.github.com" + p, { headers: { Accept: "application/vnd.github+json" } }); if (!r.ok) throw new Error(p + " " + r.status); return r.json(); };
const raw = async (repo, branch, file) => { const r = await fetch(`https://raw.githubusercontent.com/${USER}/${repo}/${branch}/${file}`); return r.ok ? r.text() : null; };
const user = await gh(`/users/${USER}`);
const repos = await gh(`/users/${USER}/repos?per_page=100&sort=pushed`);
const keep = ["name","description","html_url","homepage","language","fork","archived","stargazers_count","forks_count","open_issues_count","created_at","pushed_at","updated_at","size","default_branch","topics","has_pages","has_issues"];
const deep = {};
for (const r of repos) {
  const languages = await gh(`/repos/${USER}/${r.name}/languages`);
  const commits = (await gh(`/repos/${USER}/${r.name}/commits?per_page=30&author=${USER}`)).map((c) => ({ sha: c.sha.slice(0,7), message: c.commit.message.split("\n")[0], date: c.commit.author.date, url: c.html_url, repo: r.name }));
  const pulls = r.fork ? [] : (await gh(`/repos/${USER}/${r.name}/pulls?state=all&per_page=30`)).map((p) => ({ number: p.number, title: p.title, state: p.state, merged_at: p.merged_at, created_at: p.created_at, author: p.user.login, url: p.html_url, repo: r.name }));
  let deps = [];
  if (!r.fork) { const pj = await raw(r.name, r.default_branch, "package.json"); if (pj) { try { const j = JSON.parse(pj); deps = [...Object.keys(j.dependencies||{}), ...Object.keys(j.devDependencies||{})]; } catch {} } }
  const hasReadme = (await raw(r.name, r.default_branch, "README.md")) !== null;
  deep[r.name] = { languages, commits, pulls, deps, hasReadme };
}
const events = (await gh(`/users/${USER}/events/public?per_page=30`)).map((e) => ({ type: e.type, repo: e.repo.name, date: e.created_at }));
let contributions = null;
try { const c = await (await fetch(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`)).json(); contributions = { total: c.total.lastYear, days: c.contributions.filter((d) => d.count > 0).map((d) => [d.date, d.count]) }; } catch {}
const u = Object.fromEntries(["login","name","bio","avatar_url","html_url","blog","location","email","twitter_username","public_repos","followers","following","created_at"].map((k)=>[k,user[k]]));
writeFileSync("src/data/snapshot.json", JSON.stringify({ fetchedAt: new Date().toISOString(), user: u, repos: repos.map((r)=>Object.fromEntries(keep.map((k)=>[k,r[k]]))), deep, events, contributions }, null, 1));
console.log("ok", repos.length, "repos");
