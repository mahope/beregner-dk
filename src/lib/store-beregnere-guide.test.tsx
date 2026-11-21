/**
 * Beregnere med dokumenteret trafik skal vise den guide, der findes til dem
 * (opgave 194).
 *
 * `blog-kobling.test.ts` læser sidens *kildekode* for strengen
 * `RelateredeArtikler`. Det er grønt, også når komponenten aldrig renderer:
 * `RelateredeArtikler` returnerer `null` for `locale !== "da"`, så en kildekodere-
 * læsning passer på alle tre domæner uden at blokken nogensinde dukker op.
 * Det er præcis den målerfælde opgave 191 opdagede, og derfor renderer denne
 * port **markupken** og læser den.
 *
 * De to sider her blev målt 1/10 på Plausible (28 dage, 2026-09-30):
 * `/boligstoette` 529 besøgende (+78 %) og `/pension` 142. Begge havde et
 * indlæg, der链接ede tilbage til siden, men læseren fandt det kun som et skjult
 * link i brødteksten — `/pension` manglede det helt. Det er samme fejl som
 * opgave 191 fandt på `/bmi`, og samme retning: en beregner uden en synlig vej
 * ud af værktøjet er en gade.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { BEREGNER_ARTIKLER } from "@/lib/blog-kobling";

const LOCALE = vi.hoisted(() => ({ current: "da" as "da" | "se" }));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(async () => LOCALE.current),
  getCurrentDomainConfig: vi.fn(async () => ({
    baseUrl: "https://minberegner.dk",
    siteName: "MinBeregner.dk",
    ogLocale: "da_DK",
  })),
}));

// Værktøjerne er klientkomponenter. `/pension` indlægger den med
// `next/dynamic`, hvis indlæsning suspenderer — og en suspendérende komponent
// kan ikke renderes i et synkront `renderToStaticMarkup`. Derfor stubbes
// `dynamic` direkte, som `dato/page.test.tsx` gør. Det er en målebegrænsning,
// ikke en fejl på siden: alt porten vil se ligger uden for værktøjet.
vi.mock("next/dynamic", () => ({ default: () => () => <div>Værktøj</div> }));
vi.mock("@/components/BoligstoetteBeregner", () => ({ default: () => <div>Værktøj</div> }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));

const BOLIGSTOETTE = (await import("@/app/boligstoette/page")).default;
const PENSION = (await import("@/app/pension/page")).default;

const SIDER = [
  { sti: "/boligstoette", Side: BOLIGSTOETTE },
  { sti: "/pension", Side: PENSION },
];

async function markup(sti: string, Side: (typeof SIDER)[number]["Side"]): Promise<string> {
  LOCALE.current = "da";
  return renderToStaticMarkup(await Side());
}

describe("trafikstærke beregnere viser deres guide", () => {
  test.each(SIDER)("$sti renderer blokken med alle sine artikler", async ({ sti, Side }) => {
    const da = await markup(sti, Side);
    expect(da, `${sti} mangler "Guides om emnet"`).toContain("Guides om emnet");
    for (const artikel of BEREGNER_ARTIKLER[sti]) {
      expect(da, `${sti} mangler link til /blog/${artikel.slug}`).toContain(
        `/blog/${artikel.slug}`,
      );
      // Titlen skal være i markupken, ikke blot href'en — ellers kunne blokken
      // vise et tomt kort der stadig er gyldigt for porten.
      expect(da, `${sti} viser ikke artiklens titel`).toContain(artikel.titel);
    }
  });

  /**
   * Blokerne er danske. Uden denne påstand ville porten være grøn, selv om
   * `RelateredeArtikler` holdt op med at returnere `null` for `locale !== "da"`
   * — altså hvis dansk tekst slap ind på beraknare.se.
   */
  test.each(SIDER)("$sti viser ingen dansk guide på det svenske domæne", async ({ sti, Side }) => {
    LOCALE.current = "se";
    const se = renderToStaticMarkup(await Side());
    expect(se, `${sti} viser dansk på beraknare.se`).not.toContain("Guides om emnet");
  });

  /**
   * Ét sted pr. link. Review-fundet 1/10 fandt den samme fejl på forsiden:
   * en genvejstribe ovenfor et gitter med *de samme* otte links. En læser der
   * scroller forbi guide-blokken og møder artiklen igen i brødteksten har fået
   * to veje til det samme sted, og bloker den er den tunge af dem.
   */
  test.each(SIDER)("$sti peger på hvert indlæg ét sted i markupken", async ({ sti, Side }) => {
    const da = await markup(sti, Side);
    for (const artikel of BEREGNER_ARTIKLER[sti]) {
      const forekomster = da.match(new RegExp(`/blog/${artikel.slug}`, "g"))?.length ?? 0;
      expect(
        forekomster,
        `${sti} linker til /blog/${artikel.slug} ${forekomster} gange — ét sted pr. guide`,
      ).toBe(1);
    }
  });
});