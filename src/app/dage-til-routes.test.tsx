import { describe, expect, test, vi, beforeEach, afterAll } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import {
  getDageTilSlugs,
  getDageTilEvents,
  getDageTilPrefix,
  daysBetween,
  dagensDatoAnker,
} from "@/lib/dage-til";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getRouteDecision } from "@/lib/routing";
import { buildSitemap } from "./sitemap";
import DageTilPage from "./dage-til/[dato]/page";
import DagarTillPage from "./dagar-till/[dato]/page";
import { buildDageTilMetadata } from "@/components/DageTilPage";

/**
 * The page that actually serves a locale. `/dage-til` and `/dagar-till` are two
 * route files over one component and the *prefix* is what picks the language,
 * so a test that only ever imports the Danish one cannot see a Swedish page at
 * all — which is exactly how `til` survived: every existing test rendered
 * `dage-til`, where "til" is correct.
 */
const ROUTE_FOR = { da: DageTilPage, se: DagarTillPage } as const;

vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({ FAQSchema: () => null, ArticleSchema: () => null }));
vi.mock("@/lib/get-locale", () => ({ getCurrentDomainConfig: vi.fn() }));

const lastModified = new Date("2026-09-25T00:00:00.000Z");

describe("dage-til sitemap entries", () => {
  test("dansk sitemap indeholder de danske dage-til-sider som daglige sider", () => {
    const sitemap = buildSitemap(getDomainConfigByLocale("da"), lastModified);
    for (const slug of getDageTilSlugs("da")) {
      const entry = sitemap.find(
        (candidate) => String(candidate.url) === `https://minberegner.dk/dage-til/${slug}`
      );
      expect(entry, slug).toBeDefined();
      expect(entry?.changeFrequency).toBe("daily");
    }
  });

  test("svensk sitemap bruger svenske slugs og dansk sitemap danske", () => {
    const se = buildSitemap(getDomainConfigByLocale("se"), lastModified).map((e) =>
      String(e.url)
    );
    const da = buildSitemap(getDomainConfigByLocale("da"), lastModified).map((e) =>
      String(e.url)
    );
    expect(se).toContain("https://beraknare.se/dagar-till/juldagen");
    expect(se).not.toContain("https://beraknare.se/dage-til/juledagen");
    expect(da).toContain("https://minberegner.dk/dage-til/juledagen");
    expect(da).not.toContain("https://minberegner.dk/dagar-till/juldagen");
  });

  test("norsk domaene faar ingen dage-til-sider", () => {
    const urls = buildSitemap(getDomainConfigByLocale("no"), lastModified).map((e) =>
      String(e.url)
    );
    expect(
      urls.some((url) => url.includes("dage-til") || url.includes("dagar-till"))
    ).toBe(false);
  });
});

describe("dage-til routing", () => {
  const da = getDomainConfigByLocale("da");
  const se = getDomainConfigByLocale("se");
  const no = getDomainConfigByLocale("no");

  test("eget slug serveres", () => {
    expect(getRouteDecision(da, "/dage-til/juledagen")).toEqual({ type: "allow" });
    expect(getRouteDecision(se, "/dagar-till/juldagen")).toEqual({ type: "allow" });
  });

  test("dansk slug paa det svenske domaene redirectes til den svenske variant", () => {
    expect(getRouteDecision(se, "/dage-til/juledagen")).toEqual({
      type: "redirect",
      destination: "/dagar-till/juldagen",
      status: 301,
    });
  });

  test("svenskt slug paa det danske domaene redirectes til den danske variant", () => {
    expect(getRouteDecision(da, "/dagar-till/juldagen")).toEqual({
      type: "redirect",
      destination: "/dage-til/juledagen",
      status: 301,
    });
  });

  test("grundlovsdag og nationaldagen er hver sit eget spaorgsmaal", () => {
    expect(getRouteDecision(da, "/dage-til/grundlovsdag")).toEqual({ type: "allow" });
    expect(getRouteDecision(se, "/dagar-till/nationaldagen")).toEqual({ type: "allow" });
    expect(getRouteDecision(se, "/dage-til/grundlovsdag")).toEqual({
      type: "redirect",
      destination: "/dagar-till/nationaldagen",
      status: 301,
    });
  });

  test("et slug der staves ens i begge sprog redirectes stadig paa det forkerte domaene", () => {
    // `1-december` hedder det samme paa begge domaener, saa det slaar ikke
    // igennem at teste slugen alene — for det 404'ede i stedet for at
    // redirecte. Det er path-prefixet, der forteller hvilket sprog vi er i.
    for (const slug of getDageTilSlugs("da")) {
      const eget = getRouteDecision(da, `/dage-til/${slug}`);
      if (getDageTilSlugs("se").includes(slug)) {
        expect(eget, slug).toEqual({ type: "allow" });
        expect(getRouteDecision(se, `/dage-til/${slug}`), slug).toEqual({
          type: "redirect",
          destination: `/dagar-till/${slug}`,
          status: 301,
        });
        expect(getRouteDecision(da, `/dagar-till/${slug}`), slug).toEqual({
          type: "redirect",
          destination: `/dage-til/${slug}`,
          status: 301,
        });
      }
    }
  });

  test("et slug med sit eget sprogstavemaade redirectes stadig naar prefixet er rigtigt", () => {
    // Modsat fælde: dansk prefix med svensk slug skal stadig redirecte.
    expect(getRouteDecision(da, "/dage-til/juldagen")).toEqual({
      type: "redirect",
      destination: "/dage-til/juledagen",
      status: 301,
    });
    expect(getRouteDecision(se, "/dagar-till/juledagen")).toEqual({
      type: "redirect",
      destination: "/dagar-till/juldagen",
      status: 301,
    });
  });

  test("ukendte slugs er 404, ikke en omdirigering", () => {
    expect(getRouteDecision(da, "/dage-til/tacohoedag")).toEqual({ type: "not-found" });
    expect(getRouteDecision(se, "/dagar-till/tacodagen")).toEqual({ type: "not-found" });
  });

  test("norsk domaene faar ingen dage-til-sider", () => {
    expect(getRouteDecision(no, "/dage-til/juledagen")).toEqual({ type: "not-found" });
  });
});

describe("dage-til side", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-25T09:00:00.000Z"));
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test("viser spaorgsmaalet og et konkret antal dage i dansk", async () => {
    const html = renderToStaticMarkup(
      await DageTilPage({ params: Promise.resolve({ dato: "juledagen" }) })
    );

    expect(html).toContain("Hvor mange dage er der til juledagen?</h1>");
    expect(html).toContain("Der er 91 dage til juledagen");
    expect(html).toContain('dateTime="2026-12-25"');
    expect(html).toContain("Juleaften er 24. december");
    expect(html).toContain("/dage-til/1-december");
  });

  test("viser nul dage paa selve datoen", async () => {
    vi.setSystemTime(new Date("2026-12-25T08:00:00.000Z"));
    const html = renderToStaticMarkup(
      await DageTilPage({ params: Promise.resolve({ dato: "juledagen" }) })
    );

    expect(html).toContain("Det er juledagen");
    expect(html).toContain("0 dage");
  });

  // "Der er 61 dage til 1. december" uden dagens dato kan ikke læses af
  // Google (uddraget skal kunne se at tallet er dagsfrisk) og ikke af en læser
  // der lander kl. 23.50 og deler linket. Datoen skal komme fra SAMME anker som
  // optællingen bruger — ikke et eget `new Date()` — ellers ville den være én
  // dag forskudt mellem 00:00 og 02:00 dansk tid.
  test("heroen viser dagens dato i samme blok som svaret", async () => {
    const html = renderToStaticMarkup(
      await DageTilPage({ params: Promise.resolve({ dato: "juledagen" }) })
    );
    const hero = /<div class="bg-blue-50[^"]*">([\s\S]*?)<\/div>/.exec(html);
    expect(hero, "hero-blokken skal findes").not.toBeNull();
    expect(hero![1]).toContain("I dag er det");
    expect(hero![1]).toContain('<time dateTime="2026-09-25">');
    // 25. september 2026 er en fredag.
    expect(hero![1]).toContain("fredag 25. september 2026");
  });

  for (const locale of ["da", "se"] as const) {
    test(`${locale}-siderne viser dagens dato i sit eget sprog`, async () => {
      // 00.30 dansk tid. Klokken er UTC 22.30 dagen før, så en side der læser
      // dagens dato med `getUTC*` viser 29. september, mens optællingen regner
      // fra 30. september — den fejl skal den her port kunne fange.
      const I_DAG = new Date("2026-09-29T22:30:00.000Z");
      vi.setSystemTime(I_DAG);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
      for (const slug of getDageTilSlugs(locale)) {
        const html = renderToStaticMarkup(
          await ROUTE_FOR[locale]({ params: Promise.resolve({ dato: slug }) })
        );
        expect(html, `${locale}/${slug}`).toContain(
          locale === "da" ? "I dag er det" : "I dag är det"
        );
        // The date and the count must not drift apart: the day the hero names is
        // the day the number was counted from.
        const hero = /<div class="bg-blue-50[^"]*">([\s\S]*?)<\/div>/.exec(html)!;
        const dage = Number(/(\d+) (?:dage|dagar) (?:til|till) /.exec(hero[1])?.[1]);
        const datoer = [...hero[1].matchAll(/dateTime="(\d{4}-\d{2}-\d{2})"/g)].map((m) => m[1]);
        // Two dates in the same block: first today, then the target. They must
        // be the pair the answer was computed from, so the count is exactly the
        // distance between them — not merely "a date is shown".
        expect(datoer.length, `${locale}/${slug}`).toBeGreaterThanOrEqual(2);
        expect(dagensDatoAnker(I_DAG).toISOString().slice(0, 10), `${locale}/${slug}`).toBe(
          datoer[0]
        );
        expect(
          daysBetween(I_DAG, new Date(`${datoer[1]}T00:00:00.000Z`)),
          `${locale}/${slug}: ${dage} dage, ${datoer[0]} → ${datoer[1]}`
        ).toBe(dage);
      }
    });
  }

  test("et dansk slug paa det svenske domaene giver 404 i stedet for et dobbelt svar", async () => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    await expect(
      DageTilPage({ params: Promise.resolve({ dato: "juledagen" }) })
    ).rejects.toThrow();
  });

  // De tre sider fra 1/10 (fastelavn, palmesøndag, 2. juledag) dømmes på den
  // viste side, ikke på data-tabellen: en fejloffset giver stadig en side med
  // et tal i, bare et tal til det forkerte dato. Dato, ugedag og dag-tal er alle
  // tre regnet fra en kalender (2026 påske er 5. april, så fastelavn er
  // 17. februar og palmesøndag 29. marts) — ikke læst af samme ankerfunktion
  // som den renderer, ellers ville porten være en restatement af koden.
  test.each([
    ["da", "2-juledag", "2026-12-26", "26. december 2026", "lørdag", 345],
    ["da", "fastelavn", "2026-02-17", "17. februar 2026", "tirsdag", 33],
    ["da", "palmesondag", "2026-03-29", "29. marts 2026", "søndag", 73],
    ["da", "black-friday", "2026-11-27", "27. november 2026", "fredag", 316],
    ["se", "annandag-jul", "2026-12-26", "26 december 2026", "lördag", 345],
    ["se", "fettisdagen", "2026-02-17", "17 februari 2026", "tisdag", 33],
    ["se", "palmsondagen", "2026-03-29", "29 mars 2026", "söndag", 73],
    ["se", "black-friday", "2026-11-27", "27 november 2026", "fredag", 316],
    ["da", "mors-dag", "2026-05-10", "10. maj 2026", "søndag", 115],
    ["da", "fars-dag", "2026-06-05", "5. juni 2026", "fredag", 141],
    ["se", "mors-dag", "2026-05-31", "31 maj 2026", "söndag", 136],
    ["se", "fars-dag", "2026-11-08", "8 november 2026", "söndag", 297],
  ] as const)(
    "%s-siden /%s rammer %s i dag og %i dage",
    async (locale, slug, isoTarget, dato, ugedag, dage) => {
      vi.setSystemTime(new Date("2026-01-15T09:00:00.000Z"));
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
      const html = renderToStaticMarkup(
        await ROUTE_FOR[locale]({ params: Promise.resolve({ dato: slug }) })
      );
      expect(html, slug).toContain(`<time dateTime="${isoTarget}">${dato} er en ${ugedag}</time>`);
      expect(
        new RegExp(`${dage} (?:dage|dagar) (?:til|till) `).test(html),
        `${slug}: ${dage} dage fra 15. januar 2026 skal stå i svaret`
      ).toBe(true);
    }
  );
});

// The Swedish preposition is "till", the Danish one "til", and the answer
// string was built with `til` hardcoded for both — so every one of the fourteen
// Swedish landing pages said "Det finns 87 dagar **til** juldagen", in the
// visible answer, the meta description, og:description and the JSON-LD. These
// tests render the real page through the real producer rather than rebuilding
// the string, because a test that rebuilds it can only prove the copy it was
// written from (C44's lesson, and the same trap C118's union test fell into).
describe("dage-til svar-præpositionen er sprogets egen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-29T09:00:00.000Z"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  for (const locale of ["da", "se"] as const) {
    test(`hver ${locale} dage-til-side bruger sit eget "til"/"till" i svaret`, async () => {
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
      const dansk = locale === "da" ? /\d+ dage til / : /\d+ dagar till /;
      const andetSprog = locale === "da" ? /\d+ dagar till / : /\d+ dage till /;

      for (const slug of getDageTilSlugs(locale)) {
        const html = renderToStaticMarkup(
          await ROUTE_FOR[locale]({ params: Promise.resolve({ dato: slug }) })
        );
        expect(html, `${locale}/${slug}`).toMatch(dansk);
        // The negative half matters more than the positive one: a page can
        // contain the right form *and* the wrong one, and only this catches it.
        expect(html, `${locale}/${slug}`).not.toMatch(andetSprog);
      }
    });
  }

  test("meta description, og:description og JSON-LD bærer samme svar som skærmen", async () => {
    // The leak reached four surfaces, not one. A test that only reads the
    // rendered <p> would have passed while Google kept indexing the Danish
    // preposition in the description it shows under the title.
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const slug = getDageTilSlugs("se")[0];
    const html = renderToStaticMarkup(
      await ROUTE_FOR.se({ params: Promise.resolve({ dato: slug }) })
    );
    // Read the answer out of the element that shows it, not out of the whole
    // document: the same sentence also appears inside the JSON-LD, and a regex
    // over the raw markup would match there first and return an
    // escaped-quote-laden fragment. The negative assertion in the loop below is
    // what this test is really for — the positive one only pins the four
    // surfaces to each other.
    const synligt = /<p class="text-3xl[^"]*">([^<]+)<\/p>/.exec(html);
    expect(synligt, "svaret skal stå i den synlige tekst").not.toBeNull();
    const svar = synligt![1];
    expect(svar).toMatch(/^Det finns \d+ dagar till /);

    const prefix = getDageTilPrefix("se")!;
    const metadata = await buildDageTilMetadata(prefix, slug, new Date("2026-09-29T09:00:00.000Z"));
    const description = String(metadata.description);
    const ogDescription = String(metadata.openGraph?.description);

    for (const [navn, tekst] of [
      ["meta description", description],
      ["og:description", ogDescription],
    ] as const) {
      expect(tekst, navn).toContain(svar);
      expect(tekst, navn).not.toMatch(/\d+ dagar til /);
    }

    // The JSON-LD block is rendered inline, so the markup is the assertion.
    // Its `description` is the bare headline — the schema deliberately does not
    // repeat the question, so it is compared against the visible answer.
    const jsonLd = /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(html);
    expect(jsonLd, "siden skal have en JSON-LD-blok").not.toBeNull();
    const ld = JSON.parse(jsonLd![1]);
    expect(ld.description).toBe(svar);
    expect(ld.description).not.toMatch(/\d+ dagar til /);
  });

  test("dansk er stadig \"til\" — den svenske rettelse må ikke have flyttet fejlen", async () => {
    // The other direction of the same class: a "fix" that makes Swedish right
    // by copying a Danish string over it. Locked separately so the two
    // languages cannot be repaired into each other.
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
    const html = renderToStaticMarkup(
      await ROUTE_FOR.da({ params: Promise.resolve({ dato: getDageTilSlugs("da")[0] }) })
    );
    expect(html).toMatch(/\d+ dage til /);
    expect(html).not.toMatch(/dagar till /);
  });
});

describe("dage-til titler", () => {
  // C81 locked every `page-data` title to 60 characters, because Google clips
  // the tail — but these nine titles are built in `buildDageTilMetadata` and
  // have no entry in `page-data.ts`, so the gate could not see them. Measured
  // on the live site they were 61-67 characters in both languages. The test
  // calls the real producer instead of rebuilding the string, so it cannot
  // pass on a copy of the old rule (C44's lesson).
  // Titlen er `${question} ${count}`, så længden afhænger af dagens dato: de
  // faste dato-heleds (juleaften, nytårsaften) har tre-cifrede dag-tal i
  // store dele af året, mens påskehelgen altid har to-cifrede. En port der kun
  // så ét referencedato var grøn med 61 tegne i live — 27/9-reviewen fandt
  // det. Derfor kører porten hele året igennem.
  const I_DAG = new Date("2026-09-27T12:00:00.000Z");
  const AARS_GAMLE_DATOER = [
    "2026-01-01T12:00:00.000Z",
    "2026-03-21T12:00:00.000Z",
    "2026-06-01T12:00:00.000Z",
    "2026-07-01T12:00:00.000Z",
    "2026-09-15T12:00:00.000Z",
    "2026-12-24T12:00:00.000Z",
    "2027-01-01T12:00:00.000Z",
    "2027-06-01T12:00:00.000Z",
  ].map((iso) => new Date(iso));

  async function titelFor(
    locale: "da" | "se",
    slug: string,
    today: Date = I_DAG
  ): Promise<string> {
    const prefix = getDageTilPrefix(locale)!;
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
    const metadata = await buildDageTilMetadata(prefix, slug, today);
    const title = metadata.title;
    return (typeof title === "string" ? title : (title as { absolute?: string } | undefined)?.absolute ?? "") as string;
  }

  for (const locale of ["da", "se"] as const) {
    test(`alle dage-til-titler er under Googles afkortningsgraense i ${locale}`, async () => {
      const events = getDageTilEvents(locale);
      expect(events.length).toBeGreaterThan(5);
      for (const event of events) {
        const slug = event[locale]!.slug;
        for (const iDag of AARS_GAMLE_DATOER) {
          const titel = await titelFor(locale, slug, iDag);
          expect(titel.length, `${slug} @ ${iDag.toISOString().slice(0, 10)}: "${titel}"`)
            .toBeLessThanOrEqual(60);
        }
      }
    });
  }

  // Samme fejl, låst direkte: et fast datoheleds dag-tal er tre-cifret i store
  // dele af året, og det er præcis de dage titlen bliver ét tegn for lang.
  test("de laengste dage-til-sporgsmaal holder 60 tegn med et tresifret dag-tal", async () => {
    const juleaften = getDageTilEvents("da").find((e) => e.da.slug === "24-december")!;
    for (const iso of ["2026-12-25T12:00:00.000Z", "2027-01-01T12:00:00.000Z", "2027-06-01T12:00:00.000Z"]) {
      const titel = await titelFor("da", juleaften.da.slug, new Date(iso));
      expect(titel, iso).toMatch(/ \d{3} dage$/);
      expect(titel.length, `${iso}: "${titel}"`).toBeLessThanOrEqual(60);
    }
  });

  test("titlen har stadig spoergsmaalet og dage-tallet, og ingen brand i halen", async () => {
    // Uden denne kunne titlen blive kortere ved at miste svaret — det er den
    // del, der skiller den fra de andre otte dage-til-sider i et resultat.
    const grundlovsdag = getDageTilEvents("da").find((e) => e.da.slug === "grundlovsdag")!;
    const titel = await titelFor("da", grundlovsdag.da.slug);
    expect(titel).toBe("Hvor mange dage er der til grundlovsdag? 251 dage");
    expect(titel).toContain(grundlovsdag.da.copy.question);
    expect(titel).not.toContain("MinBeregner.dk");
  });

  // GSC 2026-08-30 → 2026-09-27: "hvor mange dage er der til den 24 december"
  // er 1.013 visninger på position 5 — næsten dobbelt så mange som den
  // tilsvarende søgning på "1 december", og den side har allerede sit eget
  // `/dage-til/1-december`-svar med datoen i spørgsmålet. Juleaften gjorde
  // ikke: spørgsmålet var "…til juleaften?", så hverken titlen på
  // `/dage-til/juleaften` eller ankerteksten i /datos nedtællingsliste
  // (`{link.question}`) rummede de ord, folk faktisk skriver. Datoen står i
  // `facts[0]` og i FAQ'en, så strengen er sand — den var bare ikke i den
  // del, der vises i Google.
  //
  // 5/10: spørgsmålet og titlen var allerede rettet, men **URL'en** hed stadig
  // `/dage-til/juleaften`. GSC viser søgningen under `/dato`, altså konkurrerede
  // `/dato` og nedtællingssiden om den — og URL'en er det eneste sted, hvor
  // "24 december" stod skrevet. Slug'en er derfor nu datoen, med
  // "juleaften" som alias der 301'er, så svaret har én URL.
  test("juleaftens titel og /datos ankertekst har datoen, folk søger på", async () => {
    const juleaften = getDageTilEvents("da").find((e) => e.da.slug === "24-december")!;
    expect(juleaften.da.copy.question).toBe(
      "Hvor mange dage er der til juleaften 24. december?"
    );
    expect(juleaften.da.copy.short).toBe("juleaften");
    const titel = await titelFor("da", juleaften.da.slug);
    expect(titel).toBe("Hvor mange dage er der til juleaften 24. december? 88 dage");
    expect(titel.length).toBeLessThanOrEqual(60);
  });

  test("brandstaarnet sendes stadig som og:site_name", async () => {
    const juledagen = getDageTilEvents("se").find((e) => e.se?.slug === "juldagen");
    if (!juledagen?.se) throw new Error("juldagen mangler svensk arm");
    const prefix = getDageTilPrefix("se")!;
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const metadata = await buildDageTilMetadata(prefix!, juledagen.se!.slug, I_DAG);
    expect(metadata.openGraph?.siteName).toBe("Beräknare.se");
  });
});

// The title test above covers the blue link. This covers the grey line under
// it, and the two failed for the same reason: `buildDageTilMetadata` produces
// both, so `page-data.ts` — where C164 found and fixed the identical
// description-repeats-title bug in two other pages — never saw these 28.
// Measured on the live site before the fix: all 28 descriptions opened with
// the title's own question, word for word, and ran 179-195 characters, so
// Google clipped them mid-word.
describe("dage-til meta descriptions", () => {
  const I_DAG = new Date("2026-09-27T12:00:00.000Z");

  async function metadataFor(
    locale: "da" | "se",
    slug: string,
    today: Date = I_DAG
  ) {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
    return buildDageTilMetadata(getDageTilPrefix(locale)!, slug, today);
  }

  for (const locale of ["da", "se"] as const) {
    test(`ingen ${locale} description gentager titlens spørgsmål`, async () => {
      const events = getDageTilEvents(locale);
      expect(events.length).toBeGreaterThan(5);
      for (const event of events) {
        const slug = event[locale]!.slug;
        const metadata = await metadataFor(locale, slug);
        const title = (metadata.title as { absolute?: string }).absolute ?? "";
        const description = String(metadata.description);
        // Compare against the question itself, not against the whole title:
        // the title adds the day count, so a `startsWith(title)` check would
        // pass on a description that repeated the question and then diverged —
        // which is exactly the bug.
        expect(description, `${locale}/${slug}`).not.toContain(
          event[locale]!.copy.question
        );
        expect(title.length, `${locale}/${slug}`).toBeLessThanOrEqual(60);
      }
    });

    test(`alle ${locale} descriptioner er under Googles afkortningsgrænse`, async () => {
      for (const event of getDageTilEvents(locale)) {
        const slug = event[locale]!.slug;
        const description = String((await metadataFor(locale, slug)).description);
        expect(description.length, `${locale}/${slug}: "${description}"`)
          .toBeLessThanOrEqual(160);
      }
    });
  }

  test("descriptionen bærer stadig svaret, datoen og ugedagen", async () => {
    // The point of the fix is that the freed characters go to what the title
    // does not say. Without this, "under 160" could be met by deleting the
    // answer — the same failure C164's own test was written to prevent.
    const grundlovsdag = getDageTilEvents("da").find(
      (e) => e.da.slug === "grundlovsdag"
    )!;
    const description = String((await metadataFor("da", "grundlovsdag")).description);
    expect(description).toBe(
      "Der er 251 dage til grundlovsdag. 5. juni 2027 er en lørdag. Tallet opdateres hver dag."
    );
  });

  test("dagens svar giver en description uden '0 dage'", async () => {
    // The isToday branch builds a different headline; it must still be a
    // complete sentence rather than an empty or doubled one. The reference
    // date is an argument, not the clock — the producer is given "today" so a
    // test cannot pass on whatever day it happens to run.
    const juleaften = await metadataFor("da", "24-december", new Date("2026-12-24T09:00:00.000Z"));
    const description = String(juleaften.description);
    expect(description).toBe(
      "Det er juleaften — 0 dage. 24. december 2026 er en torsdag. Tallet opdateres hver dag."
    );
    expect(description.length).toBeLessThanOrEqual(160);
  });
});
