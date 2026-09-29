/**
 * Time-punktet-spørgsmålene om "/tidszone", som TIDSZONER-tabellen ikke
 * besvarer: den svarer på præcis ét tidspunkt — kl. 12 — mens sidens egen
 * søgeklynge spørger om klokken ved *andre* tidspunkter.
 *
 * Datagrund: dansk autocomplete (hl=da, gl=dk) under "hvad er klokken i usa"
 * giver ti variationer, hvoraf fire er det samme spørgsmål med et andet
 * klokkeslæt: "… når den er 12 i danmark" (nr. 3), "… 21 i danmark" (nr. 5),
 * "… 14 i danmark" (nr. 7) og "… 16 i danmark" (nr. 8). GSC har den konkrete
 * 12-variant som 175 visninger på pos. 6, altså trafikken er der. Kl. 12-
 * tabellen svarer på præcis én af de fire.
 *
 * Derfor er `TIDSPUNKTER` de timer, klyngen faktisk spørger om — ikke et
 * udvalg, der ser pænt ud. Rækken er målt mod autocomplete.
 *
 * **Hvorfor der er én kolonne og ikke to.** USA skifter som Danmark — anden
 * søndag i marts og første søndag i november siden 2007 — så tidsforskellen
 * til en amerikansk by er den samme hele året, og en vinter/sommer-tabel
 * ville have to ens kolonner. Min første version havde dem, og testen
 * fangede det: `06:00 … 15:00` i begge lister. Det er C121's lære modsat,
 * hvor byen bruger egen sommertid; her bruger byen Danmarks.
 *
 * Alt er udregnet fra TIDSZONER og DANSK_UTC_VINTER/-SOMMER via
 * `klokkeslaetVed`, altså samme regel som den eksisterende kl. 12-tabel og
 * TidszoneBeregneren. Ingen by eller offset står her, så tabellen kan ikke
 * modsige dem (C84's metaDescription-fund i en ny form: en indekseret
 * taltabel der siger noget andet end det værktøjet regner).
 */

import {
  DANSK_UTC_SOMMER,
  DANSK_UTC_VINTER,
  TIDSZONER,
  type TidszoneInfo,
  type TidszoneSprog,
  klokkeslaetVed,
} from "./tidszone-reference";

/**
 * De klokkeslæt i Danmark/Sverige, klyngen spørger om: 12, 14, 16 og 21.
 * 12 er med, fordi det er det eneste det eksisterende svar dækker, så rækken
 * kan læses mod den — og fordi GSC's målte søgning er den.
 */
export const TIDSPUNKTER: readonly number[] = [12, 14, 16, 21];

/**
 * De byer, spørgsmålet handler om. "hvad er klokken i usa" spørger om USA,
 * og de tre amerikanske byer i TIDSZONER dækker Eastern, Central og
 * Pacific. Mountain mangler bevidst: TIDSZONER har ingen by i den zonen,
 * og en håndskrevet offset ville være et gæt, der kunne glide fra
 * TidszoneBeregneren (samme regel som C155's beslutning om Canada).
 *
 * Miami står også ikke, af samme grund — det er Eastern som New York, men
 * uden en zone i TIDSZONER ville rækken være et gæt. Autocomplete spørger
 * om Miami i begge sprog, så det er en reel, men ubesvaret, efterspørgsel;
 * den kan kun lukkes ved at udvide TIDSZONER med en kilde, ikke ved en
 * linje i denne fil.
 */
const BYER: readonly string[] = ["New York", "Chicago", "Los Angeles"];

export interface UsaTimerRaekke {
  /** Slaget i TIDSZONER, tallene er regnet fra. */
  by: string;
  /** Viser byen på svensk, når den afviger fra dansk. */
  bySe?: string;
  /** Klokkeslæt i byen for hvert tidspunkt i `TIDSPUNKTER`. */
  klokkeslaet: string[];
  /**
   * Om byen skifter sommertid på **EU's datoer**, altså samtidig med
   * Danmark. Sandt for alle tre amerikanske byer siden 2007, og derfor er
   * svaret det samme om vinteren og sommeren.
   *
   * Det må ikke udledes af "har byen sommertid": alle tre har den, men kun
   * fordi de skifter samtidig. Det er C121's skel.
   */
  skifterSamtidigMedDanmark: boolean;
}

function zoneFor(by: string): TidszoneInfo {
  const zone = TIDSZONER.find((kandidat) => kandidat.by === by);
  if (!zone) {
    // Kaster i stedet for at returnere null: en by i BYER uden zone i
    // TIDSZONER er en kildefejl, og en stille springet-by-over ville give
    // en tabel med en by for lidt (C118's fejlklasse om vakuum-grønne
    // tællinger).
    throw new Error(`Byen "${by}" findes ikke i TIDSZONER`);
  }
  return zone;
}

export function usaTimerRaekker(
  spoergsprog: TidszoneSprog = "da"
): UsaTimerRaekke[] {
  return BYER.map((by) => {
    const zone = zoneFor(by);
    // Vinter-værdien bruges, fordi USA og Danmark skifter samtidig, så
    // sommer-værdien er den samme. Skulle de en dag skifte på forskellige
    // datoer, er det her det skal ændre sig — ikke i tabellens markup.
    return {
      by,
      bySe: zone.bySe,
      klokkeslaet: TIDSPUNKTER.map((time) => klokkeslaetVed(time, zone, false)),
      skifterSamtidigMedDanmark:
        zone.utcSommer === zone.utcVinter + (DANSK_UTC_SOMMER - DANSK_UTC_VINTER),
    };
  });
}

/** Antallet af byer i time-tabellen, som teksten skal kunne navngive. */
export const usaTimerAntal = BYER.length;
