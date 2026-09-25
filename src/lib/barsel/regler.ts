/**
 * Leave rules for children born or received from 2 August 2022 (2026 edition).
 *
 * Every number here is documented with its source in docs/barsel/regler-2026.md.
 * Primary source: barselsloven, LBK nr. 206 af 22/01/2026
 * (https://www.retsinformation.dk/eli/lta/2026/206). Paragraph references
 * below point into that consolidated act.
 */

import { BARSEL_2026 } from "../satser-2026";
import type { Beskaeftigelse, BarselsPlan, Foraelder, ForaelderId, Kategori, Konstellation } from "./types";

export const REGLER = {
  kilde: "https://www.retsinformation.dk/eli/lta/2026/206",
  borgerKilde: BARSEL_2026.source,
  // § 6, stk. 1
  graviditetUger: 4,
  // § 7, stk. 1: mother's right and duty the first 2 weeks, then 8 more
  morPligtUger: 2,
  morTidligUger: 8,
  // § 7, stk. 3: the other parent's 2 weeks within the first 10 weeks
  partnerFoedselUger: 2,
  foersteUger: 10,
  // § 21, stk. 1: weeks with benefits after week 10
  morEfterUge10: 14,
  partnerEfterUge10: 22,
  // § 21, stk. 3: earmarked (only employed wage earners)
  oeremaerketEfterUge10: 9,
  // § 8, stk. 1 and 4: adoption before receiving the child
  adoptionFoerUdland: 4,
  adoptionFoerDanmark: 1,
  // § 8, stk. 6 / § 8 a, stk. 1: adoptants and surrogacy parents, first 10 weeks
  adoptantTidligUger: 6,
  adoptantTidligOverdrageligUger: 4,
  // § 21, stk. 1, 2. pkt.
  adoptantEfterUge10: 18,
  // § 21 c, stk. 1
  soloEkstraUger: 22,
  // § 14 a, stk. 1 (fixed, regardless of number of children)
  flerlingEkstraUger: 13,
  // § 14 a, stk. 3: solo parent may grant up to 13 multiple-birth weeks to a relative
  flerlingTilNaertstaaendeMaks: 13,
  // § 14, stk. 2: extension for hospitalised child, max 12 months per parent
  // for children born from 1/1-2026 (3 months before that)
  indlaeggelseMaksUger: 52,
  indlaeggelseMaksUgerFoer2026: 13,
  indlaeggelseNyRegelFra: "2026-01-01",
  // § 21, stk. 1: benefit weeks must be used within 1 year
  fristUger: 52,
  // § 21 d: weeks beyond 52 may be used until 16 months after birth
  fristUgerOver52: 69,
  // § 11: postponed leave as a right (wage earners), before the child turns 9
  udskydRetUger: 5,
  udskydSenestAar: 9,
  // Varsling, §§ 15-16 and § 23 c, stk. 3
  varselMorMaanederFoer: 3,
  varselPartnerUgerFoer: 4,
  varselEfterUge10UgerEfterFoedsel: 6,
  varselUdskudtKort: 8,
  varselUdskudtLang: 16,
  varselNaertstaaendeUger: 8,
  // § 30, stk. 2-3
  ansoegningsfristUger: BARSEL_2026.applicationDeadlineWeeks,
  // Rates (borger.dk 2026)
  maksUgesats: BARSEL_2026.maxWeeklyRate,
  maksTimesats: BARSEL_2026.maxHourlyRate,
  fuldtidTimer: BARSEL_2026.fullTimeHours,
} as const;

export type Rolle = "foedende" | "partner" | "surrogat" | "adoptant" | "naertstaaende";

export type SpandId =
  | "foer"
  | "pligt"
  | "foedsel"
  | "tidlig"
  | "tidlig-delbar"
  | "oeremaerket"
  | "flerling"
  | "indlaeggelse"
  | "delbar"
  | "solo";

export interface Spand {
  id: SpandId;
  label: string;
  uger: number;
  /** Weeks [fra, til) in which the bucket can be used. */
  fra: number;
  til: number;
  /** Lost if not used by this parent. */
  oeremaerket: boolean;
  /** May be used by the other parent (or the relative for solo parents). */
  overdragelig: boolean;
  kategori: Kategori;
}

export interface Rettigheder {
  id: ForaelderId;
  rolle: Rolle;
  spande: Spand[];
  /** Weeks with benefits before the birth/receiving date. */
  foerUger: number;
  /** Weeks with benefits from the birth/receiving date (own rights only). */
  efterUger: number;
  oeremaerketUger: number;
  overdrageligeUger: number;
  /** Last leave week (exclusive) for benefit weeks after the birth. */
  frist: number;
}

export const KONSTELLATIONER: {
  id: Konstellation;
  titel: string;
  kort: string;
  roller: [string, string?];
}[] = [
  { id: "mor-far", titel: "Mor og far", kort: "Mor + far", roller: ["Mor", "Far"] },
  { id: "mor-medmor", titel: "Mor og medmor", kort: "Mor + medmor", roller: ["Mor", "Medmor"] },
  {
    id: "to-foraeldre",
    titel: "To fædre (surrogati)",
    kort: "To fædre",
    roller: ["Far 1", "Far 2"],
  },
  { id: "solo", titel: "Soloforælder", kort: "Solo", roller: ["Mor", "Nærtstående"] },
  { id: "adoption-par", titel: "Adoption, to forældre", kort: "Adoption", roller: ["Adoptant 1", "Adoptant 2"] },
  { id: "adoption-solo", titel: "Adoption, eneadoptant", kort: "Eneadoption", roller: ["Adoptant"] },
];

export function erAdoption(k: Konstellation): boolean {
  return k === "adoption-par" || k === "adoption-solo";
}

export function erSolo(k: Konstellation): boolean {
  return k === "solo" || k === "adoption-solo";
}

export function rolleFor(k: Konstellation, index: number): Rolle {
  switch (k) {
    case "mor-far":
    case "mor-medmor":
      return index === 0 ? "foedende" : "partner";
    case "solo":
      return index === 0 ? "foedende" : "naertstaaende";
    case "to-foraeldre":
      return "surrogat";
    case "adoption-par":
    case "adoption-solo":
      return "adoptant";
  }
}

/** Earmarking of the 9 weeks only applies to employed wage earners (§ 21, stk. 3). */
export function oeremaerkningGaelder(b: Beskaeftigelse): boolean {
  return b === "loenmodtager";
}

/** The mother's weeks 3-10 can only be transferred by an employed mother (§ 7 a). */
function morKanOverdrageTidlige(b: Beskaeftigelse): boolean {
  return b === "loenmodtager" || b === "selvstaendig";
}

export function indlaeggelsesUgerTilladt(plan: BarselsPlan): number {
  const maks =
    plan.dato >= REGLER.indlaeggelseNyRegelFra
      ? REGLER.indlaeggelseMaksUger
      : REGLER.indlaeggelseMaksUgerFoer2026;
  return Math.max(0, Math.min(plan.indlaeggelsesUger, maks));
}

function spand(
  id: SpandId,
  label: string,
  uger: number,
  fra: number,
  til: number,
  oeremaerket: boolean,
  overdragelig: boolean,
  kategori: Kategori
): Spand {
  return { id, label, uger, fra, til, oeremaerket, overdragelig, kategori };
}

/** The benefit entitlements of one parent in a given plan. */
export function rettigheder(plan: BarselsPlan, foraelder: Foraelder, index: number): Rettigheder {
  const rolle = rolleFor(plan.konstellation, index);
  const solo = erSolo(plan.konstellation);
  const oeremaerk = oeremaerkningGaelder(foraelder.beskaeftigelse);
  const indlagt = indlaeggelsesUgerTilladt(plan);
  const frist = REGLER.fristUger + indlagt;
  const spande: Spand[] = [];
  const oe = REGLER.oeremaerketEfterUge10;

  if (rolle === "naertstaaende") {
    return {
      id: foraelder.id,
      rolle,
      spande,
      foerUger: 0,
      efterUger: 0,
      oeremaerketUger: 0,
      overdrageligeUger: 0,
      frist: REGLER.fristUger,
    };
  }

  if (rolle === "foedende") {
    spande.push(
      spand("foer", "Graviditetsorlov", REGLER.graviditetUger, -REGLER.graviditetUger, 0, false, false, "graviditet"),
      spand("pligt", "2 uger efter fødslen", REGLER.morPligtUger, 0, 2, true, false, "oeremaerket"),
      spand(
        "tidlig",
        "Uge 3-10 efter fødslen",
        REGLER.morTidligUger,
        2,
        REGLER.foersteUger,
        false,
        morKanOverdrageTidlige(foraelder.beskaeftigelse),
        "egen"
      ),
      spand("oeremaerket", "Øremærkede uger", oeremaerk ? oe : 0, REGLER.foersteUger, frist, true, false, "oeremaerket"),
      spand(
        "delbar",
        "Delbare uger",
        REGLER.morEfterUge10 - (oeremaerk ? oe : 0),
        REGLER.foersteUger,
        frist,
        false,
        true,
        "egen"
      )
    );
  } else if (rolle === "partner") {
    spande.push(
      spand("foedsel", "2 uger ved fødslen", REGLER.partnerFoedselUger, 0, REGLER.foersteUger, true, false, "oeremaerket"),
      spand("oeremaerket", "Øremærkede uger", oeremaerk ? oe : 0, 0, frist, true, false, "oeremaerket"),
      spand("delbar", "Delbare uger", REGLER.partnerEfterUge10 - (oeremaerk ? oe : 0), 0, frist, false, true, "egen")
    );
  } else {
    // Adoptant or surrogacy parent (§ 8, stk. 6; § 8 a; § 21, stk. 1, 2. pkt.)
    if (rolle === "adoptant") {
      const foer = plan.adoptionUdland ? REGLER.adoptionFoerUdland : REGLER.adoptionFoerDanmark;
      spande.push(spand("foer", "Orlov før modtagelsen", foer, -foer, 0, false, false, "graviditet"));
    }
    const fast = REGLER.adoptantTidligUger - REGLER.adoptantTidligOverdrageligUger;
    spande.push(
      spand("foedsel", "Ikke-overdragelige uger (første 10 uger)", fast, 0, REGLER.foersteUger, true, false, "oeremaerket"),
      spand(
        "tidlig-delbar",
        "Overdragelige uger (første 10 uger)",
        REGLER.adoptantTidligOverdrageligUger,
        0,
        REGLER.foersteUger,
        false,
        true,
        "egen"
      ),
      spand("oeremaerket", "Øremærkede uger", oeremaerk ? oe : 0, 0, frist, true, false, "oeremaerket"),
      spand("delbar", "Delbare uger", REGLER.adoptantEfterUge10 - (oeremaerk ? oe : 0), 0, frist, false, true, "egen")
    );
  }

  if (solo) {
    spande.push(spand("solo", "Ekstra uger som soloforælder", REGLER.soloEkstraUger, 0, frist, false, true, "egen"));
  }
  if (plan.antalBoern > 1) {
    spande.push(spand("flerling", "Flerlingeorlov", REGLER.flerlingEkstraUger, 0, frist, false, solo, "egen"));
  }
  if (indlagt > 0) {
    spande.push(spand("indlaeggelse", "Forlængelse pga. indlæggelse", indlagt, 0, frist, false, false, "egen"));
  }

  const efterUger = spande.filter((s) => s.id !== "foer").reduce((sum, s) => sum + s.uger, 0);
  // Weeks beyond 52 in total may be used until 16 months after the birth (§ 21 d).
  const samletFrist =
    efterUger - indlagt > REGLER.fristUger ? REGLER.fristUgerOver52 + indlagt : frist;
  // Earmarked weeks always keep the 1-year deadline (§ 21, stk. 3).
  for (const s of spande) if (s.til === frist && !s.oeremaerket) s.til = samletFrist;

  return {
    id: foraelder.id,
    rolle,
    spande: spande.filter((s) => s.uger > 0),
    foerUger: spande.find((s) => s.id === "foer")?.uger ?? 0,
    efterUger,
    oeremaerketUger: spande.filter((s) => s.oeremaerket).reduce((sum, s) => sum + s.uger, 0),
    overdrageligeUger: spande.filter((s) => s.overdragelig).reduce((sum, s) => sum + s.uger, 0),
    frist: samletFrist,
  };
}

export function rolleNavn(rolle: Rolle): string {
  switch (rolle) {
    case "foedende":
      return "den fødende forælder";
    case "partner":
      return "far/medmor";
    case "surrogat":
      return "forælder efter surrogataftale";
    case "adoptant":
      return "adoptant";
    case "naertstaaende":
      return "nærtstående familiemedlem";
  }
}
