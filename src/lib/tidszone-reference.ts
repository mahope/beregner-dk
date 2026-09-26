/**
 * Faste tidszoner til det synlige svar på "/tidszone".
 *
 * Offsettene er UTC-forskelle i timer. Kilder:
 * - Danmark/Sverige: CET = UTC+1, CEST = UTC+2 (sidste søndag i marts til
 *   sidste søndag i oktober).
 * - USA/Canada/Europa/Australien: standardvinter- og sommertidszoner fra
 *   IANA-tidszonebasen (UTC-offset uden DST).
 * - Sao Paulo har haft fast UTC-3 siden 2019 og bruger ikke sommertid.
 * - Grønland skiftede i marts 2023 fra UTC-4 til UTC-3 som standardtid
 *   (WGT) og har fortsat sommertid (WGST = UTC-2), jf. IANA
 *   America/Nuuk.
 * - Island har hele året UTC+0 og bruger ikke sommertid (Atlantic/Reykjavik).
 * - Lissabon er WET (UTC+0) og WEST (UTC+1); Athen og Kreta er EET (UTC+2)
 *   og EEST (UTC+3), jf. IANA Europe/Lisbon og Europe/Athens.
 *
 * Værdierne bruges kun til at vise "hvad er klokken, når det er 12 i
 * Danmark/Sverige". Den præcise konvertering bruger TidszoneBeregneren.
 */

/** Sprog, bynavne vises på. */
export type TidszoneSprog = "da" | "se";

export interface TidszoneInfo {
  /** Visning af byen på dansk. */
  by: string;
  /** Visning af byen på svensk, når den afviger fra dansk (Athen = Aten). */
  bySe?: string;
  /** UTC-forskel i vintertid, i timer. Kan være et brudtal (f.eks. 5,5). */
  utcVinter: number;
  /** UTC-forskel i somertid. Udelades for zoner uden sommertid. */
  utcSommer?: number;
}

export const TIDSZONER: readonly TidszoneInfo[] = [
  { by: "London", utcVinter: 0, utcSommer: 1 },
  { by: "Lissabon", utcVinter: 0, utcSommer: 1 },
  { by: "Reykjavik", utcVinter: 0 },
  { by: "Nuuk", utcVinter: -3, utcSommer: -2 },
  { by: "Athen", bySe: "Aten", utcVinter: 2, utcSommer: 3 },
  { by: "Heraklion (Kreta)", utcVinter: 2, utcSommer: 3 },
  { by: "New York", utcVinter: -5, utcSommer: -4 },
  { by: "Chicago", utcVinter: -6, utcSommer: -5 },
  { by: "Los Angeles", utcVinter: -8, utcSommer: -7 },
  { by: "Sao Paulo", utcVinter: -3 },
  { by: "Dubai", utcVinter: 4 },
  { by: "Mumbai", utcVinter: 5.5 },
  { by: "Shanghai", utcVinter: 8 },
  { by: "Tokyo", utcVinter: 9 },
  { by: "Sydney", utcVinter: 10, utcSommer: 11 },
  { by: "Auckland", utcVinter: 12, utcSommer: 13 },
];

/** Danmark og Sverige: CET = UTC+1 om vinteren, CEST = UTC+2 om sommeren. */
export const DANSK_UTC_VINTER = 1;
export const DANSK_UTC_SOMMER = 2;

function formaterKlokkeslaet(timer: number): string {
  const totalMinutter = ((Math.round(timer * 60) % 1440) + 1440) % 1440;
  const timerDel = Math.floor(totalMinutter / 60);
  const minutterDel = totalMinutter % 60;
  return `${String(timerDel).padStart(2, "0")}:${String(minutterDel).padStart(2, "0")}`;
}

export interface TidszoneRække {
  by: string;
  vinter: string;
  sommer: string;
}

/** Om byen selv bruger sommertid. */
export function brugerSommertid(zone: TidszoneInfo): boolean {
  return zone.utcSommer !== undefined && zone.utcSommer !== zone.utcVinter;
}

/**
 * Klokkeslæt i byen, når det er 12 i Danmark/Sverige.
 * Vinter = dansk vintertid (12:00 CET), sommer = dansk somertid (12:00 CEST).
 *
 * Byer, der skifter sommertid sammen med Danmark, viser samme klokkeslæt i
 * begge kolonner. Byer uden sommertid (fx Tokyo, Dubai, Sao Paulo) ligger en
 * time tidligere, når Danmark har somertid.
 */
export function tidszoneRækker(
  zoner: readonly TidszoneInfo[] = TIDSZONER,
  spoergsprog: TidszoneSprog = "da"
): TidszoneRække[] {
  return zoner.map((zone) => ({
    by: spoergsprog === "se" ? (zone.bySe ?? zone.by) : zone.by,
    vinter: formaterKlokkeslaet(12 - DANSK_UTC_VINTER + zone.utcVinter),
    sommer: formaterKlokkeslaet(
      12 - DANSK_UTC_SOMMER + (zone.utcSommer ?? zone.utcVinter)
    ),
  }));
}
