/**
 * Svarene på "hvad er klokken i <stat>" — den del af `/tidszone`s egen
 * søgeklynge, der hverken by- eller tidspunktetabellen dækker.
 *
 * Datagrund (autocomplete, hentet 2026-09-29 kl. 10:10, begge sprog):
 *
 * - DA `klokken i usa` → "… california" (nr. 3), "… florida" (nr. 5),
 *   "… miami" (nr. 6), "… boston" (nr. 9)
 * - DA `hvad er klokken i usa` → "… miami" (nr. 6)
 * - DA `klokken i usa nu` → "hvad er klokken i atlanta usa nu" (nr. 3),
 *   "… boston usa nu" (nr. 4), "… colorado usa nu" (nr. 5)
 * - SE `klokken i usa` → "… florida usa" (nr. 4), "… texas usa" (nr. 7),
 *   "… georgia usa" (nr. 8), "… arizona usa" (nr. 9), "… atlanta usa" (nr. 10)
 * - SE `hvad är klockan i usa` → "… florida usa" (nr. 4), "… california"
 *   (nr. 5), "… texas usa" (nr. 6), "… washington" (nr. 9), "… miami" (nr. 10)
 *
 * Altså er otte af ti variationer i hver af de to største variationer stater
 * eller byer, vi ikke nævner. Målt på begge live-domæner var `Florida`,
 * `Texas`, `Californien`, `Washington`, `Miami`, `Dallas`, `Minnesota`,
 * `Georgia`, `Arizona` og `Colorado` **0** forekommer hver — mens New York lå
 * 26 gange og Los Angeles 15.
 *
 * **Hvorfor hver stat peger på en by i TIDSZONER.** USA har fire zoner, og
 * det er byen — ikke staten — der afgør hvilken. Derfor er hver række et
 * *navn* på en stat og en *henvisning* til den by i TIDSZONER, der ligger i
 * samme zone, og klokkeslættet regnes af `klokkeslaetVed` med byens egen zone.
 * Ingen offset står i denne fil. Det er C155's regel om Canada anvendt på
 * hele tabellen: en håndskrevet offset kunne glide fra
 * `TidszoneBeregneren`, en reference kan ikke.
 *
 * Arizona er den fælde, tabellen findes for: Phoenix ligger i Mountain Time
 * som Denver, men Arizona undtaget fra sommertid siden 1967, så Phoenix er
 * fast UTC-7. Når Danmark går på sommertid flytter Denver sig med og står
 * stadig 04, mens Phoenix *falder* til 03 — altså er Phoenix den eneste række,
 * hvor de to kolonner er forskellige. Det er grunden til at tabellen har to
 * kolonner — i modsætning til `usaTimerRaekker`, hvor alle byer skifter
 * samtidig med Danmark. Min første tekst påstod det modsatte ("Phoenix er 05
 * både vinter og sommer, Denver går fra 05 til 04"), og det blev fundet fordi
 * testen forventede forkert: `klokkeslaetVed` gav 04/03 for Arizona og 04/04
 * for Colorado.
 */

import {
  TIDSZONER,
  type TidszoneInfo,
  type TidszoneSprog,
  klokkeslaetVed,
} from "./tidszone-reference";

/**
 * En amerikansk stat, folk spørger efter i autocomplete. Felterne er kun navne
 * og referencer — ingen tal, se modulens docblock.
 */
export interface UsaStat {
  /** Statens navn på dansk. */
  statDa: string;
  /** Navnet på svensk, når det afviger fra dansk. */
  statSe?: string;
  /** Byen i TIDSZONER, staten ligger i samme tidszone som. */
  by: string;
}

/**
 * Rækkerne er målt efter autocomplete, ikke valgt for at se pænt ud: den
 * rækkefølge, klyngen søger i.
 */
export const USA_STATER: readonly UsaStat[] = [
  { statDa: "Florida", by: "Miami" },
  { statDa: "Californien", statSe: "Kalifornien", by: "Los Angeles" },
  { statDa: "Texas", by: "Chicago" },
  { statDa: "Washington", by: "Los Angeles" },
  { statDa: "Georgia", by: "New York" },
  { statDa: "Arizona", by: "Phoenix" },
  { statDa: "Colorado", by: "Denver" },
  { statDa: "Minnesota", by: "Chicago" },
  { statDa: "Massachusetts", by: "Boston" },
];

function zoneFor(by: string): TidszoneInfo {
  const zone = TIDSZONER.find((kandidat) => kandidat.by === by);
  if (!zone) {
    // Samme begrundelse som `usaTimerRaekker`: en by i denne fil uden zone i
    // TIDSZONER er en kildefejl, og en springet-by-over ville give en tabel
    // med en række for lidt (C118's fejlklasse om vakuum-grønne tællinger).
    throw new Error(`Byen "${by}" findes ikke i TIDSZONER`);
  }
  return zone;
}

export interface UsaStatRaekke {
  /** Statens navn i det valgte sprog. */
  stat: string;
  /** Byen tabellen bruger som repræsentant for zonen. */
  by: string;
  /** Klokkeslæt i staten når det er 12 i Danmark/Sverige, dansk vintertid. */
  vinter: string;
  /** Det samme klokkeslæt i dansk sommertid. */
  sommer: string;
  /**
   * Om statens klokkeslæt er det samme vinter og sommer. Sandt for Arizona,
   * der ikke bruger sommertid — det er hele pointen med at have to kolonner.
   */
  fastZone: boolean;
}

export function usaStatRaekker(
  spoergsprog: TidszoneSprog = "da"
): UsaStatRaekke[] {
  return USA_STATER.map((stat) => {
    const zone = zoneFor(stat.by);
    return {
      stat: spoergsprog === "se" ? (stat.statSe ?? stat.statDa) : stat.statDa,
      by: spoergsprog === "se" ? (zone.bySe ?? zone.by) : zone.by,
      vinter: klokkeslaetVed(12, zone, false),
      sommer: klokkeslaetVed(12, zone, true),
      fastZone: zone.utcSommer === undefined || zone.utcSommer === zone.utcVinter,
    };
  });
}

/** Antallet af stater i tabellen, som teksten skal kunne navngive. */
export const usaStatAntal = USA_STATER.length;
