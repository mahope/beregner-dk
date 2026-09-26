import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import { SOLCELLE_LEVETID_AAR, SOLCELLE_LEVETID_AAR_MAX, SOLCELLE_LEVETID_AAR_MIN } from "@/lib/energi/solceller";
import { HUSLEJE_EKSEMPEL, HUSLEJE_EKSEMPEL_MED_FORBRUG, HUSLEJE_STANDARD } from "@/lib/husleje";
import { getPageData } from "@/lib/page-data";

/**
 * C27 (2026-09-26) fandt to dokumenterede modstridelser mellem sider, der
 * beskriver det samme tal:
 *
 * 1. `/solceller`'s indlæg sagde "yderligere 15-20 år", FAQ'en sagde "25-30
 *    år", og `SolcelleBeregner` regnede med `levetid = 25`. Levetiden ligger nu
 *    ét sted: `SOLCELLE_LEVETID_AAR*` i `src/lib/energi/solceller.ts`.
 * 2. `/husleje`'s FAQ sagde "1-3 måneders husleje" i depositum, mens
 *    `/flyttebudget`'s FAQ sagde "3-6 mdrs." — og begge værktøjer siger 3
 *    måneder.
 *
 * Testen er gard mod samme fejltype: tallene skal læses fra delte moduler, og de
 * gamle, modstridende formuleringer må ikke komme tilbage i copy.
 */
const laes = (...segments: string[]) => readFileSync(join(__dirname, ...segments), "utf8");

const solcellerSide = laes("solceller", "page.tsx");
const solcelleBeregner = laes("..", "components", "SolcelleBeregner.tsx");
const huslejeSide = laes("husleje", "page.tsx");
const huslejeBudgetBeregner = laes("..", "components", "HuslejeBudgetBeregner.tsx");

describe("solcellernes levetid", () => {
  test("ligger i det nedre ende af det dokumenterede interval", () => {
    expect(SOLCELLE_LEVETID_AAR).toBe(SOLCELLE_LEVETID_AAR_MIN);
    expect(SOLCELLE_LEVETID_AAR_MAX).toBeGreaterThan(SOLCELLE_LEVETID_AAR_MIN);
  });

  test("siden og FAQ'en læser intervallet fra modulet", () => {
    expect(solcellerSide).toContain("SOLCELLE_LEVETID_AAR_MIN");
    expect(getPageData("solceller", "da")!.faqItems[1].answer).toContain(
      `${SOLCELLE_LEVETID_AAR_MIN}-${SOLCELLE_LEVETID_AAR_MAX} år`,
    );
  });

  test("værktøjet bruger den delte levetid i stedet for et hårdkodet tal", () => {
    expect(solcelleBeregner).toContain("SOLCELLE_LEVETID_AAR;");
    expect(solcelleBeregner).not.toMatch(/const levetid = \d/);
  });

  test("copyen ingen steder opgiver en anden levetid", () => {
    const medLevetid = [
      solcellerSide,
      getPageData("solceller", "da")!.faqItems.map((f) => f.answer).join(" "),
      getPageData("solceller", "se")?.faqItems.map((f) => f.answer).join(" ") ?? "",
    ].join("\n");

    // "15-20 år" og "25-30 år" som *yderligere* levetid var de gamle, modstridende
    // formuleringer; de må ikke optræde i (DA/SE)-copy om solceller.
    expect(medLevetid).not.toMatch(/yderligere 15-20 år|ytterligare 15-20 år|Herefter gratis strøm i/);
  });
});

describe("depositum på lejebolig", () => {
  test("siderne og værktøjet siger samme antal måneder", () => {
    const husleje = getPageData("husleje", "da")!.faqItems.filter((f) => f.answer.includes("depositum")).map((f) => f.answer).join(" ");
    const flytte = getPageData("flyttebudget", "da")!.faqItems.filter((f) => f.answer.includes("depositum")).map((f) => f.answer).join(" ");

    expect(husleje).toContain("3 måneders husleje");
    expect(flytte).toContain("3 mdrs. husleje");
    expect(huslejeBudgetBeregner).toContain("3 måneders husleje i depositum");
  });

  test("de gamle, modstridende intervaller er væk", () => {
    const flytte = getPageData("flyttebudget", "da")!.faqItems.map((f) => f.answer).join(" ");
    expect(flytte).not.toContain("3-6 mdrs");
    expect(getPageData("husleje", "da")!.faqItems.map((f) => f.answer).join(" ")).not.toContain("1-3 måneders husleje");
  });
});

/**
 * C33 (2026-09-26) fandt, at `/husleje`'s løfteindhold ikke kunne nås i
 * værktøjet: siden og meta descriptionen lovede "25.000 kr netto -> ca.
 * 7.500 kr/md", mens `HuslejeBudgetBeregner` startede på 28.000 kr og viste
 * 8.400 kr. Dertil lovede resultatet og FAQ'en, at tallet var "inkl. el, vand og
 * varme", uden at værktøjet havde et felt for det.
 *
 * Tallene ligger nu i `src/lib/husleje.ts`, og værktøjet starter i samme
 * standardtilstand som eksemplet. Testen er gard mod at de glide fra hinanden
 * igen.
 */
describe("huslejens 30 %-eksempel", () => {
  const kr = (value: number) => value.toLocaleString("da-DK");

  test("værktøjet starter i HUSLEJE_STANDARD, som er eksemplet på siden", () => {
    // Alle talværdier i komponenten skal komme fra modulet: ingen hardkodede
    // useState-numre, der kan glide fra siden.
    expect(huslejeBudgetBeregner).not.toMatch(/useState<number>\(\d/);
    for (const felt of Object.keys(HUSLEJE_STANDARD)) {
      expect(huslejeBudgetBeregner).toContain(`HUSLEJE_STANDARD.${felt}`);
    }
  });

  test("siden og metadataen citerer tallene fra modulet", () => {
    const svaer = `Tjener du ${kr(HUSLEJE_STANDARD.maanedligNettoLoen)} kr netto → max ca. ${kr(HUSLEJE_EKSEMPEL.maxBoligudgifter)} kr/md`;

    expect(getPageData("husleje", "da")!.description).toContain(svaer);
    expect(getPageData("husleje", "da")!.metaDescription).toContain(svaer);

    // Eksemplet i sidens brødtekst er JSX, der læser modulet — ikke tallene.
    expect(huslejeSide).toContain("HUSLEJE_EKSEMPEL.maxBoligudgifter");
    expect(huslejeSide).toContain("HUSLEJE_EKSEMPEL_MED_FORBRUG.anbefaletHusleje");
    expect(huslejeSide).not.toContain("7.500 kr inkl. el, vand og varme");
  });

  test("FAQ'en nævner 30 %, 33 % og at el/vand/varme trækkes fra huslejen", () => {
    const svar = getPageData("husleje", "da")!.faqItems.find((f) => f.question.includes("bør gå til husleje"))!.answer;

    expect(svar).toContain(`30% af din nettoindkomst`);
    expect(svar).toContain(kr(HUSLEJE_EKSEMPEL.maxBoligudgifter33));
    expect(svar).toContain("eget felt");
  });

  test("værktøjet har et felt for el, vand og varme i alle tre sprog", () => {
    expect(huslejeBudgetBeregner).toContain("boligforbrug: \"El, vand og varme\"");
    expect(huslejeBudgetBeregner).toContain("boligforbrug: \"El, vatten och värme\"");
    expect(huslejeBudgetBeregner).toContain("boligforbrug: \"Strøm, vann og varme\"");
    // Regnestykket skal komme fra modulet, ikke fra en egen formel i komponenten.
    expect(huslejeBudgetBeregner).toContain("beregnHusleje({");
    expect(huslejeBudgetBeregner).not.toMatch(/0\.30|0\.33/);
  });
});
