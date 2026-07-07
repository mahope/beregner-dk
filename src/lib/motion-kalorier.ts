/**
 * Estimate calories burned during exercise using MET values.
 *
 *   kcal = MET · weight(kg) · duration(hours)
 *
 * MET (metabolic equivalent of task) values follow the Compendium of
 * Physical Activities. The result is an estimate; actual burn varies with
 * intensity, fitness and individual metabolism.
 */

export interface Aktivitet {
  id: string;
  met: number;
}

export const AKTIVITETER: Aktivitet[] = [
  { id: "gang", met: 3.5 },
  { id: "raskGang", met: 5.0 },
  { id: "loeb", met: 9.8 },
  { id: "cykling", met: 7.5 },
  { id: "svoemning", met: 8.0 },
  { id: "styrketraening", met: 6.0 },
  { id: "yoga", met: 3.0 },
  { id: "fodbold", met: 7.0 },
  { id: "dans", met: 5.5 },
  { id: "roning", met: 7.0 },
];

export function findAktivitet(id: string): Aktivitet | undefined {
  return AKTIVITETER.find((a) => a.id === id);
}

export function beregnMotionKalorier(
  met: number,
  vaegtKg: number,
  minutter: number
): number | null {
  if (met <= 0 || vaegtKg <= 0 || minutter <= 0) return null;
  return met * vaegtKg * (minutter / 60);
}
