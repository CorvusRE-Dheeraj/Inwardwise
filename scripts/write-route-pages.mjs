// Gives every static route its own copy of the SPA shell, so deep links like
// /connect/music load with a 200 instead of falling through to 404.html.
//
// GitHub Pages serves /connect/music from connect/music.html. Paths that are
// also folders (/connect, /avatar, ...) get <path>/index.html too, in case
// Pages adds a trailing slash. Dynamic routes ($slug), API routes and the
// sitemap are skipped; they still load through 404.html.
//
// Run after `bun run build`: node scripts/write-route-pages.mjs
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const ROOT = join(process.cwd(), "dist", "client");
const SHELL = join(ROOT, "_shell.html");
const SKIP = [/\$/, /^\/api\//, /^\/lovable\//, /\.xml$/];

const tree = await readFile(join(process.cwd(), "src", "routeTree.gen.ts"), "utf8");
const paths = new Set(
  [...tree.matchAll(/fullPath: '([^']+)'/g)]
    .map((m) => m[1].replace(/\/$/, ""))
    .filter((p) => p && !SKIP.some((re) => re.test(p))),
);
const folders = new Set([...paths].map((p) => dirname(p)).filter((d) => d !== "/"));

const targets = new Set();
for (const p of paths) {
  targets.add(`${p}.html`);
  if (folders.has(p)) targets.add(`${p}/index.html`);
}

for (const t of targets) {
  const out = join(ROOT, t);
  await mkdir(dirname(out), { recursive: true });
  await copyFile(SHELL, out);
}
console.log(`Wrote ${targets.size} route pages for ${paths.size} routes.`);
