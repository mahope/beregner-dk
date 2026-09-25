/**
 * Rentefradragets værdi — den beløbsgrænsebaserede to-trinssats.
 *
 * Fradragsværdien af et års renteudgifter er 33,6 % for de første
 * 50.000 kr. (100.000 kr. for ægtepar/samlevende med fælles økonomi) og
 * 25,6 % for beløbet derudover. Værdien afhænger altså af beløbsgrænsen —
 * ikke af kommunen og ikke af om personen betaler topskat, fordi
 * rentefradraget er et kapitalindkomstfradrag.
 *
 * Renteindtægter og renteudgifter nettinges først, så inputtet er den
 * negative kapitalindkomst (udgifter minus indtægter) som et positivt tal.
 *
 * Kilde og verificeringsdato: RENTEFRADRAG_2026 i satser-2026.ts.
 * Se IMPLEMENTATION_PLAN.md (opgave R1).
 */
import { RENTEFRADRAG_2026 } from "./satser-2026";

export type CivilStatus = "single" | "couple";

export interface RentefradragResultat {
  /** Beløbsgrænsen for den høje sats, i kroner. */
  graense: number;
  /** Delen af beløbet der har den høje fradragsværdi, i kroner. */
  hoejAndel: number;
  /** Delen af beløbet der har den lave fradragsværdi, i kroner. */
  lavAndel: number;
  /** Skattebesparelsen, i kroner (uafroundet). */
  besparelse: number;
  /** Effektiv fradragsværdi i procent (uafroundet). */
  effektivSats: number;
}

export function hojFradragsgraense(civilStatus: CivilStatus): number {
  return civilStatus === "couple"
    ? RENTEFRADRAG_2026.highRateLimitCouple
    : RENTEFRADRAG_2026.highRateLimitSingle;
}

/**
 * @param negativKapitalindkomst Renteudgifter minus renteindtægter, i kroner.
 *   Positive tal (netto renteindtægter) giver intet fradrag.
 */
export function beregnRentefradrag(
  negativKapitalindkomst: number,
  civilStatus: CivilStatus,
): RentefradragResultat {
  const graense = hojFradragsgraense(civilStatus);
  const belob = Math.max(0, negativKapitalindkomst);

  const hoejAndel = Math.min(belob, graense);
  const lavAndel = Math.max(0, belob - graense);
  const besparelse =
    hoejAndel * RENTEFRADRAG_2026.highRate + lavAndel * RENTEFRADRAG_2026.lowRate;

  return {
    graense,
    hoejAndel,
    lavAndel,
    besparelse,
    effektivSats: belob > 0 ? (besparelse / belob) * 100 : 0,
  };
}
