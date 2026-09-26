import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import { SOLCELLE_LEVETID_AAR, SOLCELLE_LEVETID_AAR_MAX, SOLCELLE_LEVETID_AAR_MIN } from "@/lib/energi/solceller";
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
