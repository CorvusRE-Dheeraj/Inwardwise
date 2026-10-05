import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run against the static GitHub Pages build, served under
// /Inwardwise/ by scripts/serve-pages.mjs — the same files deploy.yml ships.
// Build first, then run:
//   SITE_BASE=/Inwardwise/ bun run build
//   bun run test:e2e
//
// e2e/guest needs no sign-in and writes nothing to Supabase: anything that
// would hit Supabase Auth (sign-in, Google redirect) is intercepted in the
// spec, so it's safe to run on every PR.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4173/Inwardwise/",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "node scripts/serve-pages.mjs",
    url: "http://localhost:4173/Inwardwise/",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
