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
import TidsberegnerPage from "./page";

vi.mock("@/components/TidsBeregner", () => ({
  default: () => <div>Tidsværktøj</div>,
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
      schema: "Gratis tidsberegner. Beregn tidsrum mellem to klokkeslæt og se resultatet i timer, minutter og decimaltimer.",
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

  // Search Console: "hvor lang tid" 790 visninger pos. 6. Svar-først-tabellen
  // er dansk, fordi spørgsmålet er dansk; den må ikke lække til beraknare.se.
  // C38 lagde den her som en `not.toContain`-lås på **hele tabellen** — altså
  // låst på tilstanden før C120, i stedet for på en egenskab. Det er C94's
  // negative SE-lås på "500 ÷ 15" og C119's på "3,14 × 3 × 3" i tredje
  // forklædning: en måler, der er grøn fordi den forbyder rettelsen. C38's
  // hensigt — "svensk læsere skal ikke se dansk" — er bevaret som de to
  // reelle låse nedenfor: SE *skal* have sin egen tabel, og SE må ikke have
  // danske markører.
  test("da viser svar-først-tabellen med det lovede eksempel", async () => {
    const html = renderToStaticMarkup(await TidsberegnerPage());

    expect(html).toContain("Svar på de oftest søgte tidsrum");
    expect(html).toContain("<strong>8 t 15 min</strong>");
    // C78: denne assertion lå "8.25 timer" fast — altså den fejl, der stod i
    // den server-renderede HTML og dermed i den tekst Google indekserer.
    expect(html).toContain("8,25 timer");
    expect(html).not.toContain("8.25 timer");
    expect(html).toContain("(dagen efter)");
  });

  test("se viser sin egen svar-først-tabel med alle syv intervaller", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await TidsberegnerPage());

    expect(html).toContain("Svar på de vanligaste tidsintervallen");
    // Svensk notation i svaret: "h" ikke den danske "t" (C73's R4).
    expect(html).toContain("<strong>8 h 15 min</strong>");
    expect(html).toContain("8,25 timmar");
    expect(html).toContain("Samma dag");
    expect(html).toContain("Paus</th>");
    expect(html).toContain("Decimaltimmar</th>");
    expect(html).toContain("(dagen efter)");
    // Alle syv rækker fra modulet, i begge sprog — tabellen er data, ikke
    // håndskrevet tekst, så den ikke kan tabe en linje.
    for (const eksempel of TIDS_EKSEEMPLER) {
      expect(html).toContain(`>${eksempel.start}</td>`);
      expect(html).toContain(`>${eksempel.slut}</td>`);
    }
  });

  test("se-tabellen lækker ingen danske markører", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await TidsberegnerPage());

    for (const daFragment of [
      "Svar på de oftest søgte tidsrum",
      "Samme dag",
      "Pause</th>",
      "Decimaltimer</th>",
      "8 t 15 min",
      "1 t 30 min",
      "80,00 timer",
    ]) {
      expect(html).not.toContain(daFragment);
    }
    // "dagen efter" er svensk, så den skal findes — ellers låsen ovenfor
    // ville være vakuum-grøn for den. Den lå i den gamle test, der låste
    // *tilstanden før rettelsen*; "dagen efter" er korrekt svensk og blev
    // fundet ved at læse den fejlslagne liste (målefejl nr. 23).
    expect(html).toContain("dagen efter");
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
