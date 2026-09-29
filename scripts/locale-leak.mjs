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
