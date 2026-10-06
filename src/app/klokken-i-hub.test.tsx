import { describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import {
  beregnKlokkenNu,
  findKlokkenLand,
  getKlokkenHubPath,
  getKlokkenHubRaekker,
  getKlokkenPrefix,
  getKlokkenSlugs,
  KLOKKEN_LANDE,
} from "@/lib/klokken-i";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getRouteDecision } from "@/lib/routing";
import { buildSitemap } from "./sitemap";
import KlokkenIHubPage from "./klokken-i/page";
import KlockanIHubPage from "./klockan-i/page";
import { buildKlokkenHubMetadata } from "@/components/KlokkenIHub";

/**
 * `/klokken-i` og `/klockan-i` er to route-filer over én komponent, og det er
 * stien der vælger sproget — samme regel som `/dage-til` og `/dagar-till`. En
 * test der kun importerer den danske kan derfor ikke se den svenske side, og
 * det er præcis sådan en dansk «til» eller et dansk landnavn slap igennem før.
 */
const ROUTE_FOR = { da: KlokkenIHubPage, se: KlockanIHubPage } as const;

vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({ FAQSchema: () => null }));
vi.mock("@/lib/get-locale", () => ({ getCurrentDomainConfig: vi.fn() }));

const host = vi.hoisted(() => ({ locale: "da" as "da" | "se" }));

/** Hver rute serverer sin egen sti — det er den der vælger sproget. */
const HUB_FOR = { da: "/klokken-i", se: "/klockan-i" } as const;
vi.mocked(getCurrentDomainConfig).mockImplementation(async () =>
  getDomainConfigByLocale(host.locale)
);

/** 2026-10-02 kl. 14. Et fast klokkeslæt, så rækkerne kan måles mod uret. */
const I_DAG = new Date("2026-10-02T12:00:00.000Z");
const now = new Date();

async function render(sprog: "da" | "se") {
  host.locale = sprog;
  return renderToStaticMarkup(await ROUTE_FOR[sprog]());
}

describe("klokken-i hub: rækker", () => {
  test("hver række er det samme svar som den linkede landside viser", () => {
    for (const sprog of ["da", "se"] as const) {
      const rækker = getKlokkenHubRaekker(sprog, I_DAG);
      expect(rækker.length, sprog).toBe(KLOKKEN_LANDE.length);
      for (const raekke of rækker) {
        const slug = raekke.href.slice(`${getKlokkenPrefix(sprog)}`.length);
        const land = findKlokkenLand(slug, sprog);
        expect(land, `${sprog}/${raekke.id}`).toBeTruthy();
        const svar = beregnKlokkenNu(land!.byer[0], sprog, I_DAG);
        expect(raekke.tid, `${sprog}/${raekke.id}`).toBe(svar.tid);
        expect(raekke.by, `${sprog}/${raekke.id}`).toBe(svar.by);
        expect(raekke.forskel, `${sprog}/${raekke.id}`).toBe(svar.forskel);
      }
    }
  });

  test("rækkerne er sorteret efter hvor tæt landet ligger på Danmark", () => {
    for (const sprog of ["da", "se"] as const) {
      const rækker = getKlokkenHubRaekker(sprog, I_DAG);
      const afstande = rækker.map((r) => Math.abs(r.minutter));
      expect(afstande, sprog).toEqual(
        [...afstande].sort((a, b) => a - b)
      );
    }
  });

  test("hver række linker til sit eget sprog og til en side der findes", () => {
    for (const sprog of ["da", "se"] as const) {
      const prefix = getKlokkenPrefix(sprog) as string;
      for (const raekke of getKlokkenHubRaekker(sprog, I_DAG)) {
        expect(raekke.href.startsWith(prefix), `${sprog}/${raekke.id}`).toBe(
          true
        );
        expect(getKlokkenSlugs(sprog), `${sprog}/${raekke.id}`).toContain(
          raekke.href.slice(prefix.length)
        );
      }
    }
  });

  test("hub-stien er sektionens egen sti uden slash — ellers peger sitemap på en 308", () => {
    expect(getKlokkenHubPath("da")).toBe("/klokken-i");
    expect(getKlokkenHubPath("se")).toBe("/klockan-i");
    // Norsk domæne har hverken landesider eller hub, så ingen sti.
    expect(getKlokkenHubPath("no")).toBeUndefined();
  });
});

describe("klokken-i hub: rendering", () => {
  test("den danske side viser alle lande med klokken lige nu", async () => {
    const html = await render("da");
    const rækker = getKlokkenHubRaekker("da", new Date());
    for (const raekke of rækker) {
      expect(html, raekke.id).toContain(`href="${raekke.href}"`);
    }
    // Tallet på siden kommer fra getKlokkenHubRaekker, så en mutation der
    // slår den her rød.
    expect(html).toContain(rækker[0].tid);
    // Indledningen skal tælle de samme lande som rækkerne — og som titlen og
    // metadata altid har gjort. Den lå fast på «tolv» med fjorten i listen.
    expect(html).toContain(`Klokken lige nu i ${rækker.length} lande`);
    expect(html).not.toContain("NaN");
  });

  test("den svenske side bruger svenske slugs og ord, og ingen danske", async () => {
    const html = await render("se");
    const raekker = getKlokkenHubRaekker("se", I_DAG);
    for (const raekke of raekker) {
      expect(html, raekke.id).toContain(`href="${raekke.href}"`);
    }
    expect(html).toContain("Vad är klockan i");
    // Samme regel som på den danske side: indledningen tæller rækkerne, så den
    // ikke kan love tolv lande og vise fjorten.
    expect(html).toContain(`Klockan just nu i ${raekker.length} länder`);
    // Danske rester i den svenske udgave: danske slugs, dansk landnavn og
    // bogstaverne æ/ø, der ikke findes i svensk (å går igen — samme tegn).
    expect(html).not.toMatch(/href="\/klokken-i\//);
    expect(html).not.toMatch(/Tyrkiet/);
    expect(html).not.toMatch(/[æøÆØ]/);
  });

  test("hubben har præcis én h1, og den er spørgsmålet", async () => {
    for (const sprog of ["da", "se"] as const) {
      const html = await render(sprog);
      const h1 = [...html.matchAll(/<h1[^>]*>(.*?)<\/h1>/g)].map((m) => m[1]);
      expect(h1.length, sprog).toBe(1);
      expect(h1[0], sprog).toBe(
        sprog === "da" ? "Hvad er klokken i …?" : "Vad är klockan i …?"
      );
    }
  });

  test("hubben linker videre til tidszonekonverteren", async () => {
    for (const sprog of ["da", "se"] as const) {
      const html = await render(sprog);
      expect(html, sprog).toContain('href="/tidszone"');
    }
  });
});

describe("klokken-i hub: metadata og sitemap", () => {
  test("titlen bærer spørgsmålet og antallet af lande, og er under 60 tegn", async () => {
    for (const sprog of ["da", "se"] as const) {
      host.locale = sprog;
      const meta = await buildKlokkenHubMetadata(HUB_FOR[sprog], I_DAG);
      const title = String((meta.title as { absolute: string }).absolute);
      expect(
        title,
        sprog
      ).toMatch(sprog === "da" ? /^Hvad er klokken i/ : /^Vad är klockan i/);
      expect(title.length, `${sprog} (${title.length})`).toBeLessThanOrEqual(60);
      // Antallet laeses fra modulet, som titlen selv gør, saa et nyt land ikke
      // kan glemmes her og tæt porten ned mod en side der siger noget andet.
      expect(title, sprog).toContain(String(getKlokkenSlugs(sprog).length));
      expect(title, sprog).not.toMatch(/MinBeregner|Beregner\.no|Beräknare/);
    }
  });

  test("beskrivelsen er under 160 tegn og bruger klokken fra rækkerne", async () => {
    for (const sprog of ["da", "se"] as const) {
      host.locale = sprog;
      const meta = await buildKlokkenHubMetadata(HUB_FOR[sprog], I_DAG);
      const description = String(meta.description);
      expect(
        description.length,
        `${sprog} (${description.length})`
      ).toBeLessThanOrEqual(160);
      const rækker = getKlokkenHubRaekker(sprog, I_DAG);
      expect(description, sprog).toContain(rækker[0].tid);
      expect(description, sprog).toContain(rækker[0].land);
      expect(description, sprog).not.toContain("NaN");
    }
  });

  test("canonical og hreflang peger på hver sit sprog, x-default på dansk", async () => {
    for (const sprog of ["da", "se"] as const) {
      host.locale = sprog;
      const meta = await buildKlokkenHubMetadata(HUB_FOR[sprog], I_DAG);
      const alternates = meta.alternates as {
        canonical: string;
        languages: Record<string, string>;
      };
      const eget =
        sprog === "da"
          ? "https://minberegner.dk/klokken-i"
          : "https://beraknare.se/klockan-i";
      expect(alternates.canonical, sprog).toBe(eget);
      const languages = alternates.languages;
      expect(languages["x-default"], sprog).toBe(
        "https://minberegner.dk/klokken-i"
      );
      for (const [lang, url] of Object.entries(languages)) {
        expect(url.startsWith("https://"), `${sprog}/${lang}`).toBe(true);
        if (sprog === "se") {
          // Den danske hreflang-peger på /klokken-i — det er jo
          // rigtigt. Det der ikke må stå på beraknare.se er den
          // danske sti, for så ville de to domæner have hver sin.
          expect(url, `${sprog}/${lang}`).not.toContain("beraknare.se/klokken-i");
        }
      }
    }
  });

  test("sitemapten har hubben som en daglig side på begge domæner, og norsk får ingen", () => {
    const forEach = (locale: "da" | "se" | "no") =>
      buildSitemap(getDomainConfigByLocale(locale), now).map((e) =>
        String(e.url)
      );

    const da = forEach("da");
    expect(da).toContain("https://minberegner.dk/klokken-i");
    expect(da).not.toContain("https://minberegner.dk/klokken-i/");
    expect(forEach("se")).toContain("https://beraknare.se/klockan-i");
    expect(forEach("se")).not.toContain("https://beraknare.se/klokken-i");
    for (const url of forEach("no")) {
      expect(url).not.toMatch(/klokken-i|klockan-i/);
    }
  });

  test("eget sprog serveres, det anden sprogs hub redirectes, og norsk 404'er", () => {
    const da = getDomainConfigByLocale("da");
    const se = getDomainConfigByLocale("se");
    const no = getDomainConfigByLocale("no");
    expect(getRouteDecision(da, "/klokken-i")).toEqual({ type: "allow" });
    expect(getRouteDecision(se, "/klockan-i")).toEqual({ type: "allow" });
    // Ellers serverede minberegner.dk/klockan-i en dansk kopi af listen, og
    // beraknare.se/klokken-i en svensk — to sider om det samme på hvert domæne.
    expect(getRouteDecision(da, "/klockan-i")).toEqual({
      type: "redirect",
      destination: "/klokken-i",
      status: 301,
    });
    expect(getRouteDecision(se, "/klokken-i")).toEqual({
      type: "redirect",
      destination: "/klockan-i",
      status: 301,
    });
    for (const sti of ["/klokken-i", "/klockan-i"]) {
      expect(getRouteDecision(no, sti), sti).toEqual({ type: "not-found" });
    }
  });

  test("en hub med den anden sprogs sti får hverken description eller canonical", async () => {
    // Forsvar i dybet: routeren redirecter, men rendereren må ikke være den
    // eneste beskyttelse mod en dublet i Googles index.
    host.locale = "da";
    const meta = await buildKlokkenHubMetadata("/klockan-i", I_DAG);
    expect(meta.description).toBeUndefined();
    expect(meta.alternates).toBeUndefined();
    expect(meta.robots).toEqual({ index: false, follow: false });
    host.locale = "se";
    const svensk = await buildKlokkenHubMetadata("/klokken-i", I_DAG);
    expect(svensk.description).toBeUndefined();
    expect(svensk.robots).toEqual({ index: false, follow: false });
  });
});
