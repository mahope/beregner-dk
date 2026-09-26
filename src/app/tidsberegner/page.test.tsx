import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import TidsberegnerPage from "./page";

vi.mock("@/components/TidsBeregner", () => ({
  default: () => <div>Tidsværktøj</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

describe("tidsberegner page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Hvor lang tid er der mellem to klokkeslæt?",
      answer: "Beregn hvor lang tid der går mellem to klokkeslæt – i timer, minutter og decimaltimer. Træk en pause fra.",
      schema: "Gratis tidsberegner. Beregn tidsrum mellem to klokkeslæt og se resultatet i timer, minutter og decimaltimer.",
    },
    {
      locale: "se" as const,
      heading: "Tidskalkylator",
      answer: "Beräkna hur lång tid det går mellan två klockslag – i timmar, minuter och decimaltimmar. Dra av en rast.",
      schema: "Gratis tidskalkylator. Beräkna tidsintervall mellan två klockslag och se resultatet i timmar, minuter och decimaltimmar.",
    },
  ])("viser det konkrete svar, schema og beregneren i $locale", async ({ locale, heading, answer, schema }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await TidsberegnerPage());

    expect(html).toContain(`>${heading}</h1>`);
    expect(html).toContain(answer);
    expect(html).toContain(schema);
    expect(html).toContain("Tidsværktøj");
  });

  // Search Console: "hvor lang tid" 790 visninger pos. 6. Svar-først-tabellen
  // er dansk, fordi spørgsmålet er dansk; den må ikke lække til beraknare.se,
  // der har sit eget svar-først-sæt (C38).
  test("da viser svar-først-tabellen med det lovede eksempel", async () => {
    const html = renderToStaticMarkup(await TidsberegnerPage());

    expect(html).toContain("Svar på de oftest søgte tidsrum");
    expect(html).toContain("<strong>8 t 15 min</strong>");
    expect(html).toContain("8.25 timer");
    expect(html).toContain("(dagen efter)");
  });

  test("se får ikke den danske svar-først-tabel", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await TidsberegnerPage());

    expect(html).not.toContain("Svar på de oftest søgte tidsrum");
    expect(html).not.toContain("dagen efter");
  });
});
