#!/usr/bin/env node
/**
 * Protocol-relative href scanner.
 *
 * C115: the homepage built `href={`/${prefix}/${slug}`}` from a prefix that
 * already carried both slashes, so all 14 countdown cards rendered
 * `//dage-til//juledagen`. A leading `//` is a *protocol-relative URL* — the
 * browser resolved each card to a host named "dage-til" and sent the visitor
 * off-site. The fix landed in the data layer, but nothing in the repo could
 * *see* the class: the href was computed, so a source-level grep for `href="//`
 * is green on exactly the bug it should catch.
 *
 * So this scans what actually reaches the browser: the served HTML of every URL
 * in a domain's sitemap. It is the site-wide half of `src/lib/href-form.test.ts`,
 * which covers the central catalogs and runs in the test gate; this one covers
 * the 141 pages that write `<Link href>` by hand, which the catalogs cannot
 * reach.
 *
 * Measurement, not a merge gate — it needs the network. Run it after a deploy.
 *
 * Usage:
 *   node scripts/href-scan.mjs                     # both live domains
 *   node scripts/href-scan.mjs https://example.dk  # one domain
 *   node scripts/href-scan.mjs --html side.html    # one local file (fixtures)
 *   node scripts/href-scan.mjs --json
 */

import { readFileSync } from "node:fs";
import { get } from "node:https";

const JSON_OUT = process.argv.includes("--json");
const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const htmlArg = process.argv.indexOf("--html");
const HTML_FIL = htmlArg === -1 ? undefined : process.argv[htmlArg + 1];

const DOMAENER = args.length > 0 ? args : ["https://minberegner.dk", "https://beraknare.se"];
const PARALLEL = 8;

/** Hent en URL. Følger redirects — sitemap-roots står uden afsluttende skråstreg. */
function hent(url) {
  return new Promise((resolve) => {
    get(url, { headers: { "user-agent": "href-scan" } }, (res) => {
      const sted = res.headers.location;
      if (sted && res.statusCode >= 300 && res.statusCode < 400) {
        res.resume();
        resolve(hent(new URL(sted, url).href).then((r) => ({ ...r, url })));
        return;
      }
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (ch) => {
        data += ch;
      });
      res.on("end", () => resolve({ url, status: res.statusCode, data }));
      res.on("error", () => resolve({ url, status: 0, data: "" }));
    }).on("error", () => resolve({ url, status: 0, data: "" }));
  });
}

async function sitemapUrls(domaene) {
  const { data } = await hent(`${domaene.replace(/\/$/, "")}/sitemap.xml`);
  return [...data.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

/**
 * Tæl `href`-egenskaber hvis værdi er en ugyldig intern sti.
 *
 * To former, begge fundet af de plantede tilfælde i
 * `src/lib/href-scan-gate.test.ts`:
 *   - `href="//…`  — protocol-relative, browseren læser første segment som vært
 *   - `href="/a//b"` — dobbelt skråstreg inde i stien
 *
 * Kommentarer og script/style-indhold fjernes først: en `href="//` i en
 * kommentar eller i en JSON-LD-streng er ikke navigation, og en scan der
 * tæller den ville blive slået fra. Mønstret er `href="` frem for et løst `//`,
 * så et eksternt `https://`-link ikke giver et falsk fund. `.length` på
 * `matchAll` tæller *fund*, ikke linjer — live-HTML'en er minificeret til én.
 */
function taelle(tegn) {
  const ren = tegn
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
  return (ren.match(/href="(?:\/\/|\/[^"]*?\/\/)[^"]*"/g) ?? []).length;
}

async function scanDomæne(domæne) {
  const urls = await sitemapUrls(domæne);
  const fund = [];
  const fejl = [];
  for (let i = 0; i < urls.length; i += PARALLEL) {
    const batch = await Promise.all(urls.slice(i, i + PARALLEL).map(hent));
    for (const r of batch) {
      if (r.status !== 200) {
        fejl.push({ url: r.url, status: r.status });
        continue;
      }
      const n = taelle(r.data);
      if (n > 0) fund.push({ url: r.url, antal: n });
    }
  }
  return { domæne, sider: urls.length, fund, fejl };
}

const resultater = [];

if (HTML_FIL) {
  // Fixture-tilstand: én lokal fil, ingen netværk. Bruges af
  // `src/lib/href-scan-gate.test.ts` til at plante de fejlsende tilfælde.
  const data = readFileSync(HTML_FIL, "utf8");
  const antal = taelle(data);
  resultater.push({ domæne: HTML_FIL, sider: 1, fund: antal > 0 ? [{ url: HTML_FIL, antal }] : [], fejl: [] });
} else {
  for (const domæne of DOMAENER) resultater.push(await scanDomæne(domæne));
}

if (JSON_OUT) {
  console.log(JSON.stringify(resultater, null, 2));
} else {
  for (const r of resultater) {
    const ialt = r.fund.reduce((sum, f) => sum + f.antal, 0);
    console.log(`\n${r.domæne}  —  ${r.sider} sider, ${r.fund.length} sider med protocol-relative href (${ialt} stk)`);
    for (const f of r.fund) console.log(`  ${String(f.antal).padStart(4)}  ${f.url}`);
    for (const f of r.fejl) console.log(`  HTTP ${f.status}  ${f.url}  (kunne ikke måles)`);
  }
  const ialt = resultater.reduce((sum, r) => sum + r.fund.reduce((s, f) => s + f.antal, 0), 0);
  console.log(`\n${DOMAENER.length} domæner — ${ialt} protocol-relative href ialt`);
}

// En måling, ikke en merge-gate: den kan ikke køre uden netværk, og et site der
// lige er deployet har legitimt fund indtil batchen er kørt. Påstanden om
// kodebasen ligger i `src/lib/href-form.test.ts`.
process.exit(0);
