import { SATSER_2026 } from "./satser-2026";

/**
 * Gaveafgift — hvor meget man må give skattefrit, og hvad afgiften bliver af
 * resten.
 *
 * Satserne kommer fra Skattestyrelsens egen oversigt «Gaver: Så meget må du
 * give i 2026» (skat.dk/borger/gaver-gevinster-og-legater/gaver-saa-meget-maa-du-give,
 * læst 7/10-2026). Der er tre gavemodtager-grupper i 2026:
 *
 *   - nær familie:            80.600 kr afgiftsfrit, 15 % af resten
 *   - bedsteforældre/stedforældre: 80.600 kr afgiftsfrit, 36,25 % af resten
 *   - svigerbørn:             28.200 kr afgiftsfrit, 15 % af resten
 *
 * Tallene ligger i {@link SATSER_2026}, så de har én ejer ligesom arveafgiften.
 * Modulet her er den regning, siden og værktøjet hævder, og de officielle
 * regneeksempler fra skat.dk står i `gaveafgift.test.ts` som port.
 */

export type GaveRelation = "naer" | "bedsteforaeldre" | "svigerboern";

export interface GaveRelationRegel {
  /** Det afgiftsfrie beløb pr. gavemodtager pr. kalenderår. */
  bundfradrag: number;
  /** Afgiften af beløbet over bundfradraget. */
  sats: number;
}

export const GAVE_RELATIONER: Record<GaveRelation, GaveRelationRegel> = {
  naer: { bundfradrag: SATSER_2026.gaveBundfradragNaer, sats: SATSER_2026.gaveafgift },
  bedsteforaeldre: {
    bundfradrag: SATSER_2026.gaveBundfradragNaer,
    sats: SATSER_2026.gaveafgiftBedsteforaeldre,
  },
  svigerboern: {
    bundfradrag: SATSER_2026.gaveBundfradragSvigerboern,
    sats: SATSER_2026.gaveafgift,
  },
};

export interface GaveResultat {
  /** Gaven, i kroner. */
  beloeb: number;
  /** Det afgiftsfrie beløb for relationen. */
  bundfradrag: number;
  /** Beløbet over bundfradraget — afgiftens grundlag. */
  grundlag: number;
  /** Afgiftssatsen for relationen, 0-1. */
  sats: number;
  /** Gaveafgiften. */
  afgift: number;
  /** Det gavemodtageren står tilbage med efter afgift. */
  modtager: number;
}

/**
 * Regner gaveafgiften for én gave. `null` for et beløb der ikke er et positivt
 * tal, så et tomt felt ikke giver «0 kr» som et svar.
 */
export function beregnGaveafgift(
  beloeb: number,
  relation: GaveRelation
): GaveResultat | null {
  if (typeof beloeb !== "number" || !Number.isFinite(beloeb) || beloeb <= 0) {
    return null;
  }
  const regel = GAVE_RELATIONER[relation];
  const grundlag = Math.max(0, beloeb - regel.bundfradrag);
  const afgift = grundlag * regel.sats;
  return {
    beloeb,
    bundfradrag: regel.bundfradrag,
    grundlag,
    sats: regel.sats,
    afgift,
    modtager: beloeb - afgift,
  };
}

/** Én række i eksempeltabellen på siden. */
export interface GaveEksempel {
  beloeb: number;
  relation: GaveRelation;
  resultat: GaveResultat;
}

/**
 * De fire beløb Skattestyrelsen selv viser for nær familie (80.600 / 100.000 /
 * 500.000 / 1.000.000) plus 100.000 kr til et svigerbarn. Alle er regnet af
 * {@link beregnGaveafgift}, så tabellen ikke kan glide fra værktøjet.
 */
export const GAVE_EKSEMPLER: GaveEksempel[] = (
  [
    { beloeb: 80_600, relation: "naer" },
    { beloeb: 100_000, relation: "naer" },
    { beloeb: 500_000, relation: "naer" },
    { beloeb: 1_000_000, relation: "naer" },
    { beloeb: 100_000, relation: "svigerboern" },
  ] as { beloeb: number; relation: GaveRelation }[]
).map(({ beloeb, relation }) => ({
  beloeb,
  relation,
  resultat: beregnGaveafgift(beloeb, relation)!,
}));
