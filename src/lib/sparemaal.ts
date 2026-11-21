/**
 * Work out the monthly deposit needed to reach a savings goal.
 *
 * Uses the future-value-of-annuity formula (deposits at the end of each
 * month) and lets an optional starting balance grow alongside the deposits:
 *
 *   i   = annualRate/100 / 12
 *   N   = years · 12
 *   FV_start   = start · (1+i)^N
 *   remaining  = goal − FV_start
 *   deposit    = remaining · i / ((1+i)^N − 1)      (or remaining/N if i = 0)
 *
 * If the starting balance already grows past the goal, the deposit is 0.
 */

export interface SparemaalResultat {
  maanedligOpsparing: number;
  totalIndbetalt: number;
  renterTjent: number;
}

export function beregnSparemaal(
  maal: number,
  aar: number,
  aarligRente: number,
  startbeloeb: number
): SparemaalResultat | null {
  if (maal <= 0 || !Number.isFinite(maal) || aar <= 0 || !Number.isFinite(aar)) return null;

  const start = startbeloeb > 0 ? startbeloeb : 0;
  const i = aarligRente / 100 / 12;
  const N = Math.round(aar * 12);

  const fvStart = start * Math.pow(1 + i, N);
  const remaining = maal - fvStart;

  let maanedlig: number;
  if (remaining <= 0) {
    maanedlig = 0;
  } else if (i === 0) {
    maanedlig = remaining / N;
  } else {
    maanedlig = (remaining * i) / (Math.pow(1 + i, N) - 1);
  }

  const totalIndbetalt = maanedlig * N + start;
  return {
    maanedligOpsparing: maanedlig,
    totalIndbetalt,
    renterTjent: maal - totalIndbetalt,
  };
}
