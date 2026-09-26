import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SU_2026 } from "@/lib/satser-2026";
import SU2026GuidePage from "./page";

const kilde = readFileSync(join(__dirname, "page.tsx"), "utf8");

/**
 * C20 (2026-09-26): SU-artiklen læste allerede alle beløb fra `SU_2026`, så der
 * var ingen tredje satssamling at rette. Det den manglede, var svar-først
 * skrivning og tre officielt dokumenterede 2026-tal, der ikke fandtes i
 * modulet: forældreindkomstgrænserne, den lavere sats for forsørgertillæg ved
 * delt bolig med en på SU/kontanthjælp, og udlandsstudielånet.
 */
describe("blogartikel su-2026-satser-og-regler", () => {
  test("læser 2026-satser fra det delte satsmodul", () => {
    expect(kilde).toContain('from "@/lib/satser-2026"');
  });

  test("titlen svarer på søgningen med udeboendesatsen fra modulet", () => {
    const da = (n: number) => new Intl.NumberFormat("da-DK").format(n);

    expect(kilde).toContain(
      `title: "SU 2026: ${da(SU_2026.udeboende)} kr. pr. måned udeboende"`,
    );
    expect(kilde).toContain(
      "SU 2026: {kr(SU_2026.udeboende)} kr. pr. måned udeboende",
    );
  });

  test("renderer k-satserne fra modulet", async () => {
    const html = renderToStaticMarkup(await SU2026GuidePage());
    const da = (n: number) => new Intl.NumberFormat("da-DK").format(n);

    expect(html).toContain(`${da(SU_2026.udeboende)} kr.`);
    expect(html).toContain(`${da(SU_2026.homewardBase)} kr.`);
    expect(html).toContain(`${da(SU_2026.homewardMaximum)} kr.`);
    expect(html).toContain(`${da(SU_2026.freeAllowance.youthWithSu)} kr.`);
    expect(html).toContain(`${da(SU_2026.freeAllowance.videregaaendeWithSu)} kr.`);
    expect(html).toContain(`${da(SU_2026.loan.ordinaryMonthly)} kr.`);
  });

  test("renderer de tre nye dokumenterede 2026-tal", async () => {
    const html = renderToStaticMarkup(await SU2026GuidePage());
    const da = (n: number) => new Intl.NumberFormat("da-DK").format(n);

    expect(SU_2026.parentalIncome.maxSupplementAtOrBelow).toBe(419589);
    expect(SU_2026.parentalIncome.noSupplementAtOrAbove).toBe(710077);
    expect(SU_2026.singleParentSupplementSharedHome).toBe(2966);
    expect(SU_2026.loan.abroadTotal).toBe(129106);

    expect(html).toContain(da(SU_2026.parentalIncome.maxSupplementAtOrBelow));
    expect(html).toContain(da(SU_2026.parentalIncome.noSupplementAtOrAbove));
    expect(html).toContain(da(SU_2026.parentalIncome.siblingUnder18Deduction));
    expect(html).toContain(da(SU_2026.singleParentSupplementSharedHome));
    expect(html).toContain(da(SU_2026.loan.abroadTotal));
  });

  test("har en tidlig CTA til SU-beregneren før første tabel", async () => {
    const html = renderToStaticMarkup(await SU2026GuidePage());
    const cta = html.indexOf('href="/su"');
    const foersteTabel = html.indexOf("<table");

    expect(cta).toBeGreaterThan(-1);
    expect(foersteTabel).toBeGreaterThan(-1);
    expect(cta).toBeLessThan(foersteTabel);
  });

  test("svarer på det konkrete spørgsmål i 'Kort svar'", async () => {
    const html = renderToStaticMarkup(await SU2026GuidePage());
    const da = (n: number) => new Intl.NumberFormat("da-DK").format(n);

    expect(html).toContain("Kort svar:");
    const kortSvar = html.slice(html.indexOf("Kort svar:"), html.indexOf("Kort svar:") + 1200);

    expect(kortSvar).toContain(da(SU_2026.udeboende));
    expect(kortSvar).toContain(da(SU_2026.homewardMaximum));
    expect(kortSvar).toContain(da(SU_2026.freeAllowance.youthWithSu));
  });

  test("de to forældreindkomstgrænser er nævnt begge steder i artiklen", async () => {
    const html = renderToStaticMarkup(await SU2026GuidePage());
    const da = (n: number) => new Intl.NumberFormat("da-DK").format(n);
    const forekomster = (tal: string) => html.split(tal).length - 1;

    // Tabel, løbende tekst og FAQ skal alle kunne finde grænserne.
    expect(forekomster(da(SU_2026.parentalIncome.maxSupplementAtOrBelow))).toBeGreaterThanOrEqual(2);
    expect(forekomster(da(SU_2026.parentalIncome.noSupplementAtOrAbove))).toBeGreaterThanOrEqual(2);
  });
});
