# Alex & Mary assessment demonstration

## Goal
Refocus the existing Alex and Mary tab so it clearly demonstrates two fictional people answering the same existing Self assessment questions differently, while keeping the current stories, reflections, personalization, routes, and authentication intact.

## What will change
- Keep the current Alex and Mary story cards and story pages available without removing their existing functionality.
- Add a clear three-way view switch on the Alex and Mary page: **Alex**, **Mary**, and **Compare Alex & Mary**.
- Show a concise illustrative profile for each character: situation, motivations, concerns, strengths, weaknesses, and decision style.
- Reuse every question directly from the existing five Self factors; do not add a separate questionnaire or rewrite the assessment.
- Add authored, deterministic answers for Alex and Mary that stay consistent with their established ISTJ and ISFJ profiles.
- In the comparison view, place each existing question beside Alex’s and Mary’s answers, grouped by the five existing factors and designed for readable side-by-side comparison.
- Show each character’s resulting five-factor Self profile, derived from those same answers and aligned with the existing factor meanings. This will remain an illustrative profile rather than introduce a competing score.
- Label the experience prominently as hypothetical/illustrative and explain the relationship: different answers produce different Self profiles.
- Structure the character assessment data by character key so future fictional profiles can be added without rebuilding the screen.

## Technical details
- Create one typed character-assessment data module that imports `AVATAR_DIMENSIONS`, keys responses by the existing question keys, and validates complete question coverage.
- Create focused display components for the character selector, direct-answer factor view, side-by-side comparison, and five-factor profile summary.
- Update only the existing `/people-like-me` page to introduce the assessment demonstration; preserve `/people-like-me/$slug` and all current scenario persistence.
- Use existing black/blue design tokens and the shared button component; keep all text left-aligned and avoid grey text.
- No database migration or AI generation is needed; answers will remain stable across refreshes.

## Verification
- Run the existing TypeScript checks and targeted tests.
- Test the signed-in Alex and Mary page end to end on desktop and mobile widths.
- Confirm all three views work, all existing questions appear for both characters, story links still open, and no browser errors occur.
