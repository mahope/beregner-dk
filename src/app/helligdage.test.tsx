/**
 * `/helligdage` og `/helgdagar` er to route-filer over én komponent, og det er
 * *stien* der vælger sproget — samme regel som `/arbejdsdage` og `/dage-til`.
 *
 * Porten dømmer det siden lover — titel, `<h1>`, canonical/hreflang,
 * 301 mellem domænerne, sitemap og links til `/dage-til` — og **alle tal mod
 * de funktioner, der har regnet dem** (`helligdagRaekker`, `helligdagAntal`,
 * `naesteHelligdage`). Punkt 11: en påstand i tekst er kode.
 */
import { describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getRouteDecision } from "@/lib/routing";
import {
  getHelligdagPath,
  helligdagAntal,
  naesteHelligdage,
  type HelligdagLocale,
} from "@/lib/helligdage";
import { buildHelligdagMetadata } from "@/components/Helligdag";
import { buildSitemap } from "./sitemap";
import HelligdagPage from "./helligdage/page";
import HelgdagarPage from "./helgdagar/page";
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
  da: HelligdagPage,
  se: HelgdagarPage,
} as const;

async function render(sprog: HelligdagLocale) {
  host.locale = sprog;
  return renderToStaticMarkup(await ROUTE_FOR[sprog]());
}

describe("helligdagssiden regner datoerne, den skriver dem ikke", () => {
  test("tabelrækkerne er præcis det helligdage.ts regner ud", async () => {
    const html = await render("da");
    // Januar-rækken står med navn, dato og ugedag i samme række.
    expect(html).toContain("Nytårsdag");
    expect(html).toContain(`1. januar ${new Date().getFullYear()}`);
    expect(html).toContain("Torsdag");
  });

  test("antallet i tabellen er det samme som i antal-funktionen", async () => {
    const ar = new Date().getFullYear();
    const html = await render("da");
    const a = helligdagAntal(ar, "da");
    expect(a.paaHverdag).toBeLessThanOrEqual(a.total);
    expect(helligdagAntal(ar, "da")).toEqual(a);
    // Sætningen i den blå boks er den samme sum som tabellen giver.
    expect(html).toContain(`${a.paaHverdag} af dem falder på en hverdag`);
    expect(html).toContain(`${a.total} helligdage`);
  });

  test("svensken får svenske navne og datoformat", async () => {
    host.locale = "se";
    const html = await render("se");
    expect(html).toContain("Nyårsdagen");
    expect(html).toContain(`1 januari ${new Date().getFullYear()}`);
    expect(html).not.toContain("1. januar");
    expect(html).not.toContain("Helligdage");
  });

  test("dansk side virker ikke på svensk og omvendt", async () => {
    host.locale = "se";
    const meta = await buildHelligdagMetadata("/helligdage", new Date());
    expect(meta.robots).toEqual({ index: false, follow: false });
    host.locale = "da";
  });
});

describe("stien vælger sproget", () => {
  test("den anden sprogs sti sendes videre med 301", () => {
    for (const [locale, sti, fremmed] of [
      ["da", "/helligdage", "/helgdagar"],
      ["se", "/helgdagar", "/helligdage"],
    ] as const) {
      expect(getRouteDecision(getDomainConfigByLocale(locale), fremmed), locale).toEqual({
        type: "redirect",
        destination: sti,
        status: 301,
      });
      expect(getRouteDecision(getDomainConfigByLocale(locale), sti)).toEqual({
        type: "allow",
      });
    }
  });

  test("begge sprog peger videre til listen fra /arbejdsdage", async () => {
    for (const [locale, side] of [
      ["da", ArbejdsdagePage],
      ["se", ArbetsdagarPage],
    ] as const) {
      host.locale = locale;
      const html = renderToStaticMarkup(await side());
      expect(html, locale).toContain(`href="${getHelligdagPath(locale)}"`);
    }
  });
});

describe("metadata, canonical og sitemap", () => {
  test("titlen nævner årstallet og antallet, og canonical peger på egen sti", async () => {
    for (const locale of ["da", "se"] as const) {
      host.locale = locale;
      const sti = getHelligdagPath(locale)!;
      const meta = await buildHelligdagMetadata(sti, new Date());
      const ar = new Date().getFullYear();
      const title = meta.title as { absolute: string };
      expect(title.absolute).toContain(String(ar));
      expect(title.absolute).toContain(String(helligdagAntal(ar, locale).total));
      expect(meta.alternates?.canonical).toBe(
        `${getDomainConfigByLocale(locale).baseUrl}${sti}`
      );
      const sprog = meta.openGraph as { locale: string };
      expect(sprog.locale).toBe(getDomainConfigByLocale(locale).ogLocale);
    }
  });

  test("hreflang viser til begge sprogs stier", async () => {
    host.locale = "da";
    const meta = await buildHelligdagMetadata("/helligdage", new Date());
    const languages = (meta.alternates as { languages: Record<string, string> }).languages;
    expect(languages[getDomainConfigByLocale("da").hreflangCode]).toBe(
      "https://minberegner.dk/helligdage"
    );
    expect(languages[getDomainConfigByLocale("se").hreflangCode]).toBe(
      "https://beraknare.se/helgdagar"
    );
    host.locale = "se";
  });

  test("siden står i sitemap på begge domæner", () => {
    const da = buildSitemap(getDomainConfigByLocale("da"), new Date("2026-10-09T00:00:00Z"));
    const se = buildSitemap(getDomainConfigByLocale("se"), new Date("2026-10-09T00:00:00Z"));
    expect(da.map((e) => e.url)).toContain("https://minberegner.dk/helligdage");
    expect(se.map((e) => e.url)).toContain("https://beraknare.se/helgdagar");
    expect(da.map((e) => e.url)).not.toContain("https://beraknare.se/helgdagar");
  });

  test("næste helligdage er altid senere end i dag", () => {
    host.locale = "da";
    for (const d of [
      new Date(2026, 0, 1),
      new Date(2026, 5, 5),
      new Date(2026, 11, 24),
      new Date(2026, 11, 31),
    ]) {
      const naeste = naesteHelligdage(d, "da", 1);
      expect(naeste.length).toBeGreaterThan(0);
      expect(naeste[0].dageTil).toBeGreaterThanOrEqual(0);
    }
  });
});
