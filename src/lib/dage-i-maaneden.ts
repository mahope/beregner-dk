/**
 * Siden for «hvor mange dage er der i en måned» — den danske `/dage-i-maaneden`
 * og den svenske `/dagar-i-manaden`.
 *
 * **Hvorfor siden findes.** Målt 9/10 i Googles egen autocomplete
 * (`suggestqueries.google.com`, `hl=da&gl=dk`) har «hvor mange dage er der i
 * august», «… i juli», «… i juni», «… i september», «… i februar» som ti
 * forskellige måneder, og svensk spørger det samme: «hur många dagar är det i
 * augusti/juli/juni…». Sitet har `/dage-i-aaret` (hele året) men intet sted der
 * svarer pr. måned med hverdage og weekenddage.
 *
 * **Ingen tal i teksten.** Alle dagtal, hverdage og weekenddage regnes af
 * `maanederITaar` og `denneMaanedEksempel` fra `dato-eksempler.ts` — altså af
 * de samme funktioner `/dato` skriver sin egen brødtekst med. Punkt 11 i
 * kvalitetsreglerne: en påstand i tekst er kode.
 */
import {
  denneMaanedEksempel,
  erSkudaar,
  maanederITaar,
  type MaanedRække,
} from "./dato-eksempler";
import { getIntlLocale } from "./format";
import { iDagPaSiden, parseIsoDato } from "./lokal-dato";

export type DageIManedenLocale = "da" | "se";

export function isDageIManedenLocale(locale: string): locale is DageIManedenLocale {
  return locale === "da" || locale === "se";
}

export const DAGE_I_MAANEDEN_PATH: Record<DageIManedenLocale, string> = {
  da: "/dage-i-maaneden",
  se: "/dagar-i-manaden",
};

export function getDageIManedenPath(locale: string): string | null {
  return isDageIManedenLocale(locale) ? DAGE_I_MAANEDEN_PATH[locale] : null;
}

export interface MaanederOversigt {
  aar: number;
  /** De tolv måneder med dage, hverdage og weekenddage. */
  maaneder: MaanedRække[];
  /** Den måned læseren står i, med dage brugt og tilbage. */
  denneMaaned: ReturnType<typeof denneMaanedEksempel>;
  /** 365, eller 366 i et skudår. */
  aarDage: number;
  skudaar: boolean;
}

function aarOgDag(locale: DageIManedenLocale, today: Date) {
  const iso = iDagPaSiden(today, locale);
  const iDag = parseIsoDato(iso);
  return { iso, iDag, aar: iDag ? iDag.getFullYear() : today.getFullYear() };
}

export function maanederOversigt(
  locale: DageIManedenLocale,
  today: Date
): MaanederOversigt {
  const { iDag, aar } = aarOgDag(locale, today);
  const maaneder = maanederITaar(aar, locale);
  const denneMaaned = denneMaanedEksempel(today, locale);
  return {
    aar,
    maaneder,
    denneMaaned,
    aarDage: maaneder.reduce((sum, m) => sum + m.dage, 0),
    skudaar: erSkudaar(aar),
  };
}

function tal(n: number, locale: DageIManedenLocale): string {
  return n.toLocaleString(getIntlLocale(locale));
}

function dagetal(
  n: number,
  locale: DageIManedenLocale,
  ental: string,
  flertal: string
): string {
  return n === 1 ? `1 ${ental}` : `${tal(n, locale)} ${flertal}`;
}

export interface DageIManedenSpgsg {
  question: string;
  answer: string;
}

export function dageIManedenFaq(
  locale: DageIManedenLocale,
  today: Date
): DageIManedenSpgsg[] {
  const o = maanederOversigt(locale, today);
  const da = locale === "da";
  const februar = o.maaneder[1];
  const juli = o.maaneder[6];
  const august = o.maaneder[7];
  if (da) {
    return [
      {
        question: "Hvor mange dage er der i februar?",
        answer: `Februar har ${februar.dage} dage i ${o.aar}, fordi ${o.aar} ${o.skudaar ? "er et skudår" : "ikke er et skudår"}. I et skudår har februar 29 dage, og i et normalt år har den 28.`,
      },
      {
        question: "Hvor mange dage er der i juli?",
        answer: `Juli har ${juli.dage} dage, og der er ${juli.arbejdsdage} hverdage og ${juli.weekenddage} weekenddage i måneden.`,
      },
      {
        question: "Hvor mange dage er der i augusti?",
        answer: `Augusti har ${august.dage} dage, og der er ${august.arbejdsdage} hverdage og ${august.weekenddage} weekenddage i måneden.`,
      },
    ];
  }
  return [
    {
      question: "Hur många dagar är det i februari?",
      answer: `Februari har ${februar.dage} dagar i ${o.aar}, eftersom ${o.aar} ${o.skudaar ? "är ett skottår" : "inte är ett skottår"}. I ett skottår har februari 29 dagar, och i ett normalt år har den 28.`,
    },
    {
      question: "Hur många dagar är det i juli?",
      answer: `Juli har ${juli.dage} dagar, och det är ${juli.arbejdsdage} vardagar och ${juli.weekenddage} helgdagar i månaden.`,
    },
    {
      question: "Hur många dagar är det i augusti?",
      answer: `Augusti har ${august.dage} dagar, och det är ${august.arbejdsdage} vardagar och ${august.weekenddage} helgdagar i månaden.`,
    },
  ];
}

export interface DageIManedenCopy {
  h1: string;
  title: string;
  description: string;
  lead: string;
  linkDato: string;
  linkDageIAaret: string;
  linkDageTil: string;
  linkMellem: string;
  tabelOverskrift: string;
  kolonneMaaned: string;
  kolonneDage: string;
  kolonneHverdage: string;
  kolonneWeekend: string;
  sum: string;
  eksempel: string;
  underTabel: string;
}

export const dageIManedenCopy: Record<DageIManedenLocale, DageIManedenCopy> = {
  da: {
    h1: "Hvor mange dage er der i en måned?",
    title: "Hvor mange dage er der i en måned? Alle 12 måneder",
    description:
      "Hvor mange dage er der i hver måned? Se alle 12 måneder med dage, hverdage og weekenddage — og hvor mange dage der er tilbage af denne måned.",
    lead:
      "De tolv måneder er ikke lige lange: syv har 31 dage, fire har 30, og februar har 28 — eller 29 i et skudår. Her er alle 12 med dage, hverdage og weekenddage.",
    linkDato: "Datoberegner med alle fire værktøjer",
    linkDageIAaret: "Hvor mange dage er der på et år?",
    linkDageTil: "Hvor mange dage er der til …?",
    linkMellem: "Dage mellem to datoer",
    tabelOverskrift: "Så mange dage har hver måned",
    kolonneMaaned: "Måned",
    kolonneDage: "Dage",
    kolonneHverdage: "Hverdage",
    kolonneWeekend: "Weekend",
    sum: "Hele året",
    eksempel: "Denne måned",
    underTabel:
      "Hverdage er de dage der ikke er weekend eller helligdag. Et skudår har 366 dage, fordi februar så har 29.",
  },
  se: {
    h1: "Hur många dagar är det i en månad?",
    title: "Hur många dagar är det i en månad? Alla 12 månader",
    description:
      "Hur många dagar är det i varje månad? Se alla 12 månader med dagar, vardagar och helgdagar – och hur många dagar som är kvar av denna månad.",
    lead:
      "De tolv månaderna är inte lika långa: sju har 31 dagar, fyra har 30, och februari har 28 – eller 29 i ett skottår. Här är alla 12 med dagar, vardagar och helgdagar.",
    linkDato: "Datumräknare med alla fyra verktyg",
    linkDageIAaret: "Hur många dagar är det på ett år?",
    linkDageTil: "Hur många dagar är det till …?",
    linkMellem: "Dagar mellan två datum",
    tabelOverskrift: "Så många dagar har varje månad",
    kolonneMaaned: "Månad",
    kolonneDage: "Dagar",
    kolonneHverdage: "Vardagar",
    kolonneWeekend: "Helv",
    sum: "Hela året",
    eksempel: "Denna månad",
    underTabel:
      "Vardagar är de dagar som inte är helg eller helgdag. Ett skottår har 366 dagar, eftersom februari då har 29.",
  },
};

export interface DageIManedenAfsnit {
  overskrift: string;
  brødtekst: string;
}

export function dageIManedenAfsnit(
  locale: DageIManedenLocale,
  today: Date
): DageIManedenAfsnit[] {
  const o = maanederOversigt(locale, today);
  const da = locale === "da";
  const februar = o.maaneder[1];
  const juli = o.maaneder[6];
  const august = o.maaneder[7];
  const dm = o.denneMaaned;
  const dmTal = da
    ? `${dm.name} har ${dm.dage} dage, og der er ${dagetal(dm.dageTilbage, locale, "dag", "dage")} tilbage af måneden efter i dag.`
    : `${dm.name} har ${dm.dage} dagar, och det finns ${dagetal(dm.dageTilbage, locale, "dag", "dagar")} kvar av månaden efter i dag.`;
  return da
    ? [
        {
          overskrift: "Hvor mange dage er der i februar?",
          brødtekst: `Februar er den korteste måned med ${februar.dage} dage i ${o.aar}. I et skudår har februar 29 dage, fordi året så har 366 dage i stedet for 365.`,
        },
        {
          overskrift: "Hvor mange dage er der i juli?",
          brødtekst: `Juli har ${juli.dage} dage, og der er ${juli.arbejdsdage} hverdage og ${juli.weekenddage} weekenddage i måneden.`,
        },
        {
          overskrift: "Hvor mange dage er der i augusti?",
          brødtekst: `Augusti har ${august.dage} dage, og der er ${august.arbejdsdage} hverdage og ${august.weekenddage} weekenddage i måneden.`,
        },
        {
          overskrift: "Hvor mange dage er der i denne måned?",
          brødtekst: dmTal,
        },
      ]
    : [
        {
          overskrift: "Hur många dagar är det i februari?",
          brødtekst: `Februari är den kortaste månaden med ${februar.dage} dagar i ${o.aar}. I ett skottår har februari 29 dagar, eftersom året då har 366 dagar istället för 365.`,
        },
        {
          overskrift: "Hur många dagar är det i juli?",
          brødtekst: `Juli har ${juli.dage} dagar, och det är ${juli.arbejdsdage} vardagar och ${juli.weekenddage} helgdagar i månaden.`,
        },
        {
          overskrift: "Hur många dagar är det i augusti?",
          brødtekst: `Augusti har ${august.dage} dagar, och det är ${august.arbejdsdage} vardagar och ${august.weekenddage} helgdagar i månaden.`,
        },
        {
          overskrift: "Hur många dagar är det i denna månad?",
          brødtekst: dmTal,
        },
      ];
}
