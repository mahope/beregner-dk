// Small, pure helpers for comparing rent and measurements with the dwelling area (e.g. from BBR).

/** Parses a user-entered number in Danish or plain format ("1.234,5", "65", "65,5"). */
export function parseDanskTal(raw: string): number | null {
  const s = raw.trim().replace(/\s/g, "");
  if (s === "") return null;
  // "9.500" is Danish for 9500; "65.5" (from a number input) stays a decimal.
  const normaliseret = s.includes(",")
    ? s.replace(/\./g, "").replace(",", ".")
    : /^\d{1,3}(\.\d{3})+$/.test(s)
      ? s.replace(/\./g, "")
      : s;
  const n = Number(normaliseret);
  return Number.isFinite(n) ? n : null;
}

/** Rent per m² per month and per year. Null unless both rent and area are positive. */
export function huslejePrM2(maanedligHusleje: number | null, areal: number | null): { maaned: number; aar: number } | null {
  if (!maanedligHusleje || !areal || maanedligHusleje <= 0 || areal <= 0) return null;
  const maaned = maanedligHusleje / areal;
  return { maaned, aar: maaned * 12 };
}

/** Difference between your own measurement and the registered area: positive means yours is larger. */
export function arealForskel(egetMaal: number | null, registreret: number | null): { m2: number; procent: number } | null {
  if (!egetMaal || !registreret || egetMaal <= 0 || registreret <= 0) return null;
  const m2 = egetMaal - registreret;
  return { m2, procent: (m2 / registreret) * 100 };
}
