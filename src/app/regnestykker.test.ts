import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import ts from "typescript";
import { describe, expect, test } from "vitest";

import { linjeNummer, stripKommentarer } from "@/lib/kommentar-scanner";

/**
 * Påstande i tekst er kode (punkt 11 i kvalitetsreglerne).
 *
 * `/rentefradrag` skrev 1/10 sit «Eksempel» med «50.000 × 33,6 % = 16.800 kr.»
 * håndskrevet, mens hele resten af siden læste `RENTEFRADRAG_2026`. Tallene var
 * lige rigtige — og ville ikke have været det i 2027. Samme fejlklasse findes på
 * 29 blogindlæg og 124 sider, og ingen af dem kan ses af `tsc`, lint eller build,
 * fordi en streng med et tal er gyldig JSX.
 *
 * Denne port måler i stedet for at formode:
 *
 * 1. **Regnestykker.** Hver «A kr × F = C kr», «A kr ÷ F = C kr»,
 *    «P procent af H = R» og «A af B = P» i al brødtekst på sitet regnes igen
 *    med tallene fra sætningen selv. Et forkert regnestykke er en rød port.
 *    Også kæder («40.000 kr/måned × 12 × 1% = 4.800 kr») og kæder uden `kr`
 *    efter første faktor («50.000 × 33,6 % = 16.800 kr.»), som er sitets egen
 *    notationsform.
 * 2. **Hårdkodede beløb i JSX.** Et beløb med tusindtalsseparator må ikke stå som
 *    tekst i `page.tsx` — det skal komme fra et modul gennem `{…}`. Målt 1/10:
 *    0 fund på tværs af alle 124 sider.
 *
 * Begge dele scanner filerne i repoet, ikke et kodestykke, så en ny side er
 * dækket automatisk.
 */

/**
 * Et tal i dansk eller svensk skrivemåde: `1.000`, `1 000`, `1.250,50`, `0,20`.
 *
 * Begge separatorer er nødvendige: `/moms`' danske sider skriver «1.250 kr» og de
 * svenske «1 250 kr», og en port der kun kendte punktum ville have læst et
 * svensk beløb som to tal og derefter dømt sætningen forkert.
 */
const TAL = "\\d{1,3}(?:[. ]\\d{3})+(?:,\\d+)?|\\d+(?:,\\d+)?";

/**
 * `TAL` skal **altid** pakkes i en gruppe, når den indsættes i en større
 * mønsterstreng. Den indeholder selv et `|`, så en blot indsættelse lader
 * alternativet løbe ud af den gruppe, det skulle være lukket i — og mønsteret
 * matcher så tal, der slet ikke har noget med regnestykket at gøre.
 */
const T = `(?:${TAL})`;

/** Gange- og delingstegn, i de skrivemåder JSX og brødtekst bruger. */
const MUL = "(?:&times;|×|x|\\*)";
const DIV = "(?:&divide;|÷)";

/** Ét led i en kæde: tegn, faktor, valgfrit procenttal. */
const LED = `(?:${MUL}|${DIV})\\s*${T}\\s*%?\\s*`;

/**
 * Hvor en regel må begynde at læse.
 *
 * Uden `START` så et regnestykke læses fra en **midterste** faktor: «40.000
 * kr/måned × 12 × 1% = 4.800 kr» blev læst som «12 × 1% = 4.800 kr», fordi
 * `×` ikke var en del af mønsteret. Første faktor springes så over, og porten
 * erklærer en rigtig sætning forkert. De tre betingelser er:
 *
 * - ikke lige efter et gange-/delingstegn (altså ikke midt i en kæde),
 * - ikke lige efter et `x` med luft omkring («max 2.000 kr», ikke «× 2.000»),
 * - ikke midt i et tal, så «40.000» ikke kan læses som «0.000».
 */
const START = "(?<![×*÷&;]\\s*)(?<!\\s[xX]\\s)(?<![.\\d])";

/**
 * Enheden på første faktor. `kr` er **valgfrit**, fordi sitets mest brugte
 * notationsform skriver beløbet uden den — «50.000 × 33,6 % = 16.800 kr.» — og
 * en regel, der kræver `kr` lige efter første faktor, ser **ingen** af dem.
 * Slash-enheder («40.000 kr/måned») er med, fordi de står i rigtige kæder på
 * feriepenge-siden.
 */
const ENHED = "(?:kr\\.?\\s*(?:\\/[a-zA-ZæøåÆØÅäöü]{1,12})?)?";

interface Regel {
  navn: string;
  regex: RegExp;
  /** Er gruppe 2 en kæde af operatorer og faktorer frem for ét tal? */
  kæde?: boolean;
  rigtig: (a: number, f: number, c: number) => boolean;
}

/** Beløb og procenter i brødtekst er hele kroner, så én krones afrunding er nok. */
const afrund = (a: number, b: number) => Math.abs(a - b) <= 1;

/**
 * Ganger en kæde sammen til **én** faktor, så «× 12 × 1%» bliver 0,12 og «÷
 * 1,25» bliver 0,8. Begge regler bruger så samme dom: `a × faktor = c`.
 * `null` betyder at kæden ikke indeholdt noget brugbart.
 */
function foldér(kæde: string): number | null {
  let værdi = 1;
  let led = 0;
  for (const m of kæde.matchAll(/(÷|&divide;|×|&times;|\*|x)\s*(\d[\d.,]*)\s*(%?)/gi)) {
    const n = tal(m[2]) * (m[3] ? 0.01 : 1);
    if (!Number.isFinite(n) || n === 0) return null;
    const tegn = m[1].toLowerCase();
    værdi = tegn === "÷" || tegn === "&divide;" ? værdi / n : værdi * n;
    led++;
  }
  return led > 0 ? værdi : null;
}

const REGLER: Regel[] = [
  {
    navn: "gang",
    regex: new RegExp(
      `${START}(${T})\\s*${ENHED}\\s*(${MUL}\\s*${T}\\s*%?\\s*(?:${LED})*?)\\s*=\\s*(${T})\\s*kr`,
      "gi",
    ),
    kæde: true,
    rigtig: (a, f, c) => f !== 0 && afrund(a * f, c),
  },
  {
    navn: "del",
    regex: new RegExp(
      `${START}(${T})\\s*${ENHED}\\s*(${DIV}\\s*${T}\\s*%?\\s*(?:${LED})*?)\\s*=\\s*(${T})\\s*kr`,
      "gi",
    ),
    kæde: true,
    rigtig: (a, f, c) => f !== 0 && afrund(a * f, c),
  },
  {
    navn: "procentAf",
    regex: new RegExp(`(${T})\\s*(?:procent|%)\\s*af\\s+(${T})(?:\\s*kr\\.?)?\\s*=\\s*(${T})`, "gi"),
    rigtig: (p, hel, c) => afrund((p / 100) * hel, c),
  },
  {
    navn: "stigning",
    regex: new RegExp(`(${T})\\s*(?:procent|%)\\s*(?:stigning|vækst|stiger|økning|ökning|rente)[^=]{0,24}?(${T})\\s*kr\\.?\\s*=\\s*(${T})\\s*kr`, "gi"),
    rigtig: (p, hel, c) => afrund((p / 100) * hel, c),
  },
  {
    navn: "andel",
    regex: new RegExp(`(${T})\\s+af\\s+(${T})\\s*=\\s*(${T})`, "gi"),
    rigtig: (del, hel, p) => hel !== 0 && (afrund((del / hel) * 100, p) || afrund((del / p) * 100, hel)),
  },
];

function tal(streng: string): number {
  return Number(streng.replace(/[. ]/g, "").replace(",", "."));
}

/** Ét fund: fil, linje, regel og hele sætningen. */
interface Fund {
  fil: string;
  linje: number;
  regel: string;
  sætning: string;
}

function findFejl(kode: string, fil: string): Fund[] {
  const rå = stripKommentarer(kode);
  const fund: Fund[] = [];
  for (const regel of REGLER) {
    for (const match of rå.matchAll(regel.regex)) {
      const a = tal(match[1]);
      const f = regel.kæde ? foldér(match[2]) : tal(match[2]);
      const c = tal(match[3]);
      if (f === null || !Number.isFinite(a) || !Number.isFinite(f) || !Number.isFinite(c)) continue;
      if (regel.rigtig(a, f, c)) continue;
      fund.push({
        fil,
        linje: linjeNummer(rå, match.index),
        regel: regel.navn,
        sætning: match[0].replace(/\s+/g, " ").trim(),
      });
    }
  }
  return fund;
}

/**
 * Beløb med tusindtalsseparator i JSX-tekst, målt 1/10 med AST-scanneren
 * ovenfor. Listen tæller forekomster pr. fil, ikke filer, så en ny side med et
 * beløb er rød med det samme: den står ikke i listen.
 *
 * Listen må kun blive kortere. `rentefradrag` stod her med 1 fund —
 * «Fordel 95.000 kr. og 5.000 kr. i stedet for 100.000 kr.» — rettet i samme
 * commit af `ULIJ_HAEJ`/`ULIJ_LAV`. Resten er den kø, porten låser.
 */
const HAARDKODEDE_BELOB: Record<string, number> = {
  "src/app/aktieskat/page.tsx": 5,
  "src/app/alder/page.tsx": 1,

  "src/app/befordringsfradrag/page.tsx": 3,
  "src/app/bil/page.tsx": 16,
  "src/app/billaan/page.tsx": 24,
  "src/app/blog/30-procent-reglen-husleje/page.tsx": 4,
  "src/app/blog/arveafgift-regler-og-satser/page.tsx": 15,
  "src/app/blog/biloekonomi-2026-hvad-koster-det-at-eje-bil/page.tsx": 47,
  "src/app/blog/boernepenge-2026-satser-og-regler/page.tsx": 2,
  "src/app/blog/boliglaan-2026-renter-og-afdrag/page.tsx": 4,
  "src/app/blog/boligsalg-2026-guide-til-omkostninger-og-provenu/page.tsx": 42,
  "src/app/blog/dagpenge-saadan-finder-du-din-sats/page.tsx": 3,
  "src/app/blog/elpriser-2026-beregn-dit-forbrug/page.tsx": 10,
  "src/app/blog/fradrag-2026-komplet-guide/page.tsx": 1,
  "src/app/blog/guide-feriepenge-hvornaar-og-hvor-meget/page.tsx": 9,
  "src/app/blog/guide-til-laan-og-renter/page.tsx": 8,
  "src/app/blog/hvordan-beregner-man-moms/page.tsx": 8,
  "src/app/blog/koeb-af-bolig-2026-omkostninger/page.tsx": 21,
  "src/app/blog/kvadratmeter-saadan-regner-du-ud/page.tsx": 5,
  "src/app/blog/leasing-af-bil-2026-pris-og-guide/page.tsx": 13,
  "src/app/blog/maanedsbudget-2026-komplet-guide/page.tsx": 25,
  "src/app/blog/pension-hvor-meget-skal-du-spare-op/page.tsx": 27,
  "src/app/blog/privatoekonomi-for-unge/page.tsx": 9,
  "src/app/blog/saadan-beregner-du-din-reelle-timeloen/page.tsx": 17,
  "src/app/blog/saadan-finder-du-din-timepris-som-freelancer/page.tsx": 10,
  "src/app/blog/skat-2026-alt-du-skal-vide/page.tsx": 5,
  "src/app/blog/spar-penge-paa-braendstof/page.tsx": 2,
  "src/app/boernepenge/page.tsx": 2,
  "src/app/bolan/page.tsx": 1,
  "src/app/boliglaan/page.tsx": 4,
  "src/app/boligsalg/page.tsx": 9,
  "src/app/brok/page.tsx": 1,
  "src/app/brutto-netto/page.tsx": 4,
  "src/app/bryllup/page.tsx": 4,
  "src/app/budget/page.tsx": 2,
  "src/app/dagpenge/page.tsx": 3,
  "src/app/ejendomsvaerdiskat/page.tsx": 6,
  "src/app/elberegner/page.tsx": 2,
  "src/app/enheder/page.tsx": 2,
  "src/app/feriepenge/page.tsx": 4,
  "src/app/flyttebudget/page.tsx": 3,
  "src/app/kalorier/page.tsx": 2,
  "src/app/konfirmation/page.tsx": 6,
  "src/app/kvadratmeter/page.tsx": 1,
  "src/app/loen-efter-skat/page.tsx": 1,
  "src/app/loenstigning/page.tsx": 2,
  "src/app/lon-efter-skatt/page.tsx": 5,
  "src/app/moms/page.tsx": 18,
  "src/app/opsparing/page.tsx": 10,
  "src/app/pension/page.tsx": 2,
  "src/app/renteberegner/page.tsx": 6,
  "src/app/rygestop/page.tsx": 2,
  "src/app/topskat/page.tsx": 8,
  "src/app/vaegttab/page.tsx": 2,
};

/**
 * Summen af listen, så de to tal ikke kan glide fra hinanden.
 *
 * 453 → 448 den 2/10: fem fund var datoer, ikke beløb («Kilde: borger.dk,
 * verificeret 26/9 2026» blev læst som «9 202»), da scanneren ikke krævede at
 * de tre cifre var slut på tallet.
 */
const HAARDKODEDE_BELOB_I_LISTEN = 448;

/**
 * Samme port på de `.tsx`-filer der **ikke** er `page.tsx`: beregnerne i
 * `src/components` og sidens egen ramme (`layout.tsx`, `error.tsx`,
 * `not-found.tsx`, ikonerne). Før 2/10 lå hele mappen uden for porten, og der
 * lå håndskrevne beløb i den: `EfterloensBeregner.tsx` skrev præmieportionen på
 * «15.870 kr.» og «10.580 kr.» to steder, `BolanBeregner.tsx` skrev de svenske
 * satser («100 000 kr») og `LoenBeregner.tsx` skrev «1.000 kr mere i
 * bruttoløn» — selv om modulerne `SKATTEFRI_PRAEMIE_2026`,
 * `SVENSK_BOLAN_2026` og beregningens egen `EKSTRA_BRUTTO` lå i samme kode.
 * Alle fire er nu interpolationer, så listen er **tom**: det første beløb der
 * skrives håndskrevet i en beregner gør porten rød.
 *
 * Kun `.tsx` scannes: TypeScript giver ikke `.ts`-filer lov til JSX, så en
 * `.ts`-fil kan ikke indeholde JSX-tekst, og dens tal er kode — ikke brødtekst.
 */
const HAARDKODEDE_BELOB_I_KOMPONENTER: Record<string, number> = {};

/** Summen af komponentlisten. */
const HAARDKODEDE_BELOB_I_KOMPONENTER_I_LISTEN = 0;


const ROT = join(__dirname, "..", "..");
const tekstfiler = () =>
  execSync("find src/app src/lib -name '*.ts' -o -name '*.tsx'", { encoding: "utf8", cwd: ROT })
    .toString()
    .trim()
    .split("\n")
    .filter((f) => !f.includes(".test."));

const sider = tekstfiler().filter((f) => f.endsWith("page.tsx"));

/** Alle `.tsx` der ikke er `page.tsx` og ikke en test: beregnere og sidens ramme. */
const komponenter = execSync(
  "find src/components src/app -name '*.tsx' ! -name 'page.tsx' ! -name '*.test.tsx'",
  { encoding: "utf8", cwd: ROT }
)
  .toString()
  .trim()
  .split("\n");

const las = (fil: string) => readFileSync(join(ROT, fil), "utf8");

/**
 * JSX-tekst er det, læseren ser som tekst: `ts.isJsxText`. Et beløb dér skal
 * komme fra et modul — ellers er det et tal, der kan glide fra sin egen
 * beregning, når satsen opdateres.
 *
 * Mønstret kræver, at der **ikke** står et ciffer efter de tre (`: (?!\d)`):
 * uden det læser porten en dato som «verificeret 26/9 2026» som beløbet «9 202»
 * og melder en hel beregner ind i listen for en kildeangivelse. Et beløb med
 * decimaler («1.250,50») rammer stadig, fordi der står et komma efter de tre.
 *
 * Første udgave af porten scanner klammebalancer og målte **0 fund på alle 124
 * sider**, hvilket så ud som en ren port. Den var blind: `return ( <main>…)`
 * ligger inde i funktionens klammer, så al JSX-tekst lå på dybde 1 og aldrig
 * blev set. Derfor parseres filen med TypeScript's eget AST i stedet — samme
 * parser som `tsc` bruger i gaten, og den kan ikke blive vild af en klamme.
 *
 * `ScriptKind` læses **af filendelsen**. Før 2/10 stod `TSX` hardkodet, så navnet
 * var ikke rigtigt for en `.ts`-fil, og testen «samme kilde set som TS (ikke
 * TSX) skal give samme svar» bestod kun fordi `<p>` var strippet i inputtet.
 */
function jsxBelob(kilde: string, navn: string): string[] {
  const kind = navn.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const fil = ts.createSourceFile(navn, kilde, ts.ScriptTarget.Latest, true, kind);
  const fund: string[] = [];
  const gaa = (node: ts.Node) => {
    if (ts.isJsxText(node) && /\d{1,3}[. ]\d{3}(?!\d)/.test(node.text)) {
      fund.push(`${navn}: ${node.text.replace(/\s+/g, " ").trim().slice(0, 90)}`);
    }
    ts.forEachChild(node, gaa);
  };
  gaa(fil);
  return fund;
}

/**
 * Hver regels **egen** sætning: én rigtig, der skal være grøn, og én der kun
 * er forskel fra den rigtige ved at resultatet er sat til et forkert tal, som
 * skal være rød — og rød **af den regel**, der er sat på prøven.
 *
 * Før 2/10 var der ingen sådanne sætninger pr. regel, kun ét samlet tal for
 * alle fem. Derfor kunne `gang` miste dækningen i sitets egen notationsform
 * uden at nogen test blev rød: porten var grøn på sider, hvor alle
 * regnestykker var forkerte, fordi den slet ikke så dem.
 *
 * Målt 2/10 med de gamle mønstre: porten så **3 af de 9** forkerte sætninger.
 * De tre den så ikke, var netop dem uden `kr` efter første faktor — to rene
 * («50.000 × 33,6 % = 19.800 kr.») og én i kædeform («40.000 kr/måned × 12 ×
 * 1% = 9.600 kr»).
 */
const KANONISKE: [regel: string, rigtig: string, forkert: string][] = [
  ["gang", "50.000 × 33,6 % = 16.800 kr.", "50.000 × 33,6 % = 19.800 kr."],
  ["gang", "30.000 × 25,6 % = 7.680 kr.", "30.000 × 25,6 % = 10.680 kr."],
  ["gang", "1.000 kr &times; 1,25 = 1.250 kr", "1.000 kr &times; 1,25 = 1.500 kr"],
  ["gang", "40.000 kr/måned × 12 × 1% = 4.800 kr", "40.000 kr/måned × 12 × 1% = 9.600 kr"],
  ["del", "1.000 kr ÷ 1,25 = 800 kr", "1.000 kr ÷ 1,25 = 1.200 kr"],
  ["del", "1 250 kr &divide; 1,25 = 1 000 kr", "1 250 kr &divide; 1,25 = 800 kr"],
  ["procentAf", "10 procent af 10.000 = 1.000", "10 procent af 10.000 = 500"],
  ["stigning", "3 % stigning på 30.000 kr = 900 kr", "3 % stigning på 30.000 kr = 1.200 kr"],
  ["andel", "2.500 af 10.000 = 25", "2.500 af 10.000 = 30"],
];

/**
 * Hvad hver regel ser i korpus, målt 2/10 med mønsterne ovenfor over `src/app`
 * og `src/lib`. Før 2/10 var der ét samlet tal (`antal >= 25`) for alle fem, så
 * en regel der døde gav ingen rød port — `stigning` og `andel` så **0** fund
 * hver, og ingen opdagede det. Nu er der ét tal pr. regel.
 *
 * De to nul-tal er ærlige: sitet skriver ingen sætninger i «P % stigning på H
 * kr = R»- og «A af B = P»-form (kun `procent.ts`'s docblock gør det, og
 * kommentarer strippes). De to regler er derfor dækket af `KANONISKE` ovenfor,
 * så de ikke kan forblive døde i det stille — og de får deres første rigtige
 * sætning den dag siden skriver en.
 *
 * Tællerne er loftpunkter, ikke målsætninger: de må gerne stige. Sænkes de,
 * skal det være en synlig linje i diffen.
 */
const FORVENTEDE_FUND: Record<string, number> = {
  gang: 12,
  del: 8,
  procentAf: 13,
  stigning: 0,
  andel: 0,
};

describe("regnestykker i brødteksten", () => {
  test("porten genkender rigtige og forkerte sætninger i begge skrivemåder", () => {
    // Mutation: porten skal være rød på netop de forkerte sætninger.
    expect(findFejl("<li>1.000 kr &times; 1,25 = 1.500 kr inkl. moms</li>", "t")).toHaveLength(1);
    expect(findFejl("<li>10 procent af 10.000 = 500</li>", "t")).toHaveLength(1);
    expect(findFejl("<li>1.250 kr &times; 0,20 = 250 kr i moms</li>", "t")).toHaveLength(0);
    expect(findFejl("<li>1 250 kr &divide; 1,25 = 1 000 kr</li>", "t")).toHaveLength(0);
    expect(findFejl("<li>10 procent af 10.000 = 1.000</li>", "t")).toHaveLength(0);
    expect(findFejl("<li>2.500 af 10.000 = 25</li>", "t")).toHaveLength(0);
  });

  test("hver regel dømmer sin egen notationsform, også uden kr efter første faktor", () => {
    for (const [regel, rigtig, forkert] of KANONISKE) {
      // Mutation: en regel, der ikke kan se sin egen skrivemåde, ville give 0
      // fund på den forkerte sætning — og porten ville være grøn på fejl.
      const fund = findFejl(`<li>${forkert}</li>`, "t");
      expect(fund, `regel ${regel} så ikke «${forkert}»`).toHaveLength(1);
      expect(fund[0].regel, `forkert sætning blev dømt af den forkerte regel`).toBe(regel);
      expect(findFejl(`<li>${rigtig}</li>`, "t"), `regel ${regel} erklærede «${rigtig}» forkert`).toEqual([]);
    }
  });

  test("hver regel har målt dækning, så ingen kan dø i det stille", () => {
    // Uden dette ville «alle regnestykker er rigtige» være grøn, fordi porten
    // intet genkender.
    const målt: Record<string, number> = {};
    for (const fil of tekstfiler()) {
      const kode = stripKommentarer(las(fil));
      for (const regel of REGLER) {
        målt[regel.navn] = (målt[regel.navn] ?? 0) + [...kode.matchAll(regel.regex)].length;
      }
    }
    for (const [navn, forventet] of Object.entries(FORVENTEDE_FUND)) {
      expect(målt[navn], `dækningen for regel ${navn} har ændret sig`).toBe(forventet);
    }
    // Før 2/10 var summen 26: `stigning` og `andel` så 0 fund hver, og `gang`
    // så kun de sætninger, der skrev `kr` efter første faktor. Nu er den 33.
    expect(Object.values(målt).reduce((a, b) => a + b, 0)).toBe(33);
  });

  test("alle regnestykker på sitet er regnet rigtigt", () => {
    const forkerte = tekstfiler().flatMap((fil) =>
      findFejl(las(fil), fil).map((f) => `${f.fil}:${f.linje} [${f.regel}] ${f.sætning}`),
    );
    expect(forkerte).toEqual([]);
  });
});

describe("beløb i JSX-tekst på siderne", () => {
  test("AST-scanneren ser ren JSX-tekst og springer interpolationer over", () => {
    // Mutation: hvis scanneren så hele filen, ville den finde beløbet i koden
    // under; hvis den så slet intet, ville den finde heller ikke den rene tekst.
    const kilde =
      "export const A = <p>Vi regner med 12.500 kr</p>;\nexport const B = <p>Vi regner med {talt} kr</p>;\n";
    expect(jsxBelob(kilde, "ren.tsx")).toHaveLength(1);
    expect(jsxBelob(kilde, "ren.tsx")[0]).toContain("12.500");
    // Samme kilde set som TS (ikke TSX) skal give samme svar — ellers ville porten
    // være afhængig af filendelsen. Før 2/10 holdt `ScriptKind.TSX` fast, så det
    // var kun `<p>`'s stripning der gjorde den grøn; med endelsen læst af navnet
    // er det en `.ts`-fil, der parseres som TS, og derfor intet JSX-tekst.
    expect(jsxBelob(kilde.replace(/<\/?p>/g, ""), "ren.ts")).toEqual([]);
    // …mens endelsen stadig styrer: samme kode med endelsen bevaret set som `.ts`
    // giver ingen JSX-tekst, fordi TS-parseren læser `<p>` som typeAssertion.
    expect(jsxBelob(kilde, "ren.ts")).toEqual([]);
    // En dato er ikke et beløb: «26/9 2026» må ikke læses som «9 202».
    expect(jsxBelob("<p>Kilde: borger.dk, verificeret 26/9 2026.</p>", "dato.tsx")).toEqual([]);
    expect(jsxBelob("<p>Portionen er 15.870 kr.</p>", "krone.tsx")).toHaveLength(1);
  });

  test("ingen side har flere hårdkodede beløb end listen siger", () => {
    // Målt 1/10 med AST-scanneren på tværs af alle 123 `page.tsx`.
    const fund = sider.flatMap((fil) => jsxBelob(las(fil), fil));
    const prFil = new Map<string, number>();
    for (const f of fund) {
      const fil = f.slice(0, f.indexOf(": "));
      prFil.set(fil, (prFil.get(fil) ?? 0) + 1);
    }

    // En side, der ikke står i listen, har et beløb porten aldrig har set.
    const ukendte = [...prFil.keys()].filter((fil) => !(fil in HAARDKODEDE_BELOB));
    expect(ukendte).toEqual([]);

    // Mutation: læg ét beløb mere ind i en sides tekst, porten skal blive rød.
    const overskredet = Object.entries(HAARDKODEDE_BELOB)
      .filter(([fil, antal]) => (prFil.get(fil) ?? 0) > antal)
      .map(([fil, antal]) => `${fil}: ${(prFil.get(fil) ?? 0)} > ${antal}`);
    expect(overskredet).toEqual([]);

    // At rette en side er altid tilladt — listen er en loftpunktssum, ikke en
    // målsætning — så her tælles det samlede antal mod summen af listen.
    expect(fund.length).toBeLessThanOrEqual(HAARDKODEDE_BELOB_I_LISTEN);
    expect(HAARDKODEDE_BELOB_I_LISTEN).toBe(448);
  });
});

describe("beløb i JSX-tekst i beregnerne", () => {
  test("ingen beregner har flere hårdkodede beløb end listen siger", () => {
    // Målt 2/10 med AST-scanneren på tværs af de 152 `.tsx` uden for
    // `page.tsx`: **4 fund i 3 filer** (Efterloens 2, Bolan 1, Loen 1), alle
    // fire rettet i samme commit — så her er fundtallet **0**. Før rettelsen var
    // det 0 *filer*, så hele `src/components` lå uden for porten.
    const fund = komponenter.flatMap((fil) => jsxBelob(las(fil), fil));
    const prFil = new Map<string, number>();
    for (const f of fund) {
      const fil = f.slice(0, f.indexOf(": "));
      prFil.set(fil, (prFil.get(fil) ?? 0) + 1);
    }

    // En beregner, der ikke står i listen, har et beløb porten aldrig har set.
    const ukendte = [...prFil.keys()].filter(
      (fil) => !(fil in HAARDKODEDE_BELOB_I_KOMPONENTER)
    );
    expect(ukendte).toEqual([]);

    // Mutation: skriv et beløb ind i en beregners tekst, porten skal blive rød.
    const overskredet = Object.entries(HAARDKODEDE_BELOB_I_KOMPONENTER)
      .filter(([fil, antal]) => (prFil.get(fil) ?? 0) > antal)
      .map(([fil, antal]) => `${fil}: ${(prFil.get(fil) ?? 0)} > ${antal}`);
    expect(overskredet).toEqual([]);

    expect(fund.length).toBeLessThanOrEqual(HAARDKODEDE_BELOB_I_KOMPONENTER_I_LISTEN);
    expect(HAARDKODEDE_BELOB_I_KOMPONENTER_I_LISTEN).toBe(0);
  });

  test("porten scanner hele mappen, ikke en håndplukket liste", () => {
    // Mutation: hvis `komponenter` var en tom liste, ville de to tests ovenfor
    // være grønne uden at se noget — præcis den blindhed første udgave af porten
    // havde, da den målte 0 fund på alle 124 sider.
    expect(komponenter.length).toBeGreaterThan(100);
    expect(komponenter).toContain("src/components/EfterloensBeregner.tsx");
    expect(komponenter.some((f) => f.endsWith(".test.tsx"))).toBe(false);
    expect(komponenter.some((f) => f.endsWith("page.tsx"))).toBe(false);
  });
});
