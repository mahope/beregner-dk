import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { beregnerForArtikler } from "@/lib/blog-kobling";

const blogDir = join(__dirname);
const appDir = join(__dirname, "..");

interface Artikel {
  slug: string;
  kilde: string;
  /** Alt før den næste handling — altså den brødtekst, læseren har læst. */
  foer: string;
  cta: string;
}

function artikler(): Artikel[] {
  return readdirSync(blogDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name)
    .filter((slug) => existsSync(join(blogDir, slug, "page.tsx")))
    .map((slug) => {
      const kilde = readFileSync(join(blogDir, slug, "page.tsx"), "utf8");
      const ctaIdx = kilde.indexOf("<NaesteSkridt");
      return {
        slug,
        kilde,
        cta: ctaIdx === -1 ? "" : kilde.slice(ctaIdx),
        foer: ctaIdx === -1 ? kilde : kilde.slice(0, ctaIdx),
      };
    });
}

const ALLE = artikler();

describe("bloggens næste handling", () => {
  test("der er indlæg at teste på", () => {
    expect(ALLE.length).toBeGreaterThan(20);
  });

  /**
   * Plausible målte 84-85 % bounce på de største artikler mod 2-7 % på
   * beregnerne. Artiklen linkede til sit værktøj i løbende tekst, men sidens
   * *sidste* klik var "Relaterede artikler" — altså endnu en artikel. Uden en
   * næste handling læseren kan trykke på kommer bloggen ingen vegne.
   */
  test("hvert indlæg har en næste handling", () => {
    for (const a of ALLE) {
      expect(a.cta, `/blog/${a.slug} mangler <NaesteSkridt>`).not.toBe("");
    }
  });

  test("næste handlingen ligger før de relaterede artikler", () => {
    for (const a of ALLE) {
      const relaterede = a.kilde.indexOf("Relaterede artikler");
      if (relaterede === -1) continue;
      expect(
        a.kilde.indexOf("<NaesteSkridt") < relaterede,
        `/blog/${a.slug} har "Relaterede artikler" som sidste klik`,
      ).toBe(true);
    }
  });

  /**
   * Hvor koblingen findes, er den canoniske — `blog-kobling.ts` er den
   * eneste kilde, og den læses både af `RelateredeArtikler` på beregnerens
   * side og af `blog-kobling.test.ts`. En næste handling der peger et andet
   * sted end beregnerens egen "Guides om emnet"-blok gør koblingen halv sand.
   */
  test("næste handlingen peger på den koblede beregner", () => {
    for (const a of ALLE) {
      const koblet = beregnerForArtikler(a.slug);
      if (!koblet) continue;
      expect(
        a.cta,
        `/blog/${a.slug} er koblet til ${koblet}, men næste handling peger et andet sted`,
      ).toContain(`href="${koblet}"`);
    }
  });

  /**
   * Næste handlingen må ikke opfinde et værktøj, artiklen aldrig nævner.
   * Tjekken læser kun det, der står *før* CTA'en, så den kan ikke holde sig
   * selv oprejsende.
   */
  test("næste handlingen peger på en beregner, artiklen allerede nævner", () => {
    for (const a of ALLE) {
      const href = a.cta.match(/href="(\/[^"]*)"/);
      expect(href, `/blog/${a.slug} har ingen href i næste handlingen`).not.toBeNull();
      expect(
        a.foer,
        `/blog/${a.slug} sender til ${href![1]} uden at nævne det i teksten`,
      ).toContain(`href="${href![1]}"`);
    }
  });

  test("næste handlingen peger på en side, der findes", () => {
    for (const a of ALLE) {
      const href = a.cta.match(/href="(\/[^"]*)"/)![1];
      expect(existsSync(join(appDir, href, "page.tsx")), `${href} fra /blog/${a.slug}`).toBe(
        true,
      );
    }
  });
});
