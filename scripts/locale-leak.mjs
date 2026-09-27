#!/usr/bin/env node
/**
 * Locale-leak scanner.
 *
 * Finds Danish string literals that sit *outside* every `da:` / `se:` / `no:`
 * object, in components that are actually mounted on a Swedish or Norwegian
 * domain, and gives each find a verdict.
 *
 * Why the verdict layer exists: a raw text scan of this class produced 31 finds
 * and exactly **one** real bug (opgave 93 / C65). The other 30 were strings
 * that are dead (a daOnly page, a `locale === "da"` guard) or read through a
 * locale key at the display site. A scanner that reports 31 finds and calls
 * them all bugs is worse than no scanner, so every find is classified and the
 * ones a human already reviewed are listed in REVIEWED below with the reason.
 *
 * Usage:
 *   node scripts/locale-leak.mjs           # candidates + verdicts
 *   node scripts/locale-leak.mjs --gate    # exit 1 on unreviewed candidates
 *   node scripts/locale-leak.mjs --json    # machine-readable
 *   node scripts/locale-leak.mjs --weak    # also report the ambiguous å-strings
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SRC = join(ROOT, "src");
const GATE = process.argv.includes("--gate");
const JSON_OUT = process.argv.includes("--json");
const WEAK = process.argv.includes("--weak");

/**
 * `æ` and `ø` are Danish-only among the site's live locales, so they are a
 * strong marker. `å` is **not** — Swedish writes å, and the first run of this
 * scanner reported twelve perfectly Swedish strings in `BolanBeregner`
 * ("Ränta (% per år)", "Månadskostnad", "Lånebelopp") purely because of å. A
 * weak marker therefore needs a Danish-only token as well, and the ambiguous
 * remainder is reported by --weak rather than silently dropped.
 */
const DA_CHARS = /[æø]/i;
const DA_WEAK_CHAR = /å/i;
const DA_WEAK_TOKENS =
  /\b(?:til|ikke|uden|hvor|hvad|hvornår|udleje|udgift|gæld|tilføj|mellem|fremtid|tilbage|kroner|udbud|udlåning|udbetales|årigt|åligt|indtægt|udbetaling)\b/i;
const DA_WORDS =
  /\b(?:Vaskemaskin\w*|Tørremaskin\w*|Opvaskemaskin\w*|Køleskab\w*|Køle|Frys\w*|Støvsuger|Glødepære\w*|Kommfur|Mikrobølge\w*|Kaffemaskin\w*|Elkedel\w*|Radiator\w*|Tilføj|Fjern|Sammenlign|Beregner|Beregn|Udbetalingsperiode\w*|Samlivsstatus|Nedtælling|Nedtæller|Sparemål|Feriepenge|Boligstøtte|Børnepenge|Boliglån|Andelsbolig|Dagpenge|Sygedagpenge|Efterløn|Studielån|Udbetaling\w*|gæld|Gæld|hæfte|Hæfte|udleje|Udleje|beholde|Beholde|indtjening|udgift\w*|arbejdstid\w*|fremtid\w*|tilbage\w*|mellem|hæder|hæder)\b/;

// Curated word list, longest first so the reported word is the informative one.
const DA_WORD_LIST = [
  "Vaskemaskine", "Tørremaskine", "Opvaskemaskine", "Glødepære", "Kaffemaskine",
  "Køleskab", "Støvsuger", "Kommfur", "Mikrobølge", "Elkedel", "Radiator",
  "Tilføj", "Fjern", "Sammenlign", "Beregner", "Beregn", "Udbetalingsperiode",
  "Samlivsstatus", "Nedtælling", "Nedtæller", "Sparemål", "Feriepenge",
  "Boligstøtte", "Børnepenge", "Boliglån", "Andelsbolig", "Dagpenge",
  "Sygedagpenge", "Efterløn", "Studielån", "Udbetaling", "gæld", "Gæld",
  "hæfte", "Hæfte", "udleje", "Udleje", "beholde", "Beholde", "indtjening",
  "udgift", "arbejdstid", "fremtid", "tilbage", "mellem",
];

/** Components that render nothing at all outside the Danish domain. */
const DA_ONLY_COMPONENTS = new Set(["AffiliateBox", "SelvstaendigAffiliate"]);

/** Locale keys whose object bodies hold translated copy, not leaks. */
const LOCALE_KEYS = ["da", "se", "no"];

/** Props and attributes that are never user-visible copy. */
const NON_COPY_ATTRS = [
  "className", "class", "id", "htmlFor", "key", "href", "src", "alt_image",
  "type", "name", "placeholder_id", "data-testid", "to", "role", "lang",
  "target", "rel", "autoComplete", "inputMode", "style", "width", "height",
  "viewBox", "d", "fill", "stroke", "viewbox", "xmlns", "colSpan", "rowSpan",
  "max", "min", "step", "pattern", "accept", "size", "cols", "rows", "dir",
];

/**
 * Finds a human already cross-checked. An entry without a `string` covers the
 * whole file. Keyed by file + key + string, because line numbers move. Keep the
 * reason: it is the whole point — the next reader must not rebuy the rejection.
 *
 * `verdict: "KRÆVER ØJNE"` on a reviewed entry does NOT mean "ignored". It
 * means the leak is confirmed and tracked in an open task; the gate stays green
 * on it because it is known, and the plan names the task.
 */
const REVIEWED = [
  {
    file: "src/components/ForbrugslaanBeregner.tsx",
    verdict: "DØD",
    reason:
      "Alle fund er dansk annoncekopi (Partner-ads-tabel + AffiliateBox-props). AffiliateBox.tsx:34 har `if (locale !== \"da\") return null`, så intet af det kan vises på beraknare.se. Krydschecket samme som C65.",
  },
  {
    file: "src/components/BillaanBeregner.tsx",
    verdict: "DØD",
    reason:
      "Som ForbrugslaanBeregner: dansk annoncekopi, der kun når AffiliateBox, som returnerer null for ikke-da.",
  },
  {
    file: "src/components/TidszoneBeregner.tsx",
    verdict: "DØD",
    reason:
      "`tidszoner`-tabellen bærer `navn`/`by` i dansk form og `navnSe`/`bySe` kun hvor svensk afviger; displayet går gennem zoneNavn/zoneBy (:159-160), der læser `erSvensk ? tz.bySe ?? tz.by : tz.by`. Samme konvention som C66 samlede tabellerne efter.",
  },
  {
    file: "src/components/VaegttabBeregner.tsx",
    verdict: "DØD",
    reason:
      "AKTIVITETSFAKTORER-tabellen bærer danske aktivitetstekster, men displayet læser `l.activity[key].label` (:330); kun `.faktor` læses fra tabellen (:200).",
  },
  {
    file: "src/components/LeasingBeregner.tsx",
    key: "calculatorName",
    string: "Leasing Beregner",
    verdict: "DØD",
    reason:
      "Delt tekst, men 'Leasing Beregner' er det samme i svensk — ikke en fejl, kun en streng der ligner dansk.",
  },
  {
    file: "src/components/energi/PrisomraadeVaelger.tsx",
    verdict: "KRÆVER ØJNE",
    reason:
      "Bekræftet fejl, aldrig målt før: C65 scannede kun src/components/*Beregner.tsx, så undermappen src/components/energi/ blev aldrig kigget på. 'Øst (DK2)'/'Østdanmark (DK2)'/'Sjælland, øerne og Bornholm' er danske elpriszoner og står på beraknare.se. Se opgave 99.",
  },
  {
    file: "src/components/energi/ElprisGraf.tsx",
    verdict: "KRÆVER ØJNE",
    reason:
      "Bekræftet fejl, aldrig målt før (samme blinde plet som PrisomraadeVaelger): 'Vælg dag' og 'Morgendagens priser offentliggøres ca. kl. 13' er dansk på en SE-monteret komponent. Se opgave 99.",
  },
  {
    file: "src/components/energi/EnergiKilde.tsx",
    verdict: "KRÆVER ØJNE",
    reason:
      "Bekræftet fejl, aldrig målt før: ', nettarif er en standardværdi (gennemsnitlig C-kunde)' er dansk brødtekst i en SE-monteret komponent. Se opgave 99.",
  },
  {
    file: "src/components/GaeldsfriBeregner.tsx",
    verdict: "KRÆVER ØJNE",
    reason:
      "Bekræftet fejl i delt tekst: /gaeldsfri hedder 'Skuldfri' på beraknare.se (calculator-list.ts:96), men del-linket sætter calculatorName til 'Gældsfri Beregner' (:422) og gældsrækken til 'Gæld ${p.id}' (:194). Ny klasse, ingen tidligere måling. Se opgave 99.",
  },
  {
    file: "src/components/KonfirmationBeregner.tsx",
    verdict: "KRÆVER ØJNE",
    reason:
      "Delt tekst der blander ${l.underskudPaa}-interpolation med dansk kode rundt om. Ikke en ren dansk streng, så den kræver en oversættelses-klynge. Se opgave 99.",
  },
  {
    file: "src/components/StructuredData.tsx",
    key: "description",
    string:
      "Gratis danske beregnere til økonomi, lån, skat, helbred og datoer",
    verdict: "DØD",
    reason:
      "Defaultværdi i signaturen; layout.tsx:109 sender altid getTranslations(locale).site.description, så defaulten bruges aldrig.",
  },
];

const VERDICT_ORDER = ["KRÆVER ØJNE", "DØD"];

// ---------------------------------------------------------------- helpers

function read(file) {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

function lineOf(text, offset) {
  let line = 1;
  for (let i = 0; i < offset; i++) if (text[i] === "\n") line++;
  return line;
}

/**
 * Strips comments, import paths and CSS-ish attribute values, because a
 * comment can be written in any language and a Tailwind class is not copy.
 * C65's first scanner reported Danish *comments* as candidate leaks.
 */
function stripNoise(src) {
  let out = src;
  out = out.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  out = out.replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));
  out = out.replace(/(?:^|\n)\s*import\s[^\n]*?from\s+"[^"]*"[;\n]/g, (m) => m.replace(/[^\n]/g, " "));
  out = out.replace(/(?:^|\n)\s*import\s+"[^"]*"[;\n]/g, (m) => m.replace(/[^\n]/g, " "));
  for (const attr of NON_COPY_ATTRS) {
    out = out.replace(
      new RegExp(`\\b${attr}=(?:"[^"]*"|\\{[^}]*\\})`, "g"),
      (m) => m.replace(/[^\n]/g, " ")
    );
  }
  return out;
}

/** Brace-matched ranges of every `da:` / `se:` / `no:` object literal. */
function localeObjectRanges(src) {
  const ranges = [];
  const keyRe = new RegExp(`(^|[\\s,{])(${LOCALE_KEYS.join("|")})\\s*:\\s*\\{`, "g");
  let m;
  while ((m = keyRe.exec(src)) !== null) {
    const open = src.indexOf("{", m.index);
    let depth = 0;
    let end = -1;
    for (let i = open; i < src.length; i++) {
      const c = src[i];
      if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end === -1) continue;
    ranges.push([open, end]);
    keyRe.lastIndex = end;
  }
  // `da: "…"`, `se: "…"` — a bare string on a locale key, no braces.
  const bareRe = new RegExp(`(^|[\\s,{])(${LOCALE_KEYS.join("|")})\\s*:\\s*"`, "g");
  while ((m = bareRe.exec(src)) !== null) {
    const from = src.indexOf('"', m.index);
    ranges.push([from, src.indexOf('"', from + 1)]);
  }
  return ranges;
}

function inRanges(ranges, offset) {
  return ranges.some(([a, b]) => offset >= a && offset <= b);
}

/**
 * Is this string Danish copy that nobody translated? `weak` additionally
 * accepts a bare `å`, which is how Swedish-only strings sneak in — use it to
 * audit the ambiguous set, not as the default.
 */
/**
 * `"Gældsfri Beregner"` is written with a \u-escape in one place and
 * literally in another, so every value is decoded before it is reported or
 * compared against the reviewed list.
 */
function unescapeUnicode(value) {
  return value.replace(/\\u([0-9a-f]{4})/gi, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
}

function isDanish(value, weak) {
  if (DA_CHARS.test(value) || DA_WORDS.test(value)) return true;
  return weak && DA_WEAK_CHAR.test(value);
}

/** Component imports of a file: `import X from "@/components/y"`. */
function componentImports(src) {
  const names = new Set();
  const files = new Set();
  const re = /import\s+(?:([A-Za-z0-9_$]+)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s+"@\/components\/([^"]+)"/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const [, def, named, path] = m;
    if (def) names.add(def);
    if (named) {
      for (const part of named.split(",")) {
        const name = part.trim().split(/\s+as\s+/).pop()?.trim();
        if (name) names.add(name);
      }
    }
    files.add(path);
  }
  return { names, files };
}

/** Offsets where a module-scope table is read, excluding its own declaration. */
function tableReads(src, table) {
  const declRe = new RegExp(`(?:^|\\n)\\s*(?:export\\s+)?const\\s+${table}\\b`, "g");
  const decls = new Set();
  let d;
  while ((d = declRe.exec(src)) !== null) decls.add(d.index);
  return [...src.matchAll(new RegExp(`\\b${table}\\b`, "g"))]
    .map((x) => x.index)
    .filter((i) => ![...decls].some((d2) => i >= d2 && i < d2 + 40));
}

/**
 * Character ranges of every `<AffiliateBox …/>` / `<SelvstaendigAffiliate …/>`
 * element in a file, brace-balanced so multi-line props are covered.
 */
function affiliateRanges(src) {
  const ranges = [];
  const imported = [...src.matchAll(/from\s+"@\/components\/AffiliateBox"/g)];
  if (imported.length === 0) return ranges;
  for (const name of DA_ONLY_COMPONENTS) {
    const re = new RegExp(`<${name}(?![A-Za-z0-9_$])`, "g");
    let m;
    while ((m = re.exec(src)) !== null) {
      let depth = 0;
      let end = -1;
      for (let i = m.index; i < src.length; i++) {
        const c = src[i];
        if (c === "{") depth++;
        else if (c === "}") depth--;
        else if (depth === 0 && c === "/" && src[i + 1] === ">") {
          end = i + 2;
          break;
        }
      }
      if (end !== -1) ranges.push([m.index, end]);
    }
  }
  return ranges;
}

/**
 * Brace-matched body range of every top-level `function X(…) {}` in a file.
 * Only declarations at column 0 count: a nested function is part of its
 * parent's branch, not a branch of its own.
 */
function topLevelFunctions(src) {
  const out = [];
  const re = /(^|\n)(?:export\s+)?function\s+([A-Za-z0-9_$]+)\s*\(([^)]*)\)\s*\{/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    // The match ends on the body brace, and the params may contain `{`
    // themselves (destructured props), so the brace is taken from the match
    // and not from the next `{` in the file.
    const open = m.index + m[0].length - 1;
    let depth = 0;
    let end = -1;
    for (let i = open; i < src.length; i++) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end === -1) continue;
    out.push({ name: m[2], params: m[3], start: open, end });
    re.lastIndex = end;
  }
  return out;
}

/**
 * The locale dispatch of a file: which top-level function renders which locale.
 * `HomeContent` is the canonical case — `if (locale === "se") return <SE />`
 * — and it is invisible from the page that mounts it, because the gate is
 * inside the component.
 *
 * Returns null unless **every** locale in `LOCALE_KEYS` is accounted for. A
 * dispatcher that only handles `se` still falls through to its default branch
 * on `no`, and that default really is what a Norwegian reader would see — so a
 * partial dispatcher is reported, not excused.
 */
function localeDispatch(src) {
  const fns = topLevelFunctions(src);
  const byName = new Set(fns.map((f) => f.name));
  for (const fn of fns) {
    if (!/\blocale\b/.test(fn.params)) continue;
    const body = src.slice(fn.start, fn.end);
    const branches = new Map();
    for (const b of body.matchAll(
      /if\s*\(\s*locale\s*===\s*"(da|se|no)"\s*\)\s*return\s*<?\s*([A-Za-z0-9_$]+)/g
    )) {
      if (byName.has(b[2])) branches.set(b[1], b[2]);
    }
    if (branches.size === 0) continue;
    const rest = LOCALE_KEYS.filter((l) => !branches.has(l));
    if (rest.length !== 1) continue;
    const diverted = new Set(branches.values());
    const falls = [...body.matchAll(/return\s*<?\s*([A-Za-z0-9_$]+)[\s/>;]/g)]
      .map((x) => x[1])
      .filter((n) => byName.has(n) && !diverted.has(n));
    if (falls.length === 0) continue;
    const byLocale = new Map(branches);
    byLocale.set(rest[0], falls[falls.length - 1]);
    return { dispatcher: fn.name, byLocale, fns };
  }
  return null;
}

let dispatchCache = null;

function dispatchFor(file) {
  if (!dispatchCache) dispatchCache = new Map();
  if (!dispatchCache.has(file)) {
    dispatchCache.set(file, localeDispatch(stripNoise(read(file) || "")));
  }
  return dispatchCache.get(file);
}

function resolveComponentPath(path) {  for (const cand of [
    join(SRC, "components", `${path}.tsx`),
    join(SRC, "components", `${path}.ts`),
    join(SRC, "components", path, "index.tsx"),
    join(SRC, "components", path, "index.ts"),
  ]) {
    try {
      if (statSync(cand).isFile()) return cand;
    } catch {
      /* keep looking */
    }
  }
  return null;
}

// ------------------------------------------------------- SE-mounted graph

/**
 * Which pages exist per locale, read from calculator-list.ts rather than a
 * hand-written list. A daOnly page cannot show Danish text to a Swedish
 * reader no matter what its component contains — C65's most expensive
 * mistake was assuming otherwise from a filename.
 */
function readCalculatorDefs() {
  const src = read(join(SRC, "lib", "calculator-list.ts")) || "";
  const defs = [];
  const re = /\{\s*href:\s*"([^"]+)"((?:,\s*\w+:\s*\w+)*)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const flags = m[2] || "";
    defs.push({ href: m[1], daOnly: /daOnly:\s*true/.test(flags), seOnly: /seOnly:\s*true/.test(flags) });
  }
  return defs;
}

function pageFileForHref(href) {
  const cand = join(SRC, "app", href.slice(1), "page.tsx");
  try {
    if (statSync(cand).isFile()) return cand;
  } catch {
    /* no page */
  }
  return null;
}

function buildMountGraph() {
  const defs = readCalculatorDefs();
  /** page file -> component files it reaches */
  const pages = new Map();
  const seen = new Set();

  const walk = (file, onComponent) => {
    const key = `${file}`;
    if (seen.has(key)) return;
    seen.add(key);
    // Imports are read from the raw file: stripNoise removes import lines on
    // purpose, so the stripped source has no `@/components/` paths left.
    for (const path of componentImports(read(file) || "").files) {
      const resolved = resolveComponentPath(path);
      if (!resolved) continue;
      onComponent(resolved);
      walk(resolved, onComponent);
    }
  };

  for (const def of defs) {
    const page = pageFileForHref(def.href);
    if (!page) continue;
    const set = new Set();
    walk(page, (c) => set.add(c));
    pages.set(page, { href: def.href, seMounted: !def.daOnly, components: set });
  }

  // The homepage is not in calculator-list.ts.
  const home = join(SRC, "app", "page.tsx");
  try {
    statSync(home);
    const set = new Set();
    walk(home, (c) => set.add(c));
    pages.set(home, { href: "/", seMounted: true, components: set });
  } catch {
    /* no home */
  }

  return pages;
}

// ------------------------------------------------------------- detection

/** Danish strings outside every locale object, with file + line. */
function scanStrings(file, weak = false) {
  const raw = read(file);
  if (raw === null) return [];
  const src = stripNoise(raw);
  const localeRanges = localeObjectRanges(src);
  const found = [];

  // 1. quoted strings: "…" or '…' or `…`
  const strRe = /(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g;
  let m;
  while ((m = strRe.exec(src)) !== null) {
    if (inRanges(localeRanges, m.index)) continue;
    const value = unescapeUnicode(m[0].slice(1, -1));
    if (value.length < 2 || value.length > 200) continue;
    if (!isDanish(value, weak)) continue;
    found.push({ ...classify(src, raw, m.index, value), string: value });
  }

  // 2. bare JSX text: >dansk tekst<
  const jsxRe = />([^<>{}\n]{2,200})</g;
  while ((m = jsxRe.exec(src)) !== null) {
    if (inRanges(localeRanges, m.index)) continue;
    const value = m[1].trim();
    if (value.length < 2) continue;
    if (!isDanish(value, weak)) continue;
    found.push({ ...classify(src, raw, m.index, value), string: value });
  }

  return found.map((f) => ({ ...f, file, line: lineOf(raw, f.offset) }));
}

/** Where in the file a string sits: the key it fills and the table holding it. */
function classify(src, raw, offset, value) {
  const lineStart = src.lastIndexOf("\n", offset) + 1;
  const lineEnd = src.indexOf("\n", offset);
  const line = src.slice(lineStart, lineEnd === -1 ? src.length : lineEnd);
  const before = src.slice(Math.max(0, offset - 200), offset);

  // key: the property/attribute the string fills
  const keyMatch =
    /(\w+)\s*[:=]\s*["'`]?$/.exec(src.slice(0, offset).replace(/\n[\s\S]*$/, "")) ||
    /(\w+)\s*=\s*$/.exec(line.slice(0, offset - lineStart));
  const key = keyMatch ? keyMatch[1] : null;

  // table: the module-scope const whose [ or { opened most recently above
  let table = null;
  const declRe = /(?:^|\n)\s*(?:export\s+)?const\s+([A-Za-z0-9_$]+)\s*(?::[^=]+)?=\s*[\[{]/g;
  let d;
  while ((d = declRe.exec(src)) !== null) {
    if (d.index < offset) table = d[1];
  }

  // jsx: inside a JSX element?
  const jsx = /<[A-Za-z]/.test(src.slice(Math.max(0, offset - 400), offset));

  return { offset, key, table, jsx, line, before, raw };
}

/**
 * The verdict. Ordered: the first rule that applies wins, because the earlier
 * ones are the ones a human would check first, and each is mechanically
 * decidable.
 */
function verdict(finding, file) {
  const src = stripNoise(read(file) || "");
  const { key, table, jsx } = finding;

  // R1 — the page that mounts this component is daOnly, so a Swedish reader
  // can never see it. C65's `PensionBeregner` was the expensive version of
  // this mistake.
  if (!isSeMounted(file)) {
    return { verdict: "DØD", reason: "komponenten monteres kun på en daOnly-side" };
  }

  // R2 — the component itself bails out for every non-danish locale.
  if (/if\s*\(\s*locale\s*!==\s*"da"\s*\)\s*return\s+null/.test(src)) {
    return { verdict: "DØD", reason: 'komponenten returnerer null når locale !== "da"' };
  }

  // R3 — the file dispatches per locale and this string sits in one of the
  // branches. `HomeContent`'s Danish homepage text is 34 finds in one file,
  // and every one of them renders on the Danish domain only, because the gate
  // is the component's own `if (locale === "se") return <HomeContentSE />`.
  // The page that mounts it cannot see that gate, so the scanner has to.
  const dispatch = dispatchFor(file);
  if (dispatch) {
    const owner = dispatch.fns.find(
      (f) => finding.offset >= f.start && finding.offset <= f.end
    );
    if (owner) {
      for (const [loc, name] of dispatch.byLocale) {
        if (name !== owner.name) continue;
        return {
          verdict: "DØD",
          reason: `locale-dispatcher: ${dispatch.dispatcher} sender "${loc}" til ${owner.name}, så strengen kan kun vises på ${loc}`,
        };
      }
    }
  }

  // R4 — mounted only inside a `locale === "da" &&` guard in its page.
  const mount = mountGuardFor(file);
  if (mount && mount.guarded) {
    return { verdict: "DØD", reason: `monteret under {locale === "da" && …} i ${mount.page}` };
  }

  // R5 — guarded by a variable assigned `locale === "da" ? … : null`
  // (`kildeInflation` in LoenstigningBeregner).
  const guardVars = [...src.matchAll(/const\s+(\w+)\s*=\s*locale\s*===\s*"da"\s*\?/g)].map((x) => x[1]);
  for (const v of guardVars) {
    if (new RegExp(`\\{\\s*${v}\\s*&&`).test(src)) {
      return { verdict: "DØD", reason: `strengen vises kun når ${v} er sat, og ${v} = locale === "da" ? … : null` };
    }
  }

  // R6 — the copy is a prop for a component that renders nothing outside
  // Denmark. `BillaanBeregner` and `ForbrugslaanBeregner` hold 30 Danish
  // strings that are all `AffiliateBox` copy; the box itself returns null.
  const adRanges = affiliateRanges(read(file) || "");
  if (adRanges.length > 0) {
    if (adRanges.some(([a, b]) => finding.offset >= a && finding.offset <= b)) {
      return {
        verdict: "DØD",
        reason: 'prop til AffiliateBox, som returnerer null når locale !== "da"',
      };
    }
    if (table) {
      const reads = tableReads(src, table);
      if (
        reads.length > 0 &&
        reads.every((i) => adRanges.some(([a, b]) => i >= a && i <= b))
      ) {
        return {
          verdict: "DØD",
          reason: `tabellen ${table} bruges kun af AffiliateBox, som er dansk-only`,
        };
      }
    }
  }

  // R7 — the row carries its own translation sibling (`navn` + `navnSe`,
  // `labelDa` + `labelSe`, `by` + `bySe`).
  if (key) {
    const sibling = new RegExp(`\\b${key}(?:Se|Da|No)\\s*:`);
    const row = src.slice(Math.max(0, finding.offset - 400), finding.offset + 200);
    if (sibling.test(row)) {
      return { verdict: "DØD", reason: `rækken bærer sin egen ${key}Se/${key}Da/${key}No-værdi` };
    }
  }

  // R8 — the table is read, but never on this key: the string is dead data.
  if (table && key && !jsx) {
    const reads = tableReads(src, table);
    if (reads.length > 0) {
      const readText = reads.map((i) => src.slice(i, i + 200)).join("\n");
      const keyRe = new RegExp(`\\.${key}\\b|\\[\\s*['"\`]?${key}['"\`]?\\s*\\]`);
      if (!keyRe.test(readText)) {
        return { verdict: "DØD", reason: `tabellen ${table} læses aldrig på nøglen "${key}"` };
      }
    }
  }

  // R9 — a default parameter value: used only when the caller omits the prop.
  if (/=\s*["'`][^"'`]*["'`]\s*[,)]/.test(src.slice(finding.offset - 4, finding.offset + 80))) {
    return { verdict: "DØD", reason: "defaultværdi i signaturen, bruges kun når proppen mangler" };
  }

  const where = jsx ? "JSX-tekst/attribut" : `tabel ${table || "?"}`;
  return {
    verdict: "KRÆVER ØJNE",
    reason: `dansk streng i ${where} uden for da/se/no — følg displayen og se om den læses gennem et locale-nøgle`,
  };
}

// ------------------------------------------------------- mount analysis

let graph = null;
let mountCache = null;

function seMountedFiles() {
  if (!mountCache) {
    const set = new Set();
    for (const [, page] of graph) {
      if (!page.seMounted) continue;
      for (const c of page.components) set.add(c);
    }
    mountCache = set;
  }
  return mountCache;
}

function isSeMounted(file) {
  return seMountedFiles().has(file);
}

/** How is the component mounted in the page(s) that reach it? */
function mountGuardFor(file) {
  for (const [page, info] of graph) {
    if (!info.components.has(file)) continue;
    const src = stripNoise(read(page) || "");
    const name = file
      .split("/")
      .pop()
      .replace(/\.tsx?$/, "");
    const uses = [...src.matchAll(new RegExp(`<${name}[\\s/>]`, "g"))];
    if (uses.length === 0) continue;
    const guarded = uses.every((u) => guardedAt(src, u.index));
    if (!guarded) return { page, guarded: false };
    return { page, guarded: true };
  }
  return null;
}

/**
 * Walks backwards from a JSX use, brace by brace, to the `{` that opened the
 * enclosing expression. If that expression is a `locale === "da"` guard, the
 * use cannot render on a Swedish domain.
 */
function guardedAt(src, index) {
  let depth = 0;
  for (let i = index - 1; i >= 0 && i > index - 2000; i--) {
    const c = src[i];
    if (c === "}") depth++;
    else if (c === "{") {
      if (depth === 0) {
        const expr = src.slice(i + 1, index);
        return /locale\s*===\s*"da"\s*(&&|\?)/.test(expr);
      }
      depth--;
    }
  }
  return false;
}

// ------------------------------------------------------------------ main

function rel(file) {
  return file.replace(`${ROOT}/`, "");
}

function run() {
  graph = buildMountGraph();
  const seFiles = [...seMountedFiles()].sort();

  const all = [];
  for (const file of seFiles) {
    for (const f of scanStrings(file, WEAK)) {
      const v = verdict(f, file);
      const reviewed = REVIEWED.find(
        (r) =>
          r.file === rel(file) &&
          (r.string === undefined || (r.key === f.key && r.string === f.string))
      );
      all.push({
        file: rel(file),
        line: f.line,
        key: f.key,
        table: f.table,
        string: f.string,
        verdict: v.verdict,
        reason: v.reason,
        reviewed: Boolean(reviewed),
        reviewNote: reviewed ? reviewed.reason : null,
      });
    }
  }

  const byFile = new Map();
  for (const f of all) {
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file).push(f);
  }

  const unreviewed = all.filter((f) => !f.reviewed && f.verdict === "KRÆVER ØJNE");
  const needsEyes = all.filter((f) => f.reviewed || f.verdict === "KRÆVER ØJNE");
  const dead = all.filter((f) => f.verdict === "DØD");

  if (JSON_OUT) {
    console.log(
      JSON.stringify(
        {
          seMountedComponents: seFiles.length,
          candidates: all.length,
          needsEyes: needsEyes.length,
          dead: dead.length,
          unreviewed,
          reviewed: all.filter((f) => f.reviewed),
          deadDetail: dead,
        },
        null,
        2
      )
    );
  } else {
    console.log(
      `Locale-leak: ${seFiles.length} komponenter monteres på beraknare.se/beregner.no\n` +
        `${all.length} kandidater — ${dead.length} døde, ${needsEyes.length} kræver øjne ` +
        `(${unreviewed.length} ureviewet)\n`
    );
    for (const [file, finds] of [...byFile].sort((a, b) => b[1].length - a[1].length)) {
      const shown = finds.filter((f) => f.verdict === "KRÆVER ØJNE" || f.reviewed);
      if (shown.length === 0) continue;
      console.log(`${file}  (${shown.length} af ${finds.length})`);
      for (const f of shown) {
        const tag = f.reviewed ? "REVIEWET" : "NY";
        console.log(`  ${tag} ${f.file}:${f.line}  [${f.key ?? "?"}] "${truncate(f.string)}"`);
        console.log(`        ${f.reviewNote ?? f.reason}`);
      }
      console.log("");
    }
    const deadByFile = new Map();
    for (const f of dead) {
      deadByFile.set(f.file, (deadByFile.get(f.file) || 0) + 1);
    }
    if (deadByFile.size > 0) {
      console.log("Døde strenge (automatisk afslået, ingen behov for øjne):");
      for (const [file, n] of [...deadByFile].sort((a, b) => b[1] - a[1])) {
        console.log(`  ${n.toString().padStart(3)}  ${file}`);
      }
    }
  }

  if (GATE && unreviewed.length > 0) {
    console.error(
      `\nFEJL: ${unreviewed.length} ureviewet(e) danske streng(e) i komponenter der monteres på beraknare.se.`
    );
    for (const f of unreviewed.slice(0, 20)) {
      console.error(`  ${f.file}:${f.line}  "${truncate(f.string)}"`);
    }
    process.exit(1);
  }

  return { all, unreviewed, seFiles };
}

function truncate(s) {
  return s.length > 70 ? `${s.slice(0, 67)}…` : s;
}

if (import.meta.url === `file://${process.argv[1]}`) run();
