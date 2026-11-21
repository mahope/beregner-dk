import { beregnAlder, type AlderResultat } from "./alder";
import type { Locale } from "./i18n";

export interface AlderEksempel {
  /** "YYYY-MM-DD" — formateres med Intl i den side, der viser tabellen. */
  foedselsdato: string;
  /** "YYYY-MM-DD" */
  beregningsdato: string;
  aar: number;
  maaneder: number;
  dage: number;
  totalDage: number;
  dageTilFoedselsdag: number;
  naesteFoedselsdagAlder: number;
  bemaerkning: { da: string; se: string };
}

interface AlderEksempelRaat {
  foedselsdato: string;
  beregningsdato: string;
  bemaerkning: { da: string; se: string };
}

const raat: AlderEksempelRaat[] = [
  {
    foedselsdato: "1990-03-15",
    beregningsdato: "2026-09-25",
    bemaerkning: {
      // Rækken er regnet til en *fast* dato, ikke til i dag, så den er et
      // regnestykke og ikke et levende svar. Derfor siger billedteksten ikke
      // længere, at den er "eksemplet i beskrivelsen" — beskrivens alder følger
      // dagen (se `alder-side-tekst.ts`), og de to ville ellers glide fra
      // hinanden. Det værktøjet viser, når man skriver fødselsdatoen ind, er
      // stadig præcis denne række.
      da: "Et fast regnestykke, regnet til 25. september 2026. Skriver du fødselsdatoen ind i værktøjet ovenfor, får du præcis disse tal til den dato.",
      se: "En fast uträkning, gjord till 25 september 2026. Fyller du i födelsedatumet i verktyget ovan får du exakt dessa siffror till det datumet.",
    },
  },
  {
    foedselsdato: "1990-03-15",
    beregningsdato: "2010-05-01",
    bemaerkning: {
      da: "Det samme fødselsdato, men et tidspunkt tilbage i tiden. Det er det andet felt i værktøjet, der gør det muligt.",
      se: "Samma födelsedatum, men en tidpunkt tillbaka i tiden. Det är det andra fältet i kalkylatorn som gör det möjligt.",
    },
  },
  {
    foedselsdato: "2000-01-01",
    beregningsdato: "2025-01-01",
    bemaerkning: {
      da: "Helt år. Fødselsdato og beregningsdato er samme dato, så måneder og dage er 0.",
      se: "Hela år. Födelsedatum och beräkningsdatum är samma datum, så månader och dagar är 0.",
    },
  },
  {
    foedselsdato: "2004-02-29",
    beregningsdato: "2026-02-28",
    bemaerkning: {
      da: "Skudårsfødselsdag dagen før 29. februar. Værktøjet tæller dagen før, fordi 2026 ikke er et skudår.",
      se: "Skottårsfödelsedag dagen före 29 februari. Kalkylatorn räknar dagen före, eftersom 2026 inte är ett skottår.",
    },
  },
  {
    foedselsdato: "2015-07-15",
    beregningsdato: "2026-01-15",
    bemaerkning: {
      da: "Et barn. Her viser måneder og dage sig, fordi alderen ikke kan gives hele år endnu.",
      se: "Ett barn. Här visar månader och dagar sig, eftersom åldern ännu inte kan anges i hela år.",
    },
  },
];

/**
 * De gennemgående eksempler på /alder. Hvert tal er beregnet af `beregnAlder` —
 * det samme modul som selve værktøjet bruger — så tabellen og værktøjet ikke
 * kan komme i uoverenssættelse, og en ny tekst ikke kan love et tal, som
 * logikken modsiger.
 */
export const ALDER_EKSEEMPLER: AlderEksempel[] = raat.map((r) => {
  const resultat = beregnAlder({
    foedselsdato: r.foedselsdato,
    beregningsdato: r.beregningsdato,
  });
  if (!resultat) {
    throw new Error(
      `Alder-eksemplet ${r.foedselsdato}–${r.beregningsdato} kan ikke beregnes af beregnAlder`
    );
  }
  return { ...r, ...uddrag(resultat) };
});

function uddrag(r: AlderResultat) {
  return {
    aar: r.aar,
    maaneder: r.maaneder,
    dage: r.dage,
    totalDage: r.totalDage,
    dageTilFoedselsdag: r.dageTilFoedselsdag,
    naesteFoedselsdagAlder: r.naesteFoedselsdagAlder,
  };
}

/**
 * "36 år, 6 måneder og 15 dage" / "36 år, 6 månader och 15 dagar" /
 * "36 år, 6 måneder og 15 dager".
 *
 * Dansk og svensk bruger ental ved 1, og dansk bruger altid flertal ved 0 —
 * "0 måneder og 0 dage", ikke "0 måned". Værktøjet bruger den samme
 * formatter, så de to aldrig viser forskellige grammatikker for samme tal.
 *
 * Norsk har sin egen gren og ikke en dansk-fallback. Det er ikke en
 * nydelse: norsk har *ikke* samme ord som dansk — måneder er "måneder" i begge,
 * men dage er "dager" på norsk og "dage" på dansk. Før grenen fandtes skrev
 * `formatAlder(…, "no")` "6 måneder og 15 dage" ind i norsk tekst, og det var
 * ikke kun `page.tsx`: `alderSideTekst` løser `{ALDER}` i description,
 * metaDescription, ogDescription og FAQ-svar, så de landede i Googles snippet.
 */
export function formatAlder(
  resultat: { aar: number; maaneder: number; dage: number },
  locale: Locale
): string {
  const { aar, maaneder, dage } = resultat;
  if (locale === "se") {
    const maanederTekst = maaneder === 1 ? "1 månad" : `${maaneder} månader`;
    const dageTekst = dage === 1 ? "1 dag" : `${dage} dagar`;
    return `${aar} år, ${maanederTekst} och ${dageTekst}`;
  }
  if (locale === "no") {
    const maanederTekst = maaneder === 1 ? "1 måned" : `${maaneder} måneder`;
    const dageTekst = dage === 1 ? "1 dag" : `${dage} dager`;
    return `${aar} år, ${maanederTekst} og ${dageTekst}`;
  }
  const maanederTekst = maaneder === 1 ? "1 måned" : `${maaneder} måneder`;
  const dageTekst = dage === 1 ? "1 dag" : `${dage} dage`;
  return `${aar} år, ${maanederTekst} og ${dageTekst}`;
}

/** Første og sidste fødselsår i fødselsårs-tabellen på /alder. */
export const FODSELSAAR_MIN = 1989;
export const FODSELSAAR_MAX = 2010;

export interface FoedselsaarRaekke {
  /** Fødselsåret, som læseren har skrevet i søgefeltet. */
  aar: number;
  /** Hele år, når fødselsdagen endnu ikke er nået (født 31. december). */
  minAlder: number;
  /** Hele år, når fødselsdagen er nået (født 1. januar). */
  maxAlder: number;
  /** Dage levet for den senest fødte i året. */
  minDage: number;
  /** Dage levet for den tidligst fødte i året. */
  maxDage: number;
}

/**
 * "Hvor gammel er jeg, hvis jeg er født i 2007?" — det er den hyppigste
 * søgning på /alder, og et fødselsår giver ikke én alder men to, fordi
 * fødselsdagen ikke altid er nået. Rækkerne regnes derfor på de to yderste
 * fødselsdatoer i året med `beregnAlder` — samme modul som værktøjet bruger —
 * så tabellen ikke kan sige noget, logikken modsiger.
 *
 * Reference-datoen er et argument, ikke "i dag", så en test kan låse tallene
 * på en bestemt dag.
 */
export function foedselsaarRaekker(referenceIso: string): FoedselsaarRaekke[] {
  const raekker: FoedselsaarRaekke[] = [];
  for (let aar = FODSELSAAR_MIN; aar <= FODSELSAAR_MAX; aar++) {
    const tidligst = beregnAlder({
      foedselsdato: `${aar}-01-01`,
      beregningsdato: referenceIso,
    });
    const senest = beregnAlder({
      foedselsdato: `${aar}-12-31`,
      beregningsdato: referenceIso,
    });
    if (!tidligst || !senest) {
      throw new Error(
        `Fødselsårs-tabellen kan ikke beregne ${aar} mod reference-datoen ${referenceIso}`
      );
    }
    raekker.push({
      aar,
      minAlder: senest.aar,
      maxAlder: tidligst.aar,
      minDage: senest.totalDage,
      maxDage: tidligst.totalDage,
    });
  }
  return raekker;
}

/** "18–19 år" — eller ét tal, hvis begge ende er ens. */
export function formatAlderRaekke(r: FoedselsaarRaekke): string {
  return r.minAlder === r.maxAlder
    ? `${r.minAlder} år`
    : `${r.minAlder}–${r.maxAlder} år`;
}
