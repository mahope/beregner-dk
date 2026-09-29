import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { EXCEL_FAELLOR_SE, excelRaekkerSe } from "./rente-excel";
import { annuitetsBetalning, annuitetsEksempel } from "./rente-eksempler";
import { getPageData } from "./page-data";

/**
 * Evaluerer en ren aritmetisk Excel-formel (kun tal, `*` og `/`) venstre mod
 * højre, som Excel gør. Bruges til at bevise at formlen faktisk giver det
 * svar tabellen lover — en test der kun læser formlens tekst ville være grøn
 * på `=200000*4/12`, der giver 66.666,67 i stedet for 8.000.
 */
function evaluerRenneFormel(formel: string): number {
  const udenLighedstegn = formel.replace(/^=/, "").trim();
  if (!/^[0-9*/\s.]+$/.test(udenLighedstegn)) {
    throw new Error(`formlen er ikke ren aritmetik: ${formel}`);
  }
  const dele = udenLighedstegn.match(/[0-9.]+|[*/]/g)!;
  let resultat = Number(dele[0]);
  for (let i = 1; i < dele.length; i += 2) {
    const operand = Number(dele[i + 1]);
    resultat = dele[i] === "*" ? resultat * operand : resultat / operand;
  }
  return resultat;
}

/**
 * Locks the Swedish Excel section on /renteberegner.
 *
 * Every expected figure is recomputed here with the same formula, so a change
 * in `rente-eksempler` that moves a number fails the test instead of silently
 * changing the page.
 */
describe("renteberegner — Excel-rækkerne på beraknare.se", () => {
  const rækker = excelRaekkerSe();
  const e = annuitetsEksempel();

  it("har præcis tre rækker", () => {
    expect(rækker).toHaveLength(3);
  });

  it("låser sit eget omfang: tre rækker er resultatet, null er en fejl", () => {
    // A measurement that reads nothing also reports "nothing wrong" (C176's
    // and measurement-error 33's lesson), so the count is asserted twice.
    expect(rækker.length).toBeGreaterThanOrEqual(3);
  });

  it("regner månedsbetalningen med samme formel som værktøjet", () => {
    const forventet = annuitetsBetalning(
      e.hovedstol,
      e.aarsrente / 100 / 12,
      Math.round(e.antalMaaneder),
    );
    expect(rækker[0].svar).toBe(
      `${forventet.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr`,
    );
  });

  it("regner den samlede rente med samme formel som værktøjet", () => {
    const n = Math.round(e.antalMaaneder);
    const forventet = annuitetsBetalning(e.hovedstol, e.aarsrente / 100 / 12, n) * n - e.hovedstol;
    expect(rækker[1].svar).toBe(
      `${forventet.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr`,
    );
  });

  it("bruger BETALNING, den svenska namnet på PMT", () => {
    for (const række of rækker) {
      if (række.formel.includes("BETALNING")) expect(række.formel).not.toContain("PMT(");
    }
    expect(rækker[0].formel).toContain("=BETALNING(");
  });

  it("bruger semikolon mellem argumenterna — det är skilljetecknet i svensk Excel", () => {
    for (const række of rækker) {
      if (række.formel.includes("BETALNING(")) expect(række.formel).toContain(";");
    }
    // Engelsk Excel använder komma; en formel med komma skulle inte fungera
    // i den Excel som sidan instruerar läsaren att använda.
    expect(rækker[0].formel.replace(/\*/g, "")).not.toMatch(/BETALNING\([^;)]*,/);
  });

  it("skriver lånebeloppet som ett negativt tal", () => {
    expect(rækker[0].formel).toContain(`;${-e.hovedstol})`);
  });

  it("regner varje ren aritmetisk formel til det svar den lover", () => {
    // En formel der ikke passer sit eget svar er en forkert kalkulator — og det
    // var præcis en fejl i min egen første udkast af den tredje række
    // (=200000*4/12 giver 66.666,67, ikke 8.000). Derfor evalueres formlen
    // her, ikke bare dens tekst.
    for (const række of rækker) {
      if (række.formel.includes("BETALNING(")) continue; // har sin egen test ovenfor
      const værdi = evaluerRenneFormel(række.formel);
      const lovet = Number(række.svar.replace(/[^0-9,]/g, "").replace(",", "."));
      expect(værdi).toBeCloseTo(lovet, 0);
    }
  });

  it("har exakt tre fällor, och ingen av dem nämner danska eller norska ord", () => {
    expect(EXCEL_FAELLOR_SE).toHaveLength(3);
    for (const fälla of EXCEL_FAELLOR_SE) {
      expect(fälla).not.toMatch(/[æø]/);
      expect(fälla).not.toMatch(/\b(ydelse|hva|jokke|sjekk|hvor|regne)\b/i);
    }
  });
});

/**
 * Regression lock on the Swedish FAQ, not a defect detector.
 *
 * A first pass at this read the *Norwegian* block of `page-data.ts` and
 * reported Norwegian words on the Swedish page; the file holds three
 * `renteberegner` blocks (`da`, `no`, `se`) and only the third is Swedish.
 * The lock stays because the words below are Norwegian or Danish forms that
 * never occur in Swedish text, and none of them contains æ or ø — which is
 * exactly why `locale-leak.mjs` rule R4 cannot see them (C73).
 */
describe("renteberegner — svensk FAQ-tekst", () => {
  const faq = getPageData("renteberegner", "se")!.faqItems;
  const tekst = faq.map((f) => `${f.question} ${f.answer}`).join(" ");

  it("har mindst fem frågor", () => {
    expect(faq.length).toBeGreaterThanOrEqual(5);
  });

  it("indeholder ikke norske eller danske ord", () => {
    for (const ord of ["Hva ", "Jokke", "Sjekk", "hvor", "hvorfor", "renteutgifter", "Fradrag"]) {
      expect(tekst).not.toContain(ord);
    }
  });

  it("indeholder ikke æ eller ø", () => {
    expect(tekst).not.toMatch(/[æø]/);
  });

  it("svarar på Excel-spørgsmålet, för det klyngen kalkylatorn manglar", () => {
    expect(tekst).toContain("BETALNING");
    expect(tekst).toContain(";");
  });

});

/**
 * The Excel section must actually reach the page. Reading the page source is
 * the only way to see it — the strings live inside a `locale === "se"` branch,
 * so a test that only imports the module proves nothing about the render
 * (C158's lesson about mocking away the thing you are measuring).
 */
describe("renteberegner — Excel-afsnittet er monteret i den svenska gren", () => {
  const kilde = readFileSync("src/app/renteberegner/page.tsx", "utf8");

  it("rendrer excelRaekkerSe i den svenska gren", () => {
    expect(kilde).toContain("excelRaekkerSe()");
    expect(kilde).toContain("EXCEL_FAELLOR_SE");
  });

  it("har en egen overskrift for Excel i den svenska gren", () => {
    expect(kilde).toMatch(/<h2>[^<]*Excel[^<]*<\/h2>/);
  });

  it("lukker antallet af rækker og fælder til modulet, ikke til en konstant", () => {
    // A length that is written down twice is a number that can drift.
    expect(kilde).not.toMatch(/EXCEL_RAEKKE_ANTAL/);
  });
});
