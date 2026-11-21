import { BARSEL_2026 } from "../satser-2026";
import { formatDato } from "./dato";
import { REGLER } from "./regler";

/**
 * The three situations that give a family more leave than the standard model:
 * a multiple birth, a child in hospital, and adoption. Every number here is
 * derived from REGLER/BARSEL_2026 so the prose and the rule engine cannot
 * disagree — see docs/barsel/regler-2026.md § 3.7, § 3.8 and § 3.9.
 */

export interface Flerling {
  /** Extra weeks with benefits per parent (§ 14 a, stk. 1). */
  ekstraUgerPrForaelder: number;
  /** Total weeks per parent: the standard 24 plus the flerlinger weeks. */
  totalUgerPrForaelder: number;
  /** Weeks both parents hold at the same time (§ 14 a, stk. 6). */
  fristUger: number;
  /** A solo parent may hand these to a relative or social parent (§ 14 a, stk. 3). */
  tilNaertstaaendeMaks: number;
  kilde: string;
}

export function flerling(): Flerling {
  return {
    ekstraUgerPrForaelder: REGLER.flerlingEkstraUger,
    totalUgerPrForaelder: BARSEL_2026.afterBirthWeeks + REGLER.flerlingEkstraUger,
    fristUger: REGLER.flerlingFristUger,
    tilNaertstaaendeMaks: REGLER.flerlingTilNaertstaaendeMaks,
    kilde: REGLER.kilde,
  };
}

export interface Adoption {
  ugerFoerModtagelseUdland: number;
  ugerFoerModtagelseDanmark: number;
  /** Weeks in the first 10 weeks after receiving, per adoptant (§ 8, stk. 6). */
  tidligeUger: number;
  /** How many of those weeks may be transferred to the other adoptant. */
  tidligeOverdragelige: number;
  /** Weeks with benefits after week 10 (§ 21, stk. 1, 2. pkt.). */
  efterUge10: number;
  /** 6 + 18 = the same 24 weeks a birth gives each parent. */
  totalUgerPrAdoptant: number;
  /** A single adoptive parent adds the solo weeks: 6 + 18 + 22 = 46. */
  totalUgerEnadoptant: number;
  oeremaerketUger: number;
  kilde: string;
}

export function adoption(): Adoption {
  return {
    ugerFoerModtagelseUdland: REGLER.adoptionFoerUdland,
    ugerFoerModtagelseDanmark: REGLER.adoptionFoerDanmark,
    tidligeUger: REGLER.adoptantTidligUger,
    tidligeOverdragelige: REGLER.adoptantTidligOverdrageligUger,
    efterUge10: REGLER.adoptantEfterUge10,
    totalUgerPrAdoptant: REGLER.adoptantTidligUger + REGLER.adoptantEfterUge10,
    totalUgerEnadoptant:
      REGLER.adoptantTidligUger + REGLER.adoptantEfterUge10 + REGLER.soloEkstraUger,
    oeremaerketUger: REGLER.oeremaerketEfterUge10,
    kilde: REGLER.kilde,
  };
}

export interface Indlaeggelse {
  /** The hospitalisation must fall within the first 46 weeks (§ 14, stk. 2). */
  vindueUger: number;
  /** Max extra weeks per parent for a child born from 1/1-2026. */
  maksUger: number;
  /** Before 1/1-2026 the cap was 3 months in total. */
  maksUgerFoer2026: number;
  /** ISO cut-off. Format it with `nyRegelDato` before showing it to a reader. */
  nyRegelFra: string;
  /** The same cut-off in Danish: "1. januar 2026". */
  nyRegelDato: string;
  /** The child must be discharged within 60 weeks if work is resumed (§ 14, stk. 3). */
  udskrivningSenestUger: number;
  /**
   * The weeks a hospitalised child adds, capped by the rule that applied on
   * the birth date. The input is weeks, the same unit as
   * `BarselsPlan.indlaeggelsesUger` and `indlaeggelsesUgerTilladt` — the law
   * writes "12 months" and "3 months", which the constants hold as 52 and 13
   * weeks so the two never have to be converted at the call site.
   */
  ekstraUger(foedtDato: string, indlaeggelsesUger: number): number;
  kilde: string;
}

export function indlaeggelse(): Indlaeggelse {
  return {
    vindueUger: REGLER.indlaeggelseVindueUger,
    maksUger: REGLER.indlaeggelseMaksUger,
    maksUgerFoer2026: REGLER.indlaeggelseMaksUgerFoer2026,
    nyRegelFra: REGLER.indlaeggelseNyRegelFra,
    nyRegelDato: formatDato(REGLER.indlaeggelseNyRegelFra),
    udskrivningSenestUger: 60,
    ekstraUger(foedtDato, uger) {
      if (uger <= 0) return 0;
      const maks =
        foedtDato >= REGLER.indlaeggelseNyRegelFra
          ? REGLER.indlaeggelseMaksUger
          : REGLER.indlaeggelseMaksUgerFoer2026;
      return Math.min(uger, maks);
    },
    kilde: REGLER.kilde,
  };
}

/** What the flerlinger weeks are worth at the maximum 2026 rate. */
export function flerlingUgevaerdi(): number {
  return BARSEL_2026.maxWeeklyRate * REGLER.flerlingEkstraUger;
}
