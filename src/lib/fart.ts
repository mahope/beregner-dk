/**
 * Solve the speed / distance / time relationship: distance = speed · time.
 *
 * Given exactly two of the three values, compute the third. Distance is in
 * kilometres, time in hours and speed in km/h. Also derives running/cycling
 * pace in minutes per kilometre.
 */

export type FartMaal = "fart" | "distance" | "tid";

export interface FartResultat {
  fart: number; // km/h
  distance: number; // km
  tid: number; // hours
  paceMinPrKm: number; // minutes per km (0 if speed is 0)
}

export function beregnFart(
  maal: FartMaal,
  fart: number,
  distance: number,
  tid: number
): FartResultat | null {
  let f = fart;
  let d = distance;
  let t = tid;

  switch (maal) {
    case "fart":
      if (!d || d <= 0 || !t || t <= 0) return null;
      f = d / t;
      break;
    case "distance":
      if (!f || f <= 0 || !t || t <= 0) return null;
      d = f * t;
      break;
    case "tid":
      if (!f || f <= 0 || !d || d <= 0) return null;
      t = d / f;
      break;
  }

  return {
    fart: f,
    distance: d,
    tid: t,
    paceMinPrKm: f > 0 ? 60 / f : 0,
  };
}
