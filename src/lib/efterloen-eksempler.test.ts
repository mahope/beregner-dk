/**
 * `/efterloen` skrev sin sats, sine præmieportioner og sit timeloft i hånden i
 * både metadata og FAQ, selv om `efterloen.ts` havde dem liggende. Det er den
 * drift, kvalitetsregel 11 beskriver — og forskellen til de foregående slices er
 * værd at sige: her var de håndskrevne tal **ikke** forkerte. Målt mod
 * modulerne: «20.057» = `Math.round(22.041 × 0,91)`, «5.772» = 481 × 12,
 * «15.870»/«10.580» er `SKATTEFRI_PRAEMIE_2026.portion`. Slicen er derfor ikke
 * en rettelse af en løgn, men et lås: da dagpengesatsen eller præmiebeløbet
 * flytter sig i 2027, flytter beregneren sig, og uden disse svar ville
 * søgeresultatet blive stående på sidste års tal — og `FAQSchema` publicerer
 * svarerne som JSON-LD, så Google citerer dem.
 *
 * Den adfærdsbaserede prøve nedenfor er den egentlige port: den dømmer **hvert**
 * beløb i metadata og svar mod de tal modulerne må skrive, så et håndskrevet
 * beløb er rødt uden at nogen skal huske at tælle.
 */
import { describe, expect, test } from "vitest";

import {
  EFTERLOEN_ALDER_2026,
  EFTERLOEN_MAX_SATS,
  EFTERLOEN_SATS_PROCENT,
  MAX_TIMER_TIL_PRAEMIE,
  SKATTEFRI_PRAEMIE_2026,
} from "@/lib/efterloen";
import {
  efterloenAldersperioder,
  efterloenAldersSvar,
  efterloenDescription,
  efterloenFaqSvar,
  efterloenMetaDescription,
} from "@/lib/efterloen-eksempler";
import { formatBelob } from "@/lib/format";
import { getPageData } from "@/lib/page-data";
import { DAGPENGE_2026 } from "@/lib/satser-2026";

const data = getPageData("efterloen", "da")!;
const kr = (vaerdi: number) => formatBelob(vaerdi, "da");

/**
 * Alt, /efterloen har lov til at skrive i en brødtekst, regnet ud fra de
 * moduler siden læser. Et beløb uden for dette sæt er håndskrevet — og det er
 * præcis den fejl, opgaven fjerner.
 */
const TILLADTE_BELOB = new Set<string>([
  kr(EFTERLOEN_MAX_SATS.udenUdskydelse),
  kr(EFTERLOEN_MAX_SATS.medUdskydelse),
  kr(MAX_TIMER_TIL_PRAEMIE),
  kr(SKATTEFRI_PRAEMIE_2026.portion.full),
  kr(SKATTEFRI_PRAEMIE_2026.portion.part),
  kr(SKATTEFRI_PRAEMIE_2026.udskydelseTimer.full),
  kr(SKATTEFRI_PRAEMIE_2026.udskydelseTimer.part),
]);

/** Hvert beløb med tusindtalsseparator i en tekst — samme mønster som porten. */
function belob(streng: string): string[] {
  return streng.match(/\d{1,3}\.\d{3}/g) ?? [];
}

/** Metadataen og alle otte svar, som de to beskrivelser og FAQ'en udgiver. */
const tekster = (): string[] => [
  data.title,
  data.description,
  data.metaTitle,
  data.metaDescription,
  data.ogTitle,
  data.ogDescription,
  ...data.faqItems.flatMap((item) => [item.question, item.answer]),
];

const svar = (spg: string) => {
  const fundet = data.faqItems.find((item) => item.question === spg);
  if (!fundet) throw new Error(`Siden har ikke længere spørgsmålet «${spg}»`);
  return fundet.answer;
};

describe("efterloen-eksempler", () => {
  test("satsen er dagpengesatsen ganget med lovens procent, ikke et håndskrevet tal", () => {
    // De to tal lå hårdkodet i `EfterloensBeregner.tsx` (`MAX_EFTERLOEN_91 =
    // 20057`) og endnu en gang i metadata og FAQ. Nu er der én definition, og
    // beregneren og søgeresultatet læser den samme.
    expect(EFTERLOEN_SATS_PROCENT).toEqual({ udenUdskydelse: 0.91, medUdskydelse: 1 });
    expect(EFTERLOEN_MAX_SATS.udenUdskydelse).toBe(
      Math.round(DAGPENGE_2026.fuldtid * EFTERLOEN_SATS_PROCENT.udenUdskydelse),
    );
    expect(EFTERLOEN_MAX_SATS.medUdskydelse).toBe(DAGPENGE_2026.fuldtid);
    // De to procenter er forskellige, så prøven ikke kan være grøn ved at
    // svaret bare gentager ét tal to gange.
    expect(EFTERLOEN_MAX_SATS.medUdskydelse).toBeGreaterThan(
      EFTERLOEN_MAX_SATS.udenUdskydelse,
    );
  });

  test("metadata er byte-uændret fra den, siden havde 3/10, uden «91%»", () => {
    // Låst med `toBe` på de to gamle strenge. Den eneste forskel er «91%» →
    // «91 %»: `metaDescription` på den samme side skrev «91 %», så de to
    // modsagde hinanden, og resten af sitet skriver procenttal med mellemrum.
    expect(efterloenDescription()).toBe(
      "Beregn efterløn 2026. Max sats: ca. 20.057 kr/md (91 % af dagpenge). Se hvornår du kan gå på efterløn, betingelser og præcis sats ud fra din indkomst. Gratis beregner.",
    );
    expect(efterloenMetaDescription()).toBe(
      "Beregn efterløn 2026. Max sats: ca. 20.057 kr/md (91 % af dagpenge). Se hvornår du kan gå på efterløn, betingelser og præcis sats for din indkomst.",
    );
    expect(data.description).toBe(efterloenDescription());
    expect(data.metaDescription).toBe(efterloenMetaDescription());
    expect(efterloenDescription()).not.toContain("91%");
  });

  test("alle otte spørgsmål er de siden offentliggør, i rækkefølge", () => {
    expect(data.faqItems.map((item) => item.question)).toEqual([
      "Hvad er efterløn?",
      "Hvad er efterlønssatsen i 2026?",
      "Hvornår kan jeg gå på efterløn?",
      "Hvad er betingelserne for efterløn?",
      "Kan jeg arbejde mens jeg er på efterløn?",
      "Hvad er efterlønspræmien?",
      "Kan jeg få efterløn hvis jeg bor i udlandet?",
      "Hvad sker der med min pension hvis jeg vælger efterløn?",
    ]);
    expect(new Set(data.faqItems.map((i) => i.question)).size).toBe(8);
  });

  test("hvert beløb i metadata og svar kommer fra et modul", () => {
    const usourcede = tekster()
      .flatMap((tekst) => belob(tekst))
      .filter((belob) => !TILLADTE_BELOB.has(belob))
      .map((belob) => `${belob} står i metadata eller svar, men ikke i et modul`);
    // Mutation: sæt «20.057» tilbage som en konstant i et svar (eller ret
    // blot til et håndskrevet «19.500»), så prøven bliver rød på præcis det
    // beløb, der ikke læses fra `efterloen.ts`.
    expect(usourcede).toEqual([]);
    // Og porten skal se mindst lige så mange beløb, som siden skriver i alt —
    // ellers kunne den blive grøn ved at holde op med at se dem.
    expect(tekster().flatMap(belob).length).toBeGreaterThanOrEqual(5);
  });

  test("satssvaret, timeloftet og præmiebeløbet læses fra de samme moduler som beregneren", () => {
    // Satssvaret skal bruge præcis den sats, `efterloenSats` summerer, og den
    // procent, loven giver — ikke en afrunding af den.
    expect(svar("Hvad er efterlønssatsen i 2026?")).toBe(
      `I 2026 er den maksimale efterlønssats ca. ${kr(EFTERLOEN_MAX_SATS.udenUdskydelse)} kr. om måneden (91 % af dagpengesatsen) ved fuldtidsforsikring. Satsen afhænger af din tidligere indkomst og forsikringsstatus.`,
    );
    // Timeloftet er præcis produktet af de to tal, `praemiePortioner` regner på.
    expect(svar("Kan jeg arbejde mens jeg er på efterløn?")).toBe(
      `Ja, du kan arbejde ved siden af efterlønnen, men din efterløn reduceres time for time. Som udgangspunkt udløser ${SKATTEFRI_PRAEMIE_2026.timerPerPortion} arbejdstimer én skattefri præmieportion, og du kan optjene op til ${SKATTEFRI_PRAEMIE_2026.maxPortioner} portioner (${kr(MAX_TIMER_TIL_PRAEMIE)} timer).`,
    );
    // De to portionsbeløb er `SKATTEFRI_PRAEMIE_2026.portion`, som beregneren
    // ganger portionerne med, og ventetiden er `udskydelseAar`.
    expect(svar("Hvad er efterlønspræmien?")).toBe(
      `Én skattefri præmieportion er ${kr(SKATTEFRI_PRAEMIE_2026.portion.full)} kr. (2026) for fuldtidsforsikrede og ${kr(SKATTEFRI_PRAEMIE_2026.portion.part)} kr. for deltidsforsikrede. For at optjene præmie fra efterløn skal du have ventet ${SKATTEFRI_PRAEMIE_2026.udskydelseAar} år med at gå på efterløn. Du kan også optjene præmie via et efterlønsbevis, inden du går på efterløn.`,
    );
    // Hver nøgle i modulet skal være et spørgsmål, siden faktisk stiller, og
    // svaret skal være præcis modulets — så en tastefejl i `page-data.ts` (der
    // slår op med en streng) giver `undefined` i stedet for en stille fejl.
    for (const [spg, svaret] of Object.entries(efterloenFaqSvar)) {
      expect(svar(spg), `«${spg}» skal læses i modulet`).toBe(svaret);
    }
  });

  test("aldersvaret følger EFTERLOEN_ALDER_2026 række for række", () => {
    const perioder = efterloenAldersperioder();
    expect(perioder).toHaveLength(EFTERLOEN_ALDER_2026.length);
    // Hver række skal have sin egen klausul med sin egen alder — det er prøven,
    // der dømmer et håndskrevet fødselsår, fordi porten kun ser beløb.
    EFTERLOEN_ALDER_2026.forEach((raekke, index) => {
      const klausul = `${perioder[index].alder} for ${perioder[index].foedselsperiode}`;
      expect(svar("Hvornår kan jeg gå på efterløn?"), klausul).toContain(klausul);
    });
    // Rækken der går på tværs af to aldre skal skrive den brudte form, for det
    // er præcis den, der var håndskrevet som «63½-64 år».
    expect(efterloenAldersperioder()[1]).toEqual({
      alder: "63½-64 år",
      foedselsperiode: "født i 1959",
    });
    // Dansk er byte-uændret, så hele sætningen låses.
    expect(efterloenAldersSvar()).toBe(
      "Efterlønsalderen afhænger af din fødselsdato: 63 år for født 1. juli 1956-31. december 1958, 63½-64 år for født i 1959, 64 år for født 1. juli 1959-31. december 1962, 65 år for født 1963-1966 og 66 år for født 1967-1970. Født efter 1970 stiger alderen løbende med middellevetiden, så spørg din a-kasse.",
    );
  });
});
