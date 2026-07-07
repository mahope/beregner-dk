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
}

const MS_PR_DAG = 24 * 60 * 60 * 1000;

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
  };
}
