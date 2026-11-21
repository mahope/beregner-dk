/**
 * Siden for «hvor mange dage er der tilbage af 2026» — den danske
 * `/dage-tilbage-i-aaret` og den svenske `/dagar-kvar-i-aret`.
 *
 * **Hvorfor siden findes.** Målt 10/10 i Googles egen autocomplete
 * (`suggestqueries.google.com`) er «hvor mange dage er der tilbage af 2026»
 * blandt de ti første forslag under «hvor mange dage er der til» — samme klub
 * som juleaften, 1. december, halloween og sommerferie, der hver har egen
 * adresse. «Hvor mange uger er der tilbage af 2026» (nr. 3) og «… tilbage i år»
 * hører til samme spørgsmål, og svensk spørger det samme: «hur många dagar är
 * det kvar av 2026» er nr. 1 under «kvar av 2026», «hur många dagar är det
 * kvar i år» nr. 1 under «kvar i år» og «hur många veckor är det kvar på året»
 * nr. 5. I dag er svaret én sætning inde på `/dage-i-aaret`, hvis titel og
 * `<h1>` begge er om de tolv måneder.
 *
 * **«Dage tilbage» følger hele-sitets-konventionen: dagen i dag tælles ikke
 * med.** Det er den samme `heleDageMellem`, som `/dage-til`, `/dato`,
 * `/dage-mellem-datoer` og `aarsoversigt.tilbage` på `/dage-i-aaret` bruger, så
 * de to sider ikke kan svare forskelligt på «hvor mange dage er der tilbage».
 * Dagen i dagtages med i `medIDag`, så brødteksten kan sige begge uden at
 * regne noget en gang til.
 *
 * **Ingen tal i teksten.** Alt regnes her: dagetal,timer, uger, procent af
 * året, hverdage tilbage, månedstallen og helligdagene som stadig skal
 * afvikles. Punkt 11 i kvalitetsreglerne: en påstand i tekst er kode.
 */
import { getIntlLocale } from "./format";
import {
  getHelligdage,
  taellArbejdsdage,
  type HelligdagLocale,
} from "./helligdage";
import { heleDageMellem, iDagPaSiden, parseIsoDato } from "./lokal-dato";
import { maanederITaar } from "./dato-eksempler";
import { formatDatoTekst, ugedagsnavn } from "./ugedag";

export type DageTilbageLocale = "da" | "se";

/** Sprogslaget er `da` og `se`: norsk domæne (`beregner.no`) er ikke i drift. */
export function isDageTilbageLocale(locale: string): locale is DageTilbageLocale {
  return locale === "da" || locale === "se";
}

/** Sidens egen sti i hvert sprog. Stien *er* sprogvalget. */
export const DAGE_TILBAGE_PATH: Record<DageTilbageLocale, string> = {
  da: "/dage-tilbage-i-aaret",
  se: "/dagar-kvar-i-aret",
};

export function getDageTilbagePath(locale: string): string | null {
  return isDageTilbageLocale(locale) ? DAGE_TILBAGE_PATH[locale] : null;
}

/**
 * Datoen `antal` kalenderdage fra `dato`. Regnes på kalenderfelterne og ikke
 * med `+ antal × 24 timer`, fordi mellem 25. og 26. oktober 2026 er natten 25
 * timer lang: et tillæg på 24 timer lander midt på 25. oktober igen fremfor
 * den 26., og så ville intervallets første dag tælles med to gange. Samme
 * grund som `heleDageMellem`.
 */
function plusKalenderdage(dato: Date, antal: number): Date {
  return new Date(
    dato.getFullYear(),
    dato.getMonth(),
    dato.getDate() + antal
  );
}

/** Dagen efter `dato` — brugt til intervaller der følger «efter i dag». */
function naesteDag(dato: Date): Date {
  return plusKalenderdage(dato, 1);
}

/** Dagen `antal` dage før `dato`. */
function dageFoer(dato: Date, antal: number): Date {
  return plusKalenderdage(dato, -antal);
}

/** Kalenderdage i det lukkede interval [fra, til] — 0 hvis det er tomt. */
function dageIInterval(fra: Date, til: Date): number {
  return heleDageMellem(dageFoer(fra, 1), til);
}

/** Én måned med de dage, der stadig er tilbage af den. */
export interface MaanedTilbage {
  month: number;
  name: string;
  /** Dage tilbage i måneden efter i dag — 0 for måneder der allerede er slut. */
  dageTilbage: number;
  /** Hverdage tilbage i måneden (helligdage trukket fra). */
  hverdageTilbage: number;
}

/** En helligdag der stadig er tilbage i år. */
export interface HelligdagTilbage {
  iso: string;
  navn: string;
  datoTekst: string;
  ugedag: string;
}

/** Alt siden lover om det indeværende år — regnet, aldrig skrevet. */
export interface AaretTilbage {
  aar: number;
  naesteAar: number;
  /** Kalenderdage hele året. */
  dageIAlt: number;
  /** Dage der er gået før i dag. */
  dageForbi: number;
  /** Dage tilbage *efter* i dag, til og med 31. december. 0 nytårsaften. */
  dageTilbage: number;
  /** `dageTilbage` + 1 — dagen i dag medregnet. */
  medIDag: number;
  /** Hele uger i `dageTilbage` og den rest der bliver tilbage. */
  uger: number;
  restDage: number;
  /** Timer i de dage der er tilbage. */
  timer: number;
  /** Procentdel af året der er gået, én decimal. */
  procentForbi: number;
  /** Årets sidste dag og året der starter bagefter. */
  sidsteDagIso: string;
  sidsteDagUgedag: string;
  foersteDagIso: string;
  foersteDagUgedag: string;
  /** Hverdage tilbage efter i dag (helligdage trukket fra). */
  hverdageTilbage: number;
  /** Officielle helligdage der stadig skal afvikles, kronologisk. */
  helligdageTilbage: HelligdagTilbage[];
  /** Månederne der stadig har dage tilbage, fra denne måned. */
  maaneder: MaanedTilbage[];
  /** Dagen hvor præcis 100 dage var tilbage af året, og om den er kommet. */
  hundredeDageIso: string;
  hundredeDageUgedag: string;
  hundredeDagePasseret: boolean;
}

/**
 * Dagens dato læses med `iDagPaSiden`, altså i `Europe/Copenhagen` (svensk
 * `Europe/Stockholm`) — aldrig med serverens `getUTC*`. Ellers er «dage
 * tilbage» en dag forkanet mellem kl. 00 og 02, fordi UTC da er dagen før.
 */
function iDag(locale: DageTilbageLocale, today: Date): Date {
  const iso = iDagPaSiden(today, locale);
  return parseIsoDato(iso) ?? today;
}

/** Årets nedtælling, måned for måned. */
export function aaretTilbage(
  locale: DageTilbageLocale,
  today: Date
): AaretTilbage {
  const iDagDato = iDag(locale, today);
  const aar = iDagDato.getFullYear();
  const naeste = naesteDag(iDagDato);
  const sidsteDag = parseIsoDato(`${aar}-12-31`) as Date;
  const foersteDagNaeste = parseIsoDato(`${aar + 1}-01-01`) as Date;
  const dageTilbage = heleDageMellem(iDagDato, sidsteDag);

  const maanederAlle = maanederITaar(aar, locale);
  const dageIAlt = maanederAlle.reduce((sum, m) => sum + m.dage, 0);
  const denneMaaned = iDagDato.getMonth() + 1;

  const maaneder: MaanedTilbage[] = maanederAlle
    .filter((række) => række.month >= denneMaaned)
    .map((række) => {
      const maanedStart = parseIsoDato(
        `${aar}-${String(række.month).padStart(2, "0")}-01`
      ) as Date;
      const maanedSlut = parseIsoDato(
        `${aar}-${String(række.month).padStart(2, "0")}-${String(række.dage).padStart(2, "0")}`
      ) as Date;
      const fra = række.month === denneMaaned ? naeste : maanedStart;
      return {
        month: række.month,
        name: række.name,
        dageTilbage: Math.max(0, dageIInterval(fra, maanedSlut)),
        hverdageTilbage: Math.max(
          0,
          taellArbejdsdage(fra, maanedSlut, locale as HelligdagLocale)
        ),
      };
    });

  const hundredeDage = dageFoer(sidsteDag, 100);

  return {
    aar,
    naesteAar: aar + 1,
    dageIAlt,
    dageForbi: Math.max(0, dageIAlt - 1 - dageTilbage),
    dageTilbage,
    medIDag: dageTilbage + 1,
    uger: Math.floor(dageTilbage / 7),
    restDage: dageTilbage % 7,
    timer: dageTilbage * 24,
    procentForbi:
      Math.round(((dageIAlt - 1 - dageTilbage) / dageIAlt) * 1000) / 10,
    sidsteDagIso: `${aar}-12-31`,
    sidsteDagUgedag: ugedagsnavn(`${aar}-12-31`, locale) ?? "",
    foersteDagIso: `${aar + 1}-01-01`,
    foersteDagUgedag: ugedagsnavn(`${aar + 1}-01-01`, locale) ?? "",
    hverdageTilbage: taellArbejdsdage(naeste, sidsteDag, locale as HelligdagLocale),
    helligdageTilbage: getHelligdage(aar, locale as HelligdagLocale)
      .filter((h) => h.date.getTime() > iDagDato.getTime())
      .map((h) => {
        const iso = isoDag(h.date);
        return {
          iso,
          navn: h.name,
          datoTekst: formatDatoTekst(iso, locale),
          ugedag: ugedagsnavn(iso, locale) ?? "",
        };
      }),
    maaneder,
    hundredeDageIso: isoDag(hundredeDage),
    hundredeDageUgedag: ugedagsnavn(isoDag(hundredeDage), locale) ?? "",
    hundredeDagePasseret: hundredeDage.getTime() <= iDagDato.getTime(),
  };
}

/**
 * Dato → `ÅÅÅÅ-MM-DD` ud fra kalenderfelterne. `toISOString()` ville give
 * dagen før, fordi alle datoer her holder lokal midnat, og den er
 * natten før kl. 01 i UTC. Felterne er den samme kilde som `heleDageMellem`,
 * `taellArbejdsdage` og `iDagPaSiden` læser.
 */
function isoDag(dato: Date): string {
  return [
    String(dato.getFullYear()).padStart(4, "0"),
    String(dato.getMonth() + 1).padStart(2, "0"),
    String(dato.getDate()).padStart(2, "0"),
  ].join("-");
}

/**
 * Tal formateret med sitets egen `getIntlLocale` — dansk grupperer med punktum,
 * svensk med mellemrum. Skrivemåden læses fra samme sted som resten af sitet.
 */
function tal(n: number, locale: DageTilbageLocale): string {
  return n.toLocaleString(getIntlLocale(locale));
}

/** «1 dag» og «17 dage» / «1 dag» og «17 dagar» — med rigtigt ental i begge. */
function dagetal(
  n: number,
  locale: DageTilbageLocale,
  ental: string,
  flertal: string
): string {
  return n === 1 ? `1 ${ental}` : `${tal(n, locale)} ${flertal}`;
}

export interface DageTilbageSpgsg {
  question: string;
  answer: string;
}

/**
 * Spørgsmålene som `<h2>`-afsnit og som `FAQPage`. De er autocomplete-målingens
 * tre største, og **hvert svar regnes** af den samme `aaretTilbage`, som
 * tabellen viser.
 */
export function dageTilbageIAaretFaq(
  locale: DageTilbageLocale,
  today: Date
): DageTilbageSpgsg[] {
  const o = aaretTilbage(locale, today);
  const da = locale === "da";
  if (da) {
    return [
      {
        question: "Hvor mange dage er der tilbage af året?",
        answer: `Der er ${dagetal(o.dageTilbage, locale, "dag", "dage")} tilbage af ${o.aar} efter i dag, altså ${tal(o.uger, locale)} hele uger og ${dagetal(o.restDage, locale, "dag", "dage")}. Tæller du dagen i dag med, er det ${tal(o.medIDag, locale)} dage — vores nedtællinger tæller altid fra i dag, præcis som /dato og dage-til-siderne.`,
      },
      {
        question: "Hvornår er der 100 dage tilbage af året?",
        answer: o.hundredeDagePasseret
          ? `Den dag var ${formatDatoTekst(o.hundredeDageIso, locale)} (en ${o.hundredeDageUgedag}) — det er den dag der ligger 100 dage før ${o.aar}s sidste dag. Nu er der ${tal(o.dageTilbage, locale)} dage tilbage.`
          : `Den dag er ${formatDatoTekst(o.hundredeDageIso, locale)} (en ${o.hundredeDageUgedag}) — der er 100 dage mellem den dag og årets sidste dag. I dag er der ${tal(o.dageTilbage, locale)} dage tilbage.`,
      },
      {
        question: "Hvor mange arbejdsdage er der tilbage af året?",
        answer: `Der er ${tal(o.hverdageTilbage, locale)} hverdage tilbage efter i dag. Det er færre end ${tal(o.dageTilbage, locale)} dage, fordi weekender og de ${tal(o.helligdageTilbage.length, locale)} helligdage, der stadig falder i år, er trukket fra.`,
      },
      {
        question: "Hvornår slutter året?",
        answer: `Årets sidste dag er ${formatDatoTekst(o.sidsteDagIso, locale)}, og det er en ${o.sidsteDagUgedag}. ${o.naesteAar} starter ${formatDatoTekst(o.foersteDagIso, locale)}, som er en ${o.foersteDagUgedag}.`,
      },
    ];
  }
  return [
    {
      question: "Hur många dagar är det kvar av året?",
      answer: `Det finns ${dagetal(o.dageTilbage, locale, "dag", "dagar")} kvar av ${o.aar} efter i dag, alltså ${tal(o.uger, locale)} hela veckor och ${dagetal(o.restDage, locale, "dag", "dagar")}. Räknar du med dagens datum blir det ${tal(o.medIDag, locale)} dagar — våra nedräkningar räknar alltid från och med i dag, precis som datumräknaren och dagarna-till-sidorna.`,
    },
    {
      question: "När är det 100 dagar kvar av året?",
      answer: o.hundredeDagePasseret
        ? `Den dagen var ${formatDatoTekst(o.hundredeDageIso, locale)} (en ${o.hundredeDageUgedag}) — det är dagen som ligger 100 dagar före ${o.aar}s sista dag. Nu är det ${tal(o.dageTilbage, locale)} dagar kvar.`
        : `Den dagen är ${formatDatoTekst(o.hundredeDageIso, locale)} (en ${o.hundredeDageUgedag}) — då är det 100 dagar till årets sista dag. I dag är det ${tal(o.dageTilbage, locale)} dagar kvar.`,
    },
    {
      question: "Hur många arbetsdagar är det kvar av året?",
      answer: `Det finns ${tal(o.hverdageTilbage, locale)} vardagar kvar efter i dag. Det är färre än ${tal(o.dageTilbage, locale)} dagar, för att helger och de ${tal(o.helligdageTilbage.length, locale)} helgdagar som fortfarande faller i år är dragna ifrån.`,
    },
    {
      question: "När slutar året?",
      answer: `Årets sista dag är ${formatDatoTekst(o.sidsteDagIso, locale)}, och det är en ${o.sidsteDagUgedag}. ${o.naesteAar} börjar ${formatDatoTekst(o.foersteDagIso, locale)}, som är en ${o.foersteDagUgedag}.`,
    },
  ];
}

export interface DageTilbageCopy {
  h1: string;
  /** Titlen sætter årstallet ind her — den skal ramme spørgsmålet ordret. */
  titelSpoergsmaal: string;
  /** Forklaringen under tabellen. */
  lead: string;
  /** Sætningen i det blå svarfelt, før dagetallet. */
  svarIgang: string;
  /** Kolonnehoveder til tabellen med månederne der stadig har dage tilbage. */
  tabelOverskrift: string;
  kolonneMaaned: string;
  kolonneDageTilbage: string;
  kolonneHverdage: string;
  sum: string;
  /** Forklaringen under tabellen. */
  underTabel: string;
  /** Overskrift over listen af helligdage der stadig skal afvikles. */
  helligdageOverskrift: string;
  helligdageTom: string;
  /** Overskriften over afsnittet for hvert spørgsmål. */
  afsnitDage: string;
  afsnitHverdage: string;
  afsnitSlutning: string;
  linkDato: string;
  linkDageIAaret: string;
  linkDageIManeden: string;
  linkTimerIAaret: string;
  linkArbejdsdage: string;
  linkDageTil: string;
}

/** Copy uden årstal — alle tal regnes i `aaretTilbage` og `dageTilbageIAaretFaq`. */
export const dageTilbageIAaretCopy: Record<DageTilbageLocale, DageTilbageCopy> = {
  da: {
    h1: "Hvor mange dage er der tilbage af året?",
    titelSpoergsmaal: "Hvor mange dage er der tilbage af",
    lead: "Nedtælling for det indeværende år: dage, uger, timer, hverdage og de helligdage der stadig skal afvikles.",
    svarIgang: "Der er tilbage af året efter i dag:",
    tabelOverskrift: "Så mange dage er tilbage i hver måned",
    kolonneMaaned: "Måned",
    kolonneDageTilbage: "Dage tilbage",
    kolonneHverdage: "Hverdage tilbage",
    sum: "Resten af året",
    underTabel:
      "Dage tilbage tæller fra i dag op til månedens sidste dato, så i den måned du står i, er dagen i dag ikke med. Hverdage tilbage har weekender og helligdage trukket fra.",
    helligdageOverskrift: "Helligdage der stadig er tilbage",
    helligdageTom: "Der er ingen helligdage tilbage i år.",
    afsnitDage: "Hvor mange dage er der tilbage af året?",
    afsnitHverdage: "Hvor mange arbejdsdage er der tilbage af året?",
    afsnitSlutning: "Hvornår slutter året?",
    linkDato: "Datoberegner med alle fire værktøj",
    linkDageIAaret: "Hvor mange dage er der på et år?",
    linkDageIManeden: "Hvor mange dage er der i hver måned?",
    linkTimerIAaret: "Hvor mange timer er der på et år?",
    linkArbejdsdage: "Hvor mange arbejdsdage er der på et år?",
    linkDageTil: "Hvor mange dage er der til …?",
  },
  se: {
    h1: "Hur många dagar är det kvar av året?",
    titelSpoergsmaal: "Hur många dagar är det kvar av",
    lead: "Nedräkning för det innevarande året: dagar, veckor, timmar, vardagar och de helgdagar som fortfarande ska avverkas.",
    svarIgang: "Det är kvar av året efter i dag:",
    tabelOverskrift: "Så många dagar är kvar i varje månad",
    kolonneMaaned: "Månad",
    kolonneDageTilbage: "Dagar kvar",
    kolonneHverdage: "Vardagar kvar",
    sum: "Resten av året",
    underTabel:
      "Dagar kvar räknas från och med i dag fram till månadens sista datum, så i månaden du står i är dagens datum inte med i talet. Vardagar kvar har helger och helgdagar dragna ifrån.",
    helligdageOverskrift: "Helgdagar som fortfarande är kvar",
    helligdageTom: "Det finns inga helgdagar kvar i år.",
    afsnitDage: "Hur många dagar är det kvar av året?",
    afsnitHverdage: "Hur många arbetsdagar är det kvar av året?",
    afsnitSlutning: "När slutar året?",
    linkDato: "Datumräknare med alla fyra verktyg",
    linkDageIAaret: "Hur många dagar är det på ett år?",
    linkDageIManeden: "Hur många dagar är det i varje månad?",
    linkTimerIAaret: "Hur många timmar är det på ett år?",
    linkArbejdsdage: "Hur många arbetsdagar är det på ett år?",
    linkDageTil: "Hur många dagar är det till …?",
  },
};

/** Overskrifterne til de afsnit, der også er FAQ'ens spørgsmål. */
export interface DageTilbageAfsnit {
  overskrift: string;
  brødtekst: string;
}

/**
 * Brødteksten afhænger af dagens dato, fordi hvert tal i den regnes af samme
 * `aaretTilbage` som tabellen og svarfeltet.
 */
export function dageTilbageIAaretAfsnit(
  locale: DageTilbageLocale,
  today: Date
): DageTilbageAfsnit[] {
  const o = aaretTilbage(locale, today);
  const c = dageTilbageIAaretCopy[locale];
  const da = locale === "da";
  return [
    {
      overskrift: c.afsnitDage,
      brødtekst: da
        ? `Der er ${dagetal(o.dageTilbage, locale, "dag", "dage")} tilbage af ${o.aar} efter i dag, altså ${tal(o.uger, locale)} hele uger og ${dagetal(o.restDage, locale, "dag", "dage")}. Det er ${tal(o.timer, locale)} timer, og ${tal(o.procentForbi, locale)} % af året er allerede gået. Dagen i dag tæller ikke med — den samme regel som /dato og dage-til-siderne bruger, så tallene ikke kan modsige hinanden.`
        : `Det finns ${dagetal(o.dageTilbage, locale, "dag", "dagar")} kvar av ${o.aar} efter i dag, alltså ${tal(o.uger, locale)} hela veckor och ${dagetal(o.restDage, locale, "dag", "dagar")}. Det är ${tal(o.timer, locale)} timmar, och ${tal(o.procentForbi, locale)} % av året har redan gått. Dagens datum räknas inte med — samma regel som datumräknaren och dagarna-till-sidorna använder, så siffrorna inte kan motsäga varandra.`,
    },
    {
      overskrift: c.afsnitHverdage,
      brødtekst: da
        ? `Af de ${tal(o.dageTilbage, locale)} dage der er tilbage, er ${tal(o.hverdageTilbage, locale)} hverdage. Resten er weekender og de helligdage, der stadig falder i år.`
        : `Av de ${tal(o.dageTilbage, locale)} dagar som är kvar är ${tal(o.hverdageTilbage, locale)} vardagar. Resten är helger och de helgdagar som fortfarande faller i år.`,
    },
    {
      overskrift: c.afsnitSlutning,
      brødtekst: da
        ? `Årets sidste dag er ${formatDatoTekst(o.sidsteDagIso, locale)}, en ${o.sidsteDagUgedag}. ${o.naesteAar} starter ${formatDatoTekst(o.foersteDagIso, locale)}, som er en ${o.foersteDagUgedag}.`
        : `Årets sista dag är ${formatDatoTekst(o.sidsteDagIso, locale)}, en ${o.sidsteDagUgedag}. ${o.naesteAar} börjar ${formatDatoTekst(o.foersteDagIso, locale)}, som är en ${o.foersteDagUgedag}.`,
    },
  ];
}
