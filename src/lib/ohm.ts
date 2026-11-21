/**
 * Ohm's law and electrical power.
 *
 *   V = I · R      (voltage = current · resistance)
 *   P = V · I      (power = voltage · current)
 *
 * Given which quantity to solve for and the two known values, compute the
 * target plus the power. Units: volt (V), ampere (A), ohm (Ω), watt (W).
 */

export type OhmMaal = "spaending" | "stroem" | "modstand";

export interface OhmResultat {
  spaending: number;
  stroem: number;
  modstand: number;
  effekt: number;
}

export function beregnOhm(
  maal: OhmMaal,
  spaending: number,
  stroem: number,
  modstand: number
): OhmResultat | null {
  let v = spaending;
  let i = stroem;
  let r = modstand;

  switch (maal) {
    case "spaending":
      if (!i || i <= 0 || !r || r <= 0) return null;
      v = i * r;
      break;
    case "stroem":
      if (!v || v <= 0 || !r || r <= 0) return null;
      i = v / r;
      break;
    case "modstand":
      if (!v || v <= 0 || !i || i <= 0) return null;
      r = v / i;
      break;
  }

  return { spaending: v, stroem: i, modstand: r, effekt: v * i };
}
