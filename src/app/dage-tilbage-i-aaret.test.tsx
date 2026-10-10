/**
 * `/dage-tilbage-i-aaret` og `/dagar-kvar-i-aret` er to route-filer over én
 * komponent, og det er *stien* der vælger sproget — samme regel som
 * `/dage-i-aaret`, `/dage-til` og `/klokken-i`. En test der kun importerer den
 * danske kan derfor ikke se den svenske side. Derfor testes begge ruter, og
 * deres `getCurrentDomainConfig`-mock skifter sprog.
 *
 * Porten dømmer de ting siden *lover* — titel, `<h1>, `description`, `FAQPage`,
 * canonical/hreflang, 301 mellem domænerne og sitemap — og **alle tal i
 * svarfeltet og i tabellen mod de funktioner der har regnet dem**, så en ny
 * kalender eller et nyt sprog ikke kan få løfte-sætninger uden at porten ser
 * det. Punkt 11: en påstand i tekst er kode.
 */
import { describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import {
  DAGE_TILBAGE_PATH,
  aaretTilbage,
  dageTilbageIAaretCopy,
  dageTilbageIAaretFaq,
  isDageTilbageLocale,
} from "@/lib/dage-tilbage-i-aaret";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getRouteDecision } from "@/lib/routing";
import { buildSitemap } from "./sitemap";
import DageTilbageIAaretPage from "./dage-tilbage-i-aaret/page";
import DagarKvarIAretPage from "./dagar-kvar-i-aret/page";
import { buildDageTilbageIAaretMetadata } from "@/components/DageTilbageIAaret";

vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
type Spg = { question: string; answer: string }[];
// `FAQ` og `FAQSchema` erstattes af de simpleste komponenter, der viser *hele*
// spørgsmålsteksten: de to er de steder, siden lover sit svar på to gange, og en
// mock der renderer `null` ville skjule præcis den fejl, porten skal finde.
vi.mock("@/components/FAQ", () => ({
  default: ({ items }: { items: Spg }) => (
    <div data-testid="faq">
      {items.map((i) => (
        <p key={i.question}>{i.question} {i.answer}</p>
      ))}
    </div>
  ),
}));
vi.mock("@/components/StructuredData", () => ({
  FAQSchema: ({ items }: { items: Spg }) => (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ items }) }}
    />
  ),
}));
vi.mock("@/lib/get-locale", () => ({ getCurrentDomainConfig: vi.fn() }));

const host = vi.hoisted(() => ({ locale: "da" as "da" | "se" }));

vi.mocked(getCurrentDomainConfig).mockImplementation(async () =>
  getDomainConfigByLocale(host.locale)
);

const ROUTE_FOR = {
  da: DageTilbageIAaretPage,
  se: DagarKvarIAretPage,
} as const;

/** 2026-10-10: lørdag med 82 dage tilbage af året. Fast, så tallene kan måles. */
const I_DAG = new Date(2026, 9, 10, 12, 0, 0);

async function render(sprog: "da" | "se") {
  host.locale = sprog;
  return renderToStaticMarkup(await ROUTE_FOR[sprog]());
}

describe("dage tilbage i året: siden peger på sit eget spørgsmål", () => {
  test("begge sprog har egen sti, egen titel og egen h1", async () => {
    for (const sprog of ["da", "se"] as const) {
      const c = dageTilbageIAaretCopy[sprog];
      expect(DAGE_TILBAGE_PATH[sprog], sprog).toBe(
        sprog === "da" ? "/dage-tilbage-i-aaret" : "/dagar-kvar-i-aret"
      );
      // Titlen og h1 skal ramme søgningen ordret: målingen 10/10 fandt «hvor
      // mange dage er der tilbage af 2026» i dansk autocompletes top-10 under
      // «hvor mange dage er der til», og «hur många dagar är det kvar av 2026»
      // som svensk nr. 1 under «kvar av 2026».
      const spoergsmaal =
        sprog === "da"
          ? "hvor mange dage er der tilbage af"
          : "hur många dagar är det kvar av";
      expect(c.titelSpoergsmaal.toLowerCase(), sprog).toBe(spoergsmaal);
      expect(c.h1.toLowerCase(), sprog).toBe(
        sprog === "da"
          ? "hvor mange dage er der tilbage af året?"
          : "hur många dagar är det kvar av året?"
      );
      expect(c.lead.length, sprog).toBeLessThanOrEqual(160);
      const html = await render(sprog);
      expect(html, sprog).toContain(`<h1`);
      // Ét h1 pr. side.
      expect(html.match(/<h1[ >]/g)?.length, sprog).toBe(1);
      // Copy uden årstal: et frosset «2026» i h1 eller lead ville være en
      // påstand, der holder op med at være sand 1. januar.
      expect(c.h1, sprog).not.toMatch(/\b20\d{2}\b/);
      expect(c.lead, sprog).not.toMatch(/\b20\d{2}\b/);
    }
  });

  test("titlen bærer spørgsmålet, årstallet og dagetallet", async () => {
    for (const sprog of ["da", "se"] as const) {
      host.locale = sprog;
      const meta = await buildDageTilbageIAaretMetadata(DAGE_TILBAGE_PATH[sprog], I_DAG);
      const title = (meta.title as { absolute: string }).absolute;
      const o = aaretTilbage(sprog, I_DAG);
      const dagetal = sprog === "da" ? "82 dage" : "82 dagar";
      expect(title, sprog).toBe(
        `${dageTilbageIAaretCopy[sprog].titelSpoergsmaal} ${o.aar}? ${dagetal}`
      );
      const description = meta.description as string;
      expect(description.length, sprog).toBeLessThanOrEqual(160);
      expect(description, sprog).toContain(String(o.aar));
      expect(description, sprog).not.toContain("undefined");
    }
  });

  test("alle tal i den svenske række findes i den danske tekst", async () => {
    const html = await render("da");
    const o = aaretTilbage("da", I_DAG);
    expect(html).toContain(`Der er tilbage af året efter i dag:`);
    expect(html).toContain("82 dage");
    expect(html).toContain("11 hele uger og 5 dage");
    expect(html).toContain("1.968 timer");
    expect(html).toContain("77,3 % af 2026");
    expect(html).toContain("56");
    // Resten af dage tilbage pr. måned — den uafhængige optælling i
    // `dage-tilbage-i-aaret.test.ts` fastlægger 21/30/31.
    expect(html).toContain("oktober");
    expect(html).toContain("december");
    expect(o.maaneder.map((m) => m.dageTilbage)).toEqual([21, 30, 31]);
    expect(o.maaneder.map((m) => m.hverdageTilbage)).toEqual([15, 21, 20]);
  });

  test("de fire målte spørgsmål står i den synlige tekst og i FAQPage-JSON-LD", async () => {
    for (const sprog of ["da", "se"] as const) {
      const faq = dageTilbageIAaretFaq(sprog, I_DAG);
      expect(faq.length, sprog).toBe(4);
      const forventet =
        sprog === "da"
          ? [
              "Hvor mange dage er der tilbage af året?",
              "Hvornår er der 100 dage tilbage af året?",
              "Hvor mange arbejdsdage er der tilbage af året?",
              "Hvornår slutter året?",
            ]
          : [
              "Hur många dagar är det kvar av året?",
              "När är det 100 dagar kvar av året?",
              "Hur många arbetsdagar är det kvar av året?",
              "När slutar året?",
            ];
      expect(faq.map((f) => f.question), sprog).toEqual(forventet);
      const html = await render(sprog);
      for (const f of faq) {
        expect(html, `${sprog}/${f.question}`).toContain(f.question);
        expect(html, `${sprog}/${f.question}`).toContain(f.answer);
      }
      // JSON-LD'en skal være *de samme* fire svar — tegnes escaped i markupken,
      // så den læses tilbage og sammenlignes med kopien.
      const rå = /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(html)?.[1];
      expect(rå, sprog).toBeDefined();
      const json = JSON.parse(
        (rå as string)
          .replaceAll("&quot;", '"')
          .replaceAll("&#x27;", "'")
          .replaceAll("&lt;", "<")
          .replaceAll("&gt;", ">")
          .replaceAll("&amp;", "&")
      ) as { items: Spg };
      expect(json.items, sprog).toEqual(faq);
    }
  });

  test("canonical, hreflang og x-default peger på den anden sprogside", async () => {
    for (const sprog of ["da", "se"] as const) {
      host.locale = sprog;
      const meta = await buildDageTilbageIAaretMetadata(
        DAGE_TILBAGE_PATH[sprog],
        I_DAG
      );
      const canonical = meta.alternates?.canonical;
      expect(canonical, sprog).toBe(
        `${getDomainConfigByLocale(sprog).baseUrl}${DAGE_TILBAGE_PATH[sprog]}`
      );
      const languages = meta.alternates?.languages as Record<string, string>;
      const DA = getDomainConfigByLocale("da").hreflangCode;
      const SE = getDomainConfigByLocale("se").hreflangCode;
      expect(Object.keys(languages).sort(), sprog).toEqual([DA, SE, "x-default"].sort());
      expect(languages[DA], sprog).toBe(
        `${getDomainConfigByLocale("da").baseUrl}/dage-tilbage-i-aaret`
      );
      expect(languages[SE], sprog).toBe(
        `${getDomainConfigByLocale("se").baseUrl}/dagar-kvar-i-aret`
      );
      expect(languages["x-default"], sprog).toBe(languages[DA]);
    }
  });

  test("den anden sprogs sti er 301 på dette domæne, og 404 i norsk", () => {
    for (const sprog of ["da", "se"] as const) {
      const anden = sprog === "da" ? "se" : "da";
      const domæne = getDomainConfigByLocale(sprog);
      const afprøv = (path: string) =>
        getRouteDecision(domæne, path) as
          | { type: "allow" }
          | { type: "not-found" }
          | { type: "redirect"; destination: string; status: 301 | 308 };
      expect(afprøv(DAGE_TILBAGE_PATH[anden]), `${sprog}/${anden}`).toEqual({
        type: "redirect",
        destination: DAGE_TILBAGE_PATH[sprog],
        status: 301,
      });
      expect(afprøv(DAGE_TILBAGE_PATH[sprog]), sprog).toEqual({ type: "allow" });
    }
    // `beregner.no` er ikke i drift (❓ i planen), så den skal ikke servere
    // siden på norsk — ellers ville den få danske månedsnavne på et norsk domæne.
    expect(
      getRouteDecision(getDomainConfigByLocale("no"), DAGE_TILBAGE_PATH.da)
    ).toEqual({ type: "not-found" });
  });

  test("siden ligger i begge sitemapme som daily", () => {
    for (const sprog of ["da", "se"] as const) {
      const sitemap = buildSitemap(getDomainConfigByLocale(sprog), I_DAG);
      const entry = sitemap.find(
        (e) =>
          e.url ===
          `${getDomainConfigByLocale(sprog).baseUrl}${DAGE_TILBAGE_PATH[sprog]}`
      );
      expect(entry, sprog).toBeDefined();
      expect(entry?.changeFrequency, sprog).toBe("daily");
      // Den anden sprogs URL må ikke stå i sit sitemap: den er en 301.
      expect(
        sitemap.some((e) =>
          e.url.endsWith(DAGE_TILBAGE_PATH[sprog === "da" ? "se" : "da"])
        ),
        sprog
      ).toBe(false);
      // URL'en præcis én gang.
      expect(
        sitemap.filter((e) =>
          e.url.endsWith(DAGE_TILBAGE_PATH[sprog])
        ).length,
        sprog
      ).toBe(1);
    }
  });

  test("kender kun de to domæner der har siden", () => {
    expect(isDageTilbageLocale("da")).toBe(true);
    expect(isDageTilbageLocale("se")).toBe(true);
    expect(isDageTilbageLocale("no")).toBe(false);
  });
});
