import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import RenteberegnerPage from "./page";

/**
 * The annuity section of /renteberegner used to print its worked example as
 * literal text: "200.000 kr.", "1.211,96 kr.", "290.870,56 kr.", "12,68 %",
 * "0,3333 %", "4,07 %" — six amounts that happened to be correct on the day
 * they were typed, and that could not follow `rente-eksempler` afterwards.
 * The Swedish branch of the same page already read the module; the Danish one
 * did not.
 *
 * A test that asserts the *current* numbers cannot see the difference, because
 * the hardcoded values and the computed ones are equal to the øre. So the
 * module is mocked here with values that are unmistakable, and the page is
 * asked to render them. Against the hardcoded text this is red; against the
 * module it is green. `eksempel` is the only input — change it and every
 * assertion below follows.
 */
const eksempel = vi.hoisted(() => ({
  hovedstol: 123_456,
  aarsrente: 7,
  loebetid: 15,
  maanedligRente: 0.07 / 12,
  antalMaaneder: 180,
  maanedligBetalning: 1111.22,
  samletBetaling: 200019.6,
  samletRante: 76563.6,
}));

/**
 * Eksemplet i titlen, metadataen og FAQ'en — et andet lån end formelafsnittets.
 * Før 2/10 stod det som håndskrevet tekst i 19 felter på tre domæner, og
 * `FAQSchema` læser præcis `faqItems`, så det var tal i Googles svar. Det er
 * derfor mocket her, så introen kan ikke vedligeholdes ved at blive skrevet om.
 */
const hovedEks = vi.hoisted(() => ({
  hovedstol: 250_000,
  aarsrente: 3,
  loebetid: 10,
  maanedligRente: 0.03 / 12,
  antalMaaneder: 120,
  maanedligBetalning: 2765.11,
  samletBetaling: 331813.2,
  samletRante: 81813.2,
}));

vi.mock("@/lib/rente-eksempler", () => ({
  annuitetsEksempel: () => eksempel,
  hovedEksempel: () => hovedEks,
  // A distinctive annual rate, so the two "Månedlig rente til årlig rente"
  // rows cannot pass on the hardcoded 12,68 % and 4,07 %.
  effektivAarsrente: () => 0.5,
  AARS_FIRE_PROCENT: 0.04,
  MAANEDLIG_ONE_PROCENT: 0.01,
}));

vi.mock("@/components/RenteBeregner", () => ({
  default: () => <div>Renteværktøj</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/RelateredeArtikler", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
  ArticleSchema: () => null,
}));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

vi.mocked(getLocale).mockResolvedValue("da");
vi.mocked(getCurrentDomainConfig).mockResolvedValue(
  getDomainConfigByLocale("da"),
);

const krDa = (tal: number) =>
  tal.toLocaleString("da-DK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const procentDa = (v: number) =>
  (v * 100).toLocaleString("da-DK", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });

const html = renderToStaticMarkup(await RenteberegnerPage());

describe("/renteberegner læser sit eksempel fra modulet", () => {
  test("introens lån-eksempel læses fra hovedEksempel()", () => {
    const hel = (tal: number) => tal.toLocaleString("da-DK", { maximumFractionDigits: 0 });

    expect(html).toContain(
      `${hel(hovedEks.hovedstol)} kr. i ${hovedEks.loebetid} år til ${hovedEks.aarsrente} % rente koster ` +
        `${hel(hovedEks.maanedligBetalning)} kr. om måneden i et annuitetslån. ` +
        `Samlet rente: ${hel(hovedEks.samletRante)} kr.`,
    );
  });

  test("brødteksten i formelafsnittet følger eksemplet", () => {
    expect(html).toContain(
      `Eksempel: du låner <strong>${eksempel.hovedstol.toLocaleString("da-DK")} kr.</strong>`,
    );
    expect(html).toContain(`til <strong>${eksempel.aarsrente} %</strong> i ${eksempel.loebetid} år`);
    expect(html).toContain(`${eksempel.aarsrente} ÷ 12 = ${procentDa(eksempel.maanedligRente)}`);
    expect(html).toContain(`n = ${eksempel.antalMaaneder} måneder`);
    expect(html).toContain(
      `<strong>${krDa(eksempel.maanedligBetalning)} kr. pr. måned</strong>`,
    );
    expect(html).toContain(`${krDa(eksempel.samletBetaling)} kr., hvoraf`);
    expect(html).toContain(`${krDa(eksempel.samletRante)} kr. er renter`);
  });

  test("Excel-tabellen læser ydelse, løbetid og rente fra eksemplet", () => {
    // Resultatkolonnen.
    expect(html).toContain(
      `Hvad er ydelsen på ${eksempel.hovedstol.toLocaleString("da-DK")} kr. over ${eksempel.antalMaaneder} måneder?`,
    );
    expect(html).toContain(`<td>${krDa(eksempel.maanedligBetalning)} kr.</td>`);
    expect(html).toContain(`<td>${krDa(eksempel.samletRante)} kr.</td>`);
    expect(html).toContain(`<td>${eksempel.antalMaaneder} måneder</td>`);

    // Formelkolonnen: dansk decimalkomma, ingen tusindtalsseparator, fordi
    // skilletegnet i dansk Excel er semikolon.
    const rente = eksempel.aarsrente / 100;
    const excel = (tal: number) =>
      tal.toLocaleString("da-DK", { useGrouping: false, maximumFractionDigits: 6 });
    expect(html).toContain(
      `<code>=YDELSE(${excel(rente)}/12;${eksempel.antalMaaneder};-${eksempel.hovedstol})</code>`,
    );
    expect(html).toContain(
      `<code>=RENTENPERIODER(${excel(rente)}/12;-${excel(eksempel.maanedligBetalning)};${eksempel.hovedstol})</code>`,
    );
    expect(html).toContain(
      `<code>=YDELSE(${excel(rente)}/12;${eksempel.antalMaaneder};-${eksempel.hovedstol})*${eksempel.antalMaaneder}-${eksempel.hovedstol}</code>`,
    );
  });

  test("de to rente-eksempler læser effektivAarsrente()", () => {
    const eff = (0.5 * 100).toLocaleString("da-DK", { maximumFractionDigits: 2 });
    expect(html).toContain(`1 % <strong>pr. måned</strong> er (1,01)<sup>12</sup> − 1 = <strong>${eff} % om året</strong>`);
    expect(html).toContain(
      `4 % <strong>om året</strong> er 0,04 ÷ 12 = ${procentDa(0.04 / 12)} % pr. måned`,
    );
    expect(html).toContain(`(1 + ${procentDa(eksempel.maanedligRente)})<sup>12</sup> − 1 = <strong>${eff} % effektivt</strong>`);
  });
});
