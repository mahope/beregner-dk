/**
 * Fliseberegner — hvor mange fliser (og kasser) skal der til et rum?
 *
 * Rummets areal er ren geometri: `længde × bredde` i m². Én flises areal er
 * `bredde × højde` i cm omregnet til m² (`/ 10.000`). Antallet af fliser er
 * arealet divideret med flisens areal, og der lægges spild til for tilskæring
 * langs kanter og hjørner.
 *
 * **Spildprocenten er ikke en fast kendsgerning:** den er branchens
 * tommelfingerregel (10 % til gulv- og vægfliser) og hentes fra det samme
 * materialemodul som `/kvadratmeter`, så de to værktøjer ikke kan komme til at
 * sige hver sit om det samme. Den er redigerbar i værktøjet.
 *
 * Antallet af fliser pr. kasse står på kassen og varierer med formatet, så det
 * er også en redigerbar standardværdi — ikke et tal, siden opfinder.
 *
 * Kilde og verificeringsdato: se `FLISER_KILDE`.
 */

import { materialeVedId } from "./kvadratmeter-materialer";

/** Flisekategorien i materialemodulet, så spild har én kilde. */
const FLISE_MATERIALE = materialeVedId("fliser");

export const FLISER_KILDE = {
  spild: "https://hjemmeland.dk/beregner/kvadratmeter-m2-beregner/",
  beskrivelse:
    "Danske flise- og gulvleverandører anbefaler at lægge 10 % til for spild ved skæring langs kanter, hjørner og rørgennemføringer; 5-10 % er den gængse tommelfingerregel. Antal fliser pr. kasse står på kassen og varierer med fliseformatet.",
  verifiedAt: "2026-10-08",
} as const;

/** Spild tillagt i standardberegningen, i procent. */
export const FLISER_STANDARD_SPILD_PCT = FLISE_MATERIALE.spildPct;

/** Fliseformatet værktøjet starter på, i cm. 60 × 60 er et almindeligt gulvformat. */
export const FLISER_STANDARD_BREDDE_CM = 60;
export const FLISER_STANDARD_HOEJDE_CM = 60;

/** Antal fliser pr. kasse værktøjet starter på. Redigerbar. */
export const FLISER_STANDARD_PR_ESKE = 4;

/** Rummets startmål, i meter. */
export const FLISER_STANDARD_LAENGDE_M = 4;
export const FLISER_STANDARD_BREDDE_M = 3;

export interface FliserValg {
  /** Rummets længde i meter. */
  laengdeM: number;
  /** Rummets bredde i meter. */
  breddeM: number;
  /** Flisens bredde i cm. */
  fliseBreddeCm: number;
  /** Flisens højde i cm. */
  fliseHoejdeCm: number;
  /** Spild i procent. Negativ eller udefineret behandles som 0. */
  spildPct?: number;
  /** Antal fliser pr. kasse. Under 1 behandles som 1. */
  fliserPrEske?: number;
}

export interface FliserResultat {
  /** Rummets areal i m². */
  arealM2: number;
  /** Én flises areal i m². */
  fliseArealM2: number;
  /** Hvor mange fliser der går på én m². */
  fliserPrM2: number;
  /** Fliser uden spild, afrundet op til et helt antal. */
  fliserUdenSpild: number;
  /** Fliser inkl. spild, afrundet op. Det der skal lægges. */
  fliserMedSpild: number;
  /** Kasser der skal købes, afrundet op. */
  esker: number;
  /** Det samlede areal der købes i kasserne, i m². */
  koebM2: number;
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
 * Antal fliser pr. kvadratmeter for et format i cm.
 *
 * En 60 × 60-flise fylder 0,36 m², så der går `1 ÷ 0,36 = 2,78` fliser på
 * én m². Ugyldige eller negative mål giver 0 i stedet for uendeligt.
 */
export function fliserPrKvadratmeter(breddeCm: number, hoejdeCm: number): number {
  const bredde = positiv(breddeCm);
  const hoejde = positiv(hoejdeCm);
  if (bredde === 0 || hoejde === 0) return 0;
  return 10000 / (bredde * hoejde);
}

/**
 * Regner flisebehovet for et rum.
 *
 * Et rum på 4 × 3 m er 12 m². Med 60 × 60-fliser (0,36 m²) og 10 % spild skal
 * der `12 × 1,10 ÷ 0,36 = 36,67`, altså **37 fliser** til. Sælges de 4 pr.
 * kasse, er det **10 kasser** — 14,4 m², fordi kasserne ikke kan deles.
 */
export function beregnFliser(valg: FliserValg): FliserResultat {
  const laengde = positiv(valg.laengdeM);
  const bredde = positiv(valg.breddeM);
  const fliseBredde = positiv(valg.fliseBreddeCm);
  const fliseHoejde = positiv(valg.fliseHoejdeCm);
  const spildPct = positiv(valg.spildPct);
  const prEske = heltal(valg.fliserPrEske, 1);

  const arealM2 = laengde * bredde;
  const fliseArealM2 = (fliseBredde * fliseHoejde) / 10000;

  if (arealM2 === 0 || fliseArealM2 === 0) {
    return {
      arealM2,
      fliseArealM2,
      fliserPrM2: fliserPrKvadratmeter(fliseBredde, fliseHoejde),
      fliserUdenSpild: 0,
      fliserMedSpild: 0,
      esker: 0,
      koebM2: 0,
    };
  }

  const fliserUdenSpild = Math.ceil(arealM2 / fliseArealM2);
  const fliserMedSpild = Math.ceil((arealM2 * (1 + spildPct / 100)) / fliseArealM2);
  const esker = Math.ceil(fliserMedSpild / prEske);

  return {
    arealM2,
    fliseArealM2,
    fliserPrM2: fliserPrKvadratmeter(fliseBredde, fliseHoejde),
    fliserUdenSpild,
    fliserMedSpild,
    esker,
    koebM2: esker * prEske * fliseArealM2,
  };
}

/** Standardrummet værktøjet og brødteksten regner på. */
export const FLISER_EKSEMPEL: FliserValg = {
  laengdeM: FLISER_STANDARD_LAENGDE_M,
  breddeM: FLISER_STANDARD_BREDDE_M,
  fliseBreddeCm: FLISER_STANDARD_BREDDE_CM,
  fliseHoejdeCm: FLISER_STANDARD_HOEJDE_CM,
  spildPct: FLISER_STANDARD_SPILD_PCT,
  fliserPrEske: FLISER_STANDARD_PR_ESKE,
};

/** Eksemplets resultat, så brødteksten og porten læser samme tal. */
export function fliserEksempel(): FliserResultat {
  return beregnFliser(FLISER_EKSEMPEL);
}

/** Almindelige fliseformater til tabellen og FAQ'en, i cm. */
export const FLISER_FORMATER: readonly [number, number][] = [
  [10, 10],
  [15, 15],
  [20, 20],
  [25, 25],
  [30, 30],
  [30, 60],
  [40, 40],
  [45, 45],
  [60, 60],
  [60, 120],
];
