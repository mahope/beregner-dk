import { describe, expect, test } from "vitest";
import { formatBelob } from "./format";
import { CM2_PR_M2, M2_PR_HAKTAR, PRIS_EKSEMPEL, SQ_FT_PR_M2, VAERELSE_EKSEMPLER } from "./areal-eksempler";
import {
  MATERIALEPRISER,
  SPILD_PCT,
  kvadratmeterEksempelAreal,
  kvadratmeterEksempelLignelse,
  kvadratmeterEksempelMaal,
  kvadratmeterFaqSvar,
  materialepriserErDanske,
} from "./kvadratmeter-eksempler";

/**
 * `/kvadratmeter`'s FAQ answers used to be typed by hand, in three languages,
 * and two of them were *wrong* in Swedish and Norwegian: a Danish dot had been
 * written into «1 m² = 10.000 cm²» and «blir det 3.000 kr for 20 m²», so both
 * read as ten-and-zeros to a reader of those languages — and `FAQSchema`
 * publishes the answers as JSON-LD, so Google quotes them.
 *
 * These tests judge the answers by what the modules they read from can
 * produce, so a hand-written amount cannot come back, and they forbid a Danish
 * separator anywhere in a Swedish or Norwegian answer.
 */

describe("kvadratmeter FAQ-svar", () => {
  test("dansk er byte-uændret, så rettelsen ikke er en SEO-regression", () => {
    const da = kvadratmeterFaqSvar("da");

    expect(da.grundregel).toBe("Gang længde med bredde. 5m x 4m = 20 m².");
    expect(da.metode).toBe(
      "Arealet er længde × bredde. 5 m × 4 m er 20 m². En cirkel med radius 3 m er 3,14 × 3 × 3 = 28,3 m², en trekant med grundlinje 6 m og højde 4 m er (6 × 4) / 2 = 12 m², og et trapez med siderne 4 m og 6 m og højden 3 m er ((4 + 6) / 2) × 3 = 15 m².",
    );
    expect(da.vaerelse).toBe(
      "3 m × 4 m = 12 m². Et værelse på 3,5 × 4,2 m er 14,7 m². Husk at lægge 5-10 % til, hvis du skal købe gulv eller maling til det.",
    );
    expect(da.gulvpris).toBe(
      "Gulvet koster 20 m² × pris pr. m². Ved 150 kr./m² bliver det 3.000 kr. for 20 m². Læg 5-10 % til for tilskæring og spild.",
    );
    expect(da.omregning).toBe("1 m² = 10.000 cm². 10.000 m² = 1 hektar. 1 m² ≈ 10,76 sq ft.");
    expect(da.materialer).toBe("Laminat 80-200 kr/m², trægulv 300-800 kr/m², fliser 200-500 kr/m².");
  });

  test("svensk og norsk får mellemrum, aldrig det danske punktum", () => {
    // Mutation: hvis `formatBelob` faldt tilbage på `da-DK` for alle sprog, så
    // ville «10 000» blive «10.000» igen, og prøven herunder er rød.
    for (const locale of ["se", "no"] as const) {
      const svar = kvadratmeterFaqSvar(locale);
      for (const [navn, sætning] of Object.entries(svar)) {
        expect(`${navn}: ${sætning}`).not.toMatch(/\d\.\d{3}/);
      }
    }

    expect(kvadratmeterFaqSvar("se").omregning).toBe(
      "1 m² = 10 000 cm². 10 000 m² = 1 hektar. 1 m² ≈ 10,76 sq ft.",
    );
    expect(kvadratmeterFaqSvar("se").gulvpris).toContain("blir det 3 000 kr för 20 m²");
    expect(kvadratmeterFaqSvar("no").gulvpris).toContain("blir det 3 000 kr for 20 m²");
    expect(kvadratmeterFaqSvar("no").omregning).toContain("1 m² = 10 000 cm²");
  });

  test("beløbet og arealet i prissvaret er dem fra PRIS_EKSEMPEL", () => {
    // Mutation: `PRIS_EKSEMPEL.pris` på 2 500 i stedet for areal × pris pr. m²
    // ville gøre sætningen til en ny værdi; prøven dømmer mod modulet, så den
    // kan kun være grøn, når tallene faktisk er regnet.
    const da = kvadratmeterFaqSvar("da").gulvpris!;
    const forventet = PRIS_EKSEMPEL.areal * PRIS_EKSEMPEL.prisPrM2;

    expect(forventet).toBe(3000);
    expect(da).toContain(`Ved ${PRIS_EKSEMPEL.prisPrM2} kr./m²`);
    expect(da).toContain(`${formatBelob(forventet, "da")} kr.`);
    // Arealet og prisen pr. m² må give prissvaret areal × pris, ellers er det
    // en af de to tal, der er skrevet i hånden.
    expect(PRIS_EKSEMPEL.pris).toBe(forventet);
  });

  test("omregningen bruger faktorernes egne tal", () => {
    expect(CM2_PR_M2).toBe(10000);
    expect(M2_PR_HAKTAR).toBe(10000);
    expect(SQ_FT_PR_M2).toBeCloseTo(10.7639, 2);
    // 1 m² = 10 000 cm², fordi 1 m = 100 cm i begge retninger.
    expect(CM2_PR_M2).toBe(100 * 100);
    expect(kvadratmeterFaqSvar("da").omregning).toContain(`${formatBelob(CM2_PR_M2, "da")} cm²`);
  });

  test("værelset og dens areal regnes af hinanden", () => {
    const [forste, anden] = VAERELSE_EKSEMPLER;
    expect(forste.laengde * forste.bredde).toBe(12);
    expect(anden.laengde * anden.bredde).toBeCloseTo(14.7, 5);
    // Mutation: et hårdkodet 14,7 i sætningen ville overleve, hvis arealet ikke
    // blev regnet; prøven sammenligner med modulet og slår det fra.
    expect(kvadratmeterFaqSvar("da").vaerelse).toContain(
      `${formatBelob(anden.laengde, "da", 1)} × ${formatBelob(anden.bredde, "da", 1)} m er 14,7 m²`,
    );
  });

  test("spildprocenten er den, materialer-modulen dokumenterer", () => {
    // `kvadratmeter-materialer.ts` siger «5-10 % er den gængse tommelfingerregel»
    // i sin KILDE-beskrivelse, så de to steder skal være samme interval.
    expect(SPILD_PCT).toEqual({ min: 5, maks: 10 });
    expect(kvadratmeterFaqSvar("da").vaerelse).toContain("5-10 %");
    expect(kvadratmeterFaqSvar("da").gulvpris).toContain("5-10 %");
  });

  test("materialepriserne er deklareret ét sted og siger, hvilket marked de er", () => {
    expect(MATERIALEPRISER.map((m) => m.id)).toEqual(["laminat", "traegulv", "fliser"]);
    for (const materiale of MATERIALEPRISER) {
      expect(materiale.omraade).toBe("danmark");
      expect(materiale.min).toBeLessThan(materiale.maks);
    }

    // Dansk svarer uden forbehold, fordi det er sit eget marked.
    expect(materialepriserErDanske("da")).toBe(false);
    expect(kvadratmeterFaqSvar("da").materialer).not.toMatch(/dansk/i);

    // Svensk og norsk skal sige det i sætningen, ellers lover de et marked,
    // deres tal ikke er fra. Det skrev de før: «SEK/m²» og «NOK/m²».
    expect(materialepriserErDanske("se")).toBe(true);
    expect(materialepriserErDanske("no")).toBe(true);
    expect(kvadratmeterFaqSvar("se").materialer).toContain("Nivåerna är danska");
    expect(kvadratmeterFaqSvar("no").materialer).toContain("Nivåene er danske");
    for (const locale of ["se", "no"] as const) {
      expect(kvadratmeterFaqSvar(locale).materialer).not.toMatch(/SEK|NOK/);
    }
  });

  test("hvert sprog stiller kun de spørgsmål, dets FAQ har", () => {
    // Den norske side har fire svar, de to andre seks. En nøgle, der ikke bruges,
    // ville være død kode — og en brugt nøgle, der mangler, ville give
    // `undefined` i JSON-LD'en.
    for (const svar of Object.values(kvadratmeterFaqSvar("da"))) {
      expect(typeof svar).toBe("string");
      expect(svar).not.toContain("undefined");
    }
    for (const svar of Object.values(kvadratmeterFaqSvar("se"))) {
      expect(typeof svar).toBe("string");
      expect(svar).not.toContain("undefined");
    }
    for (const svar of Object.values(kvadratmeterFaqSvar("no"))) {
      expect(typeof svar).toBe("string");
      expect(svar).not.toContain("undefined");
    }

    expect(Object.keys(kvadratmeterFaqSvar("no"))).toHaveLength(4);
    expect(Object.keys(kvadratmeterFaqSvar("da"))).toHaveLength(6);
    expect(Object.keys(kvadratmeterFaqSvar("se"))).toHaveLength(6);
  });

  test("metadata skriver eksemplets mål og facit fra modulet", () => {
    expect(kvadratmeterEksempelMaal("da")).toBe("5 x 4 m");
    expect(kvadratmeterEksempelAreal("da")).toBe("5 x 4 m er 20 m²");
    expect(kvadratmeterEksempelAreal("se")).toBe("5 x 4 m är 20 m²");
    expect(kvadratmeterEksempelAreal("no")).toBe("5 x 4 m er 20 m²");
    expect(kvadratmeterEksempelLignelse("da")).toBe("5 x 4 m = 20 m²");
    expect(kvadratmeterEksempelLignelse("se")).toBe("5 x 4 m = 20 m²");
    // Mutation: hvis metadata skrev sit eget «6 x 4 m», ville facit og mål
    // ikke længere høre sammen, og prøven er rød.
    expect(kvadratmeterEksempelMaal("da")).not.toBe("6 x 4 m");
  });
});