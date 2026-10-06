/**
 * De tal `/kvadratmeter` gentager i sin egen tekst — i metadata og i seks af
 * sine FAQ-svar — i alle tre sprog.
 *
 * Svarene var skrevet i hånden, og de håndskrevne tal var ikke bare den normale
 * drift: to af dem var **forkerte i to af de tre sprog**, fordi et dansk
 * punktum var skrevet ind i en svensk og en norsk sætning.
 *
 * - «1 m² = 10.000 cm². 10.000 m² = 1 hektar.» Svensk og norsk læser
 *   "10.000" som ti nul nul nul, og `FAQSchema` publicerer begge svar som
 *   JSON-LD, så Google citerer dem.
 * - «Ved 150 kr./m² blir det 3.000 kr for 20 m².» Samme fejl — og den samme
 *   sætning står i `page.tsx` med korrekt svensk notation, så FAQ'en modsagde
 *   brødteksten ovenover.
 *
 * Alt læses nu fra de moduler værktøjet og sidens egne regneeksempler bruger:
 * {@link AREAL_EKSEAMPLER} til de fire figurer, {@link PRIS_EKSEMPEL} til
 * prisen og omregningsfaktorerne nedenfor. Dansk er byte-uændret; svensk og
 * norsk får det mellemrum, begge sprog skriver med.
 *
 * Materialernes prisintervaller («Laminat 80-200 kr/m²») har ingen kilde i
 * repoet, og der opfindes ingen her (punkt 11). De står derfor samlet i
 * {@link MATERIALEPRISER} med `omraade: "danmark"`, og de svenske og norske
 * svar siger i sætningen, at niveauet er dansk — samme behandling som
 * `timepris-markedspriser.ts` gav frilanstimepriserne, der ellers lovede ét
 * dansk niveau i tre lande. Enheden er «kr/m²» på alle tre, fordi det er den
 * sidens egen `getCurrencySuffix` skriver; de svenske og norske intervaller
 * skrev før «SEK/m²» og «NOK/m²» om de samme danske tal.
 */

import { formatBelob } from "./format";
import {
  CM2_PR_M2,
  M2_PR_HAKTAR,
  PRIS_EKSEMPEL,
  SQ_FT_PR_M2,
  VAERELSE_EKSEMPLER,
  arealEksempel,
  type ArealEksempelId,
} from "./areal-eksempler";
import {
  ACRE_I_M2,
  FOD_I_METER,
  KVADRATFOD_I_M2,
  KVADRATFOD_PR_ACRE,
  OMREGNINGS_EKSEAMPLER,
  arealEnhed,
  omregnAreal,
  rundAreal,
  type ArealEnhedId,
} from "./areal-omregner";
import type { Locale } from "./i18n";

/**
 * Branchens tommelfingerregel for spild, som to af svarene om at købe noget
 * citerer. Det er den samme regel, `kvadratmeter-materialer.ts` dokumenterer i
 * sin `KILDE.beskrivelse`, så den står her frem for som et tredje håndskrevet
 * «5-10 %».
 */
export const SPILD_PCT = { min: 5, maks: 10 } as const;

export type MaterialeprisId = "laminat" | "traegulv" | "fliser";

export interface Materialepris {
  id: MaterialeprisId;
  /** Navnet på materialet, pr. domæne. */
  navn: Record<Locale, string>;
  min: number;
  maks: number;
  /**
   * Hvilket marked tallene gælder. Der er ingen kilde i repoet på svensk eller
   * norsk materialepris, så tallene er danske på alle tre domæner, og de to
   * andre svar siger det i sætningen.
   */
  omraade: "danmark";
}

/** De tre materialer FAQ'en nævner, med de intervaller siden altid har skrevet. */
export const MATERIALEPRISER: Materialepris[] = [
  { id: "laminat", navn: { da: "Laminat", se: "Laminat", no: "Laminat" }, min: 80, maks: 200, omraade: "danmark" },
  { id: "traegulv", navn: { da: "trægulv", se: "trägolv", no: "tregulv" }, min: 300, maks: 800, omraade: "danmark" },
  { id: "fliser", navn: { da: "fliser", se: "kakel", no: "fliser" }, min: 200, maks: 500, omraade: "danmark" },
];

/** Sand for `se` og `no` — de domæner viser danske materialpriser. */
export function materialepriserErDanske(locale: Locale): boolean {
  return locale !== "da";
}

/** Tusindtalsseparatoren kommer fra `Intl` pr. sprog: punktum i dansk, mellemrum i svensk og norsk. */
const n = (vaerdi: number, locale: Locale, decimaler = 0) => formatBelob(vaerdi, locale, decimaler);

/** Antal decimaler et heltal skrives med, og to for et brødtal. */
const dec = (tal: number) => (Number.isInteger(tal) ? 0 : 2);

/** Ét led i et regnestykke, med sit eget antal decimaler. */
const led = (id: ArealEksempelId, index: number, locale: Locale) =>
  n(arealEksempel(id).tal[index], locale, dec(arealEksempel(id).tal[index]));

/** Facit for én figur, med den decimaler eksemplet vises med. */
const facit = (id: ArealEksempelId, locale: Locale) => {
  const eksempel = arealEksempel(id);
  return n(eksempel.areal, locale, eksempel.decimaler);
};

/**
 * De fire regnestykker uden enheden på leddene, som både brødteksten og
 * FAQ'en skriver dem: `5 × 4`, `3,14 × 3 × 3`, `(6 × 4) / 2`,
 * `((4 + 6) / 2) × 3`.
 */
function udtryk(id: ArealEksempelId, locale: Locale): string {
  switch (id) {
    case "rektangel":
      return `${led(id, 0, locale)} × ${led(id, 1, locale)}`;
    case "cirkel":
      return `${led(id, 0, locale)} × ${led(id, 1, locale)} × ${led(id, 2, locale)}`;
    case "trekant":
      return `(${led(id, 0, locale)} × ${led(id, 1, locale)}) / 2`;
    case "trapez":
      return `((${led(id, 0, locale)} + ${led(id, 1, locale)}) / 2) × ${led(id, 2, locale)}`;
  }
}

/** «5-10 %» i det sprog svaret skrives på. */
const SPILD = (locale: Locale) => `${n(SPILD_PCT.min, locale)}-${n(SPILD_PCT.maks, locale)} %`;

/** «3,5 × 4,2 m» — værelseseksemplets mål, med hvert tals egne decimaler. */
function vaerelseMaal(i: number, locale: Locale): string {
  const { laengde, bredde } = VAERELSE_EKSEMPLER[i];
  return `${n(laengde, locale, dec(laengde))} × ${n(bredde, locale, dec(bredde))} m`;
}

/** «3 m × 4 m» — samme mål med enheden på begge tal, som det korte svar skriver. */
function vaerelseMaalMedEnhed(i: number, locale: Locale): string {
  const { laengde, bredde } = VAERELSE_EKSEMPLER[i];
  return `${n(laengde, locale, dec(laengde))} m × ${n(bredde, locale, dec(bredde))} m`;
}

/** Værelsets areal, regnet herfra — og med så mange decimaler, det kræver. */
function vaerelseAreal(i: number, locale: Locale): string {
  const { laengde, bredde } = VAERELSE_EKSEMPLER[i];
  return n(laengde * bredde, locale, dec(laengde * bredde));
}

/** «20 m²» — det areal priseksemplet regner på. */
const AREAL20 = (locale: Locale) => `${n(PRIS_EKSEMPEL.areal, locale)} m²`;
/** «150 kr./m²» — prisen pr. m² i priseksemplet. */
const PRIS_M2 = (locale: Locale) => `${n(PRIS_EKSEMPEL.prisPrM2, locale)} kr./m²`;
/** «3.000 kr.» i dansk, «3 000 kr» i svensk og norsk. */
const PRIS_BELOEB = (locale: Locale) => `${n(PRIS_EKSEMPEL.pris, locale)} kr${locale === "da" ? "." : ""}`;
/** De tre materialer som én kommasepareret liste med deres interval. */
function materialeliste(locale: Locale): string {
  return MATERIALEPRISER.map(
    (m) => `${m.navn[locale]} ${n(m.min, locale)}-${n(m.maks, locale)} kr/m²`,
  ).join(", ");
}

/**
 * De svar, der indeholder tal, i det sprog de publiceres i. Nøglen er det
 * spørgsmål, svaret hænger ved, så `page-data.ts` ikke kan bytte to svar om.
 * Den norske FAQ stiller kun fire af de seks spørgsmål, så `no` får kun dem.
 */
export type KvadratmeterFaqSvar = Partial<
  Record<"grundregel" | "metode" | "vaerelse" | "gulvpris" | "omregning" | "materialer", string>
>;

export function kvadratmeterFaqSvar(locale: Locale): KvadratmeterFaqSvar {
  if (locale === "se") {
    return {
      grundregel: `Multiplicera längd med bredd. ${udtrykMedEnhed("rektangel", "se")} = ${facit("rektangel", "se")} m².`,
      metode: `Area = längd × bredd. ${udtrykMedEnhed("rektangel", "se")} är ${facit("rektangel", "se")} m². En cirkel med radien ${led("cirkel", 1, "se")} m är ${udtryk("cirkel", "se")} = ${facit("cirkel", "se")} m², en triangel med grundlinje ${led("trekant", 0, "se")} m och höjd ${led("trekant", 1, "se")} m är ${udtryk("trekant", "se")} = ${facit("trekant", "se")} m², och ett trapets med sidorna ${led("trapez", 0, "se")} m och ${led("trapez", 1, "se")} m och höjden ${led("trapez", 2, "se")} m är ${udtryk("trapez", "se")} = ${facit("trapez", "se")} m².`,
      vaerelse: `${vaerelseMaalMedEnhed(0, "se")} = ${vaerelseAreal(0, "se")} m². Ett rum på ${vaerelseMaal(1, "se")} är ${vaerelseAreal(1, "se")} m². Kom ihåg att lägga ${SPILD("se")} till om du ska köpa golv eller målning till det.`,
      gulvpris: `Golvet kostar ${AREAL20("se")} × pris per m². Vid ${PRIS_M2("se")} blir det ${PRIS_BELOEB("se")} för ${AREAL20("se")}. Lägg ${SPILD("se")} till för kapning och spill.`,
      omregning: `1 m² = ${n(CM2_PR_M2, "se")} cm². ${n(M2_PR_HAKTAR, "se")} m² = 1 hektar. 1 m² ≈ ${n(SQ_FT_PR_M2, "se", 2)} sq ft.`,
      materialer: `${materialeliste("se")}. Nivåerna är danska — vi saknar en källa till svenska materialpriser.`,
    };
  }

  if (locale === "no") {
    return {
      grundregel: `Gang lengde med bredde. ${udtrykMedEnhed("rektangel", "no")} = ${facit("rektangel", "no")} m².`,
      gulvpris: `Gulvet koster ${AREAL20("no")} × pris pr. m². Ved ${PRIS_M2("no")} blir det ${PRIS_BELOEB("no")} for ${AREAL20("no")}. Legg ${SPILD("no")} til for kapping og spill.`,
      omregning: `1 m² = ${n(CM2_PR_M2, "no")} cm². ${n(M2_PR_HAKTAR, "no")} m² = 1 hektar. 1 m² ≈ ${n(SQ_FT_PR_M2, "no", 2)} sq ft.`,
      materialer: `${materialeliste("no")}. Nivåene er danske — vi mangler en kilde til norske materialpriser.`,
    };
  }

  return {
    grundregel: `Gang længde med bredde. ${udtrykMedEnhed("rektangel", "da")} = ${facit("rektangel", "da")} m².`,
    metode: `Arealet er længde × bredde. ${udtrykMedEnhed("rektangel", "da")} er ${facit("rektangel", "da")} m². En cirkel med radius ${led("cirkel", 1, "da")} m er ${udtryk("cirkel", "da")} = ${facit("cirkel", "da")} m², en trekant med grundlinje ${led("trekant", 0, "da")} m og højde ${led("trekant", 1, "da")} m er ${udtryk("trekant", "da")} = ${facit("trekant", "da")} m², og et trapez med siderne ${led("trapez", 0, "da")} m og ${led("trapez", 1, "da")} m og højden ${led("trapez", 2, "da")} m er ${udtryk("trapez", "da")} = ${facit("trapez", "da")} m².`,
    vaerelse: `${vaerelseMaalMedEnhed(0, "da")} = ${vaerelseAreal(0, "da")} m². Et værelse på ${vaerelseMaal(1, "da")} er ${vaerelseAreal(1, "da")} m². Husk at lægge ${SPILD("da")} til, hvis du skal købe gulv eller maling til det.`,
    gulvpris: `Gulvet koster ${AREAL20("da")} × pris pr. m². Ved ${PRIS_M2("da")} bliver det ${PRIS_BELOEB("da")} for ${AREAL20("da")}. Læg ${SPILD("da")} til for tilskæring og spild.`,
    omregning: `1 m² = ${n(CM2_PR_M2, "da")} cm². ${n(M2_PR_HAKTAR, "da")} m² = 1 hektar. 1 m² ≈ ${n(SQ_FT_PR_M2, "da", 2)} sq ft.`,
    materialer: `${materialeliste("da")}.`,
  };
}

/**
 * Som {@link udtryk}, men med enheden på hvert led: «5 m × 4 m». Det er den
 * form både FAQ-svarene og brødteksten bruger, så målet kun findes i én
 * skrivemåde: brødteksten skriver «5 × 4» i det fede og denne i løbeteksten.
 */
function udtrykMedEnhed(id: ArealEksempelId, locale: Locale): string {
  return udtryk(id, locale)
    .split(" × ")
    .map((led) => `${led} m`)
    .join(" × ");
}

/** Facit for de fire figurer, så en side kan skrive dem uden at regne dem selv. */
export function kvadratmeterFacit(locale: Locale): Record<ArealEksempelId, string> {
  return {
    rektangel: facit("rektangel", locale),
    cirkel: facit("cirkel", locale),
    trekant: facit("trekant", locale),
    trapez: facit("trapez", locale),
  };
}

/** Regnestykkerne for de fire figurer, som brødteksten skriver dem. */
export function kvadratmeterUdtryk(locale: Locale): Record<ArealEksempelId, string> {
  return {
    rektangel: udtryk("rektangel", locale),
    cirkel: udtryk("cirkel", locale),
    trekant: udtryk("trekant", locale),
    trapez: udtryk("trapez", locale),
  };
}

/** «5 x 4 m» — samme mål med mellemrum omkring x, som metadata skriver dem. */
export function kvadratmeterEksempelMaal(locale: Locale): string {
  return `${led("rektangel", 0, locale)} x ${led("rektangel", 1, locale)} m`;
}

/** «5 x 4 m er 20 m²» — «är» på svensk, ellers «er». */
export function kvadratmeterEksempelAreal(locale: Locale): string {
  return `${kvadratmeterEksempelMaal(locale)} ${locale === "se" ? "är" : "er"} ${facit("rektangel", locale)} m²`;
}

/** «5 x 4 m = 20 m²» — samme eksempel med lighedstegn, som titlerne bruger. */
export function kvadratmeterEksempelLignelse(locale: Locale): string {
  return `${kvadratmeterEksempelMaal(locale)} = ${facit("rektangel", locale)} m²`;
}

/**
 * «5 × 4 = 20 m²» — samme eksempel skrevet med gangetegn og uden enheden på
 * begge tal, som `description`s midterdel bruger («så 5 × 4 = 20 m²»).
 */
export function kvadratmeterEksempelProdukt(locale: Locale): string {
  return `${led("rektangel", 0, locale)} × ${led("rektangel", 1, locale)} = ${facit("rektangel", locale)} m²`;
}

/** «m²», «cm²», «km²», «ha», «kvadratfod» og «acre» som brødteksten skriver dem. */
const OMREGNINGS_ETIKET: Record<ArealEnhedId, Record<Locale, string>> = {
  m2: { da: "m²", se: "m²", no: "m²" },
  cm2: { da: "cm²", se: "cm²", no: "cm²" },
  km2: { da: "km²", se: "km²", no: "km²" },
  hektar: { da: "hektar", se: "hektar", no: "hektar" },
  kvadratfod: { da: "kvadratfod", se: "kvadratfot", no: "kvadratfot" },
  acre: { da: "acre", se: "acre", no: "acre" },
};

/**
 * De tre omregninger brødteksten skriver, som «500 kvadratfod = 46,45 m²».
 * Begge tal regnes i {@link OMREGNINGS_EKSEAMPLER}, så sætningen ikke kan
 * få en faktor, værktøjet ikke bruger (punkt 11).
 */
export function kvadratmeterOmregninger(
  locale: Locale,
): { foer: string; efter: string }[] {
  return OMREGNINGS_EKSEAMPLER.map(({ vaerdi, fra, til }) => ({
    foer: `${n(vaerdi, locale)} ${OMREGNINGS_ETIKET[fra][locale]}`,
    efter: `${n(
      rundAreal(omregnAreal(vaerdi, fra, til), til),
      locale,
      arealEnhed(til).decimaler,
    )} ${OMREGNINGS_ETIKET[til][locale]}`,
  }));
}

/**
 * De to eksakte omregningsfaktorer brødteksten retfærdiggør tallene med,
 * formateret i det sprog de publiceres i. «4.046,8564224» på dansk er
 * 4046,8564224 i svensk notation — samme fejl som `kvadratmeter-eksempler.ts`
 * blev bygget for at fjerne, så de læses fra `formatBelob` herfra.
 */
export function kvadratmeterOmregningsFakta(locale: Locale): {
  kvadratfodM2: string;
  acreM2: string;
  fodMeter: string;
  kvadratfodPrAcre: string;
} {
  return {
    kvadratfodM2: n(KVADRATFOD_I_M2, locale, 8),
    acreM2: n(ACRE_I_M2, locale, 7),
    fodMeter: n(FOD_I_METER, locale, 4),
    kvadratfodPrAcre: n(KVADRATFOD_PR_ACRE, locale),
  };
}

/** «5 × 4» — rektangleksemplets led uden enhed, til sider der skriver «= 20 m²» ved siden af. */
export function kvadratmeterRektangelUdtryk(locale: Locale): string {
  return `${led("rektangel", 0, locale)} × ${led("rektangel", 1, locale)}`;
}

/** Totalprisen for {@link PRIS_EKSEMPEL} i det sprog sætningen skrives på. */
export function kvadratmeterPrisBeloeb(locale: Locale): string {
  return PRIS_BELOEB(locale);
}

/**
 * Prisen pr. m² i {@link PRIS_EKSEMPEL}, som «150 kr./m²». Den danske brødtekst
 * skriver «kr./m²» og den svenske «kr/m²», så formen vælges af kaldet.
 */
export function kvadratmeterPrisPrM2(locale: Locale, form: "kr./m²" | "kr/m²" = "kr./m²"): string {
  return `${n(PRIS_EKSEMPEL.prisPrM2, locale)} ${form}`;
}

/** Arealet i {@link PRIS_EKSEMPEL}, som «20 m²». */
export function kvadratmeterPrisAreal(locale: Locale): string {
  return AREAL20(locale);
}