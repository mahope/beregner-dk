import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { formatNumber } from "@/lib/format";
import { TEMPO_EKSEMPLER, beregnTempo, formatSekunder } from "@/lib/tidsberegner";
import {
  TIDS_EKSEMPEL_DAG,
  TIDS_EKSEMPEL_MIDNAT,
  TIDS_EKSEMPEL_PAUSE,
  excelDifferens,
  totalMinutter,
} from "@/lib/tids-eksempler";
import TidsberegnerPage from "./page";

vi.mock("@/components/TidsBeregner", () => ({
  default: () => <div>Tidsværktøj</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

describe("tidsberegner page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Hvor lang tid er der mellem to klokkeslæt?",
      answer: "Beregn hvor lang tid der går mellem to klokkeslæt – i timer, minutter og decimaltimer. Træk en pause fra.",
      schema: "Gratis tidsberegner. Beregn tidsrum mellem to klokkeslæt og se resultatet i timer, minutter og decimaltimer.",
    },
    {
      locale: "se" as const,
      heading: "Tidskalkylator",
      answer: "Beräkna hur lång tid det går mellan två klockslag – i timmar, minuter och decimaltimmar. Dra av en rast.",
      schema: "Gratis tidskalkylator. Beräkna tidsintervall mellan två klockslag och se resultatet i timmar, minuter och decimaltimmar.",
    },
  ])("viser det konkrete svar, schema og beregneren i $locale", async ({ locale, heading, answer, schema }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await TidsberegnerPage());

    expect(html).toContain(`>${heading}</h1>`);
    expect(html).toContain(answer);
    expect(html).toContain(schema);
    expect(html).toContain("Tidsværktøj");
  });

  // Search Console: "hvor lang tid" 790 visninger pos. 6. Svar-først-tabellen
  // er dansk, fordi spørgsmålet er dansk; den må ikke lække til beraknare.se,
  // der har sit eget svar-først-sæt (C38).
  test("da viser svar-først-tabellen med det lovede eksempel", async () => {
    const html = renderToStaticMarkup(await TidsberegnerPage());

    expect(html).toContain("Svar på de oftest søgte tidsrum");
    expect(html).toContain("<strong>8 t 15 min</strong>");
    // C78: denne assertion lå "8.25 timer" fast — altså den fejl, der stod i
    // den server-renderede HTML og dermed i den tekst Google indekserer.
    expect(html).toContain("8,25 timer");
    expect(html).not.toContain("8.25 timer");
    expect(html).toContain("(dagen efter)");
  });

  test("se får ikke den danske svar-først-tabel", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await TidsberegnerPage());

    expect(html).not.toContain("Svar på de oftest søgte tidsrum");
    expect(html).not.toContain("dagen efter");
  });
});

/**
 * Search Console 2026-08-29→09-26: /tidsberegner har 72.902 visninger, CTR
 * 0,3 % på pos. 7,0 (DA) og 59.270 visninger, CTR 0,2 % på pos. 8,1 (SE) —
 * positioner hvor titlen afgør om der klikkes. Dansk autocomplete under
 * "beregn tid mellem to klokkeslæt" har "excel beregn tid mellem to
 * klokkeslæt" som nr. 2, og svensk under "räkna ut timmar mellan klockslag"
 * har tre variationer med "excel". Begge sprog havde **0** forekomster af
 * "Excel" i den server-renderede HTML.
 *
 * Tallene i afsnittet er ikke håndskrevet: de er `TIDS_EKSEMPEL_DAG`,
 * `_MIDNAT` og `_PAUSE` formatteret med `formatNumber`, altså de tal
 * `beregnTidsinterval` regner. Derfor læser testene dem fra modulet.
 */
describe("Excel-svaret på /tidsberegner", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test("da har Excel-afsnittet med de tre formler", async () => {
    const html = renderToStaticMarkup(await TidsberegnerPage());

    expect(html).toContain("Sådan beregner du tid mellem to klokkeslæt i Excel");
    expect(html).toContain("=B1-A1");
    expect(html).toContain("=(B1-A1)*24");
    expect(html).toContain("=(B1-A1)*24*60");
    // Tallene er modulets, formatteret med komma (C78's klasse).
    expect(html).toContain("8,25");
    expect(html).not.toContain("8.25");
    expect(html).toContain("495");
  });

  test("da svarer på både midnat-fælden og pause-fælden med tal", async () => {
    const html = renderToStaticMarkup(await TidsberegnerPage());

    // Excel trækker 06:00 fra 22:00 og får minus 16 timer; MOD tager dagen med.
    expect(html).toContain("=MOD(B1-A1;1)*24");
    expect(html).toContain(
      formatNumber(excelDifferens(TIDS_EKSEMPEL_MIDNAT), "da", { maximumFractionDigits: 2 })
    );
    // Tallet står for sig selv, ikke som "minus -0,67" — dobbelt minus.
    expect(html).not.toContain("minus -");
    expect(html).toContain("minus 16 timer");
    expect(html).toContain("=(B1-A1)*24-0,5");
    // Og pausen er 30 minutter = 0,5 time, så 8 − 0,5 = 7,5 — decimaltimer.
    expect(html).toContain("7,50");
    expect(TIDS_EKSEMPEL_PAUSE.pause).toBe(30);
  });

  test("da forklarer hvorfor Excel kan vise 0,34 i stedet for timer", async () => {
    const html = renderToStaticMarkup(await TidsberegnerPage());

    // Den fælde der får folk til at tro formlen er forkert: cellen er
    // formateret som Tal, ikke Tid. Værdien er 8,25 / 24.
    expect(html).toContain("formateret som");
    expect(html).toContain("Tid");
    expect(html).toContain(
      formatNumber(excelDifferens(TIDS_EKSEMPEL_DAG), "da", { maximumFractionDigits: 4 })
    );
    // Dansk Excel bruger semikolon, fordi komma er decimaltegn.
    expect(html).toContain("semikolon");
  });

  test("se har sit eget Excel-afsnit med svensk notation", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await TidsberegnerPage());

    expect(html).toContain("Så räknar du ut timmar mellan två klockslag i Excel");
    expect(html).toContain("=B1-A1");
    expect(html).toContain("=MOD(B1-A1;1)*24");
    // Svensk notation: komma i decimaler, "timmar" ikke "timer", og den
    // negative værdi med svensk komma — ikke dansk.
    expect(html).toContain("8,25 timmar");
    expect(html).not.toContain("8,25 timer");
    expect(html).not.toContain("8,25 timme ");
    // Svensk Excel bruger også semikolon.
    expect(html).toContain("semikolon");
    // Ingen danske æ/ø må lække ind (C73's R4).
    for (const daFragment of [
      "klokkeslæt",
      "Sådan",
      "decimaltimer",
      "beregneren",
      "Hvordan",
      "frokost",
    ]) {
      expect(html).not.toContain(daFragment);
    }
  });

  test("begge sprog linker videre til /dato — de to formler ligner hinanden", async () => {
    for (const locale of ["da", "se"] as const) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

      const html = renderToStaticMarkup(await TidsberegnerPage());

      expect(html).toContain('href="/dato"');
    }
  });

  test("FAQ'en har de to nye spørgsmål i begge sprog, så de kommer i JSON-LD'en", () => {
    // `FAQ` er mocket væk i denne fil (C85's fælde), så påstanden ligger i
    // page-data og læser præcis den tabel FAQSchema får.
    for (const locale of ["da", "se"] as const) {
      const spgsmaal = getPageData("tidsberegner", locale)!.faqItems.map((i) => i.question);
      expect(spgsmaal.some((q) => q.includes("Excel"))).toBe(true);
      expect(spgsmaal.some((q) => /negativt tal|negativt/.test(q))).toBe(true);
    }
  });

  test("de to nye FAQ-svar indeholder de samme tal som afsnittet", () => {
    // Ellers kunne FAQ'en love 8,25 mens brødteksten siger 8,5 — C84's
    // fejlklasse: en indekseret tekst der modsiger sin egen side.
    const da = getPageData("tidsberegner", "da")!.faqItems;
    const excelSvar = da.find((i) => i.question.includes("Excel"))!.answer;
    const negativtSvar = da.find((i) => i.question.includes("negativt tal"))!.answer;

    expect(excelSvar).toContain("8,25");
    expect(excelSvar).toContain("495");
    expect(negativtSvar).toContain("-0,67");
    expect(negativtSvar).toContain("8 timer");
    // Og de skal være de samme tal som modulet regner.
    expect(excelSvar).toContain(String(totalMinutter(TIDS_EKSEMPEL_DAG)));
    expect(negativtSvar).toContain("=MOD(B1-A1;1)*24");
  });
  test("tempo-afsnittet svarer paa laebetid i begge sprog, med tal fra modulet", async () => {
    for (const locale of ["da", "se"] as const) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

      const html = renderToStaticMarkup(await TidsberegnerPage());

      const overskrift =
        locale === "da" ? "Hvor hurtigt løber jeg?" : "Hur fort springer jag?";
      expect(html).toContain(overskrift);
      // Regnestykket og de to omregninger, dansk notation.
      expect(html).toContain("5:00");
      expect(html).toContain("8:03");
      expect(html).toContain("4:59");
      // Rækkerne er de fire i modulet, og hver celle er regnet af beregnTempo.
      for (const eksempel of TEMPO_EKSEMPLER) {
        const tempo = beregnTempo(eksempel.minutter, eksempel.km)!;
        expect(html).toContain(formatSekunder(tempo.sekunderPerKm));
        expect(html).toContain(formatSekunder(tempo.sekunderPerMil));
      }
      // 1 engelsk mil er 1,609344 km — den fælde, der giver 8:03 og ikke 8:00.
      expect(html).toContain("1,609344");
    }
  });

  test("tempo-FAQ'en indeholder de samme tal som tempo-afsnittet", () => {
    // Ellers kunne svaret i JSON-LD'en love 4:58 mens tabellen viser 4:59 —
    // C84's fejlklasse.
    for (const locale of ["da", "se"] as const) {
      const faq = getPageData("tidsberegner", locale)!.faqItems;
      const tempoSvar = faq.find((i) =>
        i.question.includes("tempo")
      )!.answer;
      for (const eksempel of TEMPO_EKSEMPLER) {
        const tempo = beregnTempo(eksempel.minutter, eksempel.km)!;
        if (eksempel.id !== "km10" && eksempel.id !== "maraton") {
          expect(tempoSvar).toContain(formatSekunder(tempo.sekunderPerKm));
        }
      }
      expect(tempoSvar).toContain("5:00");
      expect(tempoSvar).toContain("4:59");
    }
  });
});
