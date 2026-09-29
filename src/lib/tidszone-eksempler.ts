/**
 * De tidsskillnads-spørgsmål, autocomplete danner om "/tidszone", som
 * TIDSZONER-tabellen ikke besvarer alene: forskel til et *land* (ikke en by)
 * i både vinter- og sommertid, og hvordan man regner den i Excel.
 *
 * Alt er udregnet fra TIDSZONER, så tabellen ikke kan modsige den tidszone-
 * beregneren og dens egen tabel (samme krav som C84's metaDescription-fund
 * og C94's literPr100km-kobling).
 */

import {
  brugerSommertid,
  DANSK_UTC_SOMMER,
  DANSK_UTC_VINTER,
  TIDSZONER,
  type TidszoneInfo,
} from "./tidszone-reference";

/**
 * De lande, svensk og dansk autocomplete spørger om: "tidsskillnad
 * sverige japan/usa/thailand/spanien/grekland/australien" (SE) og
 * "tidsforskel grønland/japan/thailand/tyrkiet/grekland/usa" (DA). Byen er
 * den, TIDSZONER bruger for landet, så forskellen er den samme regel som
 * bytabellen.
 *
 * Grønland står her, fordi dansk autocomplete har det øverst i begge
 * klynger ("tidsforskel grønland" er nr. 1, "tidszoner grønland" nr. 13), og
 * fordi Nuuk allerede lå i TIDSZONER — altså en kendt zone, der bare var
 * udeladt fra landetabellen. Forskjellen er 4 timer bagud hele året, fordi
 * America/Nuuk skiftede til EU's skifte datoer i 2023 (WGT/WGST), så zone og
 * Danmark flytter sig samtidig.
 *
 * Canada er bevidst *ikke* opført, selv om "tidszoner canada" ligger i
 * autocomplete. Toronto skifter sommertid på nordamerikanske datoer, ikke
 * EU's, så forskellen er 6 timer bagud det meste af året men 5 i de to
 * uger omkring forårsskiftet og den ene uge omkring efterårsskiftet. En
 * konstant værdi ville være forkert i de uger, og `brugerSommertid` kan ikke
 * se forskellen. Rusland og Europa mangler tilsvarende: Moskva ligger ikke i
 * TIDSZONER, så en offset ville være gættet.
 */
export interface TidsskillnadEksempel {
  /** Slag i TIDSZONER, forskellen beregnes fra. */
  by: string;
  /** Landet på dansk. */
  landDa: string;
  /** Landet på svensk, når det afviger fra dansk. */
  landSe?: string;
  /**
   * Om landet skifter sommertid på **EU's datoer** (sidste søndag i marts til
   * sidste søndag i oktober), så zone og Danmark flytter sig præcis samtidig.
   *
   * Det er *ikke* det samme som at bruge sommertid: USA, Canada,
   * Australien og New Zealand har egen sommertid, men på andre datoer. For
   * dem er forskellen den samme det meste af året og en time mindre i de to
   * uger omkring forårsskiftet og den ene uge omkring efterårsskiftet — præcis
   * den overgangsperiode, siden selv advarer om. Derfor må denne markering
   * ikke udledes af `brugerSommertid`.
   */
  foelgerEu?: boolean;
}

export const TIDSSKILLNADS_LANDE: readonly TidsskillnadEksempel[] = [
  // foelgerEu: kun lande, der skifter på sidste søndag i marts / oktober.
  // Storbritannien og Grækenland og Spanien og Grønland gør det; USA,
  // Canada, Australien og New Zealand har egen sommertid på andre datoer.
  { by: "London", landDa: "Storbritannien", foelgerEu: true },
  { by: "New York", landDa: "USA" },
  { by: "Nuuk", landDa: "Grønland", landSe: "Grönland", foelgerEu: true },
  { by: "Athen", landDa: "Grækenland", landSe: "Grekland", foelgerEu: true },
  { by: "Istanbul", landDa: "Tyrkiet", landSe: "Turkiet" },
  { by: "Madrid", landDa: "Spanien", foelgerEu: true },
  { by: "Bangkok", landDa: "Thailand" },
  { by: "Tokyo", landDa: "Japan" },
  { by: "Shanghai", landDa: "Kina" },
  { by: "Sydney", landDa: "Australien" },
  { by: "Auckland", landDa: "New Zealand" },
];

export interface TidsskillnadRaekke {
  /** Landet, lokaliseret. */
  land: string;
  /** Byen i TIDSZONER, forskellen kommer fra. */
  by: string;
  /** Forskel i vintertid i hele timer, negativt = byen er bagud. */
  vinter: number;
  /** Forskel i somertid. Kun angivet når den afviger fra vinterforskellen. */
  sommer?: number;
  /** "3 timer frem" / "3 timmar framåt". */
  tekstVinter: string;
  /** Samme for sommer, når den afviger. */
  tekstSommer?: string;
}

function zoneFor(by: string): TidszoneInfo {
  const zone = TIDSZONER.find((z) => z.by === by);
  if (!zone) {
    throw new Error(`Ukendt by i TIDSSKILLNADS_LANDE: ${by}`);
  }
  return zone;
}

/** Heltalsformat med dansk komma, så 7,5 og 8,5 kan læses. */
function tal(timer: number): string {
  return String(timer).replace(".", ",");
}

function forskel(zone: TidszoneInfo, danskOffset: number): number {
  return zone.utcVinter - danskOffset;
}

function tekst(
  timer: number,
  frem: string,
  bagud: string,
  time: string,
  timmar: string,
  samme: string
): string {
  if (timer === 0) {
    return samme;
  }
  const magnitude = Math.abs(timer);
  const enhet = magnitude === 1 ? time : timmar;
  return `${tal(magnitude)} ${enhet} ${timer > 0 ? frem : bagud}`;
}

/**
 * Forskellen til hvert land i både dansk vinter- og sommertid, udregnet fra
 * TIDSZONER.
 *
 * `sommer` udelades for byer, der selv bruger sommertid: de skifter UTC-offset
 * samtidig med Danmark, så *forskjellen* er den samme hele året, selv om
 * begge tal flytter sig (London er 1 time bagud om vinteren og 2 timer
 * bagud om sommeren, fordi Danmark flytter sig med).
 */
export function tidsskillnadRaekker(
  spoergsprog: "da" | "se" = "da"
): TidsskillnadRaekke[] {
  const frem = spoergsprog === "se" ? "framåt" : "frem";
  const bagud = spoergsprog === "se" ? "bakåt" : "bagefter";
  const time = spoergsprog === "se" ? "timme" : "time";
  const timmar = spoergsprog === "se" ? "timmar" : "timer";
  const samme =
    spoergsprog === "se" ? "samma tid som Sverige" : "samme tid som Danmark";

  return TIDSSKILLNADS_LANDE.map((land) => {
    const zone = zoneFor(land.by);
    const vinter = forskel(zone, DANSK_UTC_VINTER);
    const sommerForskel = forskel(zone, DANSK_UTC_SOMMER);
    const skifterSelv = brugerSommertid(zone);
    return {
      land: spoergsprog === "se" ? (land.landSe ?? land.landDa) : land.landDa,
      by: land.by,
      vinter,
      sommer: skifterSelv ? undefined : sommerForskel,
      tekstVinter: tekst(vinter, frem, bagud, time, timmar, samme),
      tekstSommer: skifterSelv
        ? undefined
        : tekst(sommerForskel, frem, bagud, time, timmar, samme),
    };
  });
}

/**
 * Byer der skifter sommertid selv — forskellen til Danmark/Sverige er den
 * samme hele året. Regreslåst mod `brugerSommertid`, altså mod den samme
 * definition TidszoneBeregnerens egen tabel bruger.
 */
export function skifterSammenMedDanmark(by: string): boolean {
  return tidsskillnadRaekker().find((r) => r.by === by)?.sommer === undefined;
}

export interface ExcelEksempel {
  /** Formlen, som den skrives. Syntaksen er den samme i begge sprog. */
  formel: string;
  /** Hvad den gør, på dansk. */
  hvadDa: string;
  /** Hvad den gør, på svensk. */
  hvadSe: string;
}

/**
 * Excel-formlerne for tidsforskel. Forklaringerne er oversat i begge sprog,
 * fordi `localeObjectRanges` ikke ser en streng, der bor i et `svDa`-objekt —
 * C73's R4 (en `se`-værdi må ikke indeholde æ eller ø).
 */
export function excelEksempler(): ExcelEksempel[] {
  return [
    {
      formel: "=B1-A1",
      hvadDa:
        "giver tidsforskellen i timer, når begge celler er klokkeslæt (kræver at cellerne er formateret som Tid)",
      hvadSe:
        "ger tidsskillnaden i timmar, när båda cellerna är klockslag (kräver att cellerna är formaterade som Tid)",
    },
    {
      formel: "=(B1-A1)*24",
      hvadDa:
        "giver tidsforskellen i hele timer, også når cellen står som 0,2500 i stedet for 06:00",
      hvadSe:
        "ger tidsskillnaden i hela timmar, också när cellen står som 0,2500 i stället för 06:00",
    },
    {
      formel: "=DATEDIF(A1;B1;\"h\")",
      hvadDa:
        "giver det samme svar uden at cellerne skal formateres som Tid, fordi DATEDIF tæller hele timer",
      hvadSe:
        "ger samma svar utan att cellerna behöver formateras som Tid, eftersom DATEDIF räknar hela timmar",
    },
    {
      formel: "=B1-A1+(B1<A1)",
      hvadDa:
        "lægger 24 timer til, når måletidspunktet er tidligere på døgnet end starttidspunktet, så et skifte over midnat ikke giver et negativt svar",
      hvadSe:
        "lägger till 24 timmar när måltidspunkten är tidigare på dygnet än starttidspunkten, så ett skifte över midnatt inte ger ett negativt svar",
    },
  ];
}
