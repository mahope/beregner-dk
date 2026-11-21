#!/usr/bin/env node
/**
 * Unavngivet-knapgruppe scanner.
 *
 * Counts the accessibility class C72 ran into and that
 * `scripts/label-a11y-scan.mjs` **cannot** see: two or more buttons acting as
 * one control — a period, a unit, a yes/no, a state — inside an element that
 * names them nothing. A screen reader then walks the group and finds two
 * nameless buttons in a row, exactly as it found `/brutto-netto`s
 * "Pr. måned"/"Pr. år" (C72), som hverken havde `<label>`, gruppe eller
 * `aria-label`. `label-a11y-scan.mjs` tæller kun `<label>`-elementer, så
 * den slags er usynlig for den: måleren ser kun det den er skrevet til at se.
 *
 * En måling af en accessibility-klasse skal selv have en test, ellers låser
 * den bare den næste agent fast i samme hul (label-klassen blev målet forkert
 * tre gange i seks kørsler, se `src/lib/label-scan-gate.test.ts`). Derfor er
 * hver regel navngivet, og `src/lib/group-scan-gate.test.ts` planter ét
 * fejlsende tilfælde pr. regel. En regel uden test er en note.
 *
 * Usage:
 *   node scripts/knapgruppe-scan.mjs           # per-group table + totals
 *   node scripts/knapgruppe-scan.mjs --json    # machine-readable
 *   node scripts/knapgruppe-scan.mjs --root d  # scan another tree (fixtures)
 *   node scripts/knapgruppe-scan.mjs --alle    # also list named groups
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const JSON_OUT = process.argv.includes("--json");
const SHOW_ALL = process.argv.includes("--alle");

const rootArg = process.argv.indexOf("--root");
const SCAN_ROOT = rootArg === -1 ? join(ROOT, "src") : resolve(ROOT, process.argv[rootArg + 1]);

/** Roller der gør en beholder til en gruppe. */
const GRUPPEROLLER = [
  "group",
  "radiogroup",
  "tablist",
  "listbox",
  "menu",
  "menubar",
  "toolbar",
  "tree",
];

/**
 * R1 — læs **åbningstaggens** attributter ved at gå fra `<navn` til det første
 * `>` der ikke står i et `{…}`-udtryk, aldrig med `<navn\b([^>]*)>`. Et `>`
 * inde i et udtryk (`onClick={() => setX(1)}`) afkorter en karakterklasse,
 * så attributterne bagved læses aldrig, og en navngivet gruppe meldes
 * uavngivet. Samme fejl som C64 gjorde på `<label\b([^>]*)>`.
 */
function åbneTags(kilde) {
  const ud = [];
  const re = /<([A-Za-z][A-Za-z0-9._-]*)\b/g;
  for (const m of kilde.matchAll(re)) {
    let i = m.index + m[0].length;
    let dybde = 0;
    for (; i < kilde.length; i++) {
      const c = kilde[i];
      if (c === "{") dybde++;
      else if (c === "}") dybde--;
      else if (c === ">" && dybde === 0) break;
    }
    if (i >= kilde.length) break;
    const attributter = kilde.slice(m.index + m[0].length, kilde[i - 1] === "/" ? i - 1 : i);
    ud.push({
      start: m.index,
      navn: m[1],
      attributter,
      selv: kilde[i - 1] === "/",
      slut: i + 1,
    });
  }
  return ud;
}

/**
 * R2 — læs én attributværdi i hånden, uanset om den er pakket i `"x"`, `'x'`,
 * `` `x` ``, `{…}` eller står bar. Ikke hygge: `\{([^}]*)\}` rammer altid den
 * `}` der lukker `${…}`, ikke den der lukker hele udtrykket, så
 * `id={\`gruppe-${i + 1}\`}` læses som `` `gruppe-${i + 1 `` og matcher
 * aldrig sit `aria-labelledby`. Det var målefejlen bag C64's falske
 * "ubundet" på knapgrupperne.
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
 * R3 — normalisér `${…}` væk før sammenligning af et `id` med et
 * `aria-labelledby`. JSX bygger begge sider som template-literals, så en
 * ordentlig sammenligning rammer aldrig, og hver gruppe med et genereret
 * id meldes uavngivet.
 */
function normalisér(tekst) {
  return tekst.replace(/\$\{[^}]*\}/g, "#").replace(/\s+/g, " ").trim();
}
const attribut = (attributter, navn) => {
  const rå = attributVærdi(attributter, navn);
  return rå !== null && rå.trim() !== "" ? normalisér(rå) : null;
};

function erGruppeRolle(attributter) {
  const rolle = attribut(attributter, "role");
  return rolle !== null && GRUPPEROLLER.includes(rolle);
}

function erKnap(attributter) {
  return attribut(attributter, "type") === "radio";
}

function scanFil(fill) {
  const kilde = readFileSync(fill, "utf8");
  const linje = (af) => kilde.slice(0, af).split("\n").length;

  const åbne = åbneTags(kilde);
  const laesteId = new Set();
  for (const m of kilde.matchAll(/\baria-labelledby\s*=/g)) {
    const rå = attributVærdi(kilde.slice(m.index), "aria-labelledby");
    if (rå === null) continue;
    // Normalisér FØR split: `${i + 1}` indeholder selv et mellemrum, så en rå
    // `split(/\s+/)` skærer gruppe-etiketten i to og matcher aldrig igen.
    for (const del of normalisér(rå).split(/\s+/)) laesteId.add(del);
  }

  // Én forfra-gennem-kørsel med en stak. En "find slutPosition pr. element"
  // ville kræve en dybdetælling, og netop dybdevarianter af den er den fejl,
  // der lå i C64 — så hullet findes her, mens konteksten er på stakken.
  const hændelser = [];
  for (const tag of åbne) {
    hændelser.push({ åben: true, ...tag });
    if (tag.selv) continue;
    const luk = new RegExp(`</${tag.navn}\\s*>`, "g");
    luk.lastIndex = tag.slut;
    const m = luk.exec(kilde);
    if (m) hændelser.push({ åben: false, navn: tag.navn, start: m.index });
  }
  hændelser.sort((a, b) => a.start - b.start);

  const stak = [];
  const kandidater = [];
  const nærmesteBeholder = () => {
    for (let i = stak.length - 1; i >= 0; i--) if (stak[i].beholder) return stak[i];
    return null;
  };

  for (const h of hændelser) {
    if (h.åben) {
      if (h.navn === "button" || (h.navn === "input" && erKnap(h.attributter))) {
        const beholder = nærmesteBeholder();
        if (beholder) beholder.knapper += 1;
        // Selvlukkende knapper må **ikke** lægges på stakken: de har ingen
        // `</…>`, så de ville blive liggende og skubbe den næste `pop` ud af
        // form, og `</div>` ville poppe den *første* knap i stedet for
        // beholderen. Dobbelt-tællingens fejl så jeg ved at lede efter.
        if (h.selv) continue;
        stak.push({ ...h, knapper: 0, navngivet: true, gruppe: false, beholder: false });
        continue;
      }
      if (h.selv) continue;
      stak.push({
        ...h,
        knapper: 0,
        navngivet: erNavngivet(h.attributter, laesteId),
        gruppe: erGruppeRolle(h.attributter),
        beholder: true,
        kandidat: false,
      });
      continue;
    }
    const ramme = stak.pop();
    if (!ramme || !ramme.beholder || ramme.knapper < 2) continue;
    // R4 — kandidat markerer **alle** lag, meldingen tager kun de yderste.
    ramme.kandidat = true;
    const dækket =
      ramme.navngivet ||
      stak.some((f) => f.navngivet || f.gruppe || f.kandidat);
    if (dækket) continue;
    kandidater.push({
      linje: linje(ramme.start),
      navn: ramme.navn,
      rolle: attribut(ramme.attributter, "role"),
      knapper: ramme.knapper,
      navngivet: false,
    });
  }

  if (SHOW_ALL) {
    for (const ramme of alleBeholdere(kilde, åbne, laesteId)) kandidater.push(ramme);
  }
  return kandidater;
}

function erNavngivet(attributter, laesteId) {
  if (attribut(attributter, "aria-label") !== null) return true;
  if (attribut(attributter, "aria-labelledby") !== null) return true;
  const egenId = attribut(attributter, "id");
  return egenId !== null && laesteId.has(egenId);
}

/** Kun til `--alle`: de grupper, der *er* navngivet, så listen kan læses. */
function alleBeholdere(kilde, åbne, laesteId) {
  return åbne
    .filter((t) => !t.selv && erGruppeRolle(t.attributter) && erNavngivet(t.attributter, laesteId))
    .map((t) => ({
      linje: kilde.slice(0, t.start).split("\n").length,
      navn: t.navn,
      rolle: attribut(t.attributter, "role"),
      knapper: 0,
      navngivet: true,
    }));
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

const uavngivne = rapporter.flatMap((r) => r.fund.filter((f) => !f.navngivet));

if (JSON_OUT) {
  const prFil = {};
  for (const r of rapporter) {
    const n = r.fund.filter((f) => !f.navngivet).length;
    if (n > 0) prFil[r.fil] = n;
  }
  console.log(
    JSON.stringify(
      {
        filer: Object.keys(prFil).length,
        uavngivne: uavngivne.length,
        prFil: Object.fromEntries(Object.entries(prFil).sort((a, b) => b[1] - a[1])),
        fund: rapporter.flatMap((r) => r.fund.map((f) => ({ fil: r.fil, ...f }))),
      },
      null,
      2,
    ),
  );
} else {
  for (const r of rapporter) {
    console.log(`\n${r.fil}  (${r.fund.filter((f) => !f.navngivet).length})`);
    for (const f of r.fund) {
      console.log(
        `  ${String(f.linje).padStart(5)}  ${f.rolle ? `${f.navn} role="${f.rolle}"` : `${f.navn} (ingen gruppe-role)`} — ${f.knapper} knapper, ${f.navngivet ? "navngivet" : "UAVNGIVET"}`,
      );
    }
  }
  const filerMed = rapporter.filter((r) => r.fund.some((f) => !f.navngivet)).length;
  console.log(`\n${filerMed} filer — ${uavngivne.length} uavngivne knapgrupper`);
}

// En måling, ikke en merge-gate: påstanden om repoets egen kode ligger i
// `src/lib/group-scan-gate.test.ts`, så en plantet fixture kan scannes her.
process.exit(0);
