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
      // Kun selve JSX-elementet, ikke hele filen under det — ellers ville
      // "Relaterede artikler" tælle som en del af næste handlingen.
      const ctaSlut = ctaIdx === -1 ? -1 : kilde.indexOf("/>", ctaIdx);
      return {
        slug,
        kilde,
        cta: ctaIdx === -1 ? "" : kilde.slice(ctaIdx, ctaSlut + 2),
        foer: ctaIdx === -1 ? kilde : kilde.slice(0, ctaIdx),
      };
    });
}

/** Alle hrefs i næste handlingen — der kan være flere. */
function hrefs(cta: string): string[] {
  return [...cta.matchAll(/href[:=]\s*"(\/[^"]*)"/g)].map((m) => m[1]);
}

/**
 * Artikler hvis næste handling skal nå begge værktøjer.
 *
 * Plausible 2026-09-30: `/blog/barsel-2026-regler-og-satser` havde 185
 * besøgende/28d og 84 % bounce, mens `/barselsdagpenge` havde 1 % bounce.
 * Indlægget nævner planlæggeren i brødteksten, men kun dagpengeberegneren
 * stod som næste handling — så den læser, der gerne ville *planlægge* orlov,
 * skulle finde linket selv. Hver linje er derfor et krav på markupken, ikke
 * en præference: værktøjerne er bygget og verificeret, de mangler kun at
 * blive tilbudt.
 */
const SKAL_NAAE: { slug: string; hrefs: string[] }[] = [
  { slug: "barsel-2026-regler-og-satser", hrefs: ["/barselsdagpenge", "/barselsplanlaegger"] },
];

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
   * side og af `blog-kobling.test.ts`. En beregner der peger på et indlæg, som
   * ingen veje fører videre tilbage, gør koblingen halv sand.
   *
   * Kravet er derfor, at læseren *kan* nå den koblede beregner — ikke at den
   * nødvendigvis er næste handling. `/blog/bmi-for-boern-saadan-tjekker-du` er
   * koblet til `/alder` (der er, hvor forældre slår et barns alder op) men
   * handler om BMI, så næste handling er `/bmi`; `/alder` står i brødteksten.
   * At kræve næste handling = kobling ville tvinge en dårligere værktøjsrækkefølge.
   * Før 30/9 læste denne test hele filens hale og fandt `/alder` i
   * "Relaterede beregnere" *under* næste handlingen, så den passede ved et
   * tilfælde. Den læser nu næste handlingen og hele artiklen som to ting.
   */
  test("den koblede beregner kan nås fra indlægget", () => {
    for (const a of ALLE) {
      const koblet = beregnerForArtikler(a.slug);
      if (!koblet) continue;
      expect(
        a.kilde.includes(`href="${koblet}"`),
        `/blog/${a.slug} er koblet til ${koblet}, men artiklen linker aldrig til den`,
      ).toBe(true);
    }
  });

  /**
   * Næste handlingen må ikke opfinde et værktøj, artiklen aldrig nævner.
   * Tjekken læser kun det, der står *før* CTA'en, så den kan ikke holde sig
   * selv oprejsende.
   */
  test("næste handlingen peger på en beregner, artiklen allerede nævner", () => {
    for (const a of ALLE) {
      for (const href of hrefs(a.cta)) {
        expect(
          a.foer,
          `/blog/${a.slug} sender til ${href} uden at nævne det i teksten`,
        ).toContain(`href="${href}"`);
      }
      expect(hrefs(a.cta).length, `/blog/${a.slug} har ingen href i næste handlingen`).toBeGreaterThan(0);
    }
  });

  test("næste handlingen peger på en side, der findes", () => {
    for (const a of ALLE) {
      for (const href of hrefs(a.cta)) {
        expect(
          existsSync(join(appDir, href, "page.tsx")),
          `${href} fra /blog/${a.slug}`,
        ).toBe(true);
      }
    }
  });

  test("højt bounce-indlæg tilbyder begge sine værktøjer som næste handling", () => {
    for (const krav of SKAL_NAAE) {
      const a = ALLE.find((x) => x.slug === krav.slug);
      expect(a, `/blog/${krav.slug} findes ikke blandt indlæggene`).toBeDefined();
      for (const href of krav.hrefs) {
        expect(
          hrefs(a!.cta),
          `/blog/${krav.slug} har 84 % bounce, men ${href} står ikke i næste handlingen`,
        ).toContain(href);
      }
    }
  });
});
