/**
 * Date helpers for the parental-leave planner.
 *
 * All dates are ISO calendar dates ("YYYY-MM-DD") handled in UTC so that
 * daylight-saving changes can never shift a leave period by a day.
 */

const DAY_MS = 86_400_000;

export const MAANEDER = [
  "januar",
  "februar",
  "marts",
  "april",
  "maj",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "december",
] as const;

export const MAANEDER_KORT = [
  "jan.",
  "feb.",
  "mar.",
  "apr.",
  "maj",
  "jun.",
  "jul.",
  "aug.",
  "sep.",
  "okt.",
  "nov.",
  "dec.",
] as const;

export const UGEDAGE = [
  "søndag",
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
] as const;

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = ISO_RE.exec(value);
  if (!match) return false;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  return (
    date.getUTCFullYear() === Number(y) &&
    date.getUTCMonth() === Number(m) - 1 &&
    date.getUTCDate() === Number(d)
  );
}

export function parseIso(value: string): Date {
  const match = ISO_RE.exec(value);
  if (!match) throw new Error(`Ugyldig dato: ${value}`);
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

export function toIso(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, days: number): string {
  return toIso(new Date(parseIso(iso).getTime() + days * DAY_MS));
}

export function addMonths(iso: string, months: number): string {
  const date = parseIso(iso);
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
  ).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return toIso(target);
}

export function diffDays(fromIso: string, toIsoDate: string): number {
  return Math.round((parseIso(toIsoDate).getTime() - parseIso(fromIso).getTime()) / DAY_MS);
}

/** First day of leave-week `week`, where week 0 starts on the anchor date. */
export function weekStart(anchor: string, week: number): string {
  return addDays(anchor, week * 7);
}

/** Last day (inclusive) of leave-week `week`. */
export function weekEnd(anchor: string, week: number): string {
  return addDays(anchor, week * 7 + 6);
}

/** Leave-week index that contains `iso` (may be negative). */
export function weekIndexOf(anchor: string, iso: string): number {
  return Math.floor(diffDays(anchor, iso) / 7);
}

/** "mandag den 4. januar 2027" */
export function formatLang(iso: string): string {
  const d = parseIso(iso);
  return `${UGEDAGE[d.getUTCDay()]} den ${d.getUTCDate()}. ${MAANEDER[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "4. januar 2027" */
export function formatDato(iso: string): string {
  const d = parseIso(iso);
  return `${d.getUTCDate()}. ${MAANEDER[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "04.01.2027" */
export function formatKort(iso: string): string {
  const d = parseIso(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${d.getUTCFullYear()}`;
}

/** "4. jan." */
export function formatDagMaaned(iso: string): string {
  const d = parseIso(iso);
  return `${d.getUTCDate()}. ${MAANEDER_KORT[d.getUTCMonth()]}`;
}

/** "YYYY-MM" key of the month containing `iso`. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function monthLabel(key: string, short = false): string {
  const [y, m] = key.split("-").map(Number);
  return short ? `${MAANEDER_KORT[m - 1]} ${String(y).slice(2)}` : `${MAANEDER[m - 1]} ${y}`;
}

export function daysInMonth(key: string): number {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** ISO 8601 week number, handy for employers who think in "uge 12". */
export function isoWeekNumber(iso: string): number {
  const d = parseIso(iso);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / DAY_MS + 1) / 7);
}

export function todayIso(now: Date = new Date()): string {
  return toIso(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}
