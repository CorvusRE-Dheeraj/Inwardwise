# Self-Calm call logs

## What will change
- Keep a permanent history row for every Self-Calm call attempt instead of relying only on the latest schedule state.
- Record when a call is queued, placed, answered/completed, unanswered, cancelled, retried because of capacity, or fails.
- Show the recent call history beneath the Self-Calm schedule with date, time, outcome, attempt count, and a clear failure reason when relevant.
- Keep each member’s call history private and visible only to that member.

## Technical details
- Add an owner-protected `meditation_call_logs` table with explicit authenticated and service grants.
- Update the Self-Calm dispatcher to create and finalize log rows as the phone provider reports each outcome.
- Add an authenticated read function and render the recent records on the scheduling page.
- Preserve the existing one-call-at-a-time safeguards and capacity retry behavior.

## Validation
- Type-check the changed files.
- Verify the Self-Calm schedule page loads and the call-history area renders without browser errors.
