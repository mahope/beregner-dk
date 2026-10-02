import { describe, expect, test } from "vitest";

import { FOLKEPENSION_2026 } from "@/lib/folkepension";
import { formatBelob } from "@/lib/format";
import { getPageData } from "@/lib/page-data";
import {
  folkepensionsalderFaqSprog,
  PENSION_AMP_EKSEMPEL,
  PENSION_ATP_MD,
  PENSION_SPAREPROCENT,
  pensionAmpPrMaaned,
  pensionFaqItems,
  pensionOverskrifter,
} from "@/lib/pension-eksempler";
import { SATSER_2026 } from "@/lib/satser-2026";

const data = getPageData("pension", "da")!;
const kr = (vaerdi: number) => formatBelob(vaerdi, "da");

/**
 * Alt, /pension har lov til at skrive i en brødtekst, regnet ud fra de samme
 * moduler siden læser. Et beløb, der ikke står her, er håndskrevet — og det er
 * præcis den fejl, opgaven fjerner: «8.729 kr» kunne stå i FAQ'en, mens
 * `folkepension.ts` sagde 8.500, og ingen test ville have set det.
 */
const TILLADTE_BELOB = new Set<string>([
  kr(FOLKEPENSION_2026.grundbeloeb),
  kr(FOLKEPENSION_2026.tillaeg.enlig),
  kr(FOLKEPENSION_2026.tillaeg.samlevende),
  kr(FOLKEPENSION_2026.iAlt.enlig),
  kr(FOLKEPENSION_2026.iAlt.samlevende),
  kr(FOLKEPENSION_2026.tillaeg.enlig - FOLKEPENSION_2026.tillaeg.samlevende),
  ...Object.values(FOLKEPENSION_2026.indkomstgraenser).flatMap((graense) => [
    kr(graense.nedsaetningOver),
    kr(graense.bortfaldOver),
  ]),
  // De to beløb hvor tillægget forsvinder, er beregnede, ikke slået op:
  // grænsen + hele tillægget delt med nedsættelsesprocenten.
  kr(
    Math.round(
      FOLKEPENSION_2026.indkomstgraenser.enlig.nedsaetningOver +
        FOLKEPENSION_2026.tillaeg.enlig / FOLKEPENSION_2026.indkomstgraenser.enlig.pct,
    ),
  ),
  kr(
    Math.round(
      FOLKEPENSION_2026.indkomstgraenser.samlevendeUdenPensionist.nedsaetningOver +
        FOLKEPENSION_2026.tillaeg.samlevende /
          FOLKEPENSION_2026.indkomstgraenser.samlevendeUdenPensionist.pct,
    ),
  ),
  kr(SATSER_2026.ratepensionMax),
  kr(SATSER_2026.aldersopsparingMax),
  kr(PENSION_AMP_EKSEMPEL.lon),
  kr(pensionAmpPrMaaned()),
  kr(PENSION_ATP_MD.min),
  kr(PENSION_ATP_MD.maks),
]);

/** Hvert beløb med tusindtalsseparator i en tekst — samme mønster som porten. */
function belob(streng: string): string[] {
  return streng.match(/\d{1,3}\.\d{3}/g) ?? [];
}

describe("pension-eksempler", () => {
  test("metadata er byte-uændret fra den, siden havde 2/10", () => {
    // Låst med `toBe` på de gamle strenge, så en ny sats ikke kan bytte om på
    // en hel sætning uden at nogen læser den. Tallet i titlen er
    // `FOLKEPENSION_2026.iAlt.enlig`, så den kan ikke vise sidste års sats.
    expect(pensionOverskrifter()).toEqual({
      metaTitle: "Pensionsberegner 2026: folkepension 16.273 kr/md",
      ogTitle: "Pensionsberegner 2026: folkepension 16.273 kr/md",
      description:
        "Beregn din pension 2026. Folkepensionen er 16.273 kr/md for enlige og 12.011 kr/md for gifte før skat. Se hvad arbejdsmarkedspension og ATP ændrer, og hvor meget du skal opspare.",
      metaDescription:
        "Beregn din pension 2026. Folkepensionen er 16.273 kr/md for enlige og 12.011 kr/md for gifte før skat. Se hvad du skal opspare ved siden af.",
      ogDescription:
        "Beregn din pension 2026. Folkepensionen er 16.273 kr/md for enlige og 12.011 kr/md for gifte før skat.",
    });
    expect(data.title).toBe("Pensionsberegner 2026: folkepension 16.273 kr/md | MinBeregner.dk");
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    // Mutation: sæt folkepensionen i titlen tilbage til et håndskrevet tal, så
    // titlen og modulet kan glide fra hinanden — prøven skal blive rød.
    expect(data.metaTitle).toBe(`Pensionsberegner 2026: folkepension ${kr(FOLKEPENSION_2026.iAlt.enlig)} kr/md`);
  });

  test("alle elleve spørgsmål er de siden offentliggør, i rækkefølge", () => {
    expect(data.faqItems.map((item) => item.question)).toEqual([
      "Hvad er folkepensionen i 2026?",
      "Hvornår kan jeg gå på folkepension?",
      "Hvor meget skal jeg spare op til pension?",
      "Hvad er forskellen på ratepension og aldersopsparing?",
      "Hvad er ATP pension?",
      "Kan jeg se alle mine pensioner ét sted?",
      "Beskattes pension ved udbetaling?",
      "Hvad er en livrente?",
      "Hvordan beregner jeg pension i Excel?",
      "Hvor meget er pensionstillægget for enlige?",
      "Hvornår forsvinder pensionstillægget helt?",
    ]);
    expect(pensionFaqItems()).toEqual(data.faqItems);
    expect(new Set(data.faqItems.map((i) => i.question)).size).toBe(11);
  });

  test("hvert beløb i metadata og svar kommer fra et modul", () => {
    const tekster = [
      data.title,
      data.description,
      data.metaTitle,
      data.metaDescription,
      data.ogTitle,
      data.ogDescription,
      ...data.faqItems.flatMap((item) => [item.question, item.answer]),
    ];
    const usourcede = tekster.flatMap((tekst) =>
      belob(tekst)
        .filter((belob) => !TILLADTE_BELOB.has(belob))
        .map((belob) => `${belob} i «${tekst.slice(0, 60)}…»`),
    );
    // Mutation: sæt «8.729» tilbage i et svar som en konstant, så porten er rød
    // på præcis det beløb, der ikke læses fra `folkepension.ts`.
    expect(usourcede).toEqual([]);
    // Og porten skal se mindst lige så mange beløb, som siden skriver i alt.
    expect(tekster.flatMap(belob).length).toBeGreaterThanOrEqual(30);
  });

  test("folkepensionsalder-svaret følger alderSkala trin for trin", () => {
    const svar = folkepensionsalderFaqSprog();
    // Hvert trin i skalaen skal have sin egen klausul med sin egen alder —
    // det er prøven, der gjorde den gamle sætning rød: den sprang fra 1953
    // direkte til 1956 og sagde «65 år hvis du er født i 1953 eller før».
    for (const step of FOLKEPENSION_2026.alderSkala) {
      const aar = step.fra.slice(0, 4);
      expect(svar, `fødselsår ${aar}`).toContain(aar);
    }
    expect(svar).toContain("65 ½ år");
    expect(svar).toContain("66 ½ år");
    expect(svar).toContain("for født 1956-1962");
    expect(svar).toContain("70 år for født 1971 eller senere");
    // Ingen påstand om 1953: `folkepensionsalder()` giver 65 til alle født
    // senest 1. januar 1954, så «født i 1953 eller før» er en anden regel end
    // den, modulet bruger.
    expect(svar).not.toContain("1953");
    // Samme alder som `folkepensionsalder()` giver for de to fødselsdatoer,
    // der ligger i hver sin halvdel af 1954.
    expect(svar).toContain("65 år for alle født 1954 eller tidligere");
  });

  test("spareprocenten og ATP-intervallet er erklærede, ikke opdigtede i sætningen", () => {
    const svar = data.faqItems.find((i) => i.question === "Hvor meget skal jeg spare op til pension?")!;
    expect(svar.answer).toContain(
      `spare ${PENSION_SPAREPROCENT.min}-${PENSION_SPAREPROCENT.maks}% af din bruttoløn`,
    );
    const atp = data.faqItems.find((i) => i.question === "Hvad er ATP pension?")!;
    expect(atp.answer).toContain(
      `typisk på ${kr(PENSION_ATP_MD.min)}-${kr(PENSION_ATP_MD.maks)} kr/md`,
    );
  });

  test("Excel-svaret bruger samme løn, sats og produktsum som modulet", () => {
    const svar = data.faqItems.find((i) => i.question === "Hvordan beregner jeg pension i Excel?")!;
    expect(svar.answer).toContain(
      `${kr(PENSION_AMP_EKSEMPEL.lon)} kr × 0,15 = ${kr(pensionAmpPrMaaned())} kr`,
    );
    expect(svar.answer).toContain(
      `${kr(FOLKEPENSION_2026.grundbeloeb)}+${kr(FOLKEPENSION_2026.tillaeg.enlig)} = ${kr(FOLKEPENSION_2026.iAlt.enlig)}`,
    );
    // Formlens egen sats skal stå som Excel-tal (0,309), ikke som procent.
    expect(svar.answer).toContain(`(indkomst-${kr(FOLKEPENSION_2026.indkomstgraenser.enlig.nedsaetningOver)})×0,309`);
  });
});
