import { describe, expect, test, vi } from "vitest";
import { getPageData } from "@/lib/page-data";
import { LEASING_EKSEMPEL, beregnLeasing } from "@/lib/leasing";
import { leasingSeEksempelTekster } from "@/lib/leasing-eksempler";
import { formatBelob } from "@/lib/format";

/**
 * Den svenske `/leasing` skrev sit standardeksempel som rå tekst: «300.000 kr»,
 * «150.000 kr», «4,5 %», «30.000 kr», «4.121 kr», «178.350 kr» og «28.350 kr»
 * i titel, description, metaDescription, ogDescription, schemaDescription og
 * tre FAQ-svar. `FAQSchema` læser præcis `faqItems`, så de var tal i Googles
 * rich resultat — og ingen port kunne se dem, for de lå i `page-data.ts`.
 *
 * Testen dømmer derfor to ting ad gangen: dels at strengene er de tal, modulet
 * regner sig frem til, og dels at `page-data.ts` faktisk læser dem fra modulet.
 * Den anden del mocker modulet med umiskendelige strenge — mod den håndskrevne
 * tekst er den rød.
 */

describe("/leasing læser sit svenske eksempel fra modulet", () => {
  const tekst = leasingSeEksempelTekster();

  test("beløbene er beregnLeasings egne tal, formateret som svensk", () => {
    const r = beregnLeasing(LEASING_EKSEMPEL)!;
    const se = (tal: number, dec = 0) => formatBelob(tal, "se", dec);

    expect(r.maanedligYdelse).toBeCloseTo(4120.83, 2);
    expect(r.totalLeasing).toBeCloseTo(178350, 1);
    expect(r.totalRente).toBeCloseTo(28350, 1);
    expect(r.vaerdtab).toBeCloseTo(150000, 1);

    // Tusindtalsseparatoren er mellemrum i svensk, punktum var dansk.
    expect(se(r.totalLeasing)).toBe("178 350");
    expect(se(r.maanedligYdelse)).toBe("4 121");
    expect(se(LEASING_EKSEMPEL.bilpris)).toBe("300 000");
    expect(se(LEASING_EKSEMPEL.rentesats, 1)).toBe("4,5");
  });

  test("titlen lover præcis den månedsydelse, værktøjet starter med", () => {
    const maaned = formatBelob(beregnLeasing(LEASING_EKSEMPEL)!.maanedligYdelse, "se");
    expect(tekst.title).toBe(`Leasingkalkylator: bil på 300 000 kr = ${maaned} kr/mån`);
  });

  test("ingen svensk streng bruger dansk tusindtalsseparator", () => {
    for (const [naegn, vaerdi] of Object.entries(tekst)) {
      expect(vaerdi, naegn).not.toMatch(/\d\.\d{3}/);
    }
  });

  test("FAQ-svarene nævner de samme beløb som metadata", () => {
    const totalt = formatBelob(beregnLeasing(LEASING_EKSEMPEL)!.totalLeasing, "se");
    const rente = formatBelob(beregnLeasing(LEASING_EKSEMPEL)!.totalRente, "se");
    expect(tekst.faqKostnadAnswer).toContain(`${totalt} kr totalt inklusive ${rente} kr i ränta`);
    expect(tekst.faqKostnadQuestion).toContain("bil på 300 000 kr");
  });
});

/**
 * Den anden halvdel af porten: mock-modulet med strenge, der ikke findes i
 * `page-data.ts`, så en håndskreven titel eller et håndskrevet FAQ-svar giver
 * rødt. Det er den mutation, der viser at testen kan fejle.
 */
describe("/leasing svenske side læser strengene fra leasing-eksempler", () => {
  test("page-data bruger modulet, ikke håndskrevet tekst", async () => {
    vi.resetModules();
    vi.doMock("@/lib/leasing-eksempler", () => ({
      leasingSeEksempelTekster: () => ({
        title: "MOCKET-titel",
        description: "MOCKET-description",
        metaDescription: "MOCKET-metaDescription",
        ogDescription: "MOCKET-ogDescription",
        schemaDescription: "MOCKET-schemaDescription",
        faqKostnadQuestion: "MOCKET-faqKostnadQuestion",
        faqKostnadAnswer: "MOCKET-faqKostnadAnswer",
        faqVaerdetabAnswer: "MOCKET-faqVaerdetabAnswer",
        faqFaretagAnswer: "MOCKET-faqFaretagAnswer",
      }),
    }));

    const { getPageData: hent } = await import("@/lib/page-data");
    const se = hent("leasing", "se")!;

    expect(se.title).toBe("MOCKET-titel");
    expect(se.description).toBe("MOCKET-description");
    expect(se.metaDescription).toBe("MOCKET-metaDescription");
    expect(se.ogDescription).toBe("MOCKET-ogDescription");
    expect(se.schemaDescription).toBe("MOCKET-schemaDescription");
    expect(se.faqItems.map((f) => f.question)).toContain("MOCKET-faqKostnadQuestion");
    expect(se.faqItems.map((f) => f.answer).join(" ")).toContain("MOCKET-faqKostnadAnswer");
    expect(se.faqItems.map((f) => f.answer).join(" ")).toContain("MOCKET-faqVaerdetabAnswer");
    expect(se.faqItems.map((f) => f.answer).join(" ")).toContain("MOCKET-faqFaretagAnswer");

    vi.doUnmock("@/lib/leasing-eksempler");
    vi.resetModules();
  });

  test("dansk og norsk /leasing har ingen beløb og er uændrede", () => {
    for (const locale of ["da", "no"] as const) {
      const data = getPageData("leasing", locale)!;
      const alt = [data.title, data.description, data.metaDescription, data.schemaDescription]
        .concat(data.faqItems.flatMap((f) => [f.question, f.answer]))
        .join(" ");
      expect(alt, locale).not.toMatch(/\d[\d.,]*\s*kr/);
      expect(alt, locale).not.toMatch(/\d\.\d{3}/);
    }
  });
});