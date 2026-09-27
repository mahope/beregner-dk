import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

/**
 * The unnamed-button-group scanner is the measurement behind the class C72
 * found and `label-a11y-scan.mjs` structurally cannot see: a set of toggle
 * buttons — a period, a unit, a view — inside a container that names the set
 * nothing. `label-a11y-scan.mjs` counts `<label>` elements, so a group of
 * buttons with no `<label>` anywhere is invisible to it.
 *
 * Every rule gets a **planted** case below: a fixture the naive version of the
 * rule gets wrong. Reverse-verified — with the rule removed, the case it names
 * fails. A rule without a test is a note.
 */

const ROOT = resolve(__dirname, "..", "..");
const SCRIPT = resolve(ROOT, "scripts", "knapgruppe-scan.mjs");

type Fund = {
  fil: string;
  linje: number;
  navn: string;
  rolle: string | null;
  knapper: number;
  navngivet: boolean;
};
type Rapport = { filer: number; uavngivne: number; prFil: Record<string, number>; fund: Fund[] };

/** Skriv en midlertidig træ af .tsx-filer og scan den. */
function scanFixture(filer: Record<string, string>, args: string[] = []): Rapport {
  const dir = mkdtempSync(join(tmpdir(), "knapgruppe-scan-"));
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

describe("uavngivet-knapgruppe-scanner", () => {
  const fixtures: string[] = [];

  afterAll(() => {
    for (const dir of fixtures) rmSync(dir, { recursive: true, force: true });
  });

  it("melder to knapper i et uavngivet felt", () => {
    const r = scanFixture({
      "Periode.tsx": `export const P = () => (
  <div className="flex">
    <button type="button">Pr. m&#229;ned</button>
    <button type="button">Pr. &#229;r</button>
  </div>
);`,
    });
    expect(r.uavngivne).toBe(1);
    expect(r.fund[0].knapper).toBe(2);
    expect(r.fund[0].rolle).toBeNull();
  });

  it("melder ikke en knap alene", () => {
    const r = scanFixture({
      "EnKnap.tsx": `export const E = () => (
  <div className="flex">
    <button type="button">Klik</button>
  </div>
);`,
    });
    expect(r.uavngivne).toBe(0);
  });

  it("R1: en gruppe med aria-label bag et `>` i et attribut-udtryk er stadig navngivet", () => {
    // `<div onClick={() => setX(1)} aria-label="Periode">` — `[^\>]*` standser
    // ved `setX(1)>`, så aria-label læses aldrig, og en navngivet gruppe meldes
    // uavngivet. Samme fejl som C64 gjorde på `<label\b([^>]*)>`.
    const r = scanFixture({
      "Haandtag.tsx": `export const H = () => (
  <div onClick={() => setX(1)} role="group" aria-label="Periode" className="flex">
    <button type="button">Pr. m&#229;ned</button>
    <button type="button">Pr. &#229;r</button>
  </div>
);`,
    });
    expect(r.uavngivne).toBe(0);
  });

  it("R2: en gruppe bundet gennem aria-labelledby med ${…} er navngivet", () => {
    // JSX bygger begge sider som template-literals, så `\\$\\{…\\}` skal væk fra
    // sammenligningen. Uden normaliseringen læses nøglen som
    // "`gruppe-${i + 1" og matcher aldrig — C64's falsk-"ubundet".
    const r = scanFixture({
      "Gruppe.tsx": `export const G = ({ i }: { i: number }) => (
  <div className="mb-1">
    <span id={\`periode-\${i + 1}\`}>Periode</span>
    <div role="group" aria-labelledby={\`periode-\${i + 1}\`} className="flex">
      <button type="button">Pr. m&#229;ned</button>
      <button type="button">Pr. &#229;r</button>
    </div>
  </div>
);`,
    });
    expect(r.uavngivne).toBe(0);
  });

  it("R3: en navngivet forfader dækker hele gruppen under sig", () => {
    // Ét navn på hele blokken er nok — knapperne arver det. Uden den regel
    // tælles den indre gruppe, selv om en skærmlæser hører navnet.
    const r = scanFixture({
      "Arv.tsx": `export const A = () => (
  <div role="group" aria-label="Beregningstype" className="flex">
    <button type="button">Beregn</button>
    <button type="button">R&#229;d</button>
  </div>
);`,
    });
    expect(r.uavngivne).toBe(0);
  });

  it("R4: tre lag uavngivne containere giver én fund, ikke tre", () => {
    // Uden R4 tælles samme fejl dybde × dybde, og måleren får klassen til at
    // se større ud end den er — den fejltype, der lå i C63 og C64.
    const r = scanFixture({
      "Dyb.tsx": `export const D = () => (
  <div className="kort">
    <div className="række">
      <button type="button">Beregn</button>
      <button type="button">R&#229;d</button>
    </div>
  </div>
);`,
    });
    expect(r.uavngivne).toBe(1);
  });

  it("ser ikke testfiler som en del af klassen", () => {
    // Ellers tæller scanneren sin egen genplantning ved næste kørsel.
    const r = scanFixture({
      "Rigtig.tsx": `export const R = () => (
  <div><button type="button">A</button><button type="button">B</button></div>
);`,
      "Rigtig.test.tsx": `export const T = () => (
  <div><button type="button">C</button><button type="button">D</button></div>
);`,
    });
    expect(r.uavngivne).toBe(1);
  });

  it("tæller radioknapper i en uavngivet radiogroup", () => {
    // Radioknapper er knapper for denne måling: de er valg i en gruppe, og
    // uden navn hører skærmlæseren to valg uden at vide de hører sammen.
    const r = scanFixture({
      "Radio.tsx": `export const R = () => (
  <div role="radiogroup" className="flex">
    <input type="radio" id="a" name="x" />
    <input type="radio" id="b" name="x" />
  </div>
);`,
    });
    expect(r.uavngivne).toBe(1);
    expect(r.fund[0].rolle).toBe("radiogroup");
  });

  it("repoets egen kode: kun de filer, der står i planens måling", () => {
    // Den bærende påstand på det rigtige træ: tallet må kun flytte sig i samme
    // commit som en rettelse af klassen, ellers låser den næste agent fast i en
    // vished, der ikke holder — præcis den fejl `label-scan-gate.test.ts`
    // fangede i C71, da den forventede 30/48 og fik 23/36.
    const r = JSON.parse(
      execFileSync("node", [SCRIPT, "--json"], { cwd: ROOT, encoding: "utf8" }),
    ) as Rapport;
    expect(`${r.filer} filer / ${r.uavngivne} uavngivne`).toBe("10 filer / 12 uavngivne");
  });
});
