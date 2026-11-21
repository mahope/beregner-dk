import { beregnPromille, GRAM_PR_GENSTAND, type Koen } from "./promille";

/**
 * "Hur många promille är N öl?" — dansk autocomplete under "promille efter"
 * og svensk under "promille efter" giver begge 10/10 variationer i præcis
 * samme spørgsmål, og `/promille` havde tabellen kun i den danske gren.
 *
 * Der står **intet tal** i denne fil. Hver celle går gennem `beregnPromille`
 * — samme modul som værktøjet bruger — så tabellen, FAQ'en og beregneren
 * ikke kan glide fra hinanden, og tallene kan ikke blive ændret på den ene
 * side uden at den anden følger med.
 */

export interface PromilleGenstandeRaekke {
  /** Antal genstande/standardglas, 1-6. */
  genstande: number;
  /** Gram ren alkohol i rækken. */
  gram: number;
  promille: Record<string, number>;
}

/**
 * De tre kroppe danske og svenske læsere spørger om. Rækkeorden er den
 * samme på begge sprog, så en læser kan læse lige og sammenligne.
 */
export const PROMILLE_VAEGTE: { vaegtKg: number; koen: Koen }[] = [
  { vaegtKg: 80, koen: "mand" },
  { vaegtKg: 70, koen: "mand" },
  { vaegtKg: 60, koen: "kvinde" },
];

/** Antal genstande i tabellen. Rækkerne er valgt efter den danske side. */
const ANTAL = [1, 2, 3, 4, 6];

export const PROMILLE_GENSTANDE_RAEKKER: PromilleGenstandeRaekke[] = ANTAL.map((genstande) => {
  const promille: Record<string, number> = {};
  for (const { vaegtKg, koen } of PROMILLE_VAEGTE) {
    const r = beregnPromille(genstande, vaegtKg, koen, 0);
    if (!r) {
      throw new Error(
        `Promille-rækken ${genstande} genstande / ${vaegtKg} kg kan ikke beregnes af beregnPromille`
      );
    }
    promille[`${vaegtKg}-${koen}`] = r.promille;
  }
  return { genstande, gram: genstande * GRAM_PR_GENSTAND, promille };
});

/** Nøglen en vægt/køn har i `PromilleGenstandeRaekke.promille`. */
export function vaegtNogle(vaegtKg: number, koen: Koen): string {
  return `${vaegtKg}-${koen}`;
}

/** "0,22" — både dansk og svensk bruger komma, og tallet skal skrives ens. */
export function formatPromilleTabel(promille: number): string {
  return promille.toFixed(2).replace(".", ",");
}

/**
 * Den danske regel om grænsen læst af beregningen: "0,66 ‰ efter tre" er
 * over 0,5, "0,50 ‰ ved to" er præcis på den, "0,44 ‰" er under. Svensk
 * læser har 0,2 ‰, så de samme tal giver et andet svar — derfor er
 * grænsen et argument og ikke en konstant.
 *
 * `0,5` (to øl på 70 kg) ligger præcis på den danske grænse, og
 * `beregnPromille` markerer præcis-grænsen med `paaGraensen`, så
 * teksten kan sige "på grænsen" frem for at påstå man er over den.
 */
export type GraenseSvar = "under" | "paa" | "over";

export function graenseSvar(
  promille: number,
  graense: number
): GraenseSvar {
  if (promille < graense) return "under";
  if (promille > graense) return "over";
  return "paa";
}

/**
 * Hvor mange genstande der skal til for at nå en given kropsvægt/køn.
 * Bruges i brødteksten til at sige "grænsen nås mellem to og tre øl"
 * uden at nogen antal står hårdkodet to steder.
 */
export function genstandeTilGraense(vaegtKg: number, koen: Koen, graense: number): number | null {
  for (let antal = 1; antal <= 12; antal += 1) {
    const r = beregnPromille(antal, vaegtKg, koen, 0);
    if (r && r.promille >= graense) return antal;
  }
  return null;
}
