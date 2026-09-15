# Black and Blue Text Across the Website

## Goal
Make visible text across every page use only the existing black and royal-blue brand colors, including secondary labels, descriptions, navigation, forms, and status text.

## Changes
- Change the shared secondary-text color from grey to black so existing pages update consistently without one-off edits.
- Replace any remaining explicit grey text utilities with the appropriate black or blue semantic text color.
- Keep blue for product-name second words, links, accents, and selected states; use black for body copy and supporting text.
- Preserve non-text grey surfaces and borders where they support layout; this request applies to text color.
- Check desktop and mobile pages for readable hierarchy and accidental grey text.

## Technical details
- Update the global `muted-foreground` design token to the existing `ink` token in both theme modes.
- Audit React and CSS files for raw grey/slate/zinc/neutral text colors and opacity-based grey text.
- Verify the app and representative public/authenticated screens after the change.
