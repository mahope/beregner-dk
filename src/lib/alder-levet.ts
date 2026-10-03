import { beregnAlder } from "./alder";
import { getIntlLocale } from "./format";
import type { Locale } from "./i18n";
import { parseIsoDato, tilIsoDato } from "./lokal-dato";

/**
 * "Hvor mange dage har du levet?" — den søgning, der står som nummer tre på
 * beraknare.se's /dato (385 visninger, pos. 10) og nummer syv under "hvor gammel
 * er jeg" i dansk autocomplete. Den er *ikke* et datoberegner-spørgsmål: den
 * spørger om ens egen levetid, så det er /alder der kan svare, fordi det er
 * eneste af de to værktøjer der kender fødselsdatoen.
 *
 * Hvert tal her kommer fra `beregnAlder` — samme modul som værktøjet bruger —
 * så brødteksten ikke kan love et tal, logikken modsiger. Reference-datoen
 * er et argument og ikke "i dag", så en test kan låse tallene på en bestemt
 * dag.
 */

export interface AlderLevet {
  /** Fødselsdatoen i eksemplet, som "YYYY-MM-DD". */
  foedselsdato: string;
  /** Alder i hele år, måneder og dage, formateret til siden. */
  aar: number;
  maaneder: number;
  dage: number;
  /** Hele dage siden fødslen. */
  totalDage: number;
  /** Hele uger siden fødslen. */
  totalUger: number;
  /** Hele måneder siden fødslen. */
  totalMaaneder: number;
  /** Hele timer siden fødslen — 24 timer pr. døgn, aldrig 23 eller 25. */
  totalTimer: number;
  /** Hele minutter siden fødslen. */
  totalMinutter: number;
}

/**
 * Den fødselsdato, eksemplerne på siden allerede bruger: 15. marts 1990. Den er
 * valgt, fordi den står i sidens egen beskrivelse, så læseren kan tjekke
 * hele rækken mod det, han læser to centimeter over.
 */
export const LEVET_FOEDSELSDATO = "1990-03-15";

export function alderLevet(referenceIso: string): AlderLevet {
  const r = beregnAlder({
    foedselsdato: LEVET_FOEDSELSDATO,
    beregningsdato: referenceIso,
  });
  if (!r) {
    throw new Error(
      `Levetids-eksemplet ${LEVET_FOEDSELSDATO} mod ${referenceIso} kan ikke beregnes af beregnAlder`
    );
  }
  return {
    foedselsdato: LEVET_FOEDSELSDATO,
    aar: r.aar,
    maaneder: r.maaneder,
    dage: r.dage,
    totalDage: r.totalDage,
    totalUger: r.totalUger,
    totalMaaneder: r.totalMaaneder,
    totalTimer: r.totalTimer,
    totalMinutter: r.totalMinutter,
  };
}

/**
 * Flødeformen af "dage" i sidens eget sprog: "dage", "dagar", "dager".
 *
 * Ordet lå tidligere skrevet ind i den tekst, der bruger det — og
 * `dage2007` i `alder-side-tekst.ts` skrev "dage" *uanset* sprog, så en svensk
 * og en norsk sætning fik dansk. Det er en regel, ikke en formateringsdetalje,
 * så den har én ejer her, ligesom `formatAlder` har sin egen ord-gren pr. sprog.
 */
export function dageEnhed(locale: Locale): string {
  if (locale === "se") return "dagar";
  if (locale === "no") return "dager";
  return "dage";
}

/**
 * "13.343 dage" / "13 343 dagar" / "13 348 dager" — med den locale's egen
 * tusindtalsseparator. Dansk og svensk bruger begge et tegn, der ikke er et
 * almindeligt mellemrum i den server-renderede HTML, så formatteres tallet her
 * og ikke i teksten.
 */
export function formatDageLived(l: AlderLevet, locale: Locale): string {
  return `${formatDageTal(l.totalDage, locale)} ${dageEnhed(locale)}`;
}

/**
 * "13.343" alene — til de steder hvor dage/dagar står i kolonneoverskriften.
 *
 * Zonen kommer fra `getIntlLocale`, der kender alle tre sprog. Den var før
 * `locale === "se" ? "sv-SE" : "da-DK"`, som gav norsk `da-DK` — altså dansk
 * tusindtalsseparator på en norsk side.
 */
export function formatDageTal(tal: number, locale: Locale): string {
  return new Intl.NumberFormat(getIntlLocale(locale)).format(tal);
}

/**
 * "Så mange dage har du levet som 10-årig?" — den aldersbestemte udgave af
 * "hvor mange dage har du levet".
 *
 * Datagrund: Googles egen autocomplete målt 3/10 16:4x gav otte af de ti
 * svenske søgninger under "hur många dagar har man levt" spørgsmålet om en
 * bestemt alder — 8, 10, 12, 13, 14 og 15 år plus "hur många dagar har man
 * levt när man fyller 50 år". Den danske autocomplete giver kun de to
 * upersonlige varianter, så tallene er de samme i begge sprog, og rækkerne er
 * de otte aldre dansk autocomplete spørger om.
 *
 * Hver række regnes af `beregnAlder` på en fødselsdato, der ligger præcis N år
 * før reference-datoen — altså den, der fylder N år *den dag, siden læses*. En
 * fødselsdato en dag tidligere eller senere på året giver dage-tallet et helt
 * år lavere eller højere, fordi "N år gammel" dækker et fødselsdato-vindue på
 * et år. Derfor er overskriften "den, der fylder N år i dag" og ikke "en N-årig",
 * og derfor peger teksten på værktøjets eget fødselsdato-felt.
 *
 * 29. februar er ikke et fødselsdato-vindue i et skudår, så en sådan fødselsdag
 * får sin N-års dag 28. februar — den konvention er eksplicit, fordi alternativet
 * er en fødselsdato der ruller ind i marts.
 */

export interface LevetVedAlder {
  /** Alderen i hele år — fødselsdatoen ligger præcis så mange år før reference-datoen. */
  aar: number;
  /** Fødselsdatoen som "YYYY-MM-DD". */
  foedselsdato: string;
  /** Hele kalenderdage siden fødslen. */
  totalDage: number;
  /** Hele uger siden fødslen. */
  totalUger: number;
  /** Hele måneder siden fødslen. */
  totalMaaneder: number;
}

/** Alder 1-18: de otte aldre svensk autocomplete spørger om, plus alle imellem. */
export const BARN_ALDRER: readonly number[] = Array.from({ length: 18 }, (_, i) => i + 1);

/** De voksnealdre der er målt som autocomplete: især "när man fyller 50 år". */
export const VOKSNE_ALDRER: readonly number[] = [20, 25, 30, 40, 50, 60, 70, 80];

export const MIN_ALDER = 1;
export const MAX_ALDER = 120;

/**
 * Fødselsdatoen for den, der fylder `aar` år på `referenceIso`. 29. februar
 * bliver 28. februar, fordi `new Date(år, 1, 29)` i et skudår ellers ruller
 * videre til 1. marts og gav en fødselsdato en måned forskudt.
 */
export function foedselsdatoVedAlder(aar: number, referenceIso: string): string | null {
  const iDag = parseIsoDato(referenceIso);
  if (!iDag) return null;
  if (!Number.isInteger(aar) || aar < MIN_ALDER || aar > MAX_ALDER) return null;
  const foedselsaar = iDag.getFullYear() - aar;
  const maaned = iDag.getMonth();
  const sidsteDagIMaaneden = new Date(foedselsaar, maaned + 1, 0).getDate();
  return tilIsoDato(new Date(foedselsaar, maaned, Math.min(iDag.getDate(), sidsteDagIMaaneden)));
}

/**
 * Den dag alders-tabellen regner fra.
 *
 * 29. februar findes kun i skudår, og på den dag giver **ingen** fødselsdato
 * præcis N år: en fødselsdag 29. februar 2008 er 16 år *og* 1 dag den 29.
 * februar 2024, fordi der kun er 8 skuddage — ikke 9 — i de 16 år. Uden denne
 * regel ville `levetVedAlder`s `dage === 0`-invariant gøre *alle* rækkerne
 * tomme hvert fjerde år, og overskriften "fylder alderen i dag" ville være
 * løgnen. Derfor regnes tabellen fra 28. februar i skudår: hver række er så
 * "den der fylder alderen den 28. februar", højst én dag gammel og kun i
 * skudår, og resten af året er den præcise dag.
 */
export function dagForAlderTabel(referenceIso: string): string {
  return referenceIso.endsWith("-02-29") ? `${referenceIso.slice(0, -2)}28` : referenceIso;
}

/**
 * Hele levetiden for den, der fylder `aar` år på `referenceIso`.
 *
 * `aar` i resultatet er en *invariant*, ikke en gentagelse: hvis `beregnAlder`
 * ikke giver præcis den fulde alder — for eksempel fordi en fødselsdato og en
 * reference-dato krydser hinanden — er rækken ubrugelig og funktionen giver
 * `null`, så tabellen aldrig viser en alder, der ikke passer med sit dage-tal.
 */
export function levetVedAlder(aar: number, referenceIso: string): LevetVedAlder | null {
  const foedselsdato = foedselsdatoVedAlder(aar, referenceIso);
  if (!foedselsdato) return null;
  const r = beregnAlder({ foedselsdato, beregningsdato: referenceIso });
  if (!r || r.aar !== aar || r.maaneder !== 0 || r.dage !== 0) return null;
  return {
    aar,
    foedselsdato,
    totalDage: r.totalDage,
    totalUger: r.totalUger,
    totalMaaneder: r.totalMaaneder,
  };
}
