/**
 * Data model for the parental-leave planner (barselsplanlægger).
 *
 * Time is measured in whole "leave weeks" relative to an anchor date:
 * week 0 starts on the birth date (or due date / date of receiving the child
 * when adopting), week -4 is the first week of pregnancy leave.
 */

export type Konstellation =
  | "mor-far"
  | "mor-medmor"
  | "to-foraeldre"
  | "solo"
  | "adoption-par"
  | "adoption-solo";

export type DatoType = "termin" | "foedsel";

export type Beskaeftigelse = "loenmodtager" | "selvstaendig" | "ledig" | "studerende";

/** What a parent does in a given week. Work is the implicit default. */
export type UgeType = "orlov" | "deltid" | "ferie";

export interface Periode {
  /** First leave week (inclusive). */
  start: number;
  /** Week after the last one (exclusive). */
  slut: number;
  type: UgeType;
  /** Only for "deltid": share of normal hours worked, 10-90 %. */
  arbejdsProcent?: number;
}

export interface LoenSegment {
  /** Number of leave weeks the employer pays salary for. */
  uger: number;
  /** Share of normal salary paid in those weeks (0-100). */
  procent: number;
}

export type ForaelderId = "a" | "b";

export interface Foraelder {
  id: ForaelderId;
  navn: string;
  beskaeftigelse: Beskaeftigelse;
  /** Monthly gross salary (lønmodtager) or monthly profit (selvstændig). */
  maanedsloen: number;
  ugentligeTimer: number;
  /** Salary during leave from the employer, applied to leave weeks in order. */
  loenUnderBarsel: LoenSegment[];
  /** Monthly a-kasse dagpenge (ledig) or SU (studerende) in DKK. */
  ydelseMaaned: number;
  /** Weeks saved for later (udskudt orlov). */
  udskudteUger: number;
  perioder: Periode[];
}

export interface BarselsPlan {
  konstellation: Konstellation;
  datoType: DatoType;
  /** Due date or actual birth / receiving date (YYYY-MM-DD). */
  dato: string;
  antalBoern: 1 | 2 | 3 | 4;
  /** Adoption from abroad (4 weeks before receiving) vs. in Denmark (1 week). */
  adoptionUdland: boolean;
  /** Solo parent: plan a close relative (nærtstående) as second person. */
  naertstaaende: boolean;
  /** Weeks the child was hospitalised after birth (extends the leave). */
  indlaeggelsesUger: number;
  kommuneskatPct: number;
  foraeldre: Foraelder[];
}

export type Kategori =
  | "graviditet"
  | "oeremaerket"
  | "egen"
  | "overfoert"
  | "ferie"
  | "arbejde"
  | "udskudt"
  | "uden-ret";
