import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getIntlLocale } from "./format";
// Stripningen bor her, ikke i denne fil: `test-tidszone.test.ts` læser også
// kun kode, og to kopier af en scanner med tilstand er to steder at vedligeholde.
import { linjeNummer, stripKommentarer } from "./kommentar-scanner";

/**
 * Gate on the locale-tag class, not on a single page.
 *
 * Picking an `Intl` language tag with a two-way ternary —
 * `locale === "se" ? "sv-SE" : "da-DK"` — silently maps `no` to Danish, because
 * the chain has no third arm. Almost every site in the repo therefore writes the
 * tag inline with all three arms:
 *
 *   locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK"
 *
 * which is correct but hand-rolled thirty times over, and `getIntlLocale` is the
 * one place that is allowed to know the map. A reviewer's eye is what catches
 * the missing arm, and on 30/9 it caught six of them across six files — the
 * reasoning behind them is in `docs/plan-arkiv.md`.
 *
 * The difference is not academic: `da-DK` groups thousands with a period
 * ("1.000") and `nb-NO` with a space ("1 000"). Measured in this repo's Node
 * (`da-DK` 12.345 / `sv-SE` 12 345 / `nb-NO` 12 345).
 *
 * So this file reads every source file and fails on the *shape* — a chain that
 * picks one of the tags but never mentions `"nb-NO"`. A site whose variable is
 * already narrowed to `"da" | "se"` by its own type is still in scope on
 * purpose: the day the type widens, the tag must already be right.
 *
 * Hele filen læses som **én streng** med kommentarer fjernet, ikke linje for
 * linje. Review 1/10 fandt herfra: `promille-eksempler.ts` skrev den toarmede
 * kæde fordelt på to linjer, så hver linje var ufarlig for porten — præcis den
 * naturlige linjebrydning, en formatering indsætter, og præcis den fejl porten
 * blev bygget til at fange. Linjeskift kan derfor ikke skjule en kæde.
 *
 * Danish-only literals (`"da-DK"` with no `"sv-SE"` anywhere in the chain) are
 * out of scope. There are dozens — `/pension`'s folkepension tables, the barsel
 * satser — and they are Danish content by design, not a missed `no` arm.
 *
 * Scanningsroden er `src/`. `scripts/` er målt for hånd (30/9: ingen `sv-SE`
 * eller `da-DK` nogen steder), så en ny fil dér skal tilføjes eksplicit.
 */

const ROOT = resolve(__dirname, "..", "..");
const SRC = join(ROOT, "src");

function alleKilder(): string[] {
  const fund: string[] = [];
  const gaa = (mappe: string) => {
    for (const entry of readdirSync(mappe, { withFileTypes: true })) {
      const fuld = join(mappe, entry.name);
      if (entry.isDirectory()) gaa(fuld);
      else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) fund.push(fuld);
    }
  };
  gaa(SRC);
  return fund;
}

/**
 * A chain that chooses between Intl language tags must cover every locale the
 * repo ships. Matched on the tag pair, not on the variable's name, so
 * `pinseLocale === "se" ? "sv-SE" : "da-DK"` counts just like `locale === "se"`.
 *
 * `nb-NO` mellem de to tags er selve prøven: den trearmede kæde
 * `locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK"` rammer
 * stadig parret svensk/dansk, men kun fordi `nb-NO` ligger indeni.
 *
 * **Målt 1/10.** Den gamle form var `/"sv-SE"\s*:(?:(?!nb-NO)[\s\S]){0,40}"da-DK"/`:
 * `\s*:` krævede kolonnen *direkte* efter tagget, så kun mellemrum og skift
 * måtte ligge imellem. Det er derfor `promille-eksempler.ts:110-113` slap
 * igennem — ikke alene fordi den stod på to linjer, men fordi der står kode
 * imellem: `new Intl.NumberFormat("sv-SE").format(n)` har `).format(n)` plus
 * et linjeskift og indrykning mellem tagget og `:`. Fejlen var altså dobbelt,
 * og kun den halve var synlig i review-fundet.
 *
 * Derfor er der nu **to** huller at dække, og de hver sit krav:
 * 1. et `SPAND` der tillader kode, linjeskift og indrykning imellem tag og
 *    kolonne, men **ikke** `nb-NO` (det er den trearmede kæde) og **ikke** `;`
 *    (statementskillet — uden det løber porten fra `fmtKr` ind i `fmtPct` og
 *    melder to *separate* tremarkkede hjælpere som ét fund, målt 2/2 gange),
 * 2. et andet `SPAND` *efter* kolonnen, fordi `? "sv-SE" : "da-DK"` har et
 *    mellemrum mellem `:` og `"da-DK"`. Uden det rammer porten ikke engang den
 *    gamle inline-form (målt: `gammel.test(inline) === true`,
 *    `uden andet SPAND === false`).
 *
 * Vinduet er 120 tegn, ikke 40, fordi en kæde der står på to linjer bruger
 * ~45 af dem på skift og indrykning. Målt 1/10 mod hele `src/`: 0 fund.
 */
const SPAND = "(?:(?!nb-NO)[^;]){0,120}?";
const UDEN_NO_ARM_KILDE = new RegExp(
  `"sv-SE"${SPAND}:${SPAND}"da-DK"|"da-DK"${SPAND}:${SPAND}"sv-SE"`
);

const UDEN_NO_ARM = new RegExp(UDEN_NO_ARM_KILDE.source);
const UDEN_NO_ARM_GLOBAL = new RegExp(UDEN_NO_ARM_KILDE.source, "g");

function findere(): { fil: string; linje: number; tekst: string }[] {
  const fund: { fil: string; linje: number; tekst: string }[] = [];
  for (const fil of alleKilder()) {
    const kode = stripKommentarer(readFileSync(fil, "utf8"));
    for (const match of kode.matchAll(UDEN_NO_ARM_GLOBAL)) {
      fund.push({
        fil: relative(ROOT, fil),
        linje: linjeNummer(kode, match.index ?? 0),
        tekst: kode.split("\n")[linjeNummer(kode, match.index ?? 0) - 1]?.trim() ?? "",
      });
    }
  }
  return fund;
}

describe("Intl-sprogvalg dækker alle tre sprog", () => {
  it("ingen fil vælger svensk/dansk tag uden en no-arm", () => {
    const fund = findere();
    expect(
      fund.map((f) => `${f.fil}:${f.linje}  ${f.tekst}`).join("\n")
    ).toBe("");
  });

  it("porten ved at en no-arm derude kan fejle", () => {
    // Reverse-verified: the exact chain the gate bans, with and without the
    // missing arm. Without this the gate could pass while matching nothing.
    const medNo = `locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK"`;
    const udenNo = `locale === "se" ? "sv-SE" : "da-DK"`;
    expect(UDEN_NO_ARM.test(medNo)).toBe(false);
    expect(UDEN_NO_ARM.test(udenNo)).toBe(true);
  });

  it("porten ser en toarmet kæde der er brudt over to linjer", () => {
    // Review-fund 1/10: `promille-eksempler.ts:110-113` skrev kæden sådan, og
    // den gamle port læste filen **linje for linje**, så hver linje var
    // ufarlig. Uden denne test kunne porten blive grøn igen uden at se den
    // naturligste linjebrydning af alle — den en formatering indsætter.
    const brudt = [
      `  const antal =`,
      `    locale === "se"`,
      `      ? new Intl.NumberFormat("sv-SE").format(genstande)`,
      `      : new Intl.NumberFormat("da-DK").format(genstande);`,
    ].join("\n");

    // Bevis først at prøven faktisk rammer teksten …
    expect(UDEN_NO_ARM.test(brudt)).toBe(true);
    // … og at ingen enkelt linje gør det, for det er hele fejlen.
    for (const linje of brudt.split("\n")) expect(UDEN_NO_ARM.test(linje)).toBe(false);
    // Så at hele filen — med kommentarer fjernet — også rammer den.
    expect(UDEN_NO_ARM.test(stripKommentarer(brudt))).toBe(true);
    // Og at den trearmede udgave af præcis samme layout slipper igennem.
    const brudtMedNo = brudt.replace(
      `: new Intl.NumberFormat("da-DK")`,
      `: locale === "no" ? "nb-NO" : "da-DK"`
    );
    expect(UDEN_NO_ARM.test(brudtMedNo)).toBe(false);
  });

  it("porten lokaliserer fundet på den rigtige linje", () => {
    // Linjeskift i kæden betyder at fundets linje ikke er kædens første linje.
    // Uden denne test kunne porten rapportere linje 1 for alt, og en rettelse
    // kunne slette det rigtige og lade porten grøn.
    const kode = stripKommentarer(
      [
        `const x = 1;`,
        `const antal =`,
        `  locale === "se"`,
        `    ? new Intl.NumberFormat("sv-SE").format(n)`,
        `    : new Intl.NumberFormat("da-DK").format(n);`,
      ].join("\n")
    );
    const match = [...kode.matchAll(UDEN_NO_ARM_GLOBAL)][0];
    expect(match).toBeDefined();
    // Fundet begynder ved `"sv-SE"` på linje 4 — altså ikke kædens første
    // linje. Uden linjenummerering ville porten pege på `const x = 1;`.
    expect(linjeNummer(kode, match?.index ?? 0)).toBe(4);
  });

  it("danske enkeltstående literals er ikke i portens skudfelt", () => {
    // `/pension` går hundredvis af gange gennem den her linje med vilje.
    const dansk = `value.toLocaleString("da-DK")`;
    const svenskEgen = `const localeTag = "sv-SE";`;
    expect(UDEN_NO_ARM.test(dansk)).toBe(false);
    expect(UDEN_NO_ARM.test(svenskEgen)).toBe(false);
  });

  it("en kommentar der citere den gamle kæde er ikke et fund", () => {
    // `alder-levet.ts` beskriver i sin docblock præcis den kæde porten
    // forbyder, fordi den blev fundet der. At tælle den ville gøre porten
    // umulig at rette: rettelsen *er* at slette linjen fra koden, mens
    // forklaringen med vilje bliver stående.
    const docblock = ` * \`locale === "se" ? "sv-SE" : "da-DK"\`, som gav norsk \`da-DK\``;
    // Råt rammer porten — den er altså ikke forsvunden fra regexen …
    expect(UDEN_NO_ARM.test(docblock)).toBe(true);
    // … men kommentar-stripningen er grunden til at den ikke er et fund.
    expect(stripKommentarer(`/**\n${docblock}\n */`).trim()).toBe("");
    expect(UDEN_NO_ARM.test(stripKommentarer(`/**\n${docblock}\n */`))).toBe(false);
  });

  it("stripning bevarer linjenumre, så fund rapporteres rigtigt", () => {
    // Blokkommentarer må ikke flytte linjetallene: ellers peger et fund på
    // den forkerte linje, og en rettelse rammer den forkerte kode.
    const kode = `const a = 1;\n/*\n * fem\n * linjer\n * her\n */\nconst b = 2;`;
    const strippet = stripKommentarer(kode);
    expect(strippet.split("\n").length).toBe(kode.split("\n").length);
    expect(strippet.split("\n")[6]).toBe("const b = 2;");
    // Og en `//` i en URL må ikke slette koden der står bagefter på linjen.
    const url = `const base = "https://minberegner.dk"; const tag = "da-DK";`;
    expect(stripKommentarer(url)).toContain(`"da-DK"`);
  });

  it("et '/*' i en //-kommentar spiser ikke den kode der følger", () => {
    // Målt 1/10 i `src/app/dato/page.tsx:30`: `// … \`/dage-til/*\`-siderne …`.
    // Tømmer man blokkommentarer FØR linjekommentarer, åbner det `/*` en
    // "blokkommentar" helt til næste `*/` og tømmer 13 linjer rigtig kode —
    // og porten bliver blind for præcis den slags fejl den skal fange.
    const kode = [
      `// en kommentar der nævner \`/dage-til/*\``,
      `// og en mere`,
      `const dageTilLinks = isDageTilLocale(locale)`,
      `  ? getDageTilEvents(locale).map((e) => e.slug)`,
      `  : [];`,
    ].join("\n");
    const strippet = stripKommentarer(kode);
    expect(strippet.split("\n")[2]).toBe("const dageTilLinks = isDageTilLocale(locale)");
    expect(strippet.split("\n")[4]).toBe("  : [];");
    expect(stripKommentarer(kode).split("\n").length).toBe(kode.split("\n").length);
  });

  it("stripningen sletter ingen kode i noget af src/", () => {
    // Sidste lås. Ovenstående er eksempler på den fejlklasse; her måles den
    // mod hele kilden, så et nyt `/*` i en kommentar et sted i `src/` ikke kan
    // slå portens syn blind uden at dette går rødt.
    //
    // Oracle'en er en **uafhængig** tokenizer (regex, kun til at finde hvilke
    // linjer der overhovedet er kode) — ikke `stripKommentarer` selv, ellers
    // måler testen sin egen fejl. Første forsøg talte `(`/`=`/`.` og var grøn
    // for de forkerte grunde, fordi kommentarer også har tegn; en anden
    // inddeling af linjerne gav 30 falske fund i `alder/page.tsx`, fordi
    // linjerne *inde i* en blokkommentar ligner kode. Målt 1/10: 0 fejl i 0
    // filer over hele `src/`.
    const oracle = (kilde: string): boolean[] => {
      const erKode = new Array(kilde.split("\n").length).fill(true);
      const genner =
        /\/\*[\s\S]*?\*\/|\/\/[^\n]*|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g;
      for (const m of kilde.matchAll(genner)) {
        if (!m[0].startsWith("//") && !m[0].startsWith("/*")) continue;
        const fra = kilde.slice(0, m.index).split("\n").length - 1;
        const til = kilde.slice(0, m.index + m[0].length).split("\n").length - 1;
        for (let i = fra; i <= til; i += 1) erKode[i] = false;
      }
      return erKode;
    };

    const mistet: string[] = [];
    for (const fil of alleKilder()) {
      const raa = readFileSync(fil, "utf8");
      const rL = raa.split("\n");
      const sL = stripKommentarer(raa).split("\n");
      if (rL.length !== sL.length) {
        mistet.push(`${relative(ROOT, fil)}: ${rL.length} → ${sL.length} linjer`);
        continue;
      }
      const erKode = oracle(raa);
      for (let i = 0; i < rL.length; i += 1) {
        if (erKode[i] && rL[i] !== sL[i]) {
          mistet.push(`${relative(ROOT, fil)}:${i + 1}  ${rL[i].trim().slice(0, 60)}`);
        }
      }
    }
    expect(mistet.slice(0, 10).join("\n")).toBe("");
  });
});

describe("getIntlLocale er det eneste sted der kender kortslaget", () => {
  it("alle tre sprog peger på deres egen tag", () => {
    expect(getIntlLocale("da")).toBe("da-DK");
    expect(getIntlLocale("se")).toBe("sv-SE");
    expect(getIntlLocale("no")).toBe("nb-NO");
  });

  it("norsk og dansk grupperer tusindtal forskelligt", () => {
    // The reason the gate exists. `nb-NO` uses U+00A0, not U+0020 — skrevet med
    // et synligt mellemrum her ville testen have forklaret porten som ulæselig.
    // If ICU ever made the two tags equal, a Norwegian page would stop being
    // wrong and this would be the test to notice.
expect(new Intl.NumberFormat(getIntlLocale("no")).format(1000)).toBe("1\u00A0000");
    expect(new Intl.NumberFormat(getIntlLocale("da")).format(1000)).toBe("1.000");
  });
});