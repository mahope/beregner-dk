import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getDageTilSlugs, getDageTilEvents, getDageTilAnswer, dageTilArm, formatTargetDate } from "@/lib/dage-til";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { excelEksempel } from "@/lib/nedtaelling-eksempler";
import { getPageData } from "@/lib/page-data";
import NedtaellingPage from "./page";

vi.mock("@/components/NedtaellingBeregner", () => ({
  default: () => <div>Nedtællingsværktøj</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null, ArticleSchema: () => null }));

vi.mock("@/lib/get-locale", () => ({
  getCurrentDomainConfig: vi.fn(),
}));

const render = async (locale: "da" | "se" | "no") => {
  vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
  return renderToStaticMarkup(await NedtaellingPage());
};

describe("nedtaelling page", () => {
  beforeEach(() => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Hvor mange dage er der til en dato?",
      example: "100 dage",
      weeks: "14 uger",
    },
    {
      locale: "se" as const,
      heading: "Hur många dagar är det kvar till ett datum?",
      example: "100 dagar",
      weeks: "14 veckor",
    },
  ])(
    "viser svaret i dage og uger og bevarer værktøjet i $locale",
    async ({ locale, heading, example, weeks }) => {
      const html = await render(locale);

      expect(html).toContain(`>${heading}</h1>`);
      expect(html).toContain(example);
      expect(html).toContain(weeks);
      expect(html).toContain("Nedtællingsværktøj");
    }
  );

  test("dansk side linker til alle dage-til-sider og videre til /dato", async () => {
    const html = await render("da");

    for (const slug of getDageTilSlugs("da")) {
      expect(html, slug).toContain(`href="/dage-til/${slug}"`);
    }
    expect(html).toContain('href="/dato"');
  });

  test("svensk side bruger svenska slugs", async () => {
    const html = await render("se");

    for (const slug of getDageTilSlugs("se")) {
      expect(html, slug).toContain(`href="/dagar-till/${slug}"`);
    }
    expect(html).not.toContain("/dage-til/");
  });

  test("norsk domaene faar ingen dage-til-links", async () => {
    const html = await render("no");

    expect(html).not.toContain("/dage-til/");
    expect(html).not.toContain("/dagar-till/");
  });

  test("svensk side svarar pa 'nedrakning dagar excel' med DATEDIF og semikolon", async () => {
    const html = await render("se");

    expect(html).toContain("Så räknar du ut dagar kvar i Excel");
    expect(html).toContain("=DATEDIF(IDAG();A1;&quot;d&quot;)");
    expect(html).toContain("=DATEDIF(A1;IDAG();&quot;d&quot;)");
    expect(html).toContain("#NUM!");
    expect(html).toContain("ett dolt namn");
    expect(html).toContain('href="/dato"');
  });

  test("svensk side svarar pa 'nedrakning dagar timmar minuter sekunder'", async () => {
    const html = await render("se");

    expect(html).toContain("Timmar, minuter och sekunder kvar");
    expect(html).toContain("=(A1−IDAG())*24");
    expect(html).toContain("=MOD(A1−IDAG();1)*1440");
    expect(html).toContain("formateras som Tal");
  });

  test("alle tal i Excel-blokken kommer fra eksempelmodulet", async () => {
    const html = await render("se");
    const e = excelEksempel();
    const se = (n: number) => new Intl.NumberFormat("sv-SE").format(n);

    for (const tal of [e.dage, e.helaDagarTimmar, e.minuter, e.sekunder]) {
      expect(html, String(tal)).toContain(se(tal));
    }
    expect(html).toContain(
      se(Math.floor(e.minuter / 60))
    );
  });

  test("dansk side har ikke Excel-blokken — klyngen er kun maldt i svensk", async () => {
    const html = await render("da");

    expect(html).not.toContain("DATEDIF");
    expect(html).not.toContain("Så räknar du ut dagar kvar i Excel");
  });

  test("svensk side har ingen dansk laekage i Excel-blokken", async () => {
    const html = await render("se");

    // Ord-grænser: "dagens" og "dagen" er rigtigt svensk, og "dagar-till/"
    // er slugs — et substring-søg på "dage" giver derfor falske fund
    // (samme målefejl-klasse som C121's "bakåt"/"när").
    for (const dansk of ["hvad", "vælg", "hvor", "hvilken", "beregn", "ud fra", "dage", "uger"]) {
      expect(html, dansk).not.toMatch(new RegExp(`\\b${dansk}\\b`, "i"));
    }
  });

  // «använna» er ikke dansk, men den bestemte form af «använda» — en
  // stavemådefejl, som hverken `locale-leak.mjs` (æ/ø) eller
  // `rendered-leak-scan.mjs` (æ/ø + en ordliste) kan se. Den lå i den
  // krydsreference til /dato, som er det sidste en svensk læser læser.
  test("svensk krydsreference til /dato bruger verbet i grundform", async () => {
    const html = await render("se");

    expect(html).toMatch(/kan du använda\s*<a href="\/dato"/);
    expect(html).not.toMatch(/\banvänna\b/);
  });

  test("begge sprog har de to nye spørgsmaal i sidens egen svarsdatasæt", () => {
    const se = getPageData("nedtaelling", "se")!;
    const da = getPageData("nedtaelling", "da")!;

    expect(se.faqItems.some((f) => f.question.includes("Excel"))).toBe(true);
    expect(se.faqItems.some((f) => f.answer.includes("86400"))).toBe(true);
    expect(da.faqItems.some((f) => f.question.includes("Excel"))).toBe(false);
  });
});

// Samme mønster som på `/dato`: listen linkede til de 15 datoer med
// spørgsmålsteksten alene. Svensk GSC har "nedrækning dagar" (183
// visninger, pos. 9) og "hur många dagar är det kvar till 1 november"
// (19, pos. 5) — begge spørger efter et tal.
describe("nedtaelling page — dage-til-listen svarer selv", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-29T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("hver række i listen bærer dagens antal og datoen", async () => {
    const html = await render("da");

    expect(html).toContain("Tallet nedenfor er dagens antal dage");
    for (const event of getDageTilEvents("da")) {
      const answer = getDageTilAnswer(event, "da", new Date());
      const target = formatTargetDate(answer.targetDate, "da");
      const li = new RegExp(
        `href="/dage-til/${dageTilArm(event, "da").slug}".*?${target}.*?${answer.days} dage`,
        "s",
      );
      expect(html, event.id).toMatch(li);
    }
  });

  test("listens tal er de samme som undersidens eget svar", async () => {
    const december = getDageTilEvents("da").find((e) => dageTilArm(e, "da").slug === "1-december")!;
    expect(getDageTilAnswer(december, "da", new Date()).days).toBe(63);

    const html = await render("da");

    expect(html).toContain("<strong>63 dage</strong>");
    expect(html).toContain("9 uger");
  });

  test("antallet følger dagen, så listen kan ikke stå med gårsdags svar", async () => {
    const foer = await render("da");
    vi.setSystemTime(new Date("2026-09-30T12:00:00Z"));
    const senere = await render("da");

    expect(foer).toContain("<strong>63 dage</strong>");
    expect(senere).toContain("<strong>62 dage</strong>");
    expect(senere).not.toContain("<strong>63 dage</strong>");
  });

  test("se skriver dagar och veckor — aldrig dage", async () => {
    const html = await render("se");

    expect(html).toContain("Talet nedan är dagens antal dagar");
    expect(html).toMatch(/href="\/dagar-till\/1-december"[\s\S]*?1 december 63 dagar/);
    expect(html).toContain("9 veckor");
    expect(html).not.toMatch(/\d+ dage(?![a-zåäö])/);
  });

  test("norsk domaene faar ingen dage-til-rækker og ingen talsvar", async () => {
    const html = await render("no");

    expect(html).not.toContain("/dage-til/");
    expect(html).not.toContain("Tallet nedenfor er dagens antal dage");
  });
});
