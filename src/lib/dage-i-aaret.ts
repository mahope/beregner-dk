/**
 * Siden for «hvor mange dage er der på et år» — den danske `/dage-i-aaret` og
 * den svenske `/dagar-i-aret`.
 *
 * **Hvorfor siden findes.** Målt 3/10 i Googles egen autocomplete
 * (`suggestqueries.google.com`, `hl=da&gl=dk`) er «hvor mange dage er der på et
 * år» **nr. 1** under «hvor mange dage er der», og to spørgsmål mere i samme
 * klub har ingen egen adresse: «hvor mange dage er der i augusti» (nr. 7) og
 * «hvor mange dage er der i juli» (nr. 8). Svensk spørger det samme: «hur
 * många dagar är det på ett år» (nr. 3), «… i augusti» og «… i juli». I dag
 * ligger svaret som brødtekst inde på `/dato` — siden med 136.071 GSC-visninger,
 * 1.119 besøgende/28 dage og hele 24 spørgsmål i konkurrence — så de tre
 * spørgsmål får hverken egen titel, egen adresse eller egen `<h1>`.
 *
 * **Ingen tal i teksten.** Alle dagtal, arbejdsdage, weekenddage og
 * skudårs-påstande regnes her af `aarstal()` og `maanederITaar()` fra
 * `dato-eksempler.ts` — altså af de samme funktioner `/dato` skriver sin egen
 * brødtekst med, og som `DatoBeregner` tæller med. Punkt 11 i
 * kvalitetsreglerne: en påstand i tekst er kode, så et håndskrevet «31 dage i
 * juli» er en løftefejl — præcis den fejl `/efterloen` og `/vaegttab` havde.
 */
import { aarstal, erSkudaar, maanederITaar, type MaanedRække } from "./dato-eksempler";
import { getIntlLocale } from "./format";
import { heleDageMellem, iDagPaSiden, parseIsoDato } from "./lokal-dato";

export type DageIAaretLocale = "da" | "se";

/** Sprogslaget er `da` og `se`: norsk domæne (`beregner.no`) er ikke i drift. */
export function isDageIAaretLocale(locale: string): locale is DageIAaretLocale {
  return locale === "da" || locale === "se";
}

/** Sidens egen sti i hvert sprog. Stien *er* sprogvalget. */
export const DAGE_I_AARET_PATH: Record<DageIAaretLocale, string> = {
  da: "/dage-i-aaret",
  se: "/dagar-i-aret",
};

export function getDageIAaretPath(locale: string): string | null {
  return isDageIAaretLocale(locale) ? DAGE_I_AARET_PATH[locale] : null;
}

/**
 * Et helt kalenderår, som `/dato` og denne side tæller det. `tilbage` er
 * dagene *efter* i dag til og med 31. december, så det er 0 nytårsaften — det
 * sidste døgn *er* 31. december. Det er samme konvention som
 * `dageTilbageIAaret` i `dage-til.ts`, så de to sider ikke kan svare
 * forskelligt på «hvor mange dage er der tilbage».
 */
export interface Aarsoversigt {
  aar: number;
  /** 365, eller 366 i et skudår. */
  dage: number;
  /** Sandt hvis året har 29. februar, så brødteksten ikke skal gætte det. */
  skudaar: boolean;
  /** Hverdage i hele året, helligdage og weekender trukket fra. */
  arbejdsdage: number;
  /** Lørdage og søndage i hele året. */
  weekenddage: number;
  /** De tolv måneder, hver med længde, hverdage og weekenddage. */
  maaneder: MaanedRække[];
  /** Dage efter i dag til og med 31. december. 0 nytårsaften. */
  tilbage: number;
  tilbageUger: number;
  tilbageRest: number;
  /** Det næste skudår og dets længde, så «hvornår er næste gang 366 dage?» er
   * et regnet tal og ikke en påstand. */
  naesteSkudaar: number;
  naesteSkudaarDage: number;
}

/**
 * Dagens dato læses med `iDagPaSiden`, altså i `Europe/Copenhagen` (svensk
 * `Europe/Stockholm`) — aldrig med serverens `getUTC*`. Ellers er «dage
 * tilbage» en dag forkeret mellem kl. 00 og 02, fordi UTC da er dagen før.
 */
function aarOgDag(locale: DageIAaretLocale, today: Date) {
  const iso = iDagPaSiden(today, locale);
  const iDag = parseIsoDato(iso);
  return { iso, iDag, aar: iDag ? iDag.getFullYear() : today.getFullYear() };
}

/** Året, måned for måned, med dage tilbage — regnet, aldrig skrevet. */
export function aarsoversigt(
  locale: DageIAaretLocale,
  today: Date
): Aarsoversigt {
  const { iDag, aar } = aarOgDag(locale, today);
  const aarstalet = aarstal(aar, locale);
  const maaneder = maanederITaar(aar, locale);
  const sidsteDag = parseIsoDato(`${aar}-12-31`) as Date;
  const tilbage = iDag ? heleDageMellem(iDag, sidsteDag) : 0;
  let naesteSkudaar = aar;
  while (!erSkudaar(naesteSkudaar)) naesteSkudaar += 1;
  return {
    aar,
    dage: aarstalet.dage,
    skudaar: aarstalet.skudaar,
    arbejdsdage: aarstalet.arbejdsdage,
    weekenddage: maaneder.reduce((sum, m) => sum + m.weekenddage, 0),
    maaneder,
    tilbage,
    tilbageUger: Math.floor(tilbage / 7),
    tilbageRest: tilbage % 7,
    naesteSkudaar,
    naesteSkudaarDage: aarstal(naesteSkudaar, locale).dage,
  };
}

/**
 * Tal formateret med sitets egen `getIntlLocale` — dansk grupperer med punktum,
 * svensk med mellemrum. Skrivemåden læses fra samme sted som resten af sitet.
 */
function tal(n: number, locale: DageIAaretLocale): string {
  return n.toLocaleString(getIntlLocale(locale));
}

/** «1 dag» og «17 dage» / «1 dag» og «17 dagar» — med rigtigt ental i begge. */
function dagetal(
  n: number,
  locale: DageIAaretLocale,
  ental: string,
  flertal: string
): string {
  return n === 1 ? `1 ${ental}` : `${tal(n, locale)} ${flertal}`;
}

/** Én måned udpegt med sit navn, uanset sprog. */
function maaned(
  oversigt: Aarsoversigt,
  month: number
): MaanedRække {
  const række = oversigt.maaneder[month - 1];
  if (!række) throw new Error(`Måned ${month} mangler i årsoversigten`);
  return række;
}

export interface DageIAaretSpgsg {
  question: string;
  answer: string;
}

/**
 * De tre spørgsmål som `<h2>`-afsnit og som `FAQPage`. De er de tre danske
 * autocomplete-træffere fra målingen, og **hvert svar regnes**: en ny kalender
 * eller et nyt sprog kan derfor ikke få en løfte-sætning uden at porten ser
 * det. Svarene er bygget af den samme `aarsoversigt`, som tabellen viser.
 */
export function dageIAaretFaq(
  locale: DageIAaretLocale,
  today: Date
): DageIAaretSpgsg[] {
  const o = aarsoversigt(locale, today);
  const da = locale === "da";
  const juli = maaned(o, 7);
  const august = maaned(o, 8);
  if (da) {
    return [
      {
        question: "Hvor mange dage er der på et år?",
        answer: `Et normalt kalenderår har 365 dage, og ${o.aar} er ${o.skudaar ? `et skudår med ${o.dage} dage` : `ikke et skudår og har derfor ${o.dage} dage`}. Næste skudår er ${o.naesteSkudaar} med ${o.naesteSkudaarDage} dage, fordi hvert 4. år har en 29. februar.`,
      },
      {
        question: "Hvor mange dage er der i augusti?",
        answer: `Augusti har ${august.dage} dage, og der er ${august.arbejdsdage} hverdage og ${august.weekenddage} weekenddage i måneden.`,
      },
      {
        question: "Hvor mange dage er der i juli?",
        answer: `Juli har ${juli.dage} dage, og der er ${juli.arbejdsdage} hverdage og ${juli.weekenddage} weekenddage i måneden.`,
      },
    ];
  }
  return [
    {
      question: "Hur många dagar är det på ett år?",
      answer: `Ett normalt kalenderår har 365 dagar, och ${o.aar} är ${o.skudaar ? `ett skottår med ${o.dage} dagar` : `inte ett skottår och har därför ${o.dage} dagar`}. Nästa skottår är ${o.naesteSkudaar} med ${o.naesteSkudaarDage} dagar, eftersom vart fjärde år har en 29 februari.`,
    },
    {
      question: "Hur många dagar är det i augusti?",
      answer: `Augusti har ${august.dage} dagar, och det är ${august.arbejdsdage} vardagar och ${august.weekenddage} helgdagar i månaden.`,
    },
    {
      question: "Hur många dagar är det i juli?",
      answer: `Juli har ${juli.dage} dagar, och det är ${juli.arbejdsdage} vardagar och ${juli.weekenddage} helvdagar i månaden.`,
    },
  ];
}

export interface DageIAaretCopy {
  h1: string;
  /** Titlen skal ramme spørgsmålet ordret — det er hele pointen med siden. */
  title: string;
  description: string;
  /** Uden årstal, fordi det følger dagens dato og derfor ikke må stå her. */
  lead: string;
  linkDato: string;
  linkDageTilbage: string;
  linkUgenummer: string;
  linkDageTil: string;
  linkMellem: string;
  linkArbejdsdage: string;
  /** Overskrift over tabellen med de tolv måneder. */
  tabelOverskrift: string;
  /** Kolonnehoveder — de skal være korte, de ligger i en smal tabel. */
  kolonneMaaned: string;
  kolonneDage: string;
  kolonneHverdage: string;
  kolonneWeekend: string;
  /** Summeringsrækken under tabellen. */
  sum: string;
  /** Blåt eksempelfelt. */
  eksempel: string;
  /** Forklaringen under tabellen. */
  underTabel: string;
}

/** Copy uden årstal — alle tal regnes i `aarsoversigt` og `dageIAaretFaq`. */
export const dageIAaretCopy: Record<DageIAaretLocale, DageIAaretCopy> = {
  da: {
    h1: "Hvor mange dage er der på et år?",
    title: "Hvor mange dage er der på et år? Dage i alle 12 måneder",
    description:
      "Hvor mange dage er der i hver måned? Se alle 12 måneder med dage, hverdage og weekenddage — og hvor mange dage der er tilbage af året.",
    lead:
      "Et kalenderår har 365 dage, men de tolv måneder er ikke lige lange. Her er alle 12 med dage, hverdage og weekenddage, og hvor mange dage der er tilbage af året.",
    linkDato: "Datoberegner med alle fire værktøjer",
    linkDageTilbage: "Hvor mange dage er der tilbage af året?",
    linkUgenummer: "Hvilken uge er det?",
    linkDageTil: "Hvor mange dage er der til …?",
    linkMellem: "Dage mellem to datoer",
    linkArbejdsdage: "Hvor mange arbejdsdage er der på et år?",
    tabelOverskrift: "Så mange dage har hver måned",
    kolonneMaaned: "Måned",
    kolonneDage: "Dage",
    kolonneHverdage: "Hverdage",
    kolonneWeekend: "Weekend",
    sum: "Hele året",
    eksempel: "Eksempel",
    underTabel:
      "Hverdage er de dage der ikke er weekend eller helligdag, så påske og jul giver færre hverdage end kalenderdage. Et skudår har 366 dage, fordi februar så har 29.",
  },
  se: {
    h1: "Hur många dagar är det på ett år?",
    title: "Hur många dagar är det på ett år? Dagar i alla 12 månader",
    description:
      "Hur många dagar är det i varje månad? Se alla 12 månader med dagar, vardagar och helvdagar – och hur många dagar som är kvar av året.",
    lead:
      "Ett kalenderår har 365 dagar, men de tolv månaderna är inte lika långa. Här är alla 12 med dagar, vardagar och helvdagar, och hur många dagar som är kvar av året.",
    linkDato: "Datumräknare med alla fyra verktyg",
    linkDageTilbage: "Hur många dagar är det kvar av året?",
    linkUgenummer: "Vilken vecka är det?",
    linkDageTil: "Hur många dagar är det till …?",
    linkMellem: "Dagar mellan två datum",
    linkArbejdsdage: "Hur många arbetsdagar är det på ett år?",
    tabelOverskrift: "Så många dagar har varje månad",
    kolonneMaaned: "Månad",
    kolonneDage: "Dagar",
    kolonneHverdage: "Vardagar",
    kolonneWeekend: "Helv",
    sum: "Hela året",
    eksempel: "Exempel",
    underTabel:
      "Vardagar är de dagar som inte är helg eller helgdag, så påsk och jul ger färre vardagar än kalenderdagar. Ett skottår har 366 dagar, eftersom februari då har 29.",
  },
};

/** Overskrifterne til de tre afsnit, der også er FAQ'ens spørgsmål. */
export interface DageIAaretAfsnit {
  overskrift: string;
  brødtekst: string;
}

/**
 * Brødteksten afhænger af dagens dato, fordi dens eneste tal — årets længde,
 * næste skudår og dage tilbage — skal regnes og ikke skrives.
 */
export function dageIAaretAfsnit(
  locale: DageIAaretLocale,
  today: Date
): DageIAaretAfsnit[] {
  const o = aarsoversigt(locale, today);
  const da = locale === "da";
  const tilbage = da
    ? `Der er ${dagetal(o.tilbage, locale, "dag", "dage")} tilbage af ${o.aar} efter i dag, altså ${tal(o.tilbageUger, locale)} hele uger og ${dagetal(o.tilbageRest, locale, "dag", "dage")}.`
    : `Det finns ${dagetal(o.tilbage, locale, "dag", "dagar")} kvar av ${o.aar} efter i dag, alltså ${tal(o.tilbageUger, locale)} hela veckor och ${dagetal(o.tilbageRest, locale, "dag", "dagar")}.`;
  return da
    ? [
        {
          overskrift: "Hvor mange dage er der på et år?",
          brødtekst: `Et normalt kalenderår har 365 dage, og ${o.aar} har ${o.dage} dage og ${o.arbejdsdage} hverdage. ${tilbage} Næste skudår er ${o.naesteSkudaar} med ${o.naesteSkudaarDage} dage.`,
        },
        {
          overskrift: "Hvor mange dage er der i augusti?",
          brødtekst: `Augusti er måneden med flest dage sammen med januar, juli, oktober og december, og den har ${maaned(o, 8).dage} dage. Det er ikke samme antal hverdage som resten af året, fordi helligdage og weekender falder forskelligt.`,
        },
        {
          overskrift: "Hvor mange dage er der i juli?",
          brødtekst: `Juli har ${maaned(o, 7).dage} dage. Ser du hele året på én linje, står de tolv måneder i tabellen ovenfor, og summeringen nederst er regnet af de samme tal.`,
        },
      ]
    : [
        {
          overskrift: "Hur många dagar är det på ett år?",
          brødtekst: `Ett normalt kalenderår har 365 dagar, och ${o.aar} har ${o.dage} dagar och ${o.arbejdsdage} vardagar. ${tilbage} Nästa skottår är ${o.naesteSkudaar} med ${o.naesteSkudaarDage} dagar.`,
        },
        {
          overskrift: "Hur många dagar är det i augusti?",
          brødtekst: `Augusti är månaden med flest dagar tillsammans med januari, juli, oktober och december, och den har ${maaned(o, 8).dage} dagar. Det är inte samma antal vardagar som resten av året, eftersom helgdagar och helger faller olika.`,
        },
        {
          overskrift: "Hur många dagar är det i juli?",
          brødtekst: `Juli har ${maaned(o, 7).dage} dagar. Ser du hela året på en rad står de tolv månaderna i tabellen ovan, och summan längst ner är räknad av samma siffror.`,
        },
      ];
}
