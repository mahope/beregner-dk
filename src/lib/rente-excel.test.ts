import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { EXCEL_FAELLOR_SE, excelRaekkerSe } from "./rente-excel";
import { annuitetsBetalning, annuitetsEksempel } from "./rente-eksempler";
import { getPageData } from "./page-data";

/** Svenskt decimalkomma læses som punktum, som Excel gør det. */
function tilPunktum(tal: string): string {
  return tal.replace(/,/g, ".");
}

/**
 * Evaluerer ren aritmetik (tal, `*`, `/` og `-`) venstre mod højre, som Excel
 * gør. Kaster på alt andet, så formlen ikke kan være noget som kun ligner
 * aritmetik.
 */
function evaluerAritmetik(udtryk: string): number {
  if (!/^[0-9*/\s.+-]+$/.test(udtryk)) {
    throw new Error(`udtrykket er ikke ren aritmetik: ${udtryk}`);
  }
  const dele = udtryk.match(/[0-9.]+|[*/+-]/g)!;
  let resultat = Number(dele[0]);
  for (let i = 1; i < dele.length; i += 2) {
    const tegn = dele[i];
    const operand = Number(dele[i + 1]);
    if (tegn === "*") resultat = resultat * operand;
    else if (tegn === "/") resultat = resultat / operand;
    else if (tegn === "-") resultat = resultat - operand;
    else throw new Error(`ukendt operator i formlen: ${tegn}`);
  }
  return resultat;
}

/**
 * Evaluerer en hel Excel-formel fra tabellen: enten ren aritmetik, eller et
 * `BETALNING(rate;antal;belop)`-kald med valfri ren aritmetik bagefter.
 *
 * BETALNING regnes med {@link annuitetsBetalning}, altså den samme annuity
 * formel som værktøjet bruger, så formlen bedømmes på **hvad den lover** og
 * ikke på hvordan den ser ud. Det er den eneste port der kan fange en
 * ratesats, der er skrevet som årsprocenten: `=BETALNING(4/12;240;-200000)`
 * ser rigtig ud, men 4/12 er 33 % pr. måned, så den giver 66 666,67 kr i stedet
 * for de 1 211,96 kr tabellen lovede lige til højre — 55 gange for meget.
 */
function evaluerFormel(formel: string): number {
  const ren = tilPunktum(formel.replace(/^=/, "").trim());
  const match = ren.match(/^BETALNING\(([^;]+);([0-9]+);(-?[0-9]+)\)(.*)$/);
  if (!match) {
    // Ingen BETALNING: formlen skal være ren aritmetik, ellers er den noget
    // denne port ikke kan dømme.
    if (ren.includes("BETALNING")) {
      throw new Error(`BETALNING-formlen har uventede argumenter: ${formel}`);
    }
    return evaluerAritmetik(ren);
  }
  const rate = evaluerAritmetik(match[1]);
  if (!Number.isFinite(rate)) {
    throw new Error(`ratesatsen er ikke et tal: ${match[1]}`);
  }
  const ydelse = annuitetsBetalning(-Number(match[3]), rate, Number(match[2]));
  const rest = match[4].trim();
  return rest === "" ? ydelse : evaluerAritmetik(`${ydelse}${rest}`);
}

/** Svaret i tabellen som et tal, uanset tusindtalsseparator og «kr». */
function svarSomTal(svar: string): number {
  return Number(tilPunktum(svar.replace(/[^0-9,]/g, "")));
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
    // Tre argument, skilda av semikolon. Engelsk Excel använder komma som
    // skilljetecken, så ett komma *mellan* argumenterna skulle inte fungera i
    // den Excel som sidan instruerar läsaren att använda. Decimalkommot i
    // räntesatsen (0,04) är deremot rätt — det är ju exakt det fällan listar,
    // så porten får inte förbjuda det.
    const foerste = rækker[0].formel;
    const argument = foerste.slice(foerste.indexOf("(") + 1, foerste.lastIndexOf(")"));
    const delar = argument.split(";");
    expect(delar).toHaveLength(3);
    for (const del of delar.slice(1)) {
      expect(del).not.toContain(",");
    }
  });

  it("skriver lånebeloppet som ett negativt tal", () => {
    expect(rækker[0].formel).toContain(`;${-e.hovedstol})`);
  });

  it("regner hver formel i tabellen til det svar den lover", () => {
    // En formel der ikke passer sit eget svar er en forkert kalkulator — og
    // det var præcis en fejl i min egen første udkast af den tredje række
    // (=200000*4/12 giver 66.666,67, ikke 8.000). Derfor evalueres hver
    // formel her, ikke bare dens tekst — også BETALNING-rækkerne, hvis
    // ratesats ingen tekstport kan se.
    for (const række of rækker) {
      const værdi = evaluerFormel(række.formel);
      expect(værdi).toBeCloseTo(svarSomTal(række.svar), 0);
    }
  });

  it("skriver månadsräntan som 0,04/12 i formlen, ikke årsprocenten 4/12", () => {
    // Formateres i svensk Excel-syntax med komma som decimalkomma, fordi
    // tabellens egen fälla-lista siger det: «0,04/12, inte 0.04/12».
    const forventet = `${(e.aarsrente / 100).toLocaleString("sv-SE", {
      useGrouping: false,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}/12`;
    const rækkerMedFormel = rækker.filter((række) => række.formel.includes("BETALNING("));
    expect(rækkerMedFormel.length).toBeGreaterThanOrEqual(2);
    for (const række of rækkerMedFormel) {
      const sats = række.formel.match(/BETALNING\(([^;]+);/)![1];
      expect(sats).toBe(forventet);
      // Og den skal være den månadsrente eksemplet faktisk regner med — ikke
      // blot en anden skrivemåde af den samme fejl.
      expect(evaluerAritmetik(tilPunktum(sats))).toBeCloseTo(
        e.aarsrente / 100 / 12,
        12,
      );
    }
    // Den tredje fælla citerer præcis den sats tabellen bruger, så en ændret
    // eksempelrente ikke efterlader en fælde, der lærer noget forkert.
    expect(EXCEL_FAELLOR_SE[2]).toContain(`: ${forventet},`);
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
