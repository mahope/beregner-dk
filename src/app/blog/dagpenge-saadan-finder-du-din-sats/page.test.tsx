import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DAGPENGE_2026 } from "@/lib/satser-2026";
import DagpengeGuidePage from "./page";

const kilde = readFileSync(join(__dirname, "page.tsx"), "utf8");

/**
 * C19 (2026-09-26): artiklen havde sine egne dagpenge-satser (max 20.353/20.359
 * kr og dimittend 14.557/13.437 kr), som hverken matchede ministeriets
 * 2026-tabel eller værktøjet. Den skal nu læse alt fra `DAGPENGE_2026`.
 */
describe("blogartikel dagpenge-saadan-finder-du-din-sats", () => {
  test("læser 2026-satser fra det delte satsmodul", () => {
    expect(kilde).toContain('from "@/lib/satser-2026"');
  });

  test.each([
    "20.359",
    "952",
    "13.573",
    "14.557",
    "13.437",
    "120 kr/time",
    "22.600",
  ])("indeholder ikke den uverificerede sats %s", (literal) => {
    expect(kilde).not.toContain(literal);
  });

  test("renderer max-, deltids- og dimittendsatserne fra modulet", async () => {
    const html = renderToStaticMarkup(await DagpengeGuidePage());
    const kr = (n: number) => `${new Intl.NumberFormat("da-DK").format(n)} kr`;

    expect(html).toContain(kr(DAGPENGE_2026.fuldtid));
    expect(html).toContain(kr(DAGPENGE_2026.deltid));
    expect(html).toContain(kr(DAGPENGE_2026.dimittendFuldtidMedForsorgerpligt));
    expect(html).toContain(kr(DAGPENGE_2026.dimittendFuldtidUdenForsorgerpligt));
    expect(html).toContain(kr(DAGPENGE_2026.gaDag));
  });

  test("har en tidlig CTA til dagpengeberegneren", async () => {
    const html = renderToStaticMarkup(await DagpengeGuidePage());
    const cta = html.indexOf('href="/dagpenge"');
    const foersteTabel = html.indexOf("<table");
    expect(cta).toBeGreaterThan(-1);
    expect(cta).toBeLessThan(foersteTabel);
  });

  test("regneeksemplerne følger værktøjets formel: 90 % af løn efter AM-bidrag", () => {
    // Eksempel 1: 20.000 kr → 16.560 kr, under loftet på 22.041 kr.
    const eksempel20 = 20000 * 0.92 * DAGPENGE_2026.dagpengeProcent;
    expect(Math.round(eksempel20)).toBe(16560);
    expect(eksempel20).toBeLessThan(DAGPENGE_2026.fuldtid);

    // Eksempel 2: 30.000 kr → 24.840 kr, over loftet, så satsen bliver max.
    const eksempel30 = 30000 * 0.92 * DAGPENGE_2026.dagpengeProcent;
    expect(Math.round(eksempel30)).toBe(24840);
    expect(eksempel30).toBeGreaterThan(DAGPENGE_2026.fuldtid);
  });
});
