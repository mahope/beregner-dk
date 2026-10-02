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