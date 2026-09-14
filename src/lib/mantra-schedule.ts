/** Helpers for daily mantra call times, shared by the app and the dispatcher. */

export const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Milliseconds a zone is ahead of UTC at the given instant. */
function zoneOffsetMs(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts: Record<string, string> = {};
  for (const p of dtf.formatToParts(date)) if (p.type !== "literal") parts[p.type] = p.value;
  const asUtc = Date.UTC(
    Number(parts["year"]),
    Number(parts["month"]) - 1,
    Number(parts["day"]),
    Number(parts["hour"]) === 24 ? 0 : Number(parts["hour"]),
    Number(parts["minute"]),
    Number(parts["second"]),
  );
  return asUtc - date.getTime();
}

/** The UTC instant for a wall-clock date and time in a given zone. */
function zonedToUtc(
  y: number,
  m: number,
  d: number,
  hh: number,
  mm: number,
  timeZone: string,
): Date {
  const naive = Date.UTC(y, m - 1, d, hh, mm, 0);
  let guess = new Date(naive - zoneOffsetMs(new Date(naive), timeZone));
  guess = new Date(naive - zoneOffsetMs(guess, timeZone));
  return guess;
}

/** Local calendar date in a zone for an instant. */
function zonedDateParts(date: Date, timeZone: string): { y: number; m: number; d: number } {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [y, m, d] = dtf.format(date).split("-").map(Number);
  return { y: y!, m: m!, d: d! };
}

/**
 * Next UTC instant at which the local clock in `timeZone` reads `timeOfDay`
 * ("HH:MM"), strictly after `from`. Falls back to UTC on an unknown zone.
 */
export function nextRunAt(timeOfDay: string, timeZone: string, from: Date = new Date()): Date {
  const match = TIME_PATTERN.exec(timeOfDay.trim());
  const hh = match ? Number(match[1]) : 8;
  const mm = match ? Number(match[2]) : 0;
  let zone = timeZone;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
  } catch {
    zone = "UTC";
  }
  for (let day = 0; day < 3; day++) {
    const probe = new Date(from.getTime() + day * 86400000);
    const { y, m, d } = zonedDateParts(probe, zone);
    const candidate = zonedToUtc(y, m, d, hh, mm, zone);
    if (candidate.getTime() > from.getTime() + 30000) return candidate;
  }
  return new Date(from.getTime() + 86400000);
}

/** "08:30" → "8:30 AM", for display. */
export function formatTimeOfDay(timeOfDay: string): string {
  const match = TIME_PATTERN.exec(timeOfDay.trim());
  if (!match) return timeOfDay;
  const hh = Number(match[1]);
  const suffix = hh < 12 ? "AM" : "PM";
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${hour12}:${match[2]} ${suffix}`;
}

/** Pick up to `count` distinct items at random. */
export function pickRandom<T>(items: T[], count: number): T[] {
  const pool = [...items];
  const out: T[] = [];
  while (pool.length > 0 && out.length < count) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]!);
  }
  return out;
}
