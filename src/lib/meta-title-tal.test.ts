import { describe, test, expect } from "vitest";
import { getPageData } from "./page-data";

/**
 * Et regnet eksempel i `metaTitle` er det stærkeste enkeltstående CTR-signal på
 * sitet, og det er målt, ikke antaget (GSC 3/10, 28 dage):
 *
 * | side            | visninger | klik | CTR   | pos. | eksempel i titlen |
 * |-----------------|-----------|------|-------|------|------------------|
 * | `/kvadratmeter` |    20.768 |  310 | 1,5 % |  4,9 | ja — 5 x 4 m = 20 m² |
 * | `/promille`     |     6.003 |   97 | 1,6 % |  7,8 | ja — 4 øl på 80 kg = 0,88 ‰ |
 * | `/braendstof`   |    16.518 |  174 | 1,1 % |  5,9 | ja — 500 km benzin koster 450 kr. |
 * | `/rentefradrag` |     5.082 |  296 | 5,8 % |  5,6 | ja — «33,6 % på de første 50.000 kr.» |
 * | `/renteberegner`|    12.610 |  107 | 0,8 % |  7,4 | **nej** |
 * | `/alder`        |    10.029 |   43 | 0,4 % |  7,2 | **nej → rettet 3/10** |
 * | `/tidszone`     |    23.351 |  101 | 0,4 % |  7,6 | **nej → rettet 3/10** |
 *
 * Mønsteret er et brud på positionen: de to sider med eksempel på pos. 7,6-7,8
 * har 1,1-1,6 % CTR, og de to sider med spørgsmålstitel på pos. 7,2-7,6 har
 * 0,4 %. Så det er ikke placeringen, der afgør om folk klikker.
 *
 * Porten dømmer **tallet i titlen**, ikke hele sætningen, så en ny formulering
 * («Aldersberegner: 36 år gammel i dag») ikke låser den rigtige løsning fast —
 * kun fjernelsen af regningen gør porten rød. Samme læge som SKATTELOFT-porten
 * og `npiRetning` i `/husleje`: døm talet og forholdet, ikke ordlyden.
 */
const MALTE_SIDER = [
  "kvadratmeter",
  "promille",
  "braendstof",
  "rentefradrag",
  "procent",
  "dato",
  "tidsberegner",
  "tidszone",
  "moms",
  "kalorier",
  "alder",
  "boligstoette",
  "dagpenge",
] as const;

/**
 * `/renteberegner` (12.610 visninger, 0,8 % CTR) og `/arveafgift` er de to
 * sidste sider i GSC-top-15 uden regnet eksempel. De står **ikke** i
 * `MALTE_SIDER` endnu, fordi de er ændringer i hver sin `metaTitle` med hvert
 * sit eksempelstal — det er to opgaver, ikke en ratchet på to strenge.
 */
describe("metaTitle på sitets største sider", () => {
  test.each(MALTE_SIDER)("%s har et regnet eksempel i titlen", (slug) => {
    const data = getPageData(slug, "da");
    expect(data, `getPageData("${slug}", "da") skal finde siden`).toBeDefined();
    expect(data!.metaTitle).toMatch(/\d/);
  });

  test.each(["da", "se", "no"] as const)(
    "titlen på /alder og /tidszone er regnet i %s, ikke frosset",
    (locale) => {
      for (const slug of ["alder", "tidszone"] as const) {
        const data = getPageData(slug, locale);
        expect(data, `getPageData("${slug}", "${locale}") skal finde siden`).toBeDefined();
        // En uløst `{AAR}` ville stå som bogstaver i Googles titellinje.
        expect(data!.metaTitle).not.toMatch(/\{[A-Z]+\}/);
        expect(data!.ogTitle).toBe(data!.metaTitle);
      }
    },
  );
});
