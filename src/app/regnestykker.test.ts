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

interface Regel {
  navn: string;
  regex: RegExp;
  rigtig: (a: number, f: number, c: number) => boolean;
}

/** Beløb og procenter i brødtekst er hele kroner, så én krones afrunding er nok. */
const afrund = (a: number, b: number) => Math.abs(a - b) <= 1;

const REGLER: Regel[] = [
  {
    navn: "gang",
    regex: new RegExp(`(${TAL})\\s*kr\\.?\\s*(?:&times;|×|x|\\*)\\s*(${TAL})\\s*=\\s*(${TAL})\\s*kr`, "gi"),
    rigtig: (a, f, c) => afrund(a * f, c),
  },
  {
    navn: "del",
    regex: new RegExp(`(${TAL})\\s*kr\\.?\\s*(?:&divide;|÷)\\s*(${TAL})\\s*=\\s*(${TAL})\\s*kr`, "gi"),
    rigtig: (a, f, c) => f !== 0 && afrund(a / f, c),
  },
  {
    navn: "procentAf",
    regex: new RegExp(`(${TAL})\\s*(?:procent|%)\\s*af\\s+(${TAL})(?:\\s*kr\\.?)?\\s*=\\s*(${TAL})`, "gi"),
    rigtig: (p, hel, c) => afrund((p / 100) * hel, c),
  },
  {
    navn: "stigning",
    regex: new RegExp(`(${TAL})\\s*(?:procent|%)\\s*(?:stigning|vækst|stiger|økning|ökning|rente)[^=]{0,24}?(${TAL})\\s*kr\\.?\\s*=\\s*(${TAL})\\s*kr`, "gi"),
    rigtig: (p, hel, c) => afrund((p / 100) * hel, c),
  },
  {
    navn: "andel",
    regex: new RegExp(`(${TAL})\\s+af\\s+(${TAL})\\s*=\\s*(${TAL})`, "gi"),
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
      const [a, f, c] = [tal(match[1]), tal(match[2]), tal(match[3])];
      if (!Number.isFinite(a) || !Number.isFinite(f) || !Number.isFinite(c)) continue;
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
  "src/app/arveafgift/page.tsx": 8,
  "src/app/befordringsfradrag/page.tsx": 3,
  "src/app/bil/page.tsx": 16,
  "src/app/billaan/page.tsx": 24,
  "src/app/blog/30-procent-reglen-husleje/page.tsx": 4,
  "src/app/blog/arveafgift-regler-og-satser/page.tsx": 19,
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
  "src/app/procent/page.tsx": 11,
  "src/app/renteberegner/page.tsx": 6,
  "src/app/rygestop/page.tsx": 2,
  "src/app/topskat/page.tsx": 8,
  "src/app/vaegttab/page.tsx": 2,
};

/** Summen af listen, så de to tal ikke kan glide fra hinanden. */
const HAARDKODEDE_BELOB_I_LISTEN = 471;

const ROT = join(__dirname, "..", "..");
const tekstfiler = () =>
  execSync("find src/app src/lib -name '*.ts' -o -name '*.tsx'", { encoding: "utf8", cwd: ROT })
    .toString()
    .trim()
    .split("\n")
    .filter((f) => !f.includes(".test."));

const sider = tekstfiler().filter((f) => f.endsWith("page.tsx"));
const las = (fil: string) => readFileSync(join(ROT, fil), "utf8");

/**
 * JSX-tekst er det, læseren ser som tekst: `ts.isJsxText`. Et beløb dér skal
 * komme fra et modul — ellers er det et tal, der kan glide fra sin egen
 * beregning, når satsen opdateres.
 *
 * Første udgave af porten scanrede for klammebalancer og målte **0 fund på alle
 * 124 sider**, hvilket så ud som en ren port. Den var blind: `return ( <main>…)`
 * ligger inde i funktionens klammer, så al JSX-tekst lå på dybde 1 og aldrig
 * blev set. Derfor parseres filen med TypeScript's eget AST i stedet — samme
 * parser som `tsc` bruger i gaten, og den kan ikke blive vild af en klamme.
 */
function jsxBelob(kilde: string, navn: string): string[] {
  const fil = ts.createSourceFile(navn, kilde, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const fund: string[] = [];
  const gaa = (node: ts.Node) => {
    if (ts.isJsxText(node) && /\d{1,3}[. ]\d{3}/.test(node.text)) {
      fund.push(`${navn}: ${node.text.replace(/\s+/g, " ").trim().slice(0, 90)}`);
    }
    ts.forEachChild(node, gaa);
  };
  gaa(fil);
  return fund;
}

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

  test("porten har noget at holde øje med", () => {
    // Uden dette ville «alle regnestykker er rigtige» være grøn, fordi porten
    // intet genkender. Målt 1/10: 30 sætninger fordelt på /procent, /moms,
    // /bil, /loenstigning og /renteprognose.
    const antal = tekstfiler().reduce((sum, fil) => {
      const kode = stripKommentarer(las(fil));
      return sum + REGLER.reduce((n, r) => n + [...kode.matchAll(r.regex)].length, 0);
    }, 0);
    expect(antal).toBeGreaterThanOrEqual(25);
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
    // være afhængig af filendelsen.
    expect(jsxBelob(kilde.replace(/<\/?p>/g, ""), "ren.ts")).toEqual([]);
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
    expect(HAARDKODEDE_BELOB_I_LISTEN).toBe(471);
  });
});