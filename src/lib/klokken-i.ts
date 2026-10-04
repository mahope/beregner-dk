import type { Locale } from "./i18n";

/**
 * «Hvad er klokken i …?» — én side pr. land, med svaret i brødteksten.
 *
 * Datagrunden er autocomplete, målt 2/10 04:05 på
 * `suggestqueries.google.com?hl=da&gl=dk&q=hvad+er+klokken+i`: **10 af 10**
 * danske completioner er et land eller en by — usa, danmark, thailand, new
 * york, australien, japan, tyrkiet, canada, usa nu, kina. Det er den
 * cleaneste søgeintention på hele sitet: spørgsmålet er altid det samme, og
 * svaret er ét tal.
 *
 * Der er **ingen** `/klokken-i/danmark` og ingen `/klokken-i/sverige`. En
 * dansk læser der spørger «hvad er klokken i danmark» søger ikke et svar, de
 * kan se på deres egen telefon, og en sådan side er ren tynd SEO-fyld. Begge
 * egne lande er allerede dækket af `/tidszone`-konverteren. Samme grund
 * udelader `new-york` fra listen: byen står som en række på USA-siden, så en
 * egen side for den ville være den samme side igen.
 *
 * **Norge og Tyskland kom derimod med 4/10 05:1x**, målt på samme måde:
 * «hvad er klokken i norge» har completionerne «hvad er klokken i norge» og
 * «hvad er klokken i norge lige nu», «hvad er klokken i tyskland» har
 * «hvad er klokken i tyskland» og «hvad er klokken i tyskland lige nu». De er
 * Danmarks nærmeste naboer og de eneste af de ti lande på listen vi manglede,
 * og de er **ikke** dækket af undtagelsen ovenfor, fordi det ikke er læserens
 * eget land: en dansk læser kan ikke se svaret på sin egen telefon.
 *
 * **Ingen håndskrevet tidsforskel.** `tidsforskelMinutter` læser begge sider
 * af samme øjeblik med `Intl.DateTimeFormat`, så forskellen følger den
 * virkelige kalender — også i de få uger omkring et skift, hvor Danmark og
 * New York ikke skifter samtidig, og hvor et fast tal i brødteksten er
 * forkeret. Samme grund gør tidszonenavnene til IANA-navne: de er data fra
 * `tzdb`, ikke en tabel vedligeholdt i hånden.
 */

/** Sprog, svarene og slugs skrives på. */
export type KlokkenSprog = "da" | "se";

/**
 * Ét navneområde i et land. Byen er med fordi «hvad er klokken i usa»
 * ikke har ét svar: USA har fire tidszoner, og en side der svarer 06:35 og
 * lader det være, ville være halv forkert for de to tredjedele der ikke bor
 * i New York. Den første by er **hovedbyen** og giver sideens svar i `<h2>`.
 */
export interface KlokkenBy {
  /** Byens navn på dansk. */
  da: string;
  /** Byens navn på svensk, når det afviger fra dansk. */
  se?: string;
  /** IANA-tidszonenavn, fx `America/New_York`. */
  zone: string;
}

export interface KlokkenLand {
  slugDa: string;
  slugSe: string;
  /** Landet skrevet med stort begyndelsesbogstav, som dansker skriver det. */
  navnDa: string;
  navnSe: string;
  /** Byerne i landet. Den første er den sideen svarer på. */
  byer: readonly KlokkenBy[];
}

export const KLOKKEN_LANDE: readonly KlokkenLand[] = [
  {
    slugDa: "usa",
    slugSe: "usa",
    navnDa: "USA",
    navnSe: "USA",
    byer: [
      { da: "New York", zone: "America/New_York" },
      { da: "Chicago", zone: "America/Chicago" },
      { da: "Denver", zone: "America/Denver" },
      { da: "Los Angeles", zone: "America/Los_Angeles" },
    ],
  },
  {
    slugDa: "thailand",
    slugSe: "thailand",
    navnDa: "Thailand",
    navnSe: "Thailand",
    byer: [{ da: "Bangkok", zone: "Asia/Bangkok" }],
  },
  {
    slugDa: "australien",
    slugSe: "australien",
    navnDa: "Australien",
    navnSe: "Australien",
    byer: [{ da: "Sydney", zone: "Australia/Sydney" }],
  },
  {
    slugDa: "japan",
    slugSe: "japan",
    navnDa: "Japan",
    navnSe: "Japan",
    byer: [{ da: "Tokyo", zone: "Asia/Tokyo" }],
  },
  {
    slugDa: "tyrkiet",
    slugSe: "turkiet",
    navnDa: "Tyrkiet",
    navnSe: "Türkiet",
    byer: [{ da: "Istanbul", zone: "Europe/Istanbul" }],
  },
  {
    slugDa: "canada",
    slugSe: "kanada",
    navnDa: "Canada",
    navnSe: "Kanada",
    byer: [{ da: "Toronto", zone: "America/Toronto" }],
  },
  {
    slugDa: "kina",
    slugSe: "kina",
    navnDa: "Kina",
    navnSe: "Kina",
    byer: [{ da: "Shanghai", zone: "Asia/Shanghai" }],
  },
  {
    slugDa: "indien",
    slugSe: "indien",
    navnDa: "Indien",
    navnSe: "Indien",
    byer: [{ da: "Mumbai", zone: "Asia/Kolkata" }],
  },
  {
    slugDa: "england",
    slugSe: "england",
    navnDa: "England",
    navnSe: "England",
    byer: [{ da: "London", zone: "Europe/London" }],
  },
  {
    slugDa: "spanien",
    slugSe: "spanien",
    navnDa: "Spanien",
    navnSe: "Spanien",
    byer: [{ da: "Madrid", zone: "Europe/Madrid" }],
  },
  {
    slugDa: "brasilien",
    slugSe: "brasilien",
    navnDa: "Brasilien",
    navnSe: "Brasilien",
    byer: [{ da: "São Paulo", zone: "America/Sao_Paulo" }],
  },
  {
    slugDa: "portugal",
    slugSe: "portugal",
    navnDa: "Portugal",
    navnSe: "Portugal",
    byer: [{ da: "Lissabon", zone: "Europe/Lisbon" }],
  },
  {
    slugDa: "norge",
    slugSe: "norge",
    navnDa: "Norge",
    navnSe: "Norge",
    byer: [{ da: "Oslo", zone: "Europe/Oslo" }],
  },
  {
    slugDa: "tyskland",
    slugSe: "tyskland",
    navnDa: "Tyskland",
    navnSe: "Tyskland",
    byer: [{ da: "Berlin", zone: "Europe/Berlin" }],
  },
];

/** Sidens egen tidszone. Danmark og Sverige ligger samme sted. */
const SIDENS_ZONE = "Europe/Copenhagen";

/** De kalenderdele `Intl` læser for én tidszone. */
interface Zonedele {
  /** Minutter siden midnat i zonen. */
  minutter: number;
  /** Kalenderdagen som "YYYY-MM-DD", så datoer kan sammenlignes uden tidszone. */
  iso: string;
  ugedag: number;
}

function deleITidszone(tidspunkt: Date, zone: string): Zonedele {
  const formater = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    hourCycle: "h23",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const dele: Record<string, string> = {};
  for (const del of formater.formatToParts(tidspunkt)) {
    if (del.type !== "literal") dele[del.type] = del.value;
  }
  const ugedage: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const { year, month, day, hour, minute } = dele;
  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`Kunne ikke læse kalenderdatoen i ${zone}`);
  }
  return {
    minutter: Number(hour) * 60 + Number(minute),
    iso: `${year}-${month}-${day}`,
    ugedag: ugedage[dele.weekday ?? "Sun"] ?? 0,
  };
}

/**
 * Tidsforskellen i minutter mellem to zoner, målt på **samme øjeblik**.
 *
 * Positivt tal betyder at zonen er foran Danmark. Forskellen er fundet ved
 * at læse klokkeslættet i begge zoner og trække sammen, og derefter korrigere
 * med et helt døgn hvis kalenderdagene afviger. Uden den korrektion ville en
 * by der ligger *foran* få et negativt tal i de timer efter midnat, hvor
 * dens egen dag er stærkere end Danmarks — Tokyo kl. 01:00 er 16 timer
 * foran Danmark, ikke -8.
 */
export function tidsforskelMinutter(tidspunkt: Date, zone: string): number {
  const her = deleITidszone(tidspunkt, SIDENS_ZONE);
  const der = deleITidszone(tidspunkt, zone);
  const dageForskel =
    (Date.parse(`${der.iso}T00:00:00Z`) - Date.parse(`${her.iso}T00:00:00Z`)) /
    86_400_000;
  return der.minutter - her.minutter + dageForskel * 1440;
}

/** Ét lands svar på det samme øjeblik. */
export interface KlokkenSvar {
  by: string;
  zone: string;
  /** «HH:MM» i byens egen tid. */
  tid: string;
  /** «torsdag 2. oktober 2026» i byens egen tid. */
  dato: string;
  /** «6 timer bagud» / «5 timer og 45 minutter foran». */
  forskel: string;
  /** Sandt når byen har en anden kalenderdag end Danmark lige nu. */
  andenDag: string | null;
  /** Byens tid er mellem kl. 23 og kl. 7. */
  erNatte: boolean;
}

const MAANEDER_DA = [
  "januar",
  "februar",
  "marts",
  "april",
  "maj",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "december",
];
const MAANEDER_SE = [
  "januari",
  "februari",
  "mars",
  "april",
  "maj",
  "juni",
  "juli",
  "augusti",
  "september",
  "oktober",
  "november",
  "december",
];
const UGEDAGE_DA = [
  "søndag",
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
];
const UGEDAGE_SE = [
  "söndag",
  "måndag",
  "tisdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lördag",
];

/** Byens fulde navn i det valgte sprog. */
export function byensNavn(by: KlokkenBy, sprog: KlokkenSprog): string {
  return sprog === "se" ? (by.se ?? by.da) : by.da;
}

/** Landets navn i det valgte sprog. */
export function landetsNavn(land: KlokkenLand, sprog: KlokkenSprog): string {
  return sprog === "da" ? land.navnDa : land.navnSe;
}

/** Slug'en for et land i det valgte sprog. */
export function slugForSprog(land: KlokkenLand, sprog: KlokkenSprog): string {
  return sprog === "da" ? land.slugDa : land.slugSe;
}

/** Klokkeslættet i titlen regnes fra midnat i læserens egen zone. */
const TITEL_REFERENCE_MINUTTER = 12 * 60;

/**
 * Landesidens `<title>`: spørgsmålet plus den regnede omregning.
 *
 * Datagrunden er samme måling som brødteksten: 12 i Danmark er det samme
 * klokkeslæt som `/tidszone`s egen titel, og forskellen læses fra
 * `tidsforskelMinutter` på det øjeblik, siden serveres — altså kan den ikke stå
 * som et håndskrevet tal, der bliver 6 timer hele året i et land, der skifter
 * til sommertid på en anden dato end Danmark. Tokyo er 8 timer foran om
 * vinteren og 7 om sommeren, og det er prøven på.
 *
 * Omregningen regnes fra **12 i læserens egen zone**, ikke fra klokkeslættet
 * lige nu. Regnes den fra «nu», får titlen et tilfældigt tal, der kun er rigtigt
 * i det øjeblik den blev skrevet.
 */
export function klokkenLandTitel(
  land: KlokkenLand,
  sprog: KlokkenSprog,
  tidspunkt: Date
): string {
  const by = land.byer[0];
  const forskel = tidsforskelMinutter(tidspunkt, by.zone);
  const minutter =
    (((TITEL_REFERENCE_MINUTTER + forskel) % 1440) + 1440) % 1440;
  const tid = `${String(Math.floor(minutter / 60)).padStart(2, "0")}:${String(
    minutter % 60
  ).padStart(2, "0")}`;
  return sprog === "da"
    ? `Hvad er klokken i ${landetsNavn(land, "da")}? 12 i Danmark = ${tid} i ${byensNavn(by, "da")}`
    : `Vad är klockan i ${landetsNavn(land, "se")}? 12 i Sverige = ${tid} i ${byensNavn(by, "se")}`;
}

/** Landet bag en slug, eller `null` hvis slugen ikke findes. */
export function findKlokkenLand(slug: string, sprog: KlokkenSprog): KlokkenLand | null {
  return (
    KLOKKEN_LANDE.find((land) => slugForSprog(land, sprog) === slug) ?? null
  );
}

/** Alle slugs i det valgte sprog — samme rækkefølge på begge domæner. */
export function getKlokkenSlugs(sprog: KlokkenSprog): string[] {
  return KLOKKEN_LANDE.map((land) => slugForSprog(land, sprog));
}

/**
 * Ruten for landene. Norsk domæne får ingen, fordi `KLOKKEN_LANDE` kun er
 * dansk og svensk — samme regel som `/dage-til`.
 */
export function getKlokkenPrefix(locale: Locale): string | undefined {
  if (locale === "da") return "/klokken-i/";
  if (locale === "se") return "/klockan-i/";
  return undefined;
}

/**
 * Sektionens egen side, uden skråstreg i slutningen: `/klokken-i` på dansk og
 * `/klockan-i` på svensk. Landesiderne hænger under `getKlokkenPrefix`, som
 * ender på skråstreg, så det er det ene sted i modulet der skal tage den af —
 * ellers ville en sitemap-entry pege på `/klokken-i/`, som routeren svarer 308
 * på, og `hreflang` mellem de to sprog ville pege på det anden sprog.
 */
export function getKlokkenHubPath(locale: Locale): string | undefined {
  const prefix = getKlokkenPrefix(locale);
  return prefix ? prefix.replace(/\/$/, "") : undefined;
}

export interface KlokkenHubRaekke {
  id: string;
  href: string;
  /** Landets navn i det valgte sprog. */
  land: string;
  /** Hovedbyen — den by siden svarer på. */
  by: string;
  /** «HH:MM» i byens egen tid. */
  tid: string;
  /** «6 timer bagud» / «5 timmar och 45 minuter före». */
  forskel: string;
  /** Tidsforskellen i minutter, signeret: positivt er foran Danmark. */
  minutter: number;
}

/**
 * Alle landene som én række pr. land, tættest på Danmark først.
 *
 * Sektionen havde 12 landesider i hvert sprog og ingen side af sin egen, så
 * den, der spørger «hvad er klokken i» (178 visninger, pos. 6) og «hvad er
 * klokken i de forskellige tidszoner» (89 visninger, pos. 5) ikke havde noget
 * sted at lande — de skulle gætte et landnavn for at få et svar. Hubben svarer
 * på den åbne form og linker videre til den side der har hele regnestykket.
 *
 * Tallet i hver række kommer fra `beregnKlokkenNu` — samme kald som den
 * linkede landside bruger med samme `tidspunkt` — så rækken og siden kan ikke
 * stride. Sorteret på `|minutter|`, altså efter hvor tæt landet ligger på
 * Danmark, og ved lighed på landets navn, så rækkefølgen aldrig afhænger af
 * rækkefølgen i `KLOKKEN_LANDE`.
 */
export function getKlokkenHubRaekker(
  sprog: KlokkenSprog,
  tidspunkt: Date
): KlokkenHubRaekke[] {
  const prefix = getKlokkenPrefix(sprog);
  if (!prefix) return [];
  return KLOKKEN_LANDE.map((land) => {
    const svar = beregnKlokkenNu(land.byer[0], sprog, tidspunkt);
    return {
      id: slugForSprog(land, sprog),
      href: `${prefix}${slugForSprog(land, sprog)}`,
      land: landetsNavn(land, sprog),
      by: svar.by,
      tid: svar.tid,
      forskel: svar.forskel,
      minutter: tidsforskelMinutter(tidspunkt, land.byer[0].zone),
    };
  }).sort((a, b) => {
    const forskel = Math.abs(a.minutter) - Math.abs(b.minutter);
    if (forskel !== 0) return forskel;
    return a.land.localeCompare(b.land, sprog === "da" ? "da" : "sv");
  });
}

/** «6 timer bagud» — med minutter, når forskellen ikke er et helt timeantal. */
function forskelTekst(
  minutter: number,
  sprog: KlokkenSprog
): string {
  const heleTimer = Math.floor(Math.abs(minutter) / 60);
  const restMinutter = Math.abs(minutter) % 60;
  const time = sprog === "da" ? "time" : "timme";
  const timer = sprog === "da" ? "timer" : "timmar";
  const min = sprog === "da" ? "minutter" : "minuter";
  const dele: string[] = [];
  if (heleTimer > 0) dele.push(`${heleTimer} ${heleTimer === 1 ? time : timer}`);
  if (restMinutter > 0) dele.push(`${restMinutter} ${min}`);
  const vaerd = dele.join(sprog === "da" ? " og " : " och ");
  if (minutter === 0) return sprog === "da" ? "samme tid som Danmark" : "samma tid som Sverige";
  const retning =
    minutter > 0
      ? sprog === "da"
        ? "foran"
        : "före"
      : sprog === "da"
        ? "bagud"
        : "efter";
  return `${vaerd} ${retning}`;
}

/** Datoen i byens egen tid, skrevet som «torsdag 2. oktober 2026». */
function datoTekst(iso: string, ugedag: number, sprog: KlokkenSprog): string {
  const [aar, maaned, dag] = iso.split("-").map(Number);
  const maaneder = sprog === "da" ? MAANEDER_DA : MAANEDER_SE;
  const ugedage = sprog === "da" ? UGEDAGE_DA : UGEDAGE_SE;
  return `${ugedage[ugedag]} ${dag}. ${maaneder[(maaned ?? 1) - 1]} ${aar}`;
}

/**
 * Byens svar på et givet øjeblik — den rene del af siden, så både den
 * danske og den svenske rute og testene kalder den samme funktion.
 */
export function beregnKlokkenNu(
  by: KlokkenBy,
  sprog: KlokkenSprog,
  tidspunkt: Date
): KlokkenSvar {
  const dele = deleITidszone(tidspunkt, by.zone);
  const forskel = tidsforskelMinutter(tidspunkt, by.zone);
  const minutterTekst = dele.minutter;
  const tid = `${String(Math.floor(minutterTekst / 60)).padStart(2, "0")}:${String(
    minutterTekst % 60
  ).padStart(2, "0")}`;
  const her = deleITidszone(tidspunkt, SIDENS_ZONE);
  return {
    by: byensNavn(by, sprog),
    zone: by.zone,
    tid,
    dato: datoTekst(dele.iso, dele.ugedag, sprog),
    forskel: forskelTekst(forskel, sprog),
    andenDag:
      dele.iso === her.iso
        ? null
        : sprog === "da"
          ? "Det er en anden dato i byen end i Danmark lige nu."
          : "Det är ett annat datum i staden än i Sverige just nu.",
    erNatte: dele.minutter >= 23 * 60 || dele.minutter < 7 * 60,
  };
}