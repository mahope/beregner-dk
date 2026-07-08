/**
 * Your weight on other worlds.
 *
 * Weight (the force gravity exerts) scales with the local surface gravity,
 * while your mass stays the same. Each factor is the body's surface gravity
 * divided by Earth's (9.80665 m/s²).
 */

export interface Himmellegeme {
  id: string;
  faktor: number;
}

export const HIMMELLEGEMER: Himmellegeme[] = [
  { id: "merkur", faktor: 0.377 },
  { id: "venus", faktor: 0.905 },
  { id: "maane", faktor: 0.166 },
  { id: "mars", faktor: 0.379 },
  { id: "jupiter", faktor: 2.528 },
  { id: "saturn", faktor: 1.065 },
  { id: "uranus", faktor: 0.886 },
  { id: "neptun", faktor: 1.137 },
  { id: "pluto", faktor: 0.063 },
  { id: "sol", faktor: 27.94 },
];

export function vaegtPaaPlanet(jordVaegt: number, faktor: number): number | null {
  if (jordVaegt <= 0 || !Number.isFinite(jordVaegt) || faktor <= 0) return null;
  return jordVaegt * faktor;
}

export function alleVaegte(jordVaegt: number): { id: string; vaegt: number }[] | null {
  if (jordVaegt <= 0 || !Number.isFinite(jordVaegt)) return null;
  return HIMMELLEGEMER.map((h) => ({ id: h.id, vaegt: jordVaegt * h.faktor }));
}
