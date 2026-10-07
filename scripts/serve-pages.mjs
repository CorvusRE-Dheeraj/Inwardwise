// Serves the static build (dist/client) the way GitHub Pages does, so the
// e2e suite tests exactly what deploy.yml ships:
//   - everything lives under SITE_BASE ("/" on the inwardwise.com custom
//     domain; "/Inwardwise/" on the plain github.io project-site URL)
//   - the site root serves the SPA shell (deploy.yml copies it to index.html)
//   - unknown paths get 404.html, i.e. the same shell, with a 404 status —
//     that's how deep links like /pricing load the app on Pages.
// Build first with the same SITE_BASE: bun run build
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const BASE = process.env.SITE_BASE || "/";
const ROOT = join(process.cwd(), "dist", "client");
const PORT = Number(process.env.PORT ?? 4173);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
};

async function fileAt(rel) {
  const path = normalize(join(ROOT, rel));
  if (!path.startsWith(ROOT)) return null;
  try {
    return (await stat(path)).isFile() ? path : null;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (`${pathname}/` === BASE) {
    res.writeHead(301, { Location: BASE }).end();
    return;
  }
  const rel = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : null;
  const file = rel === null ? null : rel === "" ? await fileAt("_shell.html") : await fileAt(rel);
  const body = await readFile(file ?? join(ROOT, "_shell.html"));
  const type = file ? (TYPES[extname(file)] ?? "application/octet-stream") : TYPES[".html"];
  res.writeHead(file ? 200 : 404, { "Content-Type": type }).end(body);
}).listen(PORT, () => console.log(`Serving dist/client at http://localhost:${PORT}${BASE}`));
