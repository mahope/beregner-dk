/**
 * De tal `/konfirmation` gentager i sin egen tekst — i brødteksten på to
 * domæner og i to af sidens fire FAQ-svar — i alle tre sprog.
 *
 * Svarene var skrevet i hånden, og de håndskrevne tal var ikke bare den normale
 * drift. Målt 3/10 mod `KonfirmationBeregner`s egne konstanter fandt den **to**
 * fejl af den slags, og den ene af dem lå i to sprog ad gangen:
 *
 * - **Svensk og norsk lovede et *samlet* beløb på 10.000-30.000.** Beregnerens
 *   standardforløb (30 gæster, forsamlingshus, fotograf med) summerer til
 *   19.600 kr. i festen + 19.100 kr. i gaver = **38.700 kr.** Så de to svar
 *   lovede under halvdelen af sit eget værktøj — præcis den fejl, den danske
 *   gren havde, og som blev rettet i commit `99473a6`. De to andre sprog blev
 *   ladt stå.
 * - **Samme to svar skrev «10.000» med dansk punktum** i en svensk og en norsk
 *   sætning. En svensk læser «10.000» som hundrede tusind, og
 *   `FAQSchema` publicerer svaret som JSON-LD, så Google citerer det. Det er
 *   den samme fejl `/kvadratmeter` og `/kalorier` havde.
 * - **Samme to svar skrev «SEK» og «NOK»**, mens hele resten af de svenske og
 *   norske sider — brødtekst, beregnerens resultatblok, sidens egen
 *   `getCurrencySuffix` — skriver «kr». Den svenske brødtekst siger oveni
 *   «mellan **10 000 och 25 000 kr** i presenter», så FAQ'en modsagde
 *   brødteksten ovenover på den samme side.
 * - **Norsk lovede 3.000-8.000 kr. til forældre**, mens den danske søster
 *   lovede 2.000-5.000 kr. — for *samme* beregner, der bruger
 *   `GAVEGENNEMSNIT.foraeldre = 3000` på alle tre domæner.
 * - **Brødteksten lovede to forskellige intervaller for den samme
 *   fotograf.** Dansk skrev «omkring 1.000-3.000 kr.» og svensk «kring
 *   1 500-4 000 kr», for én og samme konstant på 1.500 kr.
 *
 * Alt læses nu herfra, i alle tre sprog, med hver sprog egen
 * tusindtalsseparator. Dansk er byte-uændret; svensk og norsk får mellemrum,
 * begge sprog skriver med, og de får de **snævrere** danske intervaller, fordi
 * de er dem, beregnerens egne priser ligger i.
 *
 * At gøre det sådan er ikke et krav om at vide det svenske marked: det er
 * fjernelsen af en modsigelse. `KonfirmationBeregner` har **én** pristabel for
 * alle tre domæner — 1.500 kr. i fotograf på både minberegner.dk og
 * beraknare.se — så en svensk sætning, der lover et *andet* interval, lover
 * noget værktøjet ikke holder. Det snævreste interval er det, alle tre
 * domæners beregner kan indfri, og det er derfor det, der står på alle tre.
 * Beregnerens egen mærkat — «Priserne er vejledende estimater for 2026» —
 * dækker det manglende markedstal, som den gjorde for denne opgave.
 *
 * Intervallerne her har ingen kilde i repoet, og der opfindes ingen ny
 * (punkt 11). De er **de intervaller siden altid har skrevet**, samlet ét
 * sted og deklareret med den regel, der holder dem ærlige: hvert af dem skal
 * rumme den konstant, `KonfirmationBeregner` regner med. Det er ikke en
 * tilladelsesliste, det er en bivirkning — `konfirmation-eksempler.test.ts`
 * dømmer hver enkelt af de syv par, så hvis nogen sætter
 * `PRISER.restaurant.madPrPerson` til 900, bliver porten rød i stedet for at
 * siden begynder at lyve. (Derfor står konstanterne i denne fil *ikke* som
 * import af komponenten: modulet er rent data, og porten går den anden vej.)
 */

import { formatBelob } from "./format";
import type { Locale } from "./i18n";

/** Et prisinterval, som brødteksten skriver «min-maks». */
export interface Interval {
  min: number;
  maks: number;
}

/**
 * Mad og drikke pr. gæst. `KonfirmationBeregner` bruger 200 kr. hjemme,
 * 350 kr. i forsamlingshus og 550 kr. på restaurant, og alle tre ligger i
 * deres interval — det er prøven, der binder sammen de to sider af påstanden.
 *
 * Forsamlingshuset står i tabellen, men ikke i de to afsnit, kun fordi de to
 * afsnit nævner yderpunkterne. Det er beregnerens forvalg.
 */
export const MAD_PR_PERSON = {
  hjemme: { min: 150, maks: 200 },
  forsamlingshus: { min: 250, maks: 450 },
  restaurant: { min: 400, maks: 700 },
} as const satisfies Record<string, Interval>;

/** Konfirmandtøj. Beregneren bruger 2.500 kr. */
export const KONFIRMANDTOEJ: Interval = { min: 1_500, maks: 4_000 };

/** Fotograf. Beregneren bruger 1.500 kr. — det danske interval, ikke det svenske. */
export const FOTOGRAF: Interval = { min: 1_000, maks: 3_000 };

/**
 * Gaverne samlet. Beregnerens standardforløb giver 19.100 kr. (2 forældre, 4
 * bedsteforældre, 8 øvrig familie, 5 venner), så intervallet er det, der lægges
 * *oveni* festens egne udgifter — ikke et samlet budget. Det var forvekslingen
 * i de svenske og norske svar.
 */
export const GAVEINTERVAL: Interval = { min: 10_000, maks: 25_000 };

/** Gavebeløb pr. relation. Beregneren bruger 3.000 kr. og 1.500 kr. */
export const GAVEBELOB = {
  foraeldre: { min: 2_000, maks: 5_000 },
  bedsteforaeldre: { min: 1_000, maks: 2_000 },
} as const satisfies Record<string, Interval>;

/** Tusindtalsseparatoren kommer fra `Intl` pr. sprog: punktum i dansk, mellemrum i svensk og norsk. */
const n = (vaerdi: number, locale: Locale) => formatBelob(vaerdi, locale);

/** Dansk skriver «kr.», svensk og norsk «kr» — sidens egen `getCurrencySuffix`. */
const kr = (locale: Locale) => (locale === "da" ? "kr." : "kr");

/** «1.000-4.000 kr.» i dansk, «1 000-4 000 kr» i svensk og norsk. */
function interval(i: Interval, locale: Locale): string {
  return `${n(i.min, locale)}-${n(i.maks, locale)} ${kr(locale)}`;
}

/**
 * Ét punkt i en sætning, hvor intervallet er indlejret: «Forældre: 2.000-5.000
 * kr.». Dansk skriver allerede sit eget punktum efter «kr.», så lægges der
 * ikke et til — ellers får svaret «2.000-5.000 **kr..**», som `/leasing` havde
 * i to dage (punkt 13). Svensk og norsk skal derimod have punktumet sat ind.
 */
function gavepunkt(label: string, i: Interval, locale: Locale): string {
  const punktum = locale === "da" ? "" : ".";
  return `${label}: ${interval(i, locale)}${punktum}`;
}

/**
 * De tal, `/konfirmation`'s to brødtekster skriver. Svensk og norsk læser de
 * samme intervaller som dansk, formatteret i sit eget sprog.
 *
 * Navnene er de, `page.tsx` bruger som nøgle — de to afsnit er skrevet i to
 * sprog og kan derfor ikke dele én sætning.
 */
export interface KonfirmationBrødtekstTal {
  /** «150-200 kr./person» — mad og drikke hjemme. */
  madHjemme: string;
  /** «400-700 kr./person» — mad og drikke på restaurant. */
  madRestaurant: string;
  /** «1.500-4.000 kr.» — konfirmandtøjets pris. */
  konfirmandtoej: string;
  /** «1.000-3.000 kr.» — fotografens pris. */
  fotograf: string;
  /** «10.000 og 25.000 kr.» — gaverne samlet, med sprog egen «og». */
  gaver: string;
}

export function konfirmationBrødtekstTal(locale: Locale): KonfirmationBrødtekstTal {
  const og = locale === "se" ? "och" : "og";
  return {
    madHjemme: `${interval(MAD_PR_PERSON.hjemme, locale)}/person`,
    madRestaurant: `${interval(MAD_PR_PERSON.restaurant, locale)}/person`,
    konfirmandtoej: interval(KONFIRMANDTOEJ, locale),
    fotograf: interval(FOTOGRAF, locale),
    gaver: `${n(GAVEINTERVAL.min, locale)} ${og} ${n(GAVEINTERVAL.maks, locale)} ${kr(locale)}`,
  };
}

/**
 * De to FAQ-svar, der indeholder tal. Nøglen er spørgsmålet, svaret hænger
 * ved, så `page-data.ts` ikke kan bytte to svar om.
 *
 * `koster` er det samme svar i alle tre sprog, og det siger det samme: gaverne
 * er et interval, og det er *festens egne udgifter* derudover, værktøjet
 * summerer. De svenske og norske versioner lovede før et samlet beløb på
 * 10.000-30.000 — altså *mindre* end deres egen beregner — i en streng med
 * dansk tusindtalsseparator og en valutaenhed, ingen anden sted på siderne
 * bruger.
 */
export type KonfirmationFaqSvar = Record<"koster" | "gavebelob", string>;

export function konfirmationFaqSvar(locale: Locale): KonfirmationFaqSvar {
  const t = konfirmationBrødtekstTal(locale);
  if (locale === "se") {
    return {
      koster: `Presenterna ligger typiskt mellan ${t.gaver} ovanpå festens egna utgifter. Kalkylatorn lägger ihop mat, lokalhyra, konfirmationskläder och fotograf med presenterna, så du ser det totala beloppet för din egen konfirmation.`,
      gavebelob: [
        gavepunkt("Föräldrar", GAVEBELOB.foraeldre, locale),
        gavepunkt("Mor-/farföräldrar", GAVEBELOB.bedsteforaeldre, locale),
      ].join(" "),
    };
  }
  if (locale === "no") {
    return {
      koster: `Gavene ligger typisk mellom ${t.gaver} i tillegg til festens egne utgifter. Kalkulatoren legger sammen mat, lokalleie, konfirmantklær og fotograf med gavene, så du ser det samlede beløpet for din egen konfirmasjon.`,
      gavebelob: [
        gavepunkt("Foreldre", GAVEBELOB.foraeldre, locale),
        gavepunkt("Besteforeldre", GAVEBELOB.bedsteforaeldre, locale),
      ].join(" "),
    };
  }
  return {
    koster: `Gaverne ligger typisk mellem ${t.gaver} oveni festens egne udgifter. Beregneren lægger mad, lokaleleje, konfirmandtøj og fotograf sammen med gaverne, så du ser det samlede beløb for din egen konfirmation.`,
    gavebelob: [
      gavepunkt("Forældre", GAVEBELOB.foraeldre, locale),
      gavepunkt("Bedsteforældre", GAVEBELOB.bedsteforaeldre, locale),
    ].join(" "),
  };
}
