export function getDateBounds(now: Date = new Date()): {
  min: Date;
  max: Date;
} {
  const min = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const max = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 7 * 42,
  );
  return { min, max };
}

export function expandTwoDigitYear(
  shortYear: number,
  now: Date = new Date(),
): number {
  const currentCentury = Math.floor(now.getFullYear() / 100) * 100;
  const candidate = currentCentury + shortYear;
  return candidate > now.getFullYear() + 10
    ? candidate - 100
    : candidate;
}

export function getDateError(
  text: string,
  now: Date = new Date(),
): string | null {
  if (!text) {
    return null;
  }
  const match = text.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
  if (!match) {
    return "Enter date as MM-DD-YYYY";
  }
  const month = parseInt(match[1], 10);
  if (month < 1 || month > 12) {
    return "Month must be 1\u201312";
  }
  const day = parseInt(match[2], 10);
  if (day < 1 || day > 31) {
    return "Day must be 1\u201331";
  }
  let year = parseInt(match[3], 10);
  if (year < 100) {
    year = expandTwoDigitYear(year, now);
  }
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return `${match[1]}-${match[2]} is not a valid date`;
  }
  const { min, max } = getDateBounds(now);
  if (date < min) {
    return "Date is too far in the past";
  }
  if (date > max) {
    return "Date is too far in the future";
  }
  return null;
}

export function parseDateText(text: string): Date | null {
  const match = text.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
  if (!match) {
    return null;
  }
  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  let year = parseInt(match[3], 10);
  if (year < 100) {
    year = expandTwoDigitYear(year);
  }
  if (month < 1 || month > 12) {
    return null;
  }
  if (day < 1 || day > 31) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function toISODateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
