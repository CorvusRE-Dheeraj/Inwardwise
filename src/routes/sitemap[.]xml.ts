import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { AREAS } from "@/lib/areas";

const BASE_URL = "https://inwardwise.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/areas", changefreq: "monthly", priority: "0.8" },
          { path: "/science", changefreq: "monthly", priority: "0.6" },
          { path: "/history", changefreq: "monthly", priority: "0.6" },
          { path: "/examples", changefreq: "monthly", priority: "0.6" },
          { path: "/testimonials", changefreq: "monthly", priority: "0.5" },
          { path: "/feedback", changefreq: "monthly", priority: "0.4" },
          { path: "/pricing", changefreq: "monthly", priority: "0.6" },
          { path: "/donate", changefreq: "monthly", priority: "0.4" },
          { path: "/auth", changefreq: "yearly", priority: "0.3" },
        ];

        for (const area of AREAS) {
          entries.push({ path: `/areas/${area.slug}`, changefreq: "monthly", priority: "0.7" });
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
