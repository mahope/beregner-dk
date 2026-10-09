/**
 * Betonberegner — hvor meget beton skal du bruge?
 *
 * Regnestykket er rent geometri: `volumen = længde × bredde × tykkelse`, hvor
 * længde og bredde er i meter og tykkelsen i cm omregnes til meter (`/ 100`).
 * Randfundamentet regnes med omkredsen `2 × (længde + bredde)`, og en søjle
 * med sit tværsnit gange højden.
 *
 * **Ingen af tilslagsværdierne er faste kendsgerheder:** spildafgiften er en
 * tommelfingerregel, og materialemængden afhænger af, hvor jævnt formen er.
 * Derfor bærer siden ingen tal, den ikke selv regner frem — tabel, brødtekst
 * og FAQ læser alle dette modul.
 *
 * Kilde og verificeringsdato: se `BETON_KILDE`.
 */

/** De tre støbetyper, siden dækker. */
export type BetonElementId = "plade" | "fundament" | "soejle";

export interface BetonElement {
  id: BetonElementId;
  navn: string;
  /** Hvad elementet bruges til. */
  brug: string;
}

/**
 * De tre elementer, beregneren dækker.
 *
 * Pladen dækker gulve, terrasser og indkørsler; fundamentet er et
 * randfundament langs grundens kant; søjlen er et punktfundament til fx
 * carport, skur eller hegnstolpe.
 */
export const BETON_ELEMENTER: readonly BetonElement[] = [
  {
    id: "plade",
    navn: "Plade (gulv, terrasse, indkørsel)",
    brug: "Et fladt lag på jorden, fx et terrasseunderlag, en garageplade eller en indkørselsflade.",
  },
  {
    id: "fundament",
    navn: "Randfundament",
    brug: "En bærende kant langs hele grundens omkreds, hvor murene rejses.",
  },
  {
    id: "soejle",
    navn: "Søjler og stolpehuller",
    brug: "Punktfundamenter under fx carportstolper, skur og hegn — adskilt af hinanden.",
  },
] as const;

export const BETON_KILDE = {
  poser:
    "https://www.byggmax.dk/stolpebeton-20-kg-skalflex-p01036 (udbytte: 20 kg tørprodukt giver ca. 10 liter færdigblandet beton)",
  raad:
    "https://materialeberegner.dk/kategori/beton (frostfri dybde typisk 90 cm, C20/25 til privat byggeri, færdigbeton i sække rentabelt op til ca. 1 m³)",
  vaegt:
    "https://calcly.dk/da/have-byggeri/stoebemix (ca. 2.200 kg/m³ blandet og hærdet) og https://whiz.tools/da/math/concrete-column-calculator (ca. 2.400 kg/m³ hærdet beton)",
  gulvvarme:
    "https://www.uponor.com/getmedia/8f60a12f-0ca5-4f5c-a66e-091a5783f9a1/uponor-projekthandbog-0215-lores.pdf (minimumstykkelsen på betonlaget over rørene skal være 30 mm, maks. 90 mm)",
  beskrivelse:
    "En 20 kg-pose færdigblandet støbemix giver ca. 10 liter færdigblandet beton, så 1 m³ svarer til 100 poser. Færdigbeton i sække er kun rentabel op til ca. 1 m³ — derover bestilles beton af bil. Hærdet beton vejer ca. 2,2-2,4 ton pr. m³.",
  verifiedAt: "2026-10-09",
} as const;

/** Støbemix-posen: den størrelse siden regner med. */
export const STOEBEMIX_POSE_KG = 20;
/** Ca. 10 liter færdigblandet beton pr. 20 kg-pose. */
export const STOEBEMIX_POSE_LITER = 10;

/** Vægtinterval for hærdet beton, ton pr. m³. */
export const BETON_TOM_MIN_PR_M3 = 2.2;
export const BETON_TOM_MAKS_PR_M3 = 2.4;

/** Over denne mængde er en betonbil billigere end poser. */
export const BETONBIL_GRENSE_M3 = 1;

/** Standard spild i beregningen, i procent — tomme formører og spild. */
export const BETON_STANDARD_SPILD_PCT = 10;

/** Standardmål for pladen, i meter og cm. */
export const PLADE_STANDARD_LAENGDE_M = 4;
export const PLADE_STANDARD_BREDDE_M = 3;
export const PLADE_STANDARD_TYKKELSE_CM = 10;

/** Standardmål for fundamentet. */
export const FUNDAMENT_STANDARD_LAENGDE_M = 8;
export const FUNDAMENT_STANDARD_BREDDE_M = 6;
export const FUNDAMENT_STANDARD_BREDDE_CM = 20;
export const FUNDAMENT_STANDARD_DYBDE_CM = 50;

/** Standardmål for søjlerne. */
export const SOEJLE_STANDARD_ANTAL = 4;
export const SOEJLE_STANDARD_BREDDE_CM = 20;
export const SOEJLE_STANDARD_DYBDE_CM = 20;
export const SOEJLE_STANDARD_HOEJDE_CM = 40;

export interface BetonValg {
  elementId: BetonElementId;
  /** Pladens og fundamentets længde i meter. */
  laengdeM?: number;
  breddeM?: number;
  /** Pladens tykkelse i cm. */
  tykkelseCm?: number;
  /** Fundamentets bredde i cm. */
  fundamentBreddeCm?: number;
  /** Fundamentets dybde i cm. */
  fundamentDybdeCm?: number;
  /** Søjlens antal. */
  antal?: number;
  soejleBreddeCm?: number;
  soejleDybdeCm?: number;
  soejleHoejdeCm?: number;
  /** Spild i procent. Negativ eller udefineret behandles som 0. */
  spildPct?: number;
}

export interface BetonResultat {
  /** Elementet beregningen er lavet for. */
  element: BetonElement;
  /** Volumen uden spild, i m³. */
  volumenM3Uden: number;
  /** Volumen med spild, i m³. Det der skal støbes. */
  volumenM3: number;
  /** Volumen med spild, i liter. */
  liter: number;
  /** Antal 20 kg-poser, rundet op. */
  poser20kg: number;
  /** Anslået vægt, ton, nedre grænse. */
  tonMin: number;
  /** Anslået vægt, ton, øvre grænse. */
  tonMaks: number;
  /** True når mængden er over grænsen for at poser kan betale sig. */
  overBetonbilGraense: boolean;
  /** De tal, beregningen er lavet ud fra, klar til brødtekst. */
  maal: string;
}

/** Slår et element op på id og falder tilbage til det første. */
export function betonElementVedId(id: string | undefined): BetonElement {
  return BETON_ELEMENTER.find((e) => e.id === id) ?? BETON_ELEMENTER[0];
}

function positiv(tal: number | undefined): number {
  return typeof tal === "number" && Number.isFinite(tal) && tal > 0 ? tal : 0;
}

function hel(tal: number | undefined, standard: number): number {
  return typeof tal === "number" && Number.isFinite(tal) && tal > 0 ? Math.round(tal) : standard;
}

const cmTilM = (cm: number) => cm / 100;

/**
 * Regner betonmængden for et af de tre elementer.
 *
 * En plade på 4 × 3 m i 10 cm er `4 × 3 × 0,10 = 1,2 m³`. Et randfundament
 * på en 8 × 6 m grund med 20 cm bredde og 50 cm dybde har omkredsen
 * `2 × (8 + 6) = 28 m`, så det er `28 × 0,20 × 0,50 = 2,8 m³`. Med 10 % spild
 * ganges begge med 1,10, og poserne er volumen i liter delt med posens
 * udbytte, rundet op.
 */
export function beregnBeton(valg: BetonValg): BetonResultat {
  const element = betonElementVedId(valg.elementId);
  const spildPct = positiv(valg.spildPct);

  let volumenM3Uden = 0;
  let maal = "";

  if (element.id === "plade") {
    const laengde = positiv(valg.laengdeM);
    const bredde = positiv(valg.breddeM);
    const tykkelseCm = hel(valg.tykkelseCm, PLADE_STANDARD_TYKKELSE_CM);
    volumenM3Uden = laengde * bredde * cmTilM(tykkelseCm);
    maal = `${laengde} × ${bredde} m i ${tykkelseCm} cm`;
  } else if (element.id === "fundament") {
    const laengde = positiv(valg.laengdeM);
    const bredde = positiv(valg.breddeM);
    const fundamentBreddeCm = hel(valg.fundamentBreddeCm, FUNDAMENT_STANDARD_BREDDE_CM);
    const dybdeCm = hel(valg.fundamentDybdeCm, FUNDAMENT_STANDARD_DYBDE_CM);
    const omkredsM = 2 * (laengde + bredde);
    volumenM3Uden = omkredsM * cmTilM(fundamentBreddeCm) * cmTilM(dybdeCm);
    maal = `${laengde} × ${bredde} m grund, ${fundamentBreddeCm} × ${dybdeCm} cm tværsnit`;
  } else {
    const antal = hel(valg.antal, SOEJLE_STANDARD_ANTAL);
    const breddeCm = hel(valg.soejleBreddeCm, SOEJLE_STANDARD_BREDDE_CM);
    const dybdeCm = hel(valg.soejleDybdeCm, SOEJLE_STANDARD_DYBDE_CM);
    const hoejdeCm = hel(valg.soejleHoejdeCm, SOEJLE_STANDARD_HOEJDE_CM);
    volumenM3Uden = antal * cmTilM(breddeCm) * cmTilM(dybdeCm) * cmTilM(hoejdeCm);
    maal = `${antal} søjler a ${breddeCm} × ${dybdeCm} × ${hoejdeCm} cm`;
  }

  // Inputs er meter med én decimal og cm hele, så voluminet kan afrundes til
  // liter-præcision (0,001 m³). Ellers giver flydetal som 4 × 3 × 0,1 flere
  // gram divideret med posens udbytte 133 poser i stedet for 132.
  const volumenUden = Math.round(volumenM3Uden * 1000) / 1000;
  const volumenM3 = Math.round(volumenUden * (1 + spildPct / 100) * 1000) / 1000;

  return {
    element,
    volumenM3Uden: volumenUden,
    ...omregnBeton(volumenM3),
    maal,
  };
}

export interface BetonOmregning {
  /** Volumen med spild, i m³. */
  volumenM3: number;
  /** Volumen, i liter. */
  liter: number;
  /** Antal 20 kg-poser, rundet op. */
  poser20kg: number;
  /** Anslået vægt, ton, nedre grænse. */
  tonMin: number;
  /** Anslået vægt, ton, øvre grænse. */
  tonMaks: number;
  /** True når mængden er over grænsen for at poser kan betale sig. */
  overBetonbilGraense: boolean;
}

/** Regner en m³-mængde om til liter, poser og ton. */
export function omregnBeton(volumenM3: number): BetonOmregning {
  const volumen = Number.isFinite(volumenM3) && volumenM3 > 0 ? volumenM3 : 0;
  const liter = Math.round(volumen * 1000);
  return {
    volumenM3: volumen,
    liter,
    poser20kg: Math.ceil(liter / STOEBEMIX_POSE_LITER),
    tonMin: volumen * BETON_TOM_MIN_PR_M3,
    tonMaks: volumen * BETON_TOM_MAKS_PR_M3,
    overBetonbilGraense: volumen > BETONBIL_GRENSE_M3,
  };
}

/** Standardmålene pr. element, så formularen udfylder noget fornuftigt. */
export function betonStandardValg(elementId: BetonElementId): BetonValg {
  if (elementId === "fundament") {
    return {
      elementId,
      laengdeM: FUNDAMENT_STANDARD_LAENGDE_M,
      breddeM: FUNDAMENT_STANDARD_BREDDE_M,
      fundamentBreddeCm: FUNDAMENT_STANDARD_BREDDE_CM,
      fundamentDybdeCm: FUNDAMENT_STANDARD_DYBDE_CM,
      spildPct: BETON_STANDARD_SPILD_PCT,
    };
  }
  if (elementId === "soejle") {
    return {
      elementId,
      antal: SOEJLE_STANDARD_ANTAL,
      soejleBreddeCm: SOEJLE_STANDARD_BREDDE_CM,
      soejleDybdeCm: SOEJLE_STANDARD_DYBDE_CM,
      soejleHoejdeCm: SOEJLE_STANDARD_HOEJDE_CM,
      spildPct: BETON_STANDARD_SPILD_PCT,
    };
  }
  return {
    elementId: "plade",
    laengdeM: PLADE_STANDARD_LAENGDE_M,
    breddeM: PLADE_STANDARD_BREDDE_M,
    tykkelseCm: PLADE_STANDARD_TYKKELSE_CM,
    spildPct: BETON_STANDARD_SPILD_PCT,
  };
}

/** Eksemplet værktøjet og brødteksten regner på. */
export const BETON_EKSEMPEL: BetonValg = {
  elementId: "plade",
  laengdeM: PLADE_STANDARD_LAENGDE_M,
  breddeM: PLADE_STANDARD_BREDDE_M,
  tykkelseCm: PLADE_STANDARD_TYKKELSE_CM,
  spildPct: BETON_STANDARD_SPILD_PCT,
};

/** Eksemplets resultat, så brødteksten og porten læser samme tal. */
export function betonEksempel(): BetonResultat {
  return beregnBeton(BETON_EKSEMPEL);
}
