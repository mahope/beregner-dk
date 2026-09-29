import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import ProcentPage from "./page";

// ProcentBeregner er bevidst IKKE mocket her. Sidefilens egen test mockerer
// den, og en mockeret udgave ville gøre optællingen vakuum-grøn: uden
// værktøjets egen "Formler"-boks ville formlerne forekomme 0 gange i stedet
// for 2, og testen ville være grøn uden at have set fejlen.
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

/**
 * De tre første formler er ens i begge sprog. Den fjerde bruger
 * sprogets egen adjektivform — dansk "Gammel", svensk "Gammal" — så den er
 * delt per sprog. Skrevet som to konstanter, fordi en fælles streng ville have
 * sagt 0 forekomster på den ene side og testen ville have været grøn af
 * fejltagelse.
 */
const FORMEL_PROCENT = "Procent = (Del / Heltal) × 100";
const FORMEL_DEL = "Del = (Procent / 100) × Heltal";
const FORMEL_HELTAL = "Heltal = Del × (100 / Procent)";
const FORMEL_AENDRING = {
  da: "((Ny - Gammel) / Gammel) × 100",
  se: "((Ny - Gammal) / Gammal) × 100",
} as const;

function forekomster(haystack: string, needle: string) {
  return haystack.split(needle).length - 1;
}

async function render(locale: "da" | "se" | "no") {
  vi.mocked(getLocale).mockResolvedValue(locale);
  const domainConfig = getDomainConfigByLocale(locale);
  vi.mocked(getCurrentDomainConfig).mockResolvedValue(domainConfig);
  const html = renderToStaticMarkup(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      {await ProcentPage()}
    </LocaleProvider>,
  );
  // React skriver `<!-- -->` mellem to tekstnoder i én JSX-celle.
  return html.replaceAll("<!-- -->", "");
}

describe("procent: formlerne har én ejer", () => {
  // /procent er GSC's største danske side (149.879 visninger, 99 klik, CTR
  // 0,1 %, pos. 7,4) og dens CTR er 5-10x lavere end hver anden side i
  // top-16 på lignende position. Sidefilen og værktøjet skrev begge de fire
  // formler: ProcentBeregner som "Formler"-boks under værktøjet og page.tsx
  // som afsnittet "Procentregningens formler" nederst i brødteksten — to
  // afsnit med præcis de samme fire linjer i samme dokument.
  //
  // Ændringsformlen må stå to gange i begge sprog: "Skillnad i procent mellan
  // två tal" (C114) og dens danske tvilling "Sådan beregner du
  // procentforskellen mellem to tal" (C170) bruger den bevidst som den ene af
  // to formler, der skal holdes op imod hinanden. Det er et andet afsnit med et
  // andet formål, ikke en dublet af referenceboksen, så den tælles med sine to.
  // De tre øvrige formler har ingen sådan grund og skal stadig stå én gang.
  test.each(["da", "se"] as const)(
    "formlerne står kun i referenceboksen på %s",
    async (locale) => {
      const html = await render(locale);

      for (const formel of [FORMEL_PROCENT, FORMEL_DEL, FORMEL_HELTAL]) {
        expect(forekomster(html, formel), formel).toBe(1);
      }
      expect(
        forekomster(html, FORMEL_AENDRING[locale]),
        FORMEL_AENDRING[locale],
      ).toBe(2);
    },
  );

  // Undtagelsen må ikke blive en blank check: skillnadsafsnittet skal findes
  // præcis én gang i begge sprog, ellers kan "to forekomster" opfyldes af den
  // dublet C161 slettede — to afsnit om præcis det samme.
  test.each([
    ["da", "<h2>Sådan beregner du procentforskellen mellem to tal</h2>"],
    ["se", "<h2>Skillnad i procent mellan två tal</h2>"],
  ] as const)(
    "skillnadsafsnittet findes præcis én gang på %s",
    async (locale, overskrift) => {
      const html = await render(locale);

      expect(forekomster(html, overskrift), overskrift).toBe(1);
    },
  );

  // Det duplikerede afsnit og dets overskrift er væk. "Formler" som h2 var
  // den anden overskrift om præcis det samme som værktøjets boks.
  test.each([
    ["da", "Procentregningens formler"],
    ["se", "Procenträkningens formler"],
  ] as const)("det duplikerede formelafsnit er væk på %s", async (locale, overskrift) => {
    const html = await render(locale);

    expect(html).not.toContain(overskrift);
  });

  // Låsen på den anden side af rettelsen: formlerne skal stadig være på
  // siden. Uden denne test kan "én forekomst" opfyldes ved at slette dem
  // begge steder, og læseren taber det han kan slå op.
  test.each([
    ["da", ">Hurtig reference</h2>"],
    ["se", ">Snabbreferens</h2>"],
  ] as const)(
    "værktøjets egen Formler-boks er stadig den, der står på %s",
    async (locale, hurtigReference) => {
      const html = await render(locale);

      expect(html).toContain(">Formler</h2>");
      // Hurtig reference står side om side med Formler-boksen og er ikke
      // duplikeret nogen andet sted.
      expect(html).toContain("10% = 1/10");
      expect(html).toContain(hurtigReference);
    },
  );

  // Tip-boksen var eneste tekst i det slettede afsnit, der ikke var en
  // duplikat, så den skal stadig være med i begge sprog.
  test.each([
    ["da", "50% af 40 er det samme som 40% af 50"],
    ["se", "50% av 40 är samma sak som 40% av 50"],
  ] as const)("tipboksen overlever i %s", async (locale, tip) => {
    const html = await render(locale);

    expect(html).toContain(tip);
  });
});
