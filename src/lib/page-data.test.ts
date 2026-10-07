import { describe, test, expect } from "vitest";
import { getPageData, getAvailableSlugs } from "./page-data";
import { getCalculatorHrefs, isCalculatorAvailable } from "./calculator-list";
import { beregnPromille, PROMILLEGRANSE, PROMILLEGRANSE_UDLAND } from "./promille";
import { genstandeTilGraense } from "./promille-genstande";
import { sammenlignEnhedspris } from "./enhedspris";
import { TIDSZONER } from "./tidszone-reference";
import { forkortBrok } from "./brok";
import { alderLevet, formatDageLived } from "./alder-levet";
import { formatAlder } from "./alder-eksempler";
import { formatBelob, formatNumber, getIntlLocale } from "./format";
import { dageTilDecember } from "./dage-mellem-datoer";
import { iDagISidensTidszone } from "./lokal-dato";
import { annuitetsEksempel, hovedEksempel } from "./rente-eksempler";
import {
  EXCEL_ANDEL,
  PROCENT_10_AF_FAQ,
  PROCENT_15_AV_BELOEB,
  PROCENT_SKILLNAD_EKSEMPEL,
  RABAT_BELOEB,
  RABAT_EKSEMPEL,
  RABAT_SATS_UDLAET,
  procentAf,
  procentDifferens,
  procentForskel,
  rabatProcent,
} from "./procent";
import {
  PROCENTPOINT_EKSEMPEL,
  procentpointForskel,
  procentpointForskelFaqSvar,
  procentpointRelativ,
} from "./procentpoint";

// ─── /procent's rabat-FAQ. Forventningerne i de to nedenstående porte er
// *regnet* af de samme konstanter, som FAQ'en selv bygger sine svar af, så
// porten holder i begge retninger: et tal, der skrives forkert i sætningen,
// falder her, og en konstant der ændres, flytter forventningen med. Det er
// derfor tallene ikke er skrevet som strenge i testen — det ville kun låse det
// tal, der står der nu, uden at sige noget om hvor det kommer fra.
const talDa = (tal: number, decimaler = 0) =>
  formatNumber(tal, "da", { maximumFractionDigits: decimaler }).replace(/\u00a0/g, " ");
const talSe = (tal: number, decimaler = 0) =>
  formatNumber(tal, "se", { maximumFractionDigits: decimaler }).replace(/\u00a0/g, " ");

describe("procentens rabat-FAQ", () => {
  const nedsat = RABAT_EKSEMPEL.normalPris - RABAT_EKSEMPEL.nedsatPris;
  const rabat = rabatProcent(RABAT_EKSEMPEL.normalPris, RABAT_EKSEMPEL.nedsatPris);
  const modNy = procentForskel(RABAT_EKSEMPEL.normalPris, RABAT_EKSEMPEL.nedsatPris);

  const svar = (locale: "da" | "se", spoergsmaal: string) =>
    getPageData("procent", locale)!.faqItems.find((i) => i.question === spoergsmaal)?.answer;

  // Svensk autocomplete (hl=se&gl=se, 2026-09-30) svarer på "rabatt i procent"
  // med sju formuleringar. Fire af dem er egna frågor, og ingen af dem fandtes
  // i FAQ'en — selv om F2 gav beraknare.se hela afsnittet "Så här räknar du ut
  // rabatten i procent". /rabat er daOnly (calculator-list.ts:90), så
  // beraknare.se har ingen anden side, hvor frågan kan besvaras.
  test.each([
    "Hur stor är rabatten i procent?",
    "Hur mycket rabatt i procent får jag på en vara?",
    "Hur räknar man ut rabatt i procent i Excel?",
    "Vad är procentuell rabatt?",
  ])("den svenska FAQ'en svarer på %s", (spoergsmaal) => {
    expect(svar("se", spoergsmaal), spoergsmaal).toBeDefined();
  });

  // Hver af de fire rækker skal bære de tal, afsnittet over dem regner. Uden
  // denne port kan et tal skrives i sætningen og glide fra brødteksten, og
  // det er præcis den fejl, hele rabat-afsnitten er skrevet for at undgå.
  test("de svenske svar bærer de samme tal som afsnittet oven for dem", () => {
    const normalPris = talSe(RABAT_EKSEMPEL.normalPris);
    const nedsatPris = talSe(RABAT_EKSEMPEL.nedsatPris);
    const belob = talSe(RABAT_BELOEB);
    const sparer = talSe(procentAf(RABAT_BELOEB, RABAT_SATS_UDLAET));
    const betaler = talSe(RABAT_BELOEB - procentAf(RABAT_BELOEB, RABAT_SATS_UDLAET));

    // "hur stor är rabatten i procent" — de to priser, som i brødteksten.
    const stor = svar("se", "Hur stor är rabatten i procent?")!;
    expect(stor).toContain(`${normalPris} kr till ${nedsatPris} kr`);
    expect(stor).toContain(`${talSe(nedsat)} / ${normalPris} = ${talSe(rabat, 1)} procent`);

    // Excel-formlen skal give præcis samme rabat som formlen over den.
    const excel = svar("se", "Hur räknar man ut rabatt i procent i Excel?")!;
    expect(excel).toContain(`${normalPris} i A1 och ${nedsatPris} i B1 ger ${talSe(rabat, 1)} procent rabatt`);
    expect(excel).toContain(`=A1-B1, som ger ${talSe(nedsat)} kr`);

    // Begge de to tal, der ligner hinanden, skal stå i den samme sætning.
    const begreb = svar("se", "Vad är procentuell rabatt?")!;
    expect(begreb).toContain(`${talSe(nedsat)} kr är ${talSe(modNy, 1)} procent av det du betalar`);
    expect(begreb).toContain(`men rabatten är ${talSe(rabat, 1)} procent`);

    // Satstabellen: 33 % er ikke en tredjedel — samme påstand som på siden.
    const sats = svar("se", "Hur mycket rabatt i procent får jag på en vara?")!;
    expect(sats).toContain(
      `${RABAT_SATS_UDLAET} % rabatt på en vara för ${belob} kr är ${sparer} kr, så du betalar ${betaler} kr`
    );
    expect(sats).toContain(`en tredjedel av ${belob} kr är ${talSe(RABAT_BELOEB / 3, 2)} kr`);
    expect(sats).toContain(`så du hade betalat ${talSe(RABAT_BELOEB - RABAT_BELOEB / 3, 2)} kr`);
  });

  // Svensk skriver aldrig æ eller ø, så det er de to tegn, der afslører en
  // dansk sætning kopieret ind i den svenska blok — og det er sket før
  // (C71, "Færre personer" på /del-regning). Ord uden æ/ø fanges af den
  // næste linje, fordi de danske rækker indeholder dem.
  test("de nye svenske rækker er svenske, ikke danske", () => {
    for (const spoergsmaal of [
      "Hur stor är rabatten i procent?",
      "Hur mycket rabatt i procent får jag på en vara?",
      "Hur räknar man ut rabatt i procent i Excel?",
      "Vad är procentuell rabatt?",
    ]) {
      const svaret = svar("se", spoergsmaal)!;
      expect(svaret, spoergsmaal).not.toMatch(/[æø]/i);
      expect(svaret, spoergsmaal).not.toMatch(
        /tre trin|mellem to priser|nedsat pris|pris før|oprindelige pris/i
      );
    }
  });

  // Og modsætningen: de to danske rækker må ikke have svensk sætning ind.
  test("de danske rækker er danske, ikke svenske", () => {
    for (const spoergsmaal of [
      "Hvor stor er rabatten i procent?",
      "Hvordan regner man rabat i procent?",
    ]) {
      const svaret = svar("da", spoergsmaal)!;
      expect(svaret, spoergsmaal).toBeDefined();
      expect(svaret, spoergsmaal).not.toMatch(
        /hur stor|procentuell|rabattsats|och |från |vilken/i
      );
    }
  });

  // Tusindtalsseparatoren er den, fejlen ofte gemmer sig i: Intl bruger
  // U+00A0 på svensk, og resten af den svenske side bruger et almindeligt
  // mellemrum. U+00A0 i et JSON-LD-svar er usynligt i en diff og ændrer
  // strengen, så den testes her.
  test("de svenske tal bruger almindeligt mellemrum, ikke U+00A0", () => {
    for (const spoergsmaal of [
      "Hur stor är rabatten i procent?",
      "Hur mycket rabatt i procent får jag på en vara?",
    ]) {
      expect(svar("se", spoergsmaal), spoergsmaal).not.toMatch(/\u00a0/);
    }
  });
});

// /procent er sitets største side (152.615 visninger, 0,1 % CTR, pos. 7,4), og
// dens FAQ går direkte i Googles rich resultat. Svaret på "hvad er forskellen
// på procentpoint og procent" stod med alle fire tal som rå tekst, og det
// relative tal var forkert: sætningen siger selv at procent regnes på det
// gamle tal, så 22,1 % til 19,7 % er (19,7 - 22,1) / 22,1 = -10,9 %, ikke de
// -11,3 % der stod. Denne port dømmer det data-laget faktisk serverer, så
// håndskrevne tal — også i et nyt sprog — falder her.
describe("procentpoint-svaret i /procent's FAQ", () => {
  const fald = PROCENTPOINT_EKSEMPEL.valg[0];

  const svar = (locale: "da" | "se", spoergsmaal: string) =>
    getPageData("procent", locale)!.faqItems.find((i) => i.question === spoergsmaal)?.answer;

  test.each([
    ["da", "Hvad er forskellen på procentpoint og procent?"],
    ["se", "Vad är skillnaden på procentenheter och procent?"],
  ] as const)("%s: de to tal er de samme som tabellen på siden", (locale, spoergsmaal) => {
    // `Intl` skriver minus som U+2212 på svensk og som ASCII-bindestreg på
    // dansk, så porten bruger samme formatering som det svar den dømmer.
    const tal = locale === "se" ? talSe : talDa;
    const svarTekst = svar(locale, spoergsmaal)!;
    expect(svarTekst).toBe(procentpointForskelFaqSvar(locale));
    expect(svarTekst).toContain(`${tal(fald.gammel, 1)} %`);
    expect(svarTekst).toContain(tal(procentpointForskel(fald.gammel, fald.ny), 1));
    expect(svarTekst).toContain(`${tal(procentpointRelativ(fald.gammel, fald.ny), 1)} %`);
  });

  test("ingen af de to svar indeholder det gamle, ugerede -11,3 %", () => {
    expect(svar("da", "Hvad er forskellen på procentpoint og procent?")).not.toContain("11,3");
    expect(svar("se", "Vad är skillnaden på procentenheter och procent?")).not.toContain("11,3");
  });
});

describe("getPageData", () => {
  test("returns data for known DA slug", () => {
    const data = getPageData("bmi", "da");
    expect(data).toBeDefined();
    expect(data!.slug).toBe("bmi");
    expect(data!.metaTitle).toBeTruthy();
    expect(data!.faqItems.length).toBeGreaterThan(0);
  });

  test("returns data for known SE slug", () => {
    const data = getPageData("bmi", "se");
    expect(data).toBeDefined();
    expect(data!.slug).toBe("bmi");
  });

  test("returns data for known NO slug", () => {
    const data = getPageData("bmi", "no");
    expect(data).toBeDefined();
    expect(data!.slug).toBe("bmi");
  });

  test("BMI metadata and child FAQ are adult-oriented", () => {
    const expectedAdultWord = { da: "voksne", no: "voksne", se: "vuxna" } as const;

    for (const locale of ["da", "no", "se"] as const) {
      const data = getPageData("bmi", locale)!;
      const adultWord = expectedAdultWord[locale];
      expect(data.title.toLowerCase()).toContain(adultWord);
      expect(data.metaTitle.toLowerCase()).toContain(adultWord);
      expect(data.metaDescription.toLowerCase()).toContain(adultWord);
      expect(data.metaDescription).toContain("1,75²");
      expect(data.metaDescription).not.toContain("1,75m");
      expect(data.ogTitle.toLowerCase()).toContain(adultWord);
      expect(data.ogDescription.toLowerCase()).toContain(adultWord);
      expect(data.schemaName.toLowerCase()).toContain(adultWord);
      expect(data.schemaDescription.toLowerCase()).toContain(adultWord);
      const childFaq = data.faqItems.find((item) => /børn|barn|children/i.test(item.question));
      expect(childFaq?.answer).toMatch(/percentil/i);
      expect(childFaq?.answer).not.toMatch(/persentil/i);
    }
  });

  test.each([
    {
      locale: "da" as const,
      title: "Procentberegner: 10 % af et tal, rabat og stigning/fald",
      intent: "10 procent af",
      descriptionAnswer: "Beregn procent af et tal",
      metaAnswer: "rabatten på 1125 kr",
    },
    {
      locale: "se" as const,
      title: "Procenträknare: 10 % av ett tal, rabatt och ökning/minskning",
      intent: "10 procent av",
      descriptionAnswer: "Beräkna procent av ett tal",
      metaAnswer: "rabatten på 1125 kr",
    },
  ])(
    "has answer-first percentage metadata for $locale",
    ({ locale, title, intent, descriptionAnswer, metaAnswer }) => {
      const data = getPageData("procent", locale)!;

      expect(data.metaTitle).toBe(title);
      expect(data.metaTitle.length).toBeLessThanOrEqual(60);
      expect(data.description).toContain(descriptionAnswer);
      expect(data.metaDescription).toContain(metaAnswer);
      expect(data.metaDescription.length).toBeLessThanOrEqual(160);
      expect(data.ogTitle).toBe(title);
      expect(data.ogDescription).toContain(metaAnswer);
      expect(data.schemaDescription).toContain(intent);
    },
  );

  // GSC 2026-08-30 → 2026-09-27: /procent har 150.148 visninger og 98 klik
  // (CTR 0,1 %, pos. 7,4) — GSC's største enkeltvisningstal på sitet, og næsten
  // intet af det er klikket. Autocomplete (hl=da, gl=dk, 2026-09-30) viser at
  // langhalen er opdelt i opgaver og ikke i én: "procent beregner stigning",
  // "procent rabat beregner", "procent fald beregner" og "procent vækst
  // beregner" ligger alle under "procent beregner". En titel der kun lovede ét
  // eksempel ("10 % af 250 kr. = 25 kr.") matcher derfor højst én af dem — de
  // øvrige ni har ingen grund til at blive klikket.
  test("/procent-titlen dækker opgaverne i den danske langhale", () => {
    const { metaTitle } = getPageData("procent", "da")!;

    for (const opgave of ["10 % af", "stigning", "fald", "rabat"]) {
      expect(metaTitle.toLowerCase()).toContain(opgave);
    }
  });


  test.each([
    {
      locale: "da" as const,
      title: "Renteberegner: 100.000 kr. i 5 år = 1.887 kr./md.",
      loanType: "annuitetslån",
      maaned: "1.887",
      samlet: "13.227",
    },
    {
      locale: "se" as const,
      title: "Räntekalkylator: 100 000 kr i 5 år = 1 887 kr/mån",
      loanType: "annuitetslån",
      maaned: "1 887",
      samlet: "13 227",
    },
    {
      locale: "no" as const,
      title: "Rentekalkulator: 100 000 kr i 5 år = 1 887 kr/md",
      loanType: "annuitetslån",
      maaned: "1 887",
      samlet: "13 227",
    },
  ])(
    "has answer-first loan metadata for $locale",
    ({ locale, title, loanType, maaned, samlet }) => {
      const data = getPageData("renteberegner", locale)!;

      expect(data.metaTitle).toBe(title);
      expect(data.metaTitle.length).toBeLessThanOrEqual(60);
      expect(data.description).toContain(maaned);
      expect(data.description).toContain(samlet);
      expect(data.description).toContain(loanType);
      expect(data.metaDescription).toContain(maaned);
      expect(data.metaDescription).toContain(samlet);
      expect(data.metaDescription.length).toBeLessThanOrEqual(160);
      expect(data.ogTitle).toBe(title);
      expect(data.ogDescription).toContain(maaned);
      expect(data.ogDescription).toContain(samlet);
      expect(data.schemaDescription).toContain(loanType);

      // Tusindtalsseparatoren er sprogets, ikke dansks. Svensk og norsk skriver
      // 1 887 med mellemrum, så en mutation der formatterer med `da` på et
      // svensk eller norsk felt bliver rød her.
      if (locale !== "da") {
        expect(data.description).not.toContain("1.887");
        expect(data.ogDescription).not.toContain("13.227");
      }
    },
  );

  /**
   * Beløbene i `/renteberegner`s titel, metadata og FAQ skal komme fra
   * `rente-eksempler`, ikke fra håndskrevet tekst — de stod i 19 felter på tre
   * domæner, og `FAQSchema` læser præcis `faqItems`, så de var tal i Googles
   * svar. Porten dømmer de afledte tal, så en mutation i modulet er rød.
   */
  test("renteberegners lån-tal er regnet af modulet, ikke citeret", () => {
    const hoved = hovedEksempel();
    const formel = annuitetsEksempel();

    for (const locale of ["da", "se", "no"] as const) {
      const data = getPageData("renteberegner", locale)!;
      const hovedstol = formatBelob(hoved.hovedstol, locale);
      const maaned = formatBelob(hoved.maanedligBetalning, locale);
      const rente = formatBelob(hoved.samletRante, locale);
      const svar = data.faqItems.find((f) => f.question.includes(hovedstol));

      expect(svar, `${locale}: FAQ'en skal spørge til beløbet`).toBeDefined();
      expect(svar!.answer).toContain(maaned);
      expect(svar!.answer).toContain(rente);
      expect(svar!.answer).toContain(String(Math.round(hoved.antalMaaneder)));
      expect(data.description).toContain(hovedstol);

      // Formel-eksemplet: 200.000 kr til 4 % i 20 år.
      const formelsvar = data.faqItems.find(
        (f) => f.answer.includes("annuitetslån") && f.answer.includes("måneder"),
      );
      if (formelsvar) {
        expect(formelsvar.answer).toContain(formatBelob(formel.hovedstol, locale));
        expect(formelsvar.answer).toContain(
          formatBelob(formel.maanedligBetalning, locale),
        );
      }
    }
  });

  test.each([
    {
      locale: "da" as const,
      title: "Kalorieberegner: 80 kg, 180 cm, 30 år, moderat = 2.759 kcal",
      question: "Hvor mange kalorier skal du have om dagen?",
      diet: formatBelob(2259, "da"),
    },
    {
      locale: "se" as const,
      title: "Kalorikalkylator: man 80 kg, 180 cm = 2 759 kcal/dag",
      question: "Hur många kalorier behöver du per dag?",
      diet: formatBelob(2259, "se"),
    },
    {
      locale: "no" as const,
      title: "Hvor mange kalorier per dag? | Kalorikalkulator",
      question: "Hvor mange kalorier trenger du per dag?",
      diet: formatBelob(2259, "no"),
    },
  ])("has answer-first calorie metadata for $locale", ({ locale, title, question, diet }) => {
    const data = getPageData("kalorier", locale)!;

    expect(data.metaTitle).toBe(title);
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data.description).toContain(question);
    // Dansk skriver tusindtalsseparator med punktum, svensk og norsk med
    // mellemrum — saa tallene laeses gennem `formatBelob` frem for at ligge i
    // testen, ellers slaar den paa notationen og ikke paa tallene.
    const bmr = formatBelob(1780, locale);
    const tdee = formatBelob(2759, locale);
    expect(data.description).toContain(bmr);
    expect(data.description).toContain(tdee);
    expect(data.metaDescription).toContain(bmr);
    expect(data.metaDescription).toContain(tdee);
    if (locale !== "da") {
      // Punktum mellem to talgrupper er dansk. I svensk og norsk loebende
      // tekst laeses «1.780 kcal» som 1,780 kcal, saa det er en fejl.
      for (const streng of [data.description, data.metaDescription]) {
        expect(streng).not.toMatch(/\d\.\d{3}/);
      }
    }
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);
    expect(data.ogTitle).toBe(title);
    expect(data.schemaDescription).toContain("BMR");
    const dietFaq = data.faqItems.find((item) => item.answer.includes(diet));
    expect(dietFaq).toBeDefined();
  });

  test.each([
    {
      locale: "da" as const,
      headTerm: "Aldersberegner:",
      example: "født 15. marts 1990",
      birthDate: "fødselsdato",
    },
    {
      locale: "se" as const,
      headTerm: "Ålderskalkylator:",
      example: "född 15 mars 1990",
      birthDate: "födelsedatum",
    },
    {
      locale: "no" as const,
      headTerm: "Alderskalkulator:",
      example: "født 15. mars 1990",
      birthDate: "fødselsdatoen",
    },
  ])(
    "has answer-first age metadata for $locale",
    ({ locale, headTerm, example, birthDate }) => {
      const data = getPageData("alder", locale)!;
      // Alderen og dage-tallet regnes for i dag, så testen låser *kilden*
      // (alderLevet) frem for et tal, der bliver dagsvis forkert. Før denne
      // rettelse stod "36 år, 6 måneder og 10 dage" her som konstant — og
      // holdt kun, fordi netop den dage blev skrevet ind i page-data.ts.
      const levet = alderLevet(iDagISidensTidszone(new Date(), locale === "se" ? "se" : "da"));
      const age = formatAlder(levet, locale);
      const days = formatDageLived(levet, locale);

      // Titlen skal ramme hovedsøgeordet *og* have et regnet eksempel i sig,
      // fordi de danske og svenske søgeresultater med et regnet tal i titlen
      // ligger på 1,1-1,6 % CTR mod 0,4 % for spørgsmålstitler (GSC 3/10).
      // Tallet læses fra `levet`, så porten bliver rød både hvis `{AAR}`
      // lækker ud i Google og hvis nogen fryser et alderstal i page-data.ts.
      expect(data.metaTitle.startsWith(headTerm)).toBe(true);
      expect(data.metaTitle).toContain(example);
      expect(data.metaTitle).toContain(`${formatNumber(levet.aar, locale)} år`);
      expect(data.metaTitle).not.toContain("{");
      expect(data.metaTitle.length).toBeLessThanOrEqual(60);
      expect(data.description).toContain(age);
      expect(data.metaDescription).toContain(age);
      expect(data.metaDescription.length).toBeLessThanOrEqual(160);
      expect(data.ogTitle).toBe(data.metaTitle);
      expect(data.ogDescription).toContain(age);
      expect(data.schemaDescription).toContain(birthDate);
      const daysFaq = data.faqItems.find((item) => item.answer.includes(days));
      expect(daysFaq).toBeDefined();
    }
  );

  test.each(["da", "se", "no"] as const)(
    "dropper den frosne alders-sum i %s",
    (locale) => {
      const data = getPageData("alder", locale)!;
      const levet = alderLevet(iDagISidensTidszone(new Date(), locale === "se" ? "se" : "da"));

      // Summerne i description og metadata skal være *alders-sum* for i
      // dag, ikke kun forskellige fra den gamle konstant.
      expect(data.metaDescription).toContain(formatAlder(levet, locale));
      expect(data.description).toContain(formatAlder(levet, locale));
    }
  );

  // Kvalitetsregel 1: en frossen byggeværdi i et snippet. `/alder` skrev
  // "pr. 25. september 2026" i description, metaDescription, og
  // ogDescription, og `allPages` er et modul-konst — så tallene blev frosset
  // ved processens start og dagsvis mere forkert. Denne test fejler på
  // master: der står stadig "25. september 2026" i kilden.
  test.each(["da", "se", "no"] as const)(
    "%s: ingen streng i metadata har et frosset 'pr. <dato>'",
    (locale) => {
      const data = getPageData("alder", locale)!;
      const iDag = iDagISidensTidszone(new Date(), locale === "se" ? "se" : "da");
      const rigtigDato = new Intl.DateTimeFormat(getIntlLocale(locale), {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(`${iDag}T12:00:00`));

      // `description` og `metaDescription` er de to, der står i Googles
      // snippet. `ogDescription` har aldrig haft en dato — den bærer den
      // levende alder alene, og en længere tekst klippes i de fleste feeds.
      for (const tekst of [data.description, data.metaDescription]) {
        expect(tekst).toContain(rigtigDato);
        expect(tekst).not.toMatch(/\b(pr|per) (25|27)\. (september|oktober) 2026/);
      }
      expect(data.ogDescription).toContain(
        formatAlder(alderLevet(iDag), locale)
      );
      expect(data.ogDescription).not.toMatch(/\b(pr|per) (25|27)\. (september|oktober) 2026/);
      for (const item of data.faqItems) {
        expect(item.answer, item.question).not.toMatch(/\b(pr|per) (25|27)\. (september|oktober) 2026/);
      }
    }
  );

  // Pladsholderne skal alle være løst. En uløst `{ALDER}` ville stå i
  // Googles snippet som rå markup.
  test.each(["da", "se", "no"] as const)("løser alle pladsholdere i %s", (locale) => {
    const data = getPageData("alder", locale)!;
    const tekster = [data.description, data.metaDescription, data.ogDescription,
      ...data.faqItems.map((item) => item.answer)];

    for (const tekst of tekster) {
      expect(tekst, tekst.slice(0, 60)).not.toMatch(/\{[A-Z0-9_]+\}/);
    }
  });

  test.each([
    {
      locale: "da" as const,
      title: "Brændstofberegner: 500 km benzin koster 450 kr.",
      fuel: "benzin",
      cost: "450 kr.",
      perKm: "0,90 kr. pr. km",
    },
    {
      locale: "se" as const,
      title: "Bränslekalkylator: 500 km bensin kostar 585 kr.",
      fuel: "bensin",
      cost: "585 kr",
      perKm: "1,2 kr. per km",
    },
    {
      locale: "no" as const,
      title: "Drivstoffkalkulator: 500 km bensin koster 450 kr.",
      fuel: "bensin",
      cost: "450 kr.",
      perKm: "0,90 kr. per km",
    },
  ])("has answer-first fuel metadata for $locale", ({ locale, title, fuel, cost, perKm }) => {
    const data = getPageData("braendstof", locale)!;

    expect(data.metaTitle).toBe(title);
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data.description).toContain(cost);
    expect(data.description).toContain(perKm);
    expect(data.metaDescription).toContain(cost);
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);
    expect(data.ogTitle).toBe(title);
    expect(data.ogDescription).toContain(cost);
    expect(data.schemaDescription).toContain(fuel);
    const exampleFaq = data.faqItems.find((item) => item.answer.includes(cost));
    expect(exampleFaq).toBeDefined();
  });

  test.each([
    {
      locale: "da" as const,
      title: "Kvadratmeterberegner: 5 x 4 m = 20 m²",
      area: "20 m²",
      heading: "Et rum på 5 x 4 m er 20 m²",
      price: "3.000 kr.",
    },
    // Svensk og norsk skriver mellemrum, ikke det danske punktum. Før 3/10 krævede
    // denne liste «3.000 kr» for alle tre sprog, altså den fejl, svaret havde —
    // og den lå i Googles JSON-LD.
    {
      locale: "se" as const,
      title: "Kvadratmeterkalkylator: 5 x 4 m = 20 m²",
      area: "20 m²",
      heading: "Ett rum på 5 x 4 m är 20 m²",
      price: "3 000 kr",
    },
    {
      locale: "no" as const,
      title: "Kvadratmeterkalkylator: 5 x 4 m = 20 m²",
      area: "20 m²",
      heading: "Et rom på 5 x 4 m er 20 m²",
      price: "3 000 kr",
    },
  ])("has answer-first area metadata for $locale", ({ locale, title, area, heading, price }) => {
    const data = getPageData("kvadratmeter", locale)!;

    expect(data.metaTitle).toBe(title);
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data.description).toContain(heading);
    expect(data.description).toContain(area);
    expect(data.metaDescription).toContain(area);
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);
    expect(data.ogTitle).toBe(title);
    expect(data.ogDescription).toContain(area);
    expect(data.schemaDescription).toContain(area);
    const priceFaq = data.faqItems.find((item) => item.answer.includes(price));
    expect(priceFaq).toBeDefined();
  });

  test.each([
    {
      locale: "da" as const,
      title: "Brøkberegner: forkort 6/8 til 3/4 = 0,75 = 75 %", answer: "6/8 forkortet = 3/4 = 0,75 = 75 %" },
    { locale: "se" as const, title: "Bråkkalkylator: förkorta 6/8 till 3/4 = 0,75 = 75 %", answer: "6/8 förkortat = 3/4 = 0,75 = 75 %" },
  ])("has answer-first fraction metadata for $locale", ({ locale, title, answer }) => {
    const data = getPageData("brok", locale)!;

    expect(data.metaTitle).toBe(title);
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data.description).toContain(answer);
    expect(data.metaDescription).toContain("3/4 = 0,75 = 75 %");
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);
    expect(data.ogTitle).toBe(title);
    expect(data.ogDescription).toContain("3/4 = 0,75 = 75 %");
    expect(data.schemaDescription).toContain("decimaltal");
    const exampleFaq = data.faqItems.find((item) => item.question.includes("6/8"));
    expect(exampleFaq).toBeDefined();
  });

  test.each([
    {
      locale: "da" as const,
      title: "Promilleberegner: 4 øl på 80 kg = 0,88 ‰",
      visible: "4 øl til en mand på 80 kg giver 0,88 ‰",
      answer: "4 øl på 80 kg = 0,88 ‰",
      drivingAfter: "5,9 timer",
      limit: "0,5 ‰",
    },
    {
      locale: "se" as const,
      title: "Promillekalkylator: 4 öl på 80 kg = 0,88 ‰",
      visible: "4 öl till en man på 80 kg ger 0,88 ‰",
      answer: "4 öl på 80 kg = 0,88 ‰",
      drivingAfter: "5,9 timmar",
      limit: "0,2 ‰",
    },
  ])(
    "has answer-first promille metadata for $locale",
    ({ locale, title, visible, answer, drivingAfter, limit }) => {
      const data = getPageData("promille", locale)!;

      expect(data.metaTitle).toBe(title);
      expect(data.metaTitle.length).toBeLessThanOrEqual(60);
      expect(data.description).toContain(visible);
      expect(data.metaDescription).toContain(answer);
      expect(data.metaDescription).toContain(limit);
      expect(data.metaDescription.length).toBeLessThanOrEqual(160);
      expect(data.ogTitle).toBe(title);
      expect(data.ogDescription).toContain(answer);
      expect(data.schemaDescription).toContain(answer);
      const soberFaq = data.faqItems.find((item) => /køre bil igen|köra bil igen/.test(item.question));
      expect(soberFaq?.answer).toContain(answer);
      expect(soberFaq?.answer).toContain(drivingAfter);
    }
  );

  test("promille-eksemplet i metadata følger beregningen", () => {
    const example = beregnPromille(4, 80, "mand", 0)!;
    expect(example.promille).toBe(0.88);
    expect(example.timerTilNul).toBe(5.9);

    for (const locale of ["da", "se"] as const) {
      const data = getPageData("promille", locale)!;
      expect(data.description).toContain("0,88 ‰");
      expect(data.metaDescription).toContain("0,88 ‰");
      const soberFaq = data.faqItems.find((item) => /køre bil igen|köra bil igen/.test(item.question));
      expect(soberFaq?.answer).toContain("0,88 ‰");
      expect(soberFaq?.answer).toContain("5,9");
    }
  });

  test("FAQ skelner mellem under lovens grænse og helt ædru", () => {
    // Reelt sikkerhedsfund fra C47's audit: svaret på "hvornår må jeg køre bil
    // igen" gav tiden til 0 ‰, som er 3,3 timer for lang tid. Begge tal skal
    // stå, og de skal være regnet med den grænse, der gælder i landet.
    for (const [locale, under, helt] of [
      ["da", "2,6 timer", "5,9 timer"],
      ["se", "4,6 timmar", "5,9 timmar"],
    ] as const) {
      const data = getPageData("promille", locale)!;
      const soberFaq = data.faqItems.find((item) => /køre bil igen|köra bil igen/.test(item.question));
      expect(soberFaq?.answer).toContain(under);
      expect(soberFaq?.answer).toContain(helt);
    }
  });

  test.each([
    {
      locale: "da" as const,
      title: "Enhedspris: 35 kr. for 2 kg = 17,50 kr. pr. kg",
      visible: "35 kr. for 2 kg koster 17,50 kr. pr. kg",
      perUnit: "17,50",
      saving: "12,5 %",
      faq: /billigst pr. kilo/,
    },
    {
      locale: "se" as const,
      title: "Jämförpris: 35 kr för 2 kg = 17,50 kr per kg",
      visible: "35 kr för 2 kg kostar 17,50 kr per kg",
      perUnit: "17,50",
      saving: "12,5 %",
      faq: /billigast per kilo/,
    },
  ])(
    "has answer-first unit-price metadata for $locale",
    ({ locale, title, visible, perUnit, saving, faq }) => {
      const data = getPageData("enhedspris", locale)!;

      expect(data.metaTitle).toBe(title);
      expect(data.metaTitle.length).toBeLessThanOrEqual(60);
      expect(data.description).toContain(visible);
      expect(data.metaDescription).toContain(perUnit);
      expect(data.metaDescription).toContain(saving);
      expect(data.metaDescription.length).toBeLessThanOrEqual(160);
      expect(data.ogTitle).toBe(title);
      expect(data.ogDescription).toContain(perUnit);
      expect(data.schemaDescription).toContain(perUnit);
      const exampleFaq = data.faqItems.find((item) => faq.test(item.question));
      expect(exampleFaq?.answer).toContain(perUnit);
      expect(exampleFaq?.answer).toContain(saving);
    }
  );

  test("enhedspris-eksemplet i metadata følger sammenlignEnhedspris", () => {
    const example = sammenlignEnhedspris(20, 1, 35, 2)!;
    expect(example.enhedsprisA).toBe(20);
    expect(example.enhedsprisB).toBe(17.5);
    expect(example.billigst).toBe("B");
    expect(Math.round(example.besparelseProcent * 10) / 10).toBe(12.5);

    for (const locale of ["da", "se"] as const) {
      const data = getPageData("enhedspris", locale)!;
      for (const text of [data.description, data.metaDescription, data.ogDescription, data.schemaDescription]) {
        expect(text).toContain("17,50");
        expect(text).toContain("12,5");
      }
    }
  });

  test.each([
    {
      locale: "da" as const,
      title: "Vægttab: 6 kg på 12 uger = 550 kcal/dag",
      visible: "6 kg på 12 uger kræver 550 kcal",
      goal: /6 kg på 12 uger\?$/,
    },
    { locale: "se" as const, title: "Viktminskning: 6 kg på 12 veckor = 550 kcal/dag", visible: "6 kg på 12 veckor kräver 550 kcal", goal: /6 kg på 12 veckor\?$/ },
    { locale: "no" as const, title: "Vekttap: 6 kg på 12 uker = 550 kcal/dag", visible: "6 kg på 12 uker krever 550 kcal", goal: /6 kg på 12 uker\?$/ },
  ])(
    "has answer-first weight-loss metadata for $locale",
    ({ locale, title, visible, goal }) => {
      const data = getPageData("vaegttab", locale)!;
      // Svensk og norsk løbende tekst skriver tusindtalsseparator med mellemrum,
      // dansk med punktum — `formatBelob` af dagsmålet, se `vaegttab-eksempler`.
      const dagsmal = formatBelob(2209, locale);
      const tdee = formatBelob(2759, locale);

      expect(data.metaTitle).toBe(title);
      expect(data.metaTitle.length).toBeLessThanOrEqual(60);
      expect(data.description).toContain(visible);
      expect(data.description).toContain(dagsmal);
      expect(data.metaDescription).toContain("550 kcal");
      expect(data.metaDescription).toContain(dagsmal);
      expect(data.metaDescription.length).toBeLessThanOrEqual(160);
      expect(data.ogTitle).toBe(title);
      expect(data.ogDescription).toContain(dagsmal);
      expect(data.schemaDescription).toContain(dagsmal);
      const goalFaq = data.faqItems.find((item) => goal.test(item.question));
      expect(goalFaq?.answer).toContain(tdee);
      expect(goalFaq?.answer).toContain("550 kcal");
      expect(goalFaq?.answer).toContain(dagsmal);
      // Samme skel mellem alle sprogens svar: et tusindtal med punktum er dansk,
      // og i svensk og norsk løbende tekst læses det som 2,759 kcal.
      if (locale !== "da") {
        for (const item of data.faqItems) {
          expect(item.answer, `${locale}: ${item.question}`).not.toMatch(/\d\.\d{3}/);
        }
      }
    }
  );

  test("vægttab-eksemplet følger VaegttabBeregners formel", () => {
    // Mifflin-St Jeor + aktivitetsfaktor 1,55 + 7.700 kcal pr. kg, som i VaegttabBeregner.tsx
    const bmr = 10 * 80 + 6.25 * 180 - 5 * 30 + 5;
    const tdee = bmr * 1.55;
    const dagligtDeficit = (6 * 7700) / (12 * 7);
    expect(bmr).toBe(1780);
    expect(tdee).toBe(2759);
    expect(dagligtDeficit).toBe(550);
    expect(Math.round(tdee - dagligtDeficit)).toBe(2209);

    for (const locale of ["da", "se", "no"] as const) {
      const data = getPageData("vaegttab", locale)!;
      const dagsmal = formatBelob(2209, locale);
      const tdee = formatBelob(2759, locale);
      expect(data.description).toContain("550");
      expect(data.description).toContain(dagsmal);
    }
  });

  test.each([
    {
      locale: "da" as const,
      titel: "Beregn dage til 1. december: {DAGE_TIL_DEC} tilbage",
      heading: "Beregn antal dage mellem to datoer",
      intent: "antal dage mellem to datoer",
      answer: "Vælg en startdato og en slutdato",
      months: "ca. måneder",
      countdown: "Hvor mange dage er der til en dato?",
    },
    {
      locale: "se" as const,
      titel: "Beräkna dagar till 1 december: {DAGE_TIL_DEC} kvar",
      heading: "Beräkna antal dagar mellan två datum",
      intent: "antal dagar mellan två datum",
      answer: "Välj ett startdatum och ett slutdatum",
      months: "ungefärligt antal månader",
      countdown: "Hur många dagar är det kvar till ett datum?",
    },
  ])(
    "has answer-first date metadata for $locale",
    ({ locale, titel, heading, intent, answer, months, countdown }) => {
      const data = getPageData("dato", locale)!;
      // Titlens dagtal regnes hver dag, så testen regner det samme tal i stedet
      // for at skrive «58» — ellers ville porten blive rød hver 1. december.
      const { kort } = dageTilDecember(locale, new Date());
      const title = titel.replaceAll("{DAGE_TIL_DEC}", kort);

      expect(data.title).toBe(heading);
      expect(data.metaTitle).toBe(title);
      expect(data.metaTitle.length).toBeLessThanOrEqual(60);
      expect(data.description).toContain(answer);
      expect(data.description).toContain(months);
      expect(data.metaDescription).toContain(intent);
      expect(data.metaDescription).toContain(months);
      expect(data.metaDescription.length).toBeLessThanOrEqual(160);
      expect(data.ogTitle).toBe(title);
      expect(data.ogDescription).toContain(intent);
      expect(data.ogDescription).toContain(months);
      expect(data.schemaDescription).toContain(intent);
      expect(data.schemaDescription).toContain(months);

      // C164: the title must name BOTH intents the page serves. "hvor mange
      // dage er der til 1 december" (1.063 visninger, 2 klik, pos. 5) og
      // "hvor mange dage er der tilbage af 2026" (231, pos. 5) er de to
      // næststørste søgninger på /dato — men den gamle titel lovede kun
      // "antal dage mellem to datoer", så countdown-søgeren fik et snippet
      // om noget andet. Beskrivelsen SKAL desuden begynde med spørgsmålet
      // og ikke gentage titlen: de to var ens, hvilket koster halve
      // snippet-pladsen på det samme "se mere"-link.
      expect(data.metaTitle).toMatch(/dage til 1\. december|dagar till 1 december/);
      expect(data.metaDescription.startsWith(countdown)).toBe(true);
      expect(data.metaDescription).not.toBe(data.metaTitle);
    }
  );

  test.each([
    {
      locale: "da" as const,
      title: "Tidsberegner: 08:30 til 16:45 = 8 t 15 min. Mellem datoer",
      intent: "mellem to klokkeslæt",
      example: "08:30 til 16:45 er 8 timer og 15 minutter",
      schema: "Gratis tidsberegner. Beregn tidsrum mellem to klokkeslæt eller mellem to datoer, og se resultatet i timer, minutter, dage, arbejdsdage og decimaltimer.",
    },
    {
      locale: "se" as const,
      title: "Tidskalkylator: 08:30 till 16:45 = 8 t 15 min",
      intent: "mellan två klockslag",
      example: "08:30 till 16:45 är 8 timmar och 15 minuter",
      schema: "Gratis tidskalkylator. Beräkna tidsintervall mellan två klockslag och se resultatet i timmar, minuter och decimaltimmar.",
    },
  ])("has answer-first time metadata for $locale", ({ locale, title, intent, example, schema }) => {
    const data = getPageData("tidsberegner", locale)!;

    expect(data.metaTitle).toBe(title);
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data.description).toContain(intent);
    expect(data.metaDescription).toContain(example);
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);
    expect(data.ogTitle).toBe(title);
    expect(data.ogDescription).toContain(example);
    expect(data.schemaDescription).toBe(schema);
  });

  test.each([
    {
      locale: "da" as const,
      title: "Momsberegner: 1.000 kr. ekskl. moms + 25 % = 1.250 kr.",
      answer: "1.000 kr. og få 1.250 kr.",
      schema: "Gratis momsberegner. Beregn dansk moms på 25 % med priser inkl. og ekskl. moms.",
    },
    {
      locale: "se" as const,
      title: "Momskalkylator: 1 000 kr. exkl. moms + 25 % = 1 250 kr.",
      answer: "1 000 kr. och få 1 250 kr.",
      schema: "Gratis momskalkylator. Beräkna svensk moms på 25 %, 12 % och 6 % med priser inkl. och exkl. moms.",
    },
  ])("has answer-first VAT metadata for $locale", ({ locale, title, answer, schema }) => {
    const data = getPageData("moms", locale)!;

    expect(data.metaTitle).toBe(title);
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data.description).toContain(answer);
    expect(data.metaDescription).toContain(answer);
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);
    expect(data.ogTitle).toBe(title);
    expect(data.ogDescription).toContain(answer);
    expect(data.schemaDescription).toBe(schema);
  });

  test("returns undefined for DA-only slug on SE", () => {
    const data = getPageData("loen-efter-skat", "se");
    expect(data).toBeUndefined();
  });

  test("returns data for DA-only slug on DA", () => {
    const data = getPageData("loen-efter-skat", "da");
    expect(data).toBeDefined();
    expect(data!.slug).toBe("loen-efter-skat");
  });

  test("returns undefined for non-existent slug", () => {
    expect(getPageData("does-not-exist", "da")).toBeUndefined();
  });

  test("all page data has required fields", () => {
    const requiredFields = [
      "slug", "title", "description", "metaTitle", "metaDescription",
      "keywords", "ogTitle", "ogDescription", "category",
    ] as const;

    for (const locale of ["da", "no", "se"] as const) {
      for (const slug of getAvailableSlugs(locale)) {
        const data = getPageData(slug, locale);
        expect(data, `Missing page data for ${locale}/${slug}`).toBeDefined();
        for (const field of requiredFields) {
          expect(data![field], `${locale}/${slug} missing field: ${field}`).toBeTruthy();
        }
      }
    }
  });
});

describe("metadata snippets do not waste the SERP (C164)", () => {
  // C164 measured the class across all 157 metaTitle/metaDescription pairs:
  // on /dato (the site's #1 Plausible page, 1.110 besøgende/28d, and its
  // #2 GSC side with 131.920 visninger) the description's first sentence was
  // a verbatim copy of the title. Google shows them as one block, so half the
  // description repeated the blue link the searcher had just read — and the
  // query the page actually ranks for ("hvor mange dage er der til 1
  // december", 1.063 visninger, pos. 5) was not in either string.
  //
  // These two rules are the general form of that finding. They run over every
  // slug in every locale, so the fix cannot silently come back on the next
  // page that is added.
  const stripBrand = (s: string) =>
    s.replace(/\s*\|\s*(MinBeregner\.dk|Beräknare\.se)\s*$/, "").trim();

  for (const locale of ["da", "no", "se"] as const) {
    test(`${locale}: no description repeats its own title`, () => {
      const offenders: string[] = [];

      for (const slug of getAvailableSlugs(locale)) {
        const data = getPageData(slug, locale);
        if (!data) continue;

        const title = stripBrand(data.metaTitle).toLowerCase();
        const firstSentence = data.metaDescription
          .split(/\.\s|\?/)[0]
          .replace(/[.,:;?!]$/, "")
          .trim()
          .toLowerCase();

        if (title && firstSentence === title) offenders.push(slug);
      }

      expect(offenders, `description echoes title on: ${offenders.join(", ")}`)
        .toEqual([]);
    });

    test(`${locale}: no description repeats a whole sentence`, () => {
      const offenders: string[] = [];

      for (const slug of getAvailableSlugs(locale)) {
        const data = getPageData(slug, locale);
        if (!data) continue;

        // A sentence that appears twice in ONE indexed string.
        // /dato in `no` had "Gratis datokalkulator. … Gratis datokalkulator."
        // Both fields are checked, because they do not always agree.
        //
        // The unit is the SENTENCE, not a word-shingle. A shingle rule was
        // tried first and flagged /procent and /rentefradrag, whose
        // descriptions deliberately restate the number from the rule in the
        // worked example ("33,6 % på de første 50.000 kr. renter. Eksempel:
        // 50.000 kr renter = 16.800 kr."). That repetition is the answer-first
        // pattern C82 built on purpose and its own tests lock it — flagging it
        // would train the next iteration to delete good copy.
        for (const [field, text] of [
          ["metaDescription", data.metaDescription],
          ["ogDescription", data.ogDescription],
        ] as const) {
          const sentences = text
            .split(/(?<=[.!?])\s+/)
            .map((s) => s.trim().toLowerCase())
            .filter((s) => s.replace(/[^a-zæøå]/gi, "").length >= 8);

          const seen = new Set<string>();
          for (const sentence of sentences) {
            if (seen.has(sentence)) {
              offenders.push(`${slug} ${field} ("${sentence.slice(0, 40)}")`);
              break;
            }
            seen.add(sentence);
          }
        }
      }

      expect(
        offenders,
        `repeated sentence in description: ${offenders.join(", ")}`
      ).toEqual([]);
    });
  }
});

describe("snippet descriptions fit the SERP (C193)", () => {
  // C193 measured every page in both sitemaps and found 22 metaDescription
  // strings over the 160-character limit the rest of this file already used —
  // the longest was 202. The rule existed, but it only ran inside
  // hand-picked `describe` blocks (about 20 slugs), so the other 100+ pages
  // were never checked. Google truncates the description at roughly this
  // length, so on those 22 pages the tail of the answer was cut in the
  // snippet.
  //
  // This test is the general form: it runs over every slug in every locale,
  // so the next page that is added cannot silently bring the class back.
  // It also locks its own scope, because 0 offenders is also what a check
  // that reads nothing would report.
  for (const locale of ["da", "no", "se"] as const) {
    test(`${locale}: every metaDescription fits in 160 characters`, () => {
      const offenders: string[] = [];

      for (const slug of getAvailableSlugs(locale)) {
        const data = getPageData(slug, locale);
        if (!data) continue;

        if (data.metaDescription.length > 160) {
          offenders.push(`${slug} (${data.metaDescription.length})`);
        }
      }

      expect(getAvailableSlugs(locale).length).toBeGreaterThan(25);
      expect(offenders, `description too long: ${offenders.join(", ")}`).toEqual(
        []
      );
    });
  }
});

describe("getAvailableSlugs", () => {
  test("DA has the most slugs (all calculators)", () => {
    const da = getAvailableSlugs("da");
    const se = getAvailableSlugs("se");
    const no = getAvailableSlugs("no");
    expect(da.length).toBeGreaterThan(se.length);
    expect(da.length).toBeGreaterThan(no.length);
  });

  test("SE has at least as many slugs as NO (SE-only calculators allowed)", () => {
    const se = getAvailableSlugs("se");
    const no = getAvailableSlugs("no");
    // SE ships Swedish-only calculators (e.g. lön efter skatt) that NO lacks.
    expect(se.length).toBeGreaterThanOrEqual(no.length);
  });

  test("all universal slugs exist on all locales", () => {
    const universalSlugs = ["bmi", "moms", "procent", "valuta", "boliglaan"];
    for (const slug of universalSlugs) {
      for (const locale of ["da", "no", "se"] as const) {
        expect(
          getAvailableSlugs(locale),
          `${slug} missing from ${locale}`
        ).toContain(slug);
      }
    }
  });

  test("DA-only slugs do not exist on SE/NO", () => {
    const daOnlySlugs = ["loen-efter-skat", "dagpenge", "su", "ugenummer", "flyttebudget"];
    for (const slug of daOnlySlugs) {
      expect(getAvailableSlugs("da")).toContain(slug);
      expect(getAvailableSlugs("se")).not.toContain(slug);
      expect(getAvailableSlugs("no")).not.toContain(slug);
    }
  });

  test("live-domain availability matches localized page data", () => {
    for (const locale of ["da", "se"] as const) {
      for (const href of getCalculatorHrefs()) {
        const slug = href.slice(1);
        expect(
          isCalculatorAvailable(href, locale),
          `${locale}/${slug} availability mismatch`
        ).toBe(Boolean(getPageData(slug, locale)));
      }
    }
  });
});

describe("2026-skattetall i lønsidernes FAQ", () => {
  const supersede = ["24,94", "25,07", "0,68%", "15% topskat"];

  test.each(["loen-efter-skat", "brutto-netto"])(
    "%s nævner kun den verificerede kommuneskat",
    (slug) => {
      const data = getPageData(slug, "da")!;
      const text = [data.description, ...data.faqItems.map((i) => `${i.question} ${i.answer}`)].join(
        " "
      );

      expect(text).toContain("25,049");
      for (const stale of supersede) {
        expect(text, `${slug} nævner ${stale}`).not.toContain(stale);
      }
    }
  );

  test("topkat-spørgsmålet beskriver 2026-brackets, ikke den afskaffede 15 %", () => {
    const data = getPageData("loen-efter-skat", "da")!;
    const faq = data.faqItems.find((item) =>
      item.question.includes("Hvordan beregnes min løn efter skat")
    );

    // «7,5 %» med mellemrum: husets skrivemåde, og dennotation `formatBelob`
    // afrunder 7,5 til «8 %» uden de to decimaler.
    expect(faq?.answer).toContain("7,5 %");
    expect(faq?.answer).not.toContain("7,5%");
    expect(faq?.answer).toContain("afskaffet");
  });
});

describe("svensk leasing-metadata", () => {
  const data = getPageData("leasing", "se")!;

  test("er svar-først med kalkylatorens egne standardtal", () => {
    // Uværdierne er kalkylatorens default: 300.000 kr bilpris, 150.000 kr
    // restværde, 4,5 % rente, 30.000 kr kontantinsats, 36 måneder.
    // afskrivning 120.000/36 = 3.333,33 + 4,5 %/12 på 210.000 = 787,50.
    // Tusindtalsseparatoren er **mellemrum** i svensk — «300.000» var dansk
    // punktum på en svensk side, samme fejl som /renteberegner havde.
    expect(data.title).toBe("Leasingkalkylator: bil på 300 000 kr = 4 121 kr/mån");
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data.metaDescription).toContain("4 121 kr");
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);
    expect(data.ogTitle).toBe(data.metaTitle);
    expect(data.ogDescription).toContain("4 121 kr");
    expect(data.schemaDescription).toContain("4 121 kr");
  });

  test("FAQ'en er skrevet på svenska og bruger kalkylatorens tal", () => {
    const text = data.faqItems.map((item) => `${item.question} ${item.answer}`).join(" ");

    expect(text).toContain("4 121 kr");
    expect(text).toContain("178 350 kr");
    expect(text).toMatch(/leasingkalkylatorn|kalkylatorn/);
    // Ingen norske eller danske rester i den svenska FAQ. å/ä/ö er ægte
    // svenske bogstaver, så det er kun æ og ø der afslører et dansk/norsk leak.
    expect(text).not.toMatch(/jeg|kalkylatoren på mobilen|hvor mye/i);
    expect(text).not.toMatch(/[æø]/i);
  });
});

describe("svenska svar på frågeformulerade sökningar", () => {
  // Search Console 2026-08-27→09-24: de tre svenska sidor med flest visninger
  // rankar på frågeformulerede sökningar ("antal dagar mellan datum",
  // "räkna ut timmar och minuter", "färetagsleasing bil kalkyl"), men frågan
  // fanns inte på sidan. position 8-15 med 0,1-0,9 % CTR er et spørgsmål om
  // svarform, ikke om titel.
  const frageForm = (slug: string, locale: "da" | "no" | "se" = "se") =>
    getPageData(slug, locale)!.faqItems.map((item) => `${item.question} ${item.answer}`).join(" ");

  test("/dato svarar på de fire svenska dags-sökninger", () => {
    const text = frageForm("dato").toLowerCase();
    expect(text).toContain("hur många dagar är det mellan två datum");
    expect(text).toContain("antalet dagar mellan datum");
    expect(text).toContain("hur många dagar till 31 december");
  });

  test("/tidsberegner svarar på de svenska tids-sökninger", () => {
    const text = frageForm("tidsberegner").toLowerCase();
    expect(text).toContain("hur räknar jag ut timmar och minuter");
    expect(text).toContain("hur lång tid det tar");
    // 08:30→16:45 = 8:15 er kalkylatorens eget eksempel i descriptionen.
    expect(text).toContain("08:30 till 16:45 är 8 timmar och 15 minuter");
  });

  // Svensk GSC 2026-08-28→09-25: "fåretagsleasing bil kalkyl" 194 visninger
  // pos. 11 og "beräkna leasing bil fåretag" 172 visninger pos. 15. Siden
  // skrev "färetagsleasing" med ä i både keywords og FAQ — altså et ord, der
  // ingen svensk søgning kan ramme. Ordet hedder fåretagsleasing (å).
  test("/leasing nævner fåretagsleasing og svarer på leasingkostnaden", () => {
    const text = frageForm("leasing").toLowerCase();
    expect(text).toContain("fåretagsleasing");
    expect(text).not.toContain("färetagsleasing");
    expect(text).toContain("4 121 kr");
    expect(text).not.toMatch(/\d\.\d{3} kr/);
  });

  test("/leasing skriver fåretagsleasing med å overalt det står", () => {
    const data = getPageData("leasing", "se")!;
    const felter = [data.title, data.metaTitle, data.metaDescription, data.ogTitle, ...data.keywords];
    // Ordet skal findes i keywords og i titlen — det er de to, GSC kan matche
    // på — men kravet er ikke "overalt", kun "aldrig med ä".
    const medOrdet = felter.filter((t) => /f[åä]retagsleasing/i.test(t));
    expect(medOrdet.length).toBeGreaterThanOrEqual(2);
    for (const tekst of felter) {
      expect(tekst, `"${tekst}"`).not.toMatch(/färetagsleasing/i);
    }
  });

  // SE /procent har 23.294 visninger og 2 klik (pos. 10,2) — så meget
  // inside på side 2. Autocomplete (hl=sv, 2026-09-26) viser at de svenske
  // søgningerne er spørgsmål om konkrete opgaver: "hur räknar man ut
  // procent i excel", "procent av summa" og "hur räknar man ut procent på
  // lön". Ingen af dem fandtes på siden.
  test("/procent svarar på de svenska procent-søgninger", () => {
    const text = frageForm("procent").toLowerCase();
    expect(text).toContain("hur räknar man ut procent i excel");
    expect(text).toContain("=a1/b1*100");
    expect(text).toContain("hur stor del av en summa");
    expect(text).toContain("hur räknar man ut procent på lön");
    // Skillnadsklyngen: "procent skillnad mellan två tal" er nr. 1 under
    // "procent skillnad", og tre af de ti variationer er Excel
    // (autocomplete hl=se, 2026-09-28). Begge spørgsmålene kom herfra.
    expect(text).toContain("hur räknar man ut skillnaden i procent mellan två tal");
    expect(text).toContain("hur räknar man ut skillnaden mellan två tal i excel");
    // De to formler skal give hver sit svar for de samme tal, ellers er
    // svaret på søgningen bare forvirrende.
    expect(text).toContain("(12 500 - 10 000) / 10 000 = 25 procent");
    expect(text).toContain("2 500 / 11 250 = 22,2 procent");
    // Dansk skriver "mellem to tal" og "procentforskel" — de må ikke løbe ind
    // i den svenska blok, for hele pointen er at svaret er målt pr. sprog.
    expect(text).not.toMatch(/mellem to tal/);
    expect(text).not.toMatch(/procentforskel/);
  });

  // Norsk er stadig urørt: beregner.no serverer ikke beregnersider (C79), så
  // den norske blok skal ikke få dansk eller svensk indhold.
  test("den norske /procent-side er urørt", () => {
    expect(frageForm("procent", "no")).not.toMatch(/i excel/i);
  });

  // DA /procent er GSC's største side: 149.546 visninger, 96 klik, CTR 0,1 %,
  // pos. 7,4. Dansk autocomplete (hl=da, 2026-09-27) viser at klyngen er
  // spørgsmål om konkrete opgaver — især Excel og rabat — og at de ikke fandtes
  // på siden.
  test("/procent svarer på de danske procent-søgninger", () => {
    const text = frageForm("procent", "da").toLowerCase();
    expect(text).toContain("hvordan regner man procent i excel");
    expect(text).toContain("=a1/b1*100");
    expect(text).toContain("hvordan regner man procentforskellen mellem to tal");
    expect(text).toContain("hvor stor er rabatten i procent");
    // Rabattallet fra GSC: "en telefon er sat 1125 kr. ned. normalt koster
    // den 9000 kr." (54 visninger, pos. 6) er 12,5 %.
    expect(text).toContain("1.125 / 9.000 = 12,5");
  });

  // Dansk autocomplete (hl=da&gl=dk, 2026-09-30) har to rækker under
  // "hvordan regner man rabat i procent" og "beregn rabat i procent", og
  // ingen af dem fandtes i FAQ'en — kun den kortere "hvor stor er
  // rabatten i procent?". Den nye række er *metoden* i tre trin plus den
  // fælde, der gør 12,5 og 14,3 til to forvirrende tal.
  test("/procent svarer på 'hvordan regner man rabat i procent' i dansk", () => {
    const faq = getPageData("procent", "da")!.faqItems;
    const raekke = faq.find((i) => i.question === "Hvordan regner man rabat i procent?");

    expect(raekke, "rækken skal findes i den danske blok").toBeDefined();
    expect(raekke!.answer).toContain("Del med prisen FØR nedsættelsen");
    // De tre tal er de samme som afsnittet over FAQ'en regner, så de er
    // bygget af konstanterne her — ikke skrevet i sætningen.
    const nedsat = RABAT_EKSEMPEL.normalPris - RABAT_EKSEMPEL.nedsatPris;
    const modNy = procentForskel(RABAT_EKSEMPEL.normalPris, RABAT_EKSEMPEL.nedsatPris);
    expect(raekke!.answer).toContain(
      `${talDa(nedsat)} kr. er ${talDa(modNy, 1)} %`
    );
    expect(raekke!.answer).toContain(
      `men rabatten er ${talDa(rabatProcent(RABAT_EKSEMPEL.normalPris, RABAT_EKSEMPEL.nedsatPris), 1)} %`
    );
    expect(raekke!.answer).toContain(
      `${talDa(RABAT_BELOEB)} kr. med ${RABAT_SATS_UDLAET} % rabat koster ${talDa(RABAT_BELOEB - procentAf(RABAT_BELOEB, RABAT_SATS_UDLAET))} kr.`
    );
  });

  test("den svenska leasing-FAQ har ingen dansk rester eller brudt svensk", () => {
    const text = frageForm("leasing");
    // "värktiga" var en dansk læk, "földer" stavfel, og "mindre går att betala
    // med bilen er till salu" var en sætning uden mening.
    expect(text).not.toMatch(/värktiga|földer|er till salu|mindre går att betala/);
    expect(text).not.toMatch(/værktøj|værkti/);
  });
});

describe("danske svar på tids-søgninger", () => {
  // Search Console 2026-08-27→09-24: /tidsberegner har 72.382 visninger og
  // 207 klik — CTR 0,3 % på position 7,0, tredjestørste CTR-tab på sitet.
  // Søgningerne er spørgsmål ("hvor lang tid" 790 visninger pos. 6, "time
  // beregner" 119v pos. 8, "beregn tid" 94v pos. 7), men title/description
  // lovede et eksempel ("08:30 til 16:45 er 8 timer og 15 minutter") der
  // ikke stod nogen steder i brødteksten. FAQ'en er samme kilde som
  // JSON-LD, så et spørgsmål der mangler her mangler også struktureret.
  const frageForm = (slug: string) =>
    getPageData(slug, "da")!.faqItems
      .map((item) => `${item.question} ${item.answer}`)
      .join(" ");

  test("/tidsberegner svarer på 'hvor lang tid' med et konkret tal", () => {
    const text = frageForm("tidsberegner");
    expect(text).toContain("Hvor lang tid er der mellem to klokkeslæt?");
    expect(text).toContain("08:30 til 16:45 er 8 timer og 15 minutter");
  });

  test("/tidsberegner svarar på head-ternerne 'time beregner' og 'beregn tid'", () => {
    const text = frageForm("tidsberegner");
    // "time beregner" er stavemåden af head-ordet; "beregn tid" er det
    // danske spørgsmål. Begge skal kunne findes i FAQ'ens spørgsmål/svar.
    expect(text.toLowerCase()).toContain("beregner jeg arbejdstid");
    expect(text).toContain("Kan jeg trække en pause fra?");
  });

  test("/tidsberegner dækker både pause og tid over midnat med tal", () => {
    const text = frageForm("tidsberegner");
    expect(text).toContain("30 minutters pause er 7 timer og 30 minutter");
    expect(text).toContain("22:00 til 06:00 er 8 timer");
  });

  test("FAQ'en er ikke længere de tre korte svar uden eksempel", () => {
    const data = getPageData("tidsberegner", "da")!;
    expect(data.faqItems.length).toBeGreaterThanOrEqual(6);
    for (const item of data.faqItems) {
      expect(item.answer.length).toBeGreaterThan(40);
    }
  });
});

/**
 * Google afkorter titlen ved ca. 60 tegn. 67 af repoets 160 `metaTitle`-strenge
 * var længere end det, fordi hver af dem bar sit domænenavn i halen — altså den
 * del, der alligevel bliver klippet væk. Det gjorde titlen ærlig og målbar:
 * den er nu under afkortningsgrænsen, så det der står i `<title>` er det
 * samme som det der vises. Se opgave 110.
 */
describe("metaTitle-længde", () => {
  const LOCALE_LIST = ["da", "se", "no"] as const;
  const GRÆNSE = 60;

  function alleTitler(): { locale: string; slug: string; titel: string }[] {
    return LOCALE_LIST.flatMap((locale) =>
      getAvailableSlugs(locale).map((slug) => ({
        locale,
        slug,
        titel: getPageData(slug, locale)!.metaTitle,
      }))
    );
  }

  test("ingen titler er længere end Googles afkortningsgrænse", () => {
    const lange = alleTitler()
      .filter((t) => t.titel.length > GRÆNSE)
      .map((t) => `${t.locale}/${t.slug} (${t.titel.length}): ${t.titel}`);
    expect(lange).toEqual([]);
  });

  test("alle tre sprog er dækket af målingen", () => {
    // En kun dansk-liste ville være grøn, mens beraknare.se brændte af samme
    // grund — 29 svenske titler var over grænsen.
    for (const locale of LOCALE_LIST) {
      expect(getAvailableSlugs(locale).length, locale).toBeGreaterThan(20);
    }
  });
});

describe("/promille — svar på udlandsklyngen", () => {
  const da = getPageData("promille", "da")!;

  test("de tre nye spørgsmål er i den danske FAQ, som også går i JSON-LD", () => {
    // FAQ'en er mocket væk i src/app/promille/page.test.tsx (C85's fælde),
    // så den skal testes her, hvor den ligger som data.
    for (const spoergsmaal of [
      "Hvad er promillegrænsen i Tyskland?",
      "Hvad er promillegrænsen i Norge og Sverige?",
      "Må jeg køre med 0,4 promille i udlandet?",
    ]) {
      expect(da.faqItems.map((f) => f.question), spoergsmaal).toContain(spoergsmaal);
    }
  });

  test("svarene bruger de samme tal som PROMILLEGRANSE_UDLAND", () => {
    // Samme fejlklasse som C84's metaDescription-drift: et svar i FAQ'en der
    // nævner en anden grænse end tabellen og modulet, er en løgn i de
    // strukturerede data — præcis der Google's snippet læser.
    const tyskland = da.faqItems.find((f) => /Tyskland\?$/.test(f.question))!;
    expect(tyskland.answer).toContain(
      `${String(PROMILLEGRANSE_UDLAND.tyskland).replace(".", ",")} promille`
    );
    const norden = da.faqItems.find((f) => /i Norge og Sverige\?$/.test(f.question))!;
    for (const nokkel of ["norge", "sverige"] as const) {
      expect(norden.answer).toContain(
        `${String(PROMILLEGRANSE_UDLAND[nokkel]).replace(".", ",")} promille`
      );
    }
  });

  test("den svenske og norske /promille er uændrede af den danske måling", () => {
    // Målingen var dansk (dansk autocomplete), så de to andre sprog skal være
    // urørte — ellers lækker dansk til beraknare.se, og det er hele pointen
    // med kun at røre den ene gren.
    for (const locale of ["se", "no"] as const) {
      const andet = getPageData("promille", locale);
      if (!andet) continue;
      expect(andet.faqItems.map((f) => f.question).join(" ")).not.toContain("udlandet");
    }
  });

  test("den svenske «efter N øl»-påstand er regnet, ikke håndskrevet", () => {
    // Målt 3/10 på beraknare.se/promille: FAQ'en sagde «nås alltså efter två
    // öl», mens sidens egen tabel viser 0,22 ‰ efter *én* øl, brødteksten
    // ovenfor siger 1, og `genstandeTilGraense` regner 1. Svaret ligger i
    // FAQPage-JSON-LD, så det er den modsigelse Google læser.
    const se = getPageData("promille", "se")!;
    const svar = se.faqItems.find((f) => f.question === "Hur många promille är 2 öl?")!;
    const antal = genstandeTilGraense(80, "mand", PROMILLEGRANSE.se)!;
    expect(svar.answer).toContain(`nås alltså efter ${antal} öl`);
    // Mutationen der lå bag fundet er den håndskrevne «efter två öl» — den
    // overlever kun, hvis porten ikke dømmer det rigtige antal.
    expect(svar.answer).not.toContain("efter två öl");
    // Og antallet skal være det, tabellen faktisk viser for det antal øl.
    expect(beregnPromille(antal, 80, "mand", 0)!.promille).toBeGreaterThanOrEqual(
      PROMILLEGRANSE.se
    );
  });
});

describe("svensk CTR på tid- og dato-siderne", () => {
  // Svensk GSC 2026-08-28→09-25: /tidszone 3.256 visninger, 12 klik, CTR
  // 0,4 %, pos. 7,7. /nedtaelling 5.163 visninger, 12 klik, CTR 0,2 %,
  // pos. 9,4. /leasing 3.151 visninger, 32 klik, CTR 1,0 %, pos. 12,4.
  // Ved pos. 7-12 er det titlen, der afgør om der klikkes — ikke placeringen.

  // C84 rettede /tidszone fra "12 byer" til "21 byer", men kun i
  // metaDescription. ogDescription stod stadig med 12 i begge sprog, så den
  // rigtige fejl overlevede rettelsen. Tallet læses fra TIDSZONER, så en ny
  // by kan ikke slippe forbi uden at denne test falder.
  test("/tidszone oplyser samme antal byer som tabellen har, hvor det nævner et", () => {
    const byer = TIDSZONER.length;
    expect(byer).toBeGreaterThan(0);
    for (const locale of ["da", "se", "no"] as const) {
      const data = getPageData("tidszone", locale);
      if (!data) continue;
      for (const [felt, tekst] of [
        ["metaDescription", data.metaDescription],
        ["ogDescription", data.ogDescription],
      ] as const) {
        // `no` nævner ikke et bytal nogen steder — det er ikke en fejl, så
        // kravet er kun på de strenge der faktisk oplyser et tal.
        const naever = [...tekst.matchAll(/(\d+) (byer|städer|stader)/gi)];
        for (const fund of naever) {
          expect(Number(fund[1]), `${locale}.${felt}: "${tekst}"`).toBe(byer);
        }
      }
    }
    // Mindst ét sprog skal oplyse tallet, ellers låser testen ingenting.
    const medTal = ["da", "se", "no"].some((locale) => {
      const data = getPageData("tidszone", locale as "da" | "se" | "no");
      return data ? /\d+ (byer|städer|stader)/i.test(data.metaDescription) : false;
    });
    expect(medTal).toBe(true);
  });

  // Brand-navnet i halen klippes væk af Google, og C81 (67 titler over
  // afkortningsgrænsen) viste at netop den hale er det, der forsvinder.
  // "/tidszone" skrev "| Tidszon" i svensk og "| Tidszone" i dansk — altså
  // en afkortet form af nøgleordet i stedet for domænenavnet.
  test("/tidszone har hverken afkortet nøgleord eller afkortet brand i titlen", () => {
    for (const locale of ["da", "se", "no"] as const) {
      const data = getPageData("tidszone", locale);
      if (!data) continue;
      const hale = data.metaTitle.split("|").slice(1).join("|").trim();
      expect(hale, `${locale}: metaTitle har en hale "${hale}"`).not.toMatch(/^tidszon/i);
    }
  });

  // C194: /tidszone (24.117 visninger DA, CTR 0,4 %, pos. 7,5) skrev i titlen
  // "Hvad er klokken i USA, når den er 12 i Danmark?" — altså nul forekomster af
  // "tidszone". GSC's største søgning på siden er netop "tidszoner" (713 v,
  // pos. 9) og nummer fire er "tidsforskel" (89 v, pos. 10). Siden svarer på
  // begge i beskrivelsen, men titlen — det eneste felt Google afkorter ved
  // ~60 tegn — lovede en enkelt by-spørgsmål.
  // Harnessen er klassen, ikke den ene side: hver sides metaTitle skal indeholde
  // sit eget hovedord, så næste side der bygges om til et lokalt spørgsmål
  // fejler uden at nogen har skrevet en test til den. Modsvejs verificeret:
  // testen falder med master's page-data.ts i da og se.
  test("metaTitle indeholder sidens eget hovedord", () => {
    const generiske = /s?(beregner|kalkylator|omregner|omvandlare|converter|calc)$/;
    for (const locale of ["da", "se", "no"] as const) {
      const mangler: string[] = [];
      for (const slug of getAvailableSlugs(locale)) {
        const data = getPageData(slug, locale);
        if (!data) continue;
        const stam = data.title.toLowerCase().split(/[\s:–—-]/)[0].replace(generiske, "");
        if (stam.length < 4) continue;
        if (!data.metaTitle.toLowerCase().includes(stam)) {
          mangler.push(`${locale}/${slug} "${data.title}" → "${data.metaTitle}"`);
        }
      }
      expect(mangler, `${locale}: titler uden eget hovedord:\n${mangler.join("\n")}`).toEqual([]);
    }
  });

  // Samme fejl som over, låst på den side der fejlede: hovedordet skal stå
  // *først*, fordi C81 viste at det er den synlige del af titlen, der tæller.
  test("/tidszone starter titlen med sit eget hovedord i begge sprog", () => {
    for (const locale of ["da", "se"] as const) {
      const data = getPageData("tidszone", locale);
      if (!data) continue;
      expect(data.metaTitle.toLowerCase(), locale).toMatch(/^tidszoner/);
    }
  });

  // "nedräkning dagar" er GSC's største søgning på /nedtaelling (170 v, pos. 9).
  // Den gamle titel skrev "Nedräkning - hur många dagar", så de to ord i hoved-
  // ordet stod splittet af en tankestreger — Google læser dem som to ord.
  test("/nedtaelling har hovedordet 'nedräkning dagar' ubrudt i titlen", () => {
    const titel = getPageData("nedtaelling", "se")!.metaTitle.toLowerCase();
    expect(titel).toContain("nedräkning dagar");
    expect(titel).toContain("kvar till");
    expect(titel.length).toBeLessThanOrEqual(60);
  });

  // /leasing startede titlen med et beløb ("4.121 kr/mån"), mens GSC's to
  // største søgninger er "fåretagsleasing bil kalkyl" og "beräkna leasing bil
  // fåretag" — det ord, siden før skrev med ä, lå ikke i titlen overhovedet.
  test("/leasing titlen svarer på søgningen i stedet for at starte med et beløb", () => {
    const titel = getPageData("leasing", "se")!.metaTitle.toLowerCase();
    expect(titel).toContain("fåretagsleasing");
    expect(titel).toMatch(/beräkna|beräkn/);
    expect(titel).not.toMatch(/^\d/);
    expect(titel.length).toBeLessThanOrEqual(60);
  });
});

describe("/brok — svar på regneregel-klyngen", () => {
  // FAQ'en er mocket væk i src/app/brok/page.test.tsx (C85's fælde), så de tre
  // nye spørgsmål testes her, hvor de ligger som data — og dermed også som
  // JSON-LD, som er der Google's snippet læser.
  const da = getPageData("brok", "da")!;

  test("de tre nye spørgsmål er i den danske FAQ", () => {
    for (const spoergsmaal of [
      "Hvad er regnereglerne for brøker?",
      "Hvad er en brøkdel af et tal?",
      "Hvad er forskellen på en ægte og en uægte brøk?",
    ]) {
      expect(da.faqItems.map((f) => f.question), spoergsmaal).toContain(spoergsmaal);
    }
  });

  test("regnereglerne i FAQ'en er de samme fire som brødteksten", () => {
    // Uden denne lås kan svaret i de strukturerede data komme på afveje fra det,
    // læseren ser — C84's fejlklasse, bare i FAQ'en.
    const regler = da.faqItems.find((f) => f.question.includes("regnereglerne"))!;
    for (const stykke of ["3/6 + 2/6 = 5/6", "1/2 × 2/3 = 2/6 = 1/3", "1/2 ÷ 2/3 = 1/2 × 3/2 = 3/4"]) {
      expect(regler.answer, stykke).toContain(stykke);
    }
  });

  test("brøkdel-svaret i FAQ'en er det samme tal som brødteksten", () => {
    const brokdel = da.faqItems.find((f) => f.question.includes("brøkdel af et tal"))!;
    expect(brokdel.answer).toContain("(3 × 200) ÷ 4 = 150 kr.");
    // 3/4 = 75 %, og 75 % af 200 er 150 — krydscheck mod modulet.
    const r = forkortBrok(3, 4)!;
    expect(brokdel.answer).toContain(`${String(Math.round(r.procent)).replace(".", ",")} %`);
  });

  test("den svenske FAQ har ikke fået de danske svar", () => {
    const se = getPageData("brok", "se")!;
    const sporsmal = se.faqItems.map((f) => f.question).join(" ");
    expect(sporsmal).not.toMatch(/regnereglerne for brøker|brøkdel af et tal/);
  });

  test("elberegner SE FAQ-paritet: 7 spørgsmål som dansk", () => {
    const da = getPageData("elberegner", "da")!;
    const se = getPageData("elberegner", "se")!;
    expect(se.faqItems.length).toBe(da.faqItems.length);
    expect(se.faqItems.length).toBe(7);
    const seQuestions = se.faqItems.map((f) => f.question).join(" ");
    expect(seQuestions).toMatch(/När är elen billigast/);
    expect(seQuestions).toMatch(/När kommer morgondagens elpriser/);
    expect(seQuestions).toMatch(/Hur stor är elskatten/);
    const elskatt = se.faqItems.find((f) => f.question.includes("elskatten"));
    expect(elskatt?.answer).toContain("0,45");
    expect(elskatt?.answer).toContain("SEK");
  });
});

/**
 * Titlerne i `page-data.ts` renderer gennem `title: { absolute }`, så
 * layoutets `title.template` ("%s | <domænenavn>") **ikke** kører på dem.
 * Det betyder to ting, og begge er målt her:
 *
 * 1. En titel der selv skriver domænenavnet brænder 17 tegn af Googles
 *    ca. 60 tegn til noget læseren ikke søger på. Det var 20 strenge
 *    (`metaTitle` og `ogTitle`), hvor `Låneberegner | MinBeregner.dk`
 *    brugte 29 tegn på 12 tegn indhold.
 * 2. `ogTitle` sendes videre til Facebook og LinkedIn. Brandet kommer der
 *    fra `openGraph.siteName` (jf. `title-suffix.test.ts`), ikke fra at
 *    stå i strengen — så den plads kan bruges på indhold i stedet.
 */
describe("sidetitler bruger ikke de 17 tegn på domænenavnet", () => {
  const locales = ["da", "se", "no"] as const;

  for (const locale of locales) {
    test(`${locale}: ingen metaTitle/ogTitle skriver domænenavnet i sig`, () => {
      const offenders: string[] = [];
      for (const slug of getAvailableSlugs(locale)) {
        const data = getPageData(slug, locale);
        if (!data) continue;
        for (const [felt, vaerdi] of [
          ["metaTitle", data.metaTitle],
          ["ogTitle", data.ogTitle],
        ] as const) {
          if (vaerdi && /MinBeregner\.dk|Beregner\.no|Beräknare\.se/.test(vaerdi)) {
            offenders.push(`${slug}.${felt}: ${vaerdi}`);
          }
        }
      }
      expect(offenders).toEqual([]);
    });
  }

  // Titlen skal også *indeholde* noget efter stripping — ellers ville en
  // fejlslået regex bare have slettet hele strengen. De ti korte titler
  // får deres frigjorte tegn brugt på det værktøjet gør, hentet fra
  // sidens egen `description`, så påstanden kan efterprøves.
  test("de ti korte titler navngiver hvad værktøjet beregner", () => {
    const forventet: Record<string, RegExp> = {
      laaneberegner: /månedsydelse/i,
      billaan: /månedsydelse|ÅOP/i,
      leasing: /leasingydelse/i,
      forbrugslaan: /månedsydelse/i,
      gaeldsfri: /lavine|snebold/i,
      boliglaan: /månedsydelse|skattefradrag/i,
      elberegner: /strøm/i,
      solceller: /besparelse|tilbagebetalingstid/i,
      timepris: /skat|ferie|drift/i,
      termin: /terminsdato|graviditetsuge/i,
    };
    for (const [slug, mønster] of Object.entries(forventet)) {
      const data = getPageData(slug, "da")!;
      expect(data, slug).toBeDefined();
      expect(data.metaTitle, slug).toMatch(mønster);
      expect(data.metaTitle, slug).toBe(data.ogTitle);
    }
  });
});

// ─── /procent's egne regnestykker i FAQ'en og i norsk metaDescription.
// Samme idé som porten ovenfor: forventningerne er *regnet* af de konstanter,
// sætningen er bygger af, så porten holder i begge retninger. Indtil 2/10 stod
// alle tolv beløb i disse svar som rå tekst — og `FAQSchema` læser præcis
// `faqItems`, så de var ikke bare brødtekst men et svar i Googles rich
// resultat, som ingen port kunne se (`strengBelob` scanner kun `.tsx`).
describe("procentens egne eksempler i FAQ og metadata", () => {
  const svar = (locale: "da" | "se" | "no", spoergsmaal: string) => {
    const data = getPageData("procent", locale);
    expect(data, `procent mangler for ${locale}`).toBeDefined();
    const fund = data!.faqItems.find((f) => f.question === spoergsmaal);
    expect(fund, `svaret på «${spoergsmaal}» mangler i ${locale}`).toBeDefined();
    return fund!.answer;
  };

  test("dansk: Excel- og forskelssvaret læser RABAT_EKSEMPEL og procentForskel", () => {
    const fald = procentForskel(RABAT_EKSEMPEL.nedsatPris, RABAT_EKSEMPEL.normalPris);
    const foer = talDa(RABAT_EKSEMPEL.normalPris);
    const efter = talDa(RABAT_EKSEMPEL.nedsatPris);

    // Begge svar skal kunne sige præcis de tal, modulet regner dem til. Skrives
    // tallene i sætningen i hånden, og konstanten så ændres, bliver de her røde.
    expect(svar("da", "Hvordan regner man procent i Excel?")).toContain(
      `Et fald fra ${foer} kr til ${efter} kr er =(B1-A1)/A1*100 = ${talDa(fald, 1)} %.`,
    );
    expect(svar("da", "Hvordan regner man procentforskellen mellem to tal?")).toContain(
      `Går en pris fra ${foer} kr til ${efter} kr, er faldet (${efter} - ${foer}) / ${foer} = ${talDa(fald, 1)} %.`,
    );
  });

  test("dansk: «10 procent af 1.600» læser PROCENT_10_AF_FAQ", () => {
    expect(svar("da", "Hvad er 10 procent af 1.600?")).toBe(
      `10 procent af ${talDa(PROCENT_10_AF_FAQ)} er ${talDa(procentAf(PROCENT_10_AF_FAQ, 10))}, fordi du deler ${talDa(PROCENT_10_AF_FAQ)} med 10. Det er samme regel som 10 procent af 500 = 50.`,
    );
  });

  test("norsk: metaDescriptionens 15 %-eksempel læses fra PROCENT_15_AV_BELOEB", () => {
    const { sats, belob } = PROCENT_15_AV_BELOEB;
    expect(getPageData("procent", "no")!.metaDescription).toContain(
      `Eksempel: ${sats} % av ${talDa(belob)} kr = ${talDa(procentAf(belob, sats))} kr.`,
    );
  });

  test("svensk: de tre par læser EXCEL_ANDEL og PROCENT_SKILLNAD_EKSEMPEL", () => {
    const del = talSe(EXCEL_ANDEL.del);
    const heltal = talSe(EXCEL_ANDEL.heltal);
    const andel = talSe(EXCEL_ANDEL.del / EXCEL_ANDEL.heltal, 2);
    const andelProcent = talSe((EXCEL_ANDEL.del / EXCEL_ANDEL.heltal) * 100);

    expect(svar("se", "Hur räknar man ut procent i Excel?")).toContain(
      `${del} kr av ${heltal} kr ger ${andel}, alltså ${andelProcent} procent.`,
    );
    expect(svar("se", "Hur räknar man ut hur stor del av en summa som är X?")).toContain(
      `${del} kr av en nota på ${heltal} kr = ${del} / ${heltal} = ${andel} = ${andelProcent} procent.`,
    );

    const [loen, stigning] = PROCENT_SKILLNAD_EKSEMPEL;
    expect(svar("se", "Hur räknar man ut procent på lön?")).toContain(
      `${talSe(loen.ny)} kr mot ${talSe(loen.gammal)} kr ger ${talSe(loen.ny - loen.gammal)} / ${talSe(loen.gammal)} = ${talSe(procentForskel(loen.ny, loen.gammal))} procent.`,
    );
    const gennemsnit = talSe((stigning.gammal + stigning.ny) / 2);
    const differens = talSe(procentDifferens(stigning.gammal, stigning.ny), 1);
    expect(svar("se", "Hur räknar man ut skillnaden i procent mellan två tal?")).toContain(
      `${talSe(stigning.gammal)} till ${talSe(stigning.ny)} ger (${talSe(stigning.ny)} - ${talSe(stigning.gammal)}) / ${talSe(stigning.gammal)} = ${talSe(procentForskel(stigning.ny, stigning.gammal))} procent.`,
    );
    expect(svar("se", "Hur räknar man ut skillnaden i procent mellan två tal?")).toContain(
      `${talSe(stigning.ny - stigning.gammal)} / ${gennemsnit} = ${differens} procent för samma två tal.`,
    );
    expect(svar("se", "Hur räknar man ut skillnaden mellan två tal i Excel?")).toContain(
      `${talSe(stigning.gammal)} i A1 och ${talSe(stigning.ny)} i B1 ger ${talSe(procentForskel(stigning.ny, stigning.gammal))} procent.`,
    );
    expect(svar("se", "Hur räknar man ut skillnaden mellan två tal i Excel?")).toContain(
      `=ABS(A1-B1)/((A1+B1)/2)*100, som ger ${differens} procent för samma tal.`,
    );
  });

  test("svensk: «10 procent av 1 600» læser PROCENT_10_AF_FAQ", () => {
    expect(svar("se", "Vad är 10 procent av 1 600?")).toBe(
      `10 procent av ${talSe(PROCENT_10_AF_FAQ)} är ${talSe(procentAf(PROCENT_10_AF_FAQ, 10))}, eftersom du delar ${talSe(PROCENT_10_AF_FAQ)} med 10. Det är samma regel som 10 procent av 500 = 50.`,
    );
  });

  test("de tre sprog svarer hver med sit eget tegnsæt, ikke med dansk", () => {
    // 1 600 skrives med punktum på dansk og med mellemrum på svensk. En fælles
    // konstant uden formatering ville givet den danske skrivemåde videre til
    // beraknare.se — fejlen i review-fundet fra 2/10, i en ny udgave.
    expect(svar("da", "Hvad er 10 procent af 1.600?")).toContain("1.600");
    expect(svar("se", "Vad är 10 procent av 1 600?")).toContain("1 600");
    expect(svar("se", "Vad är 10 procent av 1 600?")).not.toContain("1.600");
  });
});
