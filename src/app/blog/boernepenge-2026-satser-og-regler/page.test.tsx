import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import {
  BOERNE_SATSER_2026,
  BOERNEUNGEYDELSE_2026,
  aarligBelob,
  beregnAftrapning,
  udbetalingsdatoerAar,
} from "@/lib/borneungeydelse";
import { barnetilskudSats } from "@/lib/barnetilskud";
import { formatNumber } from "@/lib/format";
import Boernepenge2026Page, { generateMetadata } from "./page";

vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({ FAQSchema: () => null, ArticleSchema: () => null }));
vi.mock("@/lib/get-locale", () => ({
  getCurrentDomainConfig: async () => ({
    baseUrl: "https://minberegner.dk",
    siteName: "MinBeregner.dk",
    ogLocale: "da_DK",
  }),
}));

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

/**
 * Beløbene i titel, beskrivelse og FAQ skal læses fra modulet, ikke skrives.
 * Titeln stod først herinde som «Børnepenge 2026: 5.370 kr./kvartal (0-2 år)», og
 * blev gentaget i `openGraph` og i `BlogArticleSchema` — altså tre steder, der
 * kunne glide fra tabellen på samme side.
 */
describe("børnepenge 2026 — beløb læst fra modulet", () => {
  const da = (n: number) => formatNumber(n, "da");

  test("titel og beskrivelse er satserne fra modulet", async () => {
    const [sats0, sats1, sats2, sats3] = BOERNE_SATSER_2026;
    const metadata = await generateMetadata();

    expect(metadata.title).toEqual({
      absolute: `Børnepenge 2026: ${da(sats0.hel)} kr./${sats0.intervalNavn} (${sats0.alder})`,
    });
    // Beskrivelsen nævner alle fire satser med deres aldersgruppe — så en
    // satsregulering ændrer én streng og ikke fire.
    const beskrivelse = metadata.description as string;
    for (const sats of BOERNE_SATSER_2026) {
      expect(beskrivelse, `satsen for ${sats.alder}`).toContain(da(sats.hel));
      expect(beskrivelse, `aldersgruppen ${sats.alder}`).toContain(`(${sats.alder})`);
    }
    expect(beskrivelse).toContain(`${da(sats3.hel)} kr./${sats3.intervalNavn} (${sats3.alder})`);
    expect(sats1.hel).not.toBe(sats2.hel);
    expect(metadata.openGraph?.description).toBe(beskrivelse);
    expect(metadata.openGraph?.title).toBe((metadata.title as { absolute: string }).absolute);
  });

  test("ungeydelsens sats og årstal i FAQ'en kommer fra samme sats", async () => {
    const markup = await html();
    const unge = BOERNE_SATSER_2026.at(-1);
    if (!unge) throw new Error("BOERNE_SATSER_2026 mangler ungeydelsen");

    // Satsen nævnes to gange («Hvornår skifter satsen» og «Hvad er ungeydelse»),
    // og årstallet skal være satsen ganget med de tolv udbetalinger.
    expect(markup).toContain(`Ungeydelsen er ${da(unge.hel)} kr. pr. måned`);
    expect(markup).toContain(`Satsen er ${da(unge.hel)} kr. pr. måned (${da(aarligBelob(unge))} kr. om året)`);
    expect(aarligBelob(unge)).toBe(unge.hel * 12);
  });

  test("børnetilskuddene i FAQ'en er modulet egne satser", async () => {
    const markup = await html();

    expect(markup).toContain(`${da(barnetilskudSats("ordinært").belob)} kr. pr. kvartal pr. barn`);
    expect(markup).toContain(`${da(barnetilskudSats("ekstra").belob)} kr. i ekstra børnetilskud`);
    expect(markup).toContain(
      `${da(barnetilskudSats("særligt-adoption").belob)} kr. i særligt børnetilskud ved adoption`,
    );
  });

  test("aftrapningseksemplet regner sig selv", async () => {
    const markup = await html();
    const graense = BOERNEUNGEYDELSE_2026.aftrapning.graense;
    // Parentesen er et **årstal**, ikke et kvartalsbeløb: 5.370 kr. pr. kvartal
    // for ét barn er 21.480 kr. om året, og to børn er 42.960 kr.
    const toBorn = aarligBelob(BOERNE_SATSER_2026[0]);

    // Eksemplets indkomst ligger 138.900 kr over grænsen, og de beløb, der står i
    // brødteksten, er præcis dem — de skal ikke kunne stå som håndskrevne tal.
    expect(markup).toContain(`Dit indtægtsgrundlag er ${da(1100000)} kr. i 2026`);
    expect(markup).toContain(`Beløbet over grænsen er ${da(1100000 - graense)} kr.`);
    expect(markup).toContain(
      `Nedsættelsen bliver 2 % × ${da(1100000 - graense)} kr. = ${da(beregnAftrapning(1100000))} kr. årligt.`,
    );
    // De to børn er satserne selv, to gange: 21.480 × 2 = 42.960 om året.
    expect(markup).toContain(`(${da(toBorn)} kr × 2 = ${da(toBorn * 2)} kr.)`);
    expect(toBorn).toBe(21480);
    // Og nedsættelsen trækkes fra det samlede beløb for de to børn.
    expect(markup).toContain(da(toBorn * 2 - beregnAftrapning(1100000)));
    expect(toBorn * 2 - beregnAftrapning(1100000)).toBe(40182);
  });

  test("familietabellen summerer satserne, ikke tal der er skrevet ved siden af dem", async () => {
    const markup = await html();
    const [sats0, sats1, sats2, sats3] = BOERNE_SATSER_2026;

    // Rækkerne i rækkefølge: ét barn, tvillinger, 0-2 + 3-6, 3-6 + 3-6 + 7-14,
    // og to 15-17-årige månedligt for et helt kvartal.
    for (const forventet of [
      sats0.hel,
      sats0.hel * 2,
      sats0.hel + sats1.hel,
      sats1.hel * 2 + sats2.hel,
      sats3.hel * 3 * 2,
    ]) {
      expect(markup).toContain(`${da(forventet)} kr.`);
    }
  });
});
