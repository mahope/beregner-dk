/**
 * Convert a salary between hourly, monthly and yearly amounts.
 *
 * The conversion assumes a fixed number of working hours per week across
 * 52 weeks a year:
 *   yearly  = hourly · hoursPerWeek · 52
 *   monthly = yearly / 12
 *
 * A Danish full-time week is typically 37 hours; a Swedish one 40 hours.
 * These are gross (pre-tax) amounts.
 */

export type LoenEnhed = "time" | "maaned" | "aar";

export interface LoenKonvertering {
  time: number;
  maaned: number;
  aar: number;
}

const WEEKS_PER_YEAR = 52;

export function konverterLoen(
  beloeb: number,
  enhed: LoenEnhed,
  timerPrUge: number
): LoenKonvertering | null {
  if (!beloeb || beloeb < 0 || !timerPrUge || timerPrUge <= 0) return null;

  const timerPrAar = timerPrUge * WEEKS_PER_YEAR;

  let aar: number;
  switch (enhed) {
    case "time":
      aar = beloeb * timerPrAar;
      break;
    case "maaned":
      aar = beloeb * 12;
      break;
    case "aar":
      aar = beloeb;
      break;
  }

  return {
    time: aar / timerPrAar,
    maaned: aar / 12,
    aar,
  };
}
