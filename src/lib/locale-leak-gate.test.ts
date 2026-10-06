import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * The locale-leak scanner is a gate, so the gate is itself tested. A scanner
 * nobody verifies is a scanner that quietly stops finding things — and this one
 * replaced a hand-written measurement that cost half an hour per run (opgave
 * 95). Reverse-verified: the "planted leak" cases below fail without the
 * detector they name.
 */

const ROOT = resolve(__dirname, "..", "..");
const SCRIPT = resolve(ROOT, "scripts", "locale-leak.mjs");

type ScanResult = {
  seMountedComponents: number;
  scannedPages: number;
  candidatesFromPages: number;
  candidates: number;
  needsEyes: number;
  dead: number;
  unreviewed: { file: string; line: number; string: string }[];
  reviewed: { file: string; verdict: string; reviewNote: string }[];
};

/**
 * One scanner run answers both questions this file asks.
 *
 * `--gate --json` writes the JSON to stdout (locale-leak.mjs:1562) *and* exits 1
 * on an unreviewed candidate (1617), so the verdict and the findings come out of
 * a single walk over the repo instead of two. That is worth more than the time:
 * two runs could in principle disagree, and "the gate went red" plus "this string
 * is in the findings" is only a claim about the *same* scan if it is one scan.
 *
 * The cost of asking twice was measurable. Every test here spawns a fresh
 * process over all 743 candidates, ~790 ms a run, so a two-question test cost
 * 1.6 s and the file took 29 s. The Norwegian-plant test asked three times and
 * reached 5033 ms in CI — past vitest's 5000 ms default — so it reddened a
 * green train on 30/9 and passed again on the next run. One run per test puts
 * the slowest at ~0.8 s here, ~1.7 s on CI's slower runner.
 */
function runScanner(): { failed: boolean; json: ScanResult } {
  let stdout: string;
  let failed = false;
  try {
    stdout = execFileSync("node", [SCRIPT, "--gate", "--json"], {
      cwd: ROOT,
      encoding: "utf8",
    });
  } catch (error) {
    const failure = error as { status: number; stdout: string };
    // Only exit 1 is an answer this file expects: the gate refusing. Any other
    // status is the scanner itself crashing, and swallowing that would turn a
    // broken gate into a passing test.
    if (failure.status !== 1) throw error;
    failed = true;
    stdout = failure.stdout;
  }
  return { failed, json: JSON.parse(stdout) as ScanResult };
}

/**
 * Every spawn this file makes costs a full walk of the repo (~0,8 s locally,
 * ~1,7 s on CI's slower runner). Only the plants need a scan of their *own* —
 * they change the repo, so each one must see the state it created. The seven
 * tests that only ask questions about the repo as committed were each paying for
 * their own walk, which is what made this file the slowest in the suite.
 *
 * 6/10 measured it: 13 spawns, 38 s for the file, and the run reddens on
 * *timeout* alone under full-suite parallel load (three times, no assertion ever
 * failed) — vitest's default per-test limit is 5 s, and a spawn that normally
 * takes 0,8 s can cross that when six workers hammer the disk at once. The
 * answer is not to loosen the limit for the whole repo, and not to delete the
 * plants: it is to ask once, and to give the tests that genuinely spawn an
 * explicit limit of their own.
 */
const SPAWN_TIMEOUT = 30_000;

/**
 * Inserts an entry *inside* the `sePages` object literal, not at module scope.
 *
 * The first version of these three tests appended a `const PLANTET_SE = {…}` at
 * the end of the file, and all three plants stayed green — correctly. R4 only
 * looks inside the Swedish block, and a module-scope object beside it is not
 * Swedish copy. So the plant has to be placed where a real leak would be: a
 * `faqItems` answer in `sePages`, which is exactly where the two live bugs
 * were. A plant that does not go red is a plant in the wrong place, and it is
 * the same measurement error as planting a leak in a `daOnly` component.
 */
function plantInSePages(src: string, entry: string): string {
  const anchor = /const sePages: Record<string, PageData> = \{/;
  if (!anchor.test(src)) throw new Error("sePages-anker ikke fundet i page-data.ts");
  return src.replace(anchor, (m) => `${m}\n    ${entry}`);
}

describe("locale-leak scanner", () => {
  /**
   * One walk of the repo, shared by every test that only asks about it.
   *
   * The plants below each need their own run — they mutate a file, so a cached
   * answer would answer about the wrong repo. These seven cannot, so they read
   * this. `beforeAll` rather than a module-level const because the suite must
   * not walk the repo at import time, before vitest has set up the environment.
   */
  let repo: { failed: boolean; json: ScanResult };

  beforeAll(() => {
    repo = runScanner();
  }, SPAWN_TIMEOUT);

  it("fails the gate: every candidate a human has not judged is known", () => {
    // The load-bearing assertion. If someone pastes a Danish string into a
    // component that renders on beraknare.se, this is what turns red.
    expect(repo.failed).toBe(false);
  });

  it("derives the SE-mounted components from calculator-list.ts", () => {
    // 70 reachable components across the se-mounted pages. Hard-coded before?
    // Then adding a calculator would not have moved this number.
    expect(repo.json.seMountedComponents).toBeGreaterThan(50);
  });

  it("judges every candidate, and judges most of them dead", () => {
    const result = repo.json;
    expect(result.candidates).toBe(result.dead + result.needsEyes);
    // C65's lesson in one number: the raw text scan over-reports badly, so a
    // verdict layer is not optional.
    expect(result.dead).toBeGreaterThan(0);
  });

  it("keeps a reason on every reviewed entry", () => {
    // A dismissal without a reason is a dismissal nobody can check, which is
    // what made C65's finding list expensive to inherit.
    for (const entry of repo.json.reviewed) {
      expect(entry.reviewNote.length).toBeGreaterThan(20);
    }
  });

  it("does not report Danish copy that lives in a da:/se:/no: object", () => {
    // If the locale-object exclusion broke, every labels table on the site
    // would light up — and the candidate count would jump by hundreds.
    //
    // The bound was 250 when only the 72 components were scanned, then 700
    // for 126 files, and C163 moved it a third time: 593 → 739 candidates,
    // because the JSX rule could not see copy that sits on the line after its
    // tag or ends in `{" "}` — which is most of what Prettier writes. It moved
    // because the scan set got sharper, not because the rule loosened: 704 of
    // the 739 are the da-port verdict, and the other 35 are the same 35 a human
    // had already reviewed. Unreviewed stayed at 0.
    //
    // The absolute number is the weak half of this assertion, so the ratio
    // carries it: a broken exclusion reports locale-object copy that has *no*
    // port to be judged by, so the share the verdict layer dismisses collapses.
    // 0.9 sits under today's 0.95 and far above a broken exclusion.
    const result = repo.json;
    expect(result.candidates).toBeLessThan(900);
    expect(result.dead / result.candidates).toBeGreaterThan(0.9);
  });

  it("flags a module-scope Danish string in an SE-mounted component", { timeout: SPAWN_TIMEOUT }, () => {
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
      const run = runScanner();
      expect(run.failed).toBe(true);
      expect(JSON.stringify(run.json.unreviewed)).toContain("Vaskemaskine");
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
    expect(JSON.stringify(repo.json.unreviewed)).not.toContain("BolanBeregner");
  });

  it("refuses Danish copy that sits in the Danish branch of a locale dispatcher", { timeout: SPAWN_TIMEOUT }, () => {
    // HomeContent was the scanner's biggest reviewed entry: 38 finds, and a
    // note claiming the whole Danish homepage text stood on beraknare.se. It
    // does not — the file dispatches internally. Planted here so the verdict
    // cannot be lost with the REVIEWED entry it replaced (opgave 96).
    const target = resolve(ROOT, "src", "components", "MomsBeregner.tsx");
    const original = readFileSync(target);
    try {
      writeFileSync(
        target,
        `${original.toString("utf8")}\n` +
          `function PlantetSE() { return <div>Gratis kalkylator</div>; }\n` +
          `function PlantetNO() { return <div>Gratis kalkulator</div>; }\n` +
          `function PlantetDA() { return <div>Tørremaskine (per vask)</div>; }\n` +
          `export function Plantet({ locale }: { locale: string }) {\n` +
          `  if (locale === "no") return <PlantetNO />;\n` +
          `  if (locale === "se") return <PlantetSE />;\n` +
          `  return <PlantetDA />;\n` +
          `}\n`
      );
      const run = runScanner();
      expect(run.failed).toBe(false);
      expect(JSON.stringify(run.json.unreviewed)).not.toContain("Tørremaskine");
    } finally {
      writeFileSync(target, original);
    }
  });

  it("still flags a dispatcher that leaves a locale on its default branch", { timeout: SPAWN_TIMEOUT }, () => {
    // The safety property of the rule above: a file that only diverts `se` falls
    // through to its default on `no`, and that default is what a Norwegian
    // reader would see — so it must not be excused.
    const target = resolve(ROOT, "src", "components", "MomsBeregner.tsx");
    const original = readFileSync(target);
    try {
      writeFileSync(
        target,
        `${original.toString("utf8")}\n` +
          `function PlantetSE2() { return <div>Gratis kalkylator</div>; }\n` +
          `function PlantetDA2() { return <div>Opvaskemaskine (per vask)</div>; }\n` +
          `export function Plantet2({ locale }: { locale: string }) {\n` +
          `  if (locale === "se") return <PlantetSE2 />;\n` +
          `  return <PlantetDA2 />;\n` +
          `}\n`
      );
      const run = runScanner();
      expect(run.failed).toBe(true);
      expect(JSON.stringify(run.json.unreviewed)).toContain("Opvaskemaskine");
    } finally {
      writeFileSync(target, original);
    }
  });

  it("flags a Danish value inside the se: block — the leak R1-R3 cannot see", { timeout: SPAWN_TIMEOUT }, () => {
    // C71 gave /del-regning's tællerknapper names and pasted the Danish words
    // into `se`, so beraknare.se served "Færre personer" on an otherwise Swedish
    // page. Every other rule skips locale objects — that is where translations
    // live — so without R4 the string is invisible by construction. Planted:
    // the gate must go red on the Swedish block alone.
    const target = resolve(ROOT, "src", "components", "MomsBeregner.tsx");
    const original = readFileSync(target);
    try {
      writeFileSync(
        target,
        `${original.toString("utf8")}\n` +
          `const PLANTET_LABELS = { da: { apparat: "Støvsuger" }, se: { apparat: "Støvsuger" } };\n` +
          `export function Plantet3() { return <div>{PLANTET_LABELS.se.apparat}</div>; }\n`
      );
      const run = runScanner();
      expect(run.failed).toBe(true);
      // Egen streng, ikke den i DelRegningBeregner: ellers ville plantet være
      // grønt på grund af en virkelig lækage, og R4's egen dækning ville være
      // ubevis. Samme argument som i "flags a module-scope Danish string".
      expect(JSON.stringify(run.json.unreviewed)).toContain("Støvsuger");
    } finally {
      writeFileSync(target, original);
    }
  });

  it("does not flag Norwegian æ/ø, nor a Danish fallback nested in se", { timeout: SPAWN_TIMEOUT }, () => {
    // The safety property of R4. Norwegian writes æ and ø itself ("Færre
    // personer" is correct in Norwegian), so the same test must not run on a
    // `no:` block — C68's lesson about `ø` as a Danish marker. And a `da:`
    // object nested inside `se:` is a fallback, not Swedish copy, so it must
    // stay out too. Both plants must leave the gate green.
    const target = resolve(ROOT, "src", "components", "MomsBeregner.tsx");
    const original = readFileSync(target);
    try {
      writeFileSync(
        target,
        `${original.toString("utf8")}\n` +
          `const PLANTET_OK = {\n` +
          `  no: { faerre: "Færre personer", bokmaal: "lønn" },\n` +
          `  se: { opphoeg: { da: "højde", se: "höjd" } },\n` +
          `};\n` +
          `export function Plantet4() { return <div>{PLANTET_OK.no.faerre}</div>; }\n`
      );
      const run = runScanner();
      expect(run.failed).toBe(false);
      expect(JSON.stringify(run.json.unreviewed)).not.toContain("Færre personer");
      // `ø` i den norske blok er det samme argument: norsk skriver ø, så det må
      // ikke give en ny vurdering hverken.
      expect(JSON.stringify(run.json.unreviewed)).not.toContain("lønn");
    } finally {
      writeFileSync(target, original);
    }
  });

  it("scans page-data.ts, and flags Danish in its Swedish block", { timeout: SPAWN_TIMEOUT }, () => {
    // The blind spot that let two Danish answers live on beraknare.se's
    // third-largest page. Two independent reasons, and the test has to cover
    // both, because either one alone is enough to make the scan blind again:
    //   1. `page-data.ts` is imported as `@/lib/page-data`, and the walk only
    //      follows `@/components/*` — so the file was never in the scan set.
    //   2. It declares `const sePages: Record<string, PageData> = {`, not
    //      `se: {`, so R4's block key matched nothing even once it was scanned.
    // The plant is ASCII Danish, which is the harder half: it has no æ or ø,
    // so R4's letter test cannot see it and only R5's word list can.
    const target = resolve(ROOT, "src", "lib", "page-data.ts");
    const original = readFileSync(target);
    try {
      writeFileSync(
        target,
        plantInSePages(
          original.toString("utf8"),
          '  procent: { slug: "plantet", faqItems: [{ question: "Q", answer: "hvor A1 er det gamle tallet og B1 er det nye" }], },'
        )
      );
      const run = runScanner();
      expect(run.failed).toBe(true);
      expect(JSON.stringify(run.json.unreviewed)).toContain("hvor A1 er det gamle tallet");
    } finally {
      writeFileSync(target, original);
    }
  });

  it("does not flag a Danish identifier inside a ${…} interpolation", { timeout: SPAWN_TIMEOUT }, () => {
    // The safety property of R5, using the *real* `/bil` answer verbatim:
    // `Med kalkylatorns standardvärden på ${elbilSe.forudsætninger.kmPrAar}`.
    // The reader sees "Med kalkylatorns standardvärden på 15.000 km per år" —
    // every visible word is Swedish. The `æ` is in an object key, and what
    // renders there is a number. Testing the raw literal would report a
    // template for the spelling of a variable, which is how a rule that
    // over-reports gets ignored. The hole must be blanked first.
    //
    // The first version of this plant wrote "standardværden" in the literal
    // text, which is genuinely Danish — so the scanner was right to flag it and
    // the test was wrong. A safety test has to isolate the one property it
    // names, or it stops testing that property.
    const target = resolve(ROOT, "src", "lib", "page-data.ts");
    const original = readFileSync(target);
    try {
      writeFileSync(
        target,
        plantInSePages(
          original.toString("utf8"),
          '  plantet: { slug: "plantet", faqItems: [{ question: "Q", answer: `Med kalkylatorns standardvärden på ${elbilSe.forudsætninger.kmPrAar} km per år är besparingen ca.` }], },'
        )
      );
      const run = runScanner();
      expect(run.failed).toBe(false);
    } finally {
      writeFileSync(target, original);
    }
  });

  it("flags a long Danish answer in the Swedish block, not just a short one", { timeout: SPAWN_TIMEOUT }, () => {
    // The 200-char ceiling R4 inherited from `scanStrings` (where it skips
    // minified bundles) dropped exactly the two real leaks: 308 and 236
    // characters. A cap that skips the longest strings skips the ones with the
    // most prose in them, which is the opposite of what a length cap is for.
    const target = resolve(ROOT, "src", "lib", "page-data.ts");
    const original = readFileSync(target);
    try {
      const long = "hvor ".repeat(60);
      writeFileSync(
        target,
        plantInSePages(
          original.toString("utf8"),
          `  plantet: { slug: "plantet", faqItems: [{ question: "Q", answer: "${long}" }], },`
        )
      );
      const run = runScanner();
      expect(run.failed).toBe(true);
      expect(JSON.stringify(run.json.unreviewed)).toContain("hvor hvor");
    } finally {
      writeFileSync(target, original);
    }
  });

  // ------------------------------------------------------------------ P1/P2
  //
  // The port analysis is the rule that makes `src/app/**` scannable at all, and
  // it is the one rule that can be *too* eager: a port analysis that resolves
  // wrongly reports correct Danish as a leak, and 24 such finds on one page is
  // how a gate gets ignored. So every port shape is tested in both directions —
  // planted in a Danish branch (must stay green) and in the visible Swedish
  // branch (must go red) — in the same run, so neither can be satisfied by the
  // other.

  /**
   * Plants inside a `{locale === "se" && (…)}` block, the arm a Swedish reader
   * actually sees. `src/app/procent/page.tsx` is the host because C157 found a
   * real Danish block in its Swedish half, so the shape is the one the bug had,
   * not an invented one.
   */
  function plantInSeBranch(src: string, danish: string): string {
    const re = /\{locale === "se" && \(\n/;
    const m = re.exec(src);
    if (!m) throw new Error("se-gren ikke fundet");
    return `${src.slice(0, m.index + m[0].length)}<p>${danish}</p>\n${src.slice(m.index + m[0].length)}`;
  }

  /** Plants inside a `{locale === "da" && (…)}` block, which no SE reader sees. */
  function plantInDaBranch(src: string, danish: string): string {
    const re = /\{locale === "da" && \(\n/;
    const m = re.exec(src);
    if (!m) throw new Error("da-gren ikke fundet");
    return `${src.slice(0, m.index + m[0].length)}<p>${danish}</p>\n${src.slice(m.index + m[0].length)}`;
  }

  it("scans the calculator page files, not just the components they mount", () => {
    // C157 measured 726 Danish strings on 143 page files and could not act on
    // any of them. If the pages drop out of the scan set, the number of scanned
    // files goes back to the 72 components alone and the prose on 54 pages is
    // invisible again. C118's lesson: a test that asserts a property, not a
    // name, is what catches the set shrinking.
    expect(repo.json.scannedPages).toBeGreaterThan(40);
    // The pages are the files that carry the answer-first `<h2>`s, so at least
    // one Danish string on a page file must reach the verdict layer.
    expect(repo.json.candidatesFromPages).toBeGreaterThan(0);
  });

  it("flags Danish in the visible Swedish branch of a page", { timeout: SPAWN_TIMEOUT }, () => {
    const target = resolve(ROOT, "src", "app", "procent", "page.tsx");
    const original = readFileSync(target);
    try {
      writeFileSync(
        target,
        plantInSeBranch(original.toString("utf8"), "hvor A1 er det gamle tallet")
      );
      const run = runScanner();
      expect(run.failed).toBe(true);
      expect(JSON.stringify(run.json.unreviewed)).toContain("hvor A1 er det gamle tallet");
    } finally {
      writeFileSync(target, original);
    }
  });

  it("does not flag the same string in a da: branch of the same page", { timeout: SPAWN_TIMEOUT }, () => {
    // The safety property, and the half that would break silently. If the port
    // walk cannot see a `{locale === "da" && (…)}` wrapper, every page's Danish
    // answer-first block becomes a finding and the gate is noise. Both halves
    // run against the same host file, so the difference is the port alone.
    const target = resolve(ROOT, "src", "app", "procent", "page.tsx");
    const original = readFileSync(target);
    try {
      writeFileSync(
        target,
        plantInDaBranch(original.toString("utf8"), "hvor A1 er det gamle tallet")
      );
      const run = runScanner();
      expect(run.failed).toBe(false);
      expect(JSON.stringify(run.json.unreviewed)).not.toContain("hvor A1 er det gamle tallet");
    } finally {
      writeFileSync(target, original);
    }
  });

  it("reads the else-arm of a locale ternary as Danish, not as Swedish", { timeout: SPAWN_TIMEOUT }, () => {
    // The bug this rule was written after, on a real page. `/alder`'s
    // answer-first block is `{locale === "se" ? "Svar på de vanligaste
    // åldersfrågorna" : "Svar på de oftest stillede aldersspørgsmål"}` — the
    // Danish half is the *alternate* arm, with Swedish text in the same
    // expression. The first version of `topLevelTernary` demanded a value
    // character immediately before the `?`, matched zero of the 24 ternaries it
    // was written for, and reported every one of them as a leak. Locked by
    // planting a Danish string in that exact alternate arm.
    const target = resolve(ROOT, "src", "app", "alder", "page.tsx");
    const original = readFileSync(target);
    try {
      const src = original.toString("utf8");
      const anchor = /(:\s*)"Svar på de oftest stillede aldersspørgsmål"/;
      expect(anchor.test(src)).toBe(true);
      writeFileSync(
        target,
        src.replace(anchor, '$1"Svar på de oftest stillede aldersspørgsmål og hvor gammel er jeg"')
      );
      const run = runScanner();
      expect(run.failed).toBe(false);
      expect(JSON.stringify(run.json.unreviewed)).not.toContain("hvor gammel er jeg");
    } finally {
      writeFileSync(target, original);
    }
  });

  it("does not excuse a table that is read outside a da-port", { timeout: SPAWN_TIMEOUT }, () => {
    // P2 ("every read of this table sits behind a da-port") is a real rule, so
    // it needs its negative too: move the one read of `/promille`'s country
    // table out of the Danish block, and the Danish rows in it must be
    // reported. Without this, P2 could be satisfied by a table that is simply
    // never read at all.
    const target = resolve(ROOT, "src", "app", "promille", "page.tsx");
    const original = readFileSync(target);
    try {
      const src = original.toString("utf8");
      // Un-gate the read: the `{locale === "da" && (` above it becomes a plain
      // fragment, which is the state a real leak would be in.
      writeFileSync(target, src.replace(/\{locale === "da" && \(\n/, "{\n"));
      const run = runScanner();
      expect(run.failed).toBe(true);
      expect(JSON.stringify(run.json.unreviewed)).toContain("Østrig");
    } finally {
      writeFileSync(target, original);
    }
  });

  /**
   * C163 — the JSX rule could not see the copy that JSX actually writes.
   *
   * The rule was `>([^<>{}\n]{2,200})<`, and the leak on `beraknare.se/procent`
   * defeated it twice over: its sentence ends in `{" "}` (a `{`, which the
   * class excluded) and its first run of copy sits on the line *after* the
   * `<p>` (a `\n`, also excluded). So `/procent` had been shipping `lønsprocent`
   * — Norwegian — and `her` — Danish — to Swedish readers through four whole
   * iterations of the gate, because every plant above was written as
   * `<p>text</p>` on one line, which is the one shape the rule did catch.
   * A test that only plants the shape the detector handles is C115's lesson
   * repeated: it reproduces the expression instead of requiring the copy.
   */
  function plantInSeBranchAsJsxWritesIt(src: string, danish: string): string {
    const re = /\{locale === "se" && \(\n/;
    const m = re.exec(src);
    if (!m) throw new Error("se-gren ikke fundet");
    // `<p>` alone on its line, copy on the next, and `{" "}` closing it — the
    // shape Prettier produces for every sentence that ends in a link.
    const block = `        <p>\n          ${danish}:{" "}\n          <Link href="/procent">\n            svensk\n          </Link>\n        </p>\n`;
    return `${src.slice(0, m.index + m[0].length)}${block}${src.slice(m.index + m[0].length)}`;
  }

  it("flags Danish copy that ends in a {…} interpolation, on its own line", { timeout: SPAWN_TIMEOUT }, () => {
    const target = resolve(ROOT, "src", "app", "procent", "page.tsx");
    const original = readFileSync(target);
    try {
      writeFileSync(
        target,
        plantInSeBranchAsJsxWritesIt(original.toString("utf8"), "En lønsprocent kan du se")
      );
      const run = runScanner();
      expect(run.failed).toBe(true);
      expect(JSON.stringify(run.json.unreviewed)).toContain("En lønsprocent kan du se");
    } finally {
      writeFileSync(target, original);
    }
  });

  it("does not read a TypeScript generic as JSX copy", { timeout: SPAWN_TIMEOUT }, () => {
    // The other half of the same fix. A bare `>` matches `useState<string>('4.5')`
    // — the `>` closes `string` and what follows looks like copy to a rule that
    // only looks forwards. The rule is anchored on the tag's own `<` instead,
    // and a generic's `<` is preceded by an identifier. Without this, the fix
    // for C163 would have traded a missed leak for a class of false ones on
    // every `useState<T>('…')` in the repo.
    const target = resolve(ROOT, "src", "components", "LeasingBeregner.tsx");
    const original = readFileSync(target);
    try {
      const src = original.toString("utf8");
      // Anchoren følger koden: `LeasingBeregner.tsx` læser sine startværdier fra
      // `LEASING_EKSEMPEL` (2/10), så der står ikke længere et bogstaveligt tal i
      // `useState`. Det planten skal have er en `useState<string>(` **generisk**,
      // så formen matcher kilden uanset hvad der står som startværdi.
      const anchor = /^ {2}const \[bilpris, setBilpris\] = useState<string>\(.*$/m;
      expect(anchor.test(src)).toBe(true);
      // The exact false positive the first attempt produced: a generic whose
      // `>` is followed by more declarations, so a rule that only looks
      // forwards reads the rest of the component as one long run of copy. The
      // `æø` sits in an *identifier*, not in a quoted string, so the quoted
      // rule cannot see it — a real leak would be caught by that one, and this
      // plant has to isolate the JSX rule instead.
      writeFileSync(
        target,
        src.replace(
          anchor,
          "  const [bilpris, setBilpris] = useState<string>('300000');\n  const [udbætaling, setUdbætaling] = useState<string>('4.5');"
        )
      );
      const run = runScanner();
      expect(run.failed).toBe(false);
      expect(JSON.stringify(run.json.unreviewed)).not.toContain("udbætaling");
    } finally {
      writeFileSync(target, original);
    }
  });

  it("finds the Norwegian-on-Swedish copy that shipped on beraknare.se/procent", () => {
    // The host file itself, not a plant. C163's leak is fixed in `page.tsx`, so
    // this passes now — and would have failed the moment someone reintroduced
    // it, without anyone re-deriving a plant. The string is Norwegian
    // (`lønsprocent`) *and* ends in Danish `her`, so it trips both halves of
    // the same argument.
    const target = resolve(ROOT, "src", "app", "procent", "page.tsx");
    const src = readFileSync(target).toString("utf8");
    const seBranch = src.slice(src.indexOf('{locale === "se" && ('));
    expect(seBranch).not.toContain("lønsprocent");
    expect(seBranch).not.toContain("som kroner her");
  });
});
