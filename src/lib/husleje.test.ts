import { describe, expect, test } from "vitest";

import {
  beregnHusleje,
  HUSLEJE_EKSEMPEL,
  HUSLEJE_REGNEL_30,
  HUSLEJE_REGNEL_33,
  HUSLEJE_STANDARD,
  type HuslejeInput,
} from "./husleje";

const kunNettoloen = (maanedligNettoLoen: number, rest: Partial<HuslejeInput> = {}) =>
  beregnHusleje({ maanedligNettoLoen, ...rest });

describe("beregnHusleje", () => {
  test("standardtilstanden svarer på den 30 %-regel, siden opsparingen ikke kan bære den", () => {
    const r = beregnHusleje(HUSLEJE_STANDARD);
    expect(r.samletIndkomst).toBe(25000);
    expect(r.fasteUdgifter).toBe(9000);
    expect(r.opsparingBeloeb).toBe(2500);
    // 25.000 - 9.000 - 2.500 = 13.500 left, but the rule caps housing at 30 %.
    expect(r.tilHusleje).toBe(13500);
    expect(r.anbefaletHusleje).toBe(7500);
    expect(r.maxBoligudgifter).toBe(25000 * HUSLEJE_REGNEL_30);
  });

  test("reglen dækker husleje OG boligforbrug, så el og varme flytter huslejen ned en for en", () => {
    const r = beregnHusleje({ ...HUSLEJE_STANDARD, boligforbrug: 1800 });
    // 30 % of 25.000 = 7.500 in total for rent + electricity/water/heating.
    expect(r.anbefaletBoligudgifter).toBe(7500);
    expect(r.anbefaletHusleje).toBe(5700);
  });

  test("et højt boligforbrug kan ikke give en højere husleje end loftet", () => {
    const r = beregnHusleje({ ...HUSLEJE_STANDARD, boligforbrug: 9000 });
    expect(r.anbefaletHusleje).toBe(0);
    expect(r.anbefaletBoligudgifter).toBe(9000);
  });

  test("33 %-varianten ligger altid over 30 %-loftet", () => {
    const r = beregnHusleje({ ...HUSLEJE_STANDARD, boligforbrug: 1800 });
    expect(r.maxBoligudgifter33).toBe(25000 * HUSLEJE_REGNEL_33);
    expect(r.maxBoligudgifter33).toBeGreaterThan(r.maxBoligudgifter);
  });

  test("opsparingen trækkes fra indkomsten, også partnerens", () => {
    const r = beregnHusleje({ ...HUSLEJE_STANDARD, partnerLoen: 20000, opsparingProcent: 10 });
    expect(r.samletIndkomst).toBe(45000);
    expect(r.opsparingBeloeb).toBe(4500);
    expect(r.maxBoligudgifter).toBe(13500);
  });

  test("vurderingen følger, hvor tæt budgettet er på regelens loft", () => {
    // 25.000 net: regelens loft er 7.500, og 80 %-grænsen er 6.000.
    // Kun 2.500 i faste udgifter: der er mere end nok -> "god".
    expect(beregnHusleje({ maanedligNettoLoen: 25000, madOgDagligvarer: 2500 }).vurdering).toBe("god");
    // 18.500 i udgifter efterlader 6.500: mellem 80 %-grænsen og loftet -> "ok".
    expect(beregnHusleje({ maanedligNettoLoen: 25000, madOgDagligvarer: 18500 }).vurdering).toBe("ok");
    // 20.000 i udgifter efterlader 5.000: under 80 %-grænsen -> "risikabel".
    expect(beregnHusleje({ maanedligNettoLoen: 25000, madOgDagligvarer: 20000 }).vurdering).toBe("risikabel");
  });

  test("en indkomst under loftet giver aldrig negativ husleje", () => {
    const r = kunNettoloen(10000, { madOgDagligvarer: 12000, opsparingProcent: 10 });
    expect(r.tilHusleje).toBeLessThan(0);
    expect(r.anbefaletHusleje).toBe(0);
    expect(r.vurdering).toBe("risikabel");
  });

  test("ingen indkomst giver 0 overalt i stedet for negativ husleje", () => {
    const r = kunNettoloen(0, { madOgDagligvarer: 3000 });
    expect(r.maxBoligudgifter).toBe(0);
    expect(r.maxBoligudgifter33).toBe(0);
    expect(r.anbefaletHusleje).toBe(0);
    expect(r.anbefaletBoligudgifter).toBe(0);
    // 0 >= 0 ville være "god" økonomi; det er den gamle logiks fejl.
    expect(r.vurdering).toBe("risikabel");
  });
});

describe("HUSLEJE_STANDARD", () => {
  test("er præcis det eksempel, siden og meta descriptionen lover", () => {
    // /husleje siger "25.000 kr netto -> max ca. 7.500 kr/md (30 % reglen)".
    expect(HUSLEJE_STANDARD.maanedligNettoLoen).toBe(25000);
    expect(HUSLEJE_EKSEMPEL.anbefaletHusleje).toBe(7500);
    expect(HUSLEJE_EKSEMPEL.anbefaletHusleje).toBe(
      HUSLEJE_EKSEMPEL.samletIndkomst * HUSLEJE_REGNEL_30,
    );
  });

  test("har intet boligforbrug, fordi el og varme ofte betales via a conto", () => {
    expect(HUSLEJE_STANDARD.boligforbrug).toBe(0);
  });
});
