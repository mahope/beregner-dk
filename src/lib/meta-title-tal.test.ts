import { describe, test, expect } from "vitest";
import { getPageData } from "./page-data";
import { kvadratmeterEksempelLignelse } from "./kvadratmeter-eksempler";
import { alderLevet } from "./alder-levet";
import { dageTilDecember } from "./dage-mellem-datoer";
import { iDagISidensTidszone } from "./lokal-dato";
import { formatNumber } from "./format";
import type { Locale } from "./i18n";

/**
 * Et regnet eksempel i `metaTitle` er det stærkeste enkeltstående CTR-signal på
 * sitet, og det er målt, ikke antaget (GSC 3/10, 28 dage):
 *
 * | side            | visninger | klik | CTR   | pos. | eksempel i titlen |
 * |-----------------|-----------|------|-------|------|------------------|
 * | `/kvadratmeter` |    20.768 |  310 | 1,5 % |  4,9 | ja — 5 x 4 m = 20 m² |
 * | `/promille`     |     6.003 |   97 | 1,6 % |  7,8 | ja — 4 øl på 80 kg = 0,88 ‰ |
 * | `/braendstof`   |    16.518 |  174 | 1,1 % |  5,9 | ja — 500 km benzin koster 450 kr. |
 * | `/renteberegner`|    12.610 |  107 | 0,8 % |  7,4 | nej → rettet 3/10 16:1x |
 * | `/alder`        |    10.029 |   43 | 0,4 % |  7,2 | **nej → rettet 3/10** |
 * | `/tidszone`     |    23.351 |  101 | 0,4 % |  7,6 | **nej → rettet 3/10** |
 *
 * `/arveafgift` og `/renteberegner` blev lagt til 3/10 16:1x. De var de to
 * eneste af GSC-top-15 med en spørgsmålstitel, og på `/renteberegner` stod der
 * desuden en **sprogasymmetri**: `page-data.ts` skrev det samme regnestykke i
 * `se` («100 000 kr i 5 år = 1 887 kr/mån») og `no`, mens `da` skrev
 * «beregn månedsydelse på annuitetslån» — altså den sprogfejl, F0e også
 * fandt på de fire største sider.
 *
 * `/idealvaegt` stod i tabellen 4/10 uden GSC-række: den er en ny URL, så
 * den har 0 visninger, og der er altså ingen CTR at måle endnu. Den er
 * med, fordi porten her også dømmer **formen** på titlen og ikke kun tallene —
 * dobbeltgængen i review-fundet 4/10 04:2x nåede Google, fordi ingen port
 * så den.
 *
 * Mønsteret er et brud på positionen: de to sider med eksempel på pos. 7,6-7,8
 * har 1,1-1,6 % CTR, og de to sider med spørgsmålstitel på pos. 7,2-7,6 har
 * 0,4 %. Så det er ikke placeringen, der afgør om folk klikker.
 *
 * ## Porten dømmer *resultatet*, ikke «der står et tal»
 *
 * Før 3/10 15:5x læste porten `expect(data!.metaTitle).toMatch(/\d/)`, altså
 * ethvert tal. Målt polaritet: `/kvadratmeter`s eksempel
 * «Kvadratmeterberegner: 5 x 4 m = 20 m²» erstattet af
 * «Kvadratmeterberegner 2026 - Beregn areal» gav 16/16 **grønt** — porten så
 * ikke, at regningen var væk. Omvendt gav fjernet årstal i `/rentefradrag» 1 rød.
 * Så porten dømte *året* og ikke eksemplet, og docblockens tabel løj om
 * `/rentefradrag`.
 *
 * Nu står derfor det **forventede resultat** i tabellen, og hver række dømmer
 * med `toContain`. En titel, der mister sin regning, bliver rød med det
 * manglende resultat i testnavnet — ikke fordi der mangler et tal, men fordi
 * det er det *rigtige* tal der mangler. Samme læge som SKATTELOFT-porten,
 * `npiRetning` i `/husleje` og `alder-side-tekst.test.ts`.
 *
 * ## Tre sider står uden for porten, fordi de kun har et årstal
 *
 * `/rentefradrag`, `/boligstoette` og `/dagpenge` skriver «… 2026 - …» og intet
 * regnet. De er **taget ud** af tabellen i stedet for at blive dømt som om de
 * havde et eksempel — porten og tabellen skal sige det samme (punkt 11). De er
 * danske-only sider, så de har hverken `se` eller `no`. De **blev ikke** rettet
 * 3/10 16:1x: `/rentefradrag` (5,8 %) og `/boligstoette` (2,5 %) er de to
 * sider med højest CTR i GSC-uddraget, så deres titel skal måles efter 14 dage
 * — ikke antages at hjælpe. `/dagpenge` har slet ingen GSC-række, så den venter
 * på de to. Opgaven ligger i planens feature-kø; de kommer tilbage i porten,
 * når de har et eksempel.
 */
const KVADRATMETER_EKSEMPEL = kvadratmeterEksempelLignelse("da");

/**
 * Hver række er det resultat, titlen **skal** indeholde — ikke «et tal».
 * Uden `se`/`no` betyder «sproget findes ikke», og `getPageData` returnerer
 * da `undefined`; det dømmer porten med sit eget `toBeDefined`.
 */
const REGNETE_EKSEMPLER: {
  slug: string;
  resulter: { da: string; se?: string; no?: string };
}[] = [
  // Tallene kommer fra `kvadratmeterEksempelLignelse`, samme funktion
  // `page-data.ts` skriver titlen med — ikke en afskrift her.
  { slug: "kvadratmeter", resulter: { da: KVADRATMETER_EKSEMPEL, se: KVADRATMETER_EKSEMPEL, no: KVADRATMETER_EKSEMPEL } },
  { slug: "promille", resulter: { da: "4 øl på 80 kg = 0,88 ‰", se: "4 öl på 80 kg = 0,88 ‰" } },
  { slug: "braendstof", resulter: { da: "500 km benzin koster 450 kr.", se: "500 km bensin kostar 585 kr.", no: "500 km bensin koster 450 kr." } },
  { slug: "procent", resulter: { da: "10 % af 250 = 25 kr.", se: "10 % av 250 kr = 25 kr" } },
  {
    slug: "dato",
    // Titlens dagstal skifter hver dag, så porten regner dem med samme
    // funktion som siden — ellers blev den rød hver 1. december.
    resulter: {
      da: `1. december: ${dageTilDecember("da", new Date()).kort} tilbage`,
      se: `1 december: ${dageTilDecember("se", new Date()).kort} kvar`,
    },
  },
  { slug: "tidsberegner", resulter: { da: "08:30 til 16:45 = 8 t 15 min", se: "08:30 till 16:45 = 8 t 15 min" } },
  { slug: "tidszone", resulter: { da: "12 i Danmark = 06 i New York, USA", se: "12 i Sverige = 06 i New York, USA" } },
  { slug: "moms", resulter: { da: "1.000 kr. ekskl. moms + 25 % = 1.250 kr.", se: "1 000 kr. exkl. moms + 25 % = 1 250 kr." } },
  { slug: "kalorier", resulter: { da: "80 kg, 180 cm, 30 år, moderat = 2.759 kcal", se: "man 80 kg, 180 cm = 2 759 kcal/dag" } },
  // De to sider fra feature-køen, der manglede et regnestykke. Tallene kommer
  // fra de funktioner siden selv regner med — `hovedEksempel()` og
  // `EKSEMPEL_BARN` — så titlen ikke kan love en anden ydelse end beregneren.
  { slug: "renteberegner", resulter: { da: "100.000 kr. i 5 år = 1.887 kr./md.", se: "100 000 kr i 5 år = 1 887 kr/mån", no: "100 000 kr i 5 år = 1 887 kr/md" } },
  { slug: "arveafgift", resulter: { da: "Arveafgift beregner: 1.000.000 kr. arv = 91.155 kr. boafgift" } },
  // `/boernepenge` summed to 1.572 visninger fordelt på fire brandsøgninger
  // («børnepenge 2026» pos. 11, «børnepenge sats 2026» pos. 7, «børnepenge
  // 2026 udbetaling» pos. 10, «børnepenge oktober 2026» pos. 10), og hele
  // blogindlæget lå over beregnersiden. Summen kommer fra `satsForAlder` — samme
  // funktion værktøjet bruger — så titlen ikke kan love en anden sum.
  { slug: "boernepenge", resulter: { da: "2 børn (5 og 9 år) = 7.590 kr./kvartal" } },
  // `/idealvaegt` skrev «… 72 kg ved 175 cm 175 cm» (review-fund 4/10 04:2x):
  // `IDEALVAEGT_EKSEMPEL_175` er selv bygget med højden, og titlen satte så
  // « 175 cm» til igen. Titlen lå i Googles og i fanebladet, så porten dømmer
  // både regnestykket og dobbeltgængen (se bigram-testen nedenfor).
  { slug: "idealvaegt", resulter: { da: "72 kg ved 175 cm", se: "72,0 kg vid 175 cm" } },
];

type SprogOgResultat = { slug: string; locale: Locale; resultat: string };

const MALTE_SIDER: SprogOgResultat[] = REGNETE_EKSEMPLER.flatMap((r) =>
  (Object.entries(r.resulter) as [Locale, string][]).map(([locale, resultat]) => ({
    slug: r.slug,
    locale,
    resultat,
  })),
);

describe("regnet eksempel i metaTitle", () => {
  test.each(MALTE_SIDER.map((r) => [r.slug, r.locale, r.resultat] as const))(
    "/%s (%s) skriver regnestykket «%s» i titlen",
    (slug, locale, resultat) => {
      const data = getPageData(slug, locale);
      expect(data, `getPageData("${slug}", "${locale}") skal finde siden`).toBeDefined();
      expect(data!.metaTitle).toContain(resultat);
    },
  );

  /**
   * `/alder` er den ene side, hvor titlen **regnes hver dag** — `{AAR}` løses af
   * `alderLevet` på den dag siden serveres. Derfor dømmes den mod
   * `alderLevet(iDagISidensTidszone())` og ikke mod et frosset tal: en frossen
   * alder i Googles titellinje bliver rød, men kun på den dag den bliver
   * forkert. Samme forkrift som `alder-side-tekst.test.ts`.
   */
  test.each(["da", "se", "no"] as const)(
    "/alder (%s) skriver dagens alder, ikke en frossen",
    (locale) => {
      const iDag = iDagISidensTidszone(new Date(), locale === "se" ? "se" : "da");
      const aar = formatNumber(alderLevet(iDag).aar, locale);
      const data = getPageData("alder", locale);
      expect(data, `getPageData("alder", "${locale}") skal finde siden`).toBeDefined();
      // En uløst `{AAR}` ville stå som bogstaver i Googles titellinje.
      expect(data!.metaTitle).not.toMatch(/\{[A-Z]+\}/);
      expect(data!.metaTitle).toContain(`= ${aar} år`);
      expect(data!.ogTitle).toBe(data!.metaTitle);
    },
  );

  /**
   * Et regnestykke må ikke gentage sig selv. `/idealvaegt` skrev
   * «Idealvægt beregner: 72 kg ved 175 cm **175 cm**» (review-fund 4/10 04:2x),
   * fordi eksempelstrengen selv ender på «ved 175 cm», og skabelonen satte så
   * højden til igen.
   *
   * `toContain` kan **ikke** se den slags: dobbeltgængen er stadig et substring
   * af den forventede regning, så rækken ovenfor er grøn på den gamle kode —
   * målt 4/10 04:2x. Derfor dømmer porten her på *ordenes bigrammer*: to
   * identiske ordrækker i træk er aldrig mening i en titel, og ingen af de 15
   * øvrige titler i tabellen har en (dømt mod hele listen 4/10).
   */
  test.each(MALTE_SIDER.map((r) => [r.slug, r.locale] as const))(
    "/%s (%s) gentager ikke sit eget regnestykke",
    (slug, locale) => {
      const data = getPageData(slug, locale);
      expect(data, `getPageData("${slug}", "${locale}") skal finde siden`).toBeDefined();
      const ord = data!.metaTitle.split(/\s+/).filter(Boolean);
      const gentaget = ord
        .map((o, i) => ord.slice(i, i + 2).join(" "))
        .filter((bigram, i, alle) => alle.indexOf(bigram) !== i);
      expect(gentaget, `«${data!.metaTitle}» gentager ${gentaget.join("» og «")}`).toEqual([]);
    },
  );

  /**
   * `ogTitle` skal være lig `metaTitle` på de sider, der har et regnet eksempel —
   * ellers skriver Facebook et andet regnestykke end Google, og den af samme
   * grund ikke kan arve portens dømning ovenfra.
   */
  test.each(REGNETE_EKSEMPLER.map((r) => r.slug))(
    "/%s har samme regnestykke i ogTitle",
    (slug) => {
      const data = getPageData(slug, "da");
      expect(data, `getPageData("${slug}", "da") skal finde siden`).toBeDefined();
      expect(data!.ogTitle).toBe(data!.metaTitle);
    },
  );
});