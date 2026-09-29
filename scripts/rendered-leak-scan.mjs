#!/usr/bin/env node
/**
 * Rendered-locale-leak scanner.
 *
 * `locale-leak.mjs` reads the *source*. C168 found two leaks it structurally
 * cannot see, on beraknare.se's own server-rendered HTML:
 *
 *   - `/tidszone` wrote "Grønland" with a Danish ø. The string is in
 *     `TIDSSKILLNADS_LANDE` as `landDa` and is read at the display site
 *     through `land.landSe ?? land.landDa`, so the port analysis judges the
 *     Danish arm as unreachable — correctly, for the arm it can see. The
 *     missing `landSe` is an *absence*, and an absent key produces no finding.
 *   - `/valuta`'s currency `<select>` showed "Britiske Pund", "Svenske
 *     Kroner" and "Danske Kroner" in all three locales, because
 *     `VALUTA_METADATA` held one name per currency code and `getValutaNavn`
 *     read it unconditionally.
 *
 * Both are the same shape: a value that *reaches* a Swedish reader through a
 * lookup the source scanner has to reason about, not a `locale === "…"` ternary
 * it can read directly. Adding cases for them to the source scanner would mean
 * teaching it to evaluate helper functions, which is a losing trade.
 *
 * So this scans what actually reaches the browser: the served HTML of every URL
 * in a domain's sitemap, after the served HTML is what the visitor reads. It is
 * the rendered half of `locale-leak.mjs`, which is the source half.
 *
 * Both markers are Danish-only among the site's live locales. `å` is **not** —
 * Swedish writes å, and Danish and Swedish share a large vocabulary — so it is
 * reported separately and never fails the scan. That split is C73's R4.
 *
 * Measurement, not a merge gate — it needs the network. Run it after a deploy.
 *
 * Usage:
 *   node scripts/rendered-leak-scan.mjs                     # both Swedish domains
 *   node scripts/rendered-leak-scan.mjs https://example.se  # one domain
 *   node scripts/rendered-leak-scan.mjs --html side.html    # one local file
 *   node scripts/rendered-leak-scan.mjs --json
 */

import { readFileSync } from "node:fs";
import { get } from "node:https";

const JSON_OUT = process.argv.includes("--json");
const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const htmlArg = process.argv.indexOf("--html");
const HTML_FIL = htmlArg === -1 ? undefined : process.argv[htmlArg + 1];

const DOMAENER = args.length > 0 ? args : ["https://beraknare.se"];

/**
 * `æ` and `ø` are Danish-only here: Swedish writes ä and ö, and no live locale
 * on this site is Danish. This is the hard marker and the only one that fails
 * the scan.
 */
const DA_CHARS = /[æø]/i;

/**
 * `å` is Swedish too, so it is only a marker next to a word Danish uses and
 * Swedish does not. Reported as a warning, never a failure — a scan that
 * failed on it would fail on correct Swedish, and a gate that cries wolf is
 * switched off.
 */
const DA_WEAK = /\b(?:til|ikke|uden|hvor|hvad|hvornår|udleje|udgift|gæld|tilføj|mellem|fremtid|tilbage|kroner|udbud|udlåning|udbetales|årigt|åligt|indtægt|udbetaling)\b/i;

/** Enough surrounding text to judge a find by hand without a second fetch. */
const KONTEKST = 60;

function hent(url) {
  return new Promise((resolve) => {
    get(url, { headers: { "user-agent": "rendered-leak-scan" } }, (res) => {
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
 * Reduce served HTML to the text a reader sees **on the page**.
 *
 * The `<head>` goes first and whole. It holds `<title>`, `<meta>` and JSON-LD —
 * real, and a Danish `<title>` on a Swedish domain is a genuine bug — but it is
 * metadata, not page text, and `locale-leak.mjs` already covers the `se:`
 * blocks and `page-data.test.ts` covers the metadata strings. Counting it here
 * would put the same finding in two scanners with two verdicts, and the gate
 * test is clearer when this one means exactly one thing.
 *
 * Then every `<script>` and `<style>` element, then every tag. The order
 * matters and the first version got it wrong in the direction that matters: it
 * used `html.split("<script")[0]`, which cuts at the first `<script>` in
 * `<head>` and therefore discards the whole body. That scan reported **0** on a
 * page carrying two real Danish leaks, and it also reported 0 on a *planted*
 * Danish paragraph — the measurement error C168 found by planting a fixture,
 * which is the only reason it found anything at all.
 */
function synligTekst(html) {
  return html
    .replace(/<head\b[\s\S]*?<\/head>/gi, " ")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&aring;/g, "å")
    .replace(/&oslash;/g, "ø")
    .replace(/&aelig;/g, "æ")
    .replace(/ | | | /g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Count, and keep one context per distinct word. Counting *occurrences* is
 * useless here — one leaked table cell repeats in the RSC payload and in the
 * markup — and counting distinct contexts hides a leak that appears on every
 * one of 71 pages. The number reported is distinct matched tokens.
 */
function scanTekst(tekst) {
  const haarde = [...new Set(tekst.match(new RegExp(DA_CHARS.source, "gi")) ?? [])];
  const context = (ord) => {
    const i = tekst.search(new RegExp(ord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
    if (i === -1) return "";
    return tekst.slice(Math.max(0, i - KONTEKST), i + KONTEKST).trim();
  };
  const svage = [...new Set((tekst.match(new RegExp(DA_WEAK.source, "gi")) ?? []))];
  return {
    antal: haarde.length,
    fund: haarde.map((o) => ({ ord: o, kontekst: context(o) })),
    svage: svage.map((o) => ({ ord: o, kontekst: context(o) })),
  };
}

async function scanDomaene(domaene) {
  const urls = await sitemapUrls(domaene);
  const fund = [];
  const fejl = [];
  for (const u of urls) {
    const r = await hent(u);
    if (r.status !== 200) {
      fejl.push({ url: r.url, status: r.status });
      continue;
    }
    const res = scanTekst(synligTekst(r.data));
    if (res.antal > 0) fund.push({ url: r.url, antal: res.antal, fund: res.fund });
  }
  return { domaene, sider: urls.length, fund, fejl };
}

const resultater = [];

if (HTML_FIL) {
  const res = scanTekst(synligTekst(readFileSync(HTML_FIL, "utf8")));
  resultater.push({
    domaene: HTML_FIL,
    sider: 1,
    fund: res.antal > 0 ? [{ url: HTML_FIL, antal: res.antal, fund: res.fund }] : [],
    fejl: [],
  });
} else {
  for (const d of DOMAENER) resultater.push(await scanDomaene(d));
}

if (JSON_OUT) {
  console.log(JSON.stringify(resultater, null, 2));
} else {
  let iAlt = 0;
  for (const r of resultater) {
    console.log(
      `Rendered locale-leak: ${r.sider} sider på ${r.domaene} — ${r.fund.length} sider med æ/ø, ${r.fejl.length} fejl`,
    );
    for (const f of r.fund) {
      console.log(`  ${f.url}  (${f.antal})`);
      for (const x of f.fund) console.log(`      ${x.ord}  …${x.kontekst}…`);
      iAlt += f.antal;
    }
    for (const f of r.fejl) console.log(`  FEJL ${f.url} → ${f.status}`);
  }
  console.log(iAlt > 0 ? `I ALT ${iAlt} danske tegn i synlig tekst` : "0 danske tegn i synlig tekst");
  process.exitCode = iAlt > 0 ? 1 : 0;
}
