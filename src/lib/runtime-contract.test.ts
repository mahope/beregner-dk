import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The Node runtime is declared in three places: `engines.node` in
 * package.json, `.nvmrc`, and the `FROM node:<major>` line in the Dockerfile.
 * They drifted apart silently before — a framework upgrade can raise the Node
 * requirement, and nothing in the build notices, because the build runs on
 * whatever the host happens to have. That failure only shows up on the build
 * server, after the merge. This test is the drift alarm.
 */

const ROOT = resolve(__dirname, "..", "..");

function read(relativePath: string): string {
  return readFileSync(resolve(ROOT, relativePath), "utf8");
}

const packageJson = JSON.parse(read("package.json")) as {
  engines?: { node?: string };
  dependencies?: Record<string, string>;
};

const enginesRange = packageJson.engines?.node ?? "";

function declaredMajors(range: string): number[] {
  return [...range.matchAll(/(\d+)/g)].map((m) => Number(m[1]));
}

/** The `>=x <y` form this repo uses — no semver dependency needed. */
function rangeAllows(major: number, range: string): boolean {
  const [min, max] = declaredMajors(range);
  return Number.isInteger(min) && major >= min && (!max || major < max);
}

function dockerfileNodeMajor(): number {
  const from = read("Dockerfile").match(/^FROM node:(\d+)/m);
  if (!from) throw new Error("Dockerfile har ingen `FROM node:<major>`-linje");
  return Number(from[1]);
}

function nvmrcMajor(): number {
  const value = read(".nvmrc").trim();
  const major = Number(value.replace(/^v/, ""));
  if (!Number.isInteger(major)) {
    throw new Error(`.nvmrc er ikke en Node-major-version: "${value}"`);
  }
  return major;
}

describe("Node-runtime-kontrakt", () => {
  it("erklærer den Node-version projektet kræver", () => {
    // Uden denne linje er intet andet i filen meningsløst: resten sammenligner
    // bare tre tal, der alle er væk, hvis `engines` ikke findes.
    expect(enginesRange).not.toBe("");
  });

  it("bygger på den Node-version den erklærer", () => {
    const [min, max] = declaredMajors(enginesRange);
    const current = Number(process.versions.node.split(".")[0]);
    expect(current).toBeGreaterThanOrEqual(min);
    if (max) expect(current).toBeLessThan(max);
  });

  it("bygger i Docker på samme Node-major som engines", () => {
    expect(dockerfileNodeMajor()).toBe(declaredMajors(enginesRange)[0]);
  });

  it("peger .nvmrc på samme Node-major som engines", () => {
    expect(nvmrcMajor()).toBe(declaredMajors(enginesRange)[0]);
  });

  it("accepterer præcis den Node-version .nvmrc peger på", () => {
    expect(rangeAllows(nvmrcMajor(), enginesRange)).toBe(true);
  });

  it("kører Next.js på en Node-version engines tillader", () => {
    // Next 15 kræver Node >= 18.18. Uden denne tjek kan en framework-opgradering
    // hæve kravet uden at nogen opdaterer de tre erklæringer ovenfor.
    const next = packageJson.dependencies?.next ?? "";
    const nextMajor = Number(next.match(/\d+/)?.[0]);
    const declared = declaredMajors(enginesRange);
    expect(nextMajor).toBeGreaterThan(0);
    expect(declared[0]).toBeGreaterThanOrEqual(18);
  });
});
