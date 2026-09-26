/**
 * The fuel assumptions behind /braendstof: price per km for petrol, diesel and
 * electricity, plus the resulting savings. Single source so the comparison table
 * and the FAQ cannot drift apart the way the old "50-70 %" promise did.
 */

export type BraendstofType = "benzin" | "diesel" | "el";

/** Editable assumptions behind the comparison table. Not live market prices. */
export const BRAENDSTOF_FORUDSETNINGER = {
  benzin: { literPris: 13.5, kmPerLiter: 15 },
  diesel: { literPris: 12.8, kmPerLiter: 18 },
  el: { kwhPris: 2.5, kwhPer100km: 17 },
} as const;

/** Price per km for one fuel type, in DKK. */
export function prisPrKm(type: BraendstofType): number {
  if (type === "el") {
    const { kwhPris, kwhPer100km } = BRAENDSTOF_FORUDSETNINGER.el;
    return (kwhPer100km / 100) * kwhPris;
  }
  const { literPris, kmPerLiter } = BRAENDSTOF_FORUDSETNINGER[type];
  return literPris / kmPerLiter;
}

/**
 * How much cheaper el is than `type`, in percent. Negative means el is the
 * more expensive of the two.
 */
export function besparelseProcent(type: BraendstofType): number {
  const el = prisPrKm("el");
  const other = prisPrKm(type);
  if (other <= 0) return 0;
  return ((other - el) / other) * 100;
}

/**
 * El price per kWh at which el costs the same per km as `type`. Above this,
 * el is the more expensive of the two.
 */
export function breakEvenKwhPris(type: Exclude<BraendstofType, "el">): number {
  const { kwhPer100km } = BRAENDSTOF_FORUDSETNINGER.el;
  return prisPrKm(type) / (kwhPer100km / 100);
}

/** Round a ratio to one decimal for display: 52.777 -> 52.8. */
export function procent1Decimals(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * The defaults behind the /elbil tool. Deliberately a second set: the table on
 * /braendstof is a conservative fleet average, this is one modern car. Both
 * point the same way — 18 kWh/100 km costs more than the table's 17 and 16 km/l
 * saves less than the table's 15 — so /elbil's saving (46.7 %) is the smaller
 * of the two. The test "de to sammenligninger peger samme vej" locks that, so a
 * future edit has to be a conscious choice.
 */
export const ELBIL_FORUDSETNINGER = {
  da: {
    elKwhPris: 2.5,
    elKwhPer100km: 18,
    benzinLiterPris: 13.5,
    benzinKmPerLiter: 16,
    kmPrAar: 15000,
    aar: 5,
  },
  se: {
    elKwhPris: 2,
    elKwhPer100km: 18,
    benzinLiterPris: 19,
    benzinKmPerLiter: 16,
    kmPrAar: 15000,
    aar: 5,
  },
} as const;

export type ElbilLocale = keyof typeof ELBIL_FORUDSETNINGER;

/** Anything that is not the Swedish site gets the Danish defaults. */
export function elbilForudsætninger(locale: string) {
  return locale === "se" ? ELBIL_FORUDSETNINGER.se : ELBIL_FORUDSETNINGER.da;
}

/** Price per km for el or petrol under the /elbil defaults, in DKK. */
export function elbilPrisPrKm(locale: string, type: "el" | "benzin"): number {
  const f = elbilForudsætninger(locale);
  return type === "el"
    ? (f.elKwhPer100km / 100) * f.elKwhPris
    : f.benzinLiterPris / f.benzinKmPerLiter;
}

/**
 * What the /elbil defaults actually add up to. The page prose, both FAQ
 * answers and the biloekonomi article read this, so none of them can promise
 * something the tool does not show.
 */
export function elbilSammenligning(locale: string) {
  const f = elbilForudsætninger(locale);
  const elPrisPrKm = elbilPrisPrKm(locale, "el");
  const benzinPrisPrKm = elbilPrisPrKm(locale, "benzin");
  const besparelse = benzinPrisPrKm > 0 ? ((benzinPrisPrKm - elPrisPrKm) / benzinPrisPrKm) * 100 : 0;
  return {
    forudsætninger: f,
    elPrisPrKm,
    benzinPrisPrKm,
    /** Rounded for display: 46.666 -> 46.7 */
    besparelseProcent: procent1Decimals(besparelse),
    /** Rounded to the nearest 100 for prose: 5906.25 -> 5900 */
    aarligBesparelse: Math.round(((benzinPrisPrKm - elPrisPrKm) * f.kmPrAar) / 100) * 100,
    /** El price per kWh where el costs the same per km as petrol. */
    breakEvenKwhPris: procent1Decimals(benzinPrisPrKm / (f.elKwhPer100km / 100)),
  };
}
