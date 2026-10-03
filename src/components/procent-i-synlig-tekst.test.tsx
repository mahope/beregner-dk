/**
 * F5d (2026-10-03): procenttal i den **synlige markup** skal skrives «8 %».
 *
 * **Målingen der satte opgaven op.** Efter at `ceo/procent-med-mellemrum`
 * havde skrevet hele `page-data.ts` om, stod der stadig 9 procenter i den
 * markup brugerne ser: `HomeContent.tsx` skrev «tillæg eller fratræk 25%
 * moms», «boafgift (15%) og tillægsafgift (25%)» og de samme to på svensk,
 * og `FeriepengeBeregner.tsx` skrev «Feriepenge (12,5%)», «- AM-bidrag (8%)»
 * og «- Skat (estimat ~38%)» i sin resultattabel.
 *
 * **Hvorfor de to eksisterende porte ikke så dem.** `forside.test.tsx`
 * renderer forsiden med `vi.mock("@/components/HomeContent")` — den del af
 * siden med de syv links er bevidst holdt ude af porten, fordi den kun
 * dømmer linkrækkerne. Og `regnestykker.test.ts` scanner `JsxText` og
 * strengliteraler i kildefilerne, men loftet på 436 blev nået længe før disse
 * to filer, så porten kan ikke dømme dem enkeltvis.
 *
 * Derfor renderer denne port de to komponenter **direkte** og dømmer den
 * resulterende markup med samme regex som F5c's scanner. Den skal fejle mod
 * den gamle kode: sæt `25% moms` tilbage i `HomeContent.tsx`, og denne test
 * bliver rød.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import type { Locale } from "@/lib/i18n";
import FeriepengeBeregner from "./FeriepengeBeregner";
import { HomeContent } from "./HomeContent";

/** Samme mønster som `procentUdenMellemrum()` i `regnestykker.test.ts`. */
const PROCENT_UDEN_MELLEMRUM = /[0-9]+(?:[.,][0-9]+)?%/g;

function synligeProcenter(markup: string): string[] {
  // Fjern det, der ikke er synlig tekst: attributværdier og <script>/<style>.
  const synlig = markup
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/="[^"]*"/g, '=""');
  return [...new Set(synlig.match(PROCENT_UDEN_MELLEMRUM) ?? [])];
}

function renderFeriepenge(locale: Locale): string {
  return renderToStaticMarkup(
    <LocaleProvider locale={locale} domainConfig={getDomainConfigByLocale(locale)}>
      <FeriepengeBeregner />
    </LocaleProvider>,
  ).replaceAll("<!-- -->", "");
}

describe("procenttal i synlig markup", () => {
  test("forsidens brødtekst i da, se og no har 0 procenter uden mellemrum", () => {
    for (const locale of ["da", "se", "no"] as const) {
      const fund = synligeProcenter(
        renderToStaticMarkup(<HomeContent locale={locale} siteName="MinBeregner" />)
          .replaceAll("<!-- -->", ""),
      );
      expect(fund, `forsiden (${locale})`).toEqual([]);
    }
  });

  test("feriepengetabellen har 0 procenter uden mellemrum", () => {
    const fund = synligeProcenter(renderFeriepenge("da"));
    expect(fund).toEqual([]);
  });

  test("de to rettede strenge står med mellemrum", () => {
    const forside = renderToStaticMarkup(
      <HomeContent locale="da" siteName="MinBeregner" />,
    ).replaceAll("<!-- -->", "");
    expect(forside).toContain("tillæg eller fratræk 25 % moms");
    expect(forside).toContain("boafgift (15 %) og tillægsafgift (25 %)");

    const feriepenge = renderFeriepenge("da");
    expect(feriepenge).toContain("Feriepenge (12,5 %)");
    expect(feriepenge).toContain("AM-bidrag (8 %)");
    expect(feriepenge).toContain("estimat ~38 %");
  });
});