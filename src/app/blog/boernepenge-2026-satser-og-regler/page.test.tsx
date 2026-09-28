import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { BOERNE_SATSER_2026, udbetalingsdatoerAar } from "@/lib/borneungeydelse";
import Boernepenge2026Page from "./page";

vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({ FAQSchema: () => null }));

const html = () => renderToStaticMarkup(<Boernepenge2026Page />);

describe("børnepenge 2026 — udbetalingsdatoer", () => {
  test("viser de fire kvartalsdatoer med ugedag", async () => {
    const markup = await html();

    expect(markup).toContain("Udbetalingsdatoer i 2026");
    for (const u of udbetalingsdatoerAar(2026, "kvartal")) {
      const maaned = new Intl.DateTimeFormat("da-DK", { month: "long" })
        .format(u.dato)
        .toLowerCase();
      expect(markup, `20. ${maaned}`).toContain(`20. ${maaned}`);
    }
    // De fire datoer er tirsdag, mandag, mandag og tirsdag i 2026.
    expect(markup).toContain("tirsdag");
    expect(markup).toContain("mandag");
  });

  test("siger hvilke tre ungeudbetalinger der flyttes fordi den 20. er en weekend", async () => {
    const markup = await html();
    const forskudte = udbetalingsdatoerAar(2026, "maaned").filter((u) => u.forskudt);

    // Tre af tolv. Tallet er ikke hårdkodet, det læses fra modulet.
    expect(forskudte).toHaveLength(3);
    expect(markup).toContain("3 af de tolv datoer er flyttet");
    expect(markup).toContain("19. juni");
    expect(markup).toContain("18. september");
    expect(markup).toContain("18. december");
    // Og den oprindelige regel skal stå, ellers er tallene uforklarede.
    expect(markup).toContain("hverdagen inden");
  });

  test("viser alle tolv månedsdatoer for ungeydelsen", async () => {
    const markup = await html();
    for (const u of udbetalingsdatoerAar(2026, "maaned")) {
      const maaned = new Intl.DateTimeFormat("da-DK", { month: "long" })
        .format(u.dato)
        .toLowerCase();
      expect(markup, `20. ${maaned}`).toContain(`20. ${maaned}`);
    }
  });

  test("har en omregnet-pr.-måned-kolonne, der er mærket som ikkeofficiel", async () => {
    const markup = await html();

    expect(markup).toContain("Omregnet pr. måned");
    // 5.370 kr. pr. kvartal = 21.480 kr. pr. år = 1.790 kr. pr. måned.
    expect(markup).toContain("1.790");
    // Kolonnen må ikke fremstå som en sats fra myndighederne.
    expect(markup).toContain("er ikke en officiel sats");
  });

  test("viser beløb for flere børn, bygget på satsernes egne tal", async () => {
    const markup = await html();

    expect(markup).toContain("Hvad betyder det for en familie med flere børn?");
    // Tvillinger 0-2 år: 2 × 5.370 = 10.740 pr. kvartal.
    expect(markup).toContain("10.740");
    // 0-2 + 3-6: 5.370 + 4.248 = 9.618 pr. kvartal.
    expect(markup).toContain("9.618");
    // Og summen skal kunne efterprøves mod modulet, ikke bare stå i teksten.
    expect(BOERNE_SATSER_2026[0].hel * 2).toBe(10740);
  });

  test("svarer på de fire nye spørgsmål i FAQ'en", async () => {
    const markup = await html();

    for (const spg of [
      "Hvornår kommer børnepengen for et nyfødt barn?",
      "Hvad er børnepenge omregnet til pr. måned?",
      "Hvor meget får man i børnepenge med to børn?",
      "Hvornår skifter børnepengen sats",
    ]) {
      expect(markup, spg).toContain(spg);
    }
  });
});
