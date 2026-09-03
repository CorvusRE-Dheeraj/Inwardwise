/**
 * Detects provider responses that mean "try again later" (daily outbound call
 * limits, rate limits, temporary capacity) rather than a permanent failure.
 */
export function isCapacityError(status: number, body: string): boolean {
  if (status === 429) return true;
  const text = body.toLowerCase();
  return (
    text.includes("daily outbound call limit") ||
    text.includes("rate limit") ||
    text.includes("too many requests") ||
    text.includes("concurrency limit")
  );
}

/** How long to wait before the scheduler retries a capacity-limited call. */
export const CAPACITY_RETRY_MINUTES = 30;

export function capacityRetryAt(now: Date = new Date()): string {
  return new Date(now.getTime() + CAPACITY_RETRY_MINUTES * 60_000).toISOString();
}

export const CAPACITY_RETRY_MESSAGE =
  "The calling service was temporarily at capacity. Your call is queued and will be tried again shortly.";
