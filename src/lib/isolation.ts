/**
 * Isolationsberegner — hvor tyk skal isoleringen være?
 *
 * Regnestykket er det, Bygningsreglementet selv bruger: en bygningsdels
 * varmegennemgangskoefficient (U-værdien) er omvendt af dens samlede
 * varmemodstand, og den samlede modstand er luftlagene på hver side plus
 * isoleringens egen modstand:
 *
 *   R_total = 1 / U
 *   R_isol   = R_total − Rsi − Rse          (luftlagenes modstand)
 *   tykkelse = R_isol × λ                    (isoleringens modstand er d/λ)
 *
 * Jo lavere λ, jo tyndere lag giver samme U. Derfor er det meningsløst at
 * sige "loft skal isoleres X cm" uden at sige hvilket materiale: 17 cm glasuld
 * og 11 cm PIR giver nogenlunde det samme på et loft til 0,20 W/m²K.
 *
 * Alle tal på siden læses fra dette modul — tabel, brødtekst og FAQ — så de
 * ikke kan glide fra hinanden.
 *
 * Kilde og verificeringsdato: se `ISOLERING_KILDE`.
 */

/** De tre bygningsdele beregneren dækker. */
export type BygningsdelId = "loft" | "vaeg" | "gulv";

export interface Bygningsdel {
  id: BygningsdelId;
  navn: string;
  /** Hvad delen er i huset, så labels kan sige det samme som talen. */
  brug: string;
  /**
   * Varmestrømmens retning gennem delen — bestemmer det indvendige luftlags
   * modstand (Rsi) efter EN ISO 6946.
   */
  retning: "opad" | "vandret" | "nedad";
  /** BR18 § 257, bilag 2 tabel 1: maksimale U-værdi, W/m²K. */
  brKrav: number;
  /** Hvad kravet hedder i bygningsreglementet, så siden kan citere det rigtigt. */
  brTekst: string;
}

/**
 * De tre bygningsdele, beregneren dækker, med bygningsreglementets egne
 * U-værdikrav.
 *
 * Kravstallene er BR18's *generelle* mindstekrav til klimaskærm (bilag 2,
 * tabel 1), dvs. det et nyt hus skal leve op til. Ved ombygning og
 * efterisolering er kravene skrappere (§ 279: væg 0,18, loft 0,12, gulv
 * 0,10) — beregneren lader dem sætte en lavere U-værdi manuelt.
 */
export const BYGNINGSDELER: readonly Bygningsdel[] = [
  {
    id: "loft",
    navn: "Loft og tag",
    brug: "Det vandrette bjælkelag mellem øverste sal og tagloft — det vigtigste sted at isolere.",
    retning: "opad",
    brKrav: 0.2,
    brTekst: "Loft- og tagkonstruktioner, herunder skunkvægge, flade tage og skråvægge direkte mod tag",
  },
  {
    id: "vaeg",
    navn: "Ydervæg",
    brug: "Den ydre mur mod luft eller kælervæg mod jord.",
    retning: "vandret",
    brKrav: 0.3,
    brTekst: "Ydervægge og kældervægge mod jord",
  },
  {
    id: "gulv",
    navn: "Gulv mod jord eller kryberum",
    brug: "Kældergulv, terrændæk eller bjælkelag over ventileret kryberum.",
    retning: "nedad",
    brKrav: 0.2,
    brTekst: "Terrændæk, kældergulve mod jord og etageadskillelser over det fri eller ventileret kryperum",
  },
] as const;

/** De strengere krav ved ombygning, BR18 § 279 bilag 2 tabel 3. */
export const BR18_OMBYGNING: Record<BygningsdelId, number> = {
  vaeg: 0.18,
  loft: 0.12,
  gulv: 0.1,
};

/** De isoleringsmaterialer siden dækker. */
export interface IsoleringsMateriale {
  id: string;
  navn: string;
  /** Typisk anvendelse, så brugeren kan vælge det rigtige. */
  brug: string;
  /** λ-værdien beregneren bruger, W/(m·K). */
  lambda: number;
  /** Det interval kilden oplyser, til visning. */
  lambdaMin: number;
  lambdaMaks: number;
  /** Naturmateriale — bruges kun til at sige noget rart om valget. */
  naturmateriale: boolean;
}

/**
 * λ-værdierne er intervaller fra kilderne; beregneren bruger intervallets
 * midtpunkt afrundet til tre decimaler. Det er ikke enkeltprodukters
 * deklarerede værdi — den står på produktets datablad og kan både være højere
 * og lavere.
 */
export const ISOLERINGSMATERIALER: readonly IsoleringsMateriale[] = [
  {
    id: "pir",
    navn: "PIR/PUR-skumplade",
    brug: "Flade tage, gulv og steder hvor der ikke er plads til et tykt lag.",
    lambda: 0.024,
    lambdaMin: 0.02,
    lambdaMaks: 0.028,
    naturmateriale: false,
  },
  {
    id: "xps",
    navn: "XPS",
    brug: "Kælder, fundament og under betondæk — tåler fugt og tryk.",
    lambda: 0.033,
    lambdaMin: 0.028,
    lambdaMaks: 0.038,
    naturmateriale: false,
  },
  {
    id: "eps",
    navn: "EPS (flamingo)",
    brug: "Gulv, kælder og facader, hvor materialet ikke skal bære vægt.",
    lambda: 0.034,
    lambdaMin: 0.03,
    lambdaMaks: 0.038,
    naturmateriale: false,
  },
  {
    id: "glasuld",
    navn: "Glasuld",
    brug: "Tagrum og lofter i ruller eller batts — billigst pr. m².",
    lambda: 0.035,
    lambdaMin: 0.032,
    lambdaMaks: 0.037,
    naturmateriale: false,
  },
  {
    id: "cellulose",
    navn: "Cellulose (indblæst)",
    brug: "Vandrette bjælkelag og hulrum, der er svære at nå.",
    lambda: 0.04,
    lambdaMin: 0.038,
    lambdaMaks: 0.042,
    naturmateriale: true,
  },
  {
    id: "stenuld",
    navn: "Stenuld (mineraluld)",
    brug: "Vægge, gulve og brandsårne konstruktioner — også som løsfyld.",
    lambda: 0.037,
    lambdaMin: 0.033,
    lambdaMaks: 0.04,
    naturmateriale: false,
  },
  {
    id: "loesfyld",
    navn: "Mineraluld, løsfyld",
    brug: "Indblæst i hulrum, der ikke kan nåes med batts.",
    lambda: 0.04,
    lambdaMin: 0.035,
    lambdaMaks: 0.045,
    naturmateriale: false,
  },
  {
    id: "traefiber",
    navn: "Træfiber",
    brug: "Facader og tage, når materialet også skal bære noget.",
    lambda: 0.044,
    lambdaMin: 0.038,
    lambdaMaks: 0.05,
    naturmateriale: true,
  },
] as const;

/**
 * Overgangsmodstande for plane flader, EN ISO 6946.
 *
 * Det indvendige luftlag (Rsi) afhænger af varmestrømmens retning: varme
 * stiger, og derfor er luften over et varmt loft bedre til at holde på varmen
 * end luften under et koldt gulv. Det udvendige luftlag (Rse) er altid 0,04.
 */
export const RSI: Record<Bygningsdel["retning"], number> = {
  opad: 0.1,
  vandret: 0.13,
  nedad: 0.17,
};
export const RSE = 0.04;

/** Samlet modstand i luftlagene, m²K/W. */
export function luftlag(bygningsdel: Bygningsdel): number {
  return RSI[bygningsdel.retning] + RSE;
}

export const ISOLERING_KILDE = {
  krav:
    "https://www.bygningsreglementet.dk/Tekniske-bestemmelser/11/Krav/257 (BR18 § 257, bilag 2 tabel 1: loft/tag 0,20, ydervægge 0,30, terrændæk og kældergulve 0,20 W/m²K) og § 279 (ombygning: væg 0,18, loft 0,12, gulv 0,10)",
  lambda:
    "λ-intervaller fra https://bygdinbolig.dk/isoleringsmaterialer-guide/ (opfærdeling efter materiale, 13. juli 2026) og https://bygzone.dk/isolering/ (materialeoversigt)",
  luftlag:
    "https://www.bygningsreglementet.dk samt DS/EN ISO 6946 bilag C: Rsi 0,10 (varme opad), 0,13 (vandret) og 0,17 (nedad), Rse 0,04",
  formel:
    "U = 1 / (Rsi + d/λ + Rse), dvs. tykkelsen d = λ × (1/U − Rsi − Rse)",
  oven: "Bygningsdelen er én isoleringslag tung — bjælker, gips og beklædning tæller også med i den rigtige U-værdi.",
  verifiedAt: "2026-10-09",
} as const;

/** Standardvalg: et loft på 100 m² med isolering til bygningsreglementets krav. */
export const ISOLERING_STANDARD: {
  bygningsdelId: BygningsdelId;
  materialeId: string;
  arealM2: number;
  uVaerdi: number | null;
} = {
  bygningsdelId: "loft",
  materialeId: "stenuld",
  arealM2: 100,
  uVaerdi: null,
};

export interface IsoleringValg {
  bygningsdelId: BygningsdelId;
  materialeId: string;
  arealM2: number;
  /** ønsket U-værdi i W/m²K; udefineret eller 0 betyder bygningsdelens BR-krav. */
  uVaerdi?: number | null;
}

export interface IsoleringResultat {
  bygningsdel: Bygningsdel;
  materiale: IsoleringsMateriale;
  /** Arealet beregningen er lavet for, m². */
  arealM2: number;
  /** Den U-værdi der regnes på, W/m²K. */
  uVaerdi: number;
  /** True når U-værdien er bygningsdelens krav og ikke et valgt tal. */
  brugerBrKrav: boolean;
  /** Isoleringens egen modstand, m²K/W. */
  rIsolering: number;
  /** Samlet modstand inkl. luftlag, m²K/W. */
  rTotal: number;
  /** Nødvendig tykkelse i cm. */
  tykkelseCm: number;
  /** Samlet modstand i luftlagene, m²K/W. */
  luftlagM2KW: number;
  /** Varmetab gennem delen pr. grads temperaturforskel, W/K. */
  varmetabPrGrad: number;
  /** Isoleringens volumen, m³. */
  volumenM3: number;
  /** True når kravet for stramt til at isolering alene kan løse det. */
  umuligt: boolean;
  /** Kravet ved ombygning, hvis det er strengere end det valgte. */
  ombygningKrav: number;
  /** Om det valgte krav er løsere end ombygningskravet. */
  lossereEndOmbygning: boolean;
}

export function bygningsdelVedId(id: string | undefined): Bygningsdel {
  return BYGNINGSDELER.find((b) => b.id === id) ?? BYGNINGSDELER[0];
}

export function materialeVedId(id: string | undefined): IsoleringsMateriale {
  return ISOLERINGSMATERIALER.find((m) => m.id === id) ?? ISOLERINGSMATERIALER[0];
}

function positiv(tal: number | undefined, standard: number): number {
  return typeof tal === "number" && Number.isFinite(tal) && tal > 0 ? tal : standard;
}

/** Afrunder til centimeter-præcision, så 17,01 cm ikke bliver 17,0042. */
function cm(cmVaerdi: number): number {
  return Math.round(cmVaerdi * 100) / 100;
}

/**
 * Regner den nødvendige isoleringstykkelse ud.
 *
 * Et loft til 0,20 W/m²K med glasuld (λ 0,035) kræver en samlet modstand på
 * 1/0,20 = 5,00 m²K/W. Luftlagene tager 0,10 + 0,04 = 0,14, så isoleringen
 * skal stå for 4,86 m²K/W — det er 0,035 × 4,86 = 17 cm.
 */
export function beregnIsolering(valg: IsoleringValg): IsoleringResultat {
  const bygningsdel = bygningsdelVedId(valg.bygningsdelId);
  const materiale = materialeVedId(valg.materialeId);
  const arealM2 = positiv(valg.arealM2, ISOLERING_STANDARD.arealM2);
  const luft = luftlag(bygningsdel);

  const valgtU =
    typeof valg.uVaerdi === "number" && Number.isFinite(valg.uVaerdi) && valg.uVaerdi > 0
      ? valg.uVaerdi
      : bygningsdel.brKrav;
  const brugerBrKrav = valgtU === bygningsdel.brKrav;

  const rTotal = 1 / valgtU;
  const rIsolering = rTotal - luft;
  const ombygningKrav = BR18_OMBYGNING[bygningsdel.id];

  // Kan en bygningsdel ikke isoleres nok ned ad den vej, er U-værdien opnået
  // af luftlagene alene — det sker ved U ≥ 1/0,14 = 7,14 W/m²K. Her siger vi
  // bare at opgaven er løst med 0 cm.
  const umuligt = rIsolering <= 0;

  const tykkelseCm = umuligt ? 0 : cm(rIsolering * materiale.lambda * 100);
  const varmetabPrGrad = Math.round(valgtU * arealM2 * 10) / 10;
  const volumenM3 = arealM2 * (tykkelseCm / 100);

  return {
    bygningsdel,
    materiale,
    arealM2,
    uVaerdi: valgtU,
    brugerBrKrav,
    rIsolering: umuligt ? 0 : Math.round(rIsolering * 1000) / 1000,
    rTotal: Math.round(rTotal * 1000) / 1000,
    tykkelseCm,
    luftlagM2KW: luft,
    varmetabPrGrad,
    volumenM3: Math.round(volumenM3 * 1000) / 1000,
    umuligt,
    ombygningKrav,
    lossereEndOmbygning: valgtU > ombygningKrav,
  };
}

/**
 * Den tykkelse et givent materiale skal have for at nå U-værdien.
 *
 * Bruges til tabellen «hvor tykt skal hvert materiale være», så den er regnet
 * med samme funktion som værktøjet.
 */
export function tykkelseForU(
  bygningsdelId: BygningsdelId,
  materialeId: string,
  uVaerdi: number,
): number {
  const bygningsdel = bygningsdelVedId(bygningsdelId);
  const materiale = materialeVedId(materialeId);
  const rIsolering = 1 / uVaerdi - luftlag(bygningsdel);
  return rIsolering > 0 ? cm(rIsolering * materiale.lambda * 100) : 0;
}

/** Standardvalget, så formularen udfylder noget fornuftigt. */
export function isoleringStandardValg(bygningsdelId: BygningsdelId): IsoleringValg {
  return {
    bygningsdelId,
    materialeId: ISOLERING_STANDARD.materialeId,
    arealM2: ISOLERING_STANDARD.arealM2,
    uVaerdi: null,
  };
}

/** Eksemplet siden regner på. */
export const ISOLERING_EKSEMPEL: IsoleringValg = {
  bygningsdelId: "loft",
  materialeId: "stenuld",
  arealM2: ISOLERING_STANDARD.arealM2,
  uVaerdi: null,
};

/** Eksemplets resultat, så brødteksten og porten læser samme tal. */
export function isoleringEksempel(): IsoleringResultat {
  return beregnIsolering(ISOLERING_EKSEMPEL);
}
