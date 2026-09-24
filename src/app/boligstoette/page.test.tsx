import { LocaleProvider } from "@/components/LocaleProvider";
import nextConfig from "../../../next.config";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import BoligstoettePage, { generateMetadata } from "./page";

vi.mock("@/components/BoligstoetteBeregner", () => ({
  default: () => <div>Standardinterval</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));

vi.mock("@/lib/get-locale", () => ({
  getLocale: async () => "da",
  getCurrentDomainConfig: async () => ({
    locale: "da",
    baseUrl: "https://minberegner.dk",
    siteName: "MinBeregner.dk",
    ogLocale: "da_DK",
    analyticsDataDomain: "minberegner.dk",
    countryFlag: "",
    countryName: "danskere",
    currency: "DKK",
    hreflangCode: "da",
  }),
}));

describe("boligstoette page", () => {
  test("viser kildeført screening og den officielle næste handling", async () => {
    const page = await BoligstoettePage();
    const html = renderToStaticMarkup(
      <LocaleProvider
        locale="da"
        domainConfig={{
          locale: "da",
          baseUrl: "https://minberegner.dk",
          siteName: "MinBeregner.dk",
          ogLocale: "da_DK",
          analyticsDataDomain: "minberegner.dk",
          countryFlag: "",
          countryName: "danskere",
          currency: "DKK",
          hreflangCode: "da",
        }}
      >
        {page}
      </LocaleProvider>,
    );

    expect(html).toContain("Boligstøtte 2026: Standardmaksima, formue og beregning");
    expect(html).toContain("Åbn den officielle beregner");
    expect(html).toContain("basisoplysninger");
    expect(html).toContain("1.194");
     expect(html).toContain("896.400");
     expect(html).toContain("Over 896.400 kr. til 1.793.000 kr.");
     expect(html).toContain("1.793.000 kr. og derover");
     expect(html).toContain("Over 1.060.300 kr. til 2.120.800 kr.");
    expect(html).toContain("Standardinterval");
     expect(html).toContain("Folkepensionister og førtidspensionister før 2003");
     expect(html).toContain("Pensionsrækkerne er en ordningsafklaring");
     expect(html).toContain('scope="row"');
     expect(html).toContain('tabindex="-1"');
     expect(html).toContain("bredbånd");
     expect(html).toContain("indskud og afdrag på indskud");
     expect(html).toContain("fællesantenne");
     expect(html).toContain("forbedringer som et nyt køkken eller bad");
     expect(html).toContain("0–896.400");
     expect(html).toContain("0–1.060.300");
     expect(html).not.toContain("Boligstøtteberegner");
     expect(html).not.toContain("113.000");
     expect(html).not.toContain("73.000");
     expect(html).not.toContain("800.000");
     expect(html).not.toContain("850.000");
     expect(html).not.toContain("1.600.000");
     expect(html).not.toContain("1.700.000");
     expect(html).not.toContain("304 kr");
  });

  test("deaktiverer referrer på den følsomme delestatsside", async () => {
    const metadata = await generateMetadata();
    const headerRules = await nextConfig.headers?.();

    expect(metadata.referrer).toBe("no-referrer");
    expect(headerRules?.find((rule) => rule.source === "/boligstoette")?.headers).toContainEqual({
      key: "Referrer-Policy",
      value: "no-referrer",
    });
  });
});
