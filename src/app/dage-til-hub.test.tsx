import { describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import {
  getDageTilEvents,
  getDageTilHubPath,
  getDageTilHubRækker,
  getDageTilPrefix,
  getDageTilSlugs,
  getDageTilAnswer,
  isDageTilLocale,
} from "@/lib/dage-til";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getRouteDecision } from "@/lib/routing";
import { buildSitemap } from "./sitemap";
import DageTilHubPage from "./dage-til/page";
import DagarTillHubPage from "./dagar-till/page";
import { buildDageTilHubMetadata } from "@/components/DageTilHub";

/**
 * `/dage-til` og `/dagar-till` er to route-filer over én komponent, og det er
 * path-prefixet der vælger sproget — så en test der kun importerer den danske
 * kan ikke se en svensk side overhovedet. Det er præcis sådan "til" slap
 * igennem før: alle eksisterende tests renderede `dage-til`, hvor "til" er
 * rigtigt. Derfor testes begge ruter, og deres `getCurrentDomainConfig`-mock
 * skifter sprog.
 */
const ROUTE_FOR = { da: DageTilHubPage, se: DagarTillHubPage } as const;

vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({ FAQSchema: () => null }));
vi.mock("@/lib/get-locale", () => ({ getCurrentDomainConfig: vi.fn() }));

const host = vi.hoisted(() => ({ locale: "da" as "da" | "se" }));

/** Hver rute serverer sin egen sti — det er den der vælger sproget. */
const HUB_FOR = { da: "/dage-til", se: "/dagar-till" } as const;
vi.mocked(getCurrentDomainConfig).mockImplementation(async () =>
  getDomainConfigByLocale(host.locale)
);

/** 2026-10-02. Et fast klokkeslæt, så rækkerne kan måles mod en kalender. */
const I_DAG = new Date("2026-10-02T12:00:00.000Z");
const now = new Date();

async function render(sprog: "da" | "se") {
  host.locale = sprog;
  return renderToStaticMarkup(await ROUTE_FOR[sprog]());
}

/** `<a href="…">1. december</a>` → alle hrefs i markupken. */
function hrefs(html: string): string[] {
  return [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
}

describe("dage-til hub: rækker", () => {
  test("hver række er den tælleperiode, den linkede side viser for samme dag", () => {
    for (const sprog of ["da", "se"] as const) {
      const rækker = getDageTilHubRækker(sprog, I_DAG);
      const events = getDageTilEvents(sprog);
      expect(rækker.length, sprog).toBe(events.length);
      for (const raekke of rækker) {
        const event = events.find((e) => e.id === raekke.id);
        expect(event, `${sprog}/${raekke.id}`).toBeDefined();
        const svar = getDageTilAnswer(event!, sprog, I_DAG);
        expect(raekke.days, `${sprog}/${raekke.id}`).toBe(svar.days);
        expect(raekke.weeks, `${sprog}/${raekke.id}`).toBe(svar.weeks);
        expect(raekke.daysLeft, `${sprog}/${raekke.id}`).toBe(svar.daysLeft);
        expect(raekke.isToday, `${sprog}/${raekke.id}`).toBe(svar.isToday);
        expect(raekke.targetIso, `${sprog}/${raekke.id}`).toBe(
          svar.targetDate.toISOString().slice(0, 10)
        );
      }
    }
  });

  test("den nærmeste dato kommer først, og rækkerne er sorteret efter dage", () => {
    for (const sprog of ["da", "se"] as const) {
      const rækker = getDageTilHubRækker(sprog, I_DAG);
      const dage = rækker.map((r) => r.days);
      expect(dage, sprog).toEqual([...dage].sort((a, b) => a - b));
      // Ingen kan ligge i fortiden: `getNextAnchorDate` finder den næste
      // forekomst, så det mindste tal er 0 (dagen i dag) eller større.
      expect(dage[0], sprog).toBeGreaterThanOrEqual(0);
    }
  });

  test("hver række linker til sit eget sprog og til en side der findes", () => {
    for (const sprog of ["da", "se"] as const) {
      const prefix = getDageTilPrefix(sprog) as string;
      const slugs = getDageTilSlugs(sprog);
      for (const raekke of getDageTilHubRækker(sprog, I_DAG)) {
        expect(raekke.href.startsWith(prefix), `${sprog}/${raekke.id}`).toBe(true);
        expect(slugs, `${sprog}/${raekke.id}`).toContain(
          raekke.href.slice(prefix.length)
        );
      }
    }
  });

  test("det norske domæne får ingen rækker og ingen hub-sti", () => {
    expect(getDageTilHubRækker("no", I_DAG)).toEqual([]);
    expect(getDageTilHubPath("no")).toBeUndefined();
  });

  test("hub-stien er sektionens egen sti uden slash — ellers peger sitemap og hreflang på en 308", () => {
    expect(getDageTilHubPath("da")).toBe("/dage-til");
    expect(getDageTilHubPath("se")).toBe("/dagar-till");
  });
});

describe("dage-til hub: rendering", () => {
  test("den danske side viser alle danske datoer med dagens tal", async () => {
    const html = await render("da");
    const rækker = getDageTilHubRækker("da", I_DAG);
    for (const raekke of rækker) {
      expect(html, raekke.id).toContain(`href="${raekke.href}"`);
    }
    // Dagens antal dage står på siden — tallet kommer fra getDageTilAnswer,
    // så en mutation i rækkerne slår den her rød.
    const dage = getDageTilAnswer(
      getDageTilEvents("da").find((e) => e.id === rækker[0].id)!,
      "da",
      new Date()
    );
    expect(html).toContain(`>${dage.days} dage</span>`);
    expect(html).not.toContain("NaN");
  });

  test("den svenske side bruger svenske slugs, svenske ord og ingen danske", async () => {
    const html = await render("se");
    for (const raekke of getDageTilHubRækker("se", I_DAG)) {
      expect(html, raekke.id).toContain(`href="${raekke.href}"`);
    }
    expect(html).toContain("dagar");
    expect(html).toContain("till");
    // Danske rester i den svenske udgave: danske slugs, "til" i stedet for
    // "till", "dage" som enhed, og bogstaverne æ/ø, der ikke findes i svensk
    // (å går igen — det er samme tegn på begge sprog).
    expect(html).not.toMatch(/href="\/dage-til\//);
    expect(html).not.toMatch(/>\d+ dage</);
    expect(html).not.toMatch(/[æøÆØ]/);
  });

  test("hubben linker videre til dato- og nedtællingsberegneren", async () => {
    for (const sprog of ["da", "se"] as const) {
      const hrefsPaaSiden = hrefs(await render(sprog));
      expect(hrefsPaaSiden, sprog).toContain("/dato");
      expect(hrefsPaaSiden, sprog).toContain("/nedtaelling");
    }
  });

  test("hubben har præcis én h1, og den er spørgsmålet", async () => {
    for (const sprog of ["da", "se"] as const) {
      const html = await render(sprog);
      const h1 = [...html.matchAll(/<h1[^>]*>(.*?)<\/h1>/g)].map((m) => m[1]);
      expect(h1.length, sprog).toBe(1);
      expect(h1[0], sprog).toContain(
        sprog === "da" ? "Hvor mange dage er der til" : "Hur många dagar är det till"
      );
    }
  });
});

describe("dage-til hub: metadata og sitemap", () => {
  test("titlen bærer spørgsmålet og antallet af datoer, og er under 60 tegn", async () => {
    for (const sprog of ["da", "se"] as const) {
      host.locale = sprog;
      const meta = await buildDageTilHubMetadata(HUB_FOR[sprog], I_DAG);
      const title = String((meta.title as { absolute: string }).absolute);
      expect(title, sprog).toMatch(
        sprog === "da" ? /^Hvor mange dage er der til/ : /^Hur många dagar är det till/
      );
      expect(title.length, `${sprog} (${title.length})`).toBeLessThanOrEqual(60);
      // Hverken domænenavn eller layoutets suffix: samme regel som
      // dage-til-siderne bruger `title.absolute` for.
      expect(title, sprog).not.toMatch(/MinBeregner|Beregner\.no|Beräknare/);
    }
  });

  test("beskrivelsen er under 160 tegn og bruker dagens tal", async () => {
    for (const sprog of ["da", "se"] as const) {
      host.locale = sprog;
      const meta = await buildDageTilHubMetadata(HUB_FOR[sprog], I_DAG);
      const description = String(meta.description);
      expect(description.length, `${sprog} (${description.length})`).toBeLessThanOrEqual(
        160
      );
      const rækker = getDageTilHubRækker(sprog, I_DAG);
      expect(description, sprog).toContain(String(rækker[0].days));
      expect(description, sprog).not.toContain("NaN");
    }
  });

  test("canonical og hreflang peger på hver sit sprog, x-default på dansk", async () => {
    for (const sprog of ["da", "se"] as const) {
      host.locale = sprog;
      const meta = await buildDageTilHubMetadata(HUB_FOR[sprog], I_DAG);
      const alternates = meta.alternates as {
        canonical: string;
        languages: Record<string, string>;
      };
      const eget = sprog === "da" ? "https://minberegner.dk/dage-til" : "https://beraknare.se/dagar-till";
      expect(alternates.canonical, sprog).toBe(eget);
      const languages = alternates.languages;
      expect(languages["x-default"], sprog).toBe("https://minberegner.dk/dage-til");
      // Ingen hreflang må pege på den anden sprogs sti under dansk sti.
      for (const [lang, url] of Object.entries(languages)) {
        expect(url.startsWith("https://"), `${sprog}/${lang}`).toBe(true);
        if (sprog === "se") {
          expect(url, `${sprog}/${lang}`).not.toContain("/dage-til/");
        }
      }
    }
  });

  test("sitemapten har hubben som en daglig side på begge domæner, og norsk får ingen", () => {
    const forEach = (locale: "da" | "se" | "no") =>
      buildSitemap(getDomainConfigByLocale(locale), now).map((e) => String(e.url));

    const da = forEach("da");
    const hubDa = da.find((url) => url === "https://minberegner.dk/dage-til");
    expect(hubDa).toBeDefined();
    expect(da).not.toContain("https://minberegner.dk/dage-til/");
    expect(forEach("se")).toContain("https://beraknare.se/dagar-till");
    expect(forEach("se")).not.toContain("https://beraknare.se/dage-til");
    for (const url of forEach("no")) {
      expect(url).not.toMatch(/dage-til|dagar-till/);
    }
  });

  test("eget sprog serveres, det anden sprogs hub redirectes, og norsk 404'er", () => {
    const da = getDomainConfigByLocale("da");
    const se = getDomainConfigByLocale("se");
    const no = getDomainConfigByLocale("no");
    expect(getRouteDecision(da, "/dage-til")).toEqual({ type: "allow" });
    expect(getRouteDecision(se, "/dagar-till")).toEqual({ type: "allow" });
    // Ellers serverede minberegner.dk/dagar-till en anden kopi af /dage-til,
    // og beraknare.se/dage-til en anden kopi af /dagar-till.
    expect(getRouteDecision(da, "/dagar-till")).toEqual({
      type: "redirect",
      destination: "/dage-til",
      status: 301,
    });
    expect(getRouteDecision(se, "/dage-til")).toEqual({
      type: "redirect",
      destination: "/dagar-till",
      status: 301,
    });
    for (const sti of ["/dage-til", "/dagar-till"]) {
      expect(getRouteDecision(no, sti), sti).toEqual({ type: "not-found" });
    }
  });

  // 5/10: de to december-aftener har datoen i URL'en. GSC 5/10 lister
  // "hvor mange dage er der til den 24 december" som 1.036 visninger på pos. 5
  // under `/dato` — altså `/dato` og nedtællingssiden konkurrerede om den, og
  // "24 december" stod ingen steder i stien. Uden 301'en på de gamle slugs
  // ville de to URL'er være samme svar to steder, og en 404 ville kaste den
  // rangering, juleaftens side måtte have bygget siden 2/10.
  test("de daterede december-slugs serveres, og de gamle slug'er 301'er", () => {
    const da = getDomainConfigByLocale("da");
    const se = getDomainConfigByLocale("se");
    for (const [locale, domæne, prefix] of [
      ["da", da, "/dage-til/"],
      ["se", se, "/dagar-till/"],
    ] as const) {
      for (const dato of ["24-december", "31-december"]) {
        expect(getRouteDecision(domæne, `${prefix}${dato}`), `${locale} ${dato}`).toEqual({
          type: "allow",
        });
      }
    }
    expect(getRouteDecision(da, "/dage-til/juleaften")).toEqual({
      type: "redirect",
      destination: "/dage-til/24-december",
      status: 301,
    });
    expect(getRouteDecision(da, "/dage-til/nytaarsaften")).toEqual({
      type: "redirect",
      destination: "/dage-til/31-december",
      status: 301,
    });
    expect(getRouteDecision(se, "/dagar-till/julafton")).toEqual({
      type: "redirect",
      destination: "/dagar-till/24-december",
      status: 301,
    });
    expect(getRouteDecision(se, "/dagar-till/nyarsafton")).toEqual({
      type: "redirect",
      destination: "/dagar-till/31-december",
      status: 301,
    });
    // Det danske alias på det svenske domæne skal pege på den svenske side,
    // ikke på et dansk slug — samme regel som for et krydssprogs slug.
    expect(getRouteDecision(se, "/dagar-till/juleaften")).toEqual({
      type: "redirect",
      destination: "/dagar-till/24-december",
      status: 301,
    });
    // En slug, der aldrig har været publiceret, er stadig en 404.
    expect(getRouteDecision(da, "/dage-til/23-december")).toEqual({
      type: "not-found",
    });
  });

  test("en hub med den anden sprogs sti får hverken description eller canonical", async () => {
    // Forsvar i dybet: routeren redirecter, men rendereren må ikke være den
    // eneste beskyttelse mod en dublet i Googles index.
    host.locale = "da";
    const meta = await buildDageTilHubMetadata("/dagar-till", I_DAG);
    expect(meta.description).toBeUndefined();
    expect(meta.alternates).toBeUndefined();
    expect(meta.robots).toEqual({ index: false, follow: false });
    host.locale = "se";
    const svensk = await buildDageTilHubMetadata("/dage-til", I_DAG);
    expect(svensk.description).toBeUndefined();
    expect(isDageTilLocale("da")).toBe(true);
  });
});
