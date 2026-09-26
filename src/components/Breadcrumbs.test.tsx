import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getAvailableSlugs, getPageData } from "@/lib/page-data";
import { getRouteDecision } from "@/lib/routing";

vi.mock("@/lib/get-locale", () => ({
  getCurrentDomainConfig: vi.fn(),
}));

const da = getDomainConfigByLocale("da");
const se = getDomainConfigByLocale("se");

async function render(locale: "da" | "se", items: { name: string; href: string }[]) {
  vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
  return renderToStaticMarkup(await Breadcrumbs({ items }));
}

function jsonLd(markup: string): {
  itemListElement: { position: number; name: string; item?: string }[];
} {
  const match = markup.match(
    /<script type="application\/ld\+json">(.*?)<\/script>/s
  );
  return JSON.parse(match![1]);
}

describe("breadcrumbs", () => {
  beforeEach(() => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(da);
  });

  test("category crumb is a link on the Danish domain", async () => {
    const markup = await render("da", [
      { name: "Hverdag", href: "/kategori/hverdag" },
      { name: "Beregn antal dage mellem to datoer", href: "/dato" },
    ]);

    expect(markup).toContain('href="/kategori/hverdag"');
    expect(jsonLd(markup).itemListElement[1].item).toBe(
      "https://minberegner.dk/kategori/hverdag"
    );
  });

  test("home stays a link and the current page is never a link", async () => {
    for (const locale of ["da", "se"] as const) {
      const markup = await render(locale, [
        { name: "Hverdag", href: "/kategori/hverdag" },
        { name: "Datokalkylator", href: "/dato" },
      ]);
      const items = jsonLd(markup).itemListElement;

      expect(items[0]).toMatchObject({
        position: 1,
        item: locale === "da" ? "https://minberegner.dk" : "https://beraknare.se",
      });
      expect(items[2]).toMatchObject({ position: 3, name: "Datokalkylator" });
      expect(items[2].item).toBeUndefined();
      expect(markup).toContain('href="/"');
      expect(markup).not.toContain('href="/dato"');
    }
  });

  test("a crumb whose section does not exist on the domain is plain text, also in JSON-LD", async () => {
    const markup = await render("se", [
      { name: "Vardag", href: "/kategori/hverdag" },
      { name: "Beräkna antal dagar mellan två datum", href: "/dato" },
    ]);

    expect(markup).not.toContain("/kategori/");
    expect(markup).toContain("Vardag");
    const items = jsonLd(markup).itemListElement;
    expect(items).toHaveLength(3);
    expect(items[1]).toMatchObject({ position: 2, name: "Vardag" });
    expect(items[1].item).toBeUndefined();
  });

  test("no Swedish or Norwegian page links to a section that 404s there", async () => {
    for (const locale of ["se", "no"] as const) {
      for (const slug of getAvailableSlugs(locale)) {
        const data = getPageData(slug, locale)!;
        const markup = await render(locale, [
          { name: data.breadcrumbCategory, href: data.breadcrumbCategoryHref },
          { name: data.title, href: `/${slug}` },
        ]);

        expect(
          markup.includes(`href="${data.breadcrumbCategoryHref}"`),
          `${locale}/${slug} links ${data.breadcrumbCategoryHref}`
        ).toBe(false);
      }
    }
  });

  test("every Danish page still links its category", async () => {
    for (const slug of getAvailableSlugs("da")) {
      const data = getPageData(slug, "da")!;
      const markup = await render("da", [
        { name: data.breadcrumbCategory, href: data.breadcrumbCategoryHref },
        { name: data.title, href: `/${slug}` },
      ]);

      expect(
        markup.includes(`href="${data.breadcrumbCategoryHref}"`),
        `da/${slug} lost its category link`
      ).toBe(true);
    }
  });

  test("the Swedish dage-til category crumb is one the fix has to cover", () => {
    // src/components/DageTilPage.tsx passes /kategori/praktisk on the Swedish
    // domain, where the whole /kategori section is Danish-only.
    expect(getRouteDecision(se, "/kategori/praktisk")).toEqual({ type: "not-found" });
    expect(getRouteDecision(da, "/kategori/hverdag")).toEqual({ type: "allow" });
  });
});
