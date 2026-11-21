/**
 * Count the time between two dates (ISO yyyy-mm-dd strings).
 *
 * Returns whole days, plus a weeks + remaining-days breakdown, and whether
 * the target date is in the past relative to the "from" date. Dates are
 * compared at midnight UTC so the result is stable regardless of time zone.
 */

export interface NedtaellingResultat {
  dage: number;
  uger: number;
  restDage: number;
  erFortid: boolean;
  /**
   * Måldatoen som UTC-midnat. Den skal med ud, fordi timetallet regnes fra et
   * nu-tidspunkt (den besøgendes ur) frem til datoens *lokale* midnat, og det
   * kan kun lade sig gøre, når kalenderdagen kendes — ikke bare antal dage.
   */
  tilTid: number;
}

const MS_PR_DAG = 24 * 60 * 60 * 1000;
const MS_PR_TIME = 60 * 60 * 1000;
const MS_PR_MINUT = 60 * 1000;

/**
 * Hele timer og resterende minutter fra et nu-tidspunkt frem til datoen. Kun
 * meningsfyldt når datoen ligger frem i tid; fortiden får 0/0 i stedet for et
 * negativt tal, så værdien aldrig skal filtreres af kallet.
 */
export function nedtaellingTimer(
  tilTid: number,
  nu: Date
): { timer: number; minutter: number } {
  const d = new Date(tilTid);
  // Samme regel som kalenderdagen på `/dage-til`: nedtællingen slutter ved
  // midnat inden datoen, og den besøgendes eget ur måler — ikke serverens, der
  // typisk kører UTC og ville svare to timer forkert for en dansk læser.
  const maal = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const rest = Math.max(0, maal.getTime() - nu.getTime());
  return {
    timer: Math.floor(rest / MS_PR_TIME),
    minutter: Math.floor((rest % MS_PR_TIME) / MS_PR_MINUT),
  };
}

function tilMidnat(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const ts = Date.UTC(year, month - 1, day);
  const d = new Date(ts);
  // Reject impossible dates like 2026-02-31 that overflow.
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) {
    return null;
  }
  return ts;
}

export function beregnNedtaelling(fraISO: string, tilISO: string): NedtaellingResultat | null {
  const fra = tilMidnat(fraISO);
  const til = tilMidnat(tilISO);
  if (fra === null || til === null) return null;

  const diffDage = Math.round((til - fra) / MS_PR_DAG);
  const abs = Math.abs(diffDage);

  return {
    dage: abs,
    uger: Math.floor(abs / 7),
    restDage: abs % 7,
    erFortid: diffDage < 0,
    tilTid: til,
  };
}
