import { KOMMUNER } from "./kommuner";
import { SATSER_2026 } from "./satser-2026";

/**
 * Kirkeskat — hvor meget du betaler i kirkeskat, og hvor meget du sparer ved
 * at melde dig ud af folkekirken.
 *
 * Kirkeskat er en skat til folkekirken, som betales af medlemmer af den
 * danske folkekirke. Satsen varierer kommune til kommune (0,42-1,10 % i 2026).
 * Grundlaget er den skattepligtige indkomst efter fradrag.
 *
 * Kilde: skm.dk/satser/statistik/kommuneskatter (se `kommuner.ts`).
 * Det gennemsnitlige tal står i `SATSER_2026.kirkeskatSnit` — samme kilde som
 * BruttoNettoBeregner og TopskatBeregner bruger, så de tre kan ikke glide
 * fra hinanden.
 */

export interface KirkeskatResultat {
  /** Skattepligtig indkomst efter fradrag, i kroner. */
  skattepligtig: number;
  /** Kirkeskattesatsen i procent. */
  sats: number;
  /** Kirkeskatten i kroner. */
  kirkeskat: number;
  /** Hvor meget du sparer pr. år ved at melde dig ud. */
  sparing: number;
}

/**
 * Regner kirkeskatten for en given skattepligtig indkomst og kommune.
 * `null` for en indkomst der ikke er et positivt tal.
 */
export function beregnKirkeskat(
  skattepligtig: number,
  kommune: string
): KirkeskatResultat | null {
  if (typeof skattepligtig !== "number" || !Number.isFinite(skattepligtig) || skattepligtig <= 0) {
    return null;
  }
  const sats = kirkeskatSats(kommune);
  const kirkeskat = Math.round(skattepligtig * (sats / 100));
  return {
    skattepligtig,
    sats,
    kirkeskat,
    sparing: kirkeskat,
  };
}

/** Kirkeskattesatsen for en kommune i procent. Ukendte kommuner får snit-satsen. */
export function kirkeskatSats(kommune: string): number {
  const fundet = KOMMUNER.find((k) => k.navn === kommune);
  return fundet?.kirkeskat ?? KIRKESKAT_SNIT;
}

/**
 * Gennemsnitlig kirkeskattesats i Danmark (vægtet efter indbyggertal), i
 * **procent** — samme enhed som `KOMMUNER[].kirkeskat`, så den kan bruges som
 * fallback i {@link kirkeskatSats}. `SATSER_2026.kirkeskatSnit` er en brøkdel
 * (0,00639), derfor ganges den med 100 her.
 */
export const KIRKESKAT_SNIT = SATSER_2026.kirkeskatSnit * 100;

/**
 * Den skattepligtige indkomst, som sidens gennemgående eksempel bruger (i
 * kroner). Både brødteksten og metadata læser den herfra, så eksemplet i teksten
 * ikke kan glide fra det tal, beregneren regner på (punkt 11).
 */
export const KIRKESKAT_EKSEMPEL_INDKOMST = 450_000;

/** Én række i eksempeltabellen på siden. */
export interface KirkeskatEksempel {
  skattepligtig: number;
  kommune: string;
  resultat: KirkeskatResultat;
}

/**
 * Eksempler med forskellige indkomster og kommuner. Alle er regnet af
 * {@link beregnKirkeskat}, så tabellen ikke kan glide fra værktøjet.
 */
export const KIRKESKAT_EKSEMPLER: KirkeskatEksempel[] = (
  [
    { skattepligtig: 300_000, kommune: "København" },
    { skattepligtig: 400_000, kommune: "Aarhus" },
    { skattepligtig: 500_000, kommune: "Odense" },
    { skattepligtig: 600_000, kommune: "Aalborg" },
  ] as { skattepligtig: number; kommune: string }[]
).map(({ skattepligtig, kommune }) => ({
  skattepligtig,
  kommune,
  resultat: beregnKirkeskat(skattepligtig, kommune)!,
}));

/**
 * De kommuner, der står i satslisten under «Kirkeskattesatser i 2026». Læst fra
 * `kommuner.ts` — samme kilde som `kirkeskatSats`, så en ny sats i 2027 flytter
 * tallene med i stedet for at stå stille (punkt 11).
 */
export const KIRKESKAT_SATS_EKSEMPLER = [
  "København",
  "Frederiksberg",
  "Aarhus",
  "Odense",
  "Aalborg",
] as const;
