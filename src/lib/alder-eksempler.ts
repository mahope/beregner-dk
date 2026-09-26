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
      da: "Det eksempel, der står i sidens beskrivelse. Helt samme tal som værktøjet viser, når du bare skriver fødselsdatoen ind.",
      se: "Exemplet som står i sidans beskrivning. Exakt samma siffror som kalkylatorn visar när du bara fyller i födelsedatum.",
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

/** "36 år, 6 måneder og 10 dage" / "36 år, 6 månader och 10 dagar". */
export function formatAlder(resultat: { aar: number; maaneder: number; dage: number }, locale: Locale): string {
  const aar = resultat.aar;
  const maaneder = resultat.maaneder;
  const dage = resultat.dage;
  if (locale === "se") {
    return `${aar} år, ${maaneder} månader och ${dage} dagar`;
  }
  return `${aar} år, ${maaneder} måneder og ${dage} dage`;
}
