import { formatAlder, foedselsaarRaekker } from "./alder-eksempler";
import { alderLevet, dageEnhed, formatDageLived, formatDageTal } from "./alder-levet";
import { getIntlLocale } from "./format";
import type { Locale } from "./i18n";
import { parseIsoDato } from "./lokal-dato";

/**
 * De tal i /alders beskrivelse, metadata og FAQ, der flytter sig med dagen.
 *
 * Før denne rettelse stod de som håndskrevet tekst i `page-data.ts`:
 * "36 år, 6 måneder og 10 dage pr. 25. september 2026" lå i `description`,
 * `metaDescription`, `ogDescription` og tre FAQ-svar, og blev derved til en
 * frossen byggeværdi i Googles snippet. Hver dag blev den mere forkert, og
 * en læser der tæller efter, ser det.
 *
 * Tallene kommer derfor fra `alderLevet` — samme modul som værktøjet og
 * `AlderLevetSvar` bruger — og fra `foedselsaarRaekker`, som regner den
 * fødselsårs-tabel siden viser. Ingen tekst kan love et tal, logikken
 * modsiger.
 *
 * Reference-datoen er et argument og ikke "i dag", så en test kan låse
 * tallene på to bestemte dage i stedet for på det tidspunkt, den kører.
 */

/** De pladsholdere, `page-data.ts` skriver i /alders tekst, og som løses her. */
export const ALDER_TOKENS = [
  "ALDER",
  "AAR",
  "DAGE",
  "DAGE_TAL",
  "DATO",
  "UGER",
  "MAANEDER",
  "MAANEDER_IALT",
  "TIMER",
  "MINUTTER",
  "DAGE2007",
] as const;

export type AlderToken = (typeof ALDER_TOKENS)[number];

/** "30. september 2026" / "30 september 2026" — datoen i sidens eget sprog. */
export function formaterDato(iso: string, locale: Locale): string {
  const dato = parseIsoDato(iso);
  if (!dato) {
    throw new Error(`Alder-eksemplets reference-dato ${iso} kan ikke læses`);
  }
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dato);
}

/**
 * "36 år, 6 måneder og 15 dage" / "36 år, 6 månader och 15 dagar" — alderen
 * på reference-datoen, formatteret af `alder-eksempler`, så brødtekst og
 * værktøjet ikke kan få forskellig grammatik for samme tal.
 */
export function alderPaDato(iso: string, locale: Locale): string {
  return formatAlder(alderLevet(iso), locale);
}

/**
 * De dage, fødselsårs-tabellen viser for fødte i 2007.
 *
 * Enheden kommer fra `dageEnhed`, ikke fra et ord skrevet i denne sætning:
 * her stod "dage" for *alle* sprog, så en svensk eller norsk række fik dansk.
 * Kun den danske blok bruger tokenen i dag, så fejlen var latent — men den lå i
 * den del af koden der løser pladsholdere for alle tre domæner.
 */
function dage2007(iso: string, locale: Locale): string {
  const raekke = foedselsaarRaekker(iso).find((r) => r.aar === 2007);
  if (!raekke) {
    throw new Error("Fødselsårs-tabellen har ingen række for 2007");
  }
  return `${formatDageTal(raekke.minDage, locale)} til ${formatDageTal(raekke.maxDage, locale)} ${dageEnhed(locale)}`;
}

/**
 * Pladsholderne i /alders tekst, regnet for den dag siden viser. Nøglerne er
 * de samme i alle tre sprog, så `page-data.ts` kan skrive dem ens.
 */
export function alderSideTekst(iso: string, locale: Locale): Record<AlderToken, string> {
  const levet = alderLevet(iso);
  const nummer = (tal: number) => formatDageTal(tal, locale);
  return {
    ALDER: formatAlder(levet, locale),
    // DATEDIF's tre formler svarer hver til sit eget tal: hele år, alle
    // måneder siden fødslen og dage. Derfor er de skrevet hver for sig, så
    // formlen og tallet ved siden af den ikke kan blandes sammen.
    AAR: nummer(levet.aar),
    DAGE: formatDageLived(levet, locale),
    DAGE_TAL: nummer(levet.totalDage),
    DATO: formaterDato(iso, locale),
    UGER: nummer(levet.totalUger),
    MAANEDER: nummer(levet.totalMaaneder),
    MAANEDER_IALT: nummer(levet.aar * 12 + levet.maaneder),
    TIMER: nummer(levet.totalTimer),
    MINUTTER: nummer(levet.totalMinutter),
    DAGE2007: dage2007(iso, locale),
  };
}

/** Erstatter `{ALDER}`-pladsholderne i én tekst. */
export function erstatAlderTokens(
  tekst: string,
  vaerdier: Record<AlderToken, string>
): string {
  return ALDER_TOKENS.reduce(
    (udfyldt, token) => udfyldt.replaceAll(`{${token}}`, vaerdier[token]),
    tekst
  );
}
