/**
 * Computes gestational age from an ISO date string (e.g. "2026-06-15").
 *
 * Convenience wrapper around {@link computeGestationalAge} that parses the
 * ISO string so callers don't need to construct a Date themselves.
 */
export function gestationalAgeFromDueDate(
  isoDate: string,
  today: Date = new Date(),
): { weeks: number; days: number } {
  const [year, month, day] = isoDate.split("-").map(Number);
  return computeGestationalAge(new Date(year, month - 1, day), today);
}

/**
 * Computes a due date from a gestational age in weeks and days.
 *
 * Inverse of computeGestationalAge: dueDate = today + (280 - totalDays) days.
 */
export function computeDueDate(
  weeks: number,
  days: number,
  today: Date = new Date(),
): Date {
  const totalDays = weeks * 7 + days;
  const daysUntilDue = 280 - totalDays;
  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + daysUntilDue,
  );
}

/**
 * Computes gestational age from a due date.
 *
 * Uses the standard obstetric formula: a due date is 280 days (40 weeks)
 * from the last menstrual period (LMP), so gestational age in days =
 * 280 - days_until_due_date.
 *
 * Result is clamped to 0–308 days (0w0d to 44w0d).
 */
export function computeGestationalAge(
  dueDate: Date,
  today: Date = new Date(),
): { weeks: number; days: number } {
  const msPerDay = 86_400_000;
  // Strip time component by comparing UTC date midnights
  const dueMidnight = Date.UTC(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate(),
  );
  const todayMidnight = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const diffDays = Math.round((dueMidnight - todayMidnight) / msPerDay);
  const totalDays = Math.max(0, Math.min(308, 280 - diffDays));
  return { weeks: Math.floor(totalDays / 7), days: totalDays % 7 };
}
