import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { formatNumber } from "@/lib/format";
import { TEMPO_EKSEMPLER, beregnTempo, formatSekunder } from "@/lib/tidsberegner";
import {
  TIDS_EKSEEMPLER,
  TIDS_EKSEMPEL_DAG,
  TIDS_EKSEMPEL_MIDNAT,
  TIDS_EKSEMPEL_PAUSE,
  excelDifferens,
  formatTidsvar,
  totalMinutter,
  MINUTTER_TILL_TIMMAR,
} from "@/lib/tids-eksempler";
import {
  DAGE_I_SKUDAAR,
  TIMER_I_SKUDAAR,
  TIMER_PERIODER,
  timerIPeriode,
} from "@/lib/timer-periode";
import {
  TIDS_SUMMER,
  summerTidsrum,
  EXCEL_SUM_FORMEL,
  EXCEL_SUM_MED_PAUSE,
} from "@/lib/tids-summer";
import { PLUS_TID_EKSEMPLER, plusTid } from "@/lib/plus-tid";
import TidsberegnerPage from "./page";

vi.mock("@/components/TidsBeregner", () => ({
  default: () => <div>Tidsværktøj</div>,
}));
vi.mock("@/components/PlusTidBeregner", () => ({
  default: () => <div>Plus-tidsværktøj</div>,
}));
vi.mock("@/components/MinutterTilTimerBeregner", () => ({
  default: () => <div>Minutter-til-timer-værktøj</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

describe("tidsberegner page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Hvor lang tid er der mellem to klokkeslæt?",
      answer: "Beregn hvor lang tid der går mellem to klokkeslæt – i timer, minutter og decimaltimer. Træk en pause fra.",
      schema: "Gratis tidsberegner. Beregn tidsrum mellem to klokkeslæt eller mellem to datoer, og se resultatet i timer, minutter, dage, arbejdsdage og decimaltimer.",
    },
    {
      locale: "se" as const,
      heading: "Hur lång tid är det mellan två klockslag?",
      answer: "Beräkna hur lång tid det går mellan två klockslag – i timmar, minuter och decimaltimmar. Dra av en rast.",
      schema: "Gratis tidskalkylator. Beräkna tidsintervall mellan två klockslag och se resultatet i timmar, minuter och decimaltimmar.",
    },
  ])("viser det konkrete svar, schema og beregneren i $locale", async ({ locale, heading, answer, schema }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await TidsberegnerPage());

    expect(html).toContain(`>${heading}</h1>`);
    expect(html).toContain(answer);
    expect(html).toContain(schema);
    expect(html).toContain("Tidsværktøj");
  });

  /**
   * Siden beder læseren indtaste i værktøjet "ovenfor" — og det skal være
   * sandt, ellers peger siden væk fra sit eneste felt.
   *
   * `page.tsx` har ni sådanne henvisninger: "Indtast dine egne klokkeslæt
   * ovenfor", "præcis som værktøjet ovenfor", "bruger du værktøjet ovenfor"
   * (og de svenske "ovanför"). De lå alle over værktøjet, fordi svar-først-
   * tabellen stod først og `<TidsBeregner />` først efter den — altså pegede
   * alle ni op på et felt, der lå længere nede. Det er samme fejlklasse som
   * de otte "ureviewede" fund: brødtekst, der påstande om siden selv uden at
   * have noget at holde det op mod.
   *
   * Porten dømmer på *rækkefølgen i den renderede markup* frem for en
   * håndlavet liste af ni strenge, så en ny "ovenfor"-sætning også dømmes —
   * men den dømmer på tabellen som landmærke, ikke på hver enkelt
   * forekomst. To grunde:
   *
   * 1. `<script>`-blokkene er taget ud. JSON-LD'en fra `<FAQSchema>` ligger i
   *    markup'en før alt det visuelle og siger også "Sæt start- og
   *    sluttidspunkt i feltet ovenfor" og "det står i tabellen ovenfor". Det er
   *    ikke løgnen — de to påstande er om den *renderede* side, hvor feltet og
   *    tabellen står over FAQ'en — men et script-tag har ingen plads på
   *    skærmen, så det kan ikke være det, porten dømmer på.
   * 2. Der står desuden mindst én "ovenfor" i indledningen, som hverken er de
   *    ni brødtekst-henvisninger eller JSON-LD. En port der kræver at *alle*
   *    forekomster ligger efter værktøjet, ville derfor dømme på noget denne
   *    opgave ikke påtager sig at rette. Landmærket er den konkrete
   *    rækkefølge-fælg, der gør de ni henvisninger rigtige: værktøjet før
   *    svar-først-tabellen.
   */
  test("værktøjet står før svar-først-tabellen, så \"ovenfor\" peger rigtigt", async () => {
    const forventet = [
      { locale: "da", tabel: "Svar på de oftest søgte tidsrum" },
      { locale: "se", tabel: "Svar på de vanligaste tidsintervallen" },
    ] as const;

    for (const { locale, tabel } of forventet) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

      const laeserefolge = renderToStaticMarkup(await TidsberegnerPage()).replace(
        /<script\b[^>]*>[\s\S]*?<\/script>/g,
        "",
      );
      const vaerktojet = laeserefolge.indexOf("Tidsværktøj");
      const tabellen = laeserefolge.indexOf(tabel);
      expect(vaerktojet, `lokale ${locale}: værktøjet er ikke renderet`).toBeGreaterThan(-1);
      expect(tabellen, `lokale ${locale}: svar-først-tabellen er ikke renderet`).toBeGreaterThan(-1);
      expect(
        vaerktojet,
        `lokale ${locale}: siden beder læseren indtaste "ovenfor", men værktøjet står under hele brødteksten og tabellen`,
      ).toBeLessThan(tabellen);
    }
  });

});

/**
 * Search Console 2026-08-29→09-26: /tidsberegner har 72.902 visninger, CTR
 * 0,3 % på pos. 7,0 (DA) og 59.270 visninger, CTR 0,2 % på pos. 8,1 (SE) —
 * positioner hvor titlen afgør om der klikkes. Dansk autocomplete under
 * "beregn tid mellem to klokkeslæt" har "excel beregn tid mellem to
 * klokkeslæt" som nr. 2, og svensk under "räkna ut timmar mellan klockslag"
 * har tre variationer med "excel". Begge sprog havde **0** forekomster af
 * "Excel" i den server-renderede HTML.
 *
 * Tallene i afsnittet er ikke håndskrevet: de er `TIDS_EKSEMPEL_DAG`,
 * `_MIDNAT` og `_PAUSE` formatteret med `formatNumber`, altså de tal
 * `beregnTidsinterval` regner. Derfor læser testene dem fra modulet.
 */
describe("Excel-svaret på /tidsberegner", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test("da har Excel-afsnittet med de tre formler", async () => {
    const html = renderToStaticMarkup(await TidsberegnerPage());

    expect(html).toContain("Sådan beregner du tid mellem to klokkeslæt i Excel");
    expect(html).toContain("=B1-A1");
    expect(html).toContain("=(B1-A1)*24");
    expect(html).toContain("=(B1-A1)*24*60");
    // Tallene er modulets, formatteret med komma (C78's klasse).
    expect(html).toContain("8,25");
    expect(html).not.toContain("8.25");
    expect(html).toContain("495");
  });

  test("da svarer på både midnat-fælden og pause-fælden med tal", async () => {
    const html = renderToStaticMarkup(await TidsberegnerPage());

    // Excel trækker 06:00 fra 22:00 og får minus 16 timer; MOD tager dagen med.
    expect(html).toContain("=MOD(B1-A1;1)*24");
    expect(html).toContain(
      formatNumber(excelDifferens(TIDS_EKSEMPEL_MIDNAT), "da", { maximumFractionDigits: 2 })
    );
    // Tallet står for sig selv, ikke som "minus -0,67" — dobbelt minus.
    expect(html).not.toContain("minus -");
    expect(html).toContain("minus 16 timer");
    expect(html).toContain("=(B1-A1)*24-0,5");
    // Og pausen er 30 minutter = 0,5 time, så 8 − 0,5 = 7,5 — decimaltimer.
    expect(html).toContain("7,50");
    expect(TIDS_EKSEMPEL_PAUSE.pause).toBe(30);
  });

  test("da forklarer hvorfor Excel kan vise 0,34 i stedet for timer", async () => {
    const html = renderToStaticMarkup(await TidsberegnerPage());

    // Den fælde der får folk til at tro formlen er forkert: cellen er
    // formateret som Tal, ikke Tid. Værdien er 8,25 / 24.
    expect(html).toContain("formateret som");
    expect(html).toContain("Tid");
    expect(html).toContain(
      formatNumber(excelDifferens(TIDS_EKSEMPEL_DAG), "da", { maximumFractionDigits: 4 })
    );
    // Dansk Excel bruger semikolon, fordi komma er decimaltegn.
    expect(html).toContain("semikolon");
  });

  test("se har sit eget Excel-afsnit med svensk notation", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await TidsberegnerPage());

    expect(html).toContain("Så räknar du ut timmar mellan två klockslag i Excel");
    expect(html).toContain("=B1-A1");
    expect(html).toContain("=MOD(B1-A1;1)*24");
    // Svensk notation: komma i decimaler, "timmar" ikke "timer", og den
    // negative værdi med svensk komma — ikke dansk.
    expect(html).toContain("8,25 timmar");
    expect(html).not.toContain("8,25 timer");
    expect(html).not.toContain("8,25 timme ");
    // Svensk Excel bruger også semikolon.
    expect(html).toContain("semikolon");
    // Ingen danske æ/ø må lække ind (C73's R4).
    for (const daFragment of [
      "klokkeslæt",
      "Sådan",
      "decimaltimer",
      "beregneren",
      "Hvordan",
      "frokost",
    ]) {
      expect(html).not.toContain(daFragment);
    }
  });

  test("begge sprog linker videre til /dato — de to formler ligner hinanden", async () => {
    for (const locale of ["da", "se"] as const) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

      const html = renderToStaticMarkup(await TidsberegnerPage());

      expect(html).toContain('href="/dato"');
    }
  });

  test("FAQ'en har de to nye spørgsmål i begge sprog, så de kommer i JSON-LD'en", () => {
    // `FAQ` er mocket væk i denne fil (C85's fælde), så påstanden ligger i
    // page-data og læser præcis den tabel FAQSchema får.
    for (const locale of ["da", "se"] as const) {
      const spgsmaal = getPageData("tidsberegner", locale)!.faqItems.map((i) => i.question);
      expect(spgsmaal.some((q) => q.includes("Excel"))).toBe(true);
      expect(spgsmaal.some((q) => /negativt tal|negativt/.test(q))).toBe(true);
    }
  });

  test("de to nye FAQ-svar indeholder de samme tal som afsnittet", () => {
    // Ellers kunne FAQ'en love 8,25 mens brødteksten siger 8,5 — C84's
    // fejlklasse: en indekseret tekst der modsiger sin egen side.
    const da = getPageData("tidsberegner", "da")!.faqItems;
    const excelSvar = da.find((i) => i.question.includes("Excel"))!.answer;
    const negativtSvar = da.find((i) => i.question.includes("negativt tal"))!.answer;

    expect(excelSvar).toContain("8,25");
    expect(excelSvar).toContain("495");
    expect(negativtSvar).toContain("-0,67");
    expect(negativtSvar).toContain("8 timer");
    // Og de skal være de samme tal som modulet regner.
    expect(excelSvar).toContain(String(totalMinutter(TIDS_EKSEMPEL_DAG)));
    expect(negativtSvar).toContain("=MOD(B1-A1;1)*24");
  });
  test("tempo-afsnittet svarer paa laebetid i begge sprog, med tal fra modulet", async () => {
    for (const locale of ["da", "se"] as const) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

      const html = renderToStaticMarkup(await TidsberegnerPage());

      const overskrift =
        locale === "da" ? "Hvor hurtigt løber jeg?" : "Hur fort springer jag?";
      expect(html).toContain(overskrift);
      // Regnestykket og de to omregninger, dansk notation.
      expect(html).toContain("5:00");
      expect(html).toContain("8:03");
      expect(html).toContain("4:59");
      // Rækkerne er de fire i modulet, og hver celle er regnet af beregnTempo.
      for (const eksempel of TEMPO_EKSEMPLER) {
        const tempo = beregnTempo(eksempel.minutter, eksempel.km)!;
        expect(html).toContain(formatSekunder(tempo.sekunderPerKm));
        expect(html).toContain(formatSekunder(tempo.sekunderPerMil));
      }
      // 1 engelsk mil er 1,609344 km — den fælde, der giver 8:03 og ikke 8:00.
      expect(html).toContain("1,609344");
    }
  });

  test("tempo-FAQ'en indeholder de samme tal som tempo-afsnittet", () => {
    // Ellers kunne svaret i JSON-LD'en love 4:58 mens tabellen viser 4:59 —
    // C84's fejlklasse.
    for (const locale of ["da", "se"] as const) {
      const faq = getPageData("tidsberegner", locale)!.faqItems;
      const tempoSvar = faq.find((i) =>
        i.question.includes("tempo")
      )!.answer;
      for (const eksempel of TEMPO_EKSEMPLER) {
        const tempo = beregnTempo(eksempel.minutter, eksempel.km)!;
        if (eksempel.id !== "km10" && eksempel.id !== "maraton") {
          expect(tempoSvar).toContain(formatSekunder(tempo.sekunderPerKm));
        }
      }
      expect(tempoSvar).toContain("5:00");
      expect(tempoSvar).toContain("4:59");
    }
  });

  /**
   * C84-lukningen for brødteksten. Fund 2/10: tempo-tabellen renderer
   * `formatSekunder` af `beregnTempo`, altså 4:59 for halvmarathon, mens
   * afsnittet «tid ÷ tempo = distance» lige under den skrev 4:58 i hånden på
   * den danske gren. Den svenska skrev 4:59, så samme regnestykke fik to svar
   * på to domæner.
   *
   * Testen dømmer på den **server-renderede** afsnitstekst og læser facit fra
   * modulet, så et håndskrevet tempo er rødt uanset hvilket tal det er — ikke
   * bare 4:58. Det er pointen: `toContain("4:59")` på hele siden ville være
   * grøn, fordi tabellen indeholder 4:59 i forvejen, altså vakuum-grøn for den
   * afsnitstegst der var forkerte.
   */
  test("afsnittet 'tid ÷ tempo = distance' skriver tempoet fra modulet, ikke i hånden", async () => {
    const halv = TEMPO_EKSEMPLER.find((e) => e.id === "halvmaraton")!;
    const moduletsTempo = formatSekunder(
      beregnTempo(halv.minutter, halv.km)!.sekunderPerKm
    );

    for (const locale of ["da", "se"] as const) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

      const html = renderToStaticMarkup(await TidsberegnerPage());

      // Find afsnittet, ikke hele siden: det er her et håndskrevet tempo står.
      const afsnit = html.match(
        /<p>[^<]*<strong>tid ÷ tempo = (?:distance|distans)<\/strong>[\s\S]*?<\/p>/
      );
      expect(afsnit).not.toBeNull();

      // Alle m:ss-tokens i afsnittet skal være modulets tempo. Rækken er ens
      // i begge sprog, så en afvigelse er en fejl — ikke en sprogforskel.
      const tokens = (afsnit![0].match(/\b\d+:\d{2}\b/g) ?? []);
      expect(tokens.length).toBeGreaterThan(0);
      for (const token of tokens) {
        expect(token).toBe(moduletsTempo);
      }
    }

    // Målt 2/10 under npx tsx: beregnTempo(105, 21.1) → 299 → 4:59. 4:58 er
    // Math.floor(298,58) og altså den aflæsning, fundet så i brødteksten.
    expect(moduletsTempo).toBe("4:59");
    expect(moduletsTempo).not.toBe(formatSekunder(Math.floor(298.58)));
  });

  test("tempo-tabellen og afsnittet er samme række, målt på den tabellenes egen celle", async () => {
    // Krydscheck mellem de to steder på siden: rækken for halvmarathon skal
    // have præcis modulets tempo i tabellen. Uden denne kunne tabellen blive
    // håndskrevet mens afsnittet stadig læste fra modulet — så ville fundet
    // bare flytte sig.
    const raekke = TEMPO_EKSEMPLER.find((e) => e.id === "halvmaraton")!;
    const moduletsTempo = formatSekunder(
      beregnTempo(raekke.minutter, raekke.km)!.sekunderPerKm
    );

    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
    const html = renderToStaticMarkup(await TidsberegnerPage());

    // Find rækken på dens *plads* i TEMPO_EKSEMPLER, så testen ikke hænger
    // op på den danske etiket eller på et hårdkodet minuttal. Rækkerne fra
    // modulet danner rækkefølgen, og hver `<td>` er navn, tid, pr. km, pr. mil.
    const index = TEMPO_EKSEMPLER.findIndex((e) => e.id === "halvmaraton");
    const rækker = html.match(/<td>[^<]*<\/td><td>\d+ min\.<\/td><td>\d+:\d{2}<\/td><td>\d+:\d{2}<\/td>/g) ?? [];
    expect(rækker.length).toBe(TEMPO_EKSEMPLER.length);

    const celler = rækker[index].match(/<td>(\d+:\d{2})<\/td>/g) ?? [];
    expect(celler[0]).toBe(`<td>${moduletsTempo}</td>`);
  });
});

/**
 * C120. SE-autocomplete under "räkna ut timmar och minuter" har "räkna ut
 * timmar från minuter" (nr. 7) og "räkna timmar till minuter" (nr. 10) —
 * altså begge retninger i omvandlingen. Den svenska side svarade på ingen af
 * dem. Tabellens tal er **udregnet** (div/mod 60) i `page.tsx`, og testen
 * læser dem fra samme moduls `TIDS_EKSEEMPLER` og `formatTidsvar`, så
 * C84's fejlklasse — en indekseret tekst der modsiger sit eget indhold —
 * ikke kan ske på denne blok.
 */
const MINUTER = [15, 30, 45, 60, 90, 120, 480, 495];

describe("minuter ↔ timmar på beraknare.se", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
  });

  test("se har sektionen med divisionen og alle otte rækker", async () => {
    const html = renderToStaticMarkup(await TidsberegnerPage());

    expect(html).toContain("Räkna om minuter till timmar");
    expect(html).toContain("minuter ÷ 60 = timmar");
    expect(html).toContain("timmar × 60 = minuter");
    // Verktyget — ikke bara tabellen — står på beraknare.se, så den svenska
    // gren bruger komponentens svenska etiketter i stället for at lade dem
    // være død kode.
    expect(html).toContain("Minutter-til-timer-værktøj");
    for (const minuter of MINUTER) {
      const decimal = formatNumber(minuter / 60, "se", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      expect(html).toContain(minuter + " ÷ 60 = " + decimal);
    }
    // Den modsatte retning står i brødteksten, med tal der kan efterprøves.
    expect(html).toContain("7,5 timmar");
    expect(html).toContain("450 minuter");
    // 495 minuter er 08:30–16:45, altså TIDS_EKSEMPEL_DAG — krydschecket mod
    // modulet, så de to tabeller ikke kan komme i mellemkrig om et facit.
    expect(html).toContain("8 h 15 min");
    expect(totalMinutter(TIDS_EKSEMPEL_DAG)).toBe(495);
    expect(html).toContain('href="/fart"');
  });

  test("omvandlingen i tabellen er den samme regel som formatTidsvar", () => {
    for (const minuter of MINUTER) {
      const timer = Math.floor(minuter / 60);
      const restMinutter = minuter % 60;
      // timer x 60 + restMinutter skal give minutter tilbage. Det er praecis
      // definitionen paa, at tabellens tal ikke er skrevet i haanden ved
      // siden af logikken.
      expect(timer * 60 + restMinutter).toBe(minuter);
      expect(formatTidsvar({ timer, minutter: restMinutter }, "se")).toBe(
        timer + " h " + restMinutter + " min"
      );
    }
  });

  test("da har den samme omvandlingssektion, fordi DA-autocomplete er 7 af 10 numeriske", async () => {
    // C120 lagde sektionen kun i den svenska gren og låste med denne test, at
    // dansk *ikke* skulle have den — altså låst tilstanden før rettelsen i
    // stedet for en egenskab (C94's negative SE-lås, samme fejlklasse).
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));

    const html = renderToStaticMarkup(await TidsberegnerPage());

    expect(html).toContain("Omregn minutter til timer");
    expect(html).toContain("minutter ÷ 60 = timer");
    expect(html).toContain("timer × 60 = minutter");
    for (const minuter of MINUTTER_TILL_TIMMAR.map((r) => r.minutter)) {
      const decimal = formatNumber(minuter / 60, "da", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      expect(html).toContain(minuter + " ÷ 60 = " + decimal);
    }
    expect(html).toContain("7,5 timer");
    expect(html).toContain("450 minutter");
    expect(html).toContain("8 t 15 min");
    expect(html).toContain('href="/fart"');
  });

  test("hvert sprog svarer på sin egen numeriske autocomplete-klynge", async () => {
    // De tal, hvert sprog faktisk bliver spurgt om. Dansk: "300 minutter til
    // timer" (nr. 4), "1000 minutter til timer" (nr. 5), "2500" (nr. 10).
    // Svensk: de otte rækker C120 målte under "räkna ut timmar och minuter".
    const daHtml = renderToStaticMarkup(await (async () => {
      vi.mocked(getLocale).mockResolvedValue("da");
      return TidsberegnerPage();
    })());
    for (const minutter of [300, 1000, 1500, 2000, 2500]) {
      expect(daHtml).toContain(minutter + " ÷ 60 = ");
    }

    vi.mocked(getLocale).mockResolvedValue("se");
    const seHtml = renderToStaticMarkup(await TidsberegnerPage());
    for (const minutter of [90, 120, 480, 495]) {
      expect(seHtml).toContain(minutter + " ÷ 60 = ");
    }
  });

  test("omvandlingssektionen er i begge sprog, og hver sin notation", async () => {
    // Paritet læst fra den anden sproggren i stedet for fra et hardkodet
    // antal: et tal i en test er en ny målefejl, næste gang en række tilføjes.
    vi.mocked(getLocale).mockResolvedValue("se");
    const seHtml = renderToStaticMarkup(await TidsberegnerPage());
    vi.mocked(getLocale).mockResolvedValue("da");
    const daHtml = renderToStaticMarkup(await TidsberegnerPage());

    for (const html of [seHtml, daHtml]) {
      expect(html).toContain("÷ 60 = ");
      expect(html).toContain('href="/fart"');
    }
    // Svensk må ikke få danske forkortelser i tabellen (C73's R4).
    expect(seHtml).not.toContain("timer × 60 = minutter");
    expect(daHtml).not.toContain("timmar × 60 = minuter");
    // Og de to tabeller skal have præcis samme rækker.
    const raekker = (html: string) =>
      (html.match(/<td>(\d+)<\/td>/g) ?? []).map((t) => Number(t.replace(/\D/g, "")));
    expect(raekker(daHtml)).toEqual(raekker(seHtml));
  });

  test("FAQ'en svarer på omvandlingen i begge sprog, så det kommer i JSON-LD'en", () => {
    // `FAQ` er mocket væk (C85's fælde), så påstanden ligger i page-data,
    // som er den tabel FAQSchema får.
    const faqSe = getPageData("tidsberegner", "se")!.faqItems;
    const spgSe = faqSe.map((i) => i.question);
    expect(spgSe.some((q) => q.includes("minuter till timmar"))).toBe(true);
    expect(spgSe.some((q) => q.includes("08:30 till 16:45"))).toBe(true);

    // Svarene skal bære de samme tal som tabellen på siden.
    const omvandling = faqSe.find((i) => i.question.includes("minuter till timmar"))!.answer;
    expect(omvandling).toContain("90 minuter ÷ 60 = 1,50 timmar");
    expect(omvandling).toContain("7,5 timmar × 60 = 450 minuter");
    const klockslag = faqSe.find((i) => i.question.includes("08:30 till 16:45"))!.answer;
    expect(klockslag).toContain("8 timmar och 15 minuter");
    expect(klockslag).toContain("8,25 decimaltimmar");

    // Dansk har nu sin egen version af de samme tre spørgsmål.
    const faqDa = getPageData("tidsberegner", "da")!.faqItems;
    const spgDa = faqDa.map((i) => i.question);
    expect(spgDa.some((q) => q.includes("minutter om til timer"))).toBe(true);
    expect(spgDa.some((q) => q.includes("300 minutter i timer"))).toBe(true);
    expect(spgDa.some((q) => q.includes("1 time og 30 minutter i decimaltimer"))).toBe(true);

    // Og tallene i svarene er de samme som dem tabellen regner.
    const daOmvandling = faqDa.find((i) => i.question.includes("minutter om til timer"))!.answer;
    expect(daOmvandling).toContain("90 minutter ÷ 60 = 1,50 timer");
    expect(daOmvandling).toContain("7,5 timer × 60 = 450 minutter");
    const da300 = faqDa.find((i) => i.question.includes("300 minutter i timer"))!.answer;
    expect(da300).toContain("300 minutter ÷ 60 = 5,00 timer");
    for (const raekke of MINUTTER_TILL_TIMMAR) {
      const timer = Math.floor(raekke.minutter / 60);
      const rest = raekke.minutter % 60;
      expect(timer * 60 + rest).toBe(raekke.minutter);
    }
  });
});

describe("lægge to tidsrum sammen på /tidsberegner", () => {
  // C187: målt på den server-renderede HTML før rettelsen — begge domæner
  // havde 0 forekomster af "læg timer", "regn timer", "addera" og "summera",
  // selv om DA-autocomplete under "timer og minutter" har fire variationer
  // om at lægge sammen, og SE-autocomplete under "timmar och minuter" har
  // "addera timmar och minuter" (nr. 5) og "summera timmar och minuter i
  // excel" (nr. 6).
  async function html(locale: "da" | "se") {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
    return renderToStaticMarkup(await TidsberegnerPage());
  }

  test("dansk svarer på 'lægge to tidsrum sammen' med en overskrift og en tabel", async () => {
    const markup = await html("da");
    expect(markup).toContain("Sådan lægger du to tidsrum sammen");
    expect(markup).toContain("I alt");
    expect(markup).toContain("Hele døgn");
  });

  test("svensk svarer på 'addera timmar och minuter' på samme måde", async () => {
    const markup = await html("se");
    expect(markup).toContain("Så här lägger du ihop två tidsintervall");
    expect(markup).toContain("Totalt");
    expect(markup).toContain("Hela dygn");
  });

  test("begge sprog har præcis de tre rækker modulet regner", async () => {
    for (const locale of ["da", "se"] as const) {
      const markup = await html(locale);
      for (const raekke of TIDS_SUMMER) {
        const sum = summerTidsrum(raekke)!;
        // Rækken læses fra modulet, så en række der springer over på siden
        // ikke kan gemme sig i en længde-tælling (C182's lære).
        expect(markup).toContain(
          `${raekke.forsteStart}–${raekke.forsteSlut}`
        );
        expect(markup).toContain(formatTidsvar(sum, locale));
        expect(
          formatNumber(sum.decimalTimer, locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        ).toMatch(/^\d+,\d{2}$/);
      }
      // Og ingen række må have to timer-celler, der ligner ens — det ville
      // være en dublet af slagsen C186 lukkede.
      expect(markup.split("− 90 min").length - 1).toBe(1);
    }
  });

  test("de to Excel-formler står i markupken, HTML-escapet", async () => {
    for (const locale of ["da", "se"] as const) {
      const markup = await html(locale);
      // React escaper "=" er ikke noget, men "<" ville være det; formlerne
      // læses derfor på den escapede form (målefejl 27's lære).
      expect(markup).toContain(EXCEL_SUM_FORMEL);
      expect(markup).toContain(EXCEL_SUM_MED_PAUSE);
    }
  });

  test("fælden med pausen over én time står i begge sprog", async () => {
    const da = await html("da");
    expect(da).toContain("mere end én time");
    expect(da).toContain("før");
    const se = await html("se");
    expect(se).toContain("mer än en timme");
    expect(se).toContain("innan");
  });

  test("sproglås: beraknare.se må ikke have danske markører fra den nye blok", async () => {
    const markup = await html("se");
    for (const daRoe of ["lægger", "tidsrum", "før", "døgn", "fælde"]) {
      expect(markup).not.toContain(`>${daRoe}`);
      expect(markup).not.toContain(` ${daRoe} `);
    }
  });

  test("FAQ'en får de to nye spørgsmål i begge sprog (læst fra page-data, FAQ er mocket væk)", () => {
    // FAQ er mocket væk i denne fil, så en synlig-tekst-test ville være
    // grøn på den gamle kode — C85's fælde. Læs derfra den tabel `FAQ`
    // faktisk får.
    const spgDa = getPageData("tidsberegner", "da")!.faqItems.map((i) => i.question);
    const spgSe = getPageData("tidsberegner", "se")!.faqItems.map((i) => i.question);
    expect(spgDa.some((q) => q.includes("lægger jeg to tidsrum sammen"))).toBe(true);
    expect(spgDa.some((q) => q.includes("forkert når jeg har en pause"))).toBe(true);
    expect(spgSe.some((q) => q.includes("lägger jag ihop två tidsintervall"))).toBe(true);
    expect(spgSe.some((q) => q.includes("summan fel när jag har en paus"))).toBe(true);

    // Og svaret indeholder præcis de tal modulet regner, så brødteksten og
    // tabellen ikke kan glide fra hinanden.
    const daSvar = getPageData("tidsberegner", "da")!.faqItems.find((i) =>
      i.question.includes("lægger jeg to tidsrum sammen")
    )!.answer;
    const toVagter = summerTidsrum(TIDS_SUMMER.find((r) => r.id === "to_vagter")!)!;
    expect(daSvar).toContain("810 ÷ 60 = 13,50 timer");
    expect(daSvar).toContain(EXCEL_SUM_FORMEL);
    // FAQ'en skriver den lange form ("13 timer og 30 minutter") og tabellen
    // den korte ("13 t 30 min"). Begge skal være de SAMME time og det SAMME
    // minut — hvis en af dem senere skriver et andet tal, skal testen falde.
    // Derfor låses kun time- og minuttallet, ikke notationsformen.
    expect(toVagter.timer).toBe(13);
    expect(toVagter.minutter).toBe(30);
    expect(daSvar).toContain("13 timer og 30 minutter");
  });

  const TIMER_PERIODE_IDER = TIMER_PERIODER.map((r) => r.id);

  test("periodetabellen viser modulets timer i begge sprog", async () => {
    const daHtml = renderToStaticMarkup(await (async () => {
      vi.mocked(getLocale).mockResolvedValue("da");
      return TidsberegnerPage();
    })());
    const seHtml = renderToStaticMarkup(await (async () => {
      vi.mocked(getLocale).mockResolvedValue("se");
      return TidsberegnerPage();
    })());

    // Hver periode skal staa med det modul, ikke med et haandskrevet tal:
    // timer, minutter OG sekunder, saa en aendret dag-taeler virker paa alle tre.
    for (const [locale, html] of [
      ["da", daHtml],
      ["se", seHtml],
    ] as const) {
      for (const id of TIMER_PERIODE_IDER) {
        const raekke = timerIPeriode(id);
        expect(html).toContain(formatNumber(raekke.timer, locale));
        expect(html).toContain(formatNumber(raekke.minutter, locale));
        expect(html).toContain(formatNumber(raekke.sekunder, locale));
        expect(html).toContain(raekke.naevn[locale]);
      }
      // Skudaaret nævnes med sit eget tal, og det er ét døgn mere.
      expect(html).toContain(formatNumber(DAGE_I_SKUDAAR, locale));
      expect(html).toContain(formatNumber(TIMER_I_SKUDAAR, locale));
    }

    // Maaneden og kvartalet er snit, saa de maa staa med brøktal — ellers
    // skriver brødteksten 30 dage og tabellen siger 30,42.
    expect(daHtml).toContain("30,42");
    expect(daHtml).toContain("91,25");
    expect(seHtml).toContain("30,42");
    expect(seHtml).toContain("91,25");

    // Hvert sprog skal have sit egen navn paa hver periode: en dansk
    // overskrift paa beraknare.se er det, locale-leak-porten dømmer paa.
    expect(daHtml).toContain("En uge");
    expect(daHtml).not.toContain("En vecka");
    expect(seHtml).toContain("En vecka");
    expect(seHtml).not.toContain("En uge");
  });

  test("de to nye spørgsmål er kun i det sprog de er skrevet i", () => {
    const spgDa = getPageData("tidsberegner", "da")!.faqItems.map((i) => i.question);
    const spgSe = getPageData("tidsberegner", "se")!.faqItems.map((i) => i.question);
    expect(spgSe.some((q) => q.includes("tidsrum sammen"))).toBe(false);
    expect(spgDa.some((q) => q.includes("tidsintervall"))).toBe(false);
  });

  describe("«hvad er klokken om X timer» (plus tid)", () => {
    test("begge domæner har overskriften på den spørgende form", async () => {
      expect(await html("da")).toContain("Læg tid på et klokkeslæt: hvad er klokken om X timer?");
      expect(await html("se")).toContain("Lägg tid på ett klockslag: vad är klockan om X timmar?");
    });

    test("tabellen viser præcis de klokkeslæt modulet regner, i begge sprog", async () => {
      for (const locale of ["da", "se"] as const) {
        const markup = await html(locale);
        for (const eksempel of PLUS_TID_EKSEMPLER) {
          const r = plusTid(eksempel)!;
          // Rækkerne læses fra modulet, så en udeladt række kan ikke gemme
          // sig i en længde-tælling (C182's lære).
          expect(markup).toContain(eksempel.klokkeslaet);
          expect(markup).toContain(r.klokkeslaet);
        }
      }
    });

    test("de to fælder — 00:00 dagen efter og 22:00 dagen før — står i begge sprog", async () => {
      const da = await html("da");
      expect(da).toContain("12:00 plus 12 timer er 00:00 dagen");
      expect(da).toContain("06:00 minus 8 timer er 22:00 dagen før");
      const se = await html("se");
      expect(se).toContain("12:00 plus 12 timmar blir 00:00");
      expect(se).toContain("06:00 minus 8 timmar blir 22:00 dagen innan");
    });

    test("dags-teksten i tabellen er oversat — ikke dansk på beraknare.se", async () => {
      // `PLUS_TID_DAG_TEKST` lå i en terning engang, så scanneren kunne
      // læse den danske gren, og en travl fingerspelling skrev "dagen for"
      // i stedet for "dagen før". Begge fejl låser porten.
      const da = await html("da");
      expect(da).toContain("dagen før");
      expect(da).not.toContain("dagen for");
      const se = await html("se");
      expect(se).toContain("dagen innan");
      expect(se).not.toContain("dage før");
    });

    test("omvej-sætningen peger nu på summeringsfanen i stedet for at være en dødsdød", async () => {
      expect(await html("da")).toContain("Læg tidsrum sammen");
      expect(await html("se")).toContain("Lägg ihop tidsintervall");
    });

    test("sproglås: ingen danske markører fra blokken på beraknare.se", async () => {
      const markup = await html("se");
      for (const daRoe of ["lægger", "tidsrum", "før", "døgn", "klokkeslæt"]) {
        expect(markup).not.toContain(`>${daRoe}`);
        expect(markup).not.toContain(` ${daRoe} `);
      }
    });
  });

});
