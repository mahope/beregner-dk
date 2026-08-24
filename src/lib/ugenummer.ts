/**
 * ISO 8601 week number calculation ("ugenummer").
 *
 * ISO 8601 rules: weeks start on Monday, and week 1 is the week
 * containing the first Thursday of the year (equivalently, the week
 * with at least four days in January). A consequence is that dates
 * around New Year can belong to week 52/53 of the previous year or
 * week 1 of the next year.
 *
 * Algorithm: shift the date to its week's Thursday; the Thursday's
 * calendar year is the ISO week-numbering year, and the week number
 * follows from days elapsed since January 1.
 */

export interface IsoUgeResultat {
  /** ISO 8601 week number (1-53) */
  uge: number;
  /** ISO week-numbering year (can differ from the calendar year near New Year) */
  isoAar: number;
  /** ISO weekday number: Monday = 1 ... Sunday = 7 */
  ugedagNr: number;
}

/** Parse a YYYY-MM-DD string as a local date, or return null if invalid */
function parseDato(input: Date | string): Date | null {
  if (typeof input === "string") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
    const [y, m, d] = input.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    if (
      date.getFullYear() !== y ||
      date.getMonth() !== m - 1 ||
      date.getDate() !== d
    ) return null;
    return date;
  }
  if (!(input instanceof Date) || Number.isNaN(input.getTime())) return null;
  return input;
}

/**
 * Calculate the ISO 8601 week number, week-numbering year and weekday
 * for a given date (Date object or YYYY-MM-DD string).
 * Returns null for invalid input.
 */
export function isoUge(dato: Date | string): IsoUgeResultat | null {
  const parsed = parseDato(dato);
  if (!parsed) return null;

  // Work in UTC to make the arithmetic timezone-independent
  const d = new Date(
    Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
  );
  const ugedagNr = d.getUTCDay() || 7; // JS Sunday=0 → ISO Sunday=7

  // Shift to this week's Thursday
  d.setUTCDate(d.getUTCDate() + 4 - ugedagNr);

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const uge = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return { uge, isoAar: d.getUTCFullYear(), ugedagNr };
}

/**
 * Number of weeks in an ISO week-numbering year: 52 or 53.
 * December 28 always falls in the last week of its ISO year,
 * so its week number is the count. Returns null for invalid input.
 */
export function antalUgerIIsoAar(aar: number): 52 | 53 | null {
  if (!Number.isInteger(aar) || aar < 1 || aar > 9999) return null;
  const resultat = isoUge(new Date(aar, 11, 28));
  return resultat ? resultat.uge : null;
}
