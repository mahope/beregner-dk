/**
 * Malingberegner — hvor mange liter maling skal der til væggene (og loftet)?
 *
 * Arealet er ren geometri: et rums vægareal er omkredsen gange højden,
 * `2 × (længde + bredde) × højde`, og loftet er `længde × bredde`. Døre og
 * vinduer trækkes fra, fordi de ikke skal males.
 *
 * Literforbruget er areal × antal strøg ÷ dækkevne. **Dækkevnen er ikke en
 * fast kendsgerning:** den står på malingsdåsens eget datablad og falder på
 * sugende og ru underlag, så den er en redigerbar standardværdi (10 m² pr.
 * liter) og ikke et tal, siden opfinder. Spildprocenten (10 %) kommer fra
 * samme kilde som materialeberegneren på `/kvadratmeter`, så de to værktøjer
 * ikke kan komme til at sige hver sit om det samme.
 *
 * Kilde og verificeringsdato: se `KILDE` nederst i `kvadratmeter-materialer.ts`
 * og `MALING_KILDE` her.
 */

import { materialeVedId } from "./kvadratmeter-materialer";

/** Malingskategorien i materialemodulet, så dækkevne og spild har én kilde. */
const MALING_MATERIALE = materialeVedId("maling");

export const MALING_KILDE = {
  daekning: "https://hjemmeland.dk/beregner/kvadratmeter-m2-beregner/",
  beskrivelse:
    "Malingens dækkevne står på dåsens eget datablad og varierer med underlag og kvalitet. 5-10 % ekstra til spild og tilskæring er branchens tommelfingerregel.",
  verifiedAt: "2026-09-25",
} as const;

/** Standarddækkevne i m² pr. liter pr. strøg. Redigerbar i værktøjet. */
export const MALING_DAEKNING_M2_PR_LITER = MALING_MATERIALE.daekningPrEnhedM2;

/** Spild tillagt i standardberegningen, i procent. */
export const MALING_STANDARD_SPILD_PCT = MALING_MATERIALE.spildPct;

/** Antal strøg værktøjet foreslår som standard. */
export const MALING_STANDARD_STROEG = 2;

/** Højde i meter værktøjet starter på. */
export const MALING_STANDARD_HOEJDE_M = 2.5;

export interface MalingRumValg {
  /** Rummets længde i meter. */
  laengdeM: number;
  /** Rummets bredde i meter. */
  breddeM: number;
  /** Væghøjde i meter. */
  hoejdeM: number;
  /** Antal ens rum. Mindre end 1 behandles som 1. */
  antalRum?: number;
  /** Døre og vinduer, der trækkes fra pr. rum, i m². */
  fravalgM2?: number;
  /** Skal loftet regnes med? */
  medLoft?: boolean;
}

export interface MalingAreal {
  /** Vægareal pr. rum uden fradrag, i m². */
  vaegarealM2: number;
  /** Loftareal pr. rum, 0 når loftet ikke er medregnet. */
  loftarealM2: number;
  /** Det der faktisk skal males pr. rum: væg + loft − døre og vinduer. */
  prRumM2: number;
  antalRum: number;
  /** Det samlede maleareal for alle rum. */
  samletM2: number;
}

function positiv(tal: number | undefined): number {
  return typeof tal === "number" && Number.isFinite(tal) && tal > 0 ? tal : 0;
}

function heltal(tal: number | undefined, mindst: number): number {
  return typeof tal === "number" && Number.isFinite(tal)
    ? Math.max(mindst, Math.floor(tal))
    : mindst;
}

/**
 * Regner væg- og loftareal for et antal ens rum.
 *
 * Et rum på 5 × 4 m med 2,5 m til loftet har `2 × (5 + 4) × 2,5 = 45 m²` væg.
 * Med loftet medregnet lægges `5 × 4 = 20 m²` oveni, altså 65 m².
 */
export function beregnMalingAreal(valg: MalingRumValg): MalingAreal {
  const laengde = positiv(valg.laengdeM);
  const bredde = positiv(valg.breddeM);
  const hoejde = positiv(valg.hoejdeM);
  const antalRum = heltal(valg.antalRum, 1);
  const fravalg = positiv(valg.fravalgM2);

  // Et rum uden alle tre mål er ikke et rum; så giver det ingen flade.
  if (laengde === 0 || bredde === 0 || hoejde === 0) {
    return { vaegarealM2: 0, loftarealM2: 0, prRumM2: 0, antalRum, samletM2: 0 };
  }

  const vaegarealM2 = 2 * (laengde + bredde) * hoejde;
  const loftarealM2 = valg.medLoft ? laengde * bredde : 0;
  const prRumM2 = Math.max(0, vaegarealM2 + loftarealM2 - fravalg);

  return {
    vaegarealM2,
    loftarealM2,
    prRumM2,
    antalRum,
    samletM2: prRumM2 * antalRum,
  };
}

export interface MalingResultat {
  arealM2: number;
  straag: number;
  daekningM2PrLiter: number;
  /** Areal × strøg ÷ dækkevne, uden spild. */
  literEksakt: number;
  /** Liter inkl. spild. */
  literMedSpild: number;
  /** Det der skal købes: literMedSpild rundet op til hele liter. */
  literKoeb: number;
}

/**
 * Regner literforbruget for et maleareal.
 *
 * `45 m²` med to strøg og 10 m² pr. liter giver `45 × 2 ÷ 10 = 9 liter`, og
 * med 10 % til spild 9,9 liter, altså 10 liter der skal købes.
 */
export function beregnMalingLiter(
  arealM2: number,
  straag: number,
  daekningM2PrLiter: number,
  spildPct: number = MALING_STANDARD_SPILD_PCT,
): MalingResultat {
  const areal = positiv(arealM2);
  const stroeg = heltal(straag, 1);
  const daekning = positiv(daekningM2PrLiter);
  const spild = positiv(spildPct);

  const literEksakt = daekning > 0 ? (areal * stroeg) / daekning : 0;
  const literMedSpild = literEksakt * (1 + spild / 100);

  return {
    arealM2: areal,
    straag: stroeg,
    daekningM2PrLiter: daekning,
    literEksakt,
    literMedSpild,
    literKoeb: Math.ceil(literMedSpild),
  };
}

/** Standardrummet værktøjet og brødteksten regner på. */
export const MALING_EKSEMPEL: MalingRumValg = {
  laengdeM: 5,
  breddeM: 4,
  hoejdeM: MALING_STANDARD_HOEJDE_M,
  antalRum: 1,
  fravalgM2: 0,
  medLoft: false,
};

/** Eksemplets areal, så brødteksten og porten læser samme tal. */
export function malingEksempelAreal(): MalingAreal {
  return beregnMalingAreal(MALING_EKSEMPEL);
}

/** Eksemplets literforbrug med to strøg og standarddækkevnen. */
export function malingEksempelLiter(): MalingResultat {
  return beregnMalingLiter(
    malingEksempelAreal().samletM2,
    MALING_STANDARD_STROEG,
    MALING_DAEKNING_M2_PR_LITER,
  );
}
