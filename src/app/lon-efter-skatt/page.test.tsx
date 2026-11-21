import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { formatSvenskText } from "@/lib/format";
import { getPageData } from "@/lib/page-data";
import {
  SVENSK_SKATT_2026 as S,
  SVENSK_SKATT_TAL,
  kommunalskattSkillnadPerManad,
} from "@/lib/svensk-skatt";
import LonEfterSkattPage from "./page";

vi.mock("@/components/LonEfterSkattBeregner", () => ({
  default: () => <div>Lönekalkylator</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

const krSe = (tal: number, dec = 0) => formatSvenskText(tal, dec);
const pctSe = (andel: number, dec = 0) => formatSvenskText(andel * 100, dec);
const MONEDSLON = 35000;

/** Den svenska brödteksten, utan HTML-taggar — så talen kan läsas som text. */
function svenskText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

describe("lon-efter-skatt page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
  });

  // Punkt 11: påstande i tekst er kode. Siden skrev grundavdragets spænd,
  // skiktgrænsen, brytpunkten og jobbskatteavdragets maksimum i hånden i både
  // brødteksten og FAQ'en — og FAQ'en bliver publiceret som JSON-LD, så et
  // håndskrevet tal kan havne i Googles svenska visning. Nu læses de fra
  // `svensk-skatt`, altså fra det samme modul kalkylatoren regner på.
  test("listen citerer satsernes spænd, ikke tal skrevet i hånden", async () => {
    const tekst = svenskText(renderToStaticMarkup(await LonEfterSkattPage()));

    expect(tekst).toContain(
      `Grundavdraget är mellan cirka ${krSe(SVENSK_SKATT_TAL.grundavdragMin)} och ${krSe(SVENSK_SKATT_TAL.grundavdragMax)} kr per år 2026`
    );
    expect(tekst).toContain(`prisbasbeloppet ${krSe(S.prisbasbelopp)} kr`);
    expect(tekst).toContain(`Snittet i Sverige 2026 är ${pctSe(S.kommunalskattSnitt, 2)} %`);
    expect(tekst).toContain(`skiktgränsen ${krSe(S.skiktgrans)} kr 2026`);
    expect(tekst).toContain(`brytpunkt cirka ${krSe(SVENSK_SKATT_TAL.statligBrytpunkt)} kr i bruttolön`);
    expect(tekst).toContain(`upp till cirka ${krSe(SVENSK_SKATT_TAL.jobbskatteavdragMaxManad)} kr per månad`);
    expect(tekst).toContain(`högst ${krSe(S.publicServiceMax)} kr per år`);
    expect(tekst).toContain(`Allmän pensionsavgift (${pctSe(S.pensionsavgift)} %)`);
  });

  // Den håndskrevne sætning «kan det skilja flera hundra kronor i månaden» er
  // ikke bare usynkroniseret med modellen — den underdriver den. Kommunalskatt
  // går desuden ind i jobbskatteavdraget, så forskellen er ikke 6 % af lønnen.
  test("kommunalskattens forskel er modellens egen, ikke «flera hundra kronor»", async () => {
    const tekst = svenskText(renderToStaticMarkup(await LonEfterSkattPage()));

    expect(tekst).toContain(
      `På en månadslön på ${krSe(MONEDSLON)} kr blir skillnaden ${krSe(kommunalskattSkillnadPerManad(MONEDSLON * 12))} kr i nettolön per månad`
    );
    expect(tekst).not.toContain("flera hundra kronor");
  });

  // FAQ'en bliver publiceret som JSON-LD (`FAQSchema` læser `faqItems`), så de
  // håndskrevne tal var synlige for Google — ikke kun for læseren.
  test("FAQ-svarene citerer de samme tal som brødteksten", () => {
    const faq = getPageData("lon-efter-skatt", "se")!.faqItems;
    const svar = faq.map((f) => f.answer).join(" ");

    expect(svar).toContain(`i genomsnitt ${pctSe(S.kommunalskattSnitt, 2)} % 2026`);
    expect(svar).toContain(`statlig inkomstskatt på ${pctSe(S.statligSkatt)} %`);
    expect(svar).toContain(`över ${krSe(S.skiktgrans)} kr`);
    expect(svar).toContain(`upp till cirka ${krSe(SVENSK_SKATT_TAL.jobbskatteavdragMaxManad)} kr per månad`);
    expect(svar).toContain(
      `mellan cirka ${krSe(SVENSK_SKATT_TAL.grundavdragMin)} och ${krSe(SVENSK_SKATT_TAL.grundavdragMax)} kr per år 2026`
    );
    expect(svar).toContain(`brytpunkt) på cirka ${krSe(SVENSK_SKATT_TAL.statligBrytpunkt)} kr per år`);
    expect(svar).toContain(`Allmän pensionsavgift (${pctSe(S.pensionsavgift)} %)`);
    expect(svar).toContain(`högst ${krSe(S.publicServiceMax)} kr per år 2026`);
  });

  // Punkt 11: tallene i teksten skal kunne slås op i modulet. Renderet tekst
  // **skal** have beløb — så porten kan ikke kræve at de forsvinder. Den kan
  // kræve at hvert beløb, der står i brødteksten og FAQ'en, findes i modulen.
  // Skriver nogen «661 000 kr» i hånden, bliver den stående i stedet for modulet,
  // og den her test bliver rød.
  test("hvert beløb i brødteksten og FAQ'en kommer fra modulen", async () => {
    const tekst = svenskText(renderToStaticMarkup(await LonEfterSkattPage()));
    const svar = getPageData("lon-efter-skatt", "se")!.faqItems
      .map((f) => `${f.question} ${f.answer}`)
      .join(" ");

    const fraModulet = new Set(
      [
        S.prisbasbelopp,
        S.skiktgrans,
        S.publicServiceMax,
        SVENSK_SKATT_TAL.grundavdragMin,
        SVENSK_SKATT_TAL.grundavdragMax,
        SVENSK_SKATT_TAL.statligBrytpunkt,
        SVENSK_SKATT_TAL.jobbskatteavdragMaxManad,
        kommunalskattSkillnadPerManad(MONEDSLON * 12),
        MONEDSLON,
      ].map((tal) => krSe(tal))
    );

    // Samme mønster som beløbs-porten: tre cifre med separator, intet ciffer
    // bagefter, så en dato som «26/9 2026» ikke læses som et beløb.
    const belob = /\d{1,3}\s\d{3}(?!\d)/g;
    for (const [navn, kilde] of [
      ["brødtekst", tekst],
      ["FAQ", svar],
    ] as const) {
      const fund = [...new Set(kilde.match(belob) ?? [])].filter(
        (fundet) => !fraModulet.has(fundet)
      );
      expect(fund, `${navn} har beløb, der ikke findes i modulet`).toEqual([]);
    }
  });
});
