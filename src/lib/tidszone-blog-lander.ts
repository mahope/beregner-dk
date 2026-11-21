/**
 * Verdens-tabellen i blogindlægget "Hvad er klokken i USA?".
 *
 * **Hvorfor denne fil findes.** Indlægget skrev selv sin egen verdens-tabel i
 * JSX med **16 rækker og håndskrevne tekster** ("1 time bagud", "Samme tid"),
 * og titlen lovede "Tidsforskel for 16 byer". Men `/tidszone`s egen tabel har
 * **25 byer** siden C84 lagde fem til og C172 lagde fire USA-byer til. To filer
 * om de samme byer, to forskellige tal, og *titlen* — den mest indekserede
 * streng på siden — bar det ældste. Det er C84's fejlklasse (indekseret tekst
 * der modsiger sit eget indhold) i dens reneste form: bloggen lå omkring de
 * nye byer, fordi den aldrig læste `TIDSZONER`.
 *
 * Målt på begge live-domæner 2026-09-29 kl. 16:50: "16 byer" stod 6 gange i
 * `/blog/hvad-er-klokken-i-usa-naar-den-er-12-i-danmark` (title, og:title, `<h1>`
 * og blog-koblingens beskrivelse) mens `/tidszone` siger "25 byer" to gange i
 * samme HTML, og de ni manglende byer (Toronto, Lissabon, Reykjavik, Athen,
 * Heraklion, Miami, Boston, Phoenix, Istanbul) stod 0 gange i indlægget.
 *
 * **Reglen, der gør afdrift umulig.** Der står **ingen by og ingen offset** i
 * denne fil. Hver række er en *henvisning* til en by i `TIDSZONER`, og både
 * forskelsteksten og klokkeslættet regnes af `tidsskillnadRaekker` og
 * `klokkeslaetVed` — samme to funktioner som `/tidszone` selv bruger. En by
 * kan derfor ikke stå med en forkert forskel, og en by der lægges til
 * `TIDSZONER` kommer automatisk med her, fordi tabellen *er* `TIDSZONER`.
 *
 * `blogVerdensAntal` er det tal titlen og `<h1>` bruger, læst fra den samme
 * liste. Det er derfor "16 byer" ikke kan overleve: tallet står ikke i
 * brødteksten, det er en egenskab ved data.
 */

import {
  DANSK_UTC_SOMMER,
  DANSK_UTC_VINTER,
  TIDSZONER,
  type TidszoneInfo,
  brugerSommertid,
  byOffsetVedDanmarkSæson,
  klokkeslaetVed,
} from "./tidszone-reference";

/**
 * Rækkefølgen i blogtabellen. Den er bevidst *ikke* alfabetisk og *ikke*
 * TIDSZONER's rækkefølge: den læser som en rejse — Europa først, så
 * Amerika, så Asien og stillehavet — og slutter i New Zealand, den
 * østligste by på kortet. Samme rækkefølge som den håndskrevne tabel havde,
 * så artiklen læses ens før og efter.
 *
 * Hver by skal findes i TIDSZONER; `zoneFor` kaster ellers. Det er C118's
 * regel: en springet-by-over ville give en tabel med en række for lidt uden
 * at nogen kunne se det.
 */
const VERDENS_REKKEFOLGE: readonly string[] = [
  // Europa
  "London",
  "Lissabon",
  "Reykjavik",
  "Nuuk",
  "Madrid",
  "Athen",
  "Heraklion (Kreta)",
  "Istanbul",
  // Amerika
  "New York",
  "Toronto",
  "Miami",
  "Boston",
  "Chicago",
  "Denver",
  "Phoenix",
  "Los Angeles",
  "São Paulo",
  // Asien, Afrika og Oceanien
  "Dubai",
  "Mumbai",
  "Bangkok",
  "Denpasar (Bali)",
  "Shanghai",
  "Tokyo",
  "Sydney",
  "Auckland",
];

function zoneFor(by: string): TidszoneInfo {
  const zone = TIDSZONER.find((kandidat) => kandidat.by === by);
  if (!zone) {
    throw new Error(`Byen "${by}" findes ikke i TIDSZONER`);
  }
  return zone;
}

/** Heltalsformat med dansk komma, så 4,5 kan læses. */
function tal(timer: number): string {
  return String(timer).replace(".", ",");
}

/**
 * Forskel i timer, positivt = byen ligger *foran* Danmark. Det er byens egen
 * offset på den dato, hvor Danmark har sæsonen, minus Danmarks offset —
 * præcis `tidsskillnadRaekker`s egen `forskel`, altså samme kalender og samme
 * IANA-afledte grund som `/tidszone`s bytabel.
 *
 * Den tidligere formel var `zone.utcVinter − danskUtc`, som antog at byen
 * skiftede sommertid samtidig med Danmark. Det gav artiklen «11 timer frem»
 * for Auckland, mens `Intl` siger Pacific/Auckland er UTC+13 den 15. januar,
 * altså 12 timer frem — og Sydney «9 timer frem» i stedet for 10.
 */
function forskel(zone: TidszoneInfo, danskSommerstid: boolean): number {
  return (
    byOffsetVedDanmarkSæson(zone, danskSommerstid) -
    (danskSommerstid ? DANSK_UTC_SOMMER : DANSK_UTC_VINTER)
  );
}

export interface BlogVerdensRaekke {
  /** Byen, som den staves i TIDSZONER. */
  by: string;
  /** Forskel i dansk vintertid, i hele eller brudte timer. */
  vinter: number;
  /** Forskel i dansk sommertid. Kun angivet når den afviger fra vinter. */
  sommer?: number;
  /** "1 time bagud" / "4,5 timer frem" / "Samme tid". */
  tekstVinter: string;
  /** Det samme for sommer, når det afviger. */
  tekstSommer?: string;
  /** Klokkeslæt i byen når det er 14 i Danmark, dansk vintertid. */
  kl14: string;
  /**
   * Om byen skifter sommertid selv. Sand for både dem der gør (London, Nuuk,
   * Athen, Madrid) og dem der ikke gør (Tokyo, Dubai, Phoenix): forskellen
   * til Danmark er i *begge* tilfælde den samme hele året, fordi Danmark
   * flytter sig med. Det er grunden til at kolonnen findes — uden den ville
   * artiklen læse "de skifter ikke", hvilket er en anden påstand.
   */
  skifterSelv: boolean;
}

function tekst(
  timer: number,
  time: string,
  timerFlertal: string
): string {
  if (timer === 0) {
    return "Samme tid";
  }
  const enhed = Math.abs(timer) === 1 ? time : timerFlertal;
  return `${tal(Math.abs(timer))} ${enhed} ${timer > 0 ? "frem" : "bagud"}`;
}

/**
 * Verdens-tabellen, regnet fra `TIDSZONER`.
 *
 * Kun dansk: bloggen er dansk-only (`danishOnlySections` i `routing.ts`),
 * så der er ingen svensk arm. Det er målt — `beraknare.se` svarer **404** på
 * slug'en — og derfor er sproglåsen i testen en egenskab, ikke en tilstand.
 */
export function blogVerdensRaekker(): BlogVerdensRaekke[] {
  return VERDENS_REKKEFOLGE.map((by) => {
    const zone = zoneFor(by);
    const vinter = forskel(zone, false);
    const sommer = forskel(zone, true);
    const fast = sommer === vinter;
    return {
      by,
      vinter,
      sommer: fast ? undefined : sommer,
      tekstVinter: tekst(vinter, "time", "timer"),
      tekstSommer: fast ? undefined : tekst(sommer, "time", "timer"),
      kl14: klokkeslaetVed(14, zone, false),
      skifterSelv: brugerSommertid(zone),
    };
  });
}

/**
 * Antallet af byer i verdens-tabellen — det tal blogindlæggets titel,
 * `<h1>` og `blog-kobling.ts` skriver.
 *
 * Læst fra `TIDSZONER`, ikke fra `VERDENS_REKKEFOLGE`, fordi det er *TIDSZONER*
 * der er sandheden om hvor mange byer sitet kender. Rækkelisten er læst ovenfor
 * og låst af `tidszone-blog-lander.test.ts` til at dække den *præcist* — så de
 * to tal kan ikke glide fra hinanden, men det er data der siger det.
 */
export const blogVerdensAntal = TIDSZONER.length;
