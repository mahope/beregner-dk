/**
 * Siden for «dage mellem datoer» — den danske `/dage-mellem-datoer` og den
 * svenske `/dagar-mellan-datum`.
 *
 * **Hvorfor siden findes.** GSC 2/10–30/30 viser «dage mellem datoer» (438
 * visninger, ca. 9.000 søgninger, pos. 4) på `/dato` og tre svenske
 * varianter — «dagar mellan datum» (888v, pos. 8), «antal dagar mellan
 * datum» (424v, pos. 8) og «räkna dagar mellan datum» (399v, pos. 9) — på
 * `beraknare.se/dato`, der har 105.188 visninger og 0,1 % CTR. Værktøjet lå
 * som ét afsnit dybt i `/dato`s brødtekst, altså på en side der konkurrerer
 * om 20 andre spørgsmål. Egen sti, egen `<h1>`, egen titel: samme
 * spørgsmål, sin egen adresse.
 *
 * **Ingen tal i teksten.** Alle dagtal, ugetal og skudårs-påstande regnes her
 * af `heleDageMellem` og `erSkudAar`, altså af de samme funktioner
 * `DatoBeregner` bruger. Punkt 11 i kvalitetsreglerne: en påstand i tekst er
 * kode, så en tekst der skriver «365 dage» i stedet for at regne det, er en
 * løftefejl — præcis den fejl `/efterloen` og `/vaegttab` havde.
 */
import { getIntlLocale } from "./format";
import { heleDageMellem, iDagPaSiden, parseIsoDato } from "./lokal-dato";

export type DageMellemLocale = "da" | "se";

/** Sprogslaget er `da` og `se`: norsk domæne (`beregner.no`) er ikke i drift. */
export function isDageMellemLocale(locale: string): locale is DageMellemLocale {
  return locale === "da" || locale === "se";
}

/** Sidens egen sti i hvert sprog. Stien *er* sprogvalget. */
export const DAGE_MELLEM_PATH: Record<DageMellemLocale, string> = {
  da: "/dage-mellem-datoer",
  se: "/dagar-mellan-datum",
};

export function getDageMellemPath(locale: string): string | null {
  return isDageMellemLocale(locale) ? DAGE_MELLEM_PATH[locale] : null;
}

/**
 * Skudår efter den gregorianske regel: hvert 4. år, men ikke hvert 100. år,
 * medmindre det også kan deles med 400. 1900 var altså **ikke** skudår og 2000
 * var det, og det er grunden til at «dage mellem 1. januar 2000 og 1. januar
 * 2001» er 366 dage mens «… 1900 og … 1901» er 365.
 */
export function erSkudAar(aar: number): boolean {
  return aar % 4 === 0 && (aar % 100 !== 0 || aar % 400 === 0);
}

/** Én konkrete periode, regnet af de samme funktioner som værktøjet. */
export interface DageMellemEksempel {
  /** "YYYY-MM-DD" for periodens start. */
  fraIso: string;
  fraTekst: string;
  tilIso: string;
  tilTekst: string;
  /** Hele kalenderdage mellem de to datoer. */
  dage: number;
  /** Hele uger i perioden, og det der er tilbage. */
  uger: number;
  restDage: number;
  /** "1. januar 2028" — skudåret, hvis perioden går over det. */
  skudAarTekst: string | null;
  /** Den samme periode i en sætning, til `<p>` og til testen. */
  sætning: string;
}

function datoTekst(iso: string, locale: DageMellemLocale): string {
  const dato = parseIsoDato(iso);
  if (!dato) return iso;
  return dato.toLocaleDateString(getIntlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Den næste 1. december, regnet fra i dag — titlen på `/dato` i begge sprog.
 *
 * **Hvorfor en nedtælling og ikke et interval.** GSC 3/9–1/10 giver
 * «hvor mange dage er der til 1 december» (1.219 visninger, pos. 5) og «hvor
 * mange dage er der til den 24 december» (1.001, pos. 5) som de to største
 * søgninger på `/dato` (131.320 visninger, 0,7 % CTR) — begge er
 * nedtællinger. Titlen skrev før 4/10 «Beregn dage til en dato: 1. jan.
 * 2026→2027 = 365», altså et *interval* på en nedtællingsside, og på svensk
 * «Beräkna dagar kvar till datum: 1 jan. 2026→2027 = 365», der læses som
 * «365 dage kvar» og dermed er **falsk for enhver dato**. Dertil var «2026→2027»
 * og «= 365» håndskrevne bogstaver: fra 2028 er intervallet 1. jan. 2028→2029 =
 * 366 dage, og titlen ville stadig sige 365.
 *
 * Derfor regnes dagene her, af `heleDageMellem` — samme funktion
 * `dageMellemEksempel` og `DatoBeregner` bruger — og månedens navn læses fra
 * `Intl`, så tallet og datoen ikke kan glide fra hinanden eller fra siden.
 */
export interface DageTilDecember {
  /** "YYYY-MM-DD" for den 1. december der regnes til. */
  decemberIso: string;
  /** "1. december" / "1 december" — samme form som resten af siden. */
  decemberTekst: string;
  /** Hele kalenderdage fra i dag til den 1. december. */
  dage: number;
  /** "58 dage" / "58 dagar" — kortformen der står i `<title>`. */
  kort: string;
}

/**
 * Næste 1. december. På selve 1. december regnes der til næste års, så titlen
 * aldrig siger «0 dage».
 */
export function dageTilDecember(
  locale: DageMellemLocale,
  today: Date
): DageTilDecember {
  const iDag = iDagPaSiden(today, locale);
  const aar = Number(iDag.slice(0, 4));
  const iDenneAar = `${aar}-12-01`;
  // ISO-datoer sorterer rigtigt som tekst, så dette også gælder når
  // `iDag` LIGGER på 1. december — da er «i dag» ikke «senere».
  const decemberIso = iDag >= iDenneAar ? `${aar + 1}-12-01` : iDenneAar;
  const fra = parseIsoDato(iDag);
  const til = parseIsoDato(decemberIso);
  // `iDagPaSiden` kan ikke give en ugyldig dato, men `parseIsoDato` siger det
  // alligevel med sit typer: en `null` her må ikke blive `NaN` i `<title>`.
  const dage = fra && til ? heleDageMellem(fra, til) : 0;
  // Kun dag og måned, fordi titlen skriver «1. december» og ikke «1. december
  // 2027» — og fordi året skifter med dagen, så et årstal her ville kunne blive
  // forældet i en titel der ellers er rigtig.
  const decemberTekst = til
    ? til.toLocaleDateString(getIntlLocale(locale), {
        day: "numeric",
        month: "long",
      })
    : "1. december";
  return {
    decemberIso,
    decemberTekst,
    dage,
    kort: locale === "se" ? `${dage} dagar` : `${dage} dage`,
  };
}

/**
 * Den danske periode: 1. januar i år → 1. januar næste år. Den er valgt, fordi
 * svaret er det tal folk oftest vil bekræfte ved et skudår, og fordi den er
 * 365 eller 366 dage — altså et tal der *skal* kunne aflæses mod en kalender.
 */
export function dageMellemEksempel(
  locale: DageMellemLocale,
  today: Date
): DageMellemEksempel {
  const iDag = parseIsoDato(iDagPaSiden(today, locale));
  const aar = iDag ? iDag.getFullYear() : today.getFullYear();
  const fraIso = `${aar}-01-01`;
  const tilIso = `${aar + 1}-01-01`;
  const fra = parseIsoDato(fraIso) as Date;
  const til = parseIsoDato(tilIso) as Date;
  const dage = heleDageMellem(fra, til);
  const uger = Math.floor(dage / 7);
  const restDage = dage - uger * 7;
  const skudAar = erSkudAar(aar) ? aar : null;
  const skudAarTekst = skudAar
    ? locale === "se"
      ? `${datoTekst(`${skudAar}-02-29`, locale)} är en skottårsdag`
      : `${datoTekst(`${skudAar}-02-29`, locale)} er en skudårsdato`
    : null;
  const tals = (n: number) => n.toLocaleString(getIntlLocale(locale));
  const dageOr = (n: number) => (n === 1 ? "1 dag" : `${tals(n)} dage`);
  const sætning =
    locale === "se"
      ? `Från ${datoTekst(fraIso, locale)} till ${datoTekst(tilIso, locale)} går det ${dageOr(dage)}: ${tals(uger)} hela veckor och ${restDage === 1 ? "1 dag" : `${tals(restDage)} dagar`} till.`
      : `Fra ${datoTekst(fraIso, locale)} til ${datoTekst(tilIso, locale)} går der ${dageOr(dage)}: ${tals(uger)} hele uger og ${restDage === 1 ? "1 dag" : `${tals(restDage)} dage`} til.`;
  return {
    fraIso,
    fraTekst: datoTekst(fraIso, locale),
    tilIso,
    tilTekst: datoTekst(tilIso, locale),
    dage,
    uger,
    restDage,
    skudAarTekst,
    sætning,
  };
}

export interface DageMellemCopy {
  h1: string;
  /** Titlen skal ramme spørgsmålet ordret — det er hele pointen med siden. */
  title: string;
  description: string;
  lead: string;
  /** De tre spørgsmål, der både er `<h2>`-afsnit og `FAQPage`. */
  faq: { question: string; answer: string }[];
  /** Knapper og links, med den danske og den svenske formulering. */
  linkDato: string;
  linkUgenummer: string;
  linkDageTil: string;
}

/** De tre spørgsmål som `<h2>`-afsnit og som `FAQPage`. */
export interface DageMellemAfsnit {
  overskrift: string;
  brødtekst: string;
}

/** Et helt års længde i dage, regnet — aldrig skrevet i teksten. */
export interface Aarstal {
  aar: number;
  dage: number;
  skudAar: number;
  skudDage: number;
}

/**
 * Længden af det igangværende år og af det næste skudår. «365 dage» og «366
 * dage» står i brødteksten, så de regnes her af `heleDageMellem` frem for at
 * være håndskrevet — ellers er det en påstand, der ikke kan følge en ny
 * kalender.
 */
export function aarsLængde(locale: DageMellemLocale, today: Date): Aarstal {
  const iDag = parseIsoDato(iDagPaSiden(today, locale));
  const aar = iDag ? iDag.getFullYear() : today.getFullYear();
  const dage = heleDageMellem(
    parseIsoDato(`${aar}-01-01`) as Date,
    parseIsoDato(`${aar + 1}-01-01`) as Date
  );
  let skudAar = aar;
  while (!erSkudAar(skudAar)) skudAar += 1;
  return {
    aar,
    dage,
    skudAar,
    skudDage: heleDageMellem(
      parseIsoDato(`${skudAar}-01-01`) as Date,
      parseIsoDato(`${skudAar + 1}-01-01`) as Date
    ),
  };
}

/**
 * Tal formateret med sitets egen `getIntlLocale` — dansk grupperer med punktum
 * («1.000»), svensk med mellemrum («1 000»). Skrivemåden er derfor ikke valgt
 * her, men læst fra samme sted som resten af sitet.
 */
function tal(n: number, locale: DageMellemLocale): string {
  return n.toLocaleString(getIntlLocale(locale));
}

/**
 * Brødteksten afhænger af dagens dato, fordi dens eneste tal — årets længde og
 * det næste skudår — skal regnes og ikke skrives.
 */
export function dageMellemAfsnit(
  locale: DageMellemLocale,
  today: Date
): DageMellemAfsnit[] {
  const a = aarsLængde(locale, today);
  if (locale === "se") {
    return [
      {
        overskrift: "Så räknas dagarna mellan två datum",
        brødtekst:
          "Dagarna är hela kalendardagar, och startdagen räknas inte med: två datum som ligger en dag ifrån varandra svarar 1 dag, och samma datum två gånger svarar 0 dagar. Räknat på kalenderfälten – inte på timmar – så ett byte mellan sommartid och vintertid ikke flyttar en enda dag. Står slutdatumet före startdatumet står det ett negativt antal dagar, och de övriga räknarna räknar fortfarande intervallet mellan de två datumen.",
      },
      {
        overskrift: "Kalenderdagar, arbetsdagar och helgdagar",
        brødtekst:
          `Kalenderdagar är alla dagar: ${tal(a.dage, locale)} dagar under ${a.aar} och ${tal(a.skudDage, locale)} dagar under ${a.skudAar}, som är ett skottår. Arbetsdagar är de dagar som inte är helg eller helgdag, och det är de som passar för en semester, en lånetid eller en projektdeadline. Helgdagar räknas ut från de svenska helgdagarna, så påsk och jul ger färre arbetsdagar än kalenderdagar.`,
      },
      {
        overskrift: "Räkna dagar mellan datum i Excel",
        brødtekst:
          'I Excel finns två formler: =B1-A1 ger antalet dagar, medan =DATEDIF(A1;B1;"d") räknar i dagar, "m" i månader och "y" i år. DATEDIF är ett dolt namn, så det står inte i formelassistenten, men fungerar i alla Excel-versioner. Vill du ha arbetsdagar och helgdagar med gör verktyget ovan samma sak.',
      },
    ];
  }
  return [
    {
      overskrift: "Sådan tælles dagene mellem to datoer",
      brødtekst:
        "Dagene er hele kalenderdage, og startdagen tælles ikke med: to datoer der er én dag hinanden svarer 1 dag, og den samme dato to gange svarer 0 dage. Regnet på kalenderfelterne — ikke på timer — så et skifte mellem sommertid og vintertid ikke flytter en eneste dag. Står din slutdato før startdatoen, står der et negativt antal dage, og de øvrige tællere regner stadig intervallet mellem de to datoer.",
    },
    {
      overskrift: "Kalenderdage, arbejdsdage og helligdage",
      brødtekst:
        `Kalenderdage er alle dage: ${tal(a.dage, "da")} dage i ${a.aar} og ${tal(a.skudDage, "da")} dage i ${a.skudAar}, som er et skudår. Arbejdsdage er de dage der ikke er weekend eller helligdag, og det er dem der passer på en ferie, en lænetid eller en projektdeadline. Hellige dage tælles ud fra de danske helligdage, så påsker og jul giver færre arbejdsdage end kalenderdage.`,
    },
    {
      overskrift: "Tæl dage mellem datoer i Excel",
      brødtekst:
        'I Excel er der to formler: =B1-A1 giver antallet dage, mens =DATEDIF(A1;B1;"d") tæller i dage, "m" i måneder og "y" i år. DATEDIF er et skjult navn, så det står ikke i formelassistenten, men virker i alle Excel-versioner. Vil du have arbejdsdage og helligdage med, gør værktøjet ovenfor det samme.',
    },
  ];
}

export const dageMellemCopy: Record<DageMellemLocale, DageMellemCopy> = {
  da: {
    h1: "Beregn dage mellem to datoer",
    title: "Dage mellem datoer: beregn antal dage mellem to datoer",
    description:
      "Beregn antal dage mellem to datoer. Få dage, hele uger, arbejdsdage, helligdage og weekenddage — og se regnestykket.",
    lead:
      "Vælg to datoer, så får du antallet dage mellem dem — og de øvrige tal står ved siden af: hele uger, ca. måneder, arbejdsdage, weekenddage og helligdage.",
    faq: [
      {
        question: "Hvor mange dage er der mellem to datoer?",
        answer:
          "Det er antallet af hele kalenderdage mellem dem, hvor startdagen ikke tælles med. Skal du have arbejdsdage, helligdage eller hele uger med, står de i resultatet af beregningen ovenfor.",
      },
      {
        question: "Er 2028 et skudår, og hvor mange dage er der i det?",
        answer:
          "Et skudår er hvert 4. år, undtagen hvert 100. år medmindre det også kan deles med 400. 2024 og 2028 er skudår, 2026 og 2027 er ikke, og 2028 har derfor 366 dage.",
      },
      {
        question: "Hvorfor står der både dage og hele uger?",
        answer:
          "Fordi de fleste spørgsmål findes i begge former. 84 dage er 12 hele uger, og det er samme svar: dagene er delt med 7, og de dage der er tilbage efter den sidste hele uge står for sig selv.",
      },
    ],
    linkDato: "Datoberegner med alle fire værktøjer",
    linkUgenummer: "Hvilken uge er det?",
    linkDageTil: "Hvor mange dage er der til …?",
  },
  se: {
    h1: "Beräkna dagar mellan två datum",
    title: "Dagar mellan datum: räkna ut antal dagar mellan två datum",
    description:
      "Räkna ut antal dagar mellan två datum. Få dagar, hela veckor, arbetsdagar, helgdagar och helgvagar – och se hela uträkningen.",
    lead:
      "Välj två datum, så får du antalet dagar mellan dem — och de övriga talen står bredvid: hela veckor, ca. månader, arbetsdagar, lördagar/söndagar och helgdagar.",
    faq: [
      {
        question: "Hur många dagar är det mellan två datum?",
        answer:
          "Det är antalet hela kalendardagar mellan dem, där startdagen inte räknas med. Vill du ha arbetsdagar, helgdagar eller hela veckor med står de i resultatet av beräkningen ovan.",
      },
      {
        question: "Är 2028 ett skottår, och hur många dagar har det?",
        answer:
          "Ett skottår är vart fjärde år, utom vart hundrade år om det inte också är delbart med 400. 2024 och 2028 är skottår, 2026 och 2027 är det inte, och 2028 har därför 366 dagar.",
      },
      {
        question: "Varför står det både dagar och hela veckor?",
        answer:
          "För att de flesta frågorna finns i båda formerna. 84 dagar är 12 hela veckor, och det är samma svar: dagarna delas med 7, och de dagar som är kvar efter den sista hela veckan står för sig.",
      },
    ],
    linkDato: "Datumräknare med alla fyra verktyg",
    linkUgenummer: "Vilken vecka är det?",
    linkDageTil: "Hur många dagar är det till …?",
  },
};
