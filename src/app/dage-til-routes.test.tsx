import { describe, expect, test, vi, beforeEach, afterAll } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getDageTilSlugs, getDageTilEvents, getDageTilPrefix } from "@/lib/dage-til";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getRouteDecision } from "@/lib/routing";
import { buildSitemap } from "./sitemap";
import DageTilPage from "./dage-til/[dato]/page";
import { buildDageTilMetadata } from "@/components/DageTilPage";

vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({ FAQSchema: () => null }));
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

  test("et dansk slug paa det svenske domaene giver 404 i stedet for et dobbelt svar", async () => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    await expect(
      DageTilPage({ params: Promise.resolve({ dato: "juledagen" }) })
    ).rejects.toThrow();
  });
});

describe("dage-til titler", () => {
  // C81 locked every `page-data` title to 60 characters, because Google clips
  // the tail — but these nine titles are built in `buildDageTilMetadata` and
  // have no entry in `page-data.ts`, so the gate could not see them. Measured
  // on the live site they were 61-67 characters in both languages. The test
  // calls the real producer instead of rebuilding the string, so it cannot
  // pass on a copy of the old rule (C44's lesson).
  const I_DAG = new Date("2026-09-27T12:00:00.000Z");

  async function titelFor(
    locale: "da" | "se",
    slug: string
  ): Promise<string> {
    const prefix = getDageTilPrefix(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
    const metadata = await buildDageTilMetadata(prefix, slug, I_DAG);
    const title = metadata.title;
    return (typeof title === "string" ? title : (title?.absolute ?? "")) as string;
  }

  for (const locale of ["da", "se"] as const) {
    test(`alle dage-til-titler er under Googles afkortningsgraense i ${locale}`, async () => {
      const events = getDageTilEvents(locale);
      expect(events.length).toBeGreaterThan(5);
      for (const event of events) {
        const slug = event[locale].slug;
        const titel = await titelFor(locale, slug);
        expect(titel.length, `${slug}: "${titel}"`).toBeLessThanOrEqual(60);
      }
    });
  }

  test("titlen har stadig spoergsmaalet og dage-tallet, og ingen brand i halen", async () => {
    // Uden denne kunne titlen blive kortere ved at miste svaret — det er den
    // del, der skiller den fra de andre otte dage-til-sider i et resultat.
    const grundlovsdag = getDageTilEvents("da").find((e) => e.da.slug === "grundlovsdag")!;
    const titel = await titelFor("da", grundlovsdag.da.slug);
    expect(titel).toBe("Hvor mange dage er der til grundlovsdag? 251 dage");
    expect(titel).toContain(grundlovsdag.da.copy.question);
    expect(titel).not.toContain("MinBeregner.dk");
  });

  test("brandstaarnet sendes stadig som og:site_name", async () => {
    const juledagen = getDageTilEvents("se").find((e) => e.se.slug === "juldagen")!;
    const prefix = getDageTilPrefix("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const metadata = await buildDageTilMetadata(prefix, juledagen.se.slug, I_DAG);
    expect(metadata.openGraph?.siteName).toBe("Beräknare.se");
  });
});
