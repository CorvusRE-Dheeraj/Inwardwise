import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run against the static GitHub Pages build, served under
// SITE_BASE by scripts/serve-pages.mjs — the same files deploy.yml ships.
// Build first with the same SITE_BASE (default "/", as on inwardwise.com), then run:
//   bun run build
//   bun run test:e2e
//
// e2e/guest needs no sign-in and writes nothing to Supabase: anything that
// would hit Supabase Auth (sign-in, Google redirect) is intercepted in the
// spec, so it's safe to run on every PR.
const base = process.env.SITE_BASE || "/";
const siteURL = `http://localhost:4173${base}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: siteURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "node scripts/serve-pages.mjs",
    url: siteURL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
