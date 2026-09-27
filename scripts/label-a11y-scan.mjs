#!/usr/bin/env node
/**
 * Unbound-<label> scanner.
 *
 * Counts the accessibility class that C61-C70 have been closing slice by slice:
 * a `<label>` that names nothing, because it has no `for`/`htmlFor` and no `id`
 * referenced from an `aria-labelledby`.
 *
 * Why this file exists: the count was taken by hand, in the chat, six times —
 * and it was wrong three times, in three different ways, each time in the
 * direction that made the class look *bigger* than it is (C63: 181/65 vs the
 * real 151/58; C64: `[^>]*` missed labels with a `>` inside an attribute
 * expression; C70: `\bfor=` cannot match `htmlFor=`, because `l` is a word
 * character, so the whole class read as 311/88 instead of 97/45). A measurement
 * that is wrong in the flattering direction is worse than none, because the
 * next agent budgets an hour from it.
 *
 * So the rules are named, and `src/lib/label-scan-gate.test.ts` plants one
 * failing case per rule. A rule without a test is a note.
 *
 * Usage:
 *   node scripts/label-a11y-scan.mjs           # per-file table + totals
 *   node scripts/label-a11y-scan.mjs --json    # machine-readable
 *   node scripts/label-a11y-scan.mjs --root d  # scan another tree (fixtures)
 *   node scripts/label-a11y-scan.mjs --all    # also list bound labels
 *   node scripts/label-a11y-scan.mjs --danglende  # also list for= pointing nowhere
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const JSON_OUT = process.argv.includes("--json");
const SHOW_ALL = process.argv.includes("--all");
// Off by default: a file-local id scan cannot see ids that a child component
// renders (`<label for="alder-foedselsdato">` over a shared felt), so it reads
// as dangling on every page that uses a shared input. The real check is in
// `src/components/label-a11y.test.tsx`, where it runs against the DOM.
const VIS_DINGLENDE = process.argv.includes("--danglende");

const rootArg = process.argv.indexOf("--root");
const SCAN_ROOT = rootArg === -1 ? join(ROOT, "src") : resolve(ROOT, process.argv[rootArg + 1]);

/**
 * R1 — find the **opening tag** by walking from `<label` to the first `>` that
 * is not inside a `{…}` attribute expression, never with `<label\b([^>]*)>`.
 * A `>` inside an expression (`onClick={() => setX(1)}`) ends the character
 * class early, so the attributes after it are never read and a bound label is
 * reported as unbound — C64 measured 113/51 this way and wrote 117/51 in the
 * plan without noticing that the difference was the bug.
 *
 * The one known blind spot: a `{` or `}` inside a quoted attribute *value*
 * would unbalance the walk. No label in `src/` has one.
 */
function aabneTags(kilde) {
  const ud = [];
  for (const m of kilde.matchAll(/<label\b/g)) {
    let i = m.index + m[0].length;
    let dybde = 0;
    for (; i < kilde.length; i++) {
      const c = kilde[i];
      if (c === "{") dybde++;
      else if (c === "}") dybde--;
      else if (c === ">" && dybde === 0) break;
    }
    ud.push({ start: m.index, attributter: kilde.slice(m.index + m[0].length, i) });
  }
  return ud;
}

/**
 * R3 — spell **both** spellings of the binding: `for` and `htmlFor`. A
 * case-insensitive `\bfor` cannot match inside `htmlFor`, because `l` is a word
 * character, and a case-sensitive `for` never matches JSX. That single missing
 * alternative made the whole class read as 311/88 instead of 97/45 (C70).
 */
const BINDINGER = ["htmlFor", "for"];
const ID = "id";
const LABELLEDBY = "aria-labelledby";

/**
 * Read one attribute value, whatever it is wrapped in: `"x"`, `'x'`, `\`x\``,
 * `{…}` or bare. Doing it by hand instead of by regex is not tidiness — the
 * `\{…\}` form routinely contains `}` *inside* the template literal
 * (`id={\`gruppe-${i + 1}\`}`), so every regex alternative for the braced form
 * truncates at the wrong brace, and the comparison with `aria-labelledby` then
 * silently fails. That is C64's falsk-"ubundet" on the knapgrupper.
 */
function attributVærdi(attributter, navn) {
  const re = new RegExp(`\\b${navn}\\s*=`, "g");
  for (const m of attributter.matchAll(re)) {
    let i = m.index + m[0].length;
    while (i < attributter.length && /\s/.test(attributter[i])) i++;
    const åben = attributter[i];
    if (åben === undefined) return null;
    if (åben === '"' || åben === "'" || åben === "`") {
      const slut = attributter.indexOf(åben, i + 1);
      return slut === -1 ? null : attributter.slice(i + 1, slut);
    }
    if (åben === "{") {
      let dybde = 0;
      for (let j = i; j < attributter.length; j++) {
        if (attributter[j] === "{") dybde++;
        else if (attributter[j] === "}" && --dybde === 0) return attributter.slice(i + 1, j);
      }
      return null;
    }
    const slut = attributter.search(/[\s/>]/, i);
    return attributter.slice(i, slut === -1 ? attributter.length : slut);
  }
  return null;
}

/**
 * R2 — normalise `${…}` away before comparing an `id` with an
 * `aria-labelledby`. JSX builds both sides as template literals
 * (`aria-labelledby={`elberegner-apparat-${index + 1}`}` names
 * `elberegner-apparat-${index + 1}`), so a literal compare never matches and
 * every knapgruppe reads as unbound.
 */
function normalisér(værdi) {
  return værdi
    .replace(/\$\{[^}]*\}/g, "#")
    .replace(/\s+/g, " ")
    .trim();
}

/** Første attributværdi der findes blandt `navne`, normaliseret (R2). */
function attribut(attributter, navne) {
  for (const navn of navne) {
    const rå = attributVærdi(attributter, navn);
    if (rå !== null && rå.trim() !== "") return normalisér(rå);
  }
  return null;
}

function scanFil(fill) {
  const kilde = readFileSync(fill, "utf8");
  const linje = (af) => kilde.slice(0, af).split("\n").length;

  const deklareredeId = new Set();
  for (const m of kilde.matchAll(/\bid\s*=/g)) {
    const rå = attributVærdi(kilde.slice(m.index), ID);
    if (rå !== null && rå.trim() !== "") deklareredeId.add(normalisér(rå));
  }
  const laesteId = new Set();
  for (const m of kilde.matchAll(/\baria-labelledby\s*=/g)) {
    const rå = attributVærdi(kilde.slice(m.index), LABELLEDBY);
    if (rå === null) continue;
    // Normalisér FØR split: `${i + 1}` indeholder selv et mellemrum, så en
    // rå `split(/\s+/)` skærer `${i + 1}` i to og matcher aldrig igen. Det er
    // præcis det falsk-"ubundet" C64 så på knapgrupperne.
    for (const del of normalisér(rå).split(/\s+/)) laesteId.add(del);
  }

  const fund = [];
  for (const tag of aabneTags(kilde)) {
    const attributter = tag.attributter;
    const viaFor = attribut(attributter, BINDINGER);
    const egenId = attribut(attributter, [ID]);

    const bundet = viaFor !== null || (egenId !== null && laesteId.has(normalisér(egenId)));
    // A `for` pointing at an id the file never declares is a *different* bug
    // from an unbound label, and it is invisible to the count above.
    const dinglende = viaFor !== null && !deklareredeId.has(viaFor);

    if (bundet && !SHOW_ALL && !(dinglende && VIS_DINGLENDE)) continue;

    const slut = kilde.indexOf("</label>", tag.start);
    fund.push({
      linje: linje(tag.start),
      tekst:
        (slut === -1 ? "" : kilde.slice(tag.start, slut + 8))
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 60) || "(tom etiket)",
      bundet,
      binding: viaFor !== null ? `for=${viaFor}` : egenId !== null ? `aria-labelledby→${egenId}` : "UBUNDET",
      dinglende,
    });
  }
  return fund;
}

function gå(dir) {
  const ud = [];
  for (const navn of readdirSync(dir).sort()) {
    const sti = join(dir, navn);
    if (statSync(sti).isDirectory()) ud.push(...gå(sti));
    else if (/\.tsx$/.test(navn) && !/\.test\.tsx$/.test(navn)) ud.push(sti);
  }
  return ud;
}

const rapporter = gå(SCAN_ROOT)
  .map((fill) => ({ fil: fill.replace(`${SCAN_ROOT}/`, ""), fund: scanFil(fill) }))
  .filter((r) => r.fund.length > 0);

const ubundte = rapporter.flatMap((r) => r.fund.filter((f) => !f.bundet));
const dinglende = rapporter.flatMap((r) => r.fund.filter((f) => f.dinglende));
const synligeDinglende = rapporter.flatMap((r) => r.fund.filter((f) => f.dinglende && VIS_DINGLENDE));

if (JSON_OUT) {
  const prFil = {};
  for (const r of rapporter) {
    const n = r.fund.filter((f) => !f.bundet).length;
    if (n > 0) prFil[r.fil] = n;
  }
  console.log(
    JSON.stringify(
      {
        filer: Object.keys(prFil).length,
        ubundte: ubundte.length,
        // 0 unless --danglende: a file-local id scan cannot see the ids a child
        // component renders, so the raw count is noise, not a finding.
        dinglende: VIS_DINGLENDE ? dinglende.length : 0,
        prFil: Object.fromEntries(Object.entries(prFil).sort((a, b) => b[1] - a[1])),
        fund: rapporter.flatMap((r) => r.fund.map((f) => ({ fil: r.fil, ...f }))),
      },
      null,
      2,
    ),
  );
} else {
  for (const r of rapporter) {
    console.log(`\n${r.fil}  (${r.fund.filter((f) => !f.bundet).length})`);
    for (const f of r.fund) {
      console.log(
        `  ${String(f.linje).padStart(5)}  ${(f.dinglende ? "DINGLENDE" : f.bundet ? "bundet" : "UBUNDET ").padEnd(10)} ${f.tekst}`,
      );
    }
  }
  const filerMedUbundte = rapporter.filter((r) => r.fund.some((f) => !f.bundet)).length;
  console.log(`\n${filerMedUbundte} filer — ${ubundte.length} ubundne <label>${VIS_DINGLENDE ? `, ${synligeDinglende.length} dinglende for=` : ""}`);
}

// No non-zero exit: this is a measurement, not a merge gate. The assertion
// that the repo has no dangling `for` lives in `src/lib/label-scan-gate.test.ts`,
// so a fixture with a planted dangling binding can still be scanned.
process.exit(0);
