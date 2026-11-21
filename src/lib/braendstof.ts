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

/**
 * The Swedish set, in SEK. It exists because the Danish numbers are wrong in
 * Sweden in a way that flips the site's own conclusion: Danish diesel is
 * *cheaper* per litre than petrol (12,80 mod 13,50), while Swedish diesel was
 * measured at 22,81 SEK/l mod 17,57 SEK/l for petrol — about 30 % dearer
 * (GlobalPetrolPrices, 21-Sep-2026). Serving the Danish set on beraknare.se
 * therefore told Swedish visitors that diesel is the cheap option, and the
 * page's own "diesel vs. bensin" answer came out backwards.
 *
 * The el price is not from that source: it is the same 2 SEK/kWh that
 * ELBIL_FORUDSETNINGER.se has used since the /elbil tool was built, kept so
 * the two tools cannot drift apart.
 */
export const BRAENDSTOF_FORUDSETNINGER_SE = {
  benzin: { literPris: 17.57, kmPerLiter: 15 },
  diesel: { literPris: 22.81, kmPerLiter: 18 },
  el: { kwhPris: 2, kwhPer100km: 17 },
} as const;

export type BraendstofLocale = "da" | "se";

/** The assumptions for a site: Danish kroner on minberegner.dk, kronor on beraknare.se. */
export function braendstofForudsætninger(locale: string) {
  return locale === "se" ? BRAENDSTOF_FORUDSETNINGER_SE : BRAENDSTOF_FORUDSETNINGER;
}

/** Price per km for one fuel type, in the site's local currency. */
export function prisPrKm(type: BraendstofType, locale: string = "da"): number {
  const F = braendstofForudsætninger(locale);
  if (type === "el") {
    const { kwhPris, kwhPer100km } = F.el;
    return (kwhPris / 100) * kwhPer100km;
  }
  const { literPris, kmPerLiter } = F[type];
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

/** The distance every worked example on the page uses. */
export const BRAENDSTOF_EKSEMPEL_KM = 500;

/**
 * Litres per 100 km from km per litre. Fuel gauges in Denmark show l/100 km
 * while this tool and most manuals use km/l, so the page has to translate.
 * 15 km/l -> 6,7 l/100 km.
 */
export function literPr100km(kmPerLiter: number): number {
  if (kmPerLiter <= 0) return 0;
  return procent1Decimals(100 / kmPerLiter);
}

/** km per litre from litres per 100 km: 6,7 l/100 km -> 14,9 km/l. */
export function kmPrLiter(literPr100km: number): number {
  if (literPr100km <= 0) return 0;
  return procent1Decimals(100 / literPr100km);
}

/** Whole kroner, the unit the page's own examples use. 449,55 -> 450. */
export function heleKroner(value: number): number {
  return Math.round(value);
}

/** A Swedish mil is 10 km, and "kr per mil" is how Swedish drivers count cost. */
export const MIL_KM = 10;

/** Price per mil: price per km × 10. "räkna ut bränslekostnad per mil" is a real query. */
export function prisPrMil(type: BraendstofType, locale: string = "da"): number {
  return procent1Decimals(prisPrKm(type, locale) * MIL_KM);
}

/** Litres per mil from km per litre: 15 km/l -> 0,7 l/mil (0,67 rounded twice). */
export function literPrMil(kmPerLiter: number): number {
  return procent1Decimals(literPr100km(kmPerLiter) / MIL_KM);
}

export type BraendstofEksempelRække = {
  type: BraendstofType;
  /** "liter" or "kWh" — the unit the arithmetic above is in. */
  enhed: "liter" | "kWh";
  /** The consumption figure the page divides by: 15 km/l or 17 kWh/100 km. */
  forbrug: number;
  forbrugsEnhed: "km/l" | "kWh/100km";
  /** Litres (or kWh) for the example distance, one decimal: 33,3. */
  maengde: number;
  /** The rounded quantity times the unit price, in whole kroner. */
  pris: number;
  /** Unit price as used in the multiplication: 13,5 or 2,5. */
  enhedPris: number;
  prisPrKm: number;
  literPr100km: number | null;
};

/**
 * The worked example behind the page's "Sådan regner du" table. The litres are
 * rounded to one decimal *before* the price is multiplied, so every step in
 * the printed arithmetic is one the reader can check by hand — and the first
 * row is the same 450 kr. the title and description have always promised.
 */
export function braendstofEksempelRækker(km: number = BRAENDSTOF_EKSEMPEL_KM, locale: string = "da"): BraendstofEksempelRække[] {
  const benzin = braendstofForudsætninger(locale).benzin;
  const diesel = braendstofForudsætninger(locale).diesel;
  const el = braendstofForudsætninger(locale).el;
  const maengde = (kmPerLiter: number) => procent1Decimals(km / kmPerLiter);

  const benzinM = maengde(benzin.kmPerLiter);
  const dieselM = maengde(diesel.kmPerLiter);
  const elM = procent1Decimals((km / 100) * el.kwhPer100km);

  return [
    {
      type: "benzin",
      enhed: "liter",
      forbrug: benzin.kmPerLiter,
      forbrugsEnhed: "km/l",
      maengde: benzinM,
      enhedPris: benzin.literPris,
      pris: heleKroner(benzinM * benzin.literPris),
      prisPrKm: prisPrKm("benzin", locale),
      literPr100km: literPr100km(benzin.kmPerLiter),
    },
    {
      type: "diesel",
      enhed: "liter",
      forbrug: diesel.kmPerLiter,
      forbrugsEnhed: "km/l",
      maengde: dieselM,
      enhedPris: diesel.literPris,
      pris: heleKroner(dieselM * diesel.literPris),
      prisPrKm: prisPrKm("diesel", locale),
      literPr100km: literPr100km(diesel.kmPerLiter),
    },
    {
      type: "el",
      enhed: "kWh",
      forbrug: el.kwhPer100km,
      forbrugsEnhed: "kWh/100km",
      maengde: elM,
      enhedPris: el.kwhPris,
      pris: heleKroner(elM * el.kwhPris),
      prisPrKm: prisPrKm("el", locale),
      literPr100km: null,
    },
  ];
}

/**
 * The tank-fill arithmetic behind "find your own consumption": litres added
 * over kilometres driven. Real drivers have a trip computer, but plenty do the
 * sum themselves, and it is the one answer the tool cannot give for them.
 */
export const BRAENDSTOF_EGENT_FORBRUG = { liter: 40, km: 380 } as const;

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
