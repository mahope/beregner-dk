/**
 * The numbers /pension repeats in its own metadata and its eleven FAQ answers.
 *
 * `src/lib/folkepension.ts` is the single source of truth for the 2026 rates
 * (borger.dk, verified 25/9) and `satser-2026.ts` for the ratepension and
 * aldersopsparing limits (skat.dk). Both were read straight into the sentences
 * in `page-data.ts`, which is the drift the quality rules call out: in 2027 a
 * rate moves in the module, the calculator moves with it, and the search
 * result keeps promising last year's figure. Those answers are not only body
 * text — `FAQSchema` publishes them as JSON-LD, so Google quotes them.
 *
 * So every figure below is `formatBelob` over the same constants the
 * `PensionBeregner` tool and the page body use. The Danish wording is
 * byte-identical to what the page said before, with one exception: the
 * folkepensionsalder answer used to claim "65 år hvis du er født i 1953 eller
 * før" and then jump from 1956 to 1971, which both contradicted
 * `FOLKEPENSION_2026.alderSkala` (1954 and 1955 split at 1. juli into 65 ½ and
 * 66 / 66 ½ years) and left two birth years with no answer at all. It is now
 * built from the scale by {@link folkepensionsalderFaqSprog}.
 */

import { formatBelob, formatNumber } from "./format";
import { FOLKEPENSION_2026, formatFolkepensionsalder } from "./folkepension";
import { SATSER_2026 } from "./satser-2026";

/** The Danish reader, so the module has one separator and the page has one too. */
const DA = "da" as const;

const kr = (vaerdi: number) => formatBelob(vaerdi, DA);
/** «30,9 %» og «32 %» — procentsatsen i løbende tekst, med komma på dansk. */
const pct = (vaerdi: number) => formatBelob(vaerdi * 100, DA, 1);
/** «0,309» — den samme sats som et Excel-tal, med tre decimaler. */
const sats = (vaerdi: number) => formatBelob(vaerdi, DA, 3);

/**
 * The arbejdsmarkedspension worked example, moved out of the sentences. The
 * page body has declared it as local constants and the FAQ repeated the same
 * three figures by hand, so the two could answer differently.
 */
export const PENSION_AMP_EKSEMPEL = { lon: 40000, sats: 0.15 } as const;

/** 40.000 kr at 15 % — the same product `PensionBeregner` shows. */
export function pensionAmpPrMaaned(): number {
  return PENSION_AMP_EKSEMPEL.lon * PENSION_AMP_EKSEMPEL.sats;
}

/**
 * ATP's monthly payout, quoted as the rough range the page has always used.
 * No official rate is on file, so it is declared here rather than presented as
 * sourced — the figure is per person and depends on a lifetime of contributions.
 */
export const PENSION_ATP_MD = { min: 2000, maks: 3000 } as const;

/** The rule of thumb the page gives for saving: 12-17 % of gross pay. */
export const PENSION_SPAREPROCENT = { min: 12, maks: 17 } as const;

/** What a pensioner is generally advised to need, as a share of work income. */
export const PENSION_LEVENIVEAU_PROCENT = { min: 60, maks: 80 } as const;

export interface PensionOverskrifter {
  metaTitle: string;
  description: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
}

/**
 * The answer-first metadata, so the title and the description quote the same
 * folkepension the calculator opens with.
 */
export function pensionOverskrifter(): PensionOverskrifter {
  const enlig = kr(FOLKEPENSION_2026.iAlt.enlig);
  const samlevende = kr(FOLKEPENSION_2026.iAlt.samlevende);
  const metaTitle = `Pensionsberegner 2026: folkepension ${enlig} kr/md`;
  return {
    metaTitle,
    ogTitle: metaTitle,
    description: `Beregn din pension 2026. Folkepensionen er ${enlig} kr/md for enlige og ${samlevende} kr/md for gifte før skat. Se hvad arbejdsmarkedspension og ATP ændrer, og hvor meget du skal opspare.`,
    metaDescription: `Beregn din pension 2026. Folkepensionen er ${enlig} kr/md for enlige og ${samlevende} kr/md for gifte før skat. Se hvad du skal opspare ved siden af.`,
    ogDescription: `Beregn din pension 2026. Folkepensionen er ${enlig} kr/md for enlige og ${samlevende} kr/md for gifte før skat.`,
  };
}

/** One question and its answer, in the shape `page-data.ts` binds. */
export interface PensionFaqItem {
  question: string;
  answer: string;
}

interface Aldertrin {
  alder: number;
  /** First birth date in the step, ISO. */
  fra: string;
  /** Last birth date in the step, ISO, or `null` when the step has no end. */
  til: string | null;
}

function dagenFoer(iso: string): string {
  const dato = new Date(`${iso}T00:00:00Z`);
  dato.setUTCDate(dato.getUTCDate() - 1);
  return dato.toISOString().slice(0, 10);
}

/**
 * The `alderSkala` as age bands, so two steps with the same age become one
 * band. `folkepensionsalder()` clamps everybody born before the first step to
 * that step's age, so the first band has no earlier end.
 */
function alderBånd(): Aldertrin[] {
  const skala = FOLKEPENSION_2026.alderSkala;
  const bånd: Aldertrin[] = [];
  for (let i = 0; i < skala.length; i++) {
    const fra = skala[i].fra;
    const alder = skala[i].alder;
    const sidsteTrin = i === skala.length - 1;
    const til = sidsteTrin ? null : dagenFoer(skala[i + 1].fra);
    const forrige = bånd[bånd.length - 1];
    if (forrige && forrige.alder === alder && forrige.til === fra) {
      forrige.til = til;
    } else {
      bånd.push({ alder, fra, til });
    }
  }
  return bånd;
}

/**
 * A birth band as a reader would say it: "1956-1962", "1. halvdel af 1955",
 * "1971 eller senere". The first band reaches further back than its own step,
 * because anyone born before it gets the same age.
 */
function alderFoedselsaar(bånd: Aldertrin, foerste: boolean): string {
  const [fraAar, fraMaaned] = bånd.fra.split("-").map(Number);
  if (bånd.til === null) return `for født ${fraAar} eller senere`;
  const [tilAar, tilMaaned] = bånd.til.split("-").map(Number);
  if (foerste) return `for alle født ${fraAar} eller tidligere`;
  if (fraAar === tilAar) {
    if (fraMaaned === 1 && tilMaaned === 12) return `for født i ${fraAar}`;
    return `for den ${fraMaaned <= 6 ? "1." : "2."} halvdel af ${fraAar}`;
  }
  return `for født ${fraAar}-${tilAar}`;
}

/**
 * The one-clause-per-age answer to "hvornår kan jeg gå på folkepension",
 * built from `FOLKEPENSION_2026.alderSkala`.
 */
export function folkepensionsalderFaqSprog(): string {
  const klauser = alderBånd().map((bånd, i, alle) => {
    const foedselsaar = alderFoedselsaar(bånd, i === 0);
    const sidste = i === alle.length - 1;
    return `${formatFolkepensionsalder(bånd.alder)} ${foedselsaar}${sidste ? "" : ","}`;
  });
  return `Folkepensionsalderen afhænger af dit fødselsår: ${klauser.join(" ").replace(/,([^,]*)$/, " og$1")}`;
}

/**
 * The eleven questions and answers /pension publishes, every figure read from
 * `folkepension.ts` or `satser-2026.ts`.
 */
export function pensionFaqItems(): PensionFaqItem[] {
  const grund = kr(FOLKEPENSION_2026.grundbeloeb);
  const enligTillaeg = kr(FOLKEPENSION_2026.tillaeg.enlig);
  const samlTillaeg = kr(FOLKEPENSION_2026.tillaeg.samlevende);
  const enligIAlt = kr(FOLKEPENSION_2026.iAlt.enlig);
  const samlIAlt = kr(FOLKEPENSION_2026.iAlt.samlevende);
  const tillaegForskel = kr(FOLKEPENSION_2026.tillaeg.enlig - FOLKEPENSION_2026.tillaeg.samlevende);
  const gEnlig = FOLKEPENSION_2026.indkomstgraenser.enlig;
  const gUden = FOLKEPENSION_2026.indkomstgraenser.samlevendeUdenPensionist;
  const spar = PENSION_SPAREPROCENT;
  const leve = PENSION_LEVENIVEAU_PROCENT;
  const atp = PENSION_ATP_MD;
  const ampLon = kr(PENSION_AMP_EKSEMPEL.lon);
  const ampSats = formatNumber(PENSION_AMP_EKSEMPEL.sats, DA, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const ampPrMaaned = kr(pensionAmpPrMaaned());

  return [
    {
      question: "Hvad er folkepensionen i 2026?",
      answer: `I 2026 er grundbeløbet ${grund} kr/md for alle. Dertil kommer pensionstillæg på ${enligTillaeg} kr/md for enlige eller ${samlTillaeg} kr/md for gifte/samlevende, altså ${enligIAlt} kr/md hhv. ${samlIAlt} kr/md i alt før skat. Grundbeløbet påvirkes ikke af andre indkomster, men pensionstillægget sættes ned af indkomster ud over arbejdsindkomst.`,
    },
    {
      question: "Hvornår kan jeg gå på folkepension?",
      answer: `${folkepensionsalderFaqSprog()}. Du skal selv søge, og du kan søge 6 måneder før du har ret til folkepension.`,
    },
    {
      question: "Hvor meget skal jeg spare op til pension?",
      answer: `En tommelfingerregel er at spare ${spar.min}-${spar.maks}% af din bruttoløn til pension. De fleste har brug for ${leve.min}-${leve.maks}% af deres arbejdsindkomst som pensionist for at bevare deres levestandard.`,
    },
    {
      question: "Hvad er forskellen på ratepension og aldersopsparing?",
      answer: `Ratepension giver fradrag ved indbetaling (op til ${kr(SATSER_2026.ratepensionMax)} kr/år i 2026) men beskattes ved udbetaling. Aldersopsparing giver ikke fradrag, men udbetales skattefrit. Max indbetaling til aldersopsparing er ${kr(SATSER_2026.aldersopsparingMax)} kr/år i 2026.`,
    },
    {
      question: "Hvad er ATP pension?",
      answer: `ATP er en obligatorisk pension for alle lønmodtagere i Danmark. Den livslange udbetaling ligger typisk på ${kr(atp.min)}-${kr(atp.maks)} kr/md afhængig af dine indbetalinger gennem arbejdslivet.`,
    },
    {
      question: "Kan jeg se alle mine pensioner ét sted?",
      answer:
        "Ja, på PensionsInfo.dk kan du logge ind med MitID og se et samlet overblik over alle dine pensionsordninger, herunder folkepension, ATP, arbejdsmarkedspension og private opsparinger.",
    },
    {
      question: "Beskattes pension ved udbetaling?",
      answer:
        "Det afhænger af pensionstypen. Ratepension og livrente beskattes som personlig indkomst. Aldersopsparing udbetales skattefrit. Folkepension beskattes som personlig indkomst.",
    },
    {
      question: "Hvad er en livrente?",
      answer:
        "En livrente er en pensionsordning der udbetales livslangt. Den beskytter mod at du 'løber tør' for penge. Til gengæld kan du ikke arve den resterende opsparing, som du kan med ratepension.",
    },
    {
      question: "Hvordan beregner jeg pension i Excel?",
      answer: `Folkepensionen er grundbeløbet ${grund} kr plus pensionstillægget, altså ${grund}+${enligTillaeg} = ${enligIAlt} kr/md for enlige. Arbejdsmarkedspensionen er løn × sats, fx ${ampLon} kr × ${ampSats} = ${ampPrMaaned} kr. Nedsættelsen af pensionstillægget kræver to funktioner: tillæg minus MIN(tillæg;MAKS(0;(indkomst-${kr(gEnlig.nedsaetningOver)})×${sats(gEnlig.pct)})). Excel bruger semiklon mellem argumenterne på dansk og svensk Excel. Vores egen beregner bruger præcis samme regel.`,
    },
    {
      question: "Hvor meget er pensionstillægget for enlige?",
      answer: `Pensionstillægget for enlige er ${enligTillaeg} kr/md i 2026, mod ${samlTillaeg} kr for gifte og samlevende, så en enlig får ${tillaegForskel} kr mere i tillæg. Grundbeløbet på ${grund} kr er det samme for alle. Hvis du har anden indkomst ud over arbejdsindkomst, bliver tillægget nedsat med ${pct(gEnlig.pct)} % af det beløb, der overstiger ${kr(gEnlig.nedsaetningOver)} kr — og over ${kr(gEnlig.bortfaldOver)} kr er tillægget væk, så du får kun grundbeløbet.`,
    },
    {
      question: "Hvornår forsvinder pensionstillægget helt?",
      answer: `Pensionstillægget for enlige forsvinder ved ${kr(gEnlig.nedsaetningOver)} kr + ${enligTillaeg} kr delt med ${sats(gEnlig.pct)} = ${kr(Math.round(gEnlig.nedsaetningOver + FOLKEPENSION_2026.tillaeg.enlig / gEnlig.pct))} kr i årlig indkomst ud over arbejdsindkomst. Det er et lavere beløb end bortfaldsgrænsen på ${kr(gEnlig.bortfaldOver)} kr, fordi nedsættelsen med ${pct(gEnlig.pct)} % når hele tillægget, inden grænsen nås. Er du gift eller samlevende uden en pensionist, er grænsen ${kr(gUden.nedsaetningOver)} kr og satsen ${pct(gUden.pct)} %, så tillægget forsvinder allerede ved ${kr(Math.round(gUden.nedsaetningOver + FOLKEPENSION_2026.tillaeg.samlevende / gUden.pct))} kr.`,
    },
  ];
}
