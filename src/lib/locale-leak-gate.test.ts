import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The locale-leak scanner is a gate, so the gate is itself tested. A scanner
 * nobody verifies is a scanner that quietly stops finding things — and this one
 * replaced a hand-written measurement that cost half an hour per run (opgave
 * 95). Reverse-verified: the "planted leak" cases below fail without the
 * detector they name.
 */

const ROOT = resolve(__dirname, "..", "..");
const SCRIPT = resolve(ROOT, "scripts", "locale-leak.mjs");

function scan(args: string[] = []) {
  return JSON.parse(
    execFileSync("node", [SCRIPT, "--json", ...args], {
      cwd: ROOT,
      encoding: "utf8",
    })
  ) as {
    seMountedComponents: number;
    candidates: number;
    needsEyes: number;
    dead: number;
    unreviewed: { file: string; line: number; string: string }[];
    reviewed: { file: string; verdict: string; reviewNote: string }[];
  };
}

describe("locale-leak scanner", () => {
  it("fails the gate: every candidate a human has not judged is known", () => {
    // The load-bearing assertion. If someone pastes a Danish string into a
    // component that renders on beraknare.se, this is what turns red.
    expect(() =>
      execFileSync("node", [SCRIPT, "--gate"], { cwd: ROOT, stdio: "pipe" })
    ).not.toThrow();
  });

  it("derives the SE-mounted components from calculator-list.ts", () => {
    // 70 reachable components across the se-mounted pages. Hard-coded before?
    // Then adding a calculator would not have moved this number.
    expect(scan().seMountedComponents).toBeGreaterThan(50);
  });

  it("judges every candidate, and judges most of them dead", () => {
    const result = scan();
    expect(result.candidates).toBe(result.dead + result.needsEyes);
    // C65's lesson in one number: the raw text scan over-reports badly, so a
    // verdict layer is not optional.
    expect(result.dead).toBeGreaterThan(0);
  });

  it("keeps a reason on every reviewed entry", () => {
    // A dismissal without a reason is a dismissal nobody can check, which is
    // what made C65's finding list expensive to inherit.
    for (const entry of scan().reviewed) {
      expect(entry.reviewNote.length).toBeGreaterThan(20);
    }
  });

  it("does not report Danish copy that lives in a da:/se:/no: object", () => {
    // If the locale-object exclusion broke, every labels table on the site
    // would light up — and the candidate count would jump by hundreds.
    const result = scan();
    expect(result.candidates).toBeLessThan(250);
  });

  it("flags a module-scope Danish string in an SE-mounted component", () => {
    // Reverse verification: this is the exact shape that made C65's real bug
    // (STANDARD_APPARATER in Elberegner.tsx). Plant it, and the gate must go
    // red — otherwise the gate is a rubber stamp.
    const target = resolve(ROOT, "src", "components", "MomsBeregner.tsx");
    const original = readFileSync(target);
    try {
      writeFileSync(
        target,
        `${original.toString("utf8")}\nconst PLANTED = [{ titel: "Vaskemaskine (per vask)" }];\n`
      );
      const failing = () =>
        execFileSync("node", [SCRIPT, "--gate"], { cwd: ROOT, stdio: "pipe" });
      expect(failing).toThrow();
      expect(JSON.stringify(scan().unreviewed)).toContain("Vaskemaskine");
    } finally {
      // byte-exact, not a shell heredoc: a heredoc appends a newline and the
      // next run would diff a file it thinks it restored.
      writeFileSync(target, original);
    }
  });

  it("does not flag Swedish copy that merely contains å", () => {
    // The first run reported twelve correct Swedish strings in BolanBeregner
    // ("Ränta (% per år)", "Månadskostnad", "Lånebelopp") because å is not a
    // Danish letter. This locks that false positive out.
    expect(JSON.stringify(scan().unreviewed)).not.toContain("BolanBeregner");
  });
});
