import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getPageData } from "@/lib/page-data";
import { RUTE_CACHE_DAGE, ruteCacheSætning } from "@/lib/rute-cache";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import AfstandMellemAdresserPage from "./page";

vi.mock("@/components/AfstandsBeregner", () => ({ default: () => <div>Afstandsværktøj</div> }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

async function html(): Promise<string> {
  vi.mocked(getLocale).mockResolvedValue("da");
  vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  return renderToStaticMarkup(await AfstandMellemAdresserPage());
}

/**
 * Siden er den eneste indgang til en rute der ellers kun lå gemt i
 * `BefordringsfradragBeregner`'s "find afstand"-felt. Uden værktøjet på egen
 * side svarer den danske søgning «beregn afstand mellem to adresser» (nr. 3 i
 * googles autocomplete under «beregn») ingen steder — så prøverne dømmer
 * præcis de tre ting, siden er byget af: værktøjet, brødteksten og de tre
 * spørgsmål.
 */
describe("afstand mellem to adresser", () => {
  beforeEach(() => vi.clearAllMocks());

  test("viser afstandsværktøjet og videre til kørselsfradraget", async () => {
    const markup = await html();
    expect(markup).toContain("Afstandsværktøj");
    expect(markup).toContain("/befordringsfradrag");
    expect(markup).toContain("Kørselsafstand er ikke luftlinje");
    expect(markup).not.toContain("NaN");
  });

  test("har præcis de tre spørgsmål i side-data", async () => {
    const markup = await html();
    expect(markup.match(/<h2/g) ?? []).toHaveLength(3);
    const { faqItems } = getPageData("afstand-mellem-adresser", "da")!;
    expect(faqItems).toHaveLength(3);
    expect(faqItems.map((f) => f.question)).toEqual([
      "Hvordan beregnes afstanden?",
      "Hvorfor får jeg to afstande, når ruten krydser en færge?",
      "Kan jeg bruge afstanden til kørselsfradraget?",
    ]);
  });

  test("er dansk og skriver ikke om sit eget værktøj i ukendte byer", async () => {
    const markup = await html();
    // Ruten er hentet fra Valhalla/OSRM via FOSSGIS — oplysningen står i
    // RuteAfstand, så brødteksten må ikke finde på en anden kilde.
    expect(markup).toContain("Adressevælger fra Klimadatastyrelsen");
    expect(markup).not.toContain("Google Maps");
  });

  test("fortæller at ruten gemmes midlertidigt, som privatlivspolitikken gør", async () => {
    // Siden lovede tidligere «Vi gemmer hverken dine adresser eller din rute»,
    // mens `rute.ts` skrev ruten i hukommelsen i syv dage under nøglen med de
    // to koordinater. Sætningen kommer nu fra `rute-cache.ts`, som også
    // privatlivspolitikken læser, så de to ikke kan glide fra hinanden.
    const markup = await html();
    const sætning = ruteCacheSætning();

    expect(markup).toContain(sætning);
    expect(markup).toContain(`${RUTE_CACHE_DAGE} dage`);
    expect(markup).not.toMatch(/gemmer hverken[^.]*ruten?/i);
  });
});