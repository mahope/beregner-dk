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
