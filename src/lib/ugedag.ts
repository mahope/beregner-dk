/**
 * Siden for «ugedag» — den danske `/ugedag` og den svenske `/veckodag`.
 *
 * **Hvorfor siden findes.** Dansk autocomplete 6/10 har fire separate
 * spørgsmål i samme familie, og ingen af dem har en egen adresse på sitet:
 * «hvilken ugedag er jeg født», «hvilken ugedag er det i dag» (formuleringen
 * «hvad for en ugedag er det i dag»), «hvilken ugedag var» og «ugedag
 * beregner». På svensk er «vilken veckodag är jag född» og «vilken veckodag
 * är det idag» de to første completioner under «vilken veckodag».
 * `/dato` og `/ugenummer` har begge et afsnit om ugedagen, men de ligger på
 * sider, der konkurrerer om henholdsvis 20 og 2 andre spørgsmål — så den der
 * googler «ugedag» skal gætte blandt 158 URL'er. Egen sti, egen `<h1>`, egen
 * titel: samme spørgsmål, sin egen adresse.
 *
 * **Ingen tal i teksten.** Ugedagsnavnet, uge- og dagsnumrene, ISO-ugenummeret
 * og alle eksemplernes datoer regnes her af de samme funktioner værktøjet
 * bruger. Punkt 11 i kvalitetsreglerne: en påstand i tekst er kode, så en tekst
 * der skriver «torsdag» ved siden af et regnestykke der siger onsdag, er en
 * løftefejl — præcis den fejl `tidszone-eksempler.ts` havde med Danmark.
 */
import { heleDageMellem, parseIsoDato } from "./lokal-dato";

export type UgedagLocale = "da" | "se";

/** Sprogslaget er `da` og `se`: norsk domæne (`beregner.no`) er ikke i drift. */
export function isUgedagLocale(locale: string): locale is UgedagLocale {
  return locale === "da" || locale === "se";
}

/** Sidens egen sti i hvert sprog. Stien *er* sprogvalget. */
export const UGEDAG_PATH: Record<UgedagLocale, string> = {
  da: "/ugedag",
  se: "/veckodag",
};

export function getUgedagPath(locale: string): string | null {
  return isUgedagLocale(locale) ? UGEDAG_PATH[locale] : null;
}

/**
 * De sprogslåede ugedagsnavne i den rækkefølge kalenderen har dem.
 *
 * `Date#getDay()` giver 0 = søndag og 6 = lørdag, så den række er indekseret
 * af ugedagens tal og **ikke** startende på mandag — den europæiske kalender
 * gør, men `getDay()` ikke. At bygge rækken med en rotation ville være kortere
 * og umulig at læse; indexeringen gør den aflæselig, fordi hvert navn står
 * under sit `getDay()`-tal.
 */
const UGEDAGSNAVN: Record<UgedagLocale, readonly string[]> = {
  //            getDay():   0      1      2      3      4      5      6
  da: ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"],
  se: ["söndag", "måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag"],
};

/** Ugedagens navn i sit eget sprog, med stort initial bogstav. */
export function ugedagsnavn(iso: string, locale: UgedagLocale): string | null {
  const dato = parseIsoDato(iso);
  if (!dato) return null;
  const navn = UGEDAGSNAVN[locale][dato.getDay()];
  return navn.charAt(0).toUpperCase() + navn.slice(1);
}

/**
 * Ugedagens **korte** navn, som det står i en kalender: "Ma", "Ti", "Lø".
 *
 * Rækkerne ligger i **samme rækkefølge som `UGEDAGSNAVN`** — søndag først,
 * fordi de indekseres af `getDay()` ligesom de lange navn. Det er den
 * forskydning, der gør en søndag til "Sø": en kalender der skriver "Ma" over
 * en mandag og "Lø" over en lørdag er den, en læser holder op at bruge efter én
 * gang, fordi den modsiger sig selv på tværs af siderne. `ugenOmkring` leverer
 * rækker i ISO-rækkefølge (mandag først), men den læser `ugedagsnavnKort` pr.
 * dato og ikke pr. position — så den rækkefølge bliver aldrig blandet ind.
 */
const UGEDAGSNAVN_KORT: Record<UgedagLocale, readonly string[]> = {
  //            getDay():   0     1     2     3     4     5     6
  da: ["Sø", "Ma", "Ti", "On", "To", "Fr", "Lø"],
  se: ["Sö", "Må", "Ti", "On", "To", "Fr", "Lö"],
};

/** Ugedagens korte navn i eget sprog, eller `null` for en uguelig dato. */
export function ugedagsnavnKort(iso: string, locale: UgedagLocale): string | null {
  const dato = parseIsoDato(iso);
  if (!dato) return null;
  return UGEDAGSNAVN_KORT[locale][dato.getDay()];
}

/** Sand hvis datoen er en lørdag eller en søndag, altså et weekenddøgn. */
export function erWeekend(iso: string): boolean {
  const dato = parseIsoDato(iso);
  if (!dato) return false;
  const dag = dato.getDay();
  return dag === 0 || dag === 6;
}

/**
 * ISO 8601-ugenummeret og ugedagens 1-7-tal (ISO: mandag er 1).
 *
 * ISO-ugenummeret kan ikke læses af `getDay()` alene. Reglen er, at **uge 1 er
 * den uge, der indeholder årets første torsdag**, og den følger sin egen
 * tretrinsformel — ikke den, man lærer i grundskolen. Ugerne omkring årsskiftet
 * er præcis derfor de fælder, `/ugenummer` har en hel side om: den 31. december
 * 2026 kan godt være uge 53 i 2026 mens den 4. januar 2019 er uge 1 i 2019 selv
 * om den ligger i uge 1 af gregorian year 1-tallet.
 *
 * **Regnes i UTC, fordi værktøjet kører i læserens browser.** Skregnen
 * 1. januar − torsdagen må være et helt antal dage, ellers tæller
 * `Math.floor(n / 7) + 1` en uge for højt. I læserens egen tidszone er den
 * *ikke* hel: et skifte for sommertid mellem de to datoer gør den 0,9583 døgn
 * (Danmark, skiftet før den lævede uge — lykken reddede svaret) eller 0,0417
 * døgn (Sydney, Auckland, Santiago, skiftet *efter* 1. januar — 182 af 730
 * datoer i 2026-27 fik uge 15 i stedet for 14). Samme dato, to tal, to sider af
 * samme site. Derfor læses kalenderfelterne og regnes i UTC, præcis som
 * `ugenummer.ts` gør det — samme formel, samme mappe, dømt af `/ugenummer`s
 * egne tests.
 */
export function isoUge(iso: string): { uge: number; ugedag: number } | null {
  const dato = parseIsoDato(iso);
  if (!dato) return null;
  // Kalenderfelterne læst, så det er *dagen læseren skrev* der regnes på.
  const d = new Date(Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate()));
  // ISO-ugedagen: mandag = 1 … søndag = 7 (`getUTCDay()`: søndag = 0).
  const isoUgedag = d.getUTCDay() || 7;
  // Torsdag i samme ISO-uge. `getUTCDay()` er 4 om torsdagen ligger i den uge,
  // så en torsdag der ligger i **næste** uge flytter ugen tilbage til torsdagen
  // i denne uge, og det er præcis derfor `Math.floor` og et dygn ned træder ind.
  d.setUTCDate(d.getUTCDate() + 4 - isoUgedag);
  const aarStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const dage = Math.round((d.getTime() - aarStart.getTime()) / 86400000);
  return { uge: Math.floor(dage / 7) + 1, ugedag: isoUgedag };
}

/** Antal dage i året, og om året er et skudår. */
export function dageIAar(aar: number): { dage: number; skudaar: boolean } {
  return { dage: aar % 4 === 0 && (aar % 100 !== 0 || aar % 400 === 0) ? 366 : 365, skudaar: aar % 4 === 0 && (aar % 100 !== 0 || aar % 400 === 0) };
}

/** Én konkret regneeksempel, som brødteksten, FAQ'en og porten alle læser. */
export interface UgedagEksempel {
  /** "YYYY-MM-DD" for datoen. */
  iso: string;
  datoTekst: string;
  ugedagTekst: string;
  uge: number;
  ugedagIso: number;
  weekend: boolean;
}

/**
 * Regner det komplette svar for én dato. Samme funktion som værktøjet kalder,
 * så et tal i brødteksten og et tal i felterne ikke kan glide fra hinanden.
 */
export function ugedagResultat(iso: string, locale: UgedagLocale): UgedagEksempel | null {
  const navn = ugedagsnavn(iso, locale);
  const uge = isoUge(iso);
  const dato = parseIsoDato(iso);
  if (navn === null || uge === null || dato === null) return null;
  return {
    iso,
    datoTekst: formatDatoTekst(iso, locale),
    ugedagTekst: navn,
    uge: uge.uge,
    ugedagIso: uge.ugedag,
    weekend: erWeekend(iso),
  };
}

/**
 * Datoen skrevet som læseren skriver den: "27. september 2026" i dansk og
 * "27 september 2026" i svensk. Bygget af kalenderfelterne, ikke af `Intl`,
 * fordi `Intl` på en server i UTC kan skrive dagen i forvegne.
 */
export function formatDatoTekst(iso: string, locale: UgedagLocale): string {
  const dato = parseIsoDato(iso);
  if (!dato) return iso;
  const dag = String(dato.getDate());
  const maaned = MAAEDER[locale][dato.getMonth()];
  const aar = String(dato.getFullYear());
  return locale === "da" ? `${dag}. ${maaned} ${aar}` : `${dag} ${maaned} ${aar}`;
}

/** Månedsnavnene i kalenderens rækkefølge, så `getMonth()` kan indeksere dem. */
const MAAEDER: Record<UgedagLocale, readonly string[]> = {
  da: [
    "januar", "februar", "marts", "april", "maj", "juni",
    "juli", "august", "september", "oktober", "november", "december",
  ],
  se: [
    "januari", "februari", "mars", "april", "maj", "juni",
    "juli", "augusti", "september", "oktober", "november", "december",
  ],
};

/**
 * De syv kalenderdage omkring en dato, så læseren kan se hele ugen og ikke
 * bare den ene dag de spurgte efter. Ugen starter på mandag, som i ISO.
 */
export function ugenOmkring(
  iso: string,
  locale: UgedagLocale
): {
  iso: string;
  tekst: string;
  ugedagTekst: string;
  ugedagKort: string;
  dagNr: number;
  weekend: boolean;
  erValgt: boolean;
}[] {
  const dato = parseIsoDato(iso);
  if (!dato) return [];
  // `isoUgedag` er 1 = mandag, så mandagen i samme uge ligger `isoUgedag - 1`
  // dage før den valgte dato.
  const isoUgedag = isoUge(iso)?.ugedag ?? 1;
  const mandag = new Date(dato);
  mandag.setDate(dato.getDate() - (isoUgedag - 1));
  return Array.from({ length: 7 }, (_, afstand) => {
    const dag = new Date(mandag);
    dag.setDate(mandag.getDate() + afstand);
    const isoDag = `${dag.getFullYear()}-${String(dag.getMonth() + 1).padStart(2, "0")}-${String(
      dag.getDate()
    ).padStart(2, "0")}`;
    return {
      iso: isoDag,
      tekst: String(dag.getDate()),
      ugedagTekst: ugedagsnavn(isoDag, locale) ?? "",
      ugedagKort: ugedagsnavnKort(isoDag, locale) ?? "",
      dagNr: dag.getDate(),
      weekend: erWeekend(isoDag),
      erValgt: isoDag === iso,
    };
  });
}

/**
 * Hvor mange dage der er gået siden påske til pinse og lignende faste
 * intervaller. Findes her, fordi brødteksten skal kunne skrive et *talt* om et
 * fast forhold mellem to kalenderdatoer, og det skal komme fra samme
 * kode som værktøjets egen optælling — ellers kan de to glide fra hinanden,
 * når påsken flytter sig (punkt 11).
 */
export function dageMellemIsoDatoer(fraIso: string, tilIso: string): number | null {
  const fra = parseIsoDato(fraIso);
  const til = parseIsoDato(tilIso);
  if (!fra || !til) return null;
  return heleDageMellem(fra, til);
}
