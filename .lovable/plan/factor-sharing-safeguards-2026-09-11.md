# Factor sharing safeguards

## What will change
- Give every Self factor a clear sharing classification that defaults to internal use only.
- Add an explicit confirmation control for people who still choose external sharing.
- Keep the non-sharing recommendation visible after confirmation, with stronger protection messaging for Factors 1 and 2.
- Call out childhood experiences, inner fears, and inner enemies as sensitive Inner Shadow information.
- Show the same classification and warning anywhere factor answers are reviewed or downloaded.

## Technical details
- Persist each factor's classification and override acknowledgement in the authenticated user's existing factor progress record.
- Preserve PIN encryption for all answers; sharing preferences never decrypt or expose answer content.
- Exclude Factors 1 and 2 from external/export output unless the user explicitly acknowledges the warning for that factor.
- Verify the authenticated Self flow, saved preferences, and PDF behavior on desktop and mobile.
