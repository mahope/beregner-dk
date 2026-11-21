import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const articlePath = join(__dirname, "blog", "fradrag-2026-komplet-guide", "page.tsx");
const article = readFileSync(articlePath, "utf8");

/**
 * S2 (2026-09-26) fandt fire forkerde 2026-satser i
 * `/blog/skat-2026-alt-du-skal-vide`, fordi artiklen hardcoded tal, som
 * `src/lib/satser-2026.ts` allerede havde som single source. Den her test er
 * gardet mod samme fejltype: artiklen må ikke genangive en 2026-sats som
 * tekstliteral, den skal læse fra modulet.
 */
const staleLiterals = [
  "2,23", // gammel kørselsfradrag-sats
  "1,12", // gammel kørselsfradrag-sats
  "12.900", // gammelt håndværkerfradrag-loft
  "33,6", // gammel rentefradrag-værdi
  "25,6", // gammel rentefradrag-værdi
  "68.700", // gammelt ratepension-loft
  "63.300", // gammelt beskæftigelsesfradrag-loft
  "54.100", // gammelt personfradrag
  "7.000", // gammelt fagforeningsloft
];

describe("blogartikel fradrag-2026-komplet-guide", () => {
  test("læser 2026-satser fra det delte satsmodul", () => {
    expect(article).toContain('from "@/lib/satser-2026"');
  });

  test.each(staleLiterals)("indeholder ikke den forældede sats %s", (literal) => {
    expect(article).not.toContain(literal);
  });

  test("skelner mellem servicefradrag og håndværkerfradrag", () => {
    expect(article).toContain("Servicefradrag");
    expect(article).toContain("Håndværkerfradrag");
  });
});
