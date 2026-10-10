/**
 * `/dage-i-maaneden` og `/dagar-i-manaden` er to route-filer over én komponent,
 * og det er *stien* der vælger sproget. Porten dømmer de ting siden *lover* —
 * titel, `<h1>`, de målte søgninger som `FAQPage`, canonical/hreflang, 301
 * mellem domænerne og sitemap — og alle tal i brødteksten og i tabellen mod de
 * funktioner der har regnet dem.
 */
import { describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import {
  DAGE_I_MAANEDEN_PATH,
  dageIManedenAfsnit,
  dageIManedenCopy,
  dageIManedenFaq,
  getDageIManedenPath,
  isDageIManedenLocale,
  maanederOversigt,
} from "@/lib/dage-i-maaneden";
import { denneMaanedEksempel, erSkudaar, maanederITaar } from "@/lib/dato-eksempler";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getRouteDecision } from "@/lib/routing";
import { buildSitemap } from "./sitemap";
import DageIManedenPage from "./dage-i-maaneden/page";
import DagarIManadenPage from "./dagar-i-manaden/page";
import { buildDageIManedenMetadata } from "@/components/DageIManeden";

vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
type Spg = { question: string; answer: string }[];
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
  da: DageIManedenPage,
  se: DagarIManadenPage,
} as const;

const I_DAG = new Date("2026-10-02T12:00:00.000Z");

async function render(sprog: "da" | "se") {
  host.locale = sprog;
  return renderToStaticMarkup(await ROUTE_FOR[sprog]());
}

describe("dage i måneden: siden peger på sit eget spørgsmål", () => {
  test("begge sprog har egen sti, egen titel og egen h1", async () => {
    for (const sprog of ["da", "se"] as const) {
      const c = dageIManedenCopy[sprog];
      expect(DAGE_I_MAANEDEN_PATH[sprog], sprog).toBe(
        sprog === "da" ? "/dage-i-maaneden" : "/dagar-i-manaden"
      );
      const spoergsmaal =
        sprog === "da"
          ? "hvor mange dage er der i en måned"
          : "hur många dagar är det i en månad";
      expect(c.title.toLowerCase(), sprog).toContain(spoergsmaal);
      expect(c.h1.toLowerCase(), sprog).toBe(`${spoergsmaal}?`);
      const html = await render(sprog);
      expect(html, sprog).toContain(`<h1`);
      expect(html.match(/<h1[ >]/g)?.length, sprog).toBe(1);
      expect(c.description.length, sprog).toBeLessThanOrEqual(160);
      expect(c.title, sprog).not.toMatch(/\b20\d{2}\b/);
      expect(c.description, sprog).not.toMatch(/\b20\d{2}\b/);
    }
  });

  test("de tre målte søgninger står i den synlige tekst og i FAQPage-JSON-LD", async () => {
    for (const sprog of ["da", "se"] as const) {
      const faq = dageIManedenFaq(sprog, I_DAG);
      expect(faq.length, sprog).toBe(3);
      const forventet =
        sprog === "da"
          ? [
              "Hvor mange dage er der i februar?",
              "Hvor mange dage er der i juli?",
              "Hvor mange dage er der i augusti?",
            ]
          : [
              "Hur många dagar är det i februari?",
              "Hur många dagar är det i juli?",
              "Hur många dagar är det i augusti?",
            ];
      expect(faq.map((f) => f.question), sprog).toEqual(forventet);
      const html = await render(sprog);
      for (const f of faq) {
        expect(html, `${sprog}/${f.question}`).toContain(f.question);
        expect(html, `${sprog}/${f.question}`).toContain(f.answer);
      }
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
      const meta = await buildDageIManedenMetadata(DAGE_I_MAANEDEN_PATH[sprog], I_DAG);
      const canonical = meta.alternates?.canonical;
      expect(canonical, sprog).toBe(
        `${getDomainConfigByLocale(sprog).baseUrl}${DAGE_I_MAANEDEN_PATH[sprog]}`
      );
      const languages = meta.alternates?.languages as Record<string, string>;
      const DA = getDomainConfigByLocale("da").hreflangCode;
      const SE = getDomainConfigByLocale("se").hreflangCode;
      expect(Object.keys(languages).sort(), sprog).toEqual(
        [DA, SE, "x-default"].sort()
      );
      expect(languages[DA], sprog).toBe(
        `${getDomainConfigByLocale("da").baseUrl}/dage-i-maaneden`
      );
      expect(languages[SE], sprog).toBe(
        `${getDomainConfigByLocale("se").baseUrl}/dagar-i-manaden`
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
      expect(afprøv(DAGE_I_MAANEDEN_PATH[anden]), `${sprog}/${anden}`).toEqual({
        type: "redirect",
        destination: DAGE_I_MAANEDEN_PATH[sprog],
        status: 301,
      });
      expect(afprøv(DAGE_I_MAANEDEN_PATH[sprog]), sprog).toEqual({ type: "allow" });
    }
    expect(
      getRouteDecision(getDomainConfigByLocale("no"), DAGE_I_MAANEDEN_PATH.da)
    ).toEqual({ type: "not-found" });
  });

  test("siden ligger i begge sitemapme som daily", () => {
    for (const sprog of ["da", "se"] as const) {
      const sitemap = buildSitemap(getDomainConfigByLocale(sprog), I_DAG);
      const entry = sitemap.find(
        (e) => e.url === `${getDomainConfigByLocale(sprog).baseUrl}${DAGE_I_MAANEDEN_PATH[sprog]}`
      );
      expect(entry, sprog).toBeDefined();
      expect(entry?.changeFrequency, sprog).toBe("daily");
      expect(
        sitemap.some(
          (e) => e.url.endsWith(DAGE_I_MAANEDEN_PATH[sprog === "da" ? "se" : "da"])
        ),
        sprog
      ).toBe(false);
    }
  });

  test("siden linker til /dato, /dage-i-aaret, /dage-til og dage-mellem i sit eget sprog", async () => {
    const da = await render("da");
    expect(da).toContain('href="/dato"');
    expect(da).toContain('href="/dage-i-aaret"');
    expect(da).toContain('href="/dage-til"');
    expect(da).toContain('href="/dage-mellem-datoer"');
    const se = await render("se");
    expect(se).toContain('href="/dato"');
    expect(se).toContain('href="/dagar-i-aret"');
    expect(se).toContain('href="/dagar-till"');
    expect(se).toContain('href="/dagar-mellan-datum"');
    expect(se).not.toContain('href="/dage-mellem-datoer"');
    expect(se).not.toContain('href="/dage-til"');
  });
});

describe("dage i måneden: tallene i teksten og i tabellen er regnet", () => {
  test("tabellen er de tolv måneder fra maanederITaar, og summeringen er dem", () => {
    for (const sprog of ["da", "se"] as const) {
      const o = maanederOversigt(sprog, I_DAG);
      const raekker = maanederITaar(2026, sprog);
      expect(o.maaneder.length, sprog).toBe(12);
      expect(
        o.maaneder.reduce((sum, m) => sum + m.dage, 0),
        sprog
      ).toBe(o.aarDage);
      expect(o.aarDage, sprog).toBe(365);
      expect(
        o.maaneder.reduce((sum, m) => sum + m.arbejdsdage, 0),
        sprog
      ).toBe(o.maaneder.reduce((sum, m) => sum + m.arbejdsdage, 0));
      expect(
        o.maaneder.reduce((sum, m) => sum + m.weekenddage, 0),
        sprog
      ).toBe(o.maaneder.reduce((sum, m) => sum + m.weekenddage, 0));
      for (const m of o.maaneder) {
        expect(m.name, `${sprog}/${m.month}`).toBe(raekker[m.month - 1]?.name);
      }
      const februar = o.maaneder[1]?.name;
      if (sprog === "da") {
        expect(februar, sprog).toBe("februar");
      } else {
        expect(februar, sprog).toBe("februari");
      }
    }
  });

  test("februar har 28 dage i 2026 og 29 i et skudår", () => {
    for (const sprog of ["da", "se"] as const) {
      const o = maanederOversigt(sprog, I_DAG);
      const februar = o.maaneder[1];
      expect(februar?.dage, sprog).toBe(28);
      expect(o.skudaar, sprog).toBe(false);
      expect(erSkudaar(2026)).toBe(false);
      const skud = maanederOversigt(sprog, new Date("2028-01-01T12:00:00.000Z"));
      expect(skud.maaneder[1]?.dage, sprog).toBe(29);
      expect(skud.skudaar, sprog).toBe(true);
      expect(skud.aarDage, sprog).toBe(366);
    }
  });

  test("juli og augusti har hver 31 dage, og hverdage og weekenddage er hver sit tal", () => {
    for (const sprog of ["da", "se"] as const) {
      const o = maanederOversigt(sprog, I_DAG);
      const juli = o.maaneder[6];
      const august = o.maaneder[7];
      expect(juli?.dage, sprog).toBe(31);
      expect(august?.dage, sprog).toBe(31);
      expect(juli?.arbejdsdage, sprog).toBe(23);
      expect(august?.arbejdsdage, sprog).toBe(21);
      expect(juli?.weekenddage, sprog).toBe(8);
      expect(august?.weekenddage, sprog).toBe(10);
      const svarAugusti = dageIManedenFaq(sprog, I_DAG)[2]?.answer ?? "";
      const svarJuli = dageIManedenFaq(sprog, I_DAG)[1]?.answer ?? "";
      expect(svarAugusti, sprog).toContain(`31`);
      expect(svarAugusti, sprog).toContain(`21`);
      expect(svarAugusti, sprog).toContain(`10`);
      expect(svarJuli, sprog).toContain(`31`);
      expect(svarJuli, sprog).toContain(`23`);
      expect(svarJuli, sprog).toContain(`8`);
    }
  });

  test("denne måned viser oktober 2026 med 31 dage og 9 dage tilbage den 2. oktober", () => {
    for (const sprog of ["da", "se"] as const) {
      const o = maanederOversigt(sprog, I_DAG);
      const dm = o.denneMaaned;
      expect(dm.name, sprog).toBe(sprog === "da" ? "oktober" : "oktober");
      expect(dm.dage, sprog).toBe(31);
      expect(dm.dageForbruget, sprog).toBe(2);
      expect(dm.dageTilbage, sprog).toBe(29);
      expect(dm.year, sprog).toBe(2026);
      const afsnit = dageIManedenAfsnit(sprog, I_DAG);
      const dmAfsnit = afsnit.find((a) =>
        sprog === "da"
          ? a.overskrift.includes("denne måned")
          : a.overskrift.includes("denna månad")
      );
      expect(dmAfsnit, sprog).toBeDefined();
      expect(dmAfsnit?.brødtekst, sprog).toContain(`31`);
      expect(dmAfsnit?.brødtekst, sprog).toContain(`29`);
    }
  });

  test("brødtekstens tal er præcis dem, oversigten regner", () => {
    for (const sprog of ["da", "se"] as const) {
      const o = maanederOversigt(sprog, I_DAG);
      const afsnit = dageIManedenAfsnit(sprog, I_DAG);
      expect(afsnit.length, sprog).toBe(4);
      const febAfsnit = afsnit[0]?.brødtekst ?? "";
      expect(febAfsnit, sprog).toContain(`${o.aar}`);
      expect(febAfsnit, sprog).toContain(`${o.maaneder[1]?.dage}`);
      const svarFeb = dageIManedenFaq(sprog, I_DAG)[0]?.answer ?? "";
      expect(svarFeb, sprog).toContain(`${o.maaneder[1]?.dage}`);
      expect(svarFeb, sprog).toContain(`${o.aar}`);
      if (o.skudaar) {
        expect(svarFeb, sprog).toMatch(/skudår|skottår/);
      } else {
        expect(svarFeb, sprog).toMatch(/ikke er et skudår|inte är ett skottår/);
      }
    }
  });

  test("sproghjælpen kender kun de to sprog, og norsk ikke har nogen side", () => {
    expect(isDageIManedenLocale("da")).toBe(true);
    expect(isDageIManedenLocale("se")).toBe(true);
    expect(isDageIManedenLocale("no")).toBe(false);
    expect(getDageIManedenPath("no")).toBeNull();
    expect(getDageIManedenPath("da")).toBe("/dage-i-maaneden");
    expect(getDageIManedenPath("se")).toBe("/dagar-i-manaden");
  });
});
