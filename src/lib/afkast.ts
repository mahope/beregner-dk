/**
 * Return on investment (ROI).
 *
 *   gain%      = (end − start) / start · 100
 *   annualised = ((end / start)^(1/years) − 1) · 100
 *
 * The annualised figure (CAGR) is only returned when a positive number of
 * years is given and both amounts are positive.
 */

export interface AfkastResultat {
  gevinst: number;
  afkastProcent: number;
  aarligProcent: number | null;
}

export function beregnAfkast(
  startbeloeb: number,
  slutbeloeb: number,
  aar: number
): AfkastResultat | null {
  if (startbeloeb <= 0 || !Number.isFinite(startbeloeb) || !Number.isFinite(slutbeloeb)) {
    return null;
  }

  const gevinst = slutbeloeb - startbeloeb;
  const afkastProcent = (gevinst / startbeloeb) * 100;

  let aarligProcent: number | null = null;
  if (aar > 0 && slutbeloeb > 0) {
    aarligProcent = (Math.pow(slutbeloeb / startbeloeb, 1 / aar) - 1) * 100;
  }

  return { gevinst, afkastProcent, aarligProcent };
}
