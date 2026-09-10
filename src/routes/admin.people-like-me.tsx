import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrudModule, type CrudConfig } from "@/components/admin/CrudModule";

export const Route = createFileRoute("/admin/people-like-me")({
  head: () => ({
    meta: [
      { title: "People Like Me content, InwardWise Admin" },
      {
        name: "description",
        content: "Manage fictional characters, scenarios, scenes, themes and questions.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "People Like Me content, InwardWise Admin" },
      { property: "og:description", content: "Manage fictional character scenarios." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const PERMS = {
  view: "settings.view",
  create: "settings.manage",
  edit: "settings.manage",
  delete: "settings.manage",
} as const;

const CHARACTERS: CrudConfig = {
  table: "characters",
  module: "people_like_me",
  singular: "Character",
  searchColumn: "name",
  orderBy: { column: "sort_order", ascending: true },
  permissions: PERMS,
  fields: [
    { key: "name", label: "Name", type: "text", required: true, inList: true },
    { key: "slug", label: "Slug", type: "text", required: true, inList: true },
    { key: "short_label", label: "Label", type: "text", inList: true },
    { key: "avatar_key", label: "Avatar key", type: "text", inList: true },
    { key: "personality", label: "Personality", type: "textarea" },
    { key: "sort_order", label: "Order", type: "number", inList: true },
  ],
};

const SCENARIOS: CrudConfig = {
  table: "character_scenarios",
  module: "people_like_me",
  singular: "Scenario",
  searchColumn: "title",
  orderBy: { column: "sort_order", ascending: true },
  permissions: PERMS,
  fields: [
    {
      key: "character_id",
      label: "Character",
      type: "ref",
      ref: { table: "characters", labelColumns: ["name"] },
      required: true,
      inList: true,
    },
    { key: "title", label: "Title", type: "text", required: true, inList: true },
    { key: "slug", label: "Slug", type: "text", required: true, inList: true },
    { key: "summary", label: "Current scenario", type: "textarea", required: true },
    { key: "sort_order", label: "Order", type: "number", inList: true },
  ],
};

const THEMES: CrudConfig = {
  table: "scenario_themes",
  module: "people_like_me",
  singular: "Theme",
  searchColumn: "label",
  orderBy: { column: "sort_order", ascending: true },
  permissions: PERMS,
  fields: [
    {
      key: "scenario_id",
      label: "Scenario",
      type: "ref",
      ref: { table: "character_scenarios", labelColumns: ["title"] },
      required: true,
      inList: true,
    },
    { key: "label", label: "Theme", type: "text", required: true, inList: true },
    { key: "sort_order", label: "Order", type: "number", inList: true },
  ],
};

const SCENES: CrudConfig = {
  table: "scenario_scenes",
  module: "people_like_me",
  singular: "Scene",
  searchColumn: "body",
  orderBy: { column: "scene_number", ascending: true },
  permissions: PERMS,
  fields: [
    {
      key: "scenario_id",
      label: "Scenario",
      type: "ref",
      ref: { table: "character_scenarios", labelColumns: ["title"] },
      required: true,
      inList: true,
    },
    { key: "scene_number", label: "Scene number", type: "number", required: true, inList: true },
    { key: "body", label: "Story text", type: "textarea", required: true, inList: true },
  ],
};

const QUESTIONS: CrudConfig = {
  table: "scenario_questions",
  module: "people_like_me",
  singular: "Question",
  searchColumn: "prompt",
  orderBy: { column: "sort_order", ascending: true },
  permissions: PERMS,
  fields: [
    {
      key: "scene_id",
      label: "Scene",
      type: "ref",
      ref: { table: "scenario_scenes", labelColumns: ["body"] },
      required: true,
      inList: true,
    },
    { key: "prompt", label: "Question", type: "textarea", required: true, inList: true },
    { key: "free_text_label", label: "Free text label", type: "text", inList: true },
    { key: "sort_order", label: "Order", type: "number", inList: true },
  ],
};

const OPTIONS: CrudConfig = {
  table: "scenario_options",
  module: "people_like_me",
  singular: "Option",
  searchColumn: "label",
  orderBy: { column: "sort_order", ascending: true },
  permissions: PERMS,
  fields: [
    {
      key: "question_id",
      label: "Question",
      type: "ref",
      ref: { table: "scenario_questions", labelColumns: ["prompt"] },
      required: true,
      inList: true,
    },
    { key: "label", label: "Option", type: "text", required: true, inList: true },
    { key: "sort_order", label: "Order", type: "number", inList: true },
  ],
};

const TABS: { key: string; label: string; config: CrudConfig }[] = [
  { key: "characters", label: "Characters", config: CHARACTERS },
  { key: "scenarios", label: "Scenarios", config: SCENARIOS },
  { key: "scenes", label: "Scenes", config: SCENES },
  { key: "themes", label: "Themes", config: THEMES },
  { key: "questions", label: "Questions", config: QUESTIONS },
  { key: "options", label: "Options", config: OPTIONS },
];

function Page() {
  const [tab, setTab] = useState(TABS[0].key);
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];

  return (
    <AdminShell title="People Like Me" description="Fictional characters, scenarios and scenes.">
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              t.key === tab ? "border-primary bg-primary text-primary-foreground" : "border-border"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <CrudModule key={active.key} config={active.config} />
    </AdminShell>
  );
}
