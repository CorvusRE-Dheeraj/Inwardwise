import { test, expect, type Page } from "@playwright/test";

// Sign-in / sign-up flows, signed out. Nothing here creates an account or
// session: password sign-in and the Google redirect are intercepted at the
// Supabase Auth endpoints, and sign-up is only exercised up to client-side
// validation.

const SUPABASE = "https://tshrzmldnesjvcmystnb.supabase.co";

function emailInput(page: Page) {
  return page.getByPlaceholder("you@example.com");
}

test("Sign up in the header opens the create-account form", async ({ page }) => {
  await page.goto("./", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Sign up" }).first().click();

  await expect(page).toHaveURL(/\/Inwardwise\/auth\?mode=signup$/);
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
});

test("sign-in and sign-up modes toggle", async ({ page }) => {
  await page.goto("auth?mode=signin", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

  await page.getByRole("button", { name: "Create an account" }).click();
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();

  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

test("sign-up rejects a password shorter than 8 characters before calling Supabase", async ({ page }) => {
  let signupCalled = false;
  await page.route(`${SUPABASE}/auth/v1/signup**`, (route) => {
    signupCalled = true;
    return route.abort();
  });
  await page.goto("auth?mode=signup", { waitUntil: "networkidle" });

  await emailInput(page).fill("e2e@example.com");
  await page.getByPlaceholder("At least 8 characters").fill("short1");
  // Bypass the browser's own minLength check to reach the app's message.
  await page.locator("form").evaluate((f: HTMLFormElement) => (f.noValidate = true));
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByText("Please use at least 8 characters.", { exact: false })).toBeVisible();
  expect(signupCalled).toBe(false);
});

test("wrong email/password shows a friendly error", async ({ page }) => {
  await page.route(`${SUPABASE}/auth/v1/token**`, (route) =>
    route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ code: 400, error_code: "invalid_credentials", msg: "Invalid login credentials" }),
    }),
  );
  await page.goto("auth?mode=signin", { waitUntil: "networkidle" });

  await emailInput(page).fill("nobody@example.com");
  await page.getByPlaceholder("Your password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  await expect(page.getByText("That email and password don't match an account.", { exact: false })).toBeVisible();
});

// Regression: this used to go to Lovable's /~oauth/initiate, which 404s on
// GitHub Pages. It must go to Supabase's own Google sign-in and come back to
// /Inwardwise/auth (keeping the post-login redirect).
test("Continue with Google goes to Supabase's Google sign-in and returns to /Inwardwise/auth", async ({ page }) => {
  await page.route(`${SUPABASE}/auth/v1/authorize**`, (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "<h1>stub google</h1>" }),
  );
  await page.goto("auth?mode=signup&redirect=%2Fdecision", { waitUntil: "networkidle" });

  await Promise.all([
    page.waitForURL(`${SUPABASE}/auth/v1/authorize**`),
    page.getByRole("button", { name: "Continue with Google" }).click(),
  ]);

  const url = new URL(page.url());
  expect(url.searchParams.get("provider")).toBe("google");
  const back = new URL(url.searchParams.get("redirect_to")!);
  expect(back.pathname).toBe("/Inwardwise/auth");
  expect(back.searchParams.get("redirect")).toBe("/decision");
});

test("a members-only page sends signed-out visitors to sign in", async ({ page }) => {
  await page.goto("decision", { waitUntil: "networkidle" });

  await expect(page).toHaveURL(/\/Inwardwise\/auth\?redirect=/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});
