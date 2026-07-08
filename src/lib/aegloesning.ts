/**
 * Estimate the fertile window from the first day of the last period.
 *
 * Using the standard model, ovulation happens about 14 days before the next
 * period starts; the fertile window spans the five days before ovulation
 * plus ovulation day itself (sperm survive up to ~5 days).
 *
 *   next period    = last period + cycle length
 *   ovulation      = next period − 14 days
 *   fertile window = ovulation − 5 … ovulation + 1
 *
 * This is an estimate for planning, not a contraceptive method. Dates are
 * yyyy-mm-dd strings handled at midnight UTC.
 */

export interface AegloesningResultat {
  aegloesning: string;
  frugtbarStart: string;
  frugtbarSlut: string;
  naesteMenstruation: string;
}

const MS_PR_DAG = 24 * 60 * 60 * 1000;

function parseISO(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const ts = Date.UTC(y, mo - 1, d);
  const dt = new Date(ts);
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) {
    return null;
  }
  return ts;
}

function tilISO(ts: number): string {
  const d = new Date(ts);
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${d.getUTCFullYear()}-${mo}-${day}`;
}

export function beregnAegloesning(
  sidsteMenstruationISO: string,
  cykluslaengde: number
): AegloesningResultat | null {
  const start = parseISO(sidsteMenstruationISO);
  if (start === null) return null;
  if (!Number.isFinite(cykluslaengde) || cykluslaengde < 20 || cykluslaengde > 45) return null;

  const naeste = start + cykluslaengde * MS_PR_DAG;
  const aegloesning = naeste - 14 * MS_PR_DAG;

  return {
    aegloesning: tilISO(aegloesning),
    frugtbarStart: tilISO(aegloesning - 5 * MS_PR_DAG),
    frugtbarSlut: tilISO(aegloesning + 1 * MS_PR_DAG),
    naesteMenstruation: tilISO(naeste),
  };
}
