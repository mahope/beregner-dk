/**
 * `/arbejdsdage` og `/arbetsdagar` er to route-filer over én komponent, og det
 * er *stien* der vælger sproget — samme regel som `/dage-i-aaret`,
 * `/timer-i-aret` og `/dage-til`. En test der kun importerer den danske kan
 * derfor ikke se den svenske side, så begge ruter testes.
 *
 * Porten dømmer det siden *lover* — titel, `<h1>`, de målte søgninger som
 * `FAQPage`, canonical/hreflang, 301 mellem domænerne, sitemap og tovejslinket
 * fra `/dage-i-aaret` — og **alle tal mod de funktioner, der har regnet dem**.
 * Punkt 11: en påstand i tekst er kode. Arbejdsdagene skal komme fra
 * `helligdage.ts` via `dato-eksempler.ts`, ikke fra en ny konstant her.
 */
import { describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getRouteDecision } from "@/lib/routing";
import { aarstal, maanederITaar } from "@/lib/dato-eksempler";
import {
  ARBEJDSDAGE_PATH,
  arbejdsdageCopy,
  arbejdsdageFaq,
  arbejdsdageOversigt,
  getArbejdsdagePath,
  isArbejdsdageLocale,
  type ArbejdsdageLocale,
} from "@/lib/arbejdsdage";
import { buildArbejdsdageMetadata } from "@/components/Arbejdsdage";
import { buildSitemap } from "./sitemap";
import ArbejdsdagePage from "./arbejdsdage/page";
import ArbetsdagarPage from "./arbetsdagar/page";

vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
type Spg = { question: string; answer: string }[];
vi.mock("@/components/FAQ", () => ({
  default: ({ items }: { items: Spg }) => (
    <div data-testid="faq">
      {items.map((i) => (
        <p key={i.question}>
          {i.question} {i.answer}
        </p>
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
  da: ArbejdsdagePage,
  se: ArbetsdagarPage,
} as const;

/** 2026-10-03. Fast klokkeslæt, så «arbejdsdage tilbage» kan måles. */
const I_DAG = new Date("2026-10-03T12:00:00.000Z");

async function render(sprog: ArbejdsdageLocale) {
  host.locale = sprog;
  return renderToStaticMarkup(await ROUTE_FOR[sprog]());
}

describe("arbejdsdagene regnes, ikke skrives", () => {
  test("2026 har 365 dage, 251 arbejdsdage og 104 weekenddage", () => {
    // Målt mod kalenderen: 2026 har 365 dage, 104 weekenddage og 251
    // arbejdsdage, altså 10 hverdage der ikke er arbejdsdage (helligdage og
    // nytårsaften).
    const o = arbejdsdageOversigt("da", I_DAG);
    expect(o.aar).toBe(2026);
    expect(o.dage).toBe(365);
    expect(o.arbejdsdage).toBe(251);
    expect(o.weekenddage).toBe(104);
    expect(aarstal(2026, "da").arbejdsdage).toBe(251);
  });

  test("summen af månedernes arbejdsdage er årets arbejdsdage", () => {
    const o = arbejdsdageOversigt("da", I_DAG);
    const sum = o.maaneder.reduce((s, m) => s + m.arbejdsdage, 0);
    expect(sum).toBe(o.arbejdsdage);
    expect(o.maaneder).toHaveLength(12);
    expect(o.maaneder).toEqual(
      maanederITaar(2026, "da").map((m) => ({
        ...m,
        helligdage: expect.any(Number),
      }))
    );
  });

  test("«arbejdsdage tilbage» tæller i dag med og falder frem mod jul", () => {
    const o = arbejdsdageOversigt("da", I_DAG);
    // 3. oktober 2026 er en lørdag, så tilbage er de arbejdsdage, der følger.
    expect(o.arbejdsdageTilbage).toBeGreaterThan(50);
    expect(o.arbejdsdageTilbage).toBeLessThan(o.arbejdsdage);
    const nytarsaften = arbejdsdageOversigt("da", new Date("2026-12-31T12:00:00Z"));
    expect(nytarsaften.arbejdsdageTilbage).toBe(0);
  });

  test("«et år minus ferie» trækker fem arbejdsdage pr. ferieuge fra", () => {
    const o = arbejdsdageOversigt("da", I_DAG);
    expect(o.ferie).toEqual([
      { uger: 5, dage: 25, arbejdsdage: 251 - 25 },
      { uger: 6, dage: 30, arbejdsdage: 251 - 30 },
    ]);
  });

  test("hvert svar i FAQ'en er regnet af den samme oversigt", () => {
    const o = arbejdsdageOversigt("da", I_DAG);
    const tekst = arbejdsdageFaq("da", I_DAG)
      .map((f) => `${f.question} ${f.answer}`)
      .join(" ");
    expect(tekst).toContain("251");
    expect(tekst).toContain(`${o.arbejdsdageTilbage}`);
    expect(arbejdsdageFaq("da", I_DAG)[3].answer).toContain(`${251 - 25}`);
  });
});

describe("copy og sprogvalg", () => {
  test("title og description er ikke tomme og er under 160 tegn", () => {
    for (const sprog of ["da", "se"] as const) {
      const c = arbejdsdageCopy[sprog];
      expect(c.title.length, `${sprog} title`).toBeGreaterThan(0);
      expect(c.title.length, `${sprog} title`).toBeLessThanOrEqual(160);
      expect(c.description.length, `${sprog} description`).toBeGreaterThan(0);
      expect(c.description.length, `${sprog} description`).toBeLessThanOrEqual(160);
    }
  });

  test("kun da og se har en sti; norsk er ikke i drift", () => {
    expect(getArbejdsdagePath("da")).toBe("/arbejdsdage");
    expect(getArbejdsdagePath("se")).toBe("/arbetsdagar");
    expect(getArbejdsdagePath("no")).toBeNull();
    expect(isArbejdsdageLocale("no")).toBe(false);
  });

  test("begge domæner sender den anden sprogs sti med 301", () => {
    for (const [locale, sti, fremmed] of [
      ["da", "/arbejdsdage", "/arbetsdagar"],
      ["se", "/arbetsdagar", "/arbejdsdage"],
    ] as const) {
      const config = getDomainConfigByLocale(locale);
      expect(getRouteDecision(config, fremmed), `${locale}: ${fremmed}`).toEqual({
        type: "redirect",
        destination: sti,
        status: 301,
      });
      expect(getRouteDecision(config, sti), `${locale}: ${sti}`).toEqual({
        type: "allow",
      });
    }
  });

  test("canonical og hreflang peger på hvert sit domæne", async () => {
    for (const sprog of ["da", "se"] as const) {
      host.locale = sprog;
      const meta = await buildArbejdsdageMetadata(ARBEJDSDAGE_PATH[sprog], I_DAG);
      const canonical = `${getDomainConfigByLocale(sprog).baseUrl}${ARBEJDSDAGE_PATH[sprog]}`;
      expect(meta.alternates?.canonical, sprog).toBe(canonical);
      const languages = meta.alternates?.languages as Record<string, string>;
      expect(languages[getDomainConfigByLocale("da").hreflangCode]).toBe(
        `${getDomainConfigByLocale("da").baseUrl}/arbejdsdage`
      );
      expect(languages[getDomainConfigByLocale("se").hreflangCode]).toBe(
        `${getDomainConfigByLocale("se").baseUrl}/arbetsdagar`
      );
      expect(languages["x-default"]).toBe(
        `${getDomainConfigByLocale("da").baseUrl}/arbejdsdage`
      );
    }
  });

  test("den anden sprogs sti på sit eget domæne giver noindex", async () => {
    host.locale = "da";
    const meta = await buildArbejdsdageMetadata("/arbetsdagar", I_DAG);
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  test("begge URL'er ligger i hvert sit sitemap med daily", () => {
    for (const sprog of ["da", "se"] as const) {
      const config = getDomainConfigByLocale(sprog);
      const sti = ARBEJDSDAGE_PATH[sprog];
      const entry = buildSitemap(config).find(
        (e) => e.url === `${config.baseUrl}${sti}`
      );
      expect(entry, `${sprog}: ${sti}`).toBeDefined();
      expect(entry?.changeFrequency, `${sprog}: ${sti}`).toBe("daily");
    }
  });
});

describe("siden viser tabellen og linker tilbage", () => {
  test("dansk side viser arbejdsdage, ferie-tabellen og søstersiderne", async () => {
    const html = await render("da");
    expect(html).toContain("Hvor mange arbejdsdage er der på et år?");
    expect(html).toContain("Arbejdsdage i hver måned");
    expect(html).toContain("Et år minus ferie");
    expect(html).toContain('href="/dage-i-aaret"');
    expect(html).toContain('href="/timer-i-aret"');
  });

  test("svensk side skriver svensk og bruger de svenske stier", async () => {
    const html = await render("se");
    expect(html).toContain("Hur många arbetsdagar är det på ett år?");
    expect(html).toContain("Arbetsdagar i varje månad");
    expect(html).toContain('href="/dagar-i-aret"');
    expect(html).not.toContain("Hvor mange arbejdsdage");
  });
});
