import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import TidszonePage from "./page";

vi.mock("@/components/TidszoneBeregner", () => ({
  default: () => <div>Tidszoneværktøj</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

describe("tidszone page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Når det er 12 i Danmark, er det 06 i New York",
      lead: "Klokken 12 i Danmark er",
      row: "<td>New York</td>",
      values: "<td>06:00</td>",
      tableHeader: "Vintertid (kl. 12 CET)",
    },
    {
      locale: "se" as const,
      heading: "När det är 12 i Sverige är det 06 i New York",
      lead: "Klockan 12 i Sverige är",
      row: "<td>New York</td>",
      values: "<td>06:00</td>",
      tableHeader: "Vintertid (kl. 12 CET)",
    },
  ])("viser det konkrete svar og beregneren i $locale", async ({ locale, heading, lead, row, values, tableHeader }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await TidszonePage());

    expect(html).toContain(`>${heading}<`);
    expect(html).toContain(lead);
    expect(html).toContain(tableHeader);
    expect(html).toContain(row);
    expect(html).toContain(values);
    expect(html).toContain("Tidszoneværktøj");
  });

  test.each(["da", "se"] as const)(
    "metadata i %s svarer direkte paa tidsspoergsmaalet",
    (locale) => {
      const pageData = getPageData("tidszone", locale);
      expect(pageData).toBeDefined();
      const metaTitle = pageData!.metaTitle;
      const metaDescription = pageData!.metaDescription;

      expect(metaTitle.length).toBeLessThanOrEqual(60);
      expect(metaDescription.length).toBeLessThanOrEqual(160);
      expect(metaTitle).toMatch(/USA/);
      expect(metaTitle).toMatch(/12/);
      expect(metaDescription).toMatch(/New York/);
      expect(pageData!.ogTitle).toMatch(/New York/);
      expect(pageData!.schemaDescription).toBeTruthy();
    }
  );
});
