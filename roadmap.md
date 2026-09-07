# InwardWise redesign roadmap (prompt_2.docx)

## Done
- Shared content config `src/lib/products.ts` (names, taglines, routes, CTAs, OOOI stages, disclaimer).
- Products dropdown shows only Decision / Self / Connect, anchored to `/products`.
- `/products` overview: exactly three equal cards.
- Detail routes: `/products/decision`, `/products/self`, `/products/calm-mantra`, `/products/connect`
  (structure + `APPROVED COPY REQUIRED` placeholders).

## Waiting on user
- "Website Edits" document (approved long-form Decision / Self / Calm / Mantra / Connect copy).
- "Products and Services rewrite" transcript (Services copy + Stress Management).

## Open
- Home page: three prominent panels with one CTA each.
- Connect interactive page: prompt textarea + Make Decision / Use Self Aware / Connect Only routing,
  consent gate, incomplete-Self fallback.
- Connect content library (excerpts, email-friendly text, audio, approved stories w/ transcripts).
- Guided flows: rename Send -> Continue; remove "Save & Continue Later" and "Continue Anyway";
  required-question validation; save on Back/Continue.
- Global autosave + exact resume (debounced, blur/visibility, local recoverable draft, status labels).
- PIN onboarding: create + confirm + purpose + secure reset flow.
- Services rewrite (blocked on copy) + Stress Management.
- Data Bar behind disabled feature flag.
- Regression + responsive testing at 375 / 768 / 1024 / large.

## Admin / Employee Portal
- [x] Admin schema (roles, permissions, employees, CRM, tasks, marketing, notifications, saved views, audit logs) with RLS + grants
- [x] /admin/login, dashboard, leads, contacts, companies, opportunities, activities, campaigns, marketing leads, tasks, employees, roles, reports, settings, audit logs
- [ ] Optional: email/calendar/telephony integrations per module

## My Journey (Phase 1: READ)
- [x] Schema: journey_books/chapters/sections, preferences, items (state machine), signals, events (RLS + grants)
- [x] Recommendation engine picks ONE specific approved section, neutral fallback when confidence is low
- [x] Sequential reading: one active item, questions keep section open, mark read / pause / skip, finite reminders
- [x] Learning loop signals (completed/skipped topic) + user controls (personalisation off, frequency, topics, pause)
- [x] /journey member page, admin content library at /admin/journey-content
- [ ] Ingest "Health, Part 1 and 2 for Class (Refined)" PDF (file not supplied yet)
- [ ] Phase 2+: LISTEN, REFLECT, EXPLORE
