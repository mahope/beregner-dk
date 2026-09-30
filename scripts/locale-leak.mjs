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
    verdict: "DØD",
    reason:
      "Alle tre `src/components/energi/`-komponenter monteres kun inden for `live`, og `live` er `locale === \"da\" ? elprisData : null` — i `Elberegner.tsx:76` (PrisomraadeVaelger:336, ElprisGraf:363, EnergiKilde:364) og i `ElbilBenzinBeregner.tsx:79` (:190, :281). Samme indbyggede port som `HomeContent` (C68), bare i forælderen og ikke i filen. Verificeret på det live site: `https://beraknare.se/solceller` har **0** hits på \"Egetforbrug\" og \"Østdanmark\", fordi `SolcelleBeregner.tsx:447` også gater hele elpris-blokken med `erDa`.",
  },
  {
    file: "src/components/energi/ElprisGraf.tsx",
    verdict: "DØD",
    reason:
      "Alle tre `src/components/energi/`-komponenter monteres kun inden for `live`, og `live` er `locale === \"da\" ? elprisData : null` — i `Elberegner.tsx:76` (PrisomraadeVaelger:336, ElprisGraf:363, EnergiKilde:364) og i `ElbilBenzinBeregner.tsx:79` (:190, :281). Samme indbyggede port som `HomeContent` (C68), bare i forælderen og ikke i filen. Verificeret på det live site: `https://beraknare.se/solceller` har **0** hits på \"Egetforbrug\" og \"Østdanmark\", fordi `SolcelleBeregner.tsx:447` også gater hele elpris-blokken med `erDa`.",
  },
  {
    file: "src/components/energi/EnergiKilde.tsx",
    verdict: "DØD",
    reason:
      "Alle tre `src/components/energi/`-komponenter monteres kun inden for `live`, og `live` er `locale === \"da\" ? elprisData : null` — i `Elberegner.tsx:76` (PrisomraadeVaelger:336, ElprisGraf:363, EnergiKilde:364) og i `ElbilBenzinBeregner.tsx:79` (:190, :281). Samme indbyggede port som `HomeContent` (C68), bare i forælderen og ikke i filen. Verificeret på det live site: `https://beraknare.se/solceller` har **0** hits på \"Egetforbrug\" og \"Østdanmark\", fordi `SolcelleBeregner.tsx:447` også gater hele elpris-blokken med `erDa`.",
  },
  {
    file: "src/components/KonfirmationBeregner.tsx",
    verdict: "DØD",
    reason:
      "Krydschecket: `${l.underskudPaa} ${formatKr(...)} ${l.udgifterOverstiger}` (:493) bruger tre nøgler, der alle findes i `da`, `se` og `no` (:62-63, :103-104, :145-146). `formatKr` er lokalt defineret med `locale`-betinget `toLocaleString`, så tallet følger domænet. Fundet var en målefejl: scanneren så `l.`-interpolation som \"dansk kode rundt om\".",
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
    file: "src/lib/page-data.ts",
    key: "huslejeSvaer",
    verdict: "DØD",
    reason:
      "Dansk hjælpekonstant på modulniveau, kun interpoleret i `daPages` (:1637 description, :1639 metaDescription) — to referencer, begge i den danske blok, ingen i `noPages` eller `sePages`. En dansk streng oven for en tabel den aldrig bruges i kan ikke vises på beraknare.se. Samme døde-klasse som `StructuredData.tsx`'e default, men fundet fordi page-data.ts først nu er i scanningssættet (C157).",
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

/** [openBrace, matchingCloseBrace] for the block whose `{` is at `open`. */
function braceRange(src, open) {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return [open, i];
    }
  }
  return null;
}

/** Brace-matched ranges of every `da:` / `se:` / `no:` object literal. */
/**
 * The key part of a locale-object opener, shared by both rules below.
 *
 * Two real shapes exist in the repo and both have to match, or the rules are
 * written against a shape no file has:
 *   - a bare labels entry:            `se: {`
 *   - a typed declaration:            `const sePages: Record<string, PageData> = {`
 *
 * The typed form is `key: Type = {` — one colon, then `=` — not `key: Type: {`.
 * The annotation is bounded to identifier/generic characters and must be
 * followed by `=`, so an `if` or a following statement cannot be swallowed, and
 * the bare `key: {` colon is a *separate* optional group. Letting the
 * annotation group absorb that colon instead loses every `da: {` in
 * `src/components/` — 255 strings in components that were green a moment
 * earlier.
 */
const TYPE_ANNOTATION = `(?::\\s*[A-Za-z_$][\\w$<>\\[\\],\\s.]*\\s*=\\s*)?`;
const BARE_KEY_COLON = `(?:\\s*:\\s*)?`;
const LOCALE_KEY_PATTERN =
  `(?:${LOCALE_KEYS.join("|")})(?:Pages)?\\s*${TYPE_ANNOTATION}${BARE_KEY_COLON}\\{`;

/** `const sePages: Record<string, PageData> = {` or a bare `se: {`. */
function localeObjectRanges(src) {
  const ranges = [];
  const keyRe = new RegExp(`(^|[\\s,{])${LOCALE_KEY_PATTERN}`, "g");
  let m;
  while ((m = keyRe.exec(src)) !== null) {
    const range = braceRange(src, src.indexOf("{", m.index));
    if (!range) continue;
    ranges.push(range);
    keyRe.lastIndex = range[1];
  }
  // `da: "…"`, `se: "…"` — a bare string on a locale key, no braces.
  const bareRe = new RegExp(
    `(^|[\\s,{])(${LOCALE_KEYS.join("|")})\\s*:\\s*"`,
    "g"
  );
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
 * R4 — a Danish value sitting in the `se:` block itself.
 *
 * `localeObjectRanges` skips every string inside a `da:`/`se:`/`no:` object,
 * because that is where the translations live. But it then also skips a
 * *Danish* value that was pasted into the Swedish block, so the one class of
 * leak that is by definition inside a labels table is invisible to the scan.
 * Not hypothetical: C71 gave `/del-regning`'s tællerknapper names
 * (`l.færre`/`l.flere`) and copied the Danish words into `se`, so beraknare.se
 * served "Færre personer" on a page whose every other word is Swedish.
 *
 * Swedish never writes `æ` or `ø` — they are Danish letters — so the rule has
 * no false positives by construction, and it is a rule rather than a note
 * because C65-C72 have each found a measurement that was blind in exactly one
 * predictable place.
 *
 * The block key is `se: {` **or** `sePages: … = {`, with or without a type
 * annotation on the key — see `LOCALE_KEY_PATTERN`, which both rules share.
 * `page-data.ts` — the single biggest store of translated copy on the site,
 * ~1.200 lines of it — keeps one object per locale (`daPages` / `noPages` /
 * `sePages`), not one nested `da:/se:/no:` object, so the narrow key matched
 * nothing there. That is the same blind spot as C115's `//`-hrefs and C116's
 * union test: a rettelse that covered the shape it was written against, not
 * the shape in the file.
 *
 * Deliberately NOT applied to `no:`. Norwegian writes `æ` and `ø` itself, so
 * the same test would be wrong there — C68's lesson about `ø` as a Danish
 * marker. And a nested locale object *inside* the `se` block (a `da:` fallback
 * for a value only Swedish needs) is skipped: it is not Swedish copy.
 */
/** `const sePages: Record<string, PageData> = {` or a bare `se: {`. */
const SE_BLOCK_KEY_PATTERN =
  `se(?:Pages)?\\s*${TYPE_ANNOTATION}${BARE_KEY_COLON}\\{`;

function seBlockDanishStrings(src) {
  const found = [];
  const keyRe = new RegExp(`(^|[\\s,{])${SE_BLOCK_KEY_PATTERN}`, "g");
  let m;
  while ((m = keyRe.exec(src)) !== null) {
    const range = braceRange(src, src.indexOf("{", m.index));
    if (!range) continue;
    const [open, end] = range;
    const block = src.slice(open, end + 1);
    // A nested locale object inside the Swedish block is not Swedish copy: it
    // is a `da:` fallback or a nested `no:` table. Brace-matched, because a
    // range that stops at the `{` covers nothing and the plant in the gate
    // test caught exactly that.
    const nested = [];
    const nestedRe = /(^|[\s,{])(da|no)\s*:\s*\{/g;
    let n;
    while ((n = nestedRe.exec(block)) !== null) {
      const inner = braceRange(block, block.indexOf("{", n.index));
      if (inner) nested.push([open + inner[0], open + inner[1]]);
      nestedRe.lastIndex = inner ? inner[1] : n.index;
    }
    const strRe = /(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g;
    let s;
    while ((s = strRe.exec(block)) !== null) {
      const abs = open + s.index;
      if (inRanges(nested, abs)) continue;
      const value = unescapeUnicode(s[0].slice(1, -1));
      // The 200-char ceiling is inherited from `scanStrings`, where it exists
      // to skip minified bundles. It does not belong here: in a *data* file a
      // long value is the normal case, not a smell — the two Swedish `/procent`
      // answers are 308 and 236 characters. A cap that silently drops the
      // longest strings is a cap that drops the ones with the most prose in
      // them, so the ceiling is raised rather than inherited.
      if (value.length < 2 || value.length > 2000) continue;
      // A `${…}` interpolation is an expression, not copy: `${elbilSe
      // .forudsætninger.kmPrAar}` renders a number, and the `æ` in it is a
      // Danish *identifier*. Testing the raw literal therefore reports a
      // template literal for the spelling of an object key. Only the literal
      // text around the holes is ever shown to a reader, so that is what is
      // tested. Braces are nested (`${a ? b : c}`), hence the loop.
      let literal = value;
      let prev;
      do {
        prev = literal;
        literal = literal.replace(/\$\{[^{}]*\}/g, " ");
      } while (literal !== prev);
      if (literal.trim().length < 2) continue;
      // The quote itself is not in the window: `abs` points *at* the opening
      // quote, so the key is whatever sits directly before it. That is also why
      // the key showed as `?` in the gate test's plant before this was fixed.
      const keyMatch = /(\w+)\s*:\s*["'`]?$/.exec(src.slice(Math.max(0, abs - 60), abs));
      const key = keyMatch ? keyMatch[1] : null;
      // `da: "højde"` on a bare key inside the `se` block is a fallback for a
      // value only one domain needs — not Swedish copy. The nested-object form
      // (`da: { … }`) is covered by `nested` above; this covers the bare one,
      // and the gate test's plant caught exactly the gap.
      if (key === "da" || key === "no") continue;
      if (!isDanish(literal, WEAK)) continue;
      found.push({ offset: abs, string: value, key });
    }
    keyRe.lastIndex = end;
  }
  return found;
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

/**
 * R5 — Danish words that are pure ASCII, so `DA_CHARS` can never see them.
 *
 * The whole `æ`/`ø` argument for R4 rests on Swedish not writing those two
 * letters. That is true, and it is also the *only* thing R4 looks at — so a
 * Danish sentence written in the ASCII subset that Swedish and Danish share
 * ("hvor A1 er det gamle tallet", "tager du middelverdien") is invisible. It
 * is not hypothetical: beraknare.se's `/procent` served exactly that, in the
 * middle of an otherwise fully Swedish page, for one deploy.
 *
 * Why a word list and not the character test: Swedish and Danish share
 * "koster"? no — but they do share "formel", "procent", "tabell", "vikt". So
 * the list is restricted to words whose Swedish form is a *different* word, not
 * a different spelling: Swedish writes `där/inte/utan/mellan/kvar/månader/
 * räknar/medelvärdet`, Danish writes `hvor/ikke/uden/mellem/tilbage/
 * måneder/regner/middelverdien`. A near-spelling is excluded on purpose,
 * because "gör" vs "gør" would fire on correct Swedish.
 *
 * Verified by measurement, not by taste: across the 1.192 lines of `sePages`
 * this list fires on exactly the two real leaks and nothing else. `noPages` is
 * excluded because Norwegian legitimately writes `hvor`, `ikke`, `koster`,
 * `ferie` and `rente` — C68's lesson, one locale over.
 */
const DA_ASCII_WORDS = [
  "hvor mange", "hvorfor", "hvornår", "hvordan", "hvor", "måneder", "tilbage",
  "regner", "tager", "tallet", "regnestykke", "udfyld", "kræver", "beløb",
  "vægten", "målvægt", "udlejer", "udleje", "udover", "udtrykket", "udbetales",
  "udbetaling", "indtast", "boligstøtte", "boliglån", "sparepenge", "barselsdagpenge",
  "dagpenge", "hæfter", "gæld", "betaler", "koster", "sparer", "tjener", "renter",
  "årsværk", "ferie",
];
const DA_ASCII_RE = new RegExp(
  `(?<![\\w-])(${DA_ASCII_WORDS.join("|")})(?![\\w-])`,
  "i"
);

/**
 * R4 + R5 together: a Danish value inside the Swedish block. `æ`/`ø` is the
 * strong test; the ASCII word list is what catches Danish that Swedish can
 * spell identically.
 */
function isDanish(value, weak) {
  if (DA_CHARS.test(value) || DA_WORDS.test(value)) return true;
  if (DA_ASCII_RE.test(value)) return true;
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

/** Matching `]` or `}` for the `[`/`{` at `open`, or -1. */
function bracketRange(src, open) {
  const pairs = { "[": "]", "{": "}" };
  const close = pairs[src[open]];
  if (!close) return -1;
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Offsets where a module-scope table is *read*, excluding its own declaration.
 *
 * The declaration is excluded as a whole value, not as a fixed-width window
 * around the name. The old 40-character window looked sufficient until
 * `PROMILLEGRAENSER_UDLAND` turned up with a 62-character type annotation
 * before its `=`: the name then counted as a read of itself, every table
 * looked like it had one ungated read, and P2 — "every read sits behind a
 * da-port" — was false for *every* table in the repo. A rule that is
 * structurally always false is worse than no rule, because it looks tested.
 */
function tableReads(src, table) {
  const declRe = new RegExp(`(?:^|\\n)\\s*(?:export\\s+)?const\\s+${table}\\b`, "g");
  const declRanges = [];
  let d;
  while ((d = declRe.exec(src)) !== null) {
    const eq = src.indexOf("=", d.index);
    // The value starts at the first `[` or `{` after the `=`; if there is none
    // (a scalar), the declaration is the name plus its initializer.
    let valueStart = eq === -1 ? -1 : -1;
    if (eq !== -1) {
      for (let i = eq; i < src.length && i < eq + 400; i++) {
        if (src[i] === "[" || src[i] === "{") {
          valueStart = i;
          break;
        }
        if (src[i] === ";") break;
      }
    }
    const valueEnd = valueStart === -1 ? eq : bracketRange(src, valueStart);
    declRanges.push([d.index, valueEnd === -1 ? d.index + table.length : Math.max(valueEnd, d.index)]);
    declRe.lastIndex = Math.max(declRe.lastIndex, declRanges[declRanges.length - 1][1]);
  }
  return [...src.matchAll(new RegExp(`\\b${table}\\b`, "g"))]
    .map((x) => x.index)
    .filter((i) => !declRanges.some(([a, b]) => i >= a && i <= b));
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
 * The file as it is on disk, for the *structural* passes.
 *
 * `stripNoise` blanks `className={…}`, `style={…}` and every other attribute
 * value, which is right for finding copy and wrong for pairing braces: a
 * blanked attribute unbalances the block it sits in, so walking backwards from
 * a string lands on the wrong `{` or none at all. On `/brok` that made the
 * port analysis report the `locale === "da"` prose block as having no port,
 * because the walk stopped two blocks early and the head it read was the
 * function body's `{`.
 *
 * Every `stripNoise` replacement is length-preserving (comments become spaces,
 * attribute values become spaces), so an offset into the stripped source is
 * the same offset into the raw one. The two can be mixed by index and not by
 * content: `stripNoise` to *find* the strings, the raw source to *pair* them.
 */
function structural(file) {
  return read(file) || "";
}

/**
 * Brace-matched body range of every top-level `function X(…) {}` in a file.
 * Only declarations at column 0 count: a nested function is part of its
 * parent's branch, not a branch of its own.
 */function topLevelFunctions(src) {
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

  // The dage-til landing pages are not in calculator-list.ts either — they are
  // one dynamic route per language, not a calculator. They are the *only* place
  // `DageTilPage.tsx` renders, so without this the component was outside the
  // scan set entirely and its hardcoded `til` served "Det finns 87 dagar til
  // juldagen" on all fourteen Swedish pages for months. The prefix is read from
  // `dage-til.ts` rather than written here, for the reason `danishOnlySections`
  // reads its list: a hand-copied route goes stale the day someone adds one.
  for (const href of dageTilHrefs()) {
    const page = pageFileForHref(href);
    if (!page) continue;
    const set = new Set();
    walk(page, (c) => set.add(c));
    pages.set(page, { href, seMounted: true, components: set });
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

  // 2. bare JSX text: the run of copy that opens a tag and is not another
  // tag. C163 measured why the old `>([^<>{}\n]{2,200})<` could not see
  // `/procent`'s own leak: the sentence ends in `her:{" "}`, and both halves
  // of that shape escaped — `{" "}` is a `{`, which the character class
  // excluded, and JSX puts the first run of copy on the *next* line, which
  // the `\n` excluded. The rule is therefore anchored on the tag instead:
  // a `<` that opens an element, its attributes, the `>`, and then the copy
  // up to the next `<` or `{`.
  //
  // The anchor is what keeps this a *JSX* rule and not a `>` rule. C163's
  // first attempt used a bare `>` and matched `useState<string>('4.5')` — a
  // TypeScript generic, where the `>` closes `string` and the following copy
  // is code. A real tag's `>` is preceded by its own `<`, and a TypeScript
  // generic's `<` is preceded by an identifier — so the lookbehind on `[\w$]`
  // is the whole difference between copy and code.
  const jsxRe = /(?<![\w$])<(?:\/[A-Za-z][\w.-]*>|[A-Za-z][\w.-]*(?:\s[^<>]*?)?\/?>)([^<>{}]{2,400}?)(?=[<{])/g;
  while ((m = jsxRe.exec(src)) !== null) {
    if (inRanges(localeRanges, m.index)) continue;
    const value = m[1].replace(/\s+/g, " ").trim();
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
  // Two views of the same file, mixed by index. `src` has comments and attribute
  // values blanked, which is what the copy rules want; `raw` has its braces
  // intact, which is what the port analysis needs. Offsets are identical
  // because every `stripNoise` replacement is length-preserving.
  const src = stripNoise(read(file) || "");
  const raw = structural(file);
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

  // P1 — the port: no Swedish reader can reach this string, so it is not a leak
  // however Danish it looks. Placed after the component rules because those
  // rules carry better reasons when both apply (R1 names the daOnly page,
  // P1 only says "a da-port"), and before the fallback because a page's own JSX
  // has no import edge and no dispatcher for the earlier rules to find.
  const port = portVerdict(raw, finding.offset);
  if (port.verdict === PORT_DA) {
    return {
      verdict: "DØD",
      reason: `da-port: strengen ligger i en ${port.shape}-gren, som kun danske læsere ser`,
    };
  }

  // P2 — module-scope table that is only ever read inside a da-port.
  if (table && !jsx && tableReadsAreDanishOnly(raw, table)) {
    return {
      verdict: "DØD",
      reason: `tabellen ${table} læses kun inde i en da-gren, så rækkerne vises aldrig på beraknare.se`,
    };
  }

  const where = jsx ? "JSX-tekst/attribut" : `tabel ${table || "?"}`;
  const suffix =
    port.verdict === PORT_SE
      ? " — den ligger i den synlige svenskegren, så følg den hele vej til displayen"
      : " — følg displayen og se om den læses gennem et locale-nøgle";
  return {
    verdict: "KRÆVER ØJNE",
    reason: `dansk streng i ${where} uden for da/se/no${suffix}`,
  };
}

// ------------------------------------------------------- mount analysis

let graph = null;
let mountCache = null;

/**
 * Sections `routing.ts` answers with `not-found` on a Swedish or Norwegian
 * domain. Read from the source rather than written out here, because a
 * hand-copied list is a list that goes stale exactly when someone adds a
 * section — the same failure class as C118's hand-written homepage list.
 */
/**
 * The dage-til landing routes, read from `dage-til.ts` so the scanner follows
 * the source rather than a list that can drift from it. The dynamic segment is
 * read from the directory itself instead of assumed, because `[dato]` is part
 * of the route — a scanner that guesses it would silently skip the page it was
 * added for. Both prefixes are served, so both are scanned.
 */
function dageTilHrefs() {
  const src = read(join(SRC, "lib", "dage-til.ts")) || "";
  const hrefs = [];
  for (const [, prefix] of src.matchAll(/_PREFIX\s*=\s*"([^"]*)"/g)) {
    const dir = join(SRC, "app", prefix);
    let segments = [];
    try {
      segments = readdirSync(dir, { withFileTypes: true })
        .filter((e) => e.isDirectory() && e.name.startsWith("["))
        .map((e) => e.name);
    } catch {
      continue;
    }
    for (const segment of segments) {
      hrefs.push(`${prefix}${segment}`.replace(/\/+$/, ""));
    }
  }
  return hrefs;
}

function danishOnlySections() {
  const src = read(join(SRC, "lib", "routing.ts")) || "";
  const m = /danishOnlySections\s*=\s*\[([^\]]*)\]/.exec(src);
  if (!m) return [];
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}

/**
 * P1 — the port analysis, and the reason the page files were unscanned.
 *
 * C157 measured 726 Danish strings on 143 page files and could not act on a
 * single one, because most of them are correct Danish in a `locale === "da"`
 * branch and there was no way to tell them from a leak. The component rules
 * above never applied either: `guardedAt` only knows `{locale === "da" && …}`,
 * and the pages use three further shapes.
 *
 * A port is a boolean, not a container: walk outwards from the string, one
 * enclosing `{…}` at a time, and resolve each level to *which locales can see
 * this text*. Four shapes exist in the repo and all four must be decidable:
 *
 *   {locale === "da" && (…)}            only da
 *   {locale === "se" ? <SE/> : <DA/>}   arm decides, so the offset matters
 *   {locale === "da" ? "…" : "…"}       the alternate arm is *not* da
 *   {locale === "da" || locale === "se"} visible on se — must not be excluded
 *
 * The ternary is why the naive version is wrong in the dangerous direction: the
 * first port scan in this iteration reported 24 strings from the *else* arm of
 * `locale === "se" ? … : …` as leaks, including every `<h2>` on `/alder`'s
 * answer-first block. All 24 were correct Danish, and the Swedish text sits
 * directly beside them in the same expression.
 *
 * Anything the walk cannot resolve returns "OK" — a candidate, not a verdict.
 * An unresolved port must never be read as "Danish only", or the gate reports
 * noise nobody will read, which is how a scanner stops being run at all (C65).
 */
const PORT_DA = "DA";
const PORT_SE = "SE";
const PORT_UNKNOWN = "OK";

/**
 * The locale visibility a port condition declares, or null if the expression
 * does not open with a locale test.
 *
 * The condition is the *leading segment* — everything up to the first `&&` or
 * `?`. Testing the whole expression instead is the bug this function exists to
 * prevent: what follows the `{` is not only the condition, it is every line of
 * JSX between the enclosing brace and the string, and a `locale === "da" &&`
 * twenty lines up is not a guard on this string. That version passed a Danish
 * leak planted in the middle of `/procent`'s Swedish prose.
 *
 * Each `||`-term must be a complete `locale` comparison. A partial match like
 * `locale === "da" || isAdmin` is refused rather than guessed, because a
 * half-read condition either hides a leak or invents one.
 */
function portCondition(before, src) {
  const stop = before.search(/&&|\?/);
  if (stop === -1) return null;
  // A ternary written as an object-literal property carries every *earlier*
  // property in the head, because `{` opened on the `return` line:
  //   return {
  //     headline: `${copy[locale].today} …`,
  //     equivalent: locale === "da" ? "…" : "…",
  //   }
  // so the head is a comma-separated list of properties and the condition is
  // only its last value. Reading the whole head is what made every such
  // ternary "not a condition" and reported its Danish arm as a candidate.
  // Only the last top-level segment is taken, and "top level" is measured by
  // brace/bracket/paren depth so a comma inside a template literal, a call or
  // an array does not split it.
  let depth = 0;
  let lastComma = -1;
  for (let i = 0; i < stop; i++) {
    const c = before[i];
    if (c === "{" || c === "[" || c === "(") depth++;
    else if (c === "}" || c === "]" || c === ")") depth--;
    else if (c === "," && depth === 0) lastComma = i;
  }
  const cond = before
    .slice(lastComma + 1, stop)
    .trim()
    .replace(/^\(+/, "")
    .replace(/\)+$/, "")
    .trim()
    // A single-property object still carries its key: `equivalent: locale === "da"`.
    .replace(/^[A-Za-z_$][\w$]*\s*:\s*(?=[A-Za-z_$])/, "")
    .trim();
  if (cond.length === 0 || cond.length > 200) return null;
  const flags = [];
  for (const term of cond.split("||").map((t) => t.trim())) {
    // `locale === "da"` is the plain form. The other two spellings in the repo
    // route through a local alias, and the *term* is the whole comparison
    // (`se ? …`, `daSe === "se" ? …`), so the alias name is extracted here and
    // its declaration read from the file. Guessing the alias instead is what
    // made this rule's first version resolve the wrong arm on `/tidsberegner`.
    const direct = /^locale\s*(===|!==)\s*"(da|se|no)"$/.exec(term);
    if (direct) {
      flags.push(direct[1] === "===" ? direct[2] : `!${direct[2]}`);
      continue;
    }
    const withValue = /^([A-Za-z_$][\w$]*)\s*(===|!==)\s*"(da|se|no)"$/.exec(term);
    const bareName = withValue ? null : /^([A-Za-z_$][\w$]*)$/.exec(term);
    if (!withValue && !bareName) return null;
    const name = withValue ? withValue[1] : bareName[1];
    const decl = aliasFlags(src, name);
    if (!decl) return null;
    // `const dageLocale: DageTilLocale = locale` is not a narrowed alias, it
    // *is* the locale under a different name — so a comparison against it
    // compares against `locale` and is resolved by re-running the direct form
    // on the rewritten term. Returning a locale tuple here instead would have
    // to guess which locale the name stands for, and guessing wrong is the one
    // direction that hides a leak.
    if (decl.isLocaleCopy) {
      // Substitute the name for `locale` in the *term*, then let the direct
      // form decide. The operator is injected from the match rather than
      // re-captured, so the only capture group left is the locale — reading
      // `rewritten[1]` as the operator gave `"!undefined"` and reported every
      // `dageLocale === "da" ? "…" : "…"` arm as visible on Swedish, which is
      // the one answer this rule must never give.
      const rewritten = new RegExp(
        `^locale\\s*${withValue ? withValue[2] : "==="}\\s*"(da|se|no)"$`
      ).exec(term.replace(new RegExp(`^${name}\\b`), "locale"));
      if (!rewritten) return null;
      flags.push(withValue && withValue[2] === "!==" ? `!${rewritten[1]}` : rewritten[1]);
      continue;
    }
    // A bare name is used as a boolean — it is true on its true-locale. A
    // compared name is true only on the branch it was compared against. The
    // two are distinguished by the match, not by counting capture groups: a
    // `RegExp` result's length is an implementation detail, and reading it that
    // way made the bare form fall through to the `===` path with no operator
    // and re-report `/promille`'s `se ? … : …` twice.
    const compared = withValue ? withValue[3] : null;
    const op = withValue ? withValue[2] : "===";
    const onTrue = aliasTrueLocale(decl);
    const onFalse = aliasFalseLocale(decl);
    let hit;
    if (compared === null) hit = onTrue;
    else if (compared === onTrue) hit = true;
    else if (compared === onFalse) hit = false;
    else return null;
    if (!hit) return null;
    const locale = hit ? onTrue : onFalse;
    if (!locale) return null;
    flags.push(op === "!==" ? `!${locale}` : locale);
  }
  // A condition that is *not* the whole head of the expression is not a
  // condition — `locale === "da" && (` ends at `&&`, and the rest is JSX. The
  // ternary path needs this to be false: `topLevelTernary` will happily find a
  // `?` fifty lines down inside nested JSX, and reading that as the arm of this
  // expression inverts the verdict. On `/brok` it turned a `da`-only block into
  // "visible on Swedish", which is the one answer this rule must never give.
  const rest = before.slice(stop).trimStart();
  return { flags, terminatedBy: before[stop], consumed: stop, rest };
}

/**
 * Resolve a non-`locale` port name from its own declaration, e.g. `se` in
 * `const se = locale === "se";`.
 *
 * Four real shapes, all read out of the pages rather than guessed:
 *   const se = locale === "se";                 → true on that locale
 *   const erDa = locale !== "da";               → true everywhere but da
 *   const daSe = locale === "se" ? "se" : "da"; → a locale *string*, so it is
 *                                               compared with `===` against one
 *                                               of the two branches, and the
 *                                               other branch is the complement
 * A name with no such declaration returns null, so an unrecognised alias makes
 * the branch "unknown" — a candidate to look at — instead of silently Danish.
 *
 * The string-alias case is the one the first version got wrong in the unsafe
 * direction: it returned only the locale named in the *true* branch, so
 * `daSe === "da"` was read as "true on da" when the declaration says the
 * opposite. `/tidsberegner`'s answer-first heading was the one remaining
 * finding, and it was the alternate arm of exactly that expression.
 *
 * The tuple is always `[op, trueLocale, falseLocale]`, with `null` for a branch
 * the alias cannot take. A plain boolean alias has no false branch:
 * `const se = locale === "se"` is false on *both* da and no, and saying
 * `false = "da"` would let `se ? … : …` be read as Danish-only — the one
 * direction that hides a leak. It is `null`, so the comparison is refused and
 * the string stays a candidate.
 */
function aliasFlags(src, name) {
  // Only a bare identifier can be an alias. Without this, a term that is a
  // chunk of JSX is interpolated into the pattern and the regex is built from
  // file content — which then throws on the first `[` in someone's copy.
  if (!/^[A-Za-z_$][\w$]*$/.test(name)) return null;
  // `(?:\s*:\s*[\w<>\[\]|. ]+)?` is the type annotation. `const dageLocale:
  // DageTilLocale = locale` is the same alias as `const se = locale === "se"`,
  // but the annotation sits between the name and the `=`, so the old pattern
  // matched nothing and every `dageLocale === "da" ? "Dansk" : "Svensk"` arm
  // was reported as a leak. C157 hit the identical blind spot with
  // `const sePages: Record<string, PageData> = {` in the R4 block key.
  const type = "(?:\\s*:\\s*[\\w<>,.\\[\\]| ]+)?";
  const plain = new RegExp(
    `const\\s+${name}${type}\\s*=\\s*locale\\s*(===|!==)\\s*"(da|se|no)"\\s*;`
  ).exec(src);
  if (plain) return [plain[1], plain[2], null];
  const str = new RegExp(
    `const\\s+${name}${type}\\s*=\\s*locale\\s*===?\\s*"(da|se|no)"\\s*\\?\\s*"(da|se|no)"\\s*:\\s*"(da|se|no)"`
  ).exec(src);
  if (str) return ["===", str[2], str[3]];
  // A plain copy: `const dageLocale: DageTilLocale = locale`. The variable
  // *is* the locale, so any comparison against it resolves like the direct
  // form. `isLocaleCopy` marks it as "same as locale" rather than a locale
  // tuple, so the caller rewrites the term instead of guessing a locale name.
  const copy = new RegExp(`const\\s+${name}${type}\\s*=\\s*locale\\s*;`).exec(src);
  if (copy) return { isLocaleCopy: true };
  return null;
}

/**
 * The locale a term is true on, or null. Negations invert.
 *
 * Destructured, never indexed. The tuple is 0-indexed and the first version
 * read `m[1]` as the operator and `m[2]` as the locale, so every alias
 * resolved to `undefined` and `portCondition` returned null for all of them —
 * silently, because "cannot resolve" is exactly what the function returns when
 * the file is not what it expects. `/promille` and `/tidsberegner` were the two
 * pages with an alias, so they were also the only two the rule stayed blind to.
 */
function aliasTrueLocale(tuple) {
  const [op, onTrue] = tuple;
  return op === "!==" ? null : onTrue;
}

/** The locale a term is false on, or null when the alias has only one branch. */
function aliasFalseLocale(tuple) {
  const [op, , onFalse] = tuple;
  return op === "!==" ? tuple[1] : onFalse ?? null;
}

/** Does the flag set let `wanted` through? `!da` opens the branch to se and no. */
function portAllows(flags, wanted) {
  for (const f of flags) {
    if (f === wanted) return true;
    if (f.startsWith("!") && f.slice(1) !== wanted) return true;
  }
  return false;
}

/** `locale === "da" || locale === "se"` for the verdict text. */
function describeFlags(flags) {
  return flags.map((f) => (f.startsWith("!") ? `locale !== "${f.slice(1)}"` : `locale === "${f}"`)).join(" || ");
}

/**
 * The `?` and `:` of the top-level ternary in `src[open..close]`, or null.
 *
 * The `?` is accepted whatever whitespace precedes it — JSX ternaries are
 * formatted across three lines (`{locale === "se"\n  ? "…"\n  : "…"}`) and the
 * first version of this function demanded a value character immediately before
 * the `?`. That matched zero of the 24 ternaries it was written for, and the
 * gate then reported every Danish *else*-arm as a leak. The two guards that
 * remain are the ones that actually exclude a ternary: `?.` is optional
 * chaining, and an *earlier* `?` on the same level has already been taken.
 */
function topLevelTernary(src, open, close) {
  let depth = 0;
  let q = -1;
  let colon = -1;
  for (let i = open + 1; i < close; i++) {
    const c = src[i];
    if (c === "{" || c === "[" || c === "(") depth++;
    else if (c === "}" || c === "]" || c === ")") depth--;
    else if (depth === 0) {
      if (c === "?" && q === -1 && src[i + 1] !== ".") q = i;
      else if (c === ":" && q !== -1 && colon === -1) colon = i;
    }
  }
  return q !== -1 && colon !== -1 ? { q, colon } : null;
}

/**
 * Which locales can see the text at `offset`, resolved through every enclosing
 * `{…}` port. Returns `{ verdict, shape }`; `shape` is the source form that
 * decided it, so a rejected candidate says *which* branch hid it.
 *
 * `PORT_UNKNOWN` is the honest default: an unresolvable port is a candidate to
 * look at, never a silent pass. A gate that guesses "fine" is how C65's scanner
 * stopped being trustworthy.
 */
function portVerdict(src, index) {
  let from = index;
  for (let guard = 0; guard < 60; guard++) {
    // Nearest enclosing `{` that has not been closed yet.
    let depth = 0;
    let open = -1;
    // The window is a "don't walk the whole file" guard, not a correctness
    // limit — and at 12 000 tegn var den for lille. /tidsberegner's danske
    // blok blev 2 000 tegn længere, så porten `{locale === "da" && (` lå
    // *uden for* vinduet fra de to sidste afsnit, og portVerdict svarede
    // "ingen port" på dem. Begge er korrekte danske, og begge blev
    // rapporteret som synlige på beraknare.se. Fejlen peger i den sikre
    // retning (kandidat, ikke DØD), men den gør port-analysen ubrugelig på
    // præcis de filer, der vokser mest — og det er dem, porten er skrevet
    // for. 60 000 dækker hele filen på de længste sider og koster det
    // samme: brydningen er lineær i vinduet, ikke i hele filen.
    const PORT_VINDUE = 60000;
    for (let j = from - 1; j >= 0 && j > from - PORT_VINDUE; j--) {
      const c = src[j];
      if (c === "}") depth++;
      else if (c === "{") {
        if (depth === 0) {
          open = j;
          break;
        }
        depth--;
      }
    }
    if (open === -1) return { verdict: PORT_UNKNOWN, shape: "ingen port" };
    const range = braceRange(src, open);
    if (!range) return { verdict: PORT_UNKNOWN, shape: "ubalanceret blok" };

    // A ternary is resolved *before* the `&&` form, because both open with a
    // locale test and only the ternary's arm says which side of the `:` the
    // string is on. Reading the `&&` form first is what made
    // `{locale === "se" ? "Datum …" : "Datoer …"}` report its *Danish* arm as
    // visible on the Swedish domain: the condition is true for Swedish, and
    // the arm was never consulted. The first version of this rule did exactly
    // that on 14 strings across four pages.
    const t = topLevelTernary(src, open, range[1]);
    if (t && index > t.q) {
      // The head of the expression, up to the `?`. If it terminates on `&&`
      // this is an `&&` block with a stray `?` further down, not a ternary —
      // see `portCondition`'s `consumed`. Reading its arm would invert the
      // verdict, which is how a `da`-only block on `/brok` was reported as
      // visible on the Swedish domain.
      const head = portCondition(src.slice(open + 1, t.q + 1), src);
      if (head && head.terminatedBy === "?") {
        const tFlags = head.flags;
        // The consequent renders when the condition holds; the alternate is
        // every locale the condition excludes, so its flags are the complement.
        const inConsequent = index < t.colon;
        const armFlags = inConsequent
          ? tFlags
          : tFlags.map((f) => (f.startsWith("!") ? f.slice(1) : `!${f}`));
        return {
          verdict: portAllows(armFlags, "se") ? PORT_SE : PORT_DA,
          shape: `${describeFlags(tFlags)} ? ${inConsequent ? "den betingede arm" : "den anden arm"}`,
        };
      }
    }

    const head = portCondition(src.slice(open + 1, from), src);
    if (head) {
      return {
        verdict: portAllows(head.flags, "se") ? PORT_SE : PORT_DA,
        shape: `${describeFlags(head.flags)} …`,
      };
    }
    from = open;
  }
  return { verdict: PORT_UNKNOWN, shape: "for dyb port" };
}

/**
 * P2 — a module-scope table in a page file whose every read sits behind a
 * `da`-port. `/promille` and `/fart` keep their country rows and tempo labels
 * at module scope and render them inside a Danish-only block, so the strings
 * are correctly Danish and correctly invisible on beraknare.se.
 *
 * This is the page-file form of the component rules' affiliate-box reasoning
 * ("the table is only ever passed to something that returns null"), written
 * against `portVerdict` so the two halves cannot drift apart.
 */
function tableReadsAreDanishOnly(src, table) {
  const reads = tableReads(src, table);
  if (reads.length === 0) return false;
  return reads.every((i) => portVerdict(src, i).verdict === PORT_DA);
}
/**
 * Files that are mounted on the Swedish domain by construction, not by an
 * import edge the walker can follow.
 *
 * The walk follows `@/components/*` imports from a page. `page-data.ts` is
 * imported as `@/lib/page-data`, so it never entered the set — and it is the
 * single largest store of translated copy on the site (every `title`,
 * `description`, `metaDescription`, `keywords` and all 9 `faqItems` per page,
 * ~1.200 lines of Swedish in it). R4 has therefore never run on the file that
 * most needs it, which is why two Danish answers survived on beraknare.se's
 * third-largest page.
 *
 * The rule is "mounted on the Swedish domain", and this file is mounted on
 * *every* page including the homepage: `getPageData(slug, locale)` picks
 * `sePages[slug]` on beraknare.se. So it belongs in the set unconditionally,
 * not behind a per-page check.
 */
const ALWAYS_SE_MOUNTED = [join(SRC, "lib", "page-data.ts")];

function seMountedFiles() {
  if (!mountCache) {
    const set = new Set();
    for (const [, page] of graph) {
      if (!page.seMounted) continue;
      for (const c of page.components) set.add(c);
    }
    for (const file of ALWAYS_SE_MOUNTED) {
      if (statSync(file, { throwIfNoEntry: false })) set.add(file);
    }
    // The page files themselves, not just what they mount. A page's own JSX is
    // where the prose lives — every `<h2>`, `<p>` and FAQ answer on 54 pages —
    // and C157 measured 726 Danish strings in them with no way to judge any.
    for (const file of seMountedPageFiles()) set.add(file);
    mountCache = set;
  }
  return mountCache;
}

/**
 * `src/app/**\/page.tsx` for the pages that actually serve a Swedish domain.
 *
 * Three exclusions, each measured rather than assumed:
 *  - `daOnly` pages (from `calculator-list.ts`) do not exist on beraknare.se.
 *    C65's most expensive mistake was judging that from a filename.
 *  - `/blog` and `/kategori` are answered with `not-found` on se and no by
 *    `routing.ts`, read from the source so the list cannot go stale.
 *  - `/embed`, `/api` and the rest are not calculator pages and are not in
 *    `calculator-list.ts` at all, so they never enter the graph.
 */
function seMountedPageFiles() {
  const out = new Set();
  const danishOnly = danishOnlySections();
  for (const [page, info] of graph) {
    if (!info.seMounted) continue;
    if (danishOnly.some((s) => info.href === s || info.href.startsWith(`${s}/`))) continue;
    out.add(page);
  }
  return out;
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
  const sePages = seMountedPageFiles();
  // Page files vs mounted components. A test that asserts a total can be
  // satisfied by the components alone while the pages silently drop out — the
  // same vakuum-grøn failure as C118's union test and C115's rebuilt
  // expectation, so the two are counted separately.
  let candidatesFromPages = 0;

  const all = [];
  for (const file of seFiles) {
    const raw = read(file) || "";
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
    // R4 — Danish copy inside the `se:` block. Verdict is fixed: there is no
    // port, dispatcher or dead table that makes `æ` correct in Swedish text.
    for (const f of seBlockDanishStrings(stripNoise(raw))) {
      if (sePages.has(file)) candidatesFromPages++;
      const reviewed = REVIEWED.find(
        (r) =>
          r.file === rel(file) &&
          r.rule === "R4" &&
          (r.string === undefined || (r.key === f.key && r.string === f.string))
      );
      all.push({
        file: rel(file),
        line: lineOf(raw, f.offset),
        key: f.key,
        table: null,
        string: f.string,
        verdict: "KRÆVER ØJNE",
        reason:
          "dansk streng i se:-blokken — svensk skriver aldrig æ eller ø, så værdien er ikke oversat",
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

  candidatesFromPages = all.filter((f) => sePages.has(join(ROOT, f.file))).length;

  const unreviewed = all.filter((f) => !f.reviewed && f.verdict === "KRÆVER ØJNE");
  const dead = all.filter((f) => f.verdict === "DØD");
  // `dead` og `needsEyes` skal være disjunkte, ellers tælles en fund begge
  // steder, og summeringen `candidates === dead + needsEyes` holder ikke.
  //
  // Fundet 2026-09-29: `page-data.ts`'s REVIEWED-post har kun `key`, ikke
  // `string`, så den matcher *alle* fund i filen — dens begrundelse ("danske
  // strenge i da:-blokken kan ikke vises på beraknare.se") er altså netop
  // dødsværdet. Før C195 stod ingen `DØD`-fund i den fil, så overlap var
  // usynligt; da en ny dansk FAQ-række kom, blev den både "død" og
  // "gennemgået", og 743 kandidater meldte 744 i summen.
  //
  // "Kræver øjne" betyder præcis: et fund der endnu ikke er afgjort. Et fund
  // der allerede er dømt DØD — uanset om en human har begrundet det — kræver
  // ingen øjne mere. Derfor tages døde fund herfra.
  const needsEyes = all.filter(
    (f) => f.verdict !== "DØD" && (f.reviewed || f.verdict === "KRÆVER ØJNE")
  );

  if (JSON_OUT) {
    console.log(
      JSON.stringify(
        {
          seMountedComponents: seFiles.length,
          scannedPages: sePages.size,
          candidatesFromPages,
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
      `Locale-leak: ${seFiles.length} filer monteres på beraknare.se/beregner.no ` +
        `(${sePages.size} kalkulatorsider, resten komponenter)\n` +
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
    // `exitCode`, not `exit(1)`. Writes to a pipe are async in Node, so exiting
    // here drops whatever has not been flushed: with `--gate --json` the JSON is
    // ~285 KB and a consumer reading the pipe got it cut off mid-string at
    // 64 KB — a silent truncation that looks like broken JSON, not a lost
    // verdict. Setting the code and returning lets the process end normally,
    // which flushes stdout first. Same exit status, no truncation.
    process.exitCode = 1;
  }

  return { all, unreviewed, seFiles };
}

function truncate(s) {
  return s.length > 70 ? `${s.slice(0, 67)}…` : s;
}

if (import.meta.url === `file://${process.argv[1]}`) run();
