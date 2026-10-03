/**
 * Port for lagrings-påstande om ruten (punkt 11: påstande i tekst er kode).
 *
 * Fundet den 29/9: `/afstand-mellem-adresser` lovede **to gange**, i brødteksten
 * og i det FAQ-svar `FAQSchema` publicerer som JSON-LD, at værktøjet «Vi gemmer
 * hverken adresse eller rute». `rute.ts` har derimod altid skrevet ruten i
 * serverens hukommelse under nøglen med de to koordinater, og
 * `privatlivspolitik` sagde det rigtigt. Siden og politikken modsagde altså
 * hinanden om præcis samme kode, og den nye side var den forkerte af de to.
 *
 * Derfor ligger levetiden og sætningen om den nu i ét modul
 * (`rute-cache.ts`), som både koden og begge sider læser, og denne port dømmer:
 *
 *   1. ingen fil i `src/` må love at hverken adresse eller rute gemmes,
 *   2. siden og dens FAQ-svar skal begge indeholme den delte sætning, så de
 *      ikke kan glide fra hinanden igen,
 *   3. tallet i sætningen skal være det, `findRute` faktisk bruger — det måles
 *      i `rute.test.ts`, fordi en konstant man kan læse, kan man bare glemme at
 *      opdatere.
 *
 * Mutation: sæt `ruteCacheSætning()` tilbage til det rene løfte, så er prøverne
 * 2 og 3 røde; sæt TTL'en til en anden værdi end `RUTE_CACHE_DAGE`, så er
 * målingen i `rute.test.ts` rød.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { getPageData } from "./page-data";
import { RUTE_CACHE_DAGE, ruteCacheSætning } from "./rute-cache";

const ROOT = resolve(import.meta.dirname, "..", "..");
const SRC = join(ROOT, "src");

/**
 * Det gamle løfte, i de to former det stod i. Punktum begrænser søgningen til
 * én sætning, så den nye sætning («Vi gemmer hverken dine adresser.» — ingen
 * "rute" i samme sætning) ikke fanges ved et uheld.
 */
const LOEFTE_OM_INGEN_LAGRING = /gemmer hverken[^.]*\bruten?\b/i;

function kildekode(): { fil: string; tekst: string }[] {
  const fund: { fil: string; tekst: string }[] = [];
  const gaa = (mappe: string) => {
    for (const indhold of readdirSync(mappe)) {
      const sti = join(mappe, indhold);
      if (statSync(sti).isDirectory()) {
        gaa(sti);
      } else if (/\.tsx?$/.test(indhold) && !indhold.endsWith(".test.ts") && !indhold.endsWith(".test.tsx")) {
        fund.push({ fil: sti.slice(ROOT.length + 1), tekst: readFileSync(sti, "utf8") });
      }
    }
  };
  gaa(SRC);
  return fund;
}

describe("lagrings-påstand om ruten", () => {
  test("ingen fil i src/ lover at hverken adresse eller rute gemmes", () => {
    const brud = kildekode()
      .filter(({ tekst }) => LOEFTE_OM_INGEN_LAGRING.test(tekst))
      .map(({ fil }) => fil);
    expect(brud).toEqual([]);
  });

  test("sætningen siger det samme antal dage som konstanten", () => {
    expect(ruteCacheSætning()).toContain(`${RUTE_CACHE_DAGE} dage`);
    // Konstanten skal være et helt antal dage — en TTL på 6,5 dage ville være
    // sand i koden og falsk i sætningen, fordi den siger «7 dage».
    expect(Number.isInteger(RUTE_CACHE_DAGE)).toBe(true);
    expect(RUTE_CACHE_DAGE).toBeGreaterThan(0);
  });

  test("siden og dens FAQ-svar bruger den delte sætning, så de ikke kan glide fra hinanden", () => {
    const sætning = ruteCacheSætning();
    const side = readFileSync(join(SRC, "app", "afstand-mellem-adresser", "page.tsx"), "utf8");
    const svar = getPageData("afstand-mellem-adresser", "da")?.faqItems[0].answer ?? "";

    expect(side).toContain("ruteCacheSætning()");
    expect(svar).toContain(sætning);
    expect(svar).not.toMatch(LOEFTE_OM_INGEN_LAGRING);
  });

  test("privatlivspolitikken og siden taler samme sag om lagringen", () => {
    const politik = readFileSync(join(SRC, "app", "privatlivspolitik", "page.tsx"), "utf8");
    // Politikken skrev «kortvarigt», altså uden et tal den kunne blive forkert
    // på, og den lovede «hverken ... koordinater», hvilket aldrig har været
    // sandt: nøglen i cachen *er* de to koordinater. Nu bruger den samme
    // sætning som siden og dens FAQ, så de tre steder ikke kan glide fra
    // hinanden.
    expect(politik).toContain("ruteCacheSætning()");
    expect(politik).not.toContain("kortvarigt i serverens hukommelse");
    expect(politik).not.toMatch(/hverken adresser, koordinater/);
  });
});
