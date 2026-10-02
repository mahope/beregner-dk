/**
 * Running pace: convert between distance, time and pace, and split a distance
 * into per-kilometre times.
 *
 * Tempo is seconds per kilometre. The result is plain numbers, never
 * formatted strings — the decimal separator depends on the locale. The UI
 * formats seconds with `formatSekunder` from `tidsberegner.ts`.
 *
 * The formulas are pure arithmetic, so nothing here needs an external source.
 */

import { formatNumber } from "./format";
import type { Locale } from "./i18n";

export type PaceModus = "tid" | "tempo";

export interface PaceResultat {
  /** Distance in kilometres. */
  distanceKm: number;
  /** Total time in seconds. */
  totalSek: number;
  /** Average pace in seconds per kilometre. */
  sekunderPerKm: number;
  /**
   * One split per whole kilometre, plus a final partial split when the
   * distance is not a whole number of kilometres.
   */
  splits: number[];
}

/**
 * Time in seconds for a distance, from an average pace in seconds per km.
 * 5 km at 5:00 pr. km is 25 minutes, i.e. 1500 seconds.
 */
export function beregnTid(distanceKm: number, sekunderPerKm: number): number | null {
  if (!Number.isFinite(distanceKm) || !Number.isFinite(sekunderPerKm)) return null;
  if (distanceKm <= 0 || sekunderPerKm <= 0) return null;
  return Math.round(distanceKm * sekunderPerKm);
}

/**
 * Split times per whole kilometre.
 *
 * The last split absorbs the rounding remainder, so the splits always add up
 * to `totalSek`. Rounding every split on its own would let the sum drift by a
 * second per kilometre, which is exactly the kind of error a runner notices.
 */
export function beregnSplits(distanceKm: number, totalSek: number): number[] {
  if (!Number.isFinite(distanceKm) || !Number.isFinite(totalSek)) return [];
  if (distanceKm <= 0 || totalSek <= 0) return [];

  const antal = Math.ceil(distanceKm);
  const perKm = totalSek / distanceKm;
  const splits: number[] = [];
  let brugt = 0;

  for (let i = 0; i < antal - 1; i++) {
    const sek = Math.round(perKm);
    splits.push(sek);
    brugt += sek;
  }
  splits.push(Math.round(totalSek - brugt));

  return splits;
}

/**
 * Solve pace from time, or time from pace.
 *
 * `tidSek` is read in `tid` mode and `sekunderPerKm` in `tempo` mode; the
 * unused one is ignored. Returns null when the inputs cannot describe a real
 * run, so the UI can show a placeholder instead of NaN.
 */
export function beregnPace(
  modus: PaceModus,
  distanceKm: number,
  tidSek: number,
  sekunderPerKm: number
): PaceResultat | null {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return null;

  const totalSek =
    modus === "tid" ? (Number.isFinite(tidSek) ? Math.round(tidSek) : null) : beregnTid(distanceKm, sekunderPerKm);

  if (totalSek === null || totalSek <= 0) return null;

  return {
    distanceKm,
    totalSek,
    sekunderPerKm: Math.round(totalSek / distanceKm),
    splits: beregnSplits(distanceKm, totalSek),
  };
}

/**
 * Seconds as a race time: "4:59" under an hour, "3:29:40" over it.
 *
 * The one place in this module that returns a string, because a total time is
 * only readable with the hours attached. `formatSekunder` in `tidsberegner.ts`
 * leaves the hours out, which is right for a pace but not for a marathon. The
 * result is safe in every locale — it is digits and colons, with no decimal
 * separator to disagree about.
 */
export function formaterLobetid(sekunder: number): string {
  const hele = Math.max(0, Math.round(sekunder));
  const timer = Math.floor(hele / 3600);
  const minutter = Math.floor((hele % 3600) / 60);
  const rest = hele % 60;
  return timer > 0
    ? `${timer}:${String(minutter).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
    : `${minutter}:${String(rest).padStart(2, "0")}`;
}

/**
 * The distances Danish and Swedish runners actually search for by name —
 * measured 2/10 on Google autocomplete, hl=da gl=dk, where "tid beregner"
 * returned "marathon tid beregner", "halvmarathon tid beregner", "km tid
 * beregner", "cykel tid beregner", "ironman tid beregner", "triathlon tid
 * beregner" and "pace tid beregner": seven of ten completions under the term
 * with by far the largest volume on the site (`tid beregner`, ~27k searches
 * pr. måned, position 5).
 *
 * The official half-marathon distance is 21.0975 km and the marathon
 * 42.195 km; both are fixed by the race rules, not chosen by us, so they need
 * no source. The *times* are examples — they are the same two the page's own
 * body text already uses — and they are computed with `beregnPace`, the very
 * function behind the tool, so the answer in the FAQ cannot drift from the
 * number the calculator shows.
 */
export interface DistanceEksempel {
  id: string;
  distanceKm: number;
  /** The example finish time, in seconds. */
  totalSek: number;
}

export const DISTANCE_EKSEMPLER: DistanceEksempel[] = [
  {
    id: "maraton",
    distanceKm: 42.195,
    totalSek: 3 * 3600 + 30 * 60,
  },
  {
    id: "halvmaraton",
    distanceKm: 21.0975,
    totalSek: 105 * 60,
  },
  {
    id: "tiaaenkilometer",
    distanceKm: 10,
    totalSek: 50 * 60,
  },
];

/**
 * The FAQ answer for one distance, built from the module.
 *
 * Before this, `/pace`'s FAQ carried the marathon and half-marathon answers as
 * hand-typed sentences while the numbers in the body text were computed — the
 * "claims in the prose are code" gap that `timerIPeriode` closed for
 * `/tidsberegner`. The sentence therefore gets its distance, its time and its
 * pace from `beregnPace`, so the three cannot disagree, and both languages get
 * the same answer from one source.
 */
export function distanceEksempelFaqSvar(
  id: DistanceEksempel["id"],
  locale: Locale
): string {  const eksempel = DISTANCE_EKSEMPLER.find((e) => e.id === id);
  if (!eksempel) return "";

  const resultat = beregnPace("tid", eksempel.distanceKm, eksempel.totalSek, 0)!;
  const distance = formatNumber(eksempel.distanceKm, locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
  const tid = formaterLobetid(resultat.totalSek);
  const pace = formaterLobetid(resultat.sekunderPerKm);

  return locale === "se"
    ? `På ${distance} km är ${tid} ett tempo på ${pace} per kilometer. Samma regel gäller alla distanser: dela tiden med sträckan.`
    : `På ${distance} km er ${tid} et tempo på ${pace} pr. kilometer. Samme regel gælder alle distancer: del tiden med distancen.`;
}