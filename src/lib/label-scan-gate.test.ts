import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

/**
 * The unbound-`<label>` scanner is the measurement behind opgave 89-100, and
 * that measurement was wrong three times in six runs — always in the direction
 * that made the class look bigger than it was (C63: 181/65 vs 151/58, C64:
 * `[^>]*` vs the opening tag, C70: `\bfor=` cannot match `htmlFor=`). A
 * counter that is wrong in the flattering direction is worse than no counter,
 * because the next iteration budgets an hour from it.
 *
 * So each rule gets a **planted** case below: a fixture that the naive version
 * of the rule gets wrong. Reverse-verified — with the detector removed, the
 * case it names fails.
 */

const ROOT = resolve(__dirname, "..", "..");
const SCRIPT = resolve(ROOT, "scripts", "label-a11y-scan.mjs");

type Fund = { fil: string; linje: number; tekst: string; bundet: boolean; dinglende: boolean };
type Rapport = { filer: number; ubundte: number; dinglende: number; fund: Fund[] };

/** Write a throwaway tree of .tsx files and scan it. */
function scanFixture(filer: Record<string, string>, args: string[] = []): Rapport {
  const dir = mkdtempSync(join(tmpdir(), "label-scan-"));
  try {
    mkdirSync(join(dir, "components"), { recursive: true });
    for (const [navn, indhold] of Object.entries(filer)) {
      writeFileSync(join(dir, "components", navn), indhold, "utf8");
    }
    return JSON.parse(
      execFileSync("node", [SCRIPT, "--json", "--root", dir, ...args], { encoding: "utf8" }),
    ) as Rapport;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const UBUNDET = (tekst: string) => `<label>${tekst}</label>`;

describe("ubundne-<label>-scanner", () => {
  const fixtures: string[] = [];

  afterAll(() => {
    for (const dir of fixtures) rmSync(dir, { recursive: true, force: true });
  });

  it("tæller en etiket uden binding som ubundet", () => {
    const r = scanFixture({ "Kort.tsx": `export const K = () => (${UBUNDET("Rente")});` });
    expect(r.ubundte).toBe(1);
    expect(r.fund[0].tekst).toBe("Rente");
    expect(r.fund[0].linje).toBe(1);
  });

  it("R1: en binding efter et `>` i et attribut-udtryk tælles stadig som bundet", () => {
    // `<label onClick={() => setX(1)} htmlFor="rente">` — `[^\>]*` standser ved
    // `setX(1)>`, så `htmlFor` læses aldrig. C64's tælling så den som ubundet.
    const r = scanFixture({
      "Haandtag.tsx": `export const H = () => (
  <label onClick={() => setX(1)} htmlFor="rente" className="x">Rente</label>
  <input id="rente" />
);`,
    });
    expect(r.ubundte).toBe(0);
    expect(r.dinglende).toBe(0);
  });

  it("R2: en gruppe-etikettet bundet gennem aria-labelledby med ${…} er bundet", () => {
    // JSX bygger begge sider som template-literals, så en ordentlig sammenligning
    // aldrig rammer. C64 fandt et falsk "ubundet" på præcis denne form.
    const r = scanFixture({
      "Gruppe.tsx": `export const G = ({ i }: { i: number }) => (
  <div role="group" aria-labelledby={\`gruppe-\${i + 1}\`}>
    <label id={\`gruppe-\${i + 1}\`}>Enhed</label>
  </div>
);`,
    });
    expect(r.ubundte).toBe(0);
  });

  it("R3: `htmlFor` er en binding, selv om `for` ikke kan findes i det", () => {
    // C70's målefejl: et case-insensitivt `\bfor` matcher ikke inde i `htmlFor`,
    // fordi `l` er et ordtegn. Klassen blev målt til 311/88 i stedet for 97/45.
    const r = scanFixture({
      "Sprog.tsx": `export const S = () => (
  <label htmlFor="rente">Rente</label>
  <input id="rente" />
);`,
    });
    expect(r.ubundte).toBe(0);
    expect(r.dinglende).toBe(0);
  });

  it("meldet — kun med --danglende: en `for` der peger på intet i filen", () => {
    // Slået fra som standard med vilje: en fil-lokalt id-scan kan ikke se de
    // id'er et barnkomponent-render, så råt læser den 48 `for=` på src/ som
    // dinglende, selv om de er bundet i DOM'en. Den ægte prøv ligger i
    // `src/components/label-a11y.test.tsx`, som læser den renderede container.
    const r = scanFixture(
      { "Hængende.tsx": `export const H = () => <label for="findes-ikke">Rente</label>;` },
      ["--danglende"],
    );
    expect(r.ubundte).toBe(0);
    expect(r.dinglende).toBe(1);
    expect(r.fund[0].dinglende).toBe(true);
  });

  it("tæller en `<label>` med to bindinger som én", () => {
    const r = scanFixture({
      "Dobbelt.tsx": `export const D = () => (
  <label htmlFor="a" id="gruppe-a">Rente</label>
  <input id="a" />
  <div aria-labelledby="gruppe-a" />
);`,
    });
    expect(r.fund).toHaveLength(0);
  });

  it("ser ikke testfiler som en del af klassen", () => {
    // Ellers tæller scanneren sin egen genplantning ved næste kørsel.
    const r = scanFixture({
      "Rigtig.tsx": `export const R = () => <label>${"A"}</label>;`,
      "Rigtig.test.tsx": `export const T = () => <label>${"B"}</label>;`,
    });
    expect(r.fund).toHaveLength(1);
    expect(r.fund[0].tekst).toBe("A");
  });

  it("repoets egen kode: kun de filer, der står i planens rester", () => {
    // The load-bearing assertion on the real tree: the number the plan has
    // carried by hand since C70 (38 filer / 70 ubundne) must still be what the
    // scanner says. If this ever moves without a matching change in the plan,
    // one of the two is lying.
    const r = JSON.parse(
      execFileSync("node", [SCRIPT, "--json"], { cwd: ROOT, encoding: "utf8" }),
    ) as Rapport;
    expect(r.dinglende).toBe(0);
    // Tallet **skal** ændre sig i samme commit som en rettelse af klassen, ellers
    // låser den næste agent fast i en vished, der ikke holder. C72 lukkede de
    // næste filer i halen (23/36 her); C71 lukkede de syv filer med tre ubundne
    // labels (30/48); C64→C70's håndtælling sagde 38/70,
    // fordi den beholdt `/elberegner`s gruppe-etiket, som *er* bundet gennem
    // `aria-labelledby={`elberegner-apparat-${index + 1}`}` — R2's fælde.
    expect(`${r.filer} filer / ${r.ubundte} ubundne`).toBe("23 filer / 36 ubundne");
  });
});
