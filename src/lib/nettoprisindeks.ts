/**
 * Nettoprisindekset and the rent regulation behind it.
 *
 * Two different Danish price indices are routinely confused, and the
 * confusion is the single most common question on /husleje ("nettoprisindeks
 * husleje beregner" is autocomplete nr. 3 under "husleje beregner"):
 *
 * - **Forbrugerprisindekset (CPI)** includes indirect taxes (moms, told, excise),
 *   so it also moves when the tax rate changes. `pristalsregulering` — the yearly
 *   rent adjustment a lease contract *must* follow — is based on this one.
 * - **Nettoprisindekset (NPI)** excludes indirect taxes. It is the figure the
 *   press quotes when it reports that "huslejen stiger X procent", and it is
 *   what `huslejenævnet` uses for the *frivillige* annual rent increases.
 *
 * Both are published monthly by Danmarks Statistik. Values here are the ones
 * DST published 2026-09-10 for August 2026 (index base 2025 = 100), fetched
 * from the StatBank API:
 *
 *   https://api.statbank.dk/v1/data/PRIS01/CSV?VAREGR=000000&ENHED=300
 *   https://api.statbank.dk/v1/data/PRIS04/CSV?VAREGR=000005,04110&ENHED=100,300
 *
 * `NETTOPRISINDELS_2026M08.aarsVaeksningPct` is DST's own published year-on-year
 * figure (2.9 %), NOT one computed here: DST rounds its index to two decimals,
 * so recomputing it from the index level drifts by up to 0.1 pp. See
 * `udregnNettoprisindeks` for the case where the percentage *is* derived.
 */

/** StatBank period code for the month these figures describe. */
export const NETTOPRISINDELS_PERIODE = "2026M08";

/** Danish month name matching {@link NETTOPRISINDELS_PERIODE}. */
export const NETTOPRISINDELS_MAANED = "august 2026";

/** StatBank tables the two indices come from. */
export const NETTOPRISINDELS_KILDE = {
  forbrugerprisindeks: "PRIS01",
  nettoprisindeks: "PRIS04",
  huslejegruppe: "PRIS04 (04.1.1 Faktisk husleje)",
} as const;

export interface PrisindeksSnapshot {
  /** Index level, 2025 = 100. */
  indeks: number;
  /** DST's published change over the 12 months, in percent. */
  aarsVaeksningPct: number;
  /** Raw values straight from StatBank, as written with a Danish comma. */
  raav: { indeks: string; aarsVaeksning: string };
}

/** Forbrugerprisindekset, August 2026: 2.0 % — the pristalsregulering basis. */
export const FORBRUGERPRISINDEKS_2026M08: PrisindeksSnapshot = {
  indeks: 102.58,
  aarsVaeksningPct: 2.0,
  raav: { indeks: "102,58", aarsVaeksning: "2,00" },
};

/** Nettoprisindekset, August 2026: 2.9 % — the figure reported in the press. */
export const NETTOPRISINDEKS_2026M08: PrisindeksSnapshot = {
  indeks: 103.5,
  aarsVaeksningPct: 2.9,
  raav: { indeks: "103,50", aarsVaeksning: "2,90" },
};

/**
 * DST's own rent subgroup, "04.1.1 Faktisk husleje betalt af lejere for
 * primær bolig": 2.6 %. It is the closest thing DST publishes to "how much have
 * rents actually risen", and it is *lower* than the headline nettoprisindeks —
 * which is why the page shows both instead of only the headline.
 */
export const FAKTISK_HUSLEJE_2026M08: PrisindeksSnapshot = {
  indeks: 102.91,
  aarsVaeksningPct: 2.6,
  raav: { indeks: "102,91", aarsVaeksning: "2,60" },
};

/** Netoprisindekset, the four quarters around the current month, as DST has it. */
export const NETTOPRISINDEKS_MAANEDER = {
  "2025M04": 99.37,
  "2025M05": 99.43,
  "2025M06": 99.73,
  "2025M07": 101.31,
  "2025M08": 100.62,
  "2025M09": 100.42,
  "2025M10": 100.93,
  "2025M11": 100.46,
  "2025M12": 100.1,
  "2026M01": 100.27,
  "2026M02": 101.36,
  "2026M03": 101.25,
  "2026M04": 101.49,
  "2026M05": 102.13,
  "2026M06": 102.38,
  "2026M07": 103.96,
  "2026M08": 103.5,
} as const satisfies Record<string, number>;

/** StatBank quarter code -> the three month codes that make it up. */
export const KVARTER_MAANEDER: Record<string, readonly [string, string, string]> = {
  "2025K2": ["2025M04", "2025M05", "2025M06"],
  "2025K3": ["2025M07", "2025M08", "2025M09"],
  "2025K4": ["2025M10", "2025M11", "2025M12"],
  "2026K1": ["2026M01", "2026M02", "2026M03"],
  "2026K2": ["2026M04", "2026M05", "2026M06"],
  "2026K3": ["2026M07", "2026M08", "2026M09"],
};

/**
 * The average nettoprisindeks for a quarter, or null when the table lacks any
 * of its months. A quarter is only returned once *all three* months are
 * published — 2026K3 is deliberately null today because September 2026 is not
 * out until 2026-10-08, and a two-month average would understate the rise.
 */
export function kvartalsgennemsnit(kvartal: string): number | null {
  const maaneder = KVARTER_MAANEDER[kvartal];
  if (!maaneder) return null;
  const vaerdier = maaneder.map((m) => NETTOPRISINDEKS_MAANEDER[m as keyof typeof NETTOPRISINDEKS_MAANEDER]);
  if (vaerdier.some((v) => v === undefined)) return null;
  return vaerdier.reduce((a, b) => a + b, 0) / vaerdier.length;
}

/**
 * The most recent quarter that can be computed, i.e. the one rent regulation
 * would look at today.
 */
export function senesteKompletteKvartal(): string | null {
  for (const kvartal of Object.keys(KVARTER_MAANEDER).reverse()) {
    if (kvartalsgennemsnit(kvartal) !== null) return kvartal;
  }
  return null;
}

/**
 * Quarter-on-same-quarter-last-year rise in the nettoprisindeks, in percent.
 * Null unless both quarters are complete — this is the percentage a
 * huslejenævn ruling is closest to, and it is derived, not published.
 */
export function udregnNettoprisindeks(kvartal: string): number | null {
  const nu = kvartalsgennemsnit(kvartal);
  const foer = kvartalsgennemsnit(fraKvartalTilKvartal(kvartal, -4));
  if (nu === null || foer === null || foer === 0) return null;
  return ((nu / foer) - 1) * 100;
}

/** "2026K2" with an offset of -4 -> "2025K2". Handles the year boundary. */
export function fraKvartalTilKvartal(kvartal: string, forskydningKvartaler: number): string {
  const match = /^(\d{4})K([1-4])$/.exec(kvartal);
  if (!match) return kvartal;
  const aar = Number(match[1]);
  const q = Number(match[2]) - 1;
  const absolut = aar * 4 + q + forskydningKvartaler;
  return `${Math.floor(absolut / 4)}K${(absolut % 4) + 1}`;
}

export interface Huslejestigning {
  /** The rent before the increase, in whole kroner. */
  foer: number;
  /** The increase in whole kroner. */
  stigning: number;
  /** The rent after the increase, in whole kroner. */
  efter: number;
  /** The percentage applied, unrounded. */
  pct: number;
}

/**
 * Applies a percentage increase to a rent and rounds the *increase* — not the
 * total — to whole kroner, which is how a rent notice is issued: the tenant
 * reads one number, "din husleje stiger X kr.", off a fixed starting rent.
 */
export function beregnHuslejestigning(husleje: number, pct: number): Huslejestigning {
  const foer = Math.round(husleje);
  const stigning = Math.round((husleje * pct) / 100);
  return { foer, stigning, efter: foer + stigning, pct };
}
