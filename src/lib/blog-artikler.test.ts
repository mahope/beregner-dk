import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  BLOG_ARTIKLER,
  blogArtikel,
  blogArtikler,
  blogSynligDato,
  formatBlogDato,
} from "@/lib/blog-artikler";

const BLOG_DIR = path.join(process.cwd(), "src/app/blog");
const ARTIKLER = readdirSync(BLOG_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory() && existsSync(path.join(BLOG_DIR, e.name, "page.tsx")))
  .map((e) => e.name)
  .sort();

const INDEX = readFileSync(path.join(BLOG_DIR, "page.tsx"), "utf8");

/**
 * Bloggen sendte `og:type: "article"` på alle 27 indlæg uden at ét af dem
 * sendte en `Article`/`BlogPosting`: ingen `datePublished`, ingen
 * `dateModified`, ingen `headline`, ingen forfatter. Målt på alle 27 URL'er i
 * sitemap'en 2026-09-29 — 0 af 27 havde et `@type` der hed Article,
 * BlogPosting eller NewsArticle.
 *
 * Og datoen lå to steder: i `/blog`'s egen `blogPosts` (ISO) og i hvert
 * indlægs byline. De var allerede glide fra hinanden: `maanedsbudget` stod
 * som 24. august på indekset og 23. august på indlægget, og `su` stod som
 * 24. september på indekset mens indlægget viste "Opdateret 26. september".
 *
 * Disse tests er en *klasse*-lås, ikke 27 enkeltlåse: de læser alle 27
 * `page.tsx` fra disk, så en ny artikel der glemmer skemaet eller datoen
 * fejler, selv om ingen har skrevet en test til den.
 */
describe("bloggens artikelschema og datoer", () => {
  it("låser sit eget omfang: 27 artikler, en i hvert directory", () => {
    // Uden dette ville 0 fund også være det resultat en måler der ikke læser
    // noget ville give (målefejl 33).
    expect(ARTIKLER.length).toBeGreaterThanOrEqual(27);
    expect(BLOG_ARTIKLER.length).toBe(ARTIKLER.length);
  });

  it("hvert blogdirectory har præcis én post i registret", () => {
    const iRegistret = new Set(BLOG_ARTIKLER.map((a) => a.slug));
    for (const dir of ARTIKLER) {
      expect(iRegistret.has(dir), `${dir} mangler i BLOG_ARTIKLER`).toBe(true);
    }
    for (const artikel of BLOG_ARTIKLER) {
      expect(ARTIKLER, `${artikel.slug} har ikke en page.tsx`).toContain(artikel.slug);
    }
  });

  it("alle 27 indlæg renderer BlogArticleSchema", () => {
    for (const dir of ARTIKLER) {
      const src = readFileSync(path.join(BLOG_DIR, dir, "page.tsx"), "utf8");
      expect(src, `${dir} sender ingen BlogArticleSchema`).toContain("<BlogArticleSchema");
      expect(src, `${dir} importerer ikke BlogArticleSchema`).toContain(
        'from "@/components/BlogArticleSchema"',
      );
    }
  });

  it("skemaet får præcis den slug sit eget directory hedder", () => {
    for (const dir of ARTIKLER) {
      const src = readFileSync(path.join(BLOG_DIR, dir, "page.tsx"), "utf8");
      const slug = src.match(/<BlogArticleSchema[\s\S]*?slug="([^"]+)"/)?.[1];
      expect(slug, `${dir} giver ikke sin slug til skemaet`).toBe(dir);
    }
  });

  it("/blog læser datoen i registret og ikke i sin egen liste", () => {
    // De 27 håndskrevne `date:` og `readTime:` var afsnittenes egen sandhed.
    expect(INDEX).not.toMatch(/^\s*date: "/m);
    expect(INDEX).not.toMatch(/readTime:/);
    expect(INDEX).toContain("formatBlogDato(blogSynligDato(artikel))");
  });

  it("alle 27 kort på /blog har en synlig dansk dato, aldrig en ISO-streng", () => {
    // ISO-datoen var det, læseren så: "2026-09-24" stod 54 gange i HTML'en.
    const iso = INDEX.match(/<time dateTime=\{artikel\.publiceret\}>/g) ?? [];
    expect(iso.length).toBe(1);
    for (const dir of ARTIKLER) {
      const slug = INDEX.match(new RegExp(`slug: "${dir}"`)) ? dir : null;
      expect(slug, `${dir} mangler på /blog's liste`).not.toBeNull();
    }
  });

  it("datoerne er gyldige ISO-dage, og opdateringen er aldrig før publiceringen", () => {
    for (const artikel of BLOG_ARTIKLER) {
      expect(artikel.publiceret, artikel.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const d = new Date(`${artikel.publiceret}T00:00:00Z`);
      expect(Number.isNaN(d.getTime()), artikel.slug).toBe(false);
      if (artikel.opdateret) {
        expect(artikel.opdateret, artikel.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(
          new Date(`${artikel.opdateret}T00:00:00Z`).getTime(),
          `${artikel.slug} er opdateret før den blev publiceret`,
        ).toBeGreaterThanOrEqual(d.getTime());
      }
    }
  });

  it("kun de fire indlæg med en 'Opdateret'-byline har en opdateringsdato", () => {
    // `dateModified` må ikke løbe hvert år automatisk: et indlæg uden
    // opdaterings-byline skal ikke sende en.
    const med = BLOG_ARTIKLER.filter((a) => a.opdateret).map((a) => a.slug).sort();
    expect(med).toEqual([
      "boligstoette-2026-nye-regler",
      "privatoekonomi-for-unge",
      "skat-2026-alt-du-skal-vide",
      "su-2026-satser-og-regler",
    ]);
    for (const dir of ARTIKLER) {
      const src = readFileSync(path.join(BLOG_DIR, dir, "page.tsx"), "utf8");
      const viserOpdateret = src.includes("Opdateret ");
      expect(viserOpdateret, `${dir} — byline og registrering skal være enige`).toBe(
        Boolean(blogArtikel(dir).opdateret),
      );
    }
  });

  it("formatBlogDato formaterer i UTC, så dansk tid ikke flytter dagen", () => {
    // `new Date("2026-09-24")` er kl. 00.00 lokalt = 23. september kl. 23.00
    // UTC i Danmark. Det var præcis den forskydning, der gjorde
    // `maanedsbudget` og `su` uforståelige.
    expect(formatBlogDato("2026-09-24")).toBe("24. september 2026");
    expect(formatBlogDato("2026-01-01")).toBe("1. januar 2026");
    expect(formatBlogDato("2026-12-31")).toBe("31. december 2026");
    expect(formatBlogDato("2026-02-07")).toBe("7. februar 2026");
    for (const artikel of BLOG_ARTIKLER) {
      expect(formatBlogDato(artikel.publiceret), artikel.slug).toMatch(/^\d{1,2}\. [a-zæøå]+ \d{4}$/);
    }
  });

  it("formatBlogDato kaster på en ugyldig dato i stedet for at vise 'Invalid Date'", () => {
    expect(() => formatBlogDato("2026-13-45")).toThrow();
    expect(() => formatBlogDato("ikke en dato")).toThrow();
  });

  it("blogSynligDato viser opdateringen når den findes, ellers publiceringen", () => {
    expect(blogSynligDato(blogArtikel("su-2026-satser-og-regler"))).toBe("2026-09-26");
    expect(blogSynligDato(blogArtikel("hvordan-beregner-man-moms"))).toBe("2026-02-07");
  });

  it("blogArtikel kaster på en ukendt slug, så der ikke kommer en tom dato ud", () => {
    expect(() => blogArtikel("findes-ikke")).toThrow(/findes-ikke/);
  });

  it("læsetiden er et heltal, og den er den samme i registret som på /blog før", () => {
    // De 27 `readTime: "N min"` blev fjernet af patchen; målingen før den
    // viste 0 afvigelser, så registret overtog 27 korrekte værdier.
    for (const artikel of blogArtikler()) {
      expect(Number.isInteger(artikel.laesetidMinutter), artikel.slug).toBe(true);
      expect(artikel.laesetidMinutter, artikel.slug).toBeGreaterThan(0);
      expect(artikel.laesetidMinutter, artikel.slug).toBeLessThanOrEqual(30);
    }
  });
});
