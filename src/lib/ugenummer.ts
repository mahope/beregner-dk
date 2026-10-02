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

export interface UgeDato {
  /** ISO weekday number: Monday = 1 ... Sunday = 7 */
  ugedagNr: number;
  /** The date as YYYY-MM-DD, so callers can format it in their own locale. */
  isoDato: string;
}

/**
 * The Monday that starts ISO week `uge` of `isoAar`, or null when that week
 * does not exist.
 *
 * The inverse of `isoUge`: 4 January is always in ISO week 1 of its year, so
 * the Monday of week 1 is 4 January minus that day's weekday. Everything else
 * is a whole number of weeks from there, which is why the result is the same
 * date for every weekday of the week (29. december 2025 and 4. januar 2026
 * both give the Monday of week 1 in 2026).
 *
 * Returns null for a week outside the ISO year: week 53 only exists in years
 * that actually have 53 weeks, and week 0 or 54 never exists.
 */
export function mandagIIsoUge(uge: number, isoAar: number): Date | null {
  if (!Number.isInteger(uge) || !Number.isInteger(isoAar)) return null;
  if (uge < 1 || uge > 53 || isoAar < 1 || isoAar > 9999) return null;
  if (uge === 53 && antalUgerIIsoAar(isoAar) !== 53) return null;
  const januar4 = new Date(Date.UTC(isoAar, 0, 4));
  const ugedagNr = januar4.getUTCDay() || 7;
  const d = new Date(januar4);
  d.setUTCDate(d.getUTCDate() - (ugedagNr - 1) + (uge - 1) * 7);
  return d;
}

/**
 * The seven dates of ISO week `uge` in `isoAar`, Monday first, or null when
 * the week does not exist in that ISO year.
 *
 * Exists because «datoer i uge 42» is a Danish autocomplete completion (5. of
 * 10 under «dato», målt 2/10 13:25) and `/ugenummer` could only answer it in
 * the other direction: from a date to a week number. The dates are computed,
 * never written into the prose, so the seven days cannot drift away from the
 * week number the calculator shows above them.
 */
export function datoerIUge(uge: number, isoAar: number): UgeDato[] | null {
  const mandag = mandagIIsoUge(uge, isoAar);
  if (!mandag) return null;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mandag);
    d.setUTCDate(d.getUTCDate() + i);
    return {
      ugedagNr: i + 1,
      isoDato: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`,
    };
  });
}

/**
 * Number of weeks in an ISO week-numbering year: 52 or 53.
 * December 28 always falls in the last week of its ISO year,
 * so its week number is the count. Returns null for invalid input.
 */
export function antalUgerIIsoAar(aar: number): 52 | 53 | null {
  if (!Number.isInteger(aar) || aar < 1 || aar > 9999) return null;
  const resultat = isoUge(new Date(aar, 11, 28));
  return resultat ? (resultat.uge as 52 | 53) : null;
}

/** Format one YYYY-MM-DD string as a Danish date with its weekday. */
function danskDatoMedUgedag(isoDato: string): string {
  const [y, m, d] = isoDato.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("da-DK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * The answer to «Hvilke datoer er der i uge 42?» — 5. of 10 Danish autocomplete
 * completions under «dato» (målt 2/10 13:25).
 *
 * Both dates are written by `datoerIUge`, so the sentence cannot claim a week
 * that the calculator shows differently (punkt 11: tal i copy skal kunne
 * verificeres). A week that does not exist in the year gets an answer that says
 * so instead of an empty string, so a wrong week number can never blank the
 * FAQ.
 */
export function ugeDatoerFaqSvar(uge: number, isoAar: number): string {
  const datoer = datoerIUge(uge, isoAar);
  if (!datoer) {
    const antal = antalUgerIIsoAar(isoAar);
    return `ISO-året ${isoAar} har ${antal ?? 52} uger, så uge ${uge} findes ikke i det. Vælg en ugenummer mellem 1 og ${antal ?? 52}.`;
  }
  return (
    `Uge ${uge} i ${isoAar} går fra ${danskDatoMedUgedag(datoer[0].isoDato)} til ` +
    `${danskDatoMedUgedag(datoer[6].isoDato)}. En ISO-uge er altid syv dage, ` +
    `mandag til søndag, så det er dem alle syv, der hører til ugen. Beregneren ` +
    `viser dem, når du vælger en dato i den uge.`
  );
}
