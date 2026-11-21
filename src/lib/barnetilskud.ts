/**
 * Børnetilskud 2026 — single source of truth.
 *
 * Børnetilskud er en **egen ydelse** uden for børne- og ungeydelsen
 * (`borneungeydelse.ts`), og beløbene står derfor på deres egen side hos
 * borger.dk. Alle beløb er pr. kvartal, som de står der.
 *
 * Kilde: https://www.borger.dk/familie-og-boern/Familieydelser-oversigt/boernetilskud
 * Verificeret: 2026-09-25
 *
 * Ikke dækket af denne fil, fordi beløbet står et andet sted på borger.dk:
 * børnetilskud til forældre i praktik.
 */

export interface BarnetilskudSats {
  /** Hvilken tilskudstype beløbet gælder. */
  type: BarnetilskudType;
  /** Kort navn til tabeller og prosa. */
  label: string;
  /** Hele beløbet pr. kvartal. */
  belob: number;
  /** Hvor tit beløbet udbetales. */
  interval: "kvartal" | "maaned";
  /** interval i dansk læsbar form, fx i prosa. */
  intervalNavn: "kvartal" | "måned";
  /** Om beløbet afhænger af indkomst. */
  afhaengerAfIndkomst: boolean;
  /** Om beløbet er skattefrit. */
  skattefrit: boolean;
  /** Om beløbet kræver en ansøgning. */
  kraeverAnsogning: boolean;
  /** Hvilken alder ydelsen kan udbetales til. */
  alder: string;
  /** Betingelser, der ikke fremgår af beløbet, kort til tabelbemærkning. */
  bemaerkning: string;
}

export type BarnetilskudType =
  | "ordinært"
  | "ekstra"
  | "særligt-adoption"
  | "flerlinger"
  | "pensionist-begge"
  | "pensionist-en";

export const BARNETILSKUD_2026: readonly BarnetilskudSats[] = [
  {
    type: "ordinært",
    label: "Børnetilskud pr. barn",
    belob: 1741,
    interval: "kvartal",
    intervalNavn: "kvartal",
    afhaengerAfIndkomst: false,
    skattefrit: true,
    kraeverAnsogning: false,
    alder: "Til og med det kvartal, barnet fylder 18 år",
    bemaerkning: "Enlige forsørgere. Gives automatisk.",
  },
  {
    type: "ekstra",
    label: "Ekstra børnetilskud",
    belob: 1774,
    interval: "kvartal",
    intervalNavn: "kvartal",
    afhaengerAfIndkomst: false,
    skattefrit: true,
    kraeverAnsogning: false,
    alder: "Til og med det kvartal, barnet fylder 18 år",
    bemaerkning: "Én udbetaling uanset antal børn på samme adresse.",
  },
  {
    type: "særligt-adoption",
    label: "Særligt børnetilskud ved adoption",
    belob: 5025,
    interval: "kvartal",
    intervalNavn: "kvartal",
    afhaengerAfIndkomst: false,
    skattefrit: true,
    kraeverAnsogning: false,
    alder: "Til og med det kvartal, barnet fylder 18 år",
    bemaerkning:
      "Enlig adoptivforælder. Gives automatisk ved adoption; ellers ansøgning hos Udbetaling Danmark.",
  },
  {
    type: "flerlinger",
    label: "Børnetilskud til flerlinger",
    belob: 2874,
    interval: "kvartal",
    intervalNavn: "kvartal",
    afhaengerAfIndkomst: false,
    skattefrit: true,
    kraeverAnsogning: false,
    alder: "Til og med det kvartal, børnene fylder 7 år",
    bemaerkning:
      "Pr. barn ud over det første. Tvillinger giver ét tilskud, trillinger to (5.748 kr.).",
  },
  {
    type: "pensionist-begge",
    label: "Børnetilskud som pensionist — begge er pensionister",
    belob: 1741,
    interval: "kvartal",
    intervalNavn: "kvartal",
    afhaengerAfIndkomst: true,
    skattefrit: true,
    kraeverAnsogning: false,
    alder: "Til og med det kvartal, barnet fylder 18 år",
    bemaerkning:
      "Børnetilskud på 1.741 kr. og særligt børnetilskud på 5.025 kr. Tilskuddet nedsættes med 3 % af indkomsten over grænsen for pensionstillæg.",
  },
  {
    type: "pensionist-en",
    label: "Børnetilskud som pensionist — kun én er pensionist",
    belob: 4449,
    interval: "kvartal",
    intervalNavn: "kvartal",
    afhaengerAfIndkomst: true,
    skattefrit: true,
    kraeverAnsogning: false,
    alder: "Til og med det kvartal, barnet fylder 18 år",
    bemaerkning:
      "Særligt børnetilskud på 4.449 kr. Tilskuddet nedsættes med 3 % af indkomsten over grænsen for pensionstillæg.",
  },
] as const;

export const BARNETILSKUD_KILDE =
  "https://www.borger.dk/familie-og-boern/Familieydelser-oversigt/boernetilskud";

export const BARNETILSKUD_2026_KILDE = {
  source: BARNETILSKUD_KILDE,
  verifiedAt: "2026-09-25",
  /** Udbetalingsdatoer for børnetilskud, som de står hos borger.dk. */
  udbetaalingsdatoer: [20, 4, 7, 10] as const,
  udbetaalingsdatoerNavn: ["20. januar", "20. april", "20. juli", "20. oktober"] as const,
  /**
   * Ansøgningsfrister: seneste ansøgningsdag og den første dag ydelsen kan
   * udbetales fra. Fristen er dagen inden kvartalet begynder.
   */
  frister: [
    { senest: "31. december", fra: "1. januar" },
    { senest: "31. marts", fra: "1. april" },
    { senest: "30. juni", fra: "1. juli" },
    { senest: "30. september", fra: "1. oktober" },
  ] as const,
  /** Enkeltårende erklæring om fortsat at være enlig forsørger. */
  enligErklaering: {
    senest: "5. november",
    rykkerbrev: "26. november",
    /** Ved udeblivet svar stoppes børnetilskuddet fra dette år. */
    stoppesFraAar: 2027,
  },
  /** Optjeningsprincip for nye modtagere. */
  optjening: {
    aar: 6,
    vindue: 10,
    /** Ældre modtagere har et 2-års optjeningsprincip. */
    aarForModtagereFoer2018: 2,
  },
} as const;

export function barnetilskudSats(type: BarnetilskudType): BarnetilskudSats {
  const sats = BARNETILSKUD_2026.find((s) => s.type === type);
  if (!sats) {
    throw new Error(`Ukendt børnetilskudstype: ${type}`);
  }
  return sats;
}

/**
 * Flerlingstilskuddet pr. kvartal for et givent antal børn født samtidig.
 * Tilskuddet gælder børn ud over det første, så to børn giver ét tilskud.
 */
export function flerlingBelob(antalBorn: number): number {
  if (!Number.isFinite(antalBorn) || antalBorn < 1) return 0;
  return Math.floor(antalBorn - 1) * barnetilskudSats("flerlinger").belob;
}

/** Samlet børnetilskud pr. kvartal for enlige forsørgere. */
export function enligtilskudPrKvartal(antalBorn: number): number {
  if (!Number.isFinite(antalBorn) || antalBorn < 1) return 0;
  return barnetilskudSats("ordinært").belob * antalBorn + barnetilskudSats("ekstra").belob;
}

/**
 * Børnetilskud til en pensionist nedsættes med 3 % af indkomsten over grænsen
 * for pensionstillæg. Tilskuddet kan ikke blive negativt.
 */
export function pensionistNedaettelse(
  aarligIndkomst: number,
  indkraftsgrænse: number
): number {
  if (!Number.isFinite(aarligIndkomst) || !Number.isFinite(indkraftsgrænse)) return 0;
  const over = aarligIndkomst - indkraftsgrænse;
  if (over <= 0) return 0;
  return 0.03 * over;
}
