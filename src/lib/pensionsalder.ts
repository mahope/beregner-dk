/**
 * Folkepensionsalder — hvornår kan du få folkepension?
 *
 * Alderen følger fødselsåret, ikke fødselsdagen: Udbetaling Danmark lægger
 * folkepensionsalderen op i kohorter med halvår i de tidlige årgange. Skemaet
 * her er det, borger.dk viser under «Se din folkepensionsalder» — med den
 * ændring at de to halvårskohorter i 1954 og 1955 hver dækker ét fødselshhalvår,
 * så en fødselsdato altid rammer én kohort.
 *
 * To regler afgør udbetalingen i praksis:
 *   1. Folkepension udbetales fra den **første dag i den måned**, du fylder
 *      folkepensionsalderen — ikke på fødselsdagen.
 *   2. Tallene er vejledende. Folketingsflertallet tilpasser alderen til den
 *      gennemsnitlige levealder, så årgange fra 1971 kan komme til at vente
 *      længere end 70 år.
 *
 * Kilde og verificeringsdato: se `PENSIONSALDER_KILDE`.
 */

export const PENSIONSALDER_KILDE = {
  skema:
    "https://www.borger.dk/pension-og-efterloen/Folkepension-oversigt/foer-du-gaar-paa-folkepension — «Se din folkepensionsalder» (Udbetaling Danmark): folkepensionsalder pr. fødselsdato, 65 år ved fødsel inden 1954 til 70 år ved fødsel i 1971 eller senere",
  udbetaling:
    "https://www.borger.dk/pension-og-efterloen/Folkepension-oversigt/naar-du-er-paa-folkepension — folkepension udbetales fra den første dag i den måned, du fylder din folkepensionsalder",
  vejledende:
    "https://www.borger.dk/Handlingsside?selfserviceId=8557b9eb-947a-48cb-bef2-2f37aa5c9d32 — «Tallet er kun vejledende. Din folkepensionsalder kan løbende blive forhøjet, fordi den bliver tilpasset ud fra den gennemsnitlige levealder» (borger.dk selvbetjening)",
  tidligPension:
    "https://www.borger.dk/pension-og-efterloen/tidlig-pension/om-tidlig-pension — anciennitet opgøres 6 år før folkepensionsalderen, for fødselsårgangene 1963, 1964, 1967 og 1968 dog 7 år",
  verifiedAt: "2026-10-09",
} as const;

/** Én kohort i skemaet: et interval af fødselsdatoer med én folkepensionsalder. */
export interface PensionsalderKohort {
  /** Tekst som kilden skriver kohorten, fx "1. juli 1955 – 31. december 1962". */
  foedselsdatoLabel: string;
  /** Første fødselsdato i kohorten, inkl. (lokal midnat). */
  fra: Date;
  /** Sidste fødselsdato i kohorten, inkl. `null` = åben opad. */
  til: Date | null;
  /** Folkepensionsalderen i hele år: 65, 66, 67, 68, 69 eller 70. */
  helAar: number;
  /** Om alderen indeholder et halvt år (65 ½ og 66 ½). */
  halvtAar: boolean;
}

/** Lokal midnat for en dato — ingen UTC-skift, for alderen er et kalenderbegreb. */
function dato(aar: number, maaned: number, dag: number): Date {
  return new Date(aar, maaned - 1, dag, 0, 0, 0, 0);
}

/**
 * Skemaet fra borger.dk, i rækkefølge.
 *
 * De to halvårskohorter i 1954 og 1955 er opdelt på månedsdagen, så både
 * "1. januar – 30. juni 1954" (65 ½) og "1. juli – 31. december 1954" (66)
 * er egne rækker — præcis som kilden angiver dem.
 */
export const PENSIONSALDER_KOHORTER: readonly PensionsalderKohort[] = [
  {
    foedselsdatoLabel: "31. december 1953 eller tidligere",
    fra: dato(1875, 1, 1),
    til: dato(1953, 12, 31),
    helAar: 65,
    halvtAar: false,
  },
  {
    foedselsdatoLabel: "1. januar – 30. juni 1954",
    fra: dato(1954, 1, 1),
    til: dato(1954, 6, 30),
    helAar: 65,
    halvtAar: true,
  },
  {
    foedselsdatoLabel: "1. juli – 31. december 1954",
    fra: dato(1954, 7, 1),
    til: dato(1954, 12, 31),
    helAar: 66,
    halvtAar: false,
  },
  {
    foedselsdatoLabel: "1. januar – 30. juni 1955",
    fra: dato(1955, 1, 1),
    til: dato(1955, 6, 30),
    helAar: 66,
    halvtAar: true,
  },
  {
    foedselsdatoLabel: "1. juli 1955 – 31. december 1962",
    fra: dato(1955, 7, 1),
    til: dato(1962, 12, 31),
    helAar: 67,
    halvtAar: false,
  },
  {
    foedselsdatoLabel: "1. januar 1963 – 31. december 1966",
    fra: dato(1963, 1, 1),
    til: dato(1966, 12, 31),
    helAar: 68,
    halvtAar: false,
  },
  {
    foedselsdatoLabel: "1. januar 1967 – 31. december 1970",
    fra: dato(1967, 1, 1),
    til: dato(1970, 12, 31),
    helAar: 69,
    halvtAar: false,
  },
  {
    foedselsdatoLabel: "1. januar 1971 eller senere",
    fra: dato(1971, 1, 1),
    til: null,
    helAar: 70,
    halvtAar: false,
  },
];

/**
 * Alderen skrevet som kilden skriver den: "70 år", "65 ½ år".
 *
 * Halve år bruger brøktallet i klartekst (½), for det er den skrivemåde,
 * både borger.dk og dansk presse bruger — en tabel med "65,5 år" afviger
 * fra kilden unødigt.
 */
export function formaterAlder(helAar: number, halvtAar: boolean): string {
  return halvtAar ? `${helAar} ½ år` : `${helAar} år`;
}

/**
 * Folkepensionsalderen for en fødselsdato.
 *
 * Fødselsdatoen normaliseres først: 29. februar regnes som 28. februar.
 * Ellers ville et skudår miste sin kohort, når alderen lægges til (der er
 * ingen 29. februar i de fleste år).
 */
export function kohortForFoedselsdato(foedselsdato: Date): PensionsalderKohort {
  const foedselsdatoNormaliseret = normaliserFoedselsdato(foedselsdato);
  for (const kohort of PENSIONSALDER_KOHORTER) {
    if (foedselsdatoNormaliseret >= kohort.fra && (kohort.til === null || foedselsdatoNormaliseret <= kohort.til)) {
      return kohort;
    }
  }
  // Uopnåeligt: den første kohort starter i 1875 og den sidste er åben opad.
  return PENSIONSALDER_KOHORTER[0];
}

export interface PensionsalderResultat {
  /** Kohorten fødselsdatoen falder i. */
  kohort: PensionsalderKohort;
  /** Folkepensionsalderen i hele år. */
  alderHelAar: number;
  /** Om alderen har et halvt år. */
  alderHalvtAar: boolean;
  /** Alderen som tekst, fx "68 år". */
  alderTekst: string;
  /** Dagen du fylder folkepensionsalderen (fødselsdag + alder). */
  alderFyldesDato: Date;
  /** Første dag folkepension kan udbetales: den 1. i samme måned. */
  foerstePensionsdag: Date;
  /** Om folkepensionsalderen allerede er nået pr. denne dato. */
  alderNaaet: boolean;
}

/** Normaliserer en fødselsdato til lokal midnat; 29. februar → 28. februar. */
function normaliserFoedselsdato(foedselsdato: Date): Date {
  const aar = foedselsdato.getFullYear();
  const maaned = foedselsdato.getMonth();
  let dag = foedselsdato.getDate();
  if (maaned === 1 && dag === 29) dag = 28;
  return new Date(aar, maaned, dag, 0, 0, 0, 0);
}

/**
 * Regner folkepensionsalderen og den første udbetalingsdato.
 *
 * `iDag` medtages, så funktionen kan spørges med en fast dato i tests — den
 * skal ikke afhænge af den tidligere kørselstid.
 */
export function beregnPensionsalder(foedselsdato: Date, iDag: Date = new Date()): PensionsalderResultat {
  const foedselsdatoNormaliseret = normaliserFoedselsdato(foedselsdato);
  const kohort = kohortForFoedselsdato(foedselsdatoNormaliseret);
  const { helAar, halvtAar } = kohort;

  // Alderen fyldes på fødselsdagen, plus seks måneder hvis kohorten har et
  // halvt år. Månederne lægges én ad gangen, så december ikke hopper over år.
  let alderAar = foedselsdatoNormaliseret.getFullYear() + helAar;
  let alderMaaned = foedselsdatoNormaliseret.getMonth();
  if (halvtAar) {
    alderMaaned += 6;
    if (alderMaaned > 11) {
      alderMaaned -= 12;
      alderAar += 1;
    }
  }
  const alderFyldesDato = new Date(
    alderAar,
    alderMaaned,
    foedselsdatoNormaliseret.getDate(),
    0, 0, 0, 0,
  );
  const foerstePensionsdag = new Date(alderAar, alderMaaned, 1, 0, 0, 0, 0);

  // Sammenlignes på datoer, ikke klokkeslæt: et lokalt midnat er før
  // udbetalingstidspunktet samme dag.
  const iDagNormaliseret = new Date(iDag.getFullYear(), iDag.getMonth(), iDag.getDate());
  const alderNaaet = iDagNormaliseret >= alderFyldesDato;

  return {
    kohort,
    alderHelAar: helAar,
    alderHalvtAar: halvtAar,
    alderTekst: formaterAlder(helAar, halvtAar),
    alderFyldesDato,
    foerstePensionsdag,
    alderNaaet,
  };
}

/**
 * Eksemplet værktøjet og titlen regner på: født 15. marts 1968.
 *
 * Årstallet ligger i kohorten 1967-1970, så alderen er 69 år — og fordi
 * fødselsdagen er 15. marts, kan folkepensionen udbetales allerede fra
 * 1. marts 2037.
 */
export const PENSIONSALDER_EKSEMPEL: Date = new Date(1968, 2, 15, 0, 0, 0, 0);

/** Eksemplets resultat, så titel, brødtekst og port læser samme tal. */
export function pensionsalderEksempel(): PensionsalderResultat {
  return beregnPensionsalder(PENSIONSALDER_EKSEMPEL);
}

/** Kohorterne som rækker til skemaet på siden, med alderen formateret. */
export function pensionsalderRaekker(): ReadonlyArray<{
  foedselsdatoLabel: string;
  alderTekst: string;
  helAar: number;
  halvtAar: boolean;
}> {
  return PENSIONSALDER_KOHORTER.map((kohort) => ({
    foedselsdatoLabel: kohort.foedselsdatoLabel,
    alderTekst: formaterAlder(kohort.helAar, kohort.halvtAar),
    helAar: kohort.helAar,
    halvtAar: kohort.halvtAar,
  }));
}
