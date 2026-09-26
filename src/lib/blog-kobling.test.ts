import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { BEREGNER_ARTIKLER, beregnerForArtikler, kobledeBeregnere } from "@/lib/blog-kobling";

const root = join(__dirname, "..", "..");
const appDir = join(root, "src", "app");

function pageExists(route: string): boolean {
  return existsSync(join(appDir, route, "page.tsx"));
}

describe("blog-kobling", () => {
  test("hvert koblet indlæg findes som en blogside", () => {
    for (const [href, artikler] of Object.entries(BEREGNER_ARTIKLER)) {
      for (const artikel of artikler) {
        expect(pageExists(`/blog/${artikel.slug}`), `${href} -> /blog/${artikel.slug}`).toBe(true);
      }
    }
  });

  test("hver koblet beregner findes som en side", () => {
    for (const href of kobledeBeregnere()) {
      expect(pageExists(href), href).toBe(true);
    }
  });

  /**
   * Symmetrien er hele pointen med modulet: et indlæg, der er koblet her, skal
   * kunne nås *fra* beregneren. Ellers er koblingen løgn, og indlægget får ingen
   * indgangslinks fra sitets mest besøgte sider.
   */
  test("beregnersiden renderer et returlink til hvert koblet indlæg", () => {
    for (const [href, artikler] of Object.entries(BEREGNER_ARTIKLER)) {
      const source = readFileSync(join(appDir, href, "page.tsx"), "utf8");
      for (const artikel of artikler) {
        expect(source, `${href} mangler <RelateredeArtikler>`).toContain("RelateredeArtikler");
        expect(source, `${href} peger på forkert beregner`).toContain(`current="${href}"`);
      }
      expect(artikler.length, `${href} har ingen kobling`).toBeGreaterThan(0);
    }
  });

  test("et indlæg kobles kun til én beregner", () => {
    const set = new Set<string>();
    for (const [href, artikler] of Object.entries(BEREGNER_ARTIKLER)) {
      for (const artikel of artikler) {
        expect(set.has(artikel.slug), `${artikel.slug} er koblet til flere beregnere`).toBe(false);
        set.add(artikel.slug);
        expect(beregnerForArtikler(artikel.slug), artikel.slug).toBe(href);
      }
    }
  });

  test("alle tre domæner er dækket af den samme kobling", () => {
    for (const href of kobledeBeregnere()) {
      expect(BEREGNER_ARTIKLER[href]).toBeDefined();
    }
  });
});
