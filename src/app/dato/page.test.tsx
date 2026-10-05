import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getDageTilSlugs, getDageTilEvents, getDageTilAnswer, dageTilArm, formatTargetDate } from "@/lib/dage-til";
import { getPageData } from "@/lib/page-data";
import { maanederITaar } from "@/lib/dato-eksempler";
import { getHelligdage } from "@/lib/helligdage";
import { pinseInterval } from "@/lib/pinse-intervaller";
import DatoPage from "./page";

vi.mock("next/dynamic", () => ({
  default: () => () => <div>Datoværktøj</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null, ArticleSchema: () => null }));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

describe("dato page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Beregn antal dage mellem to datoer",
      answer: "Vælg en startdato og en slutdato",
    },
    {
      locale: "se" as const,
      heading: "Beräkna antal dagar mellan två datum",
      answer: "Välj ett startdatum och ett slutdatum",
    },
  ])("viser den konkrete opgave i $locale", async ({ locale, heading, answer }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain(`>${heading}</h1>`);
    expect(html).toContain(answer);
    expect(html).toContain("Datoværktøj");
  });

  // Search Console: "hvor mange dage er der til 1 december" 996 visninger
  // pos. 5 og "hvor mange dage er der tilbage af 2026" 223 visninger pos. 5.
  // `/dato` var sidens største indgang (963 indgangssider) og linkede til
  // ingen dage-til-side, selv om `/nedtaelling` gør (C7).
  test("da linker til alle dage-til-sider og videre til /nedtaelling", async () => {
    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("Hvor mange dage er der til …?");
    for (const slug of getDageTilSlugs("da")) {
      expect(html, slug).toContain(`href="/dage-til/${slug}"`);
    }
    expect(html).toContain('href="/dage-til/1-december"');
    expect(html).toContain("Hvor mange dage er der til 1. december?");
    expect(html).toContain('href="/nedtaelling"');
  });

  test("se linker til dagar-till-siderne på svensk", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("Hur många dagar är det till …?");
    for (const slug of getDageTilSlugs("se")) {
      expect(html, slug).toContain(`href="/dagar-till/${slug}"`);
    }
    expect(html).toContain("Hur många dagar är det till 1 december?");
    expect(html).not.toContain("/dage-til/");
  });

  test("no faar ingen dage-til-links", async () => {
    vi.mocked(getLocale).mockResolvedValue("no");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("no"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).not.toContain("/dage-til/");
    expect(html).not.toContain("/dagar-till/");
  });
});

describe("dato page — dage tilbage i året", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-27T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("da svarer på 'hvor mange dage er der tilbage af 2026' med dagens tal", async () => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("<h2>Hvor mange dage er der tilbage af 2026?</h2>");
    expect(html).toContain("<strong>95 dage tilbage af 2026</strong>");
    expect(html).toContain("13 uger og 4 dage");
    expect(html).toContain('href="/dage-til/1-december"');
    expect(html).toContain('href="/dage-til/31-december"');
    expect(html).not.toContain('href="/dage-til/nytaarsaften"');
  });

  test("se svarer på 'dagar kvar av 2026' med dagens tal", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("<h2>Hur många dagar är det kvar av 2026?</h2>");
    expect(html).toContain("<strong>95 dagar kvar av 2026</strong>");
    expect(html).toContain('href="/dagar-till/1-december"');
    expect(html).toContain('href="/dagar-till/nyarsafton"');
  });

  // "26 veckor och 1 dagar" stod live på beraknare.se/dato: restdagen blev
  // skrevet med flertal uden at blive böjet, selv om antallet og ugerne var
  // det. Samme fejltype som "1 dage" i datolisten (e6f4f0e), samme side —
  // og den danske undgik den kun fordi "dage" og "dagar" har samme flertal.
  test("restdagen efter ugerne b\u00f8jes i begge sprog", async () => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));

    const html = renderToStaticMarkup(await DatoPage());

    // 95 dage = 13 uger og 4 dage: 4 er flertal på begge sprog.
    expect(html).toContain("13 uger og 4 dage");
  });

  test("se b\u00f8jer '1 dag' i ental, mens flertal stadig er 'dagar'", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    // 30. december: 1 dag tilbage, altsaa 0 uger og 1 dag — netop den
    // bøjning der var forkert ("1 dagar"). Datoen er valgt, fordi den er
    // den eneste i december, der giver netop 1.
    vi.setSystemTime(new Date("2026-12-30T12:00:00Z"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("<strong>1 dag kvar av 2026</strong>");
    expect(html).toContain("0 veckor och 1 dag.");
    // Kun restdagen ved ugerne: overskriftens "1 dagar kvar av 2026" er
    // korrekt flertal og skal ikke faa denne port til at fejle.
    expect(html).not.toContain("veckor och 1 dagar");
  });

  test("se beh\u00e6lder 'dagar' i flertal, så b\u00f8jningen ikke sl\u00e5r fejl den anden vej", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    // 27. september: 95 dage tilbage = 13 uger og 4 dagar.
    vi.setSystemTime(new Date("2026-09-27T12:00:00Z"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("13 veckor och 4 dagar.");
    expect(html).not.toContain("4 dag.");
  });

  test("tallet følger dagen, så siden kan ikke stå med gårsdags svar", async () => {
    vi.setSystemTime(new Date("2026-12-31T08:00:00Z"));
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("<h2>Hvor mange dage er der tilbage af 2026?</h2>");
    expect(html).toContain("<strong>0 dage tilbage af 2026</strong>");
  });
});

// Svensk autocomplete under "dagar mellan två datum" (GSC: 367 visninger,
// pos. 8) har 7 af 10 variationer med "excel" — "antal dagar mellan två
// datum excel", "hur många dagar mellan två datum excel", "excel formel
// antal dagar mellan datum excel". Dansk autocomplete under "antal dage
// mellem to datoer" har tre. Begge `/dato`-sider havde 0 forekomster af
// "Excel" i den server-renderede HTML.
describe("dato page — antal dagar mellan datum (svar-först)", () => {
  test("svensk side har huvudordet og spørgsmålsformen fra GSC", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("<h2>Antal dagar mellan datum</h2>");
    expect(html).toContain("<strong>366 dagar</strong>");
    // GSC 2026-08-30 → 2026-09-27: "antal dagar mellan datum" 425 v pos 9,
    // "hur många dagar mellan två datum" 380 v pos 8. Dansk side har begge.
    expect(html).toContain("hur många dagar mellan två datum");
  });

  test("dansk side er urørt af den svenska rettelsen", async () => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).not.toContain("<h2>Antal dagar mellan datum</h2>");
  });
});

describe("dato page — antal dagar mellan datum i Excel", () => {
  test.each([
    {
      locale: "da" as const,
      heading: "<h2>Sådan tæller du dage mellem to datoer i Excel</h2>",
      days: "<strong>365 dage</strong>",
      days194: "<strong>194 dage</strong>",
      months: "altså 6 hele måneder",
      semicolon: "Dansk Excel bruger <strong>semikolon</strong>",
    },
    {
      locale: "se" as const,
      heading: "<h2>Så räknar du ut dagar mellan två datum i Excel</h2>",
      days: "<strong>365 dagar</strong>",
      days194: "<strong>194 dagar</strong>",
      months: "alltså 6 hela månader",
      semicolon: "Svensk Excel använder <strong>semikolon</strong>",
    },
  ])(
    "viser formlerne og de samme tal i $locale",
    async ({ locale, heading, days, days194, months, semicolon }) => {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

      const html = renderToStaticMarkup(await DatoPage());

      expect(html).toContain(heading);
      expect(html).toContain("<code>=B1-A1</code>");
      expect(html).toContain(days);
      expect(html).toContain("<code>=DATEDIF(A1;B1;&quot;d&quot;)</code>");
      expect(html).toContain("<code>=DATEDIF(A1;B1;&quot;m&quot;)</code>");
      expect(html).toContain("<code>=DATEDIF(A1;B1;&quot;y&quot;)</code>");
      expect(html).toContain(days194);
      expect(html).toContain(months);
      expect(html).toContain(semicolon);
    }
  );

  // Helligdagssætningen på siden og i FAQ'en var skrevet i hånden og havde
  // mistet de tre danske dage efter påsken: den sagde "de ni danske
  // helligdage", mens værktøjet springer tolv over. Nu læses navnene ud af
  // `getHelligdage`, så et spørgsmål om antallet eller en manglende dag kun kan
  // fejle hvis selve listen er forkert — og den har sit eget sæt tests.
  test("siden og FAQ'en navngiver præcis de helligdage, værktøjet springer over", async () => {
    for (const locale of ["da", "se"] as const) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
      const liste = getHelligdage(2026, locale);
      const navne = liste.map((h) => h.name);
      const html = renderToStaticMarkup(await DatoPage());
      const faq = getPageData("dato", locale)!.faqItems;
      const svar = faq.find((i) => /helligdage|helgdagar/i.test(i.question))!.answer;

      for (const navn of navne) {
        expect(svar, `${locale}/${navn}`).toContain(navn);
      }
      // Antallet i teksten er læst fra listen, så det kan ikke være ni.
      const antal = new RegExp(
        locale === "da"
          ? `De ${liste.length} danske helligdage`
          : `Sveriges ${liste.length} r\u00f6dagar`,
      );
      expect(svar).toMatch(antal);
      expect(svar).not.toMatch(locale === "da" ? /de ni danske/i : /de fjorton r/i);
      // Side-tip-boxen skal også have hele listen, ellers er de to steder
      // igen begge rigtige hver for sig.
      for (const navn of navne) {
        expect(html, `tip/${locale}/${navn}`).toContain(navn);
      }
    }
  });

  test("begge sprog har de to nye spørgsmål i FAQ'en, som også går i JSON-LD", async () => {
    for (const locale of ["da", "se"] as const) {
      const faq = getPageData("dato", locale)!.faqItems;
      const excel = faq.filter((item) => item.question.includes("Excel"));

      // C98 lagde to (dage mellem datoer), C182 lagde den tredje (én måned).
      // Tællingen læses som "de to fra C98 er stadig der", så den ikke låser
      // det nye antal fast, men heller ikke kan miste et gammelt.
      expect(excel).toHaveLength(3);
      expect(excel[0].question).not.toBe(excel[1].question);
      for (const item of excel) {
        expect(item.answer).toContain("=B1-A1");
        expect(item.answer).toContain("DATEDIF");
      }
      // De to fra C98 er stadig de to fra C98: den ene sp\u00f8rger p\u00e5 "to
      // datoer", den anden p\u00e5 "datum". Begge findes i begge sprog.
      expect(excel[0].question).toMatch(/i Excel\?$/);
      expect(excel[1].question).toMatch(/^Kan Excel/);
    }
  });
  // Autocomplete 2026-09-29 14:2x. "antal dage i en m\u00e5ned" er nr. 1 under
  // "antal dage i en m\u00e5ned" (nr. 2 er Excel, nr. 3-5 er "pr m\u00e5ned
  // 2026"), og nr. 1 under "hvor mange dage i en m\u00e5ned" (nr. 2 er "uden
  // weekender"). Svensk sp\u00f8rger det samme: "antal dagar i en m\u00e5nad
  // excel" og "hur m\u00e5nga arbetsdagar i en m\u00e5nad". /dato svarede p\u00e5
  // \u00e5ret ("1 \u00e5r = 365 dage") men aldrig p\u00e5 m\u00e5neden: 0
  // forekomster af "i en m\u00e5ned"/"i en m\u00e5nad" p\u00e5 begge dom\u00e6ner.
  test.each([
    {
      locale: "da" as const,
      monthHeading: "Hvor mange dage er der i en m\u00e5ned?",
      yearHeading: "Hvor mange dage er der i et \u00e5r?",
      excelHeading: "S\u00e5dan t\u00e6ller du dage i en m\u00e5ned i Excel",
      name: "januar",
      otherName: "januari",
      arbejdsdageKolonne: "Arbejdsdage",
      ugeKolonne: "Weekenddage",
      start: "2026-02-01",
      next: "2026-03-01",
      result: "<strong>28 dage</strong>",
      yearDays: "<strong>365 dage</strong>",
      faeld: "28. februar, f\u00e5r du 27",
    },
    {
      locale: "se" as const,
      monthHeading: "Hur m\u00e5nga dagar \u00e4r det i en m\u00e5nad?",
      yearHeading: "Hur m\u00e5nga dagar \u00e4r det i ett \u00e5r?",
      excelHeading: "S\u00e5 r\u00e4knar du ut dagar i en m\u00e5nad i Excel",
      name: "januari",
      otherName: "januar",
      arbejdsdageKolonne: "Arbetsdagar",
      ugeKolonne: "Veckoslut",
      start: "2026-02-01",
      next: "2026-03-01",
      result: "<strong>28 dagar</strong>",
      yearDays: "<strong>365 dagar</strong>",
      faeld: "28 februari f\u00e5r du 27",
    },
  ])(
    "$locale svarer p\u00e5 m\u00e5nedens l\u00e6ngde, arbejdsdage og \u00e5rstal",
    async (t) => {
      vi.mocked(getLocale).mockResolvedValue(t.locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(t.locale));

      const html = renderToStaticMarkup(await DatoPage());

      expect(html).toContain(`<h2>${t.monthHeading}</h2>`);
      expect(html).toContain(`<h2>${t.yearHeading}</h2>`);
      expect(html).toContain(`<h3>${t.excelHeading}</h3>`);
      // Alle tolv m\u00e5neder i eget sprog, l\u00e6st fra modulet s\u00e5 en navneliste i
      // testen ikke kan komme i mellemkrig med \u00e5rsagen \u2014 "marts" er dansk og
      // "mars" er svensk, og de to ligger i hver sin celle.
      for (const r of maanederITaar(2026, t.locale)) {
        expect(html).toContain(`<th scope="row">${r.name}</th>`);
      }
      // Og det andet sprog m\u00e5 ikke l\u00e6gge ind. Ord-gr\u00e6nser, fordi
      // "februari" indeholder "februar" \u2014 det er C121's "bak\u00e5t"/"n\u00e4r"-f\u00e6lde.
      // Kun de navne der faktisk er forskellige. "april", "maj", "juni", "juli",
      // "september" og "oktober" hedder det samme p\u00e5 begge sprog, s\u00e5 en
      // l\u00e5s over hele listen ville kr\u00e6ve, at de forsvandt.
      const andet = maanederITaar(2026, t.locale === "da" ? "se" : "da");
      const egen = new Set(maanederITaar(2026, t.locale).map((r) => r.name));
      const forskellige = andet.filter((r) => !egen.has(r.name));
      expect(forskellige.length).toBeGreaterThan(0);
      for (const r of forskellige) {
        expect(html).not.toContain(`>${r.name}</th>`);
      }
      // Det er den kolonne, der besvarer "antal dage i en m\u00e5ned uden weekender".
      expect(html).toContain(`<th>${t.arbejdsdageKolonne}</th>`);
      expect(html).toContain(`<th>${t.ugeKolonne}</th>`);
      // Regnestykket: dagen *efter* m\u00e5nedens sidste dag, med f\u00e6lden skrevet ud.
      expect(html).toContain(`<code>${t.start}</code>`);
      expect(html).toContain(`<code>${t.next}</code>`);
      expect(html).toContain(t.result);
      expect(html).toContain(t.yearDays);
      // F\u00e6lden m\u00e5 v\u00e6re skrevet ud, ellers er formlen et r\u00e5d.
      // JSX folder linjeskiftet i et tekstnode til ét mellemrum, s\u00e5 l\u00e6ses den
      // som den lyder i markupken og ikke som den staar i kilden.
      expect(html).toContain(t.faeld);
    }
  );

  test("de tolv m\u00e5neder summerer til de tal, siden selv skriver i \u00e5rs-tallene", async () => {
    // Tabellen og de to sidste bullets i "Nyttige datofakta" kommer fra samme
    // kald, s\u00e5 et br\u00fdt tal kan ikke ligge i den ene og ikke i den anden.
    for (const locale of ["da", "se"] as const) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
      const html = renderToStaticMarkup(await DatoPage());
      const raekker = maanederITaar(2026, locale);
      const sumDage = raekker.reduce((s, r) => s + r.dage, 0);
      const sumArbejdsdage = raekker.reduce((s, r) => s + r.arbejdsdage, 0);

      // "dage" p\u00e5 dansk og "dagar" p\u00e5 svensk \u2014 l\u00e6ses fra modulet, fordi
      // en h\u00e5ndskrevet ordliste i testen er en m\u00e5lefejl, der gemmer sig i
      // den svenska arm.
      const dageOrd = locale === "da" ? "dage" : "dagar";
      expect(sumDage).toBe(365);
      expect(html).toContain(`<strong>${sumDage} ${dageOrd}</strong>`);
      // 251 dansk, 252 svensk \u2014 fordi danskerne har kristi himmelfartsdag og
      // 2. pinsedag som hverdage i 2026, og svenskerne ikke har dem.
      expect(sumArbejdsdage).toBe(locale === "da" ? 251 : 252);
      expect(html).toContain(
        locale === "da" ? `${sumArbejdsdage} arbejdsdage` : `${sumArbejdsdage} arbetsdagar`
      );
      // Gennemsnittet m\u00e5 skrives med \u00e5, fordi det er et br\u00f8kt tal, ikke en m\u00e5ned.
      expect(html).toContain(`30,44 ${dageOrd}`);
    }
  });

  test("hver m\u00e5ned har pr\u00e6cis de tal, eksempelmodulet regner", async () => {
    // Renderer tabellen r\u00e5 og l\u00e6ser den d\u00e5, s\u00e5 en r\u00e6kke der springer
    // en m\u00e5ned over ikke kan gemme sig i en l\u00e6ngde-t\u00e6lling.
    for (const locale of ["da", "se"] as const) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
      const html = renderToStaticMarkup(await DatoPage());
      const raekker = maanederITaar(2026, locale);
      const forventet = raekker
        .map((r) => `<th scope="row">${r.name}</th><td>${r.dage}</td><td>${r.arbejdsdage}</td><td>${r.weekenddage}</td>`)
        .join("</tr><tr>");
      expect(html).toContain(forventet);
    }
  });

  test("begge sprog har de fire nye sp\u00f8rgsm\u00e5l i FAQ'en, som ogs\u00e5 g\u00e5r i JSON-LD", async () => {
    for (const locale of ["da", "se"] as const) {
      const faq = getPageData("dato", locale)!.faqItems;
      const maaned = faq.filter((i) => /en m\u00e5ned|en m\u00e5nad/.test(i.question));
      expect(maaned.length).toBeGreaterThanOrEqual(2);
      for (const item of maaned) expect(item.answer).toMatch(/30,44|28|31/);
      const aar = faq.filter((i) => /et \u00e5r|ett \u00e5r/.test(i.question));
      expect(aar).toHaveLength(1);
      expect(aar[0].answer).toContain("365");
      expect(aar[0].answer).toContain("366");
      const excel = faq.filter((i) => /Excel/.test(i.question));
      // To fra C98 plus den nye m\u00e5ned-formel.
      expect(excel).toHaveLength(3);
      const maanedExcel = excel.filter((i) => /m\u00e5ned|m\u00e5nad/.test(i.question));
      expect(maanedExcel).toHaveLength(1);
      expect(maanedExcel[0].answer).toContain("=B1-A1");
    }
  });

  test("de svenske m\u00e5nedsnavne l\u00e6gger ikke ind i den danske side", async () => {
    // "februar" er en delstreng i "februari", s\u00e5 l\u00e5set m\u00e5 l\u00e6se p\u00e5
    // cellen (">februar</th>") og ikke p\u00e5 hele HTML'en.
    for (const [locale, fejl] of [["da", "februari"], ["se", "februar"]] as const) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
      const html = renderToStaticMarkup(await DatoPage());
      expect(html).not.toContain(`>${fejl}</th>`);
    }
  });
});

// GSC's to største søgninger på `/dato` (2026-08-30 → 09-27) er "hvor mange
// dage er der til 1 december" (1.131 visninger, pos. 5) og "hvor mange dage
// er der til den 24 december" (1.013, pos. 5). Listen linkede til de 15
// dage-til-sider med spørgsmålsteksten alene — hverken antallet eller datoen
// stod på siden der rangerede, så hele svaret lå på undersiden.
describe("dato page — dage-til-listen svarer selv", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-29T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("hver række i listen bærer dagens antal og datoen", async () => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("Tallet nedenfor er dagens antal dage");
    for (const event of getDageTilEvents("da")) {
      const answer = getDageTilAnswer(event, "da", new Date());
      const target = formatTargetDate(answer.targetDate, "da");
      const li = new RegExp(
        `href="/dage-til/${dageTilArm(event, "da").slug}".*?${target}.*?${answer.days} dage`,
        "s",
      );
      expect(html, event.id).toMatch(li);
    }
  });

  // Tallene i listen skal være de samme som på undersiderne, ellers ville de
  // to sider svare forskelligt på det samme spørgsmål. `getDageTilAnswer` er
  // den funktion begge læser, så det er ikke et krav om identisk markup men
  // om ét tal: 63 dage til 1. december den 29. september 2026.
  test("listens tal er de samme som /dage-til-sidens eget svar", async () => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));

    const today = new Date();
    const december = getDageTilEvents("da").find((e) => dageTilArm(e, "da").slug === "1-december")!;
    const answer = getDageTilAnswer(december, "da", today);
    expect(answer.days).toBe(63);

    const html = renderToStaticMarkup(await DatoPage());
    expect(html).toContain("<strong>63 dage</strong>");
    expect(html).toContain("9 uger");
  });

  test("antal og uger følger dagen, så listen kan ikke stå med gårsdags svar", async () => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));

    const foer = renderToStaticMarkup(await DatoPage());
    vi.setSystemTime(new Date("2026-09-30T12:00:00Z"));
    const senere = renderToStaticMarkup(await DatoPage());

    expect(foer).toContain("<strong>63 dage</strong>");
    expect(senere).toContain("<strong>62 dage</strong>");
    expect(senere).not.toContain("<strong>63 dage</strong>");
  });

  test("se skriver dagar, dagar kvar och veckor — aldrig dage", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("Talet nedan är dagens antal dagar");
    expect(html).toMatch(/href="\/dagar-till\/1-december"[\s\S]*?1 december 63 dagar/);
    expect(html).toContain("9 veckor");
    // Dansk enhed på den svenska lista vilde være en lækage.
    expect(html).not.toMatch(/\d+ dage(?![a-zåäö])/);
  });

  test("no faar ingen dage-til-rækker og ingen talsvar", async () => {
    vi.mocked(getLocale).mockResolvedValue("no");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("no"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).not.toContain("/dage-til/");
    expect(html).not.toContain("Tallet nedenfor er dagens antal dage");
  });

  // Overskriften er den eneste sætning på listen, der ikke er genereret fra
  // `dage-til.ts`. Den læser på beraknare.se — sitets næststørste side med
  // 101.580 visninger — så et relativt led uden "som" gør hele sætningen
  // ungrammatisk: svensk kræver "datum som folk räknar ner till", mens
  // dansk godt kan droppe stedordet ("datoer folk tæller ned til"). Derfor
  // låses den i hver sprogarm, så en fremtidig overskrift ikke kan låne den
  // andens form.
  test("begge overskrifter bruger den rigtige form for sit sprog", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const svensk = renderToStaticMarkup(await DatoPage());
    expect(svensk).toContain("Hur många dagar är det till …?");
    expect(svensk).not.toContain("Datum som folk oftast räknar ner till");

    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
    const dansk = renderToStaticMarkup(await DatoPage());
    expect(dansk).toContain("Hvor mange dage er der til …?");
    expect(dansk).not.toContain("Datoer folk oftest tæller ned til");
    expect(dansk).not.toContain("Datum");
  });

  // Listen lå i `getDageTilEvents`-rækkefølge, altså begivenhedernes rækkefølge
  // og ikke datoernes. Målt 3/10 på den live side: Halloween (28 dage) lå som
  // række 13, «1. december» (59 dage) som række 6, og «fra påske til pinse»
  // (169 dage) lå oven i «påskedag» (176 dage) — de var ikke engang sorteret
  // efter tallet. Sidens to største søgninger er «hvor mange dage er der til
  // 1 december» (1.219 visninger, pos. 5) og «… til den 24 december» (1.001,
  // pos. 5), og læseren skulle rulle forbi tolv andre datoer for at se sit
  // eget svar. Porten læser rækkerne i den rækkefølge de står i HTML'en og
  // dømmer, at antallet falder, så den kan ikke gå fra den synlige tekst.
  test("nedtællingslisten står med den nærmeste dato først", async () => {
    for (const locale of ["da", "se"] as const) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
      const html = renderToStaticMarkup(await DatoPage());

      // Kun rækkerne i selve listen: de ligger efter overskriften og før
      // afsnittet om ofte stillede spørgsmål, så de øvrige månedstal på
      // siden ikke kan blande sig i.
      const start = html.indexOf("<ul><li><a href=");
      const slut = html.indexOf("</ul>", start);
      expect(start, `${locale}: listen ikke fundet`).toBeGreaterThan(-1);
      // React skriver `<!-- -->` mellem et interpoleret tal og den ordlyd der
      // følger, så markeringen strippes før der læses. Hovedtallet er det
      // **første** «… dage»/«… dagar» i rækken; det næste står i parentesen
      // («59 dage (8 uger og 3 dage)»), og på dansk står det i `<strong>` mens
      // den svenske række ikke har strong. Rækkerne læses derfor fra den
      // synlige tekst, som er det læseren ser.
      const liste = html.slice(start, slut).replaceAll("<!-- -->", "");
      const dage = liste
        .split("</li>")
        .map((li) => li.match(/([\d.,]+)\s*(?:dage|dagar)/)?.[1])
        .filter((n): n is string => n !== undefined)
        .map((n) => Number(n.replace(/[.,]/g, "")));

      expect(dage.length, `${locale}: ingen rækker`).toBeGreaterThan(10);
      // Hver rækkes antal skal være det `getDageTilAnswer` giver den samme dag,
      // så listen heller ikke kan ligge forude i forhold til sit eget regnestykke.
      const forventet = getDageTilEvents(locale)
        .map((event) => getDageTilAnswer(event, locale, new Date()).days)
        .sort((a, b) => a - b);
      expect(dage, `${locale}: rækkerne er ikke de samme tal`).toEqual(forventet);
      expect(dage, `${locale}: listen er ikke sorteret stigende`).toEqual(
        [...dage].sort((a, b) => a - b)
      );
    }
  });

  // Restdagen i parentesen var skrevet "dage"/"dagar" uden at føje et tal til,
  // så juledagen læste "12 uger og 1 dage" den dag 87 dage lå forude — 87 dage
  // er 12 uger *og 1 dag*. Hovedtallet og ugerne blev bøjet, restdagen ikke,
  // og det rammer halvdelen af alle rækker alt efter hvilken ugedag dagen har.
  // Porten regner hele parentesen fra `getDageTilAnswer` for alle rækker, så
  // den kan ikke gå fra sit eget tal, og den låser "1 dage"/"1 dagar" væk.
  test("hver række bøjer både antal, uge og restdage i sit eget sprog", async () => {
    const SPROG = {
      da: { uge: "uge", uger: "uger", og: "og", dage: "dage" },
      se: { uge: "vecka", uger: "veckor", og: "och", dage: "dagar" },
    } as const;

    for (const locale of ["da", "se"] as const) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
      const html = renderToStaticMarkup(await DatoPage());
      const s = SPROG[locale];

      for (const event of getDageTilEvents(locale)) {
        const a = getDageTilAnswer(event, locale, new Date());
        const uge = a.weeks === 1 ? s.uge : s.uger;
        const rest =
          a.daysLeft === 0 ? "" : ` ${s.og} ${a.daysLeft} ${a.daysLeft === 1 ? "dag" : s.dage}`;
        expect(html, `${locale}/${event.id}`).toContain(`(${a.weeks} ${uge}${rest})`);
      }

      // Restdagen bøjes, så listen aldrig siger "og 1 dage"/"och 1 dagar".
      // (Siden har ændre steder med "1 uge = 7 dage", som er korrektdansk.)
      const fejlForm = locale === "se" ? " och 1 dagar)" : " og 1 dage)";
      expect(html.includes(fejlForm), `${locale}: ${fejlForm}`).toBe(false);
    }
  });
});

describe("dato page — pinse-intervallerne", () => {
  // "hvor mange dage er der fra påske til pinse" og "hvor mange dage er der i
  // pinsen" er de to øvrige autocomplete-træffere under pinse-klyngen. De er
  // interval-spørgsmål, så svaret skal ligge på /dato ved siden af måneds- og
  // årstabellen — ikke på en dage-til-side, der ville se ud som en nedtælling.
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-30T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("da svarer på begge interval-spørgsmål med de regnede tal", async () => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("Hvor mange dage er der fra påske til pinse?");
    expect(html).toContain("Hvor mange dage er der i pinsen?");
    // 49 og 50 fra påskedagen, 39 til kristi himmelfartsdag.
    expect(html).toContain("49 dage fra påskedagen til pinsedagen");
    expect(html).toContain("50 dage til 2.");
    expect(html).toMatch(/påskedag \+ ?39/);
    // Pinseperioden: 12 kalenderdage, 6 arbejdsdage, 6 dage fri, 3 helligdage.
    expect(html).toContain("12 kalenderdage");
    expect(html).toContain("6 arbejdsdage");
    expect(html).toContain("6 dage uden arbejde");
    expect(html).toContain("Kristi himmelfartsdag, Pinsedag, 2. pinsedag");
  });

  test("da tabellen viser de tre dage med dato, ugedag og påske-afstand", async () => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));

    const html = renderToStaticMarkup(await DatoPage());

    // Næste pinse efter 30. september 2026 er 2027: påskedagen 28. marts.
    const pinse = pinseInterval(2027, "da");
    expect(html).toContain("Påskedagen i 2027 er 28. marts");
    for (const dag of pinse.dage) {
      expect(html, dag.navn).toContain(dag.navn);
      expect(html, dag.navn).toContain(
        formatTargetDate(
          new Date(Date.UTC(dag.date.getFullYear(), dag.date.getMonth(), dag.date.getDate())),
          "da"
        )
      );
    }
    expect(html).toContain("torsdag");
    expect(html).toContain("søndag");
    expect(html).toContain("mandag");
  });

  test("da linker videre til begge pinsesider", async () => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain('href="/dage-til/kristi-himmelfartsdag"');
    expect(html).toContain('href="/dage-til/2-pinsedag"');
  });

  test("se svarar på samma två frågor på svenska", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("Hur många dagar är det mellan påsk och pingst?");
    expect(html).toContain("Hur många dagar är det i pingsten?");
    expect(html).toContain("49 dagar från påskdagen till pingstdagen");
    // Annandag pingst är inte en röd dag i Sverige — det skal stå i tabellen.
    expect(html).toMatch(/Annandag pingst[\s\S]{0,400}?Nej/);
    expect(html).toContain("7 arbetsdagar");
    expect(html).toContain("5 dagar utan arbete");
    expect(html).toContain('href="/dagar-till/kristi-himmelsfardsdag"');
    expect(html).toContain('href="/dagar-till/pingstdagen"');
  });

  test("no får hverken interval-teksten eller danske pinse-links", async () => {
    vi.mocked(getLocale).mockResolvedValue("no");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("no"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).not.toContain("fra påske til pinse");
    expect(html).not.toContain("mellan påsk och pingst");
    expect(html).not.toContain("/dage-til/");
    expect(html).not.toContain("/dagar-till/");
  });

  test("overskriftstal fra året påske står i tabellen, ikke i en fast streng", async () => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));

    const html = renderToStaticMarkup(await DatoPage());

    // Går pinseintervallet over i 2028, må tabellen sige 2028 — ellers står der
    // et gammelt årstal på en side, der regner om hver dag.
    vi.setSystemTime(new Date("2027-09-30T12:00:00Z"));
    const næste = renderToStaticMarkup(await DatoPage());
    expect(næste).toContain("Påskedagen i 2028 er 16. april");
    expect(næste).not.toContain("Påskedagen i 2027 er");
  });

  test("\"/dato\" svarer p\u00e5 det m\u00e5ned, kalenderen st\u00e5r i", async () => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
    vi.setSystemTime(new Date("2026-07-21T12:00:00Z"));

    const html = renderToStaticMarkup(await DatoPage());

    // Autocomplete: "hvor mange dage er der i juli 2026" og "hvor mange dage
    // er der i den her m\u00e5ned". Tabellen svarer kun indirecte, s\u00e5 dette
    // afsnit skal give m\u00e5nedens l\u00e6ngde og dagens placaring i den.
    expect(html).toContain("Hvor mange dage er der i den her m\u00e5ned?");
    expect(html).toContain("juli 2026 har <strong>31 dage</strong>");
    expect(html).toContain("m\u00e5nedens 21. dag");
    expect(html).toContain("<strong>10 dage tilbage</strong>");
    // Excel-formlen skal give pr\u00e6cis samme antal som br\u00f8dteksten.
    expect(html).toContain("=DATEDIF(2026-07-01;2026-07-31;&quot;d&quot;)+1");
  });

  test("den her m\u00e5ned l\u00e6ser dagens dato i dansk tid, ikke i serverens", async () => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
    // 1. juli 2026 kl. 00:30 dansk tid er 30. juni kl. 22:30 UTC. En
    // UTC-server ville skrive "juni" p\u00e5 en side, der t\u00e6ller dagene i
    // m\u00e5neden.
    vi.setSystemTime(new Date("2026-06-30T22:30:00Z"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("juli 2026 har <strong>31 dage</strong>");
    expect(html).toContain("m\u00e5nedens 1. dag");
  });

  // Svensk GSC (1/10) har "antal dagar i en m\u00e5nad" og "hur m\u00e5nga
  // dagar i en m\u00e5nad" blandt de fire st\u00f6rste s\u00f8gninger p\u00e5
  // beraknare.se/dato (103.776 visninger, 97 klik, CTR 0,1 %, pos. 8,1).
  // Svensk autocomplete sp\u00f6rger det samme som den danske: "antal dagar
  // i en m\u00e5nad" (nr. 2 efter Excel) og "hur m\u00e5nga arbetsdagar i en
  // m\u00e5nad". Den danske side fik derfor et eget afsnit med m\u00e5nedens
  // l\u00e6ngde og dagens placering i den \u2014 tabellen med tolv r\u00e6kker
  // svarer kun indirecte, s\u00e5 l\u00e6seren skal selv finde sin m\u00e5ned.
  // Svensk side havde det samme afsnit manglende, selv om
  // `denneMaanedEksempel` og `maanedNavn` allerede findes p\u00e5 svensk.
  test("se svarer p\u00e5 'antal dagar i en m\u00e5nad' med m\u00e5nedens l\u00e6ngde og dagens placering", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    vi.setSystemTime(new Date("2026-07-21T12:00:00Z"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("Hur m\u00e5nga dagar \u00e4r det i den h\u00e4r m\u00e5naden?");
    expect(html).toContain("juli 2026 har <strong>31 dagar</strong>");
    // M\u00e5nedens svenska navn skal komme fra `maanedNavn(7, "se")`, derfor
    // er det "juli" p\u00e5 begge sprog \u2014 men ikke den danske "juli 2026 har"
    // med det danske ord "dage" eller det danske "m\u00e5nedens".
    expect(html).toContain("m\u00e5nadens 21. dag");
    expect(html).toContain("<strong>10 dagar kvar</strong>");
    // Excel-formlen skal give pr\u00e6cis samme antal som br\u00f6dteksten. Svensk
    // Excel bruger semikolon som skilletegn (komma er decimaltegn) \u2014 samme
    // afgr\u00e6nser som den danske, s\u00e5 formlen er identisk p\u00e5 begge sprog.
    expect(html).toContain("=DATEDIF(2026-07-01;2026-07-31;&quot;d&quot;)+1");
  });

  // Samme fejltype som restdagen ved ugerne, men i det nye afsnit: den
  // danske side skrev "1 dage tilbage", den svenske "1 dagar kvar", fordi
  // antallet blev skrevet med flertal uden at blive b\u00f8jet. 30. september
  // er den eneste dag i m\u00e5neden, der giver pr\u00e6cis 1 (m\u00e5neden er 30
  // dage, s\u00e5 30 - 29 = 1).
  test.each([
    { locale: "da" as const, en: "<strong>1 dag tilbage</strong>", to: "<strong>1 dage tilbage</strong>" },
    { locale: "se" as const, en: "<strong>1 dag kvar</strong>", to: "<strong>1 dagar kvar</strong>" },
  ])("$locale b\u00f8jer m\u00e5nedens sidste dag i ental", async ({ locale, en, to }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
    vi.setSystemTime(new Date("2026-09-29T12:00:00Z"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain(en);
    expect(html).not.toContain(to);
  });

  // Og flertallet m\u00e5 ikke forsvinde: 21. juli har 10 dage tilbage.
  test.each([
    { locale: "da" as const, s: "<strong>10 dage tilbage</strong>" },
    { locale: "se" as const, s: "<strong>10 dagar kvar</strong>" },
  ])("$locale beh\u00e6lder flertal i m\u00e5nedens dage tilbage", async ({ locale, s }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
    vi.setSystemTime(new Date("2026-07-21T12:00:00Z"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain(s);
  });

  // Sidens egen hovedtal kan ogsaa blive 1: den 30. december er der pr\u00e6cis
  // 1 dag tilbage af aaret. Skrevet med flertal giver det "1 dage tilbage af
  // 2026" (da) og "1 dagar kvar av 2026" (se) — de to strenge, der sto i
  // markupken da opgaven startede.
  test.each([
    { locale: "da" as const, en: "<strong>1 dag tilbage af 2026</strong>" },
    { locale: "se" as const, en: "<strong>1 dag kvar av 2026</strong>" },
  ])("$locale b\u00f8jer \u00e5rets sidste dag i ental", async ({ locale, en }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
    vi.setSystemTime(new Date("2026-12-30T12:00:00Z"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain(en);
    expect(html).not.toContain("1 dage tilbage");
    expect(html).not.toContain("1 dagar kvar");
    // Restdagen ved ugerne er ogsaa 1 den 30. december.
    expect(html).toContain(locale === "da" ? "0 uger og 1 dag." : "0 veckor och 1 dag.");
  });

  test("tallet foelger dagen, saa siden ikke kan staa med gaarsdags svar", async () => {
    vi.setSystemTime(new Date("2026-12-31T08:00:00Z"));
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("<h2>Hvor mange dage er der tilbage af 2026?</h2>");
    expect(html).toContain("<strong>0 dage tilbage af 2026</strong>");
  });

  test("se-l\u00e6sningen l\u00e6ser dagens dato i dansk tid, som den svenske side g\u00f8r", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    // 1. juli 2026 kl. 00:30 dansk tid er 30. juni kl. 22:30 UTC. Begge
    // `/dato`-sider bruger `dagITidszone`, s\u00e5 det er samme dag som den
    // danske side \u2014 men kun den danske havde porten.
    vi.setSystemTime(new Date("2026-06-30T22:30:00Z"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("juli 2026 har <strong>31 dagar</strong>");
    expect(html).toContain("m\u00e5nadens 1. dag");
  });
});
