import { utcOffsetMinutter, type DstRegel } from "./sommertid";

/**
 * Faste tidszoner til det synlige svar på "/tidszone".
 *
 * Offsettene er UTC-forskelle i timer. Kilder:
 * - Danmark/Sverige: CET = UTC+1, CEST = UTC+2 (sidste søndag i marts til
 *   sidste søndag i oktober).
 * - USA/Canada/Europa/Australien: standardvinter- og sommertidszoner fra
 *   IANA-tidszonebasen (UTC-offset uden DST).
 * - São Paulo har haft fast UTC-3 siden 2019 og bruger ikke sommertid.
 * - Grønland skiftede i marts 2023 fra UTC-4 til UTC-3 som standardtid
 *   (WGT) og har fortsat sommertid (WGST = UTC-2), jf. IANA
 *   America/Nuuk.
 * - Island har hele året UTC+0 og bruger ikke sommertid (Atlantic/Reykjavik).
 * - Lissabon er WET (UTC+0) og WEST (UTC+1); Athen og Kreta er EET (UTC+2)
 *   og EEST (UTC+3), jf. IANA Europe/Lisbon og Europe/Athens.
 * - Madrid følger Danmark (CET/CEST), mens Istanbul er fast UTC+3 hele året,
 *   fordi Tyrkiet afskaffede sommertid i 2016, jf. IANA Europe/Istanbul.
 * - Toronto er UTC-5/-4 ligesom New York, mens Bangkok er fast UTC+7 og
 *   Denpasar (Bali) fast UTC+8, jf. IANA America/Toronto, Asia/Bangkok og
 *   Asia/Makassar.
 * - Denver er Mountain Time (UTC-7/-6), den fjerde amerikanske zone der
 *   manglede, og Phoenix er UTC-7 hele året fordi Arizona helt ud undtaget
 *   fra DST i 1967, jf. IANA America/Denver og America/Phoenix. Phoenix er den
 *   eneste amerikanske by i tabellen uden sommertid, saa dens to kolonner
 *   adskiller sig om sommeren — det er grunden til at stat-tabellen har både
 *   en vinter- og en sommerspalte.
 * - Miami og Boston ligger i Eastern Time ligesom New York (UTC-5/-4), jf.
 *   IANA America/New_York; de er her fordi autocomplete spørger om dem
 *   ("klokken i usa miami" nr. 6 DA, "… boston usa nu" nr. 4).
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
  /**
   * Hvilke datoer zonen selv skifter på. Samme regel som
   * `TidszoneBeregner.tsx` bruger for byen, så et interval der regnes på den
   * ene tabel også gælder på den anden. Udelades for zoner uden sommertid.
   *
   * Feltet er skrevet ud i hver række i stedet for at blive udledt af
   * bynavnet: en gætning på "London skifter som Danmark" gav i en
   * mellemtidsudgave af `tidsforskelsRækker` en forskel på 0 timer, fordi
   * byen blev regnet på USA's skiftedatoer. Rækkerne skal kunne læses, så
   * reglen står der hvor byen står.
   */
  dst?: Exclude<DstRegel, "ingen">;
}

export const TIDSZONER: readonly TidszoneInfo[] = [
  { by: "London", utcVinter: 0, utcSommer: 1, dst: "eu" },
  { by: "Lissabon", utcVinter: 0, utcSommer: 1, dst: "eu" },
  { by: "Reykjavik", utcVinter: 0 },
  { by: "Nuuk", utcVinter: -3, utcSommer: -2, dst: "eu" },
  { by: "Athen", bySe: "Aten", utcVinter: 2, utcSommer: 3, dst: "eu" },
  { by: "Heraklion (Kreta)", utcVinter: 2, utcSommer: 3, dst: "eu" },
  { by: "New York", utcVinter: -5, utcSommer: -4, dst: "us" },
  { by: "Miami", utcVinter: -5, utcSommer: -4, dst: "us" },
  { by: "Boston", utcVinter: -5, utcSommer: -4, dst: "us" },
  { by: "Toronto", utcVinter: -5, utcSommer: -4, dst: "us" },
  { by: "Chicago", utcVinter: -6, utcSommer: -5, dst: "us" },
  { by: "Denver", utcVinter: -7, utcSommer: -6, dst: "us" },
  { by: "Phoenix", utcVinter: -7 },
  { by: "Los Angeles", utcVinter: -8, utcSommer: -7, dst: "us" },
  { by: "São Paulo", utcVinter: -3 },
  { by: "Madrid", utcVinter: 1, utcSommer: 2, dst: "eu" },
  { by: "Istanbul", utcVinter: 3 },
  { by: "Dubai", utcVinter: 4 },
  { by: "Mumbai", utcVinter: 5.5 },
  { by: "Bangkok", utcVinter: 7 },
  { by: "Denpasar (Bali)", utcVinter: 8 },
  { by: "Shanghai", utcVinter: 8 },
  { by: "Tokyo", utcVinter: 9 },
  { by: "Sydney", utcVinter: 10, utcSommer: 11, dst: "au" },
  { by: "Auckland", utcVinter: 12, utcSommer: 13, dst: "au" },
];

/** Danmark og Sverige: CET = UTC+1 om vinteren, CEST = UTC+2 om sommeren. */
export const DANSK_UTC_VINTER = 1;
export const DANSK_UTC_SOMMER = 2;

export function formaterKlokkeslaet(timer: number): string {
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
 * Den tidsforskel, byen ligger i forhold til Danmark/Sverige, fundet ved at
 * gennemgå **hver eneste dag i et helt år** og tage den mindste og største
 * forskel. Det er nødvendigt, fordi byer der skifter på andre datoer end
 * Danmark har et *interval* og ikke et fast tal: Sydney er UTC+10/+11 mod
 * Danmarks UTC+1/+2, så forskellen er 9 timer når begge står på vintertid,
 * 10 når kun Sydney har skiftet, 8 når kun Danmark har skiftet, og 9 igen
 * når begge har det — altså 8-10.
 *
 * Datoerne for hvert zones skift læses fra `erSommertid` med byens egen regel,
 * så intervallet er målt på den virkelige kalender og ikke gættet ud fra
 * kombinationer. En by, der skifter samtidig med Danmark, har præcis én
 * forskel hele året (New York: 6 timer bagud), fordi begge sider flytter sig
 * sammen.
 *
 * Før denne funktion skrev `/tidszone`s brødtekst "9-10 timer foran" for
 * Sydney, hvilket er de to midterste kombinationer frem for det interval,
 * kalenderen faktisk har. Tallene var håndskrevet i stedet for regnet, så de
 * kunde glide fra `TIDSZONER` — samme fejlklasse som C84's `metaDescription`
 * og den danske byliste i `/tidszone`. Nu er de læst fra tabellen.
 */
export interface Tidsforskel {
  by: string;
  /** Byens visning i det valgte sprog. */
  bySe?: string;
  /** Den mindste forskel i hele året, i timer. Negativ = byen ligger bagud. */
  mindst: number;
  /** Den største forskel i hele året, i timer. */
  mest: number;
  /** Sand hvis forskellen er den samme hele år, så kilden kun har ét tal. */
  fast: boolean;
}

/**
 * Byens DST-regel, læst fra rækken. Uden `dst` har byen ingen sommertid, så
 * `erSommertid` aldrig skal spørges om den.
 */
function regelForBy(zone: TidszoneInfo): DstRegel {
  return zone.dst ?? "ingen";
}

/**
 * Tidsforskellen for de byer, `/tidszone`s brødtekst lister. Uddaget af
 * `TIDSZONER` efter bynavn, så listen og tabellen ikke kan glide fra
 * hinanden, og kastet hvis en by mangler — en by der forsvinder fra
 * `TIDSZONER` skal give en fejl, ikke en stribe med ét færre punkt.
 *
 * `aar` er det år der måles i. Standarden er 2026, fordi det er det år
 * sommertidsdatoerne i `sommertid.ts` er verificeret imod.
 */
export function tidsforskelsRækker(
  bynavne: readonly string[],
  spoergsprog: TidszoneSprog = "da",
  aar = 2026
): Tidsforskel[] {
  return bynavne.map((navn) => {
    const zone = TIDSZONER.find((z) => z.by === navn || z.bySe === navn);
    if (!zone) throw new Error(`Ukendt by i tidsforskelslisten: ${navn}`);
    const regel = regelForBy(zone);
    let mindst = Number.POSITIVE_INFINITY;
    let mest = Number.NEGATIVE_INFINITY;
    for (let dag = 0; dag < 366; dag++) {
      const dato = new Date(aar, 0, 1 + dag);
      const byOffset = utcOffsetMinutter(
        zone.utcVinter * 60,
        zone.utcSommer === undefined ? undefined : zone.utcSommer * 60,
        regel,
        dato
      );
      const danskOffset = utcOffsetMinutter(
        DANSK_UTC_VINTER * 60,
        DANSK_UTC_SOMMER * 60,
        "eu",
        dato
      );
      const forskel = (byOffset - danskOffset) / 60;
      if (forskel < mindst) mindst = forskel;
      if (forskel > mest) mest = forskel;
    }
    return {
      by: navn,
      bySe: zone.bySe,
      mindst,
      mest,
      fast: mindst === mest,
    };
  });
}

/**
 * Klokkeslæt i byen, når det er 12 i Danmark/Sverige.
 * Vinter = dansk vintertid (12:00 CET), sommer = dansk somertid (12:00 CEST).
 *
 * Byer, der skifter sommertid sammen med Danmark, viser samme klokkeslæt i
 * begge kolonner. Byer uden sommertid (fx Tokyo, Dubai, São Paulo) ligger en
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

/**
 * Klokkeslaet i byen, naar det er et vilkaarligt klokkeslaet i Danmark/Sverige.
 *
 * Samme regel som `tidszoneRaekker`, men med timeargumentet i stedet for den
 * faste 12. Det er den, der gør tabellen kunne svare paa "hvad er klokken i
 * usa **naar den er 21** i danmark" - den stoerste ubesvarede del af sidens
 * egen soegeklynge, fordi kl. 12-tabellen kun svarer paa eet af timepunkterne.
 *
 * `danskSommerstid` styrer hvilken dansk offset der bruges, saa samme kald
 * giver vinter- og sommer-tallet uden to formler.
 */
export function klokkeslaetVed(
  danskTime: number,
  zone: TidszoneInfo,
  danskSommerstid: boolean
): string {
  const danskUtc = danskSommerstid ? DANSK_UTC_SOMMER : DANSK_UTC_VINTER;
  const zoneUtc = danskSommerstid ? (zone.utcSommer ?? zone.utcVinter) : zone.utcVinter;
  return formaterKlokkeslaet(danskTime - danskUtc + zoneUtc);
}

/** Timer formateret med decimalkomma, så 5,5 ikke skriver "5.5". */
function formaterTimer(timer: number, spoergsprog: TidszoneSprog): string {
  const medKomma = String(Math.abs(timer)).replace(".", ",");
  const enhed = Math.abs(timer) === 1
    ? spoergsprog === "da" ? "time" : "timme"
    : spoergsprog === "da" ? "timer" : "timmar";
  return `${medKomma} ${enhed}`;
}

/** Tidsforskellens absolutte værdi, så "5 timer bagud" ikke skriver "-5". */
function raekkeAbs(forskel: number): number {
  return Math.abs(forskel);
}

/** "foran"/"före" når byen ligger foran Danmark, ellers "bagud"/"efter". */
function retning(raekke: Tidsforskel, spoergsprog: TidszoneSprog): string {
  if (raekke.mest < 0) return spoergsprog === "da" ? "bagud" : "efter";
  return spoergsprog === "da" ? "foran" : "före";
}

/** Byen i det valgte sprog, så `<strong>` kun rammer navnet. */
export function tidsforskelBy(raekke: Tidsforskel, spoergsprog: TidszoneSprog): string {
  return spoergsprog === "se" ? (raekke.bySe ?? raekke.by) : raekke.by;
}

/**
 * Tidsforskellen som brødtekst: "1 time bagud" for en by med fast forskel,
 * "8-10 timer foran" for en by, der skifter på andre datoer end Danmark.
 * Byen er skrevet ud, fordi siden sætter den i `<strong>` — se
 * `tidsforskelBy`.
 *
 * En by, der skifter på **samme datoer** som Danmark, har én fast forskel
 * hele året — London er 1 time bagud hele året. En by, der skifter på
 * **andre datoer**, får et interval, fordi der er dage, hvor kun den ene side
 * har skiftet: New York går fra 6 timer bagud til 5 i de få uger, hvor USA
 * har skiftet mens Danmark end ikke har det (2. søndag i marts mod sidste
 * søndag i marts). Sydney ligger mellem 8 og 10, fordi dens somertid løber
 * modsat Danmarks.
 */
export function tidsforskelTekst(raekke: Tidsforskel, spoergsprog: TidszoneSprog): string {
  if (raekke.fast) {
    if (raekke.mindst === 0) {
      // Madrid følger Danmarks CET/CEST nøjagtigt, så forskellen er 0 hele
      // året. "0 timer foran" er ikke en tid en læser kan bruge.
      return spoergsprog === "da" ? "samme tid som Danmark" : "samma tid som Sverige";
    }
    return `${formaterTimer(raekkeAbs(raekke.mindst), spoergsprog)} ${retning(raekke, spoergsprog)}`;
  }
  // Intervallet skrives **stigende** i absolut værdi. New York ligger mellem
  // 5 og 6 timer bagud, og `mindst` er -6, så en ligetegning på `mindst` først
  // gav "6-5 timer bagud" — et interval læst baglæns.
  const [lav, hoej] = [raekkeAbs(raekke.mindst), raekkeAbs(raekke.mest)].sort(
    (a, b) => a - b
  );
  const raekkeTekst = `${lav}-${hoej}`.replace(".", ",");
  // Et interval rummer to tal, så det hedder altid timer/timmar — også når
  // bredden er 1, som i "5-6 timer". En tidligere udgave valgte enheden efter
  // bredden og skrev "5-6 time bagud".
  const enhed = spoergsprog === "da" ? "timer" : "timmar";
  return `${raekkeTekst} ${enhed} ${retning(raekke, spoergsprog)}`;
}
