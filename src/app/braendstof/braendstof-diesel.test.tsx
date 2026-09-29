import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import BraendstofPage from "./page";

/**
 * /braendstof er GSC's syvendesidest mest besøgte danske side (17.024
 * visninger, 183 klik, CTR 1,1 %, pos. 5,9), og dens egen
 * "hvorfor er diesel dyrere end benzin" ligger på position 1 med 48 visninger
 * pr. 1.000 — altså nummer ét i Google og næsten ingen klik. Siden svarede
 * på *pr. km*-siden af spørgsmålet ("benzin er dyrere pr. km end diesel") men
 * aldrig på pr. liter-siden, som er den afgiftsdelen spørgsmålet egentlig
 * handler om.
 *
 * FAQ er bevidst IKKE mocket her, i modsætning til page.test.tsx: de to nye
 * FAQ-par skal kunne måles i HTML'en, ellers ville denne test være grøn uden
 * at have set dem. Værktøjet er mocket, fordi det ikke indeholder de tal,
 * denne test regner på — de kommer fra sidens egen tabel, der læser
 * braendstofEksempelRækker().
 */
vi.mock("next/dynamic", () => ({ default: () => () => <div>Brændstofværktøj</div> }));
vi.mock("@/components/BraendstofBeregner", () => ({ default: () => <div>Brændstofværktøj</div> }));
vi.mock("@/components/AffiliateBox", () => ({ BilforsikringAffiliate: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/RelateredeArtikler", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

function forekomster(haystack: string, needle: string) {
  return haystack.split(needle).length - 1;
}

async function render(locale: "da" | "se" | "no") {
  vi.mocked(getLocale).mockResolvedValue(locale);
  const domainConfig = getDomainConfigByLocale(locale);
  vi.mocked(getCurrentDomainConfig).mockResolvedValue(domainConfig);
  const html = renderToStaticMarkup(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      {await BraendstofPage()}
    </LocaleProvider>,
  );
  // React skriver `<!-- -->` mellem to tekstnoder i én JSX-celle.
  return html.replaceAll("<!-- -->", "");
}

describe("braendstof: svaret på 'hvorfor er diesel dyrere end benzin'", () => {
  test("den danske side har spørgsmålet som overskrift — præcis én gang", async () => {
    const html = await render("da");

    expect(forekomster(html, "<h2>Hvorfor er diesel dyrere end benzin?</h2>")).toBe(1);
  });

  test("svaret skiller pr. liter fra pr. km og siger afgifterne grunden til", async () => {
    const html = await render("da");

    // Pr. liter: mekanismen, der manglede helt.
    expect(html).toContain("energi- og CO2-afgiften er højere pr.");
    expect(forekomster(html, "liter for diesel end for benzin")).toBeGreaterThanOrEqual(1);
    // Pr. km: den del siden allerede havde, nu med regnestykket ved siden af.
    expect(html).toContain("15-22 km/l");
    expect(html).toContain("12-18 km/l");
  });

  test("de to 500 km-tal i tabellen er dem værktøjet selv bruger", async () => {
    const html = await render("da");

    // 500 / 18 = 27,8 l, 27,8 x 12,80 = 356 kr.
    expect(html).toContain("27,8");
    expect(html).toContain("356");
    // 500 / 15 = 33,3 l, 33,3 x 13,50 = 450 kr.
    expect(html).toContain("33,3");
    expect(html).toContain("450");
    // 12,80 / 18 = 0,71 mod 13,50 / 15 = 0,90.
    expect(html).toContain("0,71");
    expect(html).toContain("0,90");
    // 450 - 356 = 94.
    expect(html).toContain("94");
  });

  test("de to nye FAQ-par ligger i HTML'en og dermed i JSON-LD'en", async () => {
    const html = await render("da");

    expect(forekomster(html, "Hvorfor er diesel dyrere end benzin?")).toBeGreaterThanOrEqual(2);
    expect(html).toContain("Hvad koster diesel pr. kilometer?");
  });

  test("KONTROL: den svenske side er urørt — hverken overskrift eller FAQ", async () => {
    const html = await render("se");

    // Dette er testens negative. Havde overskriften ligget i det delte
    // afsnit i stedet for i den danske gren, ville denne linje være rød — og
    // uden den ville testen være grøn, fordi den danske `<h2>` nok fandtes
    // på dansk, men også havde lækt ind i svensk markup.
    expect(forekomster(html, "dyrere end benzin")).toBe(0);
    expect(forekomster(html, "dyrere än bensin")).toBe(0);
    expect(forekomster(html, "CO2-afgiften")).toBe(0);
    // Den svenske side har stadig sin egen gamle sammenligning.
    expect(html).toContain("Bensin vs. diesel vs. el");
  });
});
