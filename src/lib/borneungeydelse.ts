/**
 * Børne- og ungeydelse 2026 — single source of truth.
 * Beløbene er pr. udbetalingsinterval, som de står hos borger.dk.
 * Kilde: https://www.borger.dk/familie-og-boern/familieydelser-oversigt/boerne-ungeydelse
 * Nedsættelse: https://www.borger.dk/familie-og-boern/familieydelser-oversigt/boerne-ungeydelse/boerne-ungeydelse-nedsaettelse
 * Verificeret: 2026-09-25
 */

export interface BoernSats {
  /** Aldersgruppe, som den står hos borger.dk. */
  alder: string;
  /** Nedre aldersgrænse i hele år. */
  fraAar: number;
  /** Hvor hyppigt beløbet udbetales. */
  interval: "kvartal" | "maaned";
  /** interval i dansk læsbar form, fx i prosa. */
  intervalNavn: "kvartal" | "måned";
  /** Hele beløbet pr. interval. */
  hel: number;
  /** Halvdelen af beløbet pr. interval, når forældrene har fælles forældremyndighed. */
  halv: number;
}

export const BOERNE_SATSER_2026: readonly BoernSats[] = [
  { alder: "0-2 år", fraAar: 0, interval: "kvartal", intervalNavn: "kvartal", hel: 5370, halv: 2685 },
  { alder: "3-6 år", fraAar: 3, interval: "kvartal", intervalNavn: "kvartal", hel: 4248, halv: 2124 },
  { alder: "7-14 år", fraAar: 7, interval: "kvartal", intervalNavn: "kvartal", hel: 3342, halv: 1671 },
  { alder: "15-17 år", fraAar: 15, interval: "maaned", intervalNavn: "måned", hel: 1114, halv: 557 },
] as const;

export const BOERNEUNGEYDELSE_2026 = {
  source:
    "https://www.borger.dk/familie-og-boern/familieydelser-oversigt/boerne-ungeydelse",
  nedsættelseSource:
    "https://www.borger.dk/familie-og-boern/familieydelser-oversigt/boerne-ungeydelse/boerne-ungeydelse-nedsaettelse",
  verifiedAt: "2026-09-25",
  /**
   * Nedsættelsen er fra 1. januar 2022 udelukkende ud fra egen indkomst — også når
   * forældrene bor sammen. Den anden forælders indkomst påvirker ikke ydelsen.
   */
  aftrapning: {
    /** Årligt indtægtsgrundlag, hvor nedsættelsen begynder. */
    graense: 961100,
    /** Nedsættelsen er 2 % af beløbet over grænsen. */
    pct: 0.02,
  },
  udbetaling: {
    boerneydelse: [20, 4, 7, 10] as const,
    ungeydelseDag: 20,
  },
} as const;

/** Antal udbetalinger pr. år for et givent interval. */
export function udbetalingerPrAar(interval: BoernSats["interval"]): number {
  return interval === "kvartal" ? 4 : 12;
}

/** Satsen for et barn med den givne alder, eller `undefined` hvis barnet er fyldt 18. */
export function satsForAlder(alder: number): BoernSats | undefined {
  if (!Number.isFinite(alder) || alder < 0) return undefined;
  return BOERNE_SATSER_2026.filter((sats) => alder >= sats.fraAar).at(-1);
}

/** Hele årsbeløbet for en sats, beregnet af de officielle intervalbeløb. */
export function aarligBelob(sats: BoernSats): number {
  return sats.hel * udbetalingerPrAar(sats.interval);
}

/**
 * Årlig nedsættelse ved indkomst over grænsen. Beregnes på indtægtsgrundlaget,
 * som hos Udbetaling Danmark svarer til beskatningsgrundlaget for mellemskat.
 */
export function beregnAftrapning(indtægtsgrundlag: number): number {
  if (!Number.isFinite(indtægtsgrundlag)) return 0;
  const over = indtægtsgrundlag - BOERNEUNGEYDELSE_2026.aftrapning.graense;
  if (over <= 0) return 0;
  return over * BOERNEUNGEYDELSE_2026.aftrapning.pct;
}
