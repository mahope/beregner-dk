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
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { describe, expect, test } from "vitest";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import type { Locale } from "@/lib/i18n";
import AktieskatBeregner from "./AktieskatBeregner";
import AndelsboligBeregner from "./AndelsboligBeregner";
import ArveafgiftBeregner from "./ArveafgiftBeregner";
import BarselBeregner from "./BarselBeregner";
import BillaanBeregner from "./BillaanBeregner";
import BolanBeregner from "./BolanBeregner";
import BoliglaanBeregner from "./BoliglaanBeregner";
import BruttoNettoBeregner from "./BruttoNettoBeregner";
import BudgetBeregner from "./BudgetBeregner";
import DagpengeBeregner from "./DagpengeBeregner";
import DelRegningBeregner from "./DelRegningBeregner";
import Elberegner from "./Elberegner";
import EnRepMaxBeregner from "./EnRepMaxBeregner";
import FeriepengeBeregner from "./FeriepengeBeregner";
import ForbrugslaanBeregner from "./ForbrugslaanBeregner";
import { HomeContent } from "./HomeContent";
import HuslejeBudgetBeregner from "./HuslejeBudgetBeregner";
import KalorieBeregner from "./KalorieBeregner";
import LaaneBeregner from "./LaaneBeregner";
import LoenBeregner from "./LoenBeregner";
import LonEfterSkattBeregner from "./LonEfterSkattBeregner";
import MomsBeregner from "./MomsBeregner";
import OpsparingsBeregner from "./OpsparingsBeregner";
import RabatBeregner from "./RabatBeregner";
import RentefradragBeregner from "./RentefradragBeregner";
import SkattefradragBeregner from "./SkattefradragBeregner";
import SygedagpengeBeregner from "./SygedagpengeBeregner";
import TerminBeregner from "./TerminBeregner";
import TopskatBeregner from "./TopskatBeregner";

/** Samme mønster som `procentUdenMellemrum()` i `regnestykker.test.ts`. */
const PROCENT_UDEN_MELLEMRUM = /[0-9]+(?:[.,][0-9]+)?%/g;

/**
 * 3/10 21:0x: de to renderede porte i denne fil er **blinde for resultatblokke**.
 *
 * **Målt.** Sæt `{HOEJ_SATS_PCT}%` tilbage i `RentefradragBeregner.tsx:275` og
 * kør porten: **grøn**. Det samme gælder `RabatBeregner`, `SygedagpengeBeregner`
 * og `Elberegner`. Årsagen er ikke en fejl i porten, men i den måde den får
 * markup på: `renderToStaticMarkup(<RentefradragBeregner />)` giver komponenten
 * dens **tomme** starttilstand, så linjerne under `{result.lowRateAmount > 0 && …}`
 * renderer aldrig. De procenter, porten *opfanger*, er dem i informationskasser,
 * der er monteret altid.
 *
 * `regnestykker.test.ts`s scanner ser dem heller ikke: den dømmer `JsxText` med
 * `/\d%/`, og tekstnoden efter `{HOEJ_SATS_PCT}` er kun `%` — der står intet
 * ciffer i den. Så de to eksisterende porte er blinde for præcis den fejl, de
 * blev skrevet til at fange.
 *
 * Derfor dømmer `interpolationUdenMellemrum()` nedenfor **kilden**: en
 * tekstnode (JSX eller template) der *begynder* med `%` kan umuligt have et
 * mellemrum foran, fordi den begynder lige der hvor en interpolation eller et tag
 * sluttede. Det er statisk, altså uafhængigt af hvilken tilstand komponenten
 * renderer i — og det er derfor porten fanger alle fire.
 *
 * Mærket er `^%` og ikke `^\s*%`: `{" "}` og linjeskift giver ofte et mellemrum
 * i den rå kilde, som JSX så kollapser *bort* — `{HOEJ_SATS_PCT} %` og
 * `{HOEJ_SATS_PCT}%` renderer ens, men kun det første er rigtigt. En tekstnode
 * der begynder med `%` uden mellemrum kan derimod aldrig få et senere.
 *
 * `style={{ width: \`${pct}%\` }}` er derimod CSS, ikke tekst, og er undtaget:
 * 11 af de 91 fund i korpuset ligger i `Elberegner` alene, og de skal stå.
 *
 * Endnu en undtagelse, målt 3/10 21:1x: `<span …>%</span>` som **badge** på
 * et talfelt (`TopskatBeregner:181`, `RabatBeregner:149`). Cifrene står i
 * `<input>` ved siden af, og `%` er en absolut positioneret pille — den skal
 * stå. Derfor kræver reglen at tekstnoden følger efter en **interpolation**;
 * følger den efter et tag, er den en selvstændig pille og ikke en sammenlimet
 * procent. I en template literal (`${x}%`) er forgængeren altid en
 * interpolation, så der regnes der uafhængigt af søskendene.
 */
function interpolationUdenMellemrum(kilde: string, navn: string): string[] {
  const fil = ts.createSourceFile(navn, kilde, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const fund: string[] = [];
  const erCss = (node: ts.Node): boolean => {
    for (let n: ts.Node | undefined = node; n; n = n.parent) {
      if (ts.isJsxAttribute(n) && ts.isIdentifier(n.name) && n.name.text === "style") return true;
    }
    return false;
  };
  /** Står denne tekstnode lige efter en `{…}`-interpolation? */
  const foerGaerErInterpolation = (node: ts.JsxText): boolean => {
    const forældre = node.parent;
    if (!ts.isJsxElement(forældre) && !ts.isJsxFragment(forældre)) return false;
    const i = forældre.children.indexOf(node as ts.JsxChild);
    return i > 0 && ts.isJsxExpression(forældre.children[i - 1]);
  };
  const gaa = (node: ts.Node) => {
    const erIInterpolation =
      ts.isTemplateTail(node) ||
      ts.isTemplateMiddle(node) ||
      (ts.isJsxText(node) && foerGaerErInterpolation(node));
    if (erIInterpolation && /^%/.test(node.text) && !erCss(node)) {
      const linje = fil.getLineAndCharacterOfPosition(node.getStart(fil)).line + 1;
      fund.push(`${navn}:${linje} …${node.text.trim().slice(0, 40)}`);
    }
    ts.forEachChild(node, gaa);
  };
  gaa(fil);
  return fund;
}

/** De `.ts`/`.tsx` under `src`, der er tekst brugeren læser. */
const alleTekstfiler = execSync(
  "find src/app src/components src/lib \\( -name '*.ts' -o -name '*.tsx' \\) ! -name '*.test.ts' ! -name '*.test.tsx'",
  { encoding: "utf8" },
)
  .toString()
  .trim()
  .split("\n");

/**
 * Navne-undtagelser: «30 %-reglen» er **regelnavnet**, ikke en procent der er
 * skrevet forkert — samme liste som i `regnestykker.test.ts`. De tre sprog
 * skriver regelnavnet på hver sin måde, og de skal stå.
 */
const REGELNAVN = ["30% reglen", "30%-regeln", "30%-regelen"];

function synligeProcenter(markup: string): string[] {
  // Fjern det, der ikke er synlig tekst: attributværdier og <script>/<style>.
  let synlig = markup
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/="[^"]*"/g, '=""');
  for (const navn of REGELNAVN) synlig = synlig.replaceAll(navn, " ");
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

/**
 * F5c-slice 3/10 12:2x: de **næste** tretten beregnere med interpolationer.
 * Målt med `grep -n '}%' src/components/*.tsx` og filtreret væk fra
 * `style={{ width: "…" }}`, der ikke er synlig tekst. Rækken er taget i
 * `/promille`-rækkefølge: den ældste fejlstype først.
 *
 * `BruttoNettoBeregner` kommer med, fordi `/brutto-netto` importerer **den** —
 * `LoenBeregner` i listen ovenfor er en anden side. Dens linje 322 skrev
 * desuden både «33.94%» og «33.94 kr.» råt, altså punktum i dansk markup.
 */
const INTERPOLATIONSKOMPOENTER_2 = [
  { navn: "en-rep-max", Component: EnRepMaxBeregner },
  { navn: "moms", Component: MomsBeregner },
  { navn: "dagpenge", Component: DagpengeBeregner },
  { navn: "budget", Component: BudgetBeregner },
  { navn: "huslejebudget", Component: HuslejeBudgetBeregner },
  { navn: "billaan", Component: BillaanBeregner },
  { navn: "forbrugslaan", Component: ForbrugslaanBeregner },
  { navn: "aktieskat", Component: AktieskatBeregner },
  { navn: "andelsbolig", Component: AndelsboligBeregner },
  { navn: "delregning", Component: DelRegningBeregner },
  { navn: "lon-efter-skat", Component: LonEfterSkattBeregner },
  { navn: "barsel", Component: BarselBeregner },
  { navn: "arveafgift", Component: ArveafgiftBeregner },
  { navn: "brutto-netto-gammel", Component: BruttoNettoBeregner },
] as const;

/**
 * F5c-slice 3/10 21:1x: de **syv** næste beregnere med interpolationer.
 * Målt med `grep -n '}%' src/components/*.tsx` og filtreret væk fra
 * `style={{ width: "…" }}`, der ikke er synlig tekst — de CSS-bredder står
 * uændrede, ellers ville porten dømme dem som brødtekst.
 *
 * De 23 procenter stod i den synlige markup på sider med målt trafik:
 * `/rentefradrag` (442 besøgende/28d, +207 %), `/topskat`, `/termin`,
 * `/sygedagpenge`, `/rabat`, `/skattefradrag` og `/elberegner`.
 * `RentefradragBeregner` skrev «Fradrag 22% af 50.000 kr.», «Effektiv
 * fradragssats: 15,3%» og «Staten betaler reelt 15,3% af dine renteudgifter»,
 * altså samme fejl som F5e's kommunesatslinje: et tal der er interpoleret
 * råt, så der ikke kan være et mellemrum.
 */
const INTERPOLATIONSKOMPOENTER_3 = [
  { navn: "rentefradrag", Component: RentefradragBeregner },
  { navn: "topskat", Component: TopskatBeregner },
  { navn: "skattefradrag", Component: SkattefradragBeregner },
  { navn: "termin", Component: TerminBeregner },
  { navn: "sygedagpenge", Component: SygedagpengeBeregner },
  { navn: "rabat", Component: RabatBeregner },
  { navn: "elberegner", Component: Elberegner },
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

  test("de interpolerede procenter i de næste tretten beregnere har 0 uden mellemrum", () => {
    // Mutation: sæt `{row.pct}%` tilbage i `EnRepMaxBeregner`, porten skal blive rød.
    for (const { navn, Component } of INTERPOLATIONSKOMPOENTER_2) {
      for (const locale of ["da", "se", "no"] as const) {
        const fund = synligeProcenter(renderMedLocale(locale, <Component />));
        expect(fund, `${navn} (${locale})`).toEqual([]);
      }
    }
  });

  test("de interpolerede procenter i de syv næste beregnere har 0 uden mellemrum", () => {
    // Mutation: sæt `{HOEJ_SATS_PCT}%` tilbage i `RentefradragBeregner`,
    // porten skal blive rød.
    for (const { navn, Component } of INTERPOLATIONSKOMPOENTER_3) {
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

    // Rentefradrag: informationskassen skrev «giver33,6 % i skatteværdi» —
    // der manglede både et mellemrum foran tallet (JSX fjerner linjeskiftet
    // før en interpolation) og et bagved, fordi satsen var interpoleret råt.
    const rentefradrag = renderMedLocale("da", <RentefradragBeregner />);
    expect(rentefradrag).toMatch(/giver [\d.,]+ % i skatteværdi\./);
    expect(rentefradrag).toMatch(/grænsen giver [\d.,]+ %\./);
    expect(rentefradrag).not.toMatch(/giver[\d]/);

    // Topskat: «Kommuneskat (22,1%)» og «Kirkeskat (0,80%)».
    const topskat = renderMedLocale("da", <TopskatBeregner />);
    expect(topskat).toMatch(/Kommuneskat \([\d.,]+ %\)/);
    expect(topskat).toContain("AM-bidrag (8 %)");
    expect(topskat).toContain("Bundskat (12,01 %)");
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
describe("procenttal i interpoleret tekst", () => {
  /**
   * Målt 3/10 21:0x med `grep -rc '}%' src`: **91** forekomster i 37 filer.
   * Heraf er 15 CSS (`style={{ width: \`${pct}%\` }}`), som scanneren udelader,
   * så de 76 er synlig tekst. Porten målte derfor et **loft** på 40, mens den
   * egen måling 3/10 21:5x fandt **35** — planens «40 fund på 26 sider» var
   * loftet, ikke fundene.
   *
   * 3/10 22:0x er alle 35 rettet i de 14 filer, de lå i, så loftet er **0**
   * og klassen er lukket: en ny `{tal}%` kan ikke gemme sig i en gammel bunke,
   * fordi der ikke længere er nogen.
   */
  const INTERPOLATION_LOFT = 0;

  test("scanneren ser en manglende plads og lader CSS være", () => {
    const fund = interpolationUdenMellemrum(
      [
        "const r = <p>Fradrag {SATS}% af {belob} kr.</p>;",
        'const t = `Svarer til ${pct}% af lønnen`;',
        "const css = <div style={{ width: `${pct}%` }} />;",
        'const rigtig = <p>Fradrag {SATS} % af {belob} kr.</p>;',
        "const css2 = <div style={{ width: `${pct} %` }} />;",
      ].join("\n"),
      "scanner.tsx",
    );
    // Mutation: fjern `erCss`-grenen, så CSS'en tælles med og de to fund bliver fire.
    expect(fund).toHaveLength(2);
    expect(fund[0]).toBe("scanner.tsx:1 …% af");
    expect(fund[1]).toBe("scanner.tsx:2 …% af lønnen");
    // En interpolation er kode: skal den have `%`, skal pladsen være i teksten.
    expect(interpolationUdenMellemrum("const x = `Svarer til ${p} af løn`;", "i.ts")).toEqual([]);
    // En badge efter et tag er en selvstændig pille, ikke en sammenlimet procent.
    expect(
      interpolationUdenMellemrum("const b = <span>1</span><span>%</span>;", "b.tsx"),
    ).toEqual([]);
  });

  test("de syv beregnere fra denne slice har 0 manglende pladser", () => {
    // Mutation: sæt `{HOEJ_SATS_PCT}%` tilbage i `RentefradragBeregner`,
    // porten skal blive rød — det kan den renderede port ikke, målt 3/10 21:0x.
    const svyv = [
      "RentefradragBeregner",
      "TopskatBeregner",
      "SkattefradragBeregner",
      "TerminBeregner",
      "SygedagpengeBeregner",
      "RabatBeregner",
      "Elberegner",
    ].map((n) => `src/components/${n}.tsx`);
    for (const fil of svyv) {
      expect(interpolationUdenMellemrum(readFileSync(fil, "utf8"), fil), fil).toEqual([]);
    }
  });

  test("korpuset har ikke fået flere manglende pladser", () => {
    // Loftet er målt: 91 rå fund → 76 efter CSS-fradraget → 40 efter de tre
    // første slices → **35** målt forfra → **0** efter 3/10 22:0x-slice'en.
    // Det må ikke stige i det stille, fordi så kommer den nye skrivemåde ind i
    // en ny side ubemærket — og der er ingen undtagelse længere, kun CSS.
    const fund = alleTekstfiler.flatMap((fil) =>
      interpolationUdenMellemrum(readFileSync(fil, "utf8"), fil),
    );
    expect(fund).toEqual([]);
    expect(INTERPOLATION_LOFT).toBe(0);
  });
});
