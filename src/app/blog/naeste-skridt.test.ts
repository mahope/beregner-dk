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
 *
 * De to linjer fra 1/10 er samme fejlklasse fundet ved at måle alle 29
 * indlægs næste handling mod det emne hvert indlæg selv lover. Begge artikler
 * linker værktøjet i brødteksten og har en tabel med et konkret tal om det,
 * men deres *sidste* klik var et andet værktøj — så den læser, der spørger
 * "hvor meget", bliver sendt et sted hen, der ikke regner beløb ud.
 */
const SKAL_NAAE: { slug: string; hrefs: string[]; foerste?: string; hvorfor: string }[] = [
  {
    slug: "barsel-2026-regler-og-satser",
    hrefs: ["/barselsdagpenge", "/barselsplanlaegger"],
    hvorfor: "185 besøgende/28d og 84 % bounce",
  },
  {
    slug: "guide-feriepenge-hvornaar-og-hvor-meget",
    hrefs: ["/dato", "/feriepenge"],
    hvorfor: "indlægget svarer på \"hvor meget feriepenge\" med en tabel, men sendte læseren til en datoberegner",
  },
  {
    slug: "boliglaan-2026-renter-og-afdrag",
    hrefs: ["/rentefradrag", "/boliglaan"],
    hvorfor: "indlægget handler om renter og afdrag, men sendte læseren til fradraget og ikke til ydelsen",
  },
  {
    slug: "koeb-af-bolig-2026-omkostninger",
    hrefs: ["/boliglaan", "/rentefradrag"],
    // Her stod `/rentefradrag` som eneste knap, selv om artiklen selv to gange
    // i brødteksten siger at boliglånsberegneren er værktøjet: i
    // tjeklisten ("Beregn din ydelse: brug boliglånsberegneren") og i den
    // blå boks ("Brug vores boliglånsberegner til din ydelse"). Siden er
    // "Køb af bolig 2026: Alle omkostninger du skal kende", og
    // boliglånsberegneren lægger ydelsen sammen med ejendomsskat, forsikring
    // og ejerforening — altså præcis "ydelse + alle faste udgifter", som
    // tjeklistens næste linje beder læseren selv lægge sammen. Det var en
    // selvm modsigelse på én side: artiklen pegede to gange på
    // boliglånsberegneren og sluttede på en anden beregner. Derfor kræver
    // linjen her `foerste` — tilstedeværelse alene lader rækkefølgen glide.
    foerste: "/boliglaan",
    hvorfor: "artiklen sender læseren videre til rentefradraget, selv om den selv navngiver boliglånsberegneren to gange",
  },
  {
    slug: "fradrag-2026-komplet-guide",
    hrefs: ["/rentefradrag", "/befordringsfradrag"],
    hvorfor: "en komplet guide til fradrag, der kun tilbød ét af de to fradrag artiklen selv regner en sats for",
  },
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

  test("indlæg der svarer på \"hvor meget\" tilbyder også det værktøj, der regner det ud", () => {
    for (const krav of SKAL_NAAE) {
      const a = ALLE.find((x) => x.slug === krav.slug);
      expect(a, `/blog/${krav.slug} findes ikke blandt indlæggene`).toBeDefined();
      for (const href of krav.hrefs) {
        expect(
          hrefs(a!.cta),
          `/blog/${krav.slug} (${krav.hvorfor}), men ${href} står ikke i næste handlingen`,
        ).toContain(href);
      }
    }
  });

  /**
   * Hvilket værktøj der *er* knappen, ikke bare hvilke der står i blokken.
   *
   * `NaesteSkridt` har én knap og ét stille link, fordi to knapper af samme
   * vægt er måden en læser ender med at vælge ingen af dem. Det gør rækkefølgen
   * til en påstand i stedet for en detalje: `/rentefradrag` som eneste knap på
   * et indlæg om boligomkostninger er ikke en mindre mellemting — det er en
   * anden handling, end den artiklen har lovet hele vejen.
   *
   * Testen læser kun `href`-attributten på `<NaesteSkridt>`, altså den
   * primære knap; `sekundaer` ligger i et andet objekt og kan ikke træffe
   * ved en fejltagelse.
   */
  test("næste handlingens knap er den beregner, artiklen handler om", () => {
    for (const krav of SKAL_NAAE) {
      if (!krav.foerste) continue;
      const a = ALLE.find((x) => x.slug === krav.slug);
      expect(a, `/blog/${krav.slug} findes ikke blandt indlæggene`).toBeDefined();
      const knap = a!.cta.match(/<NaesteSkridt\s+href="(\/[^"]*)"/);
      expect(knap, `/blog/${krav.slug}: næste handlingen har ingen primær href`).not.toBeNull();
      expect(
        knap![1],
        `/blog/${krav.slug} (${krav.hvorfor}), så knap ${knap![1]} i stedet for ${krav.foerste}`,
      ).toBe(krav.foerste);
    }
  });
});
