/**
 * Siden for «hvor mange timer er der på et år» — den danske `/timer-i-aret` og
 * den svenske `/timmar-i-aret`.
 *
 * **Hvorfor siden findes.** Målt 3/10 i Googles egen autocomplete
 * (`suggestqueries.google.com`, `hl=da&gl=dk`) er «hvor mange timer er der på
 * et år» **nr. 1** under «hvor mange timer er der», og de tre næste er «… på en
 * uge», «… på en måned» og «… på 2 uger». Svensk spørger det samme og bruger
 * færre sider om det: «hur många timmar är det på ett år» er **nr. 1** under
 * «hur många timmar är det», efterfulgt av «… på en vecka» och «… på en månad».
 * Svaret lå på `/tidsberegner` (72.471 GSC-visninger, 0,3 % CTR, pos. 6,8) som
 * ét afsnit blandt 24 — altså uden egen titel, egen adresse og egen `<h1>`.
 *
 * **Ingen tal i teksten.** Årets timer, månedernes timer og «timer tilbage»
 * regnes her af `aarstal()` og `maanederITaar()` fra `dato-eksempler.ts` — de
 * samme funktioner `/dato`, `/dage-i-aaret` og `DatoBeregner` tæller med.
 * Døgnet og ugen læses fra `timer-periode.ts`, som `/tidsberegner` skriver sin
 * tabel fra, så de har **én** forfatter på sitet. Der er ingen håndskrevet
 * «8.760» nogen steder: punkt 11 i kvalitetsreglerne siger, at en påstand i
 * tekst er kode, og et håndskrevet timetal er en løftefejl i det øjeblik, året
 * bliver et skudår.
 *
 * **Én forfatter pr. periode.** Kvartal og halvtår står **ikke** i tabellen:
 * `TIMER_PERIODER`s kvartal er et snit på 91,25 dage, så en række med «et
 * kvartal» ved siden af tre kalendermåneder ville give to forfattere af samme
 * ord. Månederne her er kalendermåneder og siger det i navnet.
 *
 * **Sommertid.** Et kalenderår indeholder begge skiftninger (sidste søndag i
 * marts og sidste søndag i oktober), så de to gange en time hæver sig lige igen,
 * og et helt år har altid præcis 24 timer pr. dage. Det står i `underPerioder`:
 * 8.760 timer i et normalt år og 8.784 i et skudår.
 */
import {
  aarstal,
  erSkudaar,
  maanederITaar,
  type MaanedRække,
} from "./dato-eksempler";
import { formatBelob } from "./format";
import { heleDageMellem, iDagPaSiden, parseIsoDato } from "./lokal-dato";
import { TIMER_I_DAGT, timerIPeriode } from "./timer-periode";

export type TimerLocale = "da" | "se";

/** Sprogslaget er `da` og `se`: norsk domæne (`beregner.no`) er ikke i drift. */
export function isTimerLocale(locale: string): locale is TimerLocale {
  return locale === "da" || locale === "se";
}

/** Sidens egen sti i hvert sprog. Stien *er* sprogvalget. */
export const TIMER_I_ARET_PATH: Record<TimerLocale, string> = {
  da: "/timer-i-aret",
  se: "/timmar-i-aret",
};

export function getTimerIAaretPath(locale: string): string | null {
  return isTimerLocale(locale) ? TIMER_I_ARET_PATH[locale] : null;
}

/** Timer i et døgn. Døgnet er kalenderdage, ikke soltimer. */
export const TIMER_PER_DAG = TIMER_I_DAGT;

/** Minutter i en time. */
export const MINUTTER_PER_TIME = 60;

/** Dage i en uge. */
export const DAGE_PER_UGE = 7;

/** Én periode i tabellen: et navn, sit dagtal og de timer det bliver til. */
export interface TimerRaekke {
  /**
   * Nøgle, så kaldere vælger en periode på id og ikke på dens danske tekst.
   * `maaned` findes tre gange — en pr. længde i året — og adskilles på `dage`.
   */
  id: "doegn" | "uge" | "to-uger" | "maaned" | "aar";
  navn: string;
  dage: number;
  timer: number;
  minutter: number;
}

export interface TimerOversigt {
  aar: number;
  /** 365, eller 366 i et skudår. */
  dage: number;
  timer: number;
  minutter: number;
  skudaar: boolean;
  /** Timer efter i dag til og med 31. december. */
  timerTilbage: number;
  dageTilbage: number;
  naesteSkudaar: number;
  naesteSkudaarTimer: number;
  /** De tolv måneder — samme længder som `/dage-i-aaret` viser i dage. */
  maaneder: MaanedRække[];
  /** Perioderne i hovedtabellen. */
  perioder: TimerRaekke[];
}

function dageneOgTimeren(
  id: TimerRaekke["id"],
  navn: string,
  dage: number
): TimerRaekke {
  const timer = dage * TIMER_PER_DAG;
  return { id, navn, dage, timer, minutter: timer * MINUTTER_PER_TIME };
}

/**
 * De tre forskellige måneder i året, fundet i de tolv måneders egen længde. I
 * 2026 er de 28, 30 og 31 dage; i et skudår bliver februar 29. Navnet er den
 * første måned med den længde, så tabellen ligner en kalender og ikke et gæt.
 */
function maanederMedHverLængde(maaneder: MaanedRække[]): MaanedRække[] {
  const set = new Map<number, MaanedRække>();
  for (const maaned of maaneder) {
    if (!set.has(maaned.dage)) set.set(maaned.dage, maaned);
  }
  return [...set.values()].sort((a, b) => a.dage - b.dage);
}

/** Dagens dato læses i `Europe/Copenhagen` (svensk `Europe/Stockholm`). */
function aarOgDag(locale: TimerLocale, today: Date) {
  const iso = iDagPaSiden(today, locale);
  const iDag = parseIsoDato(iso);
  return { iso, iDag, aar: iDag ? iDag.getFullYear() : today.getFullYear() };
}

/**
 * Døgnet og ugen læses fra `timer-periode.ts`, som `/tidsberegner` skriver sin
 * tabel fra. «To uger» og de tre kalendermåneder findes ikke der, så de regnes
 * her af månedernes egen længde. Årets række bruger *dagens* kalenderår, så den
 * bliver 366 dage i et skudår — og skudåret står i teksten.
 */
function perioderFor(
  maaneder: MaanedRække[],
  dageIAar: number
): TimerRaekke[] {
  const maanederI = maanederMedHverLængde(maaneder);
  return [
    dageneOgTimeren("doegn", timerIPeriode("doegn").naevn.da, 1),
    dageneOgTimeren("uge", timerIPeriode("uge").naevn.da, DAGE_PER_UGE),
    dageneOgTimeren("to-uger", "To uger", DAGE_PER_UGE * 2),
    ...maanederI.map((maaned) =>
      dageneOgTimeren("maaned", `En måned (${maaned.name})`, maaned.dage)
    ),
    dageneOgTimeren("aar", timerIPeriode("aar").naevn.da, dageIAar),
  ];
}

/** Årets timetal og alle perioder — regnet, aldrig skrevet. */
export function timerOversigt(
  locale: TimerLocale,
  today: Date
): TimerOversigt {
  const { iDag, aar } = aarOgDag(locale, today);
  const aarstalet = aarstal(aar, locale);
  const maaneder = maanederITaar(aar, locale);
  const sidsteDag = parseIsoDato(`${aar}-12-31`) as Date;
  const dageTilbage = iDag ? heleDageMellem(iDag, sidsteDag) : 0;
  let naesteSkudaar = aar;
  while (!erSkudaar(naesteSkudaar)) naesteSkudaar += 1;
  return {
    aar,
    dage: aarstalet.dage,
    timer: aarstalet.dage * TIMER_PER_DAG,
    minutter: aarstalet.dage * TIMER_PER_DAG * MINUTTER_PER_TIME,
    skudaar: aarstalet.skudaar,
    timerTilbage: dageTilbage * TIMER_PER_DAG,
    dageTilbage,
    naesteSkudaar,
    naesteSkudaarTimer: aarstal(naesteSkudaar, locale).dage * TIMER_PER_DAG,
    maaneder,
    perioder: perioderFor(maaneder, aarstalet.dage),
  };
}

/** Én periode fundet på sin nøgle, så kaldere ikke skal vælge på dansk tekst. */
export function periode(
  oversigt: TimerOversigt,
  id: TimerRaekke["id"],
  dage?: number
): TimerRaekke {
  const kandidater = oversigt.perioder.filter((p) => p.id === id);
  const fundet =
    dage === undefined ? kandidater[0] : kandidater.find((p) => p.dage === dage);
  if (!fundet) {
    throw new Error(
      `Perioden ${id}${dage === undefined ? "" : ` på ${dage} dage`} mangler i oversigten`
    );
  }
  return fundet;
}

/**
 * Timer med sitets egen `formatBelob`: dansk grupperer med punktum, svensk med
 * mellemrum. Den kaldes herfra, så «8.760» og «8 760» ikke kan blandes.
 */
export function timerTal(n: number, locale: TimerLocale): string {
  return formatBelob(n, locale);
}

/** De tolv måneder med deres timer og minutter, til månedstabellen. */
export function timerMaaneder(oversigt: TimerOversigt): {
  maaned: MaanedRække;
  timer: number;
  minutter: number;
}[] {
  return oversigt.maaneder.map((maaned) => {
    const timer = maaned.dage * TIMER_PER_DAG;
    return { maaned, timer, minutter: timer * MINUTTER_PER_TIME };
  });
}

/** Den korteste og den længste kalendermåned i året — de to svar på «en måned». */
function maanedSvar(
  oversigt: TimerOversigt
): { korteste: MaanedRække; laengste: MaanedRække } {
  const laengder = maanederMedHverLængde(oversigt.maaneder);
  return { korteste: laengder[0], laengste: laengder[laengder.length - 1] };
}

export interface TimerSpgsg {
  question: string;
  answer: string;
}

/**
 * De tre målte spørgsmål fra autocomplete, som `<h2>`-afsnit og som `FAQPage`.
 * Hvert svar regnes, så en ny kalender eller et nyt sprog ikke kan få en
 * løfte-sætning uden at porten ser den.
 */
export function timerFaq(locale: TimerLocale, today: Date): TimerSpgsg[] {
  const o = timerOversigt(locale, today);
  const enUge = periode(o, "uge");
  const { korteste, laengste } = maanedSvar(o);
  if (locale === "da") {
    return [
      {
        question: "Hvor mange timer er der på et år?",
        answer: `Et normalt kalenderår har 365 dage, og ${o.aar} har ${o.dage} dage, altså ${timerTal(o.timer, locale)} timer og ${timerTal(o.minutter, locale)} minutter. Næste skudår er ${o.naesteSkudaar} med ${timerTal(o.naesteSkudaarTimer, locale)} timer, fordi februar så har 29 dage.`,
      },
      {
        question: "Hvor mange timer er der på en uge?",
        answer: `En uge er ${DAGE_PER_UGE} dage, og et døgn er ${TIMER_PER_DAG} timer, så en uge er ${timerTal(enUge.timer, locale)} timer — ${timerTal(enUge.minutter, locale)} minutter.`,
      },
      {
        question: "Hvor mange timer er der på en måned?",
        answer: `Det afhænger af måneden: ${korteste.name} har ${korteste.dage} dage, altså ${timerTal(korteste.dage * TIMER_PER_DAG, locale)} timer, mens ${laengste.name} har ${laengste.dage} dage, altså ${timerTal(laengste.dage * TIMER_PER_DAG, locale)} timer.`,
      },
    ];
  }
  return [
    {
      question: "Hur många timmar är det på ett år?",
      answer: `Ett normalt kalenderår har 365 dagar, och ${o.aar} har ${o.dage} dagar, alltså ${timerTal(o.timer, locale)} timmar och ${timerTal(o.minutter, locale)} minuter. Nästa skottår är ${o.naesteSkudaar} med ${timerTal(o.naesteSkudaarTimer, locale)} timmar, eftersom februari då har 29 dagar.`,
    },
    {
      question: "Hur många timmar är det på en vecka?",
      answer: `En vecka är ${DAGE_PER_UGE} dagar, och ett dygn är ${TIMER_PER_DAG} timmar, så en vecka är ${timerTal(enUge.timer, locale)} timmar — ${timerTal(enUge.minutter, locale)} minuter.`,
    },
    {
      question: "Hur många timmar är det på en månad?",
      answer: `Det beror på månaden: ${korteste.name} har ${korteste.dage} dagar, alltså ${timerTal(korteste.dage * TIMER_PER_DAG, locale)} timmar, medan ${laengste.name} har ${laengste.dage} dagar, alltså ${timerTal(laengste.dage * TIMER_PER_DAG, locale)} timmar.`,
    },
  ];
}

export interface TimerCopy {
  h1: string;
  title: string;
  description: string;
  lead: string;
  linkDato: string;
  linkTidsberegner: string;
  linkDageIAaret: string;
  linkDageTil: string;
  linkDageMellem: string;
  tabelOverskrift: string;
  kolonnePeriode: string;
  kolonneDage: string;
  kolonneTimer: string;
  kolonneMinutter: string;
  maanedOverskrift: string;
  sum: string;
  eksempel: string;
  underPerioder: string;
  underMaaneder: string;
}

/** Copy uden årstal — alle tal regnes i `timerOversigt` og `timerFaq`. */
export const timerCopy: Record<TimerLocale, TimerCopy> = {
  da: {
    h1: "Hvor mange timer er der på et år?",
    title: "Hvor mange timer er der på et år? Timer i alle perioder",
    description:
      "Hvor mange timer er der på et år, en måned, en uge eller et døgn? Se alle perioder regnet om til timer og minutter.",
    lead:
      "Et kalenderår har 365 dage, og hvert døgn har 24 timer. Her er perioderne regnet om til timer og minutter — og hvor mange timer der er tilbage af året.",
    linkDato: "Datoberegner med alle fire værktøjer",
    linkTidsberegner: "Beregn en vilkårlig længde tid",
    linkDageIAaret: "Hvor mange dage er der på et år?",
    linkDageTil: "Hvor mange dage er der til …?",
    linkDageMellem: "Dage mellem to datoer",
    tabelOverskrift: "Så mange timer er der i hver periode",
    kolonnePeriode: "Periode",
    kolonneDage: "Dage",
    kolonneTimer: "Timer",
    kolonneMinutter: "Minutter",
    maanedOverskrift: "Så mange timer er der i hver måned",
    sum: "Hele året",
    eksempel: "Eksempel",
    underPerioder:
      "Et døgn er 24 timer og en uge er 7 dage, så en uge er 168 timer. Månederne er kalendermåneder, så de er 28, 30 eller 31 dage. Enkelte dage har 23 eller 25 timer, fordi Danmark skifter tid to gange om året — men over et helt år hæver de to skiftninger sig lige igen.",
    underMaaneder:
      "Månederne er hver 28, 30 eller 31 dage, så en måned er mellem 672 og 744 timer. Februar har 29 dage i et skudår, og derfor har et skudår 8.784 timer mod 8.760 i et normalt år.",
  },
  se: {
    h1: "Hur många timmar är det på ett år?",
    title: "Hur många timmar är det på ett år? Timmar i alla perioder",
    description:
      "Hur många timmar är det på ett år, en månad, en vecka eller ett dygn? Se alla perioder omräknade till timmar och minuter.",
    lead:
      "Ett kalenderår har 365 dagar, och varje dygn har 24 timmar. Här är perioderna omräknade till timmar och minuter — och hur många timmar som är kvar av året.",
    linkDato: "Datumräknare med alla fyra verktyg",
    linkTidsberegner: "Räkna ut en valfri tid",
    linkDageIAaret: "Hur många dagar är det på ett år?",
    linkDageTil: "Hur många dagar är det till …?",
    linkDageMellem: "Dagar mellan två datum",
    tabelOverskrift: "Så många timmar är det i varje period",
    kolonnePeriode: "Period",
    kolonneDage: "Dagar",
    kolonneTimer: "Timmar",
    kolonneMinutter: "Minuter",
    maanedOverskrift: "Så många timmar är det i varje månad",
    sum: "Hela året",
    eksempel: "Exempel",
    underPerioder:
      "Ett dygn är 24 timmar och en vecka är 7 dagar, så en vecka är 168 timmar. Månaderna är kalendermånader, så de är 28, 30 eller 31 dagar. Enstaka dagar har 23 eller 25 timmar, eftersom Sverige byter tid två gånger om året — men under ett helt år tar de två bytena ut varandra.",
    underMaaneder:
      "Månaderna är 28, 30 eller 31 dagar, så en månad är mellan 672 och 744 timmar. Februari har 29 dagar i ett skottår, och därför har ett skottår 8 784 timmar mot 8 760 i ett normalt år.",
  },
};

export interface TimerAfsnit {
  overskrift: string;
  brødtekst: string;
}

/** Afsnittenes brødtekst afhænger af dagens dato, fordi dens tal skal regnes. */
export function timerAfsnit(
  locale: TimerLocale,
  today: Date
): TimerAfsnit[] {
  const o = timerOversigt(locale, today);
  const enUge = periode(o, "uge");
  const { korteste, laengste } = maanedSvar(o);
  return locale === "da"
    ? [
        {
          overskrift: "Hvor mange timer er der på et år?",
          brødtekst: `${o.aar} har ${o.dage} dage, og et døgn har ${TIMER_PER_DAG} timer, så året har ${timerTal(o.timer, locale)} timer og ${timerTal(o.minutter, locale)} minutter. Næste skudår er ${o.naesteSkudaar} med ${timerTal(o.naesteSkudaarTimer, locale)} timer. Der er ${timerTal(o.timerTilbage, locale)} timer tilbage af året efter i dag.`,
        },
        {
          overskrift: "Hvor mange timer er der på en uge?",
          brødtekst: `En uge er ${DAGE_PER_UGE} dage, og ${DAGE_PER_UGE} gange ${TIMER_PER_DAG} timer er ${timerTal(enUge.timer, locale)} timer. To uger er ${timerTal(periode(o, "to-uger").timer, locale)} timer, så en halv måned med 15 dage er halvdelen af en måned.`,
        },
        {
          overskrift: "Hvor mange timer er der på en måned?",
          brødtekst: `Der er ingen måned med samme antal dage: ${korteste.name} har ${korteste.dage} dage og ${laengste.name} har ${laengste.dage} dage. Det er en forskel på ${timerTal((laengste.dage - korteste.dage) * TIMER_PER_DAG, locale)} timer mellem årets korteste og længste måned.`,
        },
      ]
    : [
        {
          overskrift: "Hur många timmar är det på ett år?",
          brødtekst: `${o.aar} har ${o.dage} dagar, och ett dygn har ${TIMER_PER_DAG} timmar, så året har ${timerTal(o.timer, locale)} timmar och ${timerTal(o.minutter, locale)} minuter. Nästa skottår är ${o.naesteSkudaar} med ${timerTal(o.naesteSkudaarTimer, locale)} timmar. Det finns ${timerTal(o.timerTilbage, locale)} timmar kvar av året efter i dag.`,
        },
        {
          overskrift: "Hur många timmar är det på en vecka?",
          brødtekst: `En vecka är ${DAGE_PER_UGE} dagar, och ${DAGE_PER_UGE} gånger ${TIMER_PER_DAG} timmar är ${timerTal(enUge.timer, locale)} timmar. Två veckor är ${timerTal(periode(o, "to-uger").timer, locale)} timmar, så en halv månad med 15 dagar är hälften av en månad.`,
        },
        {
          overskrift: "Hur många timmar är det på en månad?",
          brødtekst: `Det finns ingen månad med samma antal dagar: ${korteste.name} har ${korteste.dage} dagar och ${laengste.name} har ${laengste.dage} dagar. Det är en skillnad på ${timerTal((laengste.dage - korteste.dage) * TIMER_PER_DAG, locale)} timmar mellan årets kortaste och längsta månad.`,
        },
      ];
}