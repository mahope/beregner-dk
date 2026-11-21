import { describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(async () => "da"),
  getCurrentDomainConfig: vi.fn(async () => ({
    baseUrl: "https://minberegner.dk",
    siteName: "MinBeregner.dk",
    ogLocale: "da_DK",
    locale: "da",
  })),
}));

// `/kalorier` er sitets hub for madindhold. Porten renderer siden server-side
// og låser, at mikronæringsstofferne (jern, calcium, magnesium, zink og de
// tre vitaminer) er til at nå fra brødteksten — siderne er daOnly og blev
// ellers kun fundet gennem relaterede-kort.
vi.mock("@/components/KalorieBeregner", () => ({ default: () => <div>Kalorieværktøj</div> }));
vi.mock("@/components/KalorieTabel", () => ({ default: () => null }));
vi.mock("@/components/RelateredeArtikler", () => ({ default: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));

async function markup(): Promise<string> {
  const KalorierPage = (await import("@/app/kalorier/page")).default;
  return renderToStaticMarkup(await KalorierPage());
}

describe("/kalorier mikronæringsstoffer", () => {
  test("brødteksten linker til jern, calcium og de tre vitaminsider", async () => {
    const html = await markup();
    for (const href of [
      "/jern-i-madvarer",
      "/calcium-i-madvarer",
      "/magnesium-i-madvarer",
      "/zink-i-madvarer",
      "/kalium-i-madvarer",
      "/vitamin-d",
      "/vitamin-c",
      "/vitamin-b12",
    ]) {
      expect(html).toContain(`href="${href}"`);
    }
    expect(html).toContain("madvarerne har pr. 100 g");
    expect(html).toContain("du får i dem.");
  });
});
