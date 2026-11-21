import { describe, expect, test } from "vitest";

import { formatNumber } from "@/lib/format";
import { getPageData } from "@/lib/page-data";
import {
  DAGE_I_AAR,
  TIMER_I_DAGT,
  TIMER_I_SKUDAAR,
  TIMER_PERIODER,
  timerIPeriode,
  timerIPeriodeFaqSvar,
} from "@/lib/timer-periode";

describe("timer-periode", () => {
  test("et døgn er 24 timer, en uge er 7 dage", () => {
    expect(timerIPeriode("doegn")).toMatchObject({
      dage: 1,
      timer: 24,
      minutter: 1440,
      sekunder: 86400,
    });
    expect(timerIPeriode("uge")).toMatchObject({
      dage: 7,
      timer: 168,
      minutter: 10080,
      sekunder: 604800,
    });
  });

  test("et år er 365 dage = 8.760 timer", () => {
    expect(timerIPeriode("aar")).toMatchObject({
      dage: DAGE_I_AAR,
      timer: 8760,
      minutter: 525600,
      sekunder: 31536000,
    });
  });

  test("måned og kvartal er snit af året, så de har brøkdele dage", () => {
    const maaned = timerIPeriode("maaned");
    expect(maaned.dage).toBeCloseTo(30.416667, 5);
    // 365 / 12 × 24 = 730 timer præcis, selv om dage ikke er et helt tal.
    expect(maaned.timer).toBe(730);
    expect(maaned.minutter).toBe(43800);

    const kvartal = timerIPeriode("kvartal");
    expect(kvartal.dage).toBeCloseTo(91.25, 5);
    expect(kvartal.timer).toBe(2190);
  });

  test("tre måneder er ét kvartal, fire kvartaler er ét år", () => {
    const { timer: maaned } = timerIPeriode("maaned");
    const { timer: kvartal } = timerIPeriode("kvartal");
    const { timer: aar } = timerIPeriode("aar");
    expect(maaned * 12).toBeCloseTo(aar, 6);
    expect(kvartal * 4).toBeCloseTo(aar, 6);
    expect(maaned * 3).toBeCloseTo(kvartal, 6);
  });

  test("hver periode er dage × 24 timer, og minutter/sekunder følger", () => {
    for (const p of TIMER_PERIODER) {
      expect(p.timer).toBe(p.dage * TIMER_I_DAGT);
      expect(p.minutter).toBe(p.timer * 60);
      expect(p.sekunder).toBe(p.timer * 3600);
      expect(p.naevn.da).not.toBe(p.naevn.se);
      expect(p.naevn.no).not.toBe(p.naevn.da);
    }
  });

  test("skudåret er præcis ét døgn mere end et normalt år", () => {
    expect(TIMER_I_SKUDAAR - timerIPeriode("aar").timer).toBe(TIMER_I_DAGT);
  });

  test("en ukendt periode kaster i stedet for at give tom tekst", () => {
    expect(() => timerIPeriode("uge" as "aar")).not.toThrow();
    expect(() => timerIPeriode("vinter" as "aar")).toThrow(/Ukendt periode/);
  });

  test("listen er dækkende og uden dubletter", () => {
    expect(TIMER_PERIODER.map((p) => p.id)).toEqual([
      "doegn",
      "uge",
      "maaned",
      "kvartal",
      "aar",
    ]);
  });
});

/**
 * Punkt 11: et regnestyk i FAQ'en er kode, ikke tekst.
 *
 * `/tidsberegner` fik sit modul og sin tabel i samme commit (1e5a446), men de to
 * nye FAQ-svar skrev selv «365 × 24 = 8.760 timer, altså 525.600 minutter» og
 * «et skudår 8.784 timer» i to sprog, håndskrevet i `page-data.ts`. Modulets
 * egen docblock siger modsat — «Derfor kommer alle tal herfra og ikke fra
 * brødteksten, så en periode og dens timer ikke kan glide fra hinanden» — og
 * ingen port dømte svarene: mutationen «8.760 → 9.999» i det danske svar
 * efterlod 50/50 tests grønne. Svarene går desuden til `<FAQSchema>`s JSON-LD.
 *
 * Porten dømmer to ting: at hvert tal i svaret er formateret fra modulet, og at
 * `page-data.ts` ikke selv skriver svaret igen.
 */
describe("timer-periodens FAQ-svar", () => {
  const MED_MELLEMRUM = /\u00a0/g;

  const norm = (str: string) => str.replace(MED_MELLEMRUM, " ");

  test("hvert tal i svaret kommer fra modulet, formateret i domænets skrivemåde", () => {
    for (const locale of ["da", "se"] as const) {
      for (const id of ["aar", "uge"] as const) {
        const svar = norm(timerIPeriodeFaqSvar(id, locale));
        const periode = timerIPeriode(id);
        const maanedTimer = timerIPeriode("maaned").timer;

        // Subjektet er periodens eget navn — «Et år», «En vecka».
        expect(svar.startsWith(`${periode.naevn[locale]} har`)).toBe(true);
        // De fire tal i regnestykket plus måneden — og skudåret, når svaret
        // nævner det.
        const naevnte = [periode.dage, TIMER_I_DAGT, periode.timer, periode.minutter, maanedTimer]
          .concat(id === "uge" ? [TIMER_I_SKUDAAR] : [])
          .map((tal) => norm(formatNumber(tal, locale)));
        for (const forventet of naevnte) {
          expect(svar).toContain(forventet);
        }
        // Regnestykket i sig selv: dage × 24 = timer.
        expect(svar).toContain(
          norm(
            `${formatNumber(periode.dage, locale)} × ${formatNumber(TIMER_I_DAGT, locale)} = ${formatNumber(periode.timer, locale)}`
          )
        );
        // Der står intet andet tusindtals-tal end dem, der kommer fra modulet.
        // `168` (en uge), `24` (et døgn) og `730` (en måned) har ingen
        // separator, så de kan ikke være med.
        const skrivne = [...svar.matchAll(/\d{1,3}[. ]\d{3}(?!\d)/g)].map((m) => m[0]);
        const medSeparator = naevnte.filter((tal) => /\d{1,3}[. ]\d{3}(?!\d)/.test(tal));
        expect(skrivne).toEqual(medSeparator);
      }
    }
  });

  test("de to domæner skriver hver sit eget sprog og sin egen separator", () => {
    expect(timerIPeriodeFaqSvar("aar", "da")).toBe(
      "Et år har 365 dage, og 365 × 24 = 8.760 timer, altså 525.600 minutter. Måned og kvartal er gennemsnit af året, så en måned er 730 timer."
    );
    expect(norm(timerIPeriodeFaqSvar("aar", "se"))).toBe(
      "Ett år har 365 dagar, och 365 × 24 = 8 760 timmar, alltså 525 600 minuter. Månad och kvartal är genomsnitt av året, så en månad är 730 timmar."
    );
    expect(timerIPeriodeFaqSvar("uge", "da")).toBe(
      "En uge har 7 dage, og 7 × 24 = 168 timer, altså 10.080 minutter. Et døgn har 24 timer, så en måned er 730 timer og et skudår 8.784 timer."
    );
    expect(norm(timerIPeriodeFaqSvar("uge", "se"))).toBe(
      "En vecka har 7 dagar, och 7 × 24 = 168 timmar, alltså 10 080 minuter. Ett dygn har 24 timmar, så en månad är 730 timmar och ett skottår 8 784 timmar."
    );
  });

  test("/tidsberegners FAQ læser svaret fra modulet i stedet for at skrive det", () => {
    // Mutation: sæt «9.999» ind i `page-data.ts` i stedet for kaldet, og
    // bliver den her rød.
    for (const [locale, spoergsmaal, id] of [
      ["da", /Hvor mange timer er der i et år\?/, "aar"],
      ["da", /Hvor mange timer er der i en uge\?/, "uge"],
      ["se", /Hur många timmar finns det på ett år\?/, "aar"],
      ["se", /Hur många timmar finns det i en vecka\?/, "uge"],
    ] as const) {
      const svar = getPageData("tidsberegner", locale)?.faqItems.find((f) =>
        spoergsmaal.test(f.question)
      );

      expect(svar, `${locale}: ${spoergsmaal}`).toBeTruthy();
      expect(norm(svar?.answer ?? "")).toBe(norm(timerIPeriodeFaqSvar(id, locale)));
    }
  });
});
