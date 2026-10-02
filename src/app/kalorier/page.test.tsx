import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { kaloriePrAlderRaekker, kaloriePrDagRaekker } from "@/lib/makroer";
import { formatBelob, formatNumber } from "@/lib/format";
import KalorierPage from "./page";

vi.mock("@/components/KalorieBeregner", () => ({
  default: () => <div>Kalorieværktøj</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null, ArticleSchema: () => null }));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

describe("kalorier page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Kalorieberegner",
      question: "Hvor mange kalorier skal du have om dagen?",
      tdee: `TDEE ${formatBelob(2759, "da")} kcal ved moderat aktivitet`,
    },
    {
      locale: "se" as const,
      heading: "Kalorikalkylator",
      question: "Hur många kalorier behöver du per dag?",
      tdee: `TDEE ${formatBelob(2759, "se")} kcal vid måttlig aktivitet`,
    },
  ])("viser det konkrete kaloriebehov og beregneren i $locale", async ({ locale, heading, question, tdee }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await KalorierPage());

    expect(html).toContain(`<h1 class="text-3xl font-bold mb-2">${heading}</h1>`);
    expect(html).toContain(question);
    expect(html).toContain(tdee);
    expect(html).toContain("Kalorieværktøj");
  });

  test("svarer på 'kalorier pr dag' med en tabel af værkøjets egne tal", async () => {
    const html = renderToStaticMarkup(await KalorierPage());

    expect(html).toContain("<h2>Hvor mange kalorier pr dag?</h2>");
    expect(html).toContain("180 cm og 30 år");
    // De fire rækker: 60, 70, 80 og 90 kg
    for (const vaegt of ["60", "70", "80", "90"]) {
      expect(html).toContain(`<td>${vaegt} kg</td>`);
    }
    // 80 kg mand er det eksempel siden allerede bruger i sin egen tekst
    expect(html).toContain("<td>2.759 kcal</td>");
    expect(html).toContain("<td>2.259 kcal</td>");
    expect(html).toContain('href="/vaegttab"');
    expect(html).toContain('href="/motion-kalorier"');
  });

  test("har de nye spoergsmaal i page-data, saa de ogsaa kommer i JSON-LD", async () => {
    const data = getPageData("kalorier", "da")!;
    const questions = data.faqItems.map((f) => f.question);

    expect(questions).toContain("Hvor mange kalorier skal jeg have?");
    expect(questions).toContain("Hvor mange kalorier skal jeg forbrænde for at tabe 1 kg?");
    expect(questions).toContain("Er kalorieberegneren gratis?");
    // De nye svar skal ikke tale om BMR og TDEE, men svare paa spoergsmaalet
    const svar = data.faqItems.find((f) => f.question === "Hvor mange kalorier skal jeg have?")!;
    expect(svar.answer).toContain("2.502 kcal");
  });
});

/**
 * Den svenska sidan manglede hele svaret paa sin egen sokeklynge: "kaloribehov
 * per dag" (autocomplete nr. 2, GSC 24 visninger paa pos 43) og "kaloribehov
 * kvinna NN ar", hvor 7 af 10 variationer under "kaloribehov kvinna" ar en
 * alder. Den danska halvdel har vaegttabellen, den svenska havde 0 tabeller.
 */
describe("kalorier side - det svenska svaret paa kaloribehovet", () => {
  // Samme formattering som siden bruger - ellers slaar testen paa tusindtalsseparatoren
  const dec = (vaerdi: number) => formatNumber(vaerdi, "se", { maximumFractionDigits: 1 });

  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
  });

  test("tabeller svarar paa 'kaloribehov per dag' med vaerktojets egne tal", async () => {
    const html = renderToStaticMarkup(await KalorierPage());

    expect(html).toContain("<h2>Hur många kalorier per dag?</h2>");
    for (const raekke of kaloriePrDagRaekker()) {
      expect(html).toContain(`<td>${dec(raekke.vaegtKg)} kg</td>`);
      expect(html).toContain(`<td>${dec(raekke.kvinde)} kcal</td>`);
    }
    // 80 kg-raden er de tal sidan redan loeverar i sin egen text och FAQ.
    // Svenskt talformat har mellanslag i stedet for punktum, saa tallene laeses
    // fra modulet gennem samma formatter - ellers slaar testen paa notationen.
    const vaegt80 = kaloriePrDagRaekker([80])[0];
    expect(html).toContain(`<td>${dec(vaegt80.mand)} kcal</td>`);
    expect(html).toContain(`<td>${dec(vaegt80.kvinde)} kcal</td>`);
    expect(html).toContain(`<td>${dec(vaegt80.tabMand)} kcal</td>`);
    // Og de er de samme tal som den danske side og FAQ'en lover — skrevet med
    // den separator svensk bruger, ellers slaar testen paa notationen.
    expect(getPageData("kalorier", "se")!.description).toContain(
      `TDEE ${formatBelob(2759, "se")} kcal`,
    );
    const behovSvar = getPageData("kalorier", "se")!.faqItems.find(
      (f) => f.question === "Hur många kalorier behöver jag?",
    )!;
    expect(behovSvar.answer).toContain(formatBelob(2502, "se"));
    expect(behovSvar.answer).not.toMatch(/\d\.\d{3}/);
    expect(html).toContain('href="/vaegttab"');
    expect(html).toContain('href="/motion-kalorier"');
  });

  test("tabellen efter alder svarar paa de aldrar søgningen spørger om", async () => {
    const html = renderToStaticMarkup(await KalorierPage());

    expect(html).toContain("<h2>Kaloribehov efter ålder</h2>");
    for (const alder of [40, 50, 60, 65, 70, 80]) {
      expect(html).toContain(`<td>${alder} år</td>`);
    }
    for (const raekke of kaloriePrAlderRaekker()) {
      expect(html).toContain(`<td>${dec(raekke.kvinde)} kcal</td>`);
    }
  });

  test("kryssjekker alderstabellen mod vaegttabellen, saa de ikke kan glide fra hinanden", async () => {
    const html = renderToStaticMarkup(await KalorierPage());
    const trediveAar = kaloriePrAlderRaekker([30])[0];
    const vaegt80 = kaloriePrDagRaekker([80])[0];

    // Begge tabeller er 80 kg / 180 cm, saa 30 aar skal give de samme tal i begge
    expect(html).toContain(`<td>${dec(trediveAar.mand)} kcal</td>`);
    expect(html).toContain(`<td>${dec(trediveAar.kvinde)} kcal</td>`);
    expect(vaegt80.mand).toBe(trediveAar.mand);
  });

  test("svarar paa kaloribehov for barn uden at finde paa et tal", async () => {
    const html = renderToStaticMarkup(await KalorierPage());

    expect(html).toContain("Kaloribehovet för barn räknas inte ut med den här formeln");
    expect(html).toContain("Formeln är validerad för vuxna");
    // Barn har intet værktøj her - og det skal ikke faa et opfundet tal
    expect(html).not.toMatch(/barn[^.]{0,80}?\d+\s*kcal/);
  });

  test("de nye spoersmaal staar i page-data, saa de ogsaa kommer i JSON-LD", () => {
    const data = getPageData("kalorier", "se")!;
    const questions = data.faqItems.map((f) => f.question);

    expect(questions).toContain("Hur många kalorier behöver jag?");
    expect(questions).toContain("Hur många kalorier behöver jag för att gå ner 1 kg?");
    expect(questions).toContain("Gäller kaloribehovet även barn?");
    expect(questions).toContain("Är kalorikalkylatorn gratis?");
    // Svaret skal bruge de tal tabellen viser, ikke et andet rundet tal
    const svar = data.faqItems.find((f) => f.question === "Hur många kalorier behöver jag?")!;
    expect(svar.answer).toContain(formatBelob(2502, "se"));
    expect(svar.answer).toContain(formatBelob(2759, "se"));
    // Punktum mellem to talgrupper er dansk; i svensk loebende tekst laeses
    // «2.759 kcal» som 2,759 kcal, saa det er en fejl og ikke en variant.
    expect(svar.answer).not.toMatch(/\d\.\d{3}/);
  });

  test("den danska side er urort af de svenska tabeller", async () => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));

    const html = renderToStaticMarkup(await KalorierPage());

    expect(html).toContain("<h2>Hvor mange kalorier pr dag?</h2>");
    expect(html).not.toContain("<h2>Kaloribehov efter ålder</h2>");
    expect(html).not.toContain("Kaloribehovet för barn");
  });
});
