import { test, expect, type Page } from "@playwright/test";
import { BASE_RE } from "./base";

// The public site, signed out, as served from GitHub Pages (at the root of
// inwardwise.com).

const ASSETS = new RegExp(`^${BASE_RE}assets/`);

/** Records every same-origin request that fails — a missing script, image, video or PDF. */
function trackMissingFiles(page: Page) {
  const missing: string[] = [];
  page.on("response", (res) => {
    const url = new URL(res.url());
    const isPage = res.request().resourceType() === "document";
    if (url.host === "localhost:4173" && res.status() >= 400 && !isPage) {
      missing.push(`${res.status()} ${url.pathname}`);
    }
  });
  return missing;
}

// Regression: a build made for the wrong base path (/Inwardwise/ while served
// at the domain root) 404s every script and renders a blank page.
test("home page renders the hero and loads all its files", async ({ page }) => {
  const missing = trackMissingFiles(page);
  await page.goto("./", { waitUntil: "networkidle" });

  await expect(page).toHaveTitle("InwardWise, Remove Bias, Fear, and Ego From Your Decisions");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Life is About");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Decisions");
  await expect(page.getByRole("link", { name: "Start a Decision" })).toBeVisible();

  // The intro video used to live on Lovable's asset host and 404'd on Pages.
  const video = page.locator("video[src]").first();
  await expect(video).toHaveAttribute("src", ASSETS);
  expect(missing).toEqual([]);
});

test("example decision PDFs are served from the site", async ({ page, request }) => {
  await page.goto("examples", { waitUntil: "networkidle" });

  const hrefs = await page.locator('a[href$=".pdf"]').evaluateAll((as) => as.map((a) => a.getAttribute("href")!));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of new Set(hrefs)) {
    expect(href).toMatch(ASSETS);
    const res = await request.get(href);
    expect(res.status(), href).toBe(200);
    expect(res.headers()["content-type"]).toContain("pdf");
  }
});

test("founder page portrait loads", async ({ page }) => {
  const missing = trackMissingFiles(page);
  await page.goto("history", { waitUntil: "networkidle" });

  const portrait = page.locator('img[src*="alex-freeman"]');
  await expect(portrait).toBeVisible();
  expect(await portrait.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  expect(missing).toEqual([]);
});

test("signed-out header shows Sign up and no member menu", async ({ page }) => {
  await page.goto("./", { waitUntil: "networkidle" });

  await expect(page.getByRole("link", { name: "Sign up" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Account" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Products" })).toHaveCount(0);
});

// Pages has no server routing: a direct visit to a deep link is served
// 404.html (the SPA shell), and the client router renders the right page.
test("deep links load the right page", async ({ page }) => {
  await page.goto("pricing", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Free while we’re in beta.");

  await page.goto("contact", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Write to InwardWise");
});

test("unknown pages show the app's not-found page with a working Go home link", async ({ page }) => {
  await page.goto("this-page-does-not-exist", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await page.getByRole("link", { name: "Go home" }).click();
  await expect(page).toHaveURL(new RegExp(`:4173${BASE_RE}$`));
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Life is About");
});
