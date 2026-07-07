/**
 * Convert between units of length, weight and volume via a base unit.
 *
 * Each unit stores its size expressed in the group's base unit (metre for
 * length, gram for weight, litre for volume). To convert, a value is first
 * turned into the base unit and then divided by the target unit's factor.
 */

export type EnhedsGruppe = "laengde" | "vaegt" | "volumen";

export interface Enhed {
  id: string;
  factor: number; // size of one unit expressed in the base unit
}

export const ENHEDER: Record<EnhedsGruppe, Enhed[]> = {
  laengde: [
    { id: "mm", factor: 0.001 },
    { id: "cm", factor: 0.01 },
    { id: "m", factor: 1 },
    { id: "km", factor: 1000 },
    { id: "inch", factor: 0.0254 },
    { id: "foot", factor: 0.3048 },
    { id: "yard", factor: 0.9144 },
    { id: "mile", factor: 1609.344 },
    { id: "sømil", factor: 1852 },
  ],
  vaegt: [
    { id: "mg", factor: 0.001 },
    { id: "g", factor: 1 },
    { id: "kg", factor: 1000 },
    { id: "ton", factor: 1_000_000 },
    { id: "ounce", factor: 28.349523125 },
    { id: "pound", factor: 453.59237 },
    { id: "stone", factor: 6350.29318 },
  ],
  volumen: [
    { id: "ml", factor: 0.001 },
    { id: "cl", factor: 0.01 },
    { id: "dl", factor: 0.1 },
    { id: "l", factor: 1 },
    { id: "m3", factor: 1000 },
    { id: "gallon", factor: 3.785411784 },
    { id: "pint", factor: 0.473176473 },
  ],
};

export function findEnhed(gruppe: EnhedsGruppe, id: string): Enhed | undefined {
  return ENHEDER[gruppe].find((e) => e.id === id);
}

export function konverterEnhed(
  vaerdi: number,
  gruppe: EnhedsGruppe,
  fraId: string,
  tilId: string
): number | null {
  if (typeof vaerdi !== "number" || Number.isNaN(vaerdi)) return null;
  const fra = findEnhed(gruppe, fraId);
  const til = findEnhed(gruppe, tilId);
  if (!fra || !til) return null;
  return (vaerdi * fra.factor) / til.factor;
}
