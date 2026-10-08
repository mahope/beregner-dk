/**
 * `/uger-i-aret` og `/veckor-i-aret` er to route-filer over én komponent, og det
 * er *stien* der vælger sproget — samme regel som `/timer-i-aret`,
 * `/dage-i-aaret` og `/arbejdsdage`. En test der kun importerer den danske kan
 * derfor ikke se den svenske side, så begge ruter testes.
 *
 * Porten dømmer det siden *lover* — titel, `<h1>`, de fem målte søgninger som
 * `FAQPage`, canonical/hreflang, 301 mellem domænerne og sitemap — og at
 * tabellerne er regnet af `ugerOversigt`, ikke skrevet i hånden. Punkt 11: en
 * påstand i tekst er kode.
 */
import { readFileSync } from "node:fs";
import { describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getRouteDecision } from "@/lib/routing";
import {
  isUgerLocale,
  ugerCopy,
  ugerFaq,
  ugerOversigt,
  UGER_I_ARET_PATH,
  type UgerLocale,
} from "@/lib/uger-i-aret";
import { buildUgerIAaretMetadata } from "@/components/UgerIAaret";
import { buildSitemap } from "./sitemap";
import UgerIAaretPage from "./uger-i-aret/page";
import VeckorIAaretPage from "./veckor-i-aret/page";

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
  da: UgerIAaretPage,
  se: VeckorIAaretPage,
} as const;

/** 2026-06-15. Fast klokkeslæt, så tabellen kan måles mod kalenderen. */
const I_DAG = new Date("2026-06-15T12:00:00.000Z");

async function render(sprog: UgerLocale) {
  host.locale = sprog;
  return renderToStaticMarkup(await ROUTE_FOR[sprog]());
}

const SPOERGSMAAL: Record<UgerLocale, string> = {
  da: "hvor mange uger er der på et år",
  se: "hur många veckor är det på ett år",
};

describe("uger i et år: siden peger på sit eget spørgsmål", () => {
  test("begge sprog har egen sti, egen titel og egen h1", async () => {
    for (const sprog of ["da", "se"] as const) {
      const c = ugerCopy[sprog];
      expect(UGER_I_ARET_PATH[sprog], sprog).toBe(
        sprog === "da" ? "/uger-i-aret" : "/veckor-i-aret"
      );
      expect(c.title.toLowerCase(), sprog).toContain(SPOERGSMAAL[sprog]);
      expect(c.h1.toLowerCase(), sprog).toBe(`${SPOERGSMAAL[sprog]}?`);
      const html = await render(sprog);
      expect(html.match(/<h1[ >]/g)?.length, sprog).toBe(1);
      expect(c.description.length, sprog).toBeLessThanOrEqual(160);
      // Copy uden årstal: et frosset «2026» i titlen eller beskrivelsen ville
      // være et tal der bliver forkert næste år.
      expect(`${c.title}${c.description}${c.lead}`, sprog).not.toMatch(/20\d\d/);
    }
  });

  test("de fem målte spørgsmål står som FAQPage i begge sprog", async () => {
    for (const sprog of ["da", "se"] as const) {
      const html = await render(sprog);
      // FAQ-svaret indeholder en nedtælling til jul, så det regnes af samme
      // «nu» som ruten brugte. De øvrige svar er datouafhængige.
      const faq = ugerFaq(sprog, new Date());
      expect(faq, sprog).toHaveLength(5);
      for (const spg of faq) {
        expect(html, `${sprog}/${spg.question}`).toContain(spg.question);
        expect(html, `${sprog}/${spg.question}`).toContain(spg.answer);
      }
      expect(
        html.includes(`"${faq[0].question}"`),
        `${sprog}: spørgsmålet skal være i JSON-LD`
      ).toBe(true);
      expect(html, sprog).not.toContain("NaN");
    }
  });
});

describe("alle ugetal er regnet, ikke skrevet", () => {
  test("hver periode og hver måned summer til sit dagtal", () => {
    for (const sprog of ["da", "se"] as const) {
      const o = ugerOversigt(sprog, I_DAG);
      expect(o.uger * 7 + o.restDage, sprog).toBe(o.dage);
      for (const raekke of o.perioder) {
        expect(raekke.uger * 7 + raekke.restDage, `${sprog}/${raekke.id}`).toBe(
          raekke.dage
        );
      }
      for (const m of o.maaneder) {
        expect(m.uger * 7 + m.restDage, `${sprog}/${m.maaned.name}`).toBe(
          m.maaned.dage
        );
      }
    }
  });

  test("tabellen viser de regnede tal i begge sprog", async () => {
    for (const sprog of ["da", "se"] as const) {
      const o = ugerOversigt(sprog, I_DAG);
      const html = await render(sprog);
      for (const raekke of o.perioder) {
        expect(html, `${sprog}/${raekke.id}`).toContain(raekke.navn);
      }
      // Årsrækken og summationsrækken skal vise 52 uger.
      expect(html, sprog).toContain("52");
      expect(html, sprog).toContain(`${o.dage}`);
    }
  });
});

describe("stien *er* sprogvalget", () => {
  test("begge domæner sender den anden sprogs sti med 301", () => {
    for (const [locale, sti, fremmed] of [
      ["da", "/uger-i-aret", "/veckor-i-aret"],
      ["se", "/veckor-i-aret", "/uger-i-aret"],
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

  test("norsk domæne får ingen tredje kopi", () => {
    expect(isUgerLocale("no")).toBe(false);
    for (const sti of ["/uger-i-aret", "/veckor-i-aret"]) {
      const afgør = getRouteDecision(getDomainConfigByLocale("no"), sti);
      expect(["not-found", "redirect"], sti).toContain(afgør.type);
    }
  });

  test("canonical og hreflang peker på hvert sit eget domæne", async () => {
    for (const sprog of ["da", "se"] as const) {
      host.locale = sprog;
      const meta = await buildUgerIAaretMetadata(UGER_I_ARET_PATH[sprog], I_DAG);
      const canonical = `${getDomainConfigByLocale(sprog).baseUrl}${UGER_I_ARET_PATH[sprog]}`;
      expect(meta.alternates?.canonical, sprog).toBe(canonical);
      const languages = meta.alternates?.languages as Record<string, string>;
      expect(languages[getDomainConfigByLocale("da").hreflangCode]).toBe(
        `${getDomainConfigByLocale("da").baseUrl}/uger-i-aret`
      );
      expect(languages[getDomainConfigByLocale("se").hreflangCode]).toBe(
        `${getDomainConfigByLocale("se").baseUrl}/veckor-i-aret`
      );
      expect(languages["x-default"]).toBe(
        `${getDomainConfigByLocale("da").baseUrl}/uger-i-aret`
      );
      expect(meta.robots, sprog).toBeUndefined();
    }
  });

  test("den anden sprogs sti på sit eget domæne giver noindex", async () => {
    host.locale = "da";
    const meta = await buildUgerIAaretMetadata("/veckor-i-aret", I_DAG);
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  test("begge URL'er ligger i hvert sit eget sitemap med daily", async () => {
    for (const sprog of ["da", "se"] as const) {
      const sitemap = await buildSitemap(getDomainConfigByLocale(sprog));
      const sti = UGER_I_ARET_PATH[sprog];
      const entry = sitemap.find(
        (e) => e.url === `${getDomainConfigByLocale(sprog).baseUrl}${sti}`
      );
      expect(entry, `${sprog}: ${sti}`).toBeDefined();
      expect(entry?.changeFrequency, sti).toBe("daily");
      const fremmed = UGER_I_ARET_PATH[sprog === "da" ? "se" : "da"];
      expect(
        sitemap.some((e) => e.url.endsWith(fremmed)),
        `${sprog}: ${fremmed}`
      ).toBe(false);
    }
  });
});

describe("tovejslink", () => {
  test("/ugenummer linker til uger i året", () => {
    const kilde = readFileSync("src/app/ugenummer/page.tsx", "utf-8");
    expect(kilde).toContain('href="/uger-i-aret"');
  });

  test("siden linker videre til søstersiderne og ikke til sig selv", async () => {
    for (const sprog of ["da", "se"] as const) {
      const html = await render(sprog);
      expect(html, sprog).toContain('href="/dato"');
      expect(html, sprog).not.toContain(`href="${UGER_I_ARET_PATH[sprog]}"`);
    }
  });
});
