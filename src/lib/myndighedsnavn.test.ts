/**
 * Myndighedsnavne i brødteksten skal være nutidige.
 *
 * **Hvad fejlen var.** SKAT blev omdannet til **Skattestyrelsen** 1. november
 * 2024, men navnet stod stadig i 13 brødtekstrenge på otte sider: momsens
 * FAQ ("afregner med SKAT"), feriepenge, rentefradrag (både siden og
 * værktøjet), løn-FAQ'erne, biløkonomien, kategorierne og to blogindlæg. Det
 * var ikke en skrivefejl, men en **selvmodsigelse**: `/moms` skrev "afregner
 * med SKAT" i sin FAQ og "Skattestyrelsen" to afsnit længere nede på den
 * samme side, og `/rentefradrag` gjorde det samme.
 *
 * Der er tre grunde til at det er en reel fejl:
 *
 * 1. **Det er et navn på en myndighed, læseren skal indberette til.** Den
 *    gamle myndighed findes ikke længere; "Feriepengene indberettes
 *    automatisk til SKAT" peger på en organisation, der er lukket.
 * 2. **Det er indekseret tekst i FAQ-svar**, altså netop den tekst Google
 *    henter til rich results og til sidens udsnit. `/moms` har 22.464
 *    GSC-visninger, så det er ikke en skrivefejl i en marginal.
 * 3. **En 2026-månedsløn-læser genkender ikke det gamle navn.** Siden hedder
 *    skat.dk stadig, så *domænet* er ikke forældet — kun myndighedsnavnet.
 *
 * **Hvorfor denne test springer to filer over.** `pension-satser.test.tsx`
 * citerer et dokument med dets udgivelsesnavn, og en kildeangivelse må ikke
 * omskrives — den skal være sådan, dokumentet faktisk hed. Testfiler er
 * desuden ikke brødtekst, så de hører ikke hjemme i en port om det, læseren
 * ser. Til gengæld dækker porten hele `src/`, så en ny side der skriver
 * "SKAT" igen fanger sig med det samme.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** Kildeangivelser og testtekster, hvor det gamle navn er korrekt. */
const CITATIONER = new Set(["src/app/pension-satser.test.tsx"]);

function kildeFiler(): string[] {
  const ud: string[] = [];
  const gaa = (dir: string) => {
    for (const navn of readdirSync(dir)) {
      const st = join(dir, navn);
      if (statSync(st).isDirectory()) gaa(st);
      else if (/\.tsx?$/.test(navn)) ud.push(st);
    }
  };
  gaa(join(__dirname, ".."));
  return ud;
}

describe("SKAT er ikke længere navnet på myndigheden", () => {
  const filer = kildeFiler().filter(
    (f) => !/\.test\.tsx?$/.test(f) && !CITATIONER.has(f.replace(`${join(__dirname, "..")}/`, "")),
  );

  test("scannen rammer hele src/, ikke et udvalg", () => {
    // 0 fund på en måler der ikke læser noget er et grønt resultat for
    // ingenting, så antallet låses (samme lære som C176 og målefejl 33).
    expect(filer.length).toBeGreaterThanOrEqual(200);
  });

  test("ingen brødtekst siger stadig SKAT", () => {
    const fund: string[] = [];
    for (const f of filer) {
      const src = readFileSync(f, "utf8");
      // Kun linjer der ikke er en kommentar eller en kildeangivelse. Rester
      // SKAT'er i en //-linje er en note til en udvikler, ikke brødtekst.
      for (const [i, linje] of src.split("\n").entries()) {
        const ren = linje.trim();
        if (ren.startsWith("//") || ren.startsWith("*") || ren.startsWith("/*")) continue;
        if (/\bSKAT\b/.test(linje)) fund.push(`${f.replace(`${join(__dirname, "..")}/`, "")}:${i + 1} ${ren.slice(0, 80)}`);
      }
    }
    expect(fund, `SKAT i brødteksten:\n${fund.join("\n")}`).toEqual([]);
  });

  test("myndigheden hedder Skattestyrelsen, og domænet er stadig skat.dk", () => {
    // Porten må ikke løses ved at slette oplysningen: et navn skal være rigtigt,
    // ikke fraværende. Og domænet SKAT virkede på hed skat.dk skal ikke skrives
    // om — det er det, folk faktisk indberetter på.
    const moms = readFileSync(join(__dirname, "..", "lib/page-data.ts"), "utf8");
    expect(moms).toContain("Skattestyrelsen");
    const blog = readFileSync(
      join(__dirname, "..", "app/blog/skat-2026-alt-du-skal-vide/page.tsx"),
      "utf8",
    );
    expect(blog).toMatch(/skat\.dk/);
  });
});
