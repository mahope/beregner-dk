import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getDageTilSlugs } from "@/lib/dage-til";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import NedtaellingPage from "./page";

vi.mock("@/components/NedtaellingBeregner", () => ({
  default: () => <div>Nedtællingsværktøj</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));

vi.mock("@/lib/get-locale", () => ({
  getCurrentDomainConfig: vi.fn(),
}));

const render = async (locale: "da" | "se" | "no") => {
  vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
  return renderToStaticMarkup(await NedtaellingPage());
};

describe("nedtaelling page", () => {
  beforeEach(() => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Hvor mange dage er der til en dato?",
      example: "100 dage",
      weeks: "14 uger",
    },
    {
      locale: "se" as const,
      heading: "Hur många dagar är det kvar till ett datum?",
      example: "100 dagar",
      weeks: "14 veckor",
    },
  ])(
    "viser svaret i dage og uger og bevarer værktøjet i $locale",
    async ({ locale, heading, example, weeks }) => {
      const html = await render(locale);

      expect(html).toContain(`>${heading}</h1>`);
      expect(html).toContain(example);
      expect(html).toContain(weeks);
      expect(html).toContain("Nedtællingsværktøj");
    }
  );

  test("dansk side linker til alle dage-til-sider og videre til /dato", async () => {
    const html = await render("da");

    for (const slug of getDageTilSlugs("da")) {
      expect(html, slug).toContain(`href="/dage-til/${slug}"`);
    }
    expect(html).toContain('href="/dato"');
  });

  test("svensk side bruger svenska slugs", async () => {
    const html = await render("se");

    for (const slug of getDageTilSlugs("se")) {
      expect(html, slug).toContain(`href="/dagar-till/${slug}"`);
    }
    expect(html).not.toContain("/dage-til/");
  });

  test("norsk domaene faar ingen dage-til-links", async () => {
    const html = await render("no");

    expect(html).not.toContain("/dage-til/");
    expect(html).not.toContain("/dagar-till/");
  });
});
