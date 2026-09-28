import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import TidszonePage from "./page";

vi.mock("@/components/TidszoneBeregner", () => ({
  default: () => <div>Tidszoneværktøj</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

describe("tidszone page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Når det er 12 i Danmark, er det 06 i New York",
      lead: "Klokken 12 i Danmark er",
      row: "<td>New York</td>",
      values: "<td>06:00</td>",
      tableHeader: "Vintertid (kl. 12 CET)",
    },
    {
      locale: "se" as const,
      heading: "När det är 12 i Sverige är det 06 i New York",
      lead: "Klockan 12 i Sverige är",
      row: "<td>New York</td>",
      values: "<td>06:00</td>",
      tableHeader: "Vintertid (kl. 12 CET)",
    },
  ])("viser det konkrete svar og beregneren i $locale", async ({ locale, heading, lead, row, values, tableHeader }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await TidszonePage());

    expect(html).toContain(`>${heading}<`);
    expect(html).toContain(lead);
    expect(html).toContain(tableHeader);
    expect(html).toContain(row);
    expect(html).toContain(values);
    expect(html).toContain("Tidszoneværktøj");
  });

  test.each(["da", "se"] as const)(
    "metadata i %s svarer direkte paa tidsspoergsmaalet",
    (locale) => {
      const pageData = getPageData("tidszone", locale);
      expect(pageData).toBeDefined();
      const metaTitle = pageData!.metaTitle;
      const metaDescription = pageData!.metaDescription;

      expect(metaTitle.length).toBeLessThanOrEqual(60);
      expect(metaDescription.length).toBeLessThanOrEqual(160);
      expect(metaTitle).toMatch(/USA/);
      expect(metaTitle).toMatch(/12/);
      expect(metaDescription).toMatch(/New York/);
      expect(pageData!.ogTitle).toMatch(/New York/);
      expect(pageData!.schemaDescription).toBeTruthy();
    }
  );
});

describe("tidszone svar-først-tabeller for lande og Excel", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      landeHeading: "Tidsforskel til de lande, folk spørger om",
      excelHeading: "Sådan regner du tidsforskel ud i Excel",
      lande: ["<td class=\"py-2 pr-4\">Japan</td>", "<td class=\"py-2 pr-4\">Tyrkiet</td>", "<td class=\"py-2 pr-4\">Spanien</td>", "<td class=\"py-2 pr-4\">USA</td>"],
      vinter: "<td class=\"py-2 pr-4\">6 timer bagefter</td>",
      sommerUdenSommertid: "<td class=\"py-2 pr-4\">7 timer frem</td>",
      sommerSamme: "Samme som vintertid",
      formel: "=B1-A1",
      forbudt: ["Samma som vintertid"],
    },
    {
      locale: "se" as const,
      landeHeading: "Tidsskillnad till de länder folk frågar om",
      excelHeading: "Så räknar du ut tidsskillnad i Excel",
      lande: ["<td class=\"py-2 pr-4\">Japan</td>", "<td class=\"py-2 pr-4\">Turkiet</td>", "<td class=\"py-2 pr-4\">Spanien</td>", "<td class=\"py-2 pr-4\">USA</td>"],
      vinter: "<td class=\"py-2 pr-4\">6 timmar bakåt</td>",
      sommerUdenSommertid: "<td class=\"py-2 pr-4\">7 timmar framåt</td>",
      sommerSamme: "Samma som vintertid",
      formel: "=B1-A1",
      forbudt: [],
    },
  ])(
    "$locale svarer på tidsforskel pr. land og i Excel",
    async ({ locale, landeHeading, excelHeading, lande, vinter, sommerUdenSommertid, sommerSamme, formel }) => {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

      const html = renderToStaticMarkup(await TidszonePage());

      expect(html).toContain(landeHeading);
      expect(html).toContain(excelHeading);
      for (const land of lande) {
        expect(html).toContain(land);
      }
      expect(html).toContain(vinter);
      expect(html).toContain(sommerUdenSommertid);
      expect(html).toContain(sommerSamme);
      expect(html).toContain(formel);
      expect(html).toContain("=(B1-A1)*24");
      // React escaper " som &quot; i markupken.
      expect(html).toContain("=DATEDIF(A1;B1;&quot;h&quot;)");
      expect(html).toContain("=B1-A1+(B1&lt;A1)");
    }
  );

  test("den svenska landetabel bruger svenska landnamn, ikke danske", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await TidszonePage());

    expect(html).toContain("<td class=\"py-2 pr-4\">Grekland</td>");
    expect(html).toContain("<td class=\"py-2 pr-4\">Turkiet</td>");
    expect(html).not.toContain("<td class=\"py-2 pr-4\">Grækenland</td>");
    expect(html).not.toContain("<td class=\"py-2 pr-4\">Tyrkiet</td>");
  });

  test("hver sproggren har præcis sin egen enhed, ikke den andens", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const se = renderToStaticMarkup(await TidszonePage());

    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
    const da = renderToStaticMarkup(await TidszonePage());

    expect(se).toContain("timmar");
    expect(se).toContain("framåt");
    expect(se).toContain("bakåt");
    // "framat" er ikke et svenskt ord — fundet fordi testen faldt paa det.
    expect(se).not.toContain("framat");
    expect(se).not.toContain("timer bagefter");
    expect(se).not.toContain("timer frem");
    expect(da).toContain("timer frem");
    expect(da).not.toContain("timmar");
  });

  test("begge sprog har nu faq-spørgsmål om lande, sommertid og Excel", () => {
    for (const locale of ["da", "se"] as const) {
      const faq = getPageData("tidszone", locale)!.faqItems;
      const spg = faq.map((f) => f.question);
      const svar = faq.map((f) => f.answer).join(" ");

      // C120's lære: et tal i en test bliver en ny målefejl, når næste
      // rettelse tilføjer et spørgsmål. Lås pariteten og indholdet i stedet.
      expect(faq.length).toBe(getPageData("tidszone", locale === "da" ? "se" : "da")!.faqItems.length);
      // Én spørgsmål der spørger på forskellen til landene, ikke bare på
      // klokkeslættet i dem.
      expect(
        spg.filter((q) => /Japan/.test(q) && /(forskel|skillnad)/.test(q)).length
      ).toBe(1);
      expect(spg.some((q) => /Excel/.test(q))).toBe(true);
      expect(svar).toContain("=B1-A1");
      // C120's lære: et negativt lås på den danske streng er et lås på
      // tilstanden før rettelsen, så der kræves de positive i stedet.
      if (locale === "se") {
        expect(faq.some((f) => /Turkiet/.test(f.question))).toBe(true);
        expect(faq.some((f) => /varför skiljer sig/i.test(f.question))).toBe(true);
      } else {
        expect(faq.some((f) => /Tyrkiet/.test(f.question))).toBe(true);
        expect(faq.some((f) => /Hvorfor er der forskel/.test(f.question))).toBe(true);
      }
    }
  });

  test("svarene i faq'en er de samme tal som tabellen på siden", () => {
    for (const locale of ["da", "se"] as const) {
      const faq = getPageData("tidszone", locale)!.faqItems;
      const svar = faq.find((f) => /Japan/.test(f.question) && /(forskel|skillnad)/.test(f.question))!.answer;
      // Japan: 7 timer frem i dansk/svensk sommertid, 8 om vinteren.
      // Dansk siger "frem", svensk siger "framåt" — begge er korrekte,
      // saa formen laases pr. sprog og ikke som én regex paa tværs.
      if (locale === "se") {
        expect(svar).toMatch(/7 timmar framåt/);
      } else {
        expect(svar).toMatch(/7 timer frem/);
      }
      // Svensk siger "aerv" og "och", dansk "er" og "og". Laas pr. sprog:
      // en regex paa tvaers gennem sprogene gaar altid falsk paa den ene.
      if (locale === "se") {
        expect(svar).toContain("I vintertid är det 8, 7 och 3 timmar");
      } else {
        expect(svar).toContain("I vintertid er det 8, 7 og 3 timer");
      }
    }
  });
});
