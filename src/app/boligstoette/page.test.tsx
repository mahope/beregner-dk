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

    expect(html).toContain("Beregn boligstøtte 2026: standardmaksima og formue");
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
     // Sidens største søgning er "beregn boligstøtte" (900 visninger/28d, pos.
     // 10), og før denne titel brugte siden slet ikke ordene. Den hedder
     // stadig ikke "Boligstøtteberegner": værktøjet er en screening, ikke en
     // ansøgningsberegning, så løftet skal være handlingen, ikke et navn der
     // lover en endelig udbetaling.
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

   test("siger at boligsikring er en ydelse hos Udbetaling Danmark, ikke en opsparing", async () => {
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

     expect(html).toContain("Boligstøtte og boligsikring");
     expect(html).toContain("du søger om hos Udbetaling Danmark via borger.dk");
     expect(html).toContain("ikke en opsparingsordning");
     expect(html).toContain("lov om individuel boligstøtte");
     // Det afgørende: boligsikring må ikke kaldes en ordning hos en kreditgiver.
     expect(html).not.toContain("obligatorisk opsparingsordning");
     expect(html).not.toContain("Realkredit Danmark");
     expect(html).not.toContain("du lånter mod din egen opsparing");
   });

   test("spørgsmålet om forskellen ligger i FAQ'en, så det kommer i JSON-LD", async () => {
     const { getPageData } = await import("@/lib/page-data");
     const faq = getPageData("boligstoette", "da")!.faqItems;

     const fundet = faq.find((f) => f.question.includes("boligsikring"));
     expect(fundet).toBeDefined();
     expect(fundet!.answer).toContain("Udbetaling Danmark");
     expect(fundet!.answer).toContain("60 pct.");
     expect(fundet!.answer).toContain("LBK 229");
     expect(fundet!.answer).not.toContain("Realkredit Danmark");
     expect(fundet!.answer).not.toContain("obligatorisk opsparingsordning");
   });
});
