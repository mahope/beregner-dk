/**
 * Gate for `scripts/rendered-leak-scan.mjs`, the rendered half of the locale-leak
 * port.
 *
 * Why this file exists at all, which is the reason to read it before changing
 * anything: C168 wrote the scanner, ran it, and got **0 danske tegn i synlig
 * tekst** on beraknare.se — a domain that was serving two real Danish leaks at
 * that moment. The scanner was not wrong about the site. It was wrong about
 * itself, because it reduced the page with `html.split("<script")[0]`, which
 * cuts at the first `<script>` in `<head>` and throws the entire body away. A
 * scan that cannot see any text reports no leaks with complete confidence.
 *
 * The only reason that was caught before it was believed is that the scanner
 * was run against a **planted** Danish paragraph first. Every test here plants
 * its fixture and requires the scanner to find it. A test that only asserted
 * "the real site is clean" would have passed on the broken scanner, because
 * the broken scanner reports clean on everything.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";

// This file lives in src/lib, so the repo root is two levels up — one level
// resolves to `src/`, and every test then fails on ENOENT instead of on a
// verdict, which is the failure mode the last test exists to catch.
const ROOT = resolve(import.meta.dirname, "..", "..");
const SCAN = join(ROOT, "scripts", "rendered-leak-scan.mjs");

/** Run the scanner over one local HTML file and return its JSON verdict. */
function scan(html: string) {
  const dir = mkdtempSync(join(tmpdir(), "rendered-leak-"));
  const fil = join(dir, "side.html");
  writeFileSync(fil, html, "utf8");
  const out = execFileSync("node", [SCAN, "--html", fil, "--json"], {
    encoding: "utf8",
  });
  return JSON.parse(out)[0] as {
    fund: { antal: number; fund: { ord: string; kontekst: string }[] }[];
  };
}

/**
 * The Danish country name as it actually rendered on beraknare.se before
 * C168: Danish ø where Swedish writes ö. Planted rather than written inline so
 * every test that needs "a Danish token in Swedish text" uses the same one,
 * and so a change to it is a deliberate act.
 */
const DA_MARKER_PLACEHOLDER = "Grønland";

describe("rendered-leak-scan", () => {
  test("finder dansk i en plantet sætning i <body>", () => {
    // The regression the C168 scanner could not see. It is written *after*
    // `<head>`, exactly where the `split("<script")` version threw it away.
    const html = `<!DOCTYPE html><html lang="sv"><head><title>x</title>
      <script type="application/ld+json">{"@type":"X"}</script>
      </head><body><main><p>${DA_MARKER_PLACEHOLDER}</p></main></body></html>`;
    const r = scan(html);
    expect(r.fund.length).toBe(1);
    expect(r.fund[0].antal).toBeGreaterThan(0);
  });

  test("finder begge C168-lækagerne i den form de har i markupken", () => {
    const html = `<!DOCTYPE html><html lang="sv"><head></head><body>
      <table><tr><td>Grekland</td><td>1 timme bakåt</td></tr>
      <tr><td>${DA_MARKER_PLACEHOLDER}</td><td>4 timmar bakåt</td></tr></table>
      <select><option>GBP - Britiske Pund</option>
      <option>SEK - Svenske Kroner</option></select>
      </body></html>`;
    const r = scan(html);
    const ord = r.fund.flatMap((f) => f.fund.map((x) => x.ord));
    // ø from the Danish country name, plus the Danish currency names.
    expect(ord.some((o) => o.toLowerCase() === "ø")).toBe(true);
    expect(r.fund[0].fund.length).toBeGreaterThan(0);
  });

  test("en ren svensk side giver 0 fund", () => {
    const html = `<!DOCTYPE html><html lang="sv"><head></head><body>
      <p>Hur mycket kostar resan? Timmar, minuter och sekunder kvar.</p>
      <p>Skillnaden är 22,2 procent för samma två tal.</p>
      </body></html>`;
    // "minuter", "sekunder" and "två" contain å-adjacent Danish lookalikes in
    // the weak list, and none of them is a leak. Assert the hard marker only.
    expect(scan(html).fund.length).toBe(0);
  });

  test("å er ikke en fejl — svensk skriver å", () => {
    // C73's R4: a gate that flags å fails on correct Swedish, and a gate that
    // cries wolf gets switched off. "uppåt", "här" and "många" are Swedish.
    const html = `<!DOCTYPE html><html lang="sv"><head></head><body>
      <p>Priset är högt uppåt, och det finns många här.</p></body></html>`;
    expect(scan(html).fund.length).toBe(0);
  });

  test("script-, style- og head-indhold tælles ikke", () => {
    // This scan measures the text on the *page*. A Danish `<title>` or a Danish
    // JSON-LD block is metadata, and `locale-leak.mjs` plus `page-data.test.ts`
    // already cover those — one finding, one scanner, one verdict.
    const html = `<!DOCTYPE html><html lang="sv"><head>
      <title>Alt om gæld og tilbud</title>
      <script type="application/ld+json">{"name":"Boligstøtte"}</script>
      <style>.x::after{content:"gæld"}</style></head>
      <body><p>Ren svensk text om timmar.</p></body></html>`;
    expect(scan(html).fund.length).toBe(0);
  });

  test("<head> tælles ikke, men <body> gør — også uden script", () => {
    // The exact split the C168 scanner got wrong. There is no `<script>` in
    // this page at all, so a `split("<script")` version sees the whole thing
    // and the body case is what proves the body is read.
    const html = `<!DOCTYPE html><html lang="sv"><head><title>Ren</title></head>
      <body><p>${DA_MARKER_PLACEHOLDER}</p></body></html>`;
    expect(scan(html).fund.length).toBe(1);
  });

  test("entiteter dekodes, så &aelig; ikke slipper igennom", () => {
    const html = `<!DOCTYPE html><html lang="sv"><head></head><body>
      <p>Du skal betale boligst&oslash;tte og g&aelig;ld.</p></body></html>`;
    const r = scan(html);
    expect(r.fund.length).toBe(1);
    const ord = r.fund[0].fund.map((f) => f.ord.toLowerCase());
    expect(ord).toContain("ø");
    expect(ord).toContain("æ");
  });

  test("en tom og en script-only side giver 0 fund", () => {
    expect(scan("<!DOCTYPE html><html><head></head><body></body></html>").fund.length).toBe(0);
    expect(
      scan('<!DOCTYPE html><html><head><script src="a.js"></script></head><body></body></html>')
        .fund.length,
    ).toBe(0);
  });

  test("scan-scriptet findes og er læsbart af node", () => {
    // Guards the failure where the script is renamed and every test that calls
    // it starts failing on a spawn error instead of on a verdict.
    expect(readFileSync(SCAN, "utf8")).toContain("synligTekst");
  });
});
