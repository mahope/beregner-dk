import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { describe, expect, test } from "vitest";

import { linjeNummer, stripKommentarer } from "@/lib/kommentar-scanner";

/**
 * Påstande i tekst er kode (punkt 11 i kvalitetsreglerne).
 *
 * `/rentefradrag` skrev 1/10 sit «Eksempel» med «50.000 × 33,6 % = 16.800 kr.»
 * håndskrevet, mens hele resten af siden læste `RENTEFRADRAG_2026`. Tallene var
 * lige rigtige — og ville ikke have været det i 2027. Samme fejlklasse findes på
 * 29 blogindlæg og 124 sider, og ingen af dem kan ses af `tsc`, lint eller build,
 * fordi en streng med et tal er gyldig JSX.
 *
 * Denne port måler i stedet for at formode:
 *
 * 1. **Regnestykker.** Hver «A kr × F = C kr», «A kr ÷ F = C kr»,
 *    «P procent af H = R» og «A af B = P» i al brødtekst på sitet regnes igen
 *    med tallene fra sætningen selv. Et forkert regnestykke er en rød port.
 *    Også kæder («40.000 kr/måned × 12 × 1% = 4.800 kr») og kæder uden `kr`
 *    efter første faktor («50.000 × 33,6 % = 16.800 kr.»), som er sitets egen
 *    notationsform.
 * 2. **Hårdkodede beløb i JSX.** Et beløb med tusindtalsseparator må ikke stå som
 *    tekst i `page.tsx` — det skal komme fra et modul gennem `{…}`. Målt 1/10:
 *    0 fund på tværs af alle 124 sider.
 *
 * Begge dele scanner filerne i repoet, ikke et kodestykke, så en ny side er
 * dækket automatisk.
 */

/**
 * Et tal i dansk eller svensk skrivemåde: `1.000`, `1 000`, `1.250,50`, `0,20`.
 *
 * Begge separatorer er nødvendige: `/moms`' danske sider skriver «1.250 kr» og de
 * svenske «1 250 kr», og en port der kun kendte punktum ville have læst et
 * svensk beløb som to tal og derefter dømt sætningen forkert.
 */
const TAL = "\\d{1,3}(?:[. ]\\d{3})+(?:,\\d+)?|\\d+(?:,\\d+)?";

/**
 * `TAL` skal **altid** pakkes i en gruppe, når den indsættes i en større
 * mønsterstreng. Den indeholder selv et `|`, så en blot indsættelse lader
 * alternativet løbe ud af den gruppe, det skulle være lukket i — og mønsteret
 * matcher så tal, der slet ikke har noget med regnestykket at gøre.
 */
const T = `(?:${TAL})`;

/** Gange- og delingstegn, i de skrivemåder JSX og brødtekst bruger. */
const MUL = "(?:&times;|×|x|\\*)";
const DIV = "(?:&divide;|÷)";

/** Ét led i en kæde: tegn, faktor, valgfrit procenttal. */
const LED = `(?:${MUL}|${DIV})\\s*${T}\\s*%?\\s*`;

/**
 * Hvor en regel må begynde at læse.
 *
 * Uden `START` så et regnestykke læses fra en **midterste** faktor: «40.000
 * kr/måned × 12 × 1% = 4.800 kr» blev læst som «12 × 1% = 4.800 kr», fordi
 * `×` ikke var en del af mønsteret. Første faktor springes så over, og porten
 * erklærer en rigtig sætning forkert. De tre betingelser er:
 *
 * - ikke lige efter et gange-/delingstegn (altså ikke midt i en kæde),
 * - ikke lige efter et `x` med luft omkring («max 2.000 kr», ikke «× 2.000»),
 * - ikke midt i et tal, så «40.000» ikke kan læses som «0.000».
 */
const START = "(?<![×*÷&;]\\s*)(?<!\\s[xX]\\s)(?<![.\\d])";

/**
 * Enheden på første faktor. `kr` er **valgfrit**, fordi sitets mest brugte
 * notationsform skriver beløbet uden den — «50.000 × 33,6 % = 16.800 kr.» — og
 * en regel, der kræver `kr` lige efter første faktor, ser **ingen** af dem.
 * Slash-enheder («40.000 kr/måned») er med, fordi de står i rigtige kæder på
 * feriepenge-siden.
 */
const ENHED = "(?:kr\\.?\\s*(?:\\/[a-zA-ZæøåÆØÅäöü]{1,12})?)?";

interface Regel {
  navn: string;
  regex: RegExp;
  /** Er gruppe 2 en kæde af operatorer og faktorer frem for ét tal? */
  kæde?: boolean;
  rigtig: (a: number, f: number, c: number) => boolean;
}

/** Beløb og procenter i brødtekst er hele kroner, så én krones afrunding er nok. */
const afrund = (a: number, b: number) => Math.abs(a - b) <= 1;

/**
 * Ganger en kæde sammen til **én** faktor, så «× 12 × 1%» bliver 0,12 og «÷
 * 1,25» bliver 0,8. Begge regler bruger så samme dom: `a × faktor = c`.
 * `null` betyder at kæden ikke indeholdt noget brugbart.
 */
function foldér(kæde: string): number | null {
  let værdi = 1;
  let led = 0;
  for (const m of kæde.matchAll(/(÷|&divide;|×|&times;|\*|x)\s*(\d[\d.,]*)\s*(%?)/gi)) {
    const n = tal(m[2]) * (m[3] ? 0.01 : 1);
    if (!Number.isFinite(n) || n === 0) return null;
    const tegn = m[1].toLowerCase();
    værdi = tegn === "÷" || tegn === "&divide;" ? værdi / n : værdi * n;
    led++;
  }
  return led > 0 ? værdi : null;
}

const REGLER: Regel[] = [
  {
    navn: "gang",
    regex: new RegExp(
      `${START}(${T})\\s*${ENHED}\\s*(${MUL}\\s*${T}\\s*%?\\s*(?:${LED})*?)\\s*=\\s*(${T})\\s*kr`,
      "gi",
    ),
    kæde: true,
    rigtig: (a, f, c) => f !== 0 && afrund(a * f, c),
  },
  {
    navn: "del",
    regex: new RegExp(
      `${START}(${T})\\s*${ENHED}\\s*(${DIV}\\s*${T}\\s*%?\\s*(?:${LED})*?)\\s*=\\s*(${T})\\s*kr`,
      "gi",
    ),
    kæde: true,
    rigtig: (a, f, c) => f !== 0 && afrund(a * f, c),
  },
  {
    navn: "procentAf",
    regex: new RegExp(`(${T})\\s*(?:procent|%)\\s*af\\s+(${T})(?:\\s*kr\\.?)?\\s*=\\s*(${T})`, "gi"),
    rigtig: (p, hel, c) => afrund((p / 100) * hel, c),
  },
  {
    navn: "stigning",
    regex: new RegExp(`(${T})\\s*(?:procent|%)\\s*(?:stigning|vækst|stiger|økning|ökning|rente)[^=]{0,24}?(${T})\\s*kr\\.?\\s*=\\s*(${T})\\s*kr`, "gi"),
    rigtig: (p, hel, c) => afrund((p / 100) * hel, c),
  },
  {
    navn: "andel",
    regex: new RegExp(`(${T})\\s+af\\s+(${T})\\s*=\\s*(${T})`, "gi"),
    rigtig: (del, hel, p) => hel !== 0 && (afrund((del / hel) * 100, p) || afrund((del / p) * 100, hel)),
  },
];

function tal(streng: string): number {
  return Number(streng.replace(/[. ]/g, "").replace(",", "."));
}

/** Ét fund: fil, linje, regel og hele sætningen. */
interface Fund {
  fil: string;
  linje: number;
  regel: string;
  sætning: string;
}

function findFejl(kode: string, fil: string): Fund[] {
  const rå = stripKommentarer(kode);
  const fund: Fund[] = [];
  for (const regel of REGLER) {
    for (const match of rå.matchAll(regel.regex)) {
      const a = tal(match[1]);
      const f = regel.kæde ? foldér(match[2]) : tal(match[2]);
      const c = tal(match[3]);
      if (f === null || !Number.isFinite(a) || !Number.isFinite(f) || !Number.isFinite(c)) continue;
      if (regel.rigtig(a, f, c)) continue;
      fund.push({
        fil,
        linje: linjeNummer(rå, match.index),
        regel: regel.navn,
        sætning: match[0].replace(/\s+/g, " ").trim(),
      });
    }
  }
  return fund;
}

/**
 * Beløb med tusindtalsseparator i JSX-tekst, målt 1/10 med AST-scanneren
 * ovenfor. Listen tæller forekomster pr. fil, ikke filer, så en ny side med et
 * beløb er rød med det samme: den står ikke i listen.
 *
 * Listen må kun blive kortere. `rentefradrag` stod her med 1 fund —
 * «Fordel 95.000 kr. og 5.000 kr. i stedet for 100.000 kr.» — rettet i samme
 * commit af `ULIJ_HAEJ`/`ULIJ_LAV`. Resten er den kø, porten låser.
 */
const HAARDKODEDE_BELOB: Record<string, number> = {
  "src/app/aktieskat/page.tsx": 5,
  "src/app/alder/page.tsx": 1,

  "src/app/befordringsfradrag/page.tsx": 3,
  "src/app/blog/30-procent-reglen-husleje/page.tsx": 4,
  "src/app/blog/arveafgift-regler-og-satser/page.tsx": 2,
  "src/app/blog/biloekonomi-2026-hvad-koster-det-at-eje-bil/page.tsx": 47,
  "src/app/blog/boernepenge-2026-satser-og-regler/page.tsx": 0,
  "src/app/blog/boliglaan-2026-renter-og-afdrag/page.tsx": 4,
  "src/app/blog/boligsalg-2026-guide-til-omkostninger-og-provenu/page.tsx": 42,
  "src/app/blog/dagpenge-saadan-finder-du-din-sats/page.tsx": 3,
  "src/app/blog/elpriser-2026-beregn-dit-forbrug/page.tsx": 10,
  "src/app/blog/fradrag-2026-komplet-guide/page.tsx": 1,
  "src/app/blog/guide-feriepenge-hvornaar-og-hvor-meget/page.tsx": 9,
  "src/app/blog/guide-til-laan-og-renter/page.tsx": 8,
  "src/app/blog/hvordan-beregner-man-moms/page.tsx": 8,
  "src/app/blog/koeb-af-bolig-2026-omkostninger/page.tsx": 21,
  "src/app/blog/kvadratmeter-saadan-regner-du-ud/page.tsx": 5,
  "src/app/blog/leasing-af-bil-2026-pris-og-guide/page.tsx": 13,
  "src/app/blog/maanedsbudget-2026-komplet-guide/page.tsx": 25,
  "src/app/blog/pension-hvor-meget-skal-du-spare-op/page.tsx": 27,
  "src/app/blog/privatoekonomi-for-unge/page.tsx": 9,
  "src/app/blog/saadan-beregner-du-din-reelle-timeloen/page.tsx": 17,
  "src/app/blog/saadan-finder-du-din-timepris-som-freelancer/page.tsx": 5,
  "src/app/blog/skat-2026-alt-du-skal-vide/page.tsx": 5,
  "src/app/blog/spar-penge-paa-braendstof/page.tsx": 2,
  "src/app/boernepenge/page.tsx": 2,
  "src/app/bolan/page.tsx": 1,
  "src/app/boliglaan/page.tsx": 4,
  "src/app/boligsalg/page.tsx": 9,
  "src/app/brok/page.tsx": 1,
  "src/app/brutto-netto/page.tsx": 4,
  "src/app/bryllup/page.tsx": 4,
  "src/app/budget/page.tsx": 2,
  "src/app/dagpenge/page.tsx": 0,
  "src/app/elberegner/page.tsx": 2,
  "src/app/enheder/page.tsx": 2,
  "src/app/feriepenge/page.tsx": 4,
  "src/app/flyttebudget/page.tsx": 3,
  "src/app/kalorier/page.tsx": 2,
  "src/app/konfirmation/page.tsx": 6,
  "src/app/kvadratmeter/page.tsx": 1,
  "src/app/loen-efter-skat/page.tsx": 1,
  "src/app/loenstigning/page.tsx": 2,
  "src/app/lon-efter-skatt/page.tsx": 5,
  "src/app/moms/page.tsx": 3,
  "src/app/pension/page.tsx": 2,
  "src/app/renteberegner/page.tsx": 6,
  "src/app/rygestop/page.tsx": 2,
  // 8 → 1 den 2/10: de tre skattetrins-grænser, deres bruttotals (697.000 og
  // 845.500 kr.) og deres månedstal læses fra `src/lib/satser-2026.ts` nu, med
  // beregnerens egen betingelse `grænse / (1 - AM-bidrag)`. Det ene fund er
  // «lønforhøjelse på 1.000 kr.», der beholder sit tal, fordi den netop *er*
  // den illustrerede forhøjelse.
  "src/app/topskat/page.tsx": 1,
  "src/app/vaegttab/page.tsx": 2,
};

/**
 * Summen af listen, så de to tal ikke kan glide fra hinanden.
 *
 * 402 → 392 den 2/10 (senere samme dag): `opsparing` stod med 10 fund — de to
 * renters-rente-regnestykker og de tre linjer i «Tid vs. beløb» i hvert sprog.
 * De læses nu fra `src/lib/opsparing.ts`, som danner dem med den samme
 * `simulerOpsparing`, `OpsparingsBeregner` bruger, så brødteksten ikke længere
 * kan have sin egen fortælling. Tusindtalsseparatoren kommer fra sidens egen
 * formatter — «1.532.497 kr.» i dansk og «1 532 497 kr» i svensk — så de to sprog
 * heller ikke kan glide fra hinanden. Samme greb som på `/billaan`.
 * 442 → 418 den 2/10 (senere samme dag): `billaan` stod med 24 fund — hele de to
 * eksempeltabeller, seks rækker × fire beløb. De læses nu fra
 * `src/lib/billaan.ts`, som danner dem med den samme `beregnBillaan` som
 * `BillaanBeregner` bruger, så tabellen ikke kan have sin egen fortælling. To af
 * de tre danske rækker bar «6 %» med den månedlige ydelse for 7 %, og den
 * danske «Samlet omkostning» var ydelserne alene mod den svenskes ydelser plus
 * udbetaling — alle tre fejl dømmes nu af `src/lib/billaan.test.ts`.
 * 448 → 442 den 2/10 (senere samme dag): `ejendomsvaerdiskat` stod med 6 fund —
 * progressionsgrænsen to gange og de tre regnestykker plus indgangssætningen i
 * eksemplet. De læses nu fra `src/lib/ejendomsvaerdiskat.ts`, som også danner
 * eksemplets beløb, så et tal i siden kan ikke længere glide fra satsen. Som
 * erstatning for portens dækning af de tre regnestykker har modulet sin egen
 * test, der holder `EKSEMPEL_TEKST` på de beregnede tal.
 * 418 → 402 den 2/10: `bil` stod med 16 fund — otte redaktionelle estimater i
 * hvert sprog (vægtafgift, service, bremser, tandemrem, dæk og dækkenes
 * holdelighed) uden en kilde. De læses nu fra `src/lib/bil-omkostninger.ts`,
 * som også danner beregnerens eget resultat, så artiklen ikke længere kan
 * sige noget andet end værktøjet: den lovede 2,50-4,50 kr/km, mens
 * `BilBeregner` viste 4,90 kr/km for de samme standardindgange. Samme
 * iteration gav komponenten sine standardindgange pr. sprog fra modulet, så
 * beraknare.se holdt op med at regne benzin til 13,5 kr/liter mens artiklen
 * skrev 18-20 kr/liter.
 * 392 → 385 den 2/10: `topskat` stod med 8 fund, hvor syv var beløbsgrænser
 * der lå i `SATSER_2026` og i beregnerens egen formel. Det sidste fund
 * («af en lønforhøjelse på 1.000 kr.») er bevaret med vilje.
 * 362 → 360 den 2/10: `blog/boernepenge-2026-satser-og-regler` stod med 2 fund —
 * beløbet over aftrapningsgrænsen (138.900 kr.) og de to børn i eksemplet
 * (21.480 kr × 2 = 42.960 kr.). De læses nu fra eksemplets eget
 * `EKSEMPEL_INDKOMST` og fra `BOERNE_SATSER_2026`, så eksemplets tal ikke kan
 * glide fra hverandre. 385 → 370 den 2/10: `moms` stod med 18 fund, hvor 15 var de eksempler
 * brødteksten selv regner — «1.000 kr × 1,25 = 1.250 kr», to gange i hvert
 * sprog plus de fire rækker i Excel-tabellen på beraknare.se. De læses nu fra
 * `beregnMoms`, `momsFaktor` og `momsAndel`, altså samme modul som tabellerne
 * og værktøjet. De tre resterende er lovgrænser (momsregistrering i Danmark
 * og Sverige og toldens værdigrænse) uden kilde i repoet, så de er bevaret med
 * vilje — de må ikke gættes, og de må ikke forsvinde uden erstatning.
 * 453 → 448 den 2/10: fem fund var datoer, ikke beløb («Kilde: borger.dk,
 * verificeret 26/9 2026» blev læst som «9 202»), da scanneren ikke krævede at
* de tre cifre var slut på tallet.
 * 360 → 347 den 2/10: `arveafgift-regler-og-satser` stod med 15 fund i
 * JSX-teksten og 7 i strengliteralerne. De læses nu fra `EKSEMPLER_GUIDE`,
 * `EKSEMPEL_BARN` og `SATSER_2026`, som brødteksten i forvejen havde gjort for
 * satserne. De **to** der er bevaret er gavegrænserne (74.100 kr til børn og
 * børnebørn, 26.600 kr til svigerbørn) — de har ingen kilde i repoet, så de må
 * ikke gættes, og de må ikke forsvinde uden erstatning.
 */
const HAARDKODEDE_BELOB_I_LISTEN = 347;

/**
 * Samme port på de `.tsx`-filer der **ikke** er `page.tsx`: beregnerne i
 * `src/components` og sidens egen ramme (`layout.tsx`, `error.tsx`,
 * `not-found.tsx`, ikonerne). Før 2/10 lå hele mappen uden for porten, og der
 * lå håndskrevne beløb i den: `EfterloensBeregner.tsx` skrev præmieportionen på
 * «15.870 kr.» og «10.580 kr.» to steder, `BolanBeregner.tsx` skrev de svenske
 * satser («100 000 kr») og `LoenBeregner.tsx` skrev «1.000 kr mere i
 * bruttoløn» — selv om modulerne `SKATTEFRI_PRAEMIE_2026`,
 * `SVENSK_BOLAN_2026` og beregningens egen `EKSTRA_BRUTTO` lå i samme kode.
 * Alle fire er nu interpolationer, så listen er **tom**: det første beløb der
 * skrives håndskrevet i en beregner gør porten rød.
 *
 * Kun `.tsx` scannes: TypeScript giver ikke `.ts`-filer lov til JSX, så en
 * `.ts`-fil kan ikke indeholde JSX-tekst, og dens tal er kode — ikke brødtekst.
 */
const HAARDKODEDE_BELOB_I_KOMPONENTER: Record<string, number> = {};

/** Summen af komponentlisten. */
const HAARDKODEDE_BELOB_I_KOMPONENTER_I_LISTEN = 0;

/**
 * Samme port på **strengliteraler** i `.tsx`: den tredje måde et beløb kan nå
 * læseren, og den mest almindelige — tekst står i `page-data.ts`, i en lister
 * af `Record<Locale, …>` inde i komponenten, eller i en prop.
 *
 * Før 2/10 var kun `ts.isJsxText` dækket, så porten var blind for præcis de
 * beløb, der skrives som `{ loen: "Du låner 250.000 kr." }`. Målt 2/10 med
 * scanneren nedenfor over de 190 `.tsx` uden for testene: **111 fund i 38
 * filer** — og det første fund er rettet i samme commit (110):
 * `BoligsalgBeregner.tsx` skrev tinglysningens to faste beløb igen i sin egen
 * disclaimer, mens modulet havde dem liggende i `beregnTinglysning`. Den
 * først og fremmest var det `TimeprisBeregner.tsx` (27 — lønintervallerne
 * for freelancere, håndskrevet tre gange på tre sprog); de ligger nu i
 * `src/lib/timepris-markedspriser.ts`. Fire blogindlæg har 5-9 hver. Ingen af dem lå i JSX-teksten, så den gamle port så dem alle
 * som *0*.
 *
 * Listen er et loftpunktssum: en ny tekst med et håndskrevet beløb gør porten
 * rød, og en rettet tekst sænker den.
 */
const HAARDKODEDE_BELOB_I_STRENGE: Record<string, number> = {
  "src/app/blog/arveafgift-regler-og-satser/page.tsx": 0,
  "src/app/blog/su-2026-satser-og-regler/page.tsx": 0,
  "src/app/blog/biloekonomi-2026-hvad-koster-det-at-eje-bil/page.tsx": 5,
  "src/app/blog/boligsalg-2026-guide-til-omkostninger-og-provenu/page.tsx": 4,
  "src/components/ForbrugslaanBeregner.tsx": 3,
  "src/components/DagpengeBeregner.tsx": 0,
  "src/components/barsel/Opsaetning.tsx": 3,
  "src/components/BillaanBeregner.tsx": 3,
  "src/components/BoligstoetteBeregner.tsx": 3,
  "src/components/BilBeregner.tsx": 3,
  "src/app/blog/dagpenge-saadan-finder-du-din-sats/page.tsx": 3,
  "src/app/blog/leasing-af-bil-2026-pris-og-guide/page.tsx": 3,
  "src/components/GaeldsfriBeregner.tsx": 2,
  "src/components/BraendstofBeregner.tsx": 2,
  "src/components/EnhederBeregner.tsx": 2,
  "src/app/opengraph-image.tsx": 2,
  "src/app/blog/saadan-finder-du-din-timepris-som-freelancer/page.tsx": 1,
  "src/components/BeregnerAssistent.tsx": 1,
  "src/components/HuslejeNettoprisindeks.tsx": 1,
  "src/components/barsel/InfoTip.tsx": 1,
  "src/components/HuslejePrKvm.tsx": 1,
  "src/components/ArveafgiftBeregner.tsx": 1,
  "src/components/AlderSeSvar.tsx": 1,
  "src/components/AktieskatBeregner.tsx": 1,
  "src/app/blog/hvordan-beregner-man-moms/page.tsx": 1,
  "src/app/blog/guide-feriepenge-hvornaar-og-hvor-meget/page.tsx": 1,
  "src/app/blog/privatoekonomi-for-unge/page.tsx": 1,
  "src/app/blog/saadan-beregner-du-din-reelle-timeloen/page.tsx": 1,
  "src/app/blog/boliglaan-2026-renter-og-afdrag/page.tsx": 1,
  "src/app/blog/kvadratmeter-saadan-regner-du-ud/page.tsx": 1,
  "src/app/blog/maanedsbudget-2026-komplet-guide/page.tsx": 1,
  "src/app/blog/spar-penge-paa-braendstof/page.tsx": 1,
  "src/app/blog/koeb-af-bolig-2026-omkostninger/page.tsx": 1,
  "src/app/blog/pension-hvor-meget-skal-du-spare-op/page.tsx": 1,
  "src/app/blog/elpriser-2026-beregn-dit-forbrug/page.tsx": 1,
};

/**
 * 79 → 70 den 2/10: `blog/boernepenge-2026-satser-og-regler` stod med de ni
 * største fund i hele strenglisten — titel og beskrivelse to gange hver (de
 * gentages i `openGraph` og i `BlogArticleSchema`), ungeydelsens sats i to
 * FAQ-svar og de tre børnetilskud i et tredje. De læses nu fra
 * `BOERNE_SATSER_2026`, `aarligBelob` og `barnetilskudSats`.
 *
 * 70 → 64 den 2/10 (senere samme dag): `blog/su-2026-satser-og-regler` stod
 * med de næststørste — samme seks strenge som på børnepengesiden, fordi begge
 * artikler gentager titel og beskrivelse i `generateMetadata`, i `openGraph` og
 * som attributter på `BlogArticleSchema`. De læses nu fra `SU_2026` gennem
 * `titel`, `beskrivelse` og `ogBeskrivelse`, så de ikke kan glide fra sats-
 * tabellen, fra de otte FAQ-svar eller fra brødteksten ved næste satsår.
 *
 * 64 → 57 den 2/10: `blog/arveafgift-regler-og-satser` stod med 7 — titel og
 * beskrivelse hver to gange, `og:description` og det FAQ-spørgsmål, der har «et
 * barn arver 1.000.000 kr» i sig. De læses nu fra `EKSEMPEL_BARN`, så det er det
 * samme eksempel som brødteksten og beregneren regner på. Strenglisten er tom
 * for den fil.
 */
const HAARDKODEDE_BELOB_I_STRENGE_I_LISTEN = 57;

const ROT = join(__dirname, "..", "..");
const tekstfiler = () =>
  execSync("find src/app src/lib -name '*.ts' -o -name '*.tsx'", { encoding: "utf8", cwd: ROT })
    .toString()
    .trim()
    .split("\n")
    .filter((f) => !f.includes(".test."));

const sider = tekstfiler().filter((f) => f.endsWith("page.tsx"));

/** Alle `.tsx` der ikke er `page.tsx` og ikke en test: beregnere og sidens ramme. */
const komponenter = execSync(
  "find src/components src/app -name '*.tsx' ! -name 'page.tsx' ! -name '*.test.tsx'",
  { encoding: "utf8", cwd: ROT }
)
  .toString()
  .trim()
  .split("\n");

const las = (fil: string) => readFileSync(join(ROT, fil), "utf8");

/** Alle `.tsx` uden for testene: beregnere, sidens ramme og alle 124 sider. */
const komponenterAndSider = execSync(
  "find src/components src/app -name '*.tsx' ! -name '*.test.tsx'",
  { encoding: "utf8", cwd: ROT }
)
  .toString()
  .trim()
  .split("\n");


/**
 * JSX-tekst er det, læseren ser som tekst: `ts.isJsxText`. Et beløb dér skal
 * komme fra et modul — ellers er det et tal, der kan glide fra sin egen
 * beregning, når satsen opdateres.
 *
 * Mønstret kræver, at der **ikke** står et ciffer efter de tre (`: (?!\d)`):
 * uden det læser porten en dato som «verificeret 26/9 2026» som beløbet «9 202»
 * og melder en hel beregner ind i listen for en kildeangivelse. Et beløb med
 * decimaler («1.250,50») rammer stadig, fordi der står et komma efter de tre.
 *
 * Første udgave af porten scanner klammebalancer og målte **0 fund på alle 124
 * sider**, hvilket så ud som en ren port. Den var blind: `return ( <main>…)`
 * ligger inde i funktionens klammer, så al JSX-tekst lå på dybde 1 og aldrig
 * blev set. Derfor parseres filen med TypeScript's eget AST i stedet — samme
 * parser som `tsc` bruger i gaten, og den kan ikke blive vild af en klamme.
 *
 * `ScriptKind` læses **af filendelsen**. Før 2/10 stod `TSX` hardkodet, så navnet
 * var ikke rigtigt for en `.ts`-fil, og testen «samme kilde set som TS (ikke
 * TSX) skal give samme svar» bestod kun fordi `<p>` var strippet i inputtet.
 */
function jsxBelob(kilde: string, navn: string): string[] {
  const kind = navn.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const fil = ts.createSourceFile(navn, kilde, ts.ScriptTarget.Latest, true, kind);
  const fund: string[] = [];
  const gaa = (node: ts.Node) => {
    if (ts.isJsxText(node) && /\d{1,3}[. ]\d{3}(?!\d)/.test(node.text)) {
      fund.push(`${navn}: ${node.text.replace(/\s+/g, " ").trim().slice(0, 90)}`);
    }
    ts.forEachChild(node, gaa);
  };
  gaa(fil);
  return fund;
}

/**
 * Et beløb i en streng er lige så hårdkodet som et i JSX-tekst: `ts.isJsxText`
 * rammer kun det, der står mellem to tags, så alt tekst der ligger i en
 * lister af `Record<Locale, …>` (sidens `page-data.ts`, en komponents
 * `tekster`-objekt) eller i en prop lå uden for porten.
 *
 * Template literals uden substitution (`\`` uden `${}`) er samme slags tekst og
 * er derfor også dækket; en template med `${}` indeholder kode, ikke tekst, så
 * den springes over — dens tal skal komme fra en beregning alligevel.
 *
 * Samme mønster som `jsxBelob` — tre cifre med separator og intet ciffer
 * bagefter — så en dato som «26/9 2026» ikke læses som «9 202».
 */
function strengBelob(kilde: string, navn: string): string[] {
  const kind = navn.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const fil = ts.createSourceFile(navn, kilde, ts.ScriptTarget.Latest, true, kind);
  const fund: string[] = [];
  const gaa = (node: ts.Node) => {
    if (
      (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
      /\d{1,3}[. ]\d{3}(?!\d)/.test(node.text)
    ) {
      fund.push(`${navn}: ${node.text.replace(/\s+/g, " ").trim().slice(0, 90)}`);
    }
    ts.forEachChild(node, gaa);
  };
  gaa(fil);
  return fund;
}

/**
 * Hver regels **egen** sætning: én rigtig, der skal være grøn, og én der kun
 * er forskel fra den rigtige ved at resultatet er sat til et forkert tal, som
 * skal være rød — og rød **af den regel**, der er sat på prøven.
 *
 * Før 2/10 var der ingen sådanne sætninger pr. regel, kun ét samlet tal for
 * alle fem. Derfor kunne `gang` miste dækningen i sitets egen notationsform
 * uden at nogen test blev rød: porten var grøn på sider, hvor alle
 * regnestykker var forkerte, fordi den slet ikke så dem.
 *
 * Målt 2/10 med de gamle mønstre: porten så **3 af de 9** forkerte sætninger.
 * De tre den så ikke, var netop dem uden `kr` efter første faktor — to rene
 * («50.000 × 33,6 % = 19.800 kr.») og én i kædeform («40.000 kr/måned × 12 ×
 * 1% = 9.600 kr»).
 */
const KANONISKE: [regel: string, rigtig: string, forkert: string][] = [
  ["gang", "50.000 × 33,6 % = 16.800 kr.", "50.000 × 33,6 % = 19.800 kr."],
  ["gang", "30.000 × 25,6 % = 7.680 kr.", "30.000 × 25,6 % = 10.680 kr."],
  ["gang", "1.000 kr &times; 1,25 = 1.250 kr", "1.000 kr &times; 1,25 = 1.500 kr"],
  ["gang", "40.000 kr/måned × 12 × 1% = 4.800 kr", "40.000 kr/måned × 12 × 1% = 9.600 kr"],
  ["del", "1.000 kr ÷ 1,25 = 800 kr", "1.000 kr ÷ 1,25 = 1.200 kr"],
  ["del", "1 250 kr &divide; 1,25 = 1 000 kr", "1 250 kr &divide; 1,25 = 800 kr"],
  ["procentAf", "10 procent af 10.000 = 1.000", "10 procent af 10.000 = 500"],
  ["stigning", "3 % stigning på 30.000 kr = 900 kr", "3 % stigning på 30.000 kr = 1.200 kr"],
  ["andel", "2.500 af 10.000 = 25", "2.500 af 10.000 = 30"],
];

/**
 * Hvad hver regel ser i korpus, målt 2/10 med mønsterne ovenfor over `src/app`
 * og `src/lib`. Før 2/10 var der ét samlet tal (`antal >= 25`) for alle fem, så
 * en regel der døde gav ingen rød port — `stigning` og `andel` så **0** fund
 * hver, og ingen opdagede det. Nu er der ét tal pr. regel.
 *
 * De to nul-tal er ærlige: sitet skriver ingen sætninger i «P % stigning på H
 * kr = R»- og «A af B = P»-form (kun `procent.ts`'s docblock gør det, og
 * kommentarer strippes). De to regler er derfor dækket af `KANONISKE` ovenfor,
 * så de ikke kan forblive døde i det stille — og de får deres første rigtige
 * sætning den dag siden skriver en.
 *
 * Tællerne er loftpunkter, ikke målsætninger: de må gerne stige. Sænkes de,
 * skal det være en synlig linje i diffen.
 */
const FORVENTEDE_FUND: Record<string, number> = {
  // 2/10: `gang` og `del` tabte fire fund hver, fordi `/moms`' brødtekst nu
  // læser «1.000 kr. × 1,25 = 1.250 kr.» fra `beregnMoms` frem for at skrive
  // det. Sætningen er derfor *rigtig ved konstruktion* i stedet for dømt af
  // porten — de ni `KANONISKE` sætninger ovenfor holder reglerne dømmende.
  // Samme grund tabte `gang` sit ottende fund 2/10 senere på dagen:
  // børnepenge-indlæggets «21.480 kr × 2 = 42.960 kr» ligger nu i to
  // interpolationer omkring portens mønster, så den regel ikke kan læse den
  // længere. Summen gik 27 → 26.
  gang: 7,
  del: 6,
  procentAf: 13,
  stigning: 0,
  andel: 0,
};

describe("regnestykker i brødteksten", () => {
  test("porten genkender rigtige og forkerte sætninger i begge skrivemåder", () => {
    // Mutation: porten skal være rød på netop de forkerte sætninger.
    expect(findFejl("<li>1.000 kr &times; 1,25 = 1.500 kr inkl. moms</li>", "t")).toHaveLength(1);
    expect(findFejl("<li>10 procent af 10.000 = 500</li>", "t")).toHaveLength(1);
    expect(findFejl("<li>1.250 kr &times; 0,20 = 250 kr i moms</li>", "t")).toHaveLength(0);
    expect(findFejl("<li>1 250 kr &divide; 1,25 = 1 000 kr</li>", "t")).toHaveLength(0);
    expect(findFejl("<li>10 procent af 10.000 = 1.000</li>", "t")).toHaveLength(0);
    expect(findFejl("<li>2.500 af 10.000 = 25</li>", "t")).toHaveLength(0);
  });

  test("hver regel dømmer sin egen notationsform, også uden kr efter første faktor", () => {
    for (const [regel, rigtig, forkert] of KANONISKE) {
      // Mutation: en regel, der ikke kan se sin egen skrivemåde, ville give 0
      // fund på den forkerte sætning — og porten ville være grøn på fejl.
      const fund = findFejl(`<li>${forkert}</li>`, "t");
      expect(fund, `regel ${regel} så ikke «${forkert}»`).toHaveLength(1);
      expect(fund[0].regel, `forkert sætning blev dømt af den forkerte regel`).toBe(regel);
      expect(findFejl(`<li>${rigtig}</li>`, "t"), `regel ${regel} erklærede «${rigtig}» forkert`).toEqual([]);
    }
  });

  test("hver regel har målt dækning, så ingen kan dø i det stille", () => {
    // Uden dette ville «alle regnestykker er rigtige» være grøn, fordi porten
    // intet genkender.
    const målt: Record<string, number> = {};
    for (const fil of tekstfiler()) {
      const kode = stripKommentarer(las(fil));
      for (const regel of REGLER) {
        målt[regel.navn] = (målt[regel.navn] ?? 0) + [...kode.matchAll(regel.regex)].length;
      }
    }
    for (const [navn, forventet] of Object.entries(FORVENTEDE_FUND)) {
      expect(målt[navn], `dækningen for regel ${navn} har ændret sig`).toBe(forventet);
    }
    // Før 2/10 var summen 26: `stigning` og `andel` så 0 fund hver, og `gang`
    // så kun de sætninger, der skrev `kr` efter første faktor. Den steg til 33,
    // og 2/10 faldt den til 27 igen, da `/moms`' seks eksempelregnestykker blev
    // læst fra modulet i stedet for at være håndskrevet, og til 26 da
    // børnepenge-indlæggets «21.480 kr × 2 = 42.960 kr» blev interpolationer.
    expect(Object.values(målt).reduce((a, b) => a + b, 0)).toBe(26);
  });

  test("alle regnestykker på sitet er regnet rigtigt", () => {
    const forkerte = tekstfiler().flatMap((fil) =>
      findFejl(las(fil), fil).map((f) => `${f.fil}:${f.linje} [${f.regel}] ${f.sætning}`),
    );
    expect(forkerte).toEqual([]);
  });
});

describe("beløb i JSX-tekst på siderne", () => {
  test("AST-scanneren ser ren JSX-tekst og springer interpolationer over", () => {
    // Mutation: hvis scanneren så hele filen, ville den finde beløbet i koden
    // under; hvis den så slet intet, ville den finde heller ikke den rene tekst.
    const kilde =
      "export const A = <p>Vi regner med 12.500 kr</p>;\nexport const B = <p>Vi regner med {talt} kr</p>;\n";
    expect(jsxBelob(kilde, "ren.tsx")).toHaveLength(1);
    expect(jsxBelob(kilde, "ren.tsx")[0]).toContain("12.500");
    // Samme kilde set som TS (ikke TSX) skal give samme svar — ellers ville porten
    // være afhængig af filendelsen. Før 2/10 holdt `ScriptKind.TSX` fast, så det
    // var kun `<p>`'s stripning der gjorde den grøn; med endelsen læst af navnet
    // er det en `.ts`-fil, der parseres som TS, og derfor intet JSX-tekst.
    expect(jsxBelob(kilde.replace(/<\/?p>/g, ""), "ren.ts")).toEqual([]);
    // …mens endelsen stadig styrer: samme kode med endelsen bevaret set som `.ts`
    // giver ingen JSX-tekst, fordi TS-parseren læser `<p>` som typeAssertion.
    expect(jsxBelob(kilde, "ren.ts")).toEqual([]);
    // En dato er ikke et beløb: «26/9 2026» må ikke læses som «9 202».
    expect(jsxBelob("<p>Kilde: borger.dk, verificeret 26/9 2026.</p>", "dato.tsx")).toEqual([]);
    expect(jsxBelob("<p>Portionen er 15.870 kr.</p>", "krone.tsx")).toHaveLength(1);
  });

  test("ingen side har flere hårdkodede beløb end listen siger", () => {
    // Målt 1/10 med AST-scanneren på tværs af alle 123 `page.tsx`.
    const fund = sider.flatMap((fil) => jsxBelob(las(fil), fil));
    const prFil = new Map<string, number>();
    for (const f of fund) {
      const fil = f.slice(0, f.indexOf(": "));
      prFil.set(fil, (prFil.get(fil) ?? 0) + 1);
    }

    // En side, der ikke står i listen, har et beløb porten aldrig har set.
    const ukendte = [...prFil.keys()].filter((fil) => !(fil in HAARDKODEDE_BELOB));
    expect(ukendte).toEqual([]);

    // Mutation: læg ét beløb mere ind i en sides tekst, porten skal blive rød.
    const overskredet = Object.entries(HAARDKODEDE_BELOB)
      .filter(([fil, antal]) => (prFil.get(fil) ?? 0) > antal)
      .map(([fil, antal]) => `${fil}: ${(prFil.get(fil) ?? 0)} > ${antal}`);
    expect(overskredet).toEqual([]);

    // At rette en side er altid tilladt — listen er en loftpunktssum, ikke en
    // målsætning — så her tælles det samlede antal mod summen af listen.
    expect(fund.length).toBeLessThanOrEqual(HAARDKODEDE_BELOB_I_LISTEN);
    // 2/10: 385 → 370, da `/moms'` 15 eksempelbeløb læses fra modulet. De 370
    // fund er de samme filers øvrige beløb, så tallet siger hvor meget af
    // korpuset porten endnu dømmer — det må ikke stige i det stille.
    expect(HAARDKODEDE_BELOB_I_LISTEN).toBe(347);
  });
});

describe("beløb i JSX-tekst i beregnerne", () => {
  test("ingen beregner har flere hårdkodede beløb end listen siger", () => {
    // Målt 2/10 med AST-scanneren på tværs af de 152 `.tsx` uden for
    // `page.tsx`: **4 fund i 3 filer** (Efterloens 2, Bolan 1, Loen 1), alle
    // fire rettet i samme commit — så her er fundtallet **0**. Før rettelsen var
    // det 0 *filer*, så hele `src/components` lå uden for porten.
    const fund = komponenter.flatMap((fil) => jsxBelob(las(fil), fil));
    const prFil = new Map<string, number>();
    for (const f of fund) {
      const fil = f.slice(0, f.indexOf(": "));
      prFil.set(fil, (prFil.get(fil) ?? 0) + 1);
    }

    // En beregner, der ikke står i listen, har et beløb porten aldrig har set.
    const ukendte = [...prFil.keys()].filter(
      (fil) => !(fil in HAARDKODEDE_BELOB_I_KOMPONENTER)
    );
    expect(ukendte).toEqual([]);

    // Mutation: skriv et beløb ind i en beregners tekst, porten skal blive rød.
    const overskredet = Object.entries(HAARDKODEDE_BELOB_I_KOMPONENTER)
      .filter(([fil, antal]) => (prFil.get(fil) ?? 0) > antal)
      .map(([fil, antal]) => `${fil}: ${(prFil.get(fil) ?? 0)} > ${antal}`);
    expect(overskredet).toEqual([]);

    expect(fund.length).toBeLessThanOrEqual(HAARDKODEDE_BELOB_I_KOMPONENTER_I_LISTEN);
    expect(HAARDKODEDE_BELOB_I_KOMPONENTER_I_LISTEN).toBe(0);
  });

  test("porten scanner hele mappen, ikke en håndplukket liste", () => {
    // Mutation: hvis `komponenter` var en tom liste, ville de to tests ovenfor
    // være grønne uden at se noget — præcis den blindhed første udgave af porten
    // havde, da den målte 0 fund på alle 124 sider.
    expect(komponenter.length).toBeGreaterThan(100);
    expect(komponenter).toContain("src/components/EfterloensBeregner.tsx");
    expect(komponenter.some((f) => f.endsWith(".test.tsx"))).toBe(false);
    expect(komponenter.some((f) => f.endsWith("page.tsx"))).toBe(false);
  });
});

describe("beløb i strengliteraler", () => {
  test("scanneren ser tekststrenge og springer kode over", () => {
    // Mutation: uden `isStringLiteral`-grenen så scanneren ingen af strengene,
    // så hele fundlisten ville være tom og porten grøn på en mængde beløb den
    // ikke kan se. Med grenen er den rød på prøven herunder.
    const kilde = [
      'const da = { loen: "Du låner 250.000 kr." };',
      'const se = `Du lånar 250 000 kr.`;',
      "const beregnet = `Du låner ${format(belob)} kr.`;",
      'const klasse = "grid grid-cols-3";',
      'const kildekode = "26/9 2026";',
    ].join("\n");
    const fund = strengBelob(kilde, "strenge.tsx");
    expect(fund).toHaveLength(2);
    expect(fund[0]).toContain("250.000");
    expect(fund[1]).toContain("250 000");
    // En template med ${} er kode: dens tal skal komme fra beregningen, så
    // porten skal ikke tælle den.
    expect(fund.some((f) => f.includes("${"))).toBe(false);
    // En dato er ikke et beløb, og en CSS-klasse har ingen tal i sig.
    expect(strengBelob('const d = "Kilde: borger.dk, verificeret 26/9 2026.";', "d.tsx")).toEqual([]);
    // …mens «15.870 kr.» i en streng er et.
    expect(strengBelob('const p = "Portionen er 15.870 kr.";', "p.tsx")).toHaveLength(1);
  });

  test("ingen fil har flere hårdkodede beløb i strenge end listen siger", () => {
    // Målt 2/10 med `strengBelob` over de 190 `.tsx` uden for testene: **111
    // fund i 38 filer**, hvoraf det første er rettet i samme commit — nu 110.
    // Før denne måling så porten dem alle som 0, fordi de lå i strenge og ikke
    // i JSX-tekst.
    const fund = komponenterAndSider.flatMap((fil) => strengBelob(las(fil), fil));
    const prFil = new Map<string, number>();
    for (const f of fund) {
      const fil = f.slice(0, f.indexOf(": "));
      prFil.set(fil, (prFil.get(fil) ?? 0) + 1);
    }

    // En fil, der ikke står i listen, har et beløb porten aldrig har set.
    const ukendte = [...prFil.keys()].filter((fil) => !(fil in HAARDKODEDE_BELOB_I_STRENGE));
    expect(ukendte).toEqual([]);

    // Mutation: sæt ét beløb mere ind i en streng, porten skal blive rød.
    const overskredet = Object.entries(HAARDKODEDE_BELOB_I_STRENGE)
      .filter(([fil, antal]) => (prFil.get(fil) ?? 0) > antal)
      .map(([fil, antal]) => `${fil}: ${(prFil.get(fil) ?? 0)} > ${antal}`);
    expect(overskredet).toEqual([]);

    expect(fund.length).toBeLessThanOrEqual(HAARDKODEDE_BELOB_I_STRENGE_I_LISTEN);
    expect(HAARDKODEDE_BELOB_I_STRENGE_I_LISTEN).toBe(57);
  });

  test("listen er målt på hele mappen, ikke på en håndplukket fil", () => {
    // Mutation: en liste bygget af to filer ville være grøn ovenfor, hvis resten
    // af mappen holdt op at findes — så listen skal dække begge sider og
    // beregnere, og den skal have flere filer end de to største.
    expect(komponenterAndSider.length).toBeGreaterThan(150);
    expect(HAARDKODEDE_BELOB_I_STRENGE).not.toHaveProperty("src/components/TimeprisBeregner.tsx");
    expect(HAARDKODEDE_BELOB_I_STRENGE).toHaveProperty(
      "src/app/blog/su-2026-satser-og-regler/page.tsx"
    );
    expect(Object.keys(HAARDKODEDE_BELOB_I_STRENGE).length).toBeGreaterThan(20);
  });
});
