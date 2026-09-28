import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

/**
 * The site-wide half of the protocol-relative href class C115 found.
 *
 * `src/lib/href-form.test.ts` gates the central catalogs, offline, in the test
 * run. It cannot reach the 141 pages that write `<Link href>` by hand — and a
 * source grep cannot either, because C115's href was *computed*
 * (`${prefix}${slug}`), so nothing in the source ever contained `//`. This
 * scanner therefore measures the served HTML.
 *
 * It is a measurement, not a merge gate: it needs the network, and a site that
 * has just deployed has legitimate findings until the batch has run. So its own
 * claim is tested here against planted HTML — including the two cases that make
 * a naive version of the rule green for the wrong reason: an external
 * `https://` link, and an `href` whose value merely *contains* a double slash
 * later in the string.
 */

const ROOT = resolve(__dirname, "..", "..");
const SCRIPT = resolve(ROOT, "scripts", "href-scan.mjs");

type Rapport = { sider: number; fund: { url: string; antal: number }[]; fejl: unknown[] }[];

const dir = mkdtempSync(join(tmpdir(), "href-scan-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

/** Skriv en HTML-fil og kør scanneren på den. */
function scan(html: string): Rapport {
  const fil = join(dir, `case-${Math.random().toString(36).slice(2)}.html`);
  writeFileSync(fil, html, "utf8");
  const ud = execFileSync("node", [SCRIPT, "--json", "--html", fil], { encoding: "utf8" });
  return JSON.parse(ud) as Rapport;
}

const fund = (html: string) => scan(html)[0].fund;

describe("href-scan: protocol-relative href", () => {
  it("tæller C115's fejl — href der starter med to skråstreg", () => {
    // The exact live shape: fourteen cards rendering //dage-til//slug.
    const html = Array.from({ length: 14 }, (_, i) => `<a href="//dage-til//slug-${i}">x</a>`).join("");
    expect(fund(html)).toHaveLength(1);
    expect(fund(html)[0].antal).toBe(14);
  });

  it("tæller den dobbelte skråstreg inde i stien", () => {
    expect(fund(`<a href="/dage-til//juledagen">x</a>`)).toHaveLength(1);
  });

  it("griber IKKE et eksternt https-link", () => {
    // The rule is `href="//`, not a loose `//` — otherwise every external
    // link on the site is a false positive and the scan is noise.
    const html = `<a href="https://www.dst.dk/da/Statistik">dst.dk</a><a href="http://x.dk/">x</a>`;
    expect(fund(html)).toEqual([]);
  });

  it("griber IKKE en korrekt sti, bare fordi den ligner", () => {
    const html = `<a href="/dage-til/juledagen">x</a><a href="/moms">y</a><a href="/blog/a-b-c">z</a>`;
    expect(fund(html)).toEqual([]);
  });

  it("griber IKKE protocol-relative i en tekstnode eller et inline-script", () => {
    // Only the href attribute is a link. A `//` in prose or in a comment is
    // not navigation, and a scan that flagged those would be turned off.
    const html = `<p>Se //dage-til//x for detaljer</p><!-- href="//dage-til//juledagen" -->`;
    expect(fund(html)).toEqual([]);
  });

  it("tæller hvert fund, ikke hver linje", () => {
    // The minified one-line HTML of a real page: `grep -c` reads 1 here,
    // which is C99's and C110's measurement error in a third costume.
    const html = `<a href="//a//b">1</a><a href="//c//d">2</a><a href="//e//f">3</a>`;
    expect(fund(html)[0].antal).toBe(3);
  });
});
