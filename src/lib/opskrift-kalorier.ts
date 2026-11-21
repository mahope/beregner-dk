/**
 * Kalorier i opskrift — beregn kcal og makroer for en hel ret, pr. portion.
 *
 * Datagrund: dansk autocomplete (`suggestqueries.google.com`, hl=da, målt
 * 8/10 18:5x) svarer på «beregn kalorier i opskrift» med ti træffere, hvoraf
 * de fleste spørger om en konkret ret, og «beregn kalorier i mad» giver ti
 * mere (beregn kalorier i mad, i en ret, i en opskrift, i et måltid). Sitet
 * havde opslag i 53 madvarer (`/kalorier`) og mængder pr. person
 * (`/portioner`), men intet sted en opskrift kunne lægges ind.
 *
 * Tallene læses fra MADVARER i `kalorier-madvarer.ts` — den ene kilde, der
 * allerede er efterprøvet (USDA FoodData Central, SR Legacy 2018-04, `fdcId`
 * pr. række). Siden skriver derfor ingen tal selv: eksempler, FAQ, metadata
 * og værktøjet regner alle på de samme funktioner, så et tal ikke kan stå i
 * en sætning uden at stå i beregningen.
 *
 * Makroernes gram pr. 100 g er fra samme række. Kaloritallet er kildens eget
 * (næringsstof 1008), der bruger næringsstof-specifikke faktorer — derfor er
 * 4·protein + 9·fedt + 4·kulhydrat ikke præcis `kcal100g`, og det er skrevet
 * i sidens tekst frem for at blive skjult.
 */

import { kalorieIgram, madvareMedNavn, type Madvare } from "./kalorier-madvarer";

/** Kilden til hvert tal, så det kan efterprøves. */
export const OPSKRIFT_KILDE = {
  database: "USDA FoodData Central",
  dataset: "SR Legacy",
  udgave: "2018-04",
  laest: "8/10 2026",
  url: "https://fdc.nal.usda.gov",
  beskrivelse:
    "Kalorier og makronæringsstoffer pr. 100 g læses fra MADVARER i kalorier-madvarer.ts, hvor hver række bærer sit fdc_id i USDA FoodData Central. Opskriftens kalorier er summen af ingredienserne — vægtene skal være råvægt for de rå varer og vægt efter tilberedning for de kogte, som rækkens navn angiver.",
} as const;

export interface OpskriftNaering {
  kcal: number;
  protein: number;
  fedt: number;
  kulhydrat: number;
}

export interface OpskriftLinje {
  madvare: Madvare;
  gram: number;
}

/**
 * En ingredienslinjes næringsindhold. Nul, negative tal og ikke-tal regnes
 * som 0 gram — en ingrediens uden mængde bidrager ikke.
 */
export function opskriftLinje(linje: OpskriftLinje): OpskriftNaering {
  const gram = Number.isFinite(linje.gram) && linje.gram > 0 ? linje.gram : 0;
  const { madvare } = linje;
  return {
    kcal: kalorieIgram(madvare, gram),
    protein: (madvare.protein100g * gram) / 100,
    fedt: (madvare.fedt100g * gram) / 100,
    kulhydrat: (madvare.kulhydrat100g * gram) / 100,
  };
}

/** Summen af alle ingredienslinjer i opskriften. */
export function opskriftTotal(linjer: readonly OpskriftLinje[]): OpskriftNaering {
  return linjer.reduce<OpskriftNaering>(
    (sum, linje) => {
      const l = opskriftLinje(linje);
      return {
        kcal: sum.kcal + l.kcal,
        protein: sum.protein + l.protein,
        fedt: sum.fedt + l.fedt,
        kulhydrat: sum.kulhydrat + l.kulhydrat,
      };
    },
    { kcal: 0, protein: 0, fedt: 0, kulhydrat: 0 },
  );
}

/**
 * Næringsindholdet pr. portion. Under én portion findes svaret ikke — en ret
 * til nul personer kan ikke deles — og derfor gives `null` frem for 0, så
 * værktøjet og teksten ikke påstår at en portion koster 0 kcal.
 */
export function opskriftPrPortion(
  linjer: readonly OpskriftLinje[],
  portioner: number,
): OpskriftNaering | null {
  const antal = Number.isFinite(portioner) && portioner >= 1 ? portioner : 0;
  if (antal === 0) return null;
  const total = opskriftTotal(linjer);
  return {
    kcal: total.kcal / antal,
    protein: total.protein / antal,
    fedt: total.fedt / antal,
    kulhydrat: total.kulhydrat / antal,
  };
}

/**
 * Energiens andel fra hvert makro, regnet med Atwaters faktorer (4 kcal pr.
 * g protein og kulhydrat, 9 kcal pr. g fedt). Den viser hvor energien i
 * retten kommer fra — ikke summen af kildens kalorital, der beregnes med
 * næringsstof-specifikke faktorer.
 */
export function makroAndel(naering: OpskriftNaering): {
  protein: number;
  fedt: number;
  kulhydrat: number;
} {
  const energi =
    naering.protein * 4 + naering.fedt * 9 + naering.kulhydrat * 4;
  if (energi <= 0) return { protein: 0, fedt: 0, kulhydrat: 0 };
  return {
    protein: (naering.protein * 4 * 100) / energi,
    fedt: (naering.fedt * 9 * 100) / energi,
    kulhydrat: (naering.kulhydrat * 4 * 100) / energi,
  };
}

export interface OpskriftEksempelIngrediens {
  /** Navn præcis som i MADVARER — et navn der ikke findes, kaster. */
  navn: string;
  gram: number;
}

export interface OpskriftEksempel {
  navn: string;
  portioner: number;
  ingredienser: readonly OpskriftEksempelIngrediens[];
}

/**
 * De to opskrifter siden arbejder med. Mængderne er almindelige
 * husholdningsmængder (tørret pasta, 4 hele æg, 100 g revet ost), så
 * eksemplet ligner en ret læseren kan genkende. Alt andet på siden —
 * brødtekst, FAQ, metadata — regnes af de samme funktioner ud fra dem.
 */
export const OPSKRIFT_EKSEMPLER: readonly OpskriftEksempel[] = [
  {
    navn: "Pasta carbonara",
    portioner: 4,
    ingredienser: [
      { navn: "Nudler, tørrede", gram: 320 },
      { navn: "Æg, helt, råt", gram: 200 },
      { navn: "Gouda", gram: 100 },
      { navn: "Skinke", gram: 120 },
    ],
  },
  {
    navn: "Havregrød med banan",
    portioner: 2,
    ingredienser: [
      { navn: "Havregryn, tørrede", gram: 80 },
      { navn: "Mælk, letmælk 1,5 %", gram: 300 },
      { navn: "Banan", gram: 100 },
    ],
  },
] as const;

/**
 * Slår et eksempels navne op i tabellen. Et navn der ikke findes kaster, så
 * en omdøbt madvare rykker i hele sitets test i stedet for at skrive et tal,
 * tabellen ikke har.
 */
export function eksempelLinjer(eksempel: OpskriftEksempel): OpskriftLinje[] {
  return eksempel.ingredienser.map(({ navn, gram }) => {
    const madvare = madvareMedNavn(navn);
    if (!madvare) throw new Error(`Unknown food in opskrift example: ${navn}`);
    return { madvare, gram };
  });
}

/** Antallet af portioner værktøjet starter på. */
export const OPSKRIFT_STANDARD_PORTIONER = OPSKRIFT_EKSEMPLER[0].portioner;

/**
 * De to opskrifter med alt regnet ud — bruges af sidens brødtekst, FAQ og
 * metadata, så der ikke står et håndskrevet tal nogen steder.
 */
export const OPSKRIFT_EKSEMPEL_DATA = OPSKRIFT_EKSEMPLER.map((eksempel) => {
  const linjer = eksempelLinjer(eksempel);
  return {
    ...eksempel,
    linjer,
    total: opskriftTotal(linjer),
    prPortion: opskriftPrPortion(linjer, eksempel.portioner)!,
  };
});

/** Carbonara-rettens kcal pr. portion — tallet titlen bruger. */
export const OPSKRIFT_KCAL_PR_PORTION = Math.round(OPSKRIFT_EKSEMPEL_DATA[0].prPortion.kcal);

/**
 * MetaTitle med et regnet eksempel — det stærkeste enkeltstående CTR-signal
 * på sitet (GSC 3/10). Tallet regnes af de samme funktioner, som brødteksten
 * bruger, så en ændret række flytter titlen med.
 */
export const OPSKRIFT_META_TITEL = `Kalorier i opskrift: carbonara til 4 = ${OPSKRIFT_KCAL_PR_PORTION} kcal pr. portion`;

export const OPSKRIFT_META_BESKRIVELSE =
  "Beregn kalorier i opskriften: læg ingredienser og gram ind, skriv antallet af portioner, og se kcal og makroer pr. portion.";
