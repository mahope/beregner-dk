import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { formatNumber } from "@/lib/format";
import { KOMMUNER, KOMMUNER_ANTAL, KOMMUNER_SNIT } from "@/lib/kommuner";
import { SATSER_2026 } from "@/lib/satser-2026";
import LoenPage from "./page";

vi.mock("next/dynamic", () => ({ default: () => () => <div>Værktøj</div> }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));
vi.mock("@/components/ads/AdBanner", () => ({ InlineAd: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));
vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

/**
 * Review-fund 29/9 (LAV): kommuneskat-afsnittet skrev to tal om de samme
 * kommuner fra to forskellige kilder i samme afsnit — «Landsgennemsnittet er ca.
 * 25,049 %» fra `SATSER_2026` og «den billigste ligger på 22,5 %, 27,8 % er den
 * dyreste» fra `KOMMUNER`. De 98 rækkers eget middeltal er 25,626 %, så de kunne
 * ikke begge være sande.
 *
 * Porten dømmer på den **renderede markup**, ikke på kildekoden: den læser
 * gennemsnit, laveste og højeste ud af den `<p>` der indeholder dem og kræver,
 * at alle tre kommer fra `KOMMUNER`. Det er den egenskab, fundet handler om —
 * ikke et bestemt kodestykke, der så kan skrives om.
 */
describe("/loen-efter-skat — kommuneskat-afsnittet", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  const snitTekst = (procent: number) =>
    formatNumber(procent, "da", { maximumFractionDigits: 2 });
  const talTekst = (procent: number) =>
    formatNumber(procent, "da", { maximumFractionDigits: 3 });

  const stigende = [...KOMMUNER].sort((a, b) => a.kommuneskat - b.kommuneskat);

  test("gennemsnit, laveste og højeste i samme afsnit kommer alle fra KOMMUNER", async () => {
    const html = renderToStaticMarkup(await LoenPage());

    // Find afsnittet med de tre tal og læs dem derfra, så porten ikke kan
    // skelne mellem et tal i dette afsnit og et tilfældigt sted på siden.
    const afsnit = html.match(/<p>(?:(?!<\/p>)[\s\S])*?gennemsnittet(?:(?!<\/p>)[\s\S])*?<\/p>/);
    expect(afsnit, "afsnittet med kommuneskattens gennemsnit findes ikke").not.toBeNull();
    const tekst = (afsnit as RegExpMatchArray)[0];

    // Mutation: sæt gennemsnittet tilbage til SATSER_2026.kommuneskatSnit —
    // porten skal blive rød, fordi 25,05 ikke er tabellens middeltal.
    expect(tekst).toContain(`I tabellen med de ${KOMMUNER_ANTAL} kommuner er gennemsnittet ${snitTekst(KOMMUNER_SNIT)} %`);
    expect(tekst).not.toContain(talTekst(SATSER_2026.kommuneskatSnit * 100));

    // De to ekstremer skal også være pr. tabellens egne rækker, så et par
    // hårdkodede tal i brødteksten ikke kan overleve ved siden af dem.
    const laveste = stigende[0].kommuneskat;
    const hoejeste = stigende[stigende.length - 1].kommuneskat;
    expect(tekst).toContain(`den billigste ligger på ${snitTekst(laveste)} %`);
    expect(tekst).toContain(`${snitTekst(hoejeste)} % er den dyreste`);
  });

  test("satsfilens gennemsnit står i sit eget afsnit med sin kilde", async () => {
    const html = renderToStaticMarkup(await LoenPage());

    // Det andet gennemsnit må ikke forsvinde — beregneren bruger det — men det
    // skal være mærket med hvor det kommer fra, ellers læser det som tabellens.
    const kildeAfsnit = html.match(/<p><small>(?:(?!<\/p>)[\s\S])*?svmn\.dk(?:(?!<\/p>)[\s\S])*?<\/p>/);
    expect(kildeAfsnit, "kildeafsnittet for satsfilens gennemsnit findes ikke").not.toBeNull();
    expect((kildeAfsnit as RegExpMatchArray)[0]).toContain(
      `${talTekst(SATSER_2026.kommuneskatSnit * 100)} %`
    );
    expect(html).not.toContain("Landsgennemsnittet er ca.");
  });

  test("tabellens antal rækker er det antal copyen lover", async () => {
    const html = renderToStaticMarkup(await LoenPage());
    expect(KOMMUNER_ANTAL).toBe(98);
    expect(html).toContain(`I tabellen med de ${KOMMUNER_ANTAL} kommuner`);
    // Hver række i tabellen er fra `KOMMUNER`, så de tre laveste og højeste kan
    // ikke komme på afveje: de skal være præcis dem, `KOMMUNER` har.
    for (const k of stigende.slice(0, 3)) {
      expect(html).toContain(`${k.navn} (${snitTekst(k.kommuneskat)} %)`);
    }
  });
});