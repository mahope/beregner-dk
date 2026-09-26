/**
 * Folkepension 2026 — single source of truth.
 * Alle beløb er pr. måned før skat, som de står hos borger.dk.
 * Kilde: https://www.borger.dk/pension-og-efterloen/folkepension/foer-du-gaar-paa-folkepension
 * Verificeret: 2026-09-25
 */

export const FOLKEPENSION_2026 = {
  source:
    "https://www.borger.dk/pension-og-efterloen/folkepension/foer-du-gaar-paa-folkepension",
  verifiedAt: "2026-09-25",
  /** Grundbeløbet er ens for enlige og gifte/samlevende og påvirkes ikke af andre indkomster. */
  grundbeloeb: 7544,
  tillaeg: {
    enlig: 8729,
    samlevende: 4467,
  },
  iAlt: {
    enlig: 16273,
    samlevende: 12011,
  },
  /**
   * Indkomstgrænser for pensionstillægget. `nedsaetningOver` er grænsen hvor
   * tillægget begynder at blive sat ned, `bortfaldOver` er grænsen hvor det
   * helt forsvinder. `pct` er den procentsats indkomsten over grænsen nedsættes med.
   */
  indkomstgraenser: {
    enlig: { nedsaetningOver: 99200, bortfaldOver: 438380, pct: 0.309 },
    samlevendeMedPensionist: { nedsaetningOver: 198800, bortfaldOver: 533800, pct: 0.16 },
    samlevendeUdenPensionist: { nedsaetningOver: 198800, bortfaldOver: 366400, pct: 0.32 },
  },
  /**
   * Er ægtefællen/samleveren ikke pensionist, ser Udbetaling Danmark bort fra de
   * første 54 % af samleverens indkomst, så kun 46 % tæller med.
   */
  samleverAndelMedRegel: 0.46,
  /** Rækken af fødselsdatoer hvor folkepensionsalderen skifter. */
  alderSkala: [
    { fra: "1954-01-01", alder: 65 },
    { fra: "1954-07-01", alder: 65.5 },
    { fra: "1955-01-01", alder: 66 },
    { fra: "1955-07-01", alder: 66.5 },
    { fra: "1956-01-01", alder: 67 },
    { fra: "1963-01-01", alder: 68 },
    { fra: "1967-01-01", alder: 69 },
    { fra: "1971-01-01", alder: 70 },
  ],
} as const;

export type FolkepensionSamliv = "enlig" | "samlevende";

export interface FolkepensionInput {
  samliv: FolkepensionSamliv;
  /** Din egen årlige indkomst ud over arbejdsindkomst, kr. */
  aarligIndkomst: number;
  /** Kun relevant når samliv er "samlevende". */
  samleverErPensionist: boolean;
  /**
   * Samleverens årlige indkomst ud over arbejdsindkomst, kr.
   * Når samleveren ikke er pensionist, tæller kun 46 % med i grundlaget.
   */
  aarligSamleverIndkomst?: number;
}

export interface FolkepensionResult {
  grundbeloeb: number;
  tillaegFuld: number;
  /** Pensionstillægget efter nedsættelse, aldrig under 0. */
  tillaeg: number;
  iAlt: number;
  nedsatMed: number;
  bortfaldet: boolean;
  /** Hvilken indkomstgrænse der blev brugt. */
  graense: { nedsaetningOver: number; bortfaldOver: number; pct: number };
  /** Den indkomst der blev lagt til grundlaget, efter 46 %-reglen for samlever uden pensionist. */
  indkomstGrundlag: number;
  /** Det beløb 46 %-reglen holdt ude af grundlaget, kr. */
  samleverUdeladt: number;
}

function beligIndkomst(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
}

/**
 * Beregner pensionstillægget for 2026.
 *
 * Grundbeløbet påvirkes ikke af andre indkomster, så brugeren altid får det.
 * Pensionstillægget sættes ned med en procentsats af indkomsten over grænsen
 * og forsvinder helt, når indkomsten overstiger bortfaldsgrænsen.
 */
export function beregnFolkepension2026(input: FolkepensionInput): FolkepensionResult {
  const grundbeloeb = FOLKEPENSION_2026.grundbeloeb;
  const tillaegFuld =
    input.samliv === "enlig"
      ? FOLKEPENSION_2026.tillaeg.enlig
      : FOLKEPENSION_2026.tillaeg.samlevende;

  const graense =
    input.samliv === "enlig"
      ? FOLKEPENSION_2026.indkomstgraenser.enlig
      : input.samleverErPensionist
        ? FOLKEPENSION_2026.indkomstgraenser.samlevendeMedPensionist
        : FOLKEPENSION_2026.indkomstgraenser.samlevendeUdenPensionist;

  const egenIndkomst = beligIndkomst(input.aarligIndkomst);
  const samleverIndkomst =
    input.samliv === "samlevende" ? beligIndkomst(input.aarligSamleverIndkomst) : 0;
  const kun46Procent =
    input.samliv === "samlevende" && !input.samleverErPensionist;
  const samleverMedtalt = kun46Procent
    ? samleverIndkomst * FOLKEPENSION_2026.samleverAndelMedRegel
    : samleverIndkomst;
  const indkomst = egenIndkomst + samleverMedtalt;
  const samleverUdeladt = samleverIndkomst - samleverMedtalt;

  if (indkomst > graense.bortfaldOver) {
    return {
      grundbeloeb,
      tillaegFuld,
      tillaeg: 0,
      iAlt: grundbeloeb,
      nedsatMed: tillaegFuld,
      bortfaldet: true,
      graense,
      indkomstGrundlag: indkomst,
      samleverUdeladt,
    };
  }

  const nedsatMed =
    indkomst > graense.nedsaetningOver
      ? Math.min(tillaegFuld, (indkomst - graense.nedsaetningOver) * graense.pct)
      : 0;
  const tillaeg = Math.max(0, tillaegFuld - nedsatMed);

  return {
    grundbeloeb,
    tillaegFuld,
    tillaeg,
    iAlt: grundbeloeb + tillaeg,
    nedsatMed,
    bortfaldet: false,
    graense,
    indkomstGrundlag: indkomst,
    samleverUdeladt,
  };
}

function isoDato(dato: Date | string): string {
  if (typeof dato === "string") return dato.slice(0, 10);
  return dato.toISOString().slice(0, 10);
}

/** Folkepensionsalder for en fødselsdato. Født 31. december 1953 eller tidligere = 65 år. */
export function folkepensionsalder(fodselsdato: Date | string): number {
  const iso = isoDato(fodselsdato);
  let alder = 65;
  for (const step of FOLKEPENSION_2026.alderSkala) {
    if (iso >= step.fra) alder = step.alder;
    else break;
  }
  return alder;
}

export interface FolkepensionsalderForAlder {
  /** Det estimerede fødselsår, regnet ud fra alderen. */
  fodselsaar: number;
  /** Folkepensionsalderen for det fødselsår, 65-70 år. */
  alder: number;
  /**
   * `false` når fødselsåret går på tværs af to trin i skalaen (fx 1954, der
   * skifter fra 65 til 65½ år 1. juli). Så afhænger den præcise alder af
   * fødselsdatoen.
   */
  praecis: boolean;
}

/**
 * Folkepensionsalder ud fra en alder, når fødselsdatoen ikke er kendt.
 *
 * Fødselsåret estimeres som `nuAar - alder`, og der bruges altid det **højeste**
 * alderstrin i året, så værktøjet aldrig lover en lavere alder end den reelle
 * (samme konservative valg som `efterloenAlder`).
 */
export function folkepensionsalderForAlder(
  alder: number,
  nuAar = new Date().getFullYear(),
): FolkepensionsalderForAlder {
  const fodselsaar = nuAar - Math.floor(alder);
  const aarSlut = `${fodselsaar}-12-31`;

  const trin = FOLKEPENSION_2026.alderSkala.filter((step) => step.fra.slice(0, 4) === String(fodselsaar));

  return {
    fodselsaar,
    alder: folkepensionsalder(aarSlut),
    praecis: new Set(trin.map((step) => step.alder)).size <= 1,
  };
}

/** "65 ½ år" — halve år skrives med ½, så tallene kan læses i løbende tekst. */
export function formatFolkepensionsalder(alder: number): string {
  const heltal = Math.floor(alder);
  const halv = alder - heltal === 0.5;
  return `${heltal}${halv ? " ½" : ""} år`;
}

/** Tekst til en fødselsdato-interval, fx "1. januar 1963 - 31. december 1966". */
const MAANEDER = [
  "januar",
  "februar",
  "marts",
  "april",
  "maj",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "december",
];

export function formatDatoIntervaller(iso: string): string {
  const [aar, maaned, dag] = iso.split("-").map(Number);
  return `${dag}. ${MAANEDER[maaned - 1]} ${aar}`;
}

/**
 * Rækkerne i folkepensionsalder-tabellen, klar til rendering.
 * Den første række dækker født 31. december 1953 eller tidligere.
 */
export function folkepensionsalderRækker(): {
  foedselsdato: string;
  alder: number;
  alderTekst: string;
}[] {
  const rækker: { foedselsdato: string; alder: number; alderTekst: string }[] = [
    { foedselsdato: "1953-12-31 eller tidligere", alder: 65, alderTekst: formatFolkepensionsalder(65) },
  ];
  for (const step of FOLKEPENSION_2026.alderSkala) {
    rækker.push({
      foedselsdato: formatDatoIntervaller(step.fra),
      alder: step.alder,
      alderTekst: formatFolkepensionsalder(step.alder),
    });
  }
  return rækker;
}
