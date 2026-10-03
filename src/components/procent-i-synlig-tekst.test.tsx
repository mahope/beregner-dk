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
import BolanBeregner from "./BolanBeregner";
import BoliglaanBeregner from "./BoliglaanBeregner";
import FeriepengeBeregner from "./FeriepengeBeregner";
import { HomeContent } from "./HomeContent";
import KalorieBeregner from "./KalorieBeregner";
import LaaneBeregner from "./LaaneBeregner";
import LoenBeregner from "./LoenBeregner";
import OpsparingsBeregner from "./OpsparingsBeregner";

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

function renderBoliglaan(locale: Locale): string {
  return renderToStaticMarkup(
    <LocaleProvider locale={locale} domainConfig={getDomainConfigByLocale(locale)}>
      <BoliglaanBeregner />
    </LocaleProvider>,
  ).replaceAll("<!-- -->", "");
}

/**
 * F5c-slice 3/10 11:0x: de procenter, `regnestykker.test.ts`s scanner **ikke**
 * kan se, fordi de er bygget med en interpolation (`{tal}%`) frem for en
 * tekstnode. De fem beregnere nedenfor havde 24 af dem, og de stod på
 * `/kalorier` (273 besøgende/28d), `/brutto-netto`, `/bolan`, `/opsparing`
 * og `/laaneberegner` — altså i den synlige markup, på de samme sider som
 * scanneren *kan* se. Derfor dømmer porten den renderede markup.
 */
function renderMedLocale(locale: Locale, node: React.ReactNode): string {
  return renderToStaticMarkup(
    <LocaleProvider locale={locale} domainConfig={getDomainConfigByLocale(locale)}>
      {node}
    </LocaleProvider>,
  ).replaceAll("<!-- -->", "");
}

const INTERPOLATIONSKOMPOENTER = [
  { navn: "kalorier", Component: KalorieBeregner },
  { navn: "opsparing", Component: OpsparingsBeregner },
  { navn: "bolan", Component: BolanBeregner },
  { navn: "brutto-netto", Component: LoenBeregner },
  { navn: "laaneberegner", Component: LaaneBeregner },
] as const;

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

  test("boliglånsberegneren har 0 procenter uden mellemrum i da, se og no", () => {
    for (const locale of ["da", "se", "no"] as const) {
      const fund = synligeProcenter(renderBoliglaan(locale));
      expect(fund, `boliglaan (${locale})`).toEqual([]);
    }
  });

  test("de interpolerede procenter i de fem beregnere har 0 uden mellemrum", () => {
    // Mutation: sæt `{tal}%` tilbage i en af de fem, porten skal blive rød.
    for (const { navn, Component } of INTERPOLATIONSKOMPOENTER) {
      for (const locale of ["da", "se", "no"] as const) {
        const fund = synligeProcenter(renderMedLocale(locale, <Component />));
        expect(fund, `${navn} (${locale})`).toEqual([]);
      }
    }
  });

  test("de interpolerede procenter står med mellemrum", () => {
    // Kalorieværktøjet: makrofordelingen stod som «(20%)», «(30%)» og «(50%)».
    const kalorier = renderMedLocale("da", <KalorieBeregner />);
    expect(kalorier).toMatch(/kcal \(\d+ %\)/);
    expect(kalorier).not.toMatch(/kcal \(\d+%\)/);

    // Låneværktøjet: «Lån 300.000 i 20 år er til 5%» og sammenligningsens
    // to overskrifter skrev også «5%».
    const laan = renderMedLocale("da", <LaaneBeregner />);
    expect(laan).not.toMatch(/\d%/);

    // Brutto-netto: skattelinjerne skrev «AM-bidrag (8%)», «Bundskat (12,01%)»
    // og de interpolerede «Kommuneskat (22,1%)» / «Kirkeskat (0,80%)».
    const bruttoNetto = renderMedLocale("da", <LoenBeregner />);
    expect(bruttoNetto).toContain("AM-bidrag (8 %)");
    expect(bruttoNetto).toContain("Bundskat (12,01 %)");
    expect(bruttoNetto).toMatch(/Kommuneskat \([\d.,]+ %\)/);
    expect(bruttoNetto).toMatch(/Kirkeskat \([\d.,]+ %\)/);
  });

  test("de to rettede strenge står med mellemrum", () => {
    const forside = renderToStaticMarkup(
      <HomeContent locale="da" siteName="MinBeregner" />,
    ).replaceAll("<!-- -->", "");
    expect(forside).toContain("tillæg eller fratræk 25 % moms");
    expect(forside).toContain("boafgift (15 %) og tillægsafgift (25 %)");

    const boliglaan = renderBoliglaan("da");
    expect(boliglaan).toContain("ca. 3,5-4,0 %");
    expect(boliglaan).toContain("ca. 5,0-7,0 %");
    expect(boliglaan).toContain("95,0 % belåning");
    expect(boliglaan).toContain("Typisk 0,5-1,5 %");

    const feriepenge = renderFeriepenge("da");
    expect(feriepenge).toContain("Feriepenge (12,5 %)");
    expect(feriepenge).toContain("AM-bidrag (8 %)");
    expect(feriepenge).toContain("estimat ~38 %");
  });
});