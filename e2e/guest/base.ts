// The URL path the site is built and served under — must match the build's
// SITE_BASE ("/" on inwardwise.com). See playwright.config.ts.
export const BASE = process.env.SITE_BASE || "/";

/** Escapes BASE for use inside a RegExp. */
export const BASE_RE = BASE.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
