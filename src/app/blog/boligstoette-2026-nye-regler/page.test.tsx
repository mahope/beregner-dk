import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import Boligstoette2026Page, { generateMetadata } from "./page";

vi.mock("@/lib/get-locale", () => ({
  getCurrentDomainConfig: async () => ({
    baseUrl: "https://minberegner.dk",
    siteName: "MinBeregner.dk",
    ogLocale: "da_DK",
  }),
}));

describe("boligstøtte 2026 article", () => {
  test("viser officielle kilder, maksima og den officielle næste handling", () => {
    const html = renderToStaticMarkup(<Boligstoette2026Page />);

    expect(html).toContain("Boligstøtte 2026: standardmaksima, formue og beregning");
    expect(html).toContain("Åbn officiel beregning");
    expect(html).toContain("basisoplysninger");
    expect(html).toContain("1.194");
    expect(html).toContain("896.400");
    expect(html).toContain("896.400–1.793.000");
    expect(html).toContain("1.793.000 kr. og derover");
    expect(html).toContain("standardinterval");
     expect(html).toContain("Folkepensionister og førtidspensionister før 2003");
     expect(html).toContain("Pensionsrækkerne er en ordningsafklaring");
     expect(html).toContain('scope="row"');
     expect(html).toContain('tabindex="-1"');
     expect(html).toContain("bredbånd");
     expect(html).toContain("indskud og afdrag på indskud");
     expect(html).toContain("fællesantenne");
     expect(html).toContain("leje betalt forud");
     expect(html).toContain("møbler i en møbleret bolig");
     expect(html).toContain("vaskeri");
     expect(html).toContain("forbedringer som et nyt køkken eller bad");
    expect(html).toContain("0–896.400");
    expect(html).toContain("0–1.060.300");
     expect(html).toContain("Areal og husstandens øvrige sammensætning");
     expect(html).toContain("Vil du se, hvad du har råd til i husleje?");
     expect(html).toContain("Se, hvad der er tilbage af løn og andre indkomster efter skat");
     expect(html).not.toContain("Undersøg, om boligydelse kan være den relevante ordning");
     expect(html).not.toContain("Se din disponible indkomst før skat");
     expect(html).not.toContain("113.000");
     expect(html).not.toContain("73.000");
     expect(html).not.toContain("800.000");
     expect(html).not.toContain("850.000");
     expect(html).not.toContain("1.600.000");
     expect(html).not.toContain("1.700.000");
     expect(html).not.toContain("304 kr");
  });

  test("bruger én gang site-navnet i metadata", async () => {
    const metadata = await generateMetadata();
    expect(metadata.title).toBe("Boligstøtte 2026: Maksima, formue og beregning");
  });
});
