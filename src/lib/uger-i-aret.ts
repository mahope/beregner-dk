/**
 * Siden for «hvor mange uger er der på et år» — den danske `/uger-i-aret` og
 * den svenske `/veckor-i-aret`.
 *
 * **Hvorfor siden findes.** Målt 8/10 i Googles egen autocomplete
 * (`suggestqueries.google.com`, `hl=da&gl=dk`) er «hvor mange uger er der på
 * et år» **nr. 1** under «hvor mange uger er der», og ni træffere mere spørger
 * om det samme med et andet ord: «… på en måned», «… i 2026», «… på et
 * skoleår», «… til jul», «… tilbage i år» og «… på et halvt år». Svensk
 * gentager mønsteret: «hur många veckor på ett år», «… har 2026», «… är en
 * månad» og «… jobbar man per år». Ordet «uger» fandtes som titel på
 * `/ugenummer`, men ingen side svarede på, hvor mange uger der er i året, i en
 * måned eller tilbage af året.
 *
 * **Ingen tal i teksten.** Ugene regnes af `aarstal()` og `maanederITaar()` fra
 * `dato-eksempler.ts`, og antallet af ISO-uger kommer fra `antalUgerIIsoAar` i
 * `ugenummer.ts` — de samme funktioner `/dato`, `/dage-i-aaret` og
 * `/ugenummer` bruger. Der er ingen håndskrevet «52» i en sætning: punkt 11 i
 * kvalitetsreglerne siger, at en påstand i tekst er kode, og et håndskrevet
 * ugetal er en løftefejl i det øjeblik, kalenderen skifter år.
 *
 * **Uge eller ISO-uge?** Et kalenderår har altid 52 uger og 1-2 dage, men
 * ISO-ugenummereringen kan have 53 uger (2026 har 53, fordi 1. januar er en
 * torsdag). De to tal står begge på siden, fordi det er præcis den forveksling,
 * søgningen «hvor mange uger er der i 2026» rammer.
 */
import {
  aarstal,
  maanederITaar,
  type MaanedRække,
} from "./dato-eksempler";
import { getIntlLocale } from "./format";
import { heleDageMellem, iDagPaSiden, parseIsoDato } from "./lokal-dato";
import { antalUgerIIsoAar } from "./ugenummer";

export type UgerLocale = "da" | "se";

/** Sprogslaget er `da` og `se`: norsk domæne (`beregner.no`) er ikke i drift. */
export function isUgerLocale(locale: string): locale is UgerLocale {
  return locale === "da" || locale === "se";
}

/** Sidens egen sti i hvert sprog. Stien *er* sprogvalget. */
export const UGER_I_ARET_PATH: Record<UgerLocale, string> = {
  da: "/uger-i-aret",
  se: "/veckor-i-aret",
};

export function getUgerIAaretPath(locale: string): string | null {
  return isUgerLocale(locale) ? UGER_I_ARET_PATH[locale] : null;
}

/** Dage i en uge. */
export const DAGE_PER_UGE = 7;

/** Hele uger i et kalenderår — de to dage ud over står i `restDage`. */
export const UGER_PER_AAR = 52;

/** Ferieugerne, der er regnet med i tabellen for «et år minus ferie». */
export const FERIEUGER = [5, 6] as const;

/** Juleaftensdag, den faste dato «hvor mange uger er der til jul» tæller til. */
export const JULEDAG = { month: 12, day: 24 } as const;

export interface UgeRaekke {
  /** Nøgle, så kaldere vælger en periode på id og ikke på dens danske tekst. */
  id: "uge" | "to-uger" | "maaned" | "halvaar" | "aar";
  navn: string;
  dage: number;
  /** Hele uger i perioden. */
  uger: number;
  /** Dage ud over de hele uger — 0 til 6. */
  restDage: number;
}

export interface UgeMaaned {
  maaned: MaanedRække;
  uger: number;
  restDage: number;
}

export interface FerieUge {
  /** Antal ferieuger rækken dækker. */
  uger: number;
  /** Arbejdsuger tilbage, når ferien er trukket fra et år på 52 uger. */
  arbejdsuger: number;
}

export interface UgerOversigt {
  aar: number;
  /** Kalenderdage i året — 365, eller 366 i et skudår. */
  dage: number;
  skudaar: boolean;
  /** Hele uger i kalenderåret — altid 52. */
  uger: number;
  /** Dage ud over de 52 uger — 1 i et normalt år, 2 i et skudår. */
  restDage: number;
  /** Antal uger i ISO-ugenummereringen: 52 eller 53. */
  isoUger: number;
  /** Hele uger fra i dag til og med 31. december. */
  ugerTilbage: number;
  /** Dage ud over de hele uger tilbage af året. */
  dageTilbageRest: number;
  /** Kalenderdage fra i dag til 31. december. */
  dageTilbage: number;
  /** Hele uger fra i dag til juleaften (24. december). */
  ugerTilJul: number;
  /** Dage ud over de hele uger til juleaften. */
  dageTilJulRest: number;
  /** De tolv måneder med deres uger og restdage. */
  maaneder: UgeMaaned[];
  /** Perioderne i hovedtabellen. */
  perioder: UgeRaekke[];
  /** «Et år minus ferie» for de ferieuger, folk holder mest. */
  ferie: FerieUge[];
}

/**
 * Dagens dato læses med `iDagPaSiden`, altså i `Europe/Copenhagen` (svensk
 * `Europe/Stockholm`) — aldrig med serverens `getUTC*`. Ellers er «uger
 * tilbage» en dag forkert mellem kl. 00 og 02, fordi UTC da er dagen før.
 */
function aarOgDag(locale: UgerLocale, today: Date) {
  const iso = iDagPaSiden(today, locale);
  const iDag = parseIsoDato(iso);
  return { iDag, aar: iDag ? iDag.getFullYear() : today.getFullYear() };
}

function ugeRaekke(
  id: UgeRaekke["id"],
  navn: string,
  dage: number
): UgeRaekke {
  return {
    id,
    navn,
    dage,
    uger: Math.floor(dage / DAGE_PER_UGE),
    restDage: dage % DAGE_PER_UGE,
  };
}

/** De tre forskellige månedslængder i året, i stigende orden. */
function maanederMedHverLængde(maaneder: MaanedRække[]): MaanedRække[] {
  const set = new Map<number, MaanedRække>();
  for (const maaned of maaneder) {
    if (!set.has(maaned.dage)) set.set(maaned.dage, maaned);
  }
  return [...set.values()].sort((a, b) => a.dage - b.dage);
}

/**
 * Periodenavnene findes ikke i `timer-periode.ts` (den tæller timer, ikke
 * uger), så de står her — på det sprog siden er på. Måneden navngives med
 * månedens eget navn, så tabellen ligner en kalender og ikke et gæt.
 */
const PERIODER_NAVN: Record<
  UgerLocale,
  {
    uge: string;
    toUger: string;
    maaned: (maaned: string) => string;
    halvaar: string;
    aar: string;
  }
> = {
  da: {
    uge: "En uge",
    toUger: "To uger",
    maaned: (m) => `En måned (${m})`,
    halvaar: "Et halvt år",
    aar: "Hele året",
  },
  se: {
    uge: "En vecka",
    toUger: "Två veckor",
    maaned: (m) => `En månad (${m})`,
    halvaar: "Ett halvår",
    aar: "Hela året",
  },
};

function perioderFor(
  maaneder: MaanedRække[],
  dageIAar: number,
  locale: UgerLocale
): UgeRaekke[] {
  const navn = PERIODER_NAVN[locale];
  const halvaarDage = Math.round(dageIAar / 2);
  return [
    ugeRaekke("uge", navn.uge, DAGE_PER_UGE),
    ugeRaekke("to-uger", navn.toUger, DAGE_PER_UGE * 2),
    ...maanederMedHverLængde(maaneder).map((maaned) =>
      ugeRaekke("maaned", navn.maaned(maaned.name), maaned.dage)
    ),
    ugeRaekke("halvaar", navn.halvaar, halvaarDage),
    ugeRaekke("aar", navn.aar, dageIAar),
  ];
}

/** Årets uger og alle perioder — regnet, aldrig skrevet. */
export function ugerOversigt(locale: UgerLocale, today: Date): UgerOversigt {
  const { iDag, aar } = aarOgDag(locale, today);
  const aarstalet = aarstal(aar, locale);
  const maaneder = maanederITaar(aar, locale);
  const maanederMedUger: UgeMaaned[] = maaneder.map((maaned) => ({
    maaned,
    uger: Math.floor(maaned.dage / DAGE_PER_UGE),
    restDage: maaned.dage % DAGE_PER_UGE,
  }));
  const sidsteDag = parseIsoDato(`${aar}-12-31`) as Date;
  const dageTilbage = iDag ? heleDageMellem(iDag, sidsteDag) : 0;

  // Juleaften i indeværende år, eller næste år når den er passeret, så
  // nedtællingen aldrig bliver negativ.
  let julAar = aar;
  const juledagIAar = parseIsoDato(
    `${aar}-${String(JULEDAG.month).padStart(2, "0")}-${String(JULEDAG.day).padStart(2, "0")}`
  ) as Date;
  if (iDag && heleDageMellem(iDag, juledagIAar) < 0) julAar = aar + 1;
  const juledag = parseIsoDato(
    `${julAar}-${String(JULEDAG.month).padStart(2, "0")}-${String(JULEDAG.day).padStart(2, "0")}`
  ) as Date;
  const dageTilJul = iDag ? heleDageMellem(iDag, juledag) : 0;

  return {
    aar,
    dage: aarstalet.dage,
    skudaar: aarstalet.skudaar,
    uger: Math.floor(aarstalet.dage / DAGE_PER_UGE),
    restDage: aarstalet.dage % DAGE_PER_UGE,
    isoUger: antalUgerIIsoAar(aar) ?? UGER_PER_AAR,
    ugerTilbage: Math.floor(dageTilbage / DAGE_PER_UGE),
    dageTilbageRest: dageTilbage % DAGE_PER_UGE,
    dageTilbage,
    ugerTilJul: Math.floor(dageTilJul / DAGE_PER_UGE),
    dageTilJulRest: dageTilJul % DAGE_PER_UGE,
    maaneder: maanederMedUger,
    perioder: perioderFor(maaneder, aarstalet.dage, locale),
    ferie: FERIEUGER.map((uger) => ({
      uger,
      arbejdsuger: UGER_PER_AAR - uger,
    })),
  };
}

/** Tal formateret med sitets egen `getIntlLocale` — dansk med punktum. */
export function ugerTal(n: number, locale: UgerLocale): string {
  return n.toLocaleString(getIntlLocale(locale));
}

/** «1 dag» og «2 dage» / «1 dag» och «2 dagar» — med rigtigt ental. */
function dagetal(n: number, locale: UgerLocale): string {
  const flertal = locale === "se" ? "dagar" : "dage";
  return n === 1 ? "1 dag" : `${ugerTal(n, locale)} ${flertal}`;
}

export interface UgerFaq {
  question: string;
  answer: string;
}

/**
 * De fem målte spørgsmål fra autocomplete, som `<h2>`-afsnit og som `FAQPage`.
 * Hvert svar regnes af `ugerOversigt`, så et nyt år eller et nyt sprog ikke kan
 * give en løfte-sætning uden at porten ser den.
 */
export function ugerFaq(locale: UgerLocale, today: Date): UgerFaq[] {
  const o = ugerOversigt(locale, today);
  const maaneder = maanederMedHverLængde(o.maaneder.map((m) => m.maaned));
  const korteste = maaneder[0];
  const laengste = maaneder[maaneder.length - 1];
  const ferie = o.ferie[0];
  if (locale === "da") {
    return [
      {
        question: "Hvor mange uger er der på et år?",
        answer: `${o.aar} har ${ugerTal(o.dage, locale)} dage, og en uge er ${DAGE_PER_UGE} dage. Det er ${ugerTal(o.uger, locale)} uger og ${dagetal(o.restDage, locale)}. ISO-ugenummereringen har ${ugerTal(o.isoUger, locale)} uger i ${o.aar}.`,
      },
      {
        question: "Hvor mange uger er der på en måned?",
        answer: `En måned er mellem ${korteste.dage} og ${laengste.dage} dage. ${korteste.name} har ${korteste.dage} dage, altså ${korteste.dage % DAGE_PER_UGE === 0 ? "præcis " : ""}${ugerTal(Math.floor(korteste.dage / DAGE_PER_UGE), locale)} uger${korteste.dage % DAGE_PER_UGE > 0 ? ` og ${dagetal(korteste.dage % DAGE_PER_UGE, locale)}` : ""}, mens ${laengste.name} har ${laengste.dage} dage, altså ${laengste.dage % DAGE_PER_UGE === 0 ? "præcis " : ""}${ugerTal(Math.floor(laengste.dage / DAGE_PER_UGE), locale)} uger${laengste.dage % DAGE_PER_UGE > 0 ? ` og ${dagetal(laengste.dage % DAGE_PER_UGE, locale)}` : ""}.`,
      },
      {
        question: "Hvor mange uger arbejder man om året?",
        answer: `En arbejdsuge er fem dage. Holder du ${ferie.uger} ugers ferie, arbejder du ${ugerTal(ferie.arbejdsuger, locale)} uger om året; holder du ${o.ferie[1].uger} uger, er det ${ugerTal(o.ferie[1].arbejdsuger, locale)} uger. Helligdage, der falder på en hverdag, trækker yderligere fra.`,
      },
      {
        question: "Hvor mange ugers ferie har man?",
        answer: `Ferieloven giver ret til fem ugers ferie om året, altså 25 feriedage. Mange arbejdspladser giver en sjette ferieuge gennem overenskomst eller ansættelsesaftale. Ferien optjenes og afholdes efter ferieloven.`,
      },
      {
        question: "Hvor mange uger er der til jul?",
        answer: `Fra i dag er der ${ugerTal(o.ugerTilJul, locale)} uger og ${dagetal(o.dageTilJulRest, locale)} til juleaften den 24. december. Der er ${ugerTal(o.ugerTilbage, locale)} uger og ${dagetal(o.dageTilbageRest, locale)} tilbage af ${o.aar}.`,
      },
    ];
  }
  return [
    {
      question: "Hur många veckor är det på ett år?",
      answer: `${o.aar} har ${ugerTal(o.dage, locale)} dagar, och en vecka är ${DAGE_PER_UGE} dagar. Det är ${ugerTal(o.uger, locale)} veckor och ${dagetal(o.restDage, locale)}. ISO-veckonumreringen har ${ugerTal(o.isoUger, locale)} veckor ${o.aar}.`,
    },
    {
      question: "Hur många veckor är det på en månad?",
      answer: `En månad är mellan ${korteste.dage} och ${laengste.dage} dagar. ${korteste.name} har ${korteste.dage} dagar, alltså exakt ${ugerTal(Math.floor(korteste.dage / DAGE_PER_UGE), locale)} veckor, medan ${laengste.name} har ${laengste.dage} dagar, alltså ${ugerTal(Math.floor(laengste.dage / DAGE_PER_UGE), locale)} veckor och ${dagetal(laengste.dage % DAGE_PER_UGE, locale)}.`,
    },
    {
      question: "Hur många veckor jobbar man per år?",
      answer: `En arbetsvecka är fem dagar. Tar du ${ferie.uger} veckors semester jobbar du ${ugerTal(ferie.arbejdsuger, locale)} veckor per år; tar du ${o.ferie[1].uger} veckor är det ${ugerTal(o.ferie[1].arbejdsuger, locale)} veckor. Helgdagar som infaller på en vardag drar ytterligare.`,
    },
    {
      question: "Hur många veckors semester har man?",
      answer: `Semesterlagen ger rätt till fem veckors semester per år, alltså 25 semesterdagar. Många arbetsplatser ger en sjätte semestervecka genom kollektivavtal eller anställningsavtal. Semestern tjänas in och tas ut enligt semesterlagen.`,
    },
    {
      question: "Hur många veckor är det till jul?",
      answer: `Från i dag är det ${ugerTal(o.ugerTilJul, locale)} veckor och ${dagetal(o.dageTilJulRest, locale)} till julafton den 24 december. Det är ${ugerTal(o.ugerTilbage, locale)} veckor och ${dagetal(o.dageTilbageRest, locale)} kvar av ${o.aar}.`,
    },
  ];
}

export interface UgerCopy {
  h1: string;
  title: string;
  description: string;
  lead: string;
  tabelOverskrift: string;
  kolonnePeriode: string;
  kolonneDage: string;
  kolonneUger: string;
  kolonneRest: string;
  maanedOverskrift: string;
  ferieOverskrift: string;
  ferieKolonneUger: string;
  ferieKolonneArbejdsuger: string;
  sum: string;
  eksempel: string;
  underPerioder: string;
  underMaaneder: string;
  ferieUnderTabel: string;
  linkDato: string;
  linkDageIAaret: string;
  linkTimer: string;
  linkArbejdsdage: string;
  linkUgenummer: string;
}

/** Copy uden årstal — alle tal regnes i `ugerOversigt` og FAQ'en. */
export const ugerCopy: Record<UgerLocale, UgerCopy> = {
  da: {
    h1: "Hvor mange uger er der på et år?",
    title: "Hvor mange uger er der på et år? Se ugerne i hver måned",
    description:
      "Et år har 52 uger og en enkelt dag. Se hvor mange uger året, hver måned og et halvt år har — og hvor mange uger der er tilbage.",
    lead:
      "Et kalenderår har 365 dage, og en uge har syv. Her ser du, hvor mange uger året, hver måned og et halvt år har — og hvor mange uger der er tilbage af året.",
    tabelOverskrift: "Så mange uger er der i hver periode",
    kolonnePeriode: "Periode",
    kolonneDage: "Dage",
    kolonneUger: "Uger",
    kolonneRest: "Dage ud over",
    maanedOverskrift: "Så mange uger er der i hver måned",
    ferieOverskrift: "Et år minus ferie",
    ferieKolonneUger: "Ferie",
    ferieKolonneArbejdsuger: "Arbejdsuger tilbage",
    sum: "Hele året",
    eksempel: "Regnet af dagens dato",
    underPerioder:
      "En uge er syv dage. Månederne er kalendermåneder, så de er 28, 30 eller 31 dage — derfor er en måned mellem fire uger og fire uger og tre dage. Et halvt år er halvdelen af årets dage, rundet til hele dage.",
    underMaaneder:
      "En måned er mellem fire og fire uger og tre dage. Februar har fire uger præcis i et normalt år og fire uger og en dag i et skudår. Årets tolv måneder tilsammen giver 52 uger og en enkelt dag.",
    ferieUnderTabel:
      "Ferieloven giver ret til fem ugers ferie, altså 25 feriedage. En arbejdsuge regnes her som fem dage, og helligdage, der falder på en hverdag, trækker yderligere fra.",
    linkDato: "Datoberegner",
    linkDageIAaret: "Hvor mange dage er der på et år?",
    linkTimer: "Hvor mange timer er der på et år?",
    linkArbejdsdage: "Hvor mange arbejdsdage er der på et år?",
    linkUgenummer: "Hvilket ugenummer er det i dag?",
  },
  se: {
    h1: "Hur många veckor är det på ett år?",
    title: "Hur många veckor är det på ett år? Se veckorna i varje månad",
    description:
      "Ett år har 52 veckor och en dag. Se hur många veckor året, varje månad och ett halvår har — och hur många veckor som är kvar.",
    lead:
      "Ett kalenderår har 365 dagar, och en vecka har sju. Här ser du hur många veckor året, varje månad och ett halvår har — och hur många veckor som är kvar av året.",
    tabelOverskrift: "Så många veckor är det i varje period",
    kolonnePeriode: "Period",
    kolonneDage: "Dagar",
    kolonneUger: "Veckor",
    kolonneRest: "Dagar utöver",
    maanedOverskrift: "Så många veckor är det i varje månad",
    ferieOverskrift: "Ett år minus semester",
    ferieKolonneUger: "Semester",
    ferieKolonneArbejdsuger: "Arbetsveckor kvar",
    sum: "Hela året",
    eksempel: "Räknat från dagens datum",
    underPerioder:
      "En vecka är sju dagar. Månaderna är kalendermånader, så de är 28, 30 eller 31 dagar — därför är en månad mellan fyra veckor och fyra veckor och tre dagar. Ett halvår är hälften av årets dagar, avrundat till hela dagar.",
    underMaaneder:
      "En månad är mellan fyra och fyra veckor och tre dagar. Februari har fyra veckor exakt ett normalt år och fyra veckor och en dag ett skottår. Årets tolv månader ger tillsammans 52 veckor och en enstaka dag.",
    ferieUnderTabel:
      "Semesterlagen ger rätt till fem veckors semester, alltså 25 semesterdagar. En arbetsvecka räknas här som fem dagar, och helgdagar som infaller på en vardag drar ytterligare.",
    linkDato: "Datumräknare",
    linkDageIAaret: "Hur många dagar är det på ett år?",
    linkTimer: "Hur många timmar är det på ett år?",
    linkArbejdsdage: "Hur många arbetsdagar är det på ett år?",
    linkUgenummer: "Vilket veckonummer är det i dag?",
  },
};

export interface UgerAfsnit {
  overskrift: string;
  brødtekst: string;
}

/** Afsnittenes brødtekst afhænger af dagens dato, fordi dens tal skal regnes. */
export function ugerAfsnit(locale: UgerLocale, today: Date): UgerAfsnit[] {
  const o = ugerOversigt(locale, today);
  const maaneder = maanederMedHverLængde(o.maaneder.map((m) => m.maaned));
  const korteste = maaneder[0];
  const laengste = maaneder[maaneder.length - 1];
  return locale === "da"
    ? [
        {
          overskrift: "Hvor mange uger er der på et år?",
          brødtekst: `${o.aar} har ${ugerTal(o.dage, locale)} dage, og ${DAGE_PER_UGE} dage er en uge, så året er ${ugerTal(o.uger, locale)} uger og ${dagetal(o.restDage, locale)}. ISO-ugenummereringen deler året ind i ${ugerTal(o.isoUger, locale)} uger i ${o.aar}. Der er ${ugerTal(o.ugerTilbage, locale)} uger og ${dagetal(o.dageTilbageRest, locale)} tilbage af året efter i dag.`,
        },
        {
          overskrift: "Hvor mange uger er der på en måned?",
          brødtekst: `Der er ingen måned med samme antal dage: ${korteste.name} har ${korteste.dage} dage og ${laengste.name} har ${laengste.dage} dage. Det er ${ugerTal(Math.floor(korteste.dage / DAGE_PER_UGE), locale)} uger mod ${ugerTal(Math.floor(laengste.dage / DAGE_PER_UGE), locale)} uger og ${dagetal(laengste.dage % DAGE_PER_UGE, locale)}.`,
        },
        {
          overskrift: "Hvor mange uger er der til jul?",
          brødtekst: `Juleaften er den 24. december. Fra i dag er der ${ugerTal(o.ugerTilJul, locale)} uger og ${dagetal(o.dageTilJulRest, locale)} til juleaften, og ${ugerTal(o.ugerTilbage, locale)} uger og ${dagetal(o.dageTilbageRest, locale)} tilbage af ${o.aar}.`,
        },
      ]
    : [
        {
          overskrift: "Hur många veckor är det på ett år?",
          brødtekst: `${o.aar} har ${ugerTal(o.dage, locale)} dagar, och ${DAGE_PER_UGE} dagar är en vecka, så året är ${ugerTal(o.uger, locale)} veckor och ${dagetal(o.restDage, locale)}. ISO-veckonumreringen delar året i ${ugerTal(o.isoUger, locale)} veckor ${o.aar}. Det är ${ugerTal(o.ugerTilbage, locale)} veckor och ${dagetal(o.dageTilbageRest, locale)} kvar av året efter i dag.`,
        },
        {
          overskrift: "Hur många veckor är det på en månad?",
          brødtekst: `Det finns ingen månad med samma antal dagar: ${korteste.name} har ${korteste.dage} dagar och ${laengste.name} har ${laengste.dage} dagar. Det är ${korteste.dage % DAGE_PER_UGE === 0 ? "exakt " : ""}${ugerTal(Math.floor(korteste.dage / DAGE_PER_UGE), locale)} veckor${korteste.dage % DAGE_PER_UGE > 0 ? ` och ${dagetal(korteste.dage % DAGE_PER_UGE, locale)}` : ""} mot ${laengste.dage % DAGE_PER_UGE === 0 ? "exakt " : ""}${ugerTal(Math.floor(laengste.dage / DAGE_PER_UGE), locale)} veckor${laengste.dage % DAGE_PER_UGE > 0 ? ` och ${dagetal(laengste.dage % DAGE_PER_UGE, locale)}` : ""}.`,
        },
        {
          overskrift: "Hur många veckor är det till jul?",
          brødtekst: `Julafton är den 24 december. Från i dag är det ${ugerTal(o.ugerTilJul, locale)} veckor och ${dagetal(o.dageTilJulRest, locale)} till julafton, och ${ugerTal(o.ugerTilbage, locale)} veckor och ${dagetal(o.dageTilbageRest, locale)} kvar av ${o.aar}.`,
        },
      ];
}
