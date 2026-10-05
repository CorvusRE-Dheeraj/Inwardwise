// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages serves a project site under a subpath matching the repo name
// (https://corvusre-dheeraj.github.io/Inwardwise/), so .github/workflows/deploy.yml
// sets SITE_BASE=/Inwardwise/. Defaults to "/" for local `npm run dev`/`npm run build`.
const base = process.env.SITE_BASE || "/";

export default defineConfig({
  vite: { base },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // GitHub Pages only serves static files, so build as an SPA: one prerendered HTML
    // shell that renders every route in the browser. (Prerendering each route instead
    // fails — /auth and the signed-in pages need a live server to render.) The deploy
    // workflow copies the shell to index.html and 404.html so deep links load the app.
    spa: { enabled: true },
    // Vite's `base` only covers asset URLs — the client router reads this separate
    // basepath to know what path prefix pages live under.
    router: { basepath: base },
  },
  // GitHub Pages can't run server code (Workers/Node); disable the Nitro server build
  // entirely so `vite build` emits a purely static site.
  nitro: false,
});
