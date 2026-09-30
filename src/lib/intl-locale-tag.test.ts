import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getIntlLocale } from "./format";

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
 * A line that chooses between Intl language tags must cover every locale the
 * repo ships. Matched on the tag pair, not on the variable's name, so
 * `pinseLocale === "se" ? "sv-SE" : "da-DK"` counts just like `locale === "se"`.
 *
 * `nb-NO` mellem de to tags er selve prøven: den trearmede kæde
 * `locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK"` rammer
 * stadig parret svensk/dansk, men kun fordi `nb-NO` ligger indeni.
 */
const UDEN_NO_ARM = /"sv-SE"\s*:(?:(?!nb-NO)[\s\S]){0,40}"da-DK"|"da-DK"\s*:(?:(?!nb-NO)[\s\S]){0,40}"sv-SE"/;

/** Sande kommentarer er ikke kode. */
function erKommentar(tekst: string): boolean {
  const t = tekst.trimStart();
  return t.startsWith("//") || t.startsWith("/*") || t.startsWith("*");
}

function findere(): { fil: string; linje: number; tekst: string }[] {
  const fund: { fil: string; linje: number; tekst: string }[] = [];
  for (const fil of alleKilder()) {
    const linjer = readFileSync(fil, "utf8").split("\n");
    linjer.forEach((tekst, i) => {
      if (erKommentar(tekst)) return;
      if (!UDEN_NO_ARM.test(tekst)) return;
      fund.push({ fil: relative(ROOT, fil), linje: i + 1, tekst: tekst.trim() });
    });
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
    expect(erKommentar(docblock)).toBe(true);
    expect(UDEN_NO_ARM.test(docblock)).toBe(true);
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