/**
 * Siden for «hvor mange arbejdsdage er der på et år» — den danske
 * `/arbejdsdage` og den svenske `/arbetsdagar`.
 *
 * **Hvorfor siden findes.** Målt 8/10 i Googles egen autocomplete
 * (`suggestqueries.google.com`, `hl=da&gl=dk`) er «hvor mange arbejdsdage er
 * der på et år» **nr. 1** under «hvor mange arbejdsdage», og ni træffere mere
 * spørger om det samme med et andet ord: «… i 2026», «… på en måned», «… i
 * 2025», «… i 2027», «… i gennemsnit på en måned», «… tilbage i 2026», «… i
 * august 2026» og «… på et år minus ferie». Svensk gentager mønsteret:
 * «hur många arbetsdagar på ett år», «… på en månad», «… 2026» og «… juni
 * 2026». Ordene «arbejdsdage» og «arbetsdagar» fandtes ikke som overskrift,
 * titel eller adresse nogen steder på sitet: `/dage-i-aaret` kalder de samme
 * dage «hverdage»/«vardagar», så søgningen med det rigtige ord havde ingen
 * side.
 *
 * **Ingen tal i teksten.** Arbejdsdagene, weekenderne og helligdagene regnes
 * af `aarstal()` og `maanederITaar()` fra `dato-eksempler.ts` og af
 * `taellArbejdsdage`/`taellWeekender`/`taellHelligdage` fra `helligdage.ts` —
 * de samme funktioner `/dato`, `/dage-i-aaret` og `DatoBeregner` tæller med.
 * Der er ingen håndskrevet «252» nogen steder: punkt 11 i kvalitetsreglerne
 * siger, at en påstand i tekst er kode, og et håndskrevet dagtal er en
 * løftefejl i det øjeblik, kalenderen skifter år.
 *
 * **Arbejdsdag eller hverdag?** Sitet bruger «hverdage» om de dage, der
 * hverken er weekend eller helligdag, og `helligdage.ts` lægger nytårsaften
 * oveni som en ikke-arbejdsdag. Denne side kalder dem «arbejdsdage», fordi det
 * er det ord, folk søger med — men det er præcis de samme dage, samme
 * funktion, så de to sider kan ikke svare forskelligt på samme år.
 */
import {
  aarstal,
  maanederITaar,
  type MaanedRække,
} from "./dato-eksempler";
import { getIntlLocale } from "./format";
import { iDagPaSiden, parseIsoDato } from "./lokal-dato";
import {
  taellArbejdsdage,
  taellHelligdage,
  taellHelligdagePaaHverdag,
  taellNytarsaften,
  taellWeekender,
} from "./helligdage";

export type ArbejdsdageLocale = "da" | "se";

/** Sprogslaget er `da` og `se`: norsk domæne (`beregner.no`) er ikke i drift. */
export function isArbejdsdageLocale(
  locale: string
): locale is ArbejdsdageLocale {
  return locale === "da" || locale === "se";
}

/** Sidens egen sti i hvert sprog. Stien *er* sprogvalget. */
export const ARBEJDSDAGE_PATH: Record<ArbejdsdageLocale, string> = {
  da: "/arbejdsdage",
  se: "/arbetsdagar",
};

export function getArbejdsdagePath(locale: string): string | null {
  return isArbejdsdageLocale(locale) ? ARBEJDSDAGE_PATH[locale] : null;
}

/** En arbejdsuge er fem dage. Ferieloven giver ret til fem ugers ferie. */
export const DAGE_PER_UGE = 5;

/** Ferieugerne, der er regnet med i tabellen for «et år minus ferie». */
export const FERIEUGER = [5, 6] as const;

export interface FerieRaekke {
  /** Antal ferieuger rækken dækker. */
  uger: number;
  /** Ferieugerne omregnet til arbejdsdage, fem pr. uge. */
  dage: number;
  /** Arbejdsdage tilbage i året, når ferien er trukket fra. Aldrig negativ. */
  arbejdsdage: number;
}

/**
 * En måned som denne side viser den: `MaanedRække` fra `dato-eksempler.ts`
 * plus månedens eget helligdagstal. Helligdage er ikke en del af
 * `MaanedRække`, fordi `/dage-i-aaret` ikke har den kolonne — den lægges på
 * her, så de to sider stadig har **én** forfatter til arbejdsdagene.
 */
export interface ArbejdsdageMaaned extends MaanedRække {
  /** Officielle helligdage i måneden. En helligdag i weekenden tælles også
   * med i `weekenddage`. */
  helligdage: number;
}

export interface ArbejdsdageOversigt {
  aar: number;
  /** Kalenderdage i året — 365, eller 366 i et skudår. */
  dage: number;
  skudaar: boolean;
  /** Arbejdsdage i hele året, uden weekender og helligdage. */
  arbejdsdage: number;
  /** Lørdage og søndage i hele året. */
  weekenddage: number;
  /** Officielle helligdage i hele året. En helligdag i weekenden tælles også
   * med i `weekenddage`, så de to kolonner kan ikke lægges sammen til `dage`. */
  helligdage: number;
  /** Arbejdsdage fra i dag til og med 31. december. 0 nytårsaften. */
  arbejdsdageTilbage: number;
  /** Arbejdsdage pr. måned i gennemsnit, afrundet — «på en måned»-søgningen. */
  arbejdsdagePrMaaned: number;
  /** De tolv måneder med dage, arbejdsdage, weekenddage og helligdage. */
  maaneder: ArbejdsdageMaaned[];
  /** «Et år minus ferie» for de ferieuger, folk holder mest. */
  ferie: FerieRaekke[];
}

/**
 * Dagens dato læses med `iDagPaSiden`, altså i `Europe/Copenhagen` (svensk
 * `Europe/Stockholm`) — aldrig med serverens `getUTC*`. Ellers er
 * «arbejdsdage tilbage» en dag forkert mellem kl. 00 og 02, fordi UTC da er
 * dagen før.
 */
function aarOgDag(locale: ArbejdsdageLocale, today: Date) {
  const iso = iDagPaSiden(today, locale);
  const iDag = parseIsoDato(iso);
  return { iDag, aar: iDag ? iDag.getFullYear() : today.getFullYear() };
}

/** Årets arbejdsdage, weekender og helligdage — regnet, aldrig skrevet. */
export function arbejdsdageOversigt(
  locale: ArbejdsdageLocale,
  today: Date
): ArbejdsdageOversigt {
  const { iDag, aar } = aarOgDag(locale, today);
  const aarstalet = aarstal(aar, locale);
  const maaneder: ArbejdsdageMaaned[] = maanederITaar(aar, locale).map(
    (maaned) => ({
      ...maaned,
      helligdage: taellHelligdage(
        new Date(aar, maaned.month - 1, 1),
        new Date(aar, maaned.month, 0),
        locale
      ),
    })
  );
  const foerste = new Date(aar, 0, 1);
  const sidste = new Date(aar, 11, 31);
  const arbejdsdageTilbage = iDag
    ? taellArbejdsdage(iDag, sidste, locale)
    : 0;
  return {
    aar,
    dage: aarstalet.dage,
    skudaar: aarstalet.skudaar,
    arbejdsdage: aarstalet.arbejdsdage,
    weekenddage: taellWeekender(foerste, sidste),
    helligdage: taellHelligdage(foerste, sidste, locale),
    arbejdsdageTilbage,
    arbejdsdagePrMaaned: Math.round(aarstalet.arbejdsdage / 12),
    maaneder,
    ferie: FERIEUGER.map((uger) => {
      const dage = uger * DAGE_PER_UGE;
      return {
        uger,
        dage,
        arbejdsdage: Math.max(0, aarstalet.arbejdsdage - dage),
      };
    }),
  };
}

/** Tal formateret med sitets egen `getIntlLocale` — dansk med punktum. */
function tal(n: number, locale: ArbejdsdageLocale): string {
  return n.toLocaleString(getIntlLocale(locale));
}

/** «1 dag» og «17 dage» / «1 dag» och «17 dagar» — med rigtigt ental. */
function dagetal(
  n: number,
  locale: ArbejdsdageLocale,
  ental: string,
  flertal: string
): string {
  return n === 1 ? `1 ${ental}` : `${tal(n, locale)} ${flertal}`;
}

export interface ArbejdsdageFaq {
  question: string;
  answer: string;
}

/**
 * De fire spørgsmål som FAQ og som `FAQPage`. De er fire af de målte
 * autocomplete-træffere, og **hvert svar regnes** af den samme
 * `arbejdsdageOversigt`, som tabellen viser, så et nyt år ikke kan give en
 * løfte-sætning.
 */
export function arbejdsdageFaq(
  locale: ArbejdsdageLocale,
  today: Date
): ArbejdsdageFaq[] {
  const o = arbejdsdageOversigt(locale, today);
  const da = locale === "da";
  const ferie = o.ferie[0];
  if (da) {
    const helligdageHverdag = taellHelligdagePaaHverdag(
      new Date(o.aar, 0, 1),
      new Date(o.aar, 11, 31),
      "da"
    );
    const nytarsaften = taellNytarsaften(
      new Date(o.aar, 0, 1),
      new Date(o.aar, 11, 31)
    );
    return [
      {
        question: "Hvor mange arbejdsdage er der på et år?",
        answer: `${o.aar} har ${tal(o.arbejdsdage, locale)} arbejdsdage, når weekender og helligdage er trukket fra. Året har ${tal(o.dage, locale)} kalenderdage, og forskellen er ${dagetal(o.weekenddage, locale, "weekenddag", "weekenddage")}, ${dagetal(helligdageHverdag, locale, "helligdag", "helligdage")} der falder på hverdage og ${dagetal(nytarsaften, locale, "nytårsaften", "nytårsaftener")}.`,
      },
      {
        question: "Hvor mange arbejdsdage er der tilbage i år?",
        answer: `Fra i dag til og med 31. december er der ${dagetal(o.arbejdsdageTilbage, locale, "arbejdsdag", "arbejdsdage")} tilbage af ${o.aar}. Tallet tæller helligdage og weekender fra, men tæller i dag med, hvis i dag er en arbejdsdag.`,
      },
      {
        question: "Hvor mange arbejdsdage er der på en måned?",
        answer: `I gennemsnit har en måned i ${o.aar} ${tal(o.arbejdsdagePrMaaned, locale)} arbejdsdage, når ${tal(o.arbejdsdage, locale)} arbejdsdage deles med 12 måneder. Månederne er ikke lige lange: januar og februar har typisk flest arbejdsdage, mens december har færrest, fordi jul og nytår falder der.`,
      },
      {
        question: "Hvor mange arbejdsdage er der på et år minus ferie?",
        answer: `Holder du ${ferie.uger} ugers ferie — ${ferie.dage} arbejdsdage — har du ${tal(ferie.arbejdsdage, locale)} arbejdsdage tilbage af ${o.aar}. Ferieloven giver ret til fem ugers ferie, altså 25 arbejdsdage, så det er det tal, tabellen ovenfor regner med først.`,
      },
    ];
  }
  const helligdageHverdagSe = taellHelligdagePaaHverdag(
    new Date(o.aar, 0, 1),
    new Date(o.aar, 11, 31),
    "se"
  );
  const nytarsaftenSe = taellNytarsaften(
    new Date(o.aar, 0, 1),
    new Date(o.aar, 11, 31)
  );
  return [
    {
      question: "Hur många arbetsdagar är det på ett år?",
      answer: `${o.aar} har ${tal(o.arbejdsdage, locale)} arbetsdagar, när helger och helgdagar är borträknade. Året har ${tal(o.dage, locale)} kalenderdagar, och skillnaden är ${dagetal(o.weekenddage, locale, "helg", "helger")}, ${dagetal(helligdageHverdagSe, locale, "helgdag", "helgdagar")} som faller på vardagar och ${dagetal(nytarsaftenSe, locale, "nyårsafton", "nyårsaftnar")}.`,
    },
    {
      question: "Hur många arbetsdagar är det kvar i år?",
      answer: `Från i dag till och med 31 december är det ${dagetal(o.arbejdsdageTilbage, locale, "arbetsdag", "arbetsdagar")} kvar av ${o.aar}. Talet räknar bort helger och helgdagar men räknar med i dag, om i dag är en arbetsdag.`,
    },
    {
      question: "Hur många arbetsdagar är det på en månad?",
      answer: `I genomsnitt har en månad i ${o.aar} ${tal(o.arbejdsdagePrMaaned, locale)} arbetsdagar, när ${tal(o.arbejdsdage, locale)} arbetsdagar delas med 12 månader. Månaderna är inte lika långa: januari och februari har oftast flest arbetsdagar, medan december har färst, eftersom jul och nyår infaller då.`,
    },
    {
      question: "Hur många arbetsdagar är det på ett år minus semester?",
      answer: `Tar du ${ferie.uger} veckors semester — ${ferie.dage} arbetsdagar — har du ${tal(ferie.arbejdsdage, locale)} arbetsdagar kvar av ${o.aar}. Semesterlagen ger rätt till fem veckors semester, alltså 25 arbetsdagar, så det är talet tabellen ovan räknar med först.`,
    },
  ];
}

export interface ArbejdsdageCopy {
  h1: string;
  /** Titlen skal ramme søgningen ordret — det er hele pointen med siden. */
  title: string;
  description: string;
  /** Uden årstal, fordi det følger dagens dato og derfor ikke må stå her. */
  lead: string;
  tabelOverskrift: string;
  kolonneMaaned: string;
  kolonneArbejdsdage: string;
  kolonneWeekend: string;
  kolonneHelligdage: string;
  sum: string;
  eksempel: string;
  underTabel: string;
  ferieOverskrift: string;
  ferieKolonneUger: string;
  ferieKolonneDage: string;
  ferieKolonneTilbage: string;
  ferieUnderTabel: string;
  linkDageIAaret: string;
  linkDato: string;
  linkTimer: string;
  linkHelligdage: string;
}

/** Copy uden årstal — alle tal regnes i `arbejdsdageOversigt` og FAQ'en. */
export const arbejdsdageCopy: Record<ArbejdsdageLocale, ArbejdsdageCopy> = {
  da: {
    h1: "Hvor mange arbejdsdage er der på et år?",
    title: "Hvor mange arbejdsdage er der på et år? Se alle 12 måneder",
    description:
      "Se hvor mange arbejdsdage året har, hvor mange der er tilbage, og hvor mange arbejdsdage hver måned har, når weekender og helligdage er trukket fra.",
    lead:
      "Et år har 365 dage, men kun omkring 250 arbejdsdage. Her kan du se, hvor mange arbejdsdage året har, hvor mange der er tilbage, og hvor mange hver måned har.",
    tabelOverskrift: "Arbejdsdage i hver måned",
    kolonneMaaned: "Måned",
    kolonneArbejdsdage: "Arbejdsdage",
    kolonneWeekend: "Weekend",
    kolonneHelligdage: "Helligdage",
    sum: "Hele året",
    eksempel: "Regnet af dagens dato",
    underTabel:
      "En arbejdsdag er en dag, der hverken er weekend eller helligdag. En helligdag, der falder i en weekend, tælles med i begge kolonner — derfor kan de tre kolonner tilsammen give flere dage end måneden har.",
    ferieOverskrift: "Et år minus ferie",
    ferieKolonneUger: "Ferie",
    ferieKolonneDage: "Feriedage",
    ferieKolonneTilbage: "Arbejdsdage tilbage",
    ferieUnderTabel:
      "Ferieloven giver ret til fem ugers ferie, altså 25 arbejdsdage. En arbejdsuge regnes her som fem dage.",
    linkDageIAaret: "Dage i året, måned for måned",
    linkDato: "Datoberegner",
    linkTimer: "Timer i året",
    linkHelligdage: "Helligdage med dato og ugedag",
  },
  se: {
    h1: "Hur många arbetsdagar är det på ett år?",
    title: "Hur många arbetsdagar är det på ett år? Se alla 12 månader",
    description:
      "Se hur många arbetsdagar året har, hur många som är kvar, och hur många arbetsdagar varje månad har, när helger och helgdagar är borträknade.",
    lead:
      "Ett år har 365 dagar, men bara omkring 250 arbetsdagar. Här ser du hur många arbetsdagar året har, hur många som är kvar, och hur många varje månad har.",
    tabelOverskrift: "Arbetsdagar i varje månad",
    kolonneMaaned: "Månad",
    kolonneArbejdsdage: "Arbetsdagar",
    kolonneWeekend: "Helg",
    kolonneHelligdage: "Helgdagar",
    sum: "Hela året",
    eksempel: "Räknat från dagens datum",
    underTabel:
      "En arbetsdag är en dag som varken är helg eller helgdag. En helgdag som infaller på en helg räknas i båda kolumnerna — därför kan de tre kolumnerna tillsammans ge fler dagar än månaden har.",
    ferieOverskrift: "Ett år minus semester",
    ferieKolonneUger: "Semester",
    ferieKolonneDage: "Semesterdagar",
    ferieKolonneTilbage: "Arbetsdagar kvar",
    ferieUnderTabel:
      "Semesterlagen ger rätt till fem veckors semester, alltså 25 arbetsdagar. En arbetsvecka räknas här som fem dagar.",
    linkDageIAaret: "Dagar i året, månad för månad",
    linkDato: "Datumräknare",
    linkTimer: "Timmar i året",
    linkHelligdage: "Helgdagar med datum och veckodag",
  },
};
