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
 * **Hvorfor der er én kolonne og ikke to.** USA's og Danmarks forskel er den
 * samme, når **begge** har skiftet og når **ingen** har skiftet, så de to
 * kolonner ville være ens i 337 af årets 365 dage. Min første version havde
 * dem, og testen fangede, at de var ens. Det er C121's lære modsat, hvor byen
 * bruger egen sommertid.
 *
 * De sidste 28 dage er undtagelsen, og de skyldes at reglerne **ikke** er de
 * samme: USA skifter anden søndag i marts og første søndag i november,
 * Danmark sidste søndag i marts og sidste søndag i oktober. `afvigendeDage()`
 * tæller dem, og brødteksten læser tallet — den må ikke sige "hele året".
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
import { erSommertid } from "./sommertid";

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
   * Om byens **offset spring** er lige så stort som Danmarks, altså om den
   * flytter uret lige så mange timer. Sandt for alle tre amerikanske byer.
   *
   * Det er **ikke** det samme som at byen skifter på Danmarks datoer, og
   * må ikke læses som det: USA skifter 2. søndag i marts og Danmark sidste,
   * så i 28 dage om året er forskellen en time mindre end tabellen viser.
   * Se `afvigendeDage()`, som tæller dem.
   *
   * Det må ikke udledes af "har byen sommertid": alle tre har den, men kun
   * fordi de flytter samme antal timer. Det er C121's skel.
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
    // Vinter-værdien bruges, fordi USA's og Danmarks forskel er den samme
    // både når begge har skiftet og når ingen har det. De to skifter på
    // **forskellige datoer** (USA 2. søndag i marts / 1. søndag i november,
    // Danmark sidste søndag i marts / sidste søndag i oktober), så i de dage
    // hvor kun USA har skiftet, ligger byen én time tættere på. Antallet af
    // sådanne dage er `afvigendeDage()` — brødteksten læser det, så den
    // ikke kan sige "hele året" om et tal, der kun holder 337 dage.
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

/**
 * Antallet af dage i `aar`, hvor tidsforskellen til en amerikansk by **ikke**
 * er tabellens værdi, fordi USA har skiftet sommertid mens Danmark end ikke
 * har det (eller omvendt).
 *
 * **Hvorfor brødteksten ikke må sige "hele året".** USA skifter anden søndag
 * i marts og første søndag i november; Danmark skifter sidste søndag i marts
 * og sidste søndag i oktober. De to regler er altså *forskellige*, selv om
 * de flytter uret samme antal timer. Det betyder, at forskellen til New York
 * er 6 timer på 337 af årets 365 dage og 5 timer i resten — aldrig 7, fordi
 * Danmark skifter tilbage *før* USA gør det om efteråret. Målt med
 * `erSommertid(dag, "eu")` mod `erSommertid(dag, "us")` for hver dag i
 * `aar`; standarden er 2026, samme år som resten af modulet.
 *
 * Før denne måling skrev siden "6 timer … hele året", "forskellen er den
 * samme sommer og vinter" og "USA skifter sommertid på samme datoer som
 * Danmark" — tre formuleringer, der alle er modsat af `sommertid.ts`, og
 * som modsiges af sidens egen tabel 40 linjer længere oppe (New York står
 * der som "5-6 timer bagud"). Brødteksten læser derfor dette tal i stedet
 * for at hævde en egenskab ved USA's regel.
 */
export function afvigendeDage(aar = 2026): number {
  let antal = 0;
  for (let dag = 0; dag < 366; dag++) {
    const dato = new Date(aar, 0, 1 + dag);
    if (dato.getFullYear() !== aar) break;
    if (erSommertid(dato, "eu") !== erSommertid(dato, "us")) antal++;
  }
  return antal;
}
