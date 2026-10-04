import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { tidsskillnadRaekker } from "@/lib/tidszone-eksempler";
import {
  tidsforskelsRækker,
  tidsforskelBy,
  tidsforskelTekst,
} from "@/lib/tidszone-reference";
import { usaTimerRaekker, afvigendeDage } from "@/lib/tidszone-usa-timer";
import { usaStatRaekker } from "@/lib/tidszone-usa-stater";
import TidszonePage from "./page";

vi.mock("@/components/TidszoneBeregner", () => ({
  default: () => <div>Tidszoneværktøj</div>,
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

describe("tidszone page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Når det er 12 i Danmark, er det 06 i New York",
      lead: "Klokken 12 i Danmark er",
      row: "<td>New York</td>",
      values: "<td>06:00</td>",
      tableHeader: "Vintertid (kl. 12 CET)",
    },
    {
      locale: "se" as const,
      heading: "När det är 12 i Sverige är det 06 i New York",
      lead: "Klockan 12 i Sverige är",
      row: "<td>New York</td>",
      values: "<td>06:00</td>",
      tableHeader: "Vintertid (kl. 12 CET)",
    },
  ])("viser det konkrete svar og beregneren i $locale", async ({ locale, heading, lead, row, values, tableHeader }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await TidszonePage());

    expect(html).toContain(`>${heading}<`);
    expect(html).toContain(lead);
    expect(html).toContain(tableHeader);
    expect(html).toContain(row);
    expect(html).toContain(values);
    expect(html).toContain("Tidszoneværktøj");
  });

  test.each(["da", "se"] as const)(
    "metadata i %s svarer direkte paa tidsspoergsmaalet",
    (locale) => {
      const pageData = getPageData("tidszone", locale);
      expect(pageData).toBeDefined();
      const metaTitle = pageData!.metaTitle;
      const metaDescription = pageData!.metaDescription;

      expect(metaTitle.length).toBeLessThanOrEqual(60);
      expect(metaDescription.length).toBeLessThanOrEqual(160);
      expect(metaTitle).toMatch(/USA/);
      expect(metaTitle).toMatch(/12/);
      expect(metaDescription).toMatch(/New York/);
      expect(pageData!.ogTitle).toMatch(/New York/);
      expect(pageData!.schemaDescription).toBeTruthy();
    }
  );
});

describe("tidszone svar-først-tabeller for lande og Excel", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      landeHeading: "Tidsforskel til de lande, folk spørger om",
      excelHeading: "Sådan regner du tidsforskel ud i Excel",
      lande: ["<td class=\"py-2 pr-4\">Japan</td>", "<td class=\"py-2 pr-4\">Tyrkiet</td>", "<td class=\"py-2 pr-4\">Spanien</td>", "<td class=\"py-2 pr-4\">USA</td>"],
      vinter: "<td class=\"py-2 pr-4\">6 timer bagefter</td>",
      sommerUdenSommertid: "<td class=\"py-2 pr-4\">7 timer frem</td>",
      sommerSamme: "Samme som vintertid",
      formel: "=B1-A1",
      forbudt: ["Samma som vintertid"],
    },
    {
      locale: "se" as const,
      landeHeading: "Tidsskillnad till de länder folk frågar om",
      excelHeading: "Så räknar du ut tidsskillnad i Excel",
      lande: ["<td class=\"py-2 pr-4\">Japan</td>", "<td class=\"py-2 pr-4\">Turkiet</td>", "<td class=\"py-2 pr-4\">Spanien</td>", "<td class=\"py-2 pr-4\">USA</td>"],
      vinter: "<td class=\"py-2 pr-4\">6 timmar bakåt</td>",
      sommerUdenSommertid: "<td class=\"py-2 pr-4\">7 timmar framåt</td>",
      sommerSamme: "Samma som vintertid",
      formel: "=B1-A1",
      forbudt: [],
    },
  ])(
    "$locale svarer på tidsforskel pr. land og i Excel",
    async ({ locale, landeHeading, excelHeading, lande, vinter, sommerUdenSommertid, sommerSamme, formel }) => {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

      const html = renderToStaticMarkup(await TidszonePage());

      expect(html).toContain(landeHeading);
      expect(html).toContain(excelHeading);
      for (const land of lande) {
        expect(html).toContain(land);
      }
      expect(html).toContain(vinter);
      expect(html).toContain(sommerUdenSommertid);
      expect(html).toContain(sommerSamme);
      expect(html).toContain(formel);
      expect(html).toContain("=(B1-A1)*24");
      // React escaper " som &quot; i markupken.
      expect(html).toContain("=DATEDIF(A1;B1;&quot;h&quot;)");
      expect(html).toContain("=B1-A1+(B1&lt;A1)");
    }
  );

  test("den svenska landetabel bruger svenska landnamn, ikke danske", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await TidszonePage());

    expect(html).toContain("<td class=\"py-2 pr-4\">Grekland</td>");
    expect(html).toContain("<td class=\"py-2 pr-4\">Turkiet</td>");
    expect(html).not.toContain("<td class=\"py-2 pr-4\">Grækenland</td>");
    expect(html).not.toContain("<td class=\"py-2 pr-4\">Tyrkiet</td>");
  });

  test("landetabellen viser Grønland, som dansk autocomplete spørger om først", async () => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));

    const html = renderToStaticMarkup(await TidszonePage());

    // "tidsforskel grønland" er nr. 1 og "tidszoner grønland" nr. 13 i
    // dansk autocomplete, og Nuuk la allerede i bytabellen.
    expect(html).toContain("<td class=\"py-2 pr-4\">Grønland</td>");
    expect(html).toContain("<td class=\"py-2 pr-4\">4 timer bagefter</td>");
    // Nuuk skifter paa EU's datoer, saa der er ingen særskilt sommervaerdi.
    expect(html).toContain("Samme som vintertid");
    // Canada er bevidst udeladt fra *landetabellen* — Toronto skifter paa
    // nordamerikanske datoer, saa en konstant vaerdi ville vaere forkert i
    // tre uger om aaret. Laesen ligger paa tabel-raekkerne, ikke paa hele
    // siden: FAQ'en nævner Canada om Toronto, og den er mocked ud her, saa
    // et negativt laes paa hele HTML'en ville vaere groent uanset koden.
    const tabelRaekker = [...html.matchAll(/<td class="py-2 pr-4">([^<]+)<\/td>/g)].map(
      (m) => m[1]
    );
    expect(tabelRaekker).toContain("Grønland");
    expect(tabelRaekker).not.toContain("Canada");
  });

  test("sætningen om byerne og tabellen er bygget af samme liste, så de ikke kan glide fra hinanden", async () => {
    for (const locale of ["da", "se"] as const) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

      const html = renderToStaticMarkup(await TidszonePage());
      const raekker = tidsskillnadRaekker(locale);

      // Den indledende sætning til landetabellen skal navngive præcis de
      // byer, tabellen viser. Skrev den bynavne som tekst, kunne den ikke se
      // et land, der kom til siden — og det er præcis det, der skete med
      // Grønland, da det blev føjet til tabellen.
      const overskrift = html.indexOf(
        locale === "da"
          ? "Tidsforskel til de lande"
          : "Tidsskillnad till de länder"
      );
      expect(overskrift).toBeGreaterThan(-1);
      const tabel = html.indexOf("<table", overskrift);
      expect(tabel).toBeGreaterThan(overskrift);
      const afsnit = html.slice(overskrift, tabel);
      for (const raekke of raekker) {
        expect(afsnit).toContain(raekke.by);
      }
    }
  });

  test("hver sproggren har præcis sin egen enhed, ikke den andens", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const se = renderToStaticMarkup(await TidszonePage());

    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
    const da = renderToStaticMarkup(await TidszonePage());

    expect(se).toContain("timmar");
    expect(se).toContain("framåt");
    expect(se).toContain("bakåt");
    // "framat" er ikke et svenskt ord — fundet fordi testen faldt paa det.
    expect(se).not.toContain("framat");
    expect(se).not.toContain("timer bagefter");
    expect(se).not.toContain("timer frem");
    expect(da).toContain("timer frem");
    expect(da).not.toContain("timmar");
  });

  test("begge sprog har nu faq-spørgsmål om lande, sommertid og Excel", () => {
    for (const locale of ["da", "se"] as const) {
      const faq = getPageData("tidszone", locale)!.faqItems;
      const spg = faq.map((f) => f.question);
      const svar = faq.map((f) => f.answer).join(" ");

      // C120's lære: et tal i en test bliver en ny målefejl, når næste
      // rettelse tilføjer et spørgsmål. Lås pariteten og indholdet i stedet.
      expect(faq.length).toBe(getPageData("tidszone", locale === "da" ? "se" : "da")!.faqItems.length);
      // Én spørgsmål der spørger på forskellen til landene, ikke bare på
      // klokkeslættet i dem.
      expect(
        spg.filter((q) => /Japan/.test(q) && /(forskel|skillnad)/.test(q)).length
      ).toBe(1);
      expect(spg.some((q) => /Excel/.test(q))).toBe(true);
      expect(svar).toContain("=B1-A1");
      // C120's lære: et negativt lås på den danske streng er et lås på
      // tilstanden før rettelsen, så der kræves de positive i stedet.
      if (locale === "se") {
        expect(faq.some((f) => /Turkiet/.test(f.question))).toBe(true);
        expect(faq.some((f) => /varför skiljer sig/i.test(f.question))).toBe(true);
      } else {
        expect(faq.some((f) => /Tyrkiet/.test(f.question))).toBe(true);
        expect(faq.some((f) => /Hvorfor er der forskel/.test(f.question))).toBe(true);
      }
    }
  });

  test("svarene i faq'en er de samme tal som tabellen på siden", () => {    for (const locale of ["da", "se"] as const) {
      const faq = getPageData("tidszone", locale)!.faqItems;
      const svar = faq.find((f) => /Japan/.test(f.question) && /(forskel|skillnad)/.test(f.question))!.answer;
      // Japan: 7 timer frem i dansk/svensk sommertid, 8 om vinteren.
      // Dansk siger "frem", svensk siger "framåt" — begge er korrekte,
      // saa formen laases pr. sprog og ikke som én regex paa tværs.
      if (locale === "se") {
        expect(svar).toMatch(/7 timmar framåt/);
      } else {
        expect(svar).toMatch(/7 timer frem/);
      }
      // Svensk siger "aerv" og "och", dansk "er" og "og". Laas pr. sprog:
      // en regex paa tvaers gennem sprogene gaar altid falsk paa den ene.
      if (locale === "se") {
        expect(svar).toContain("I vintertid är det 8, 7 och 3 timmar");
      } else {
        expect(svar).toContain("I vintertid er det 8, 7 og 3 timer");
      }
    }
  });
});

describe("tidszone svarer på de andre klokkeslæt end kl. 12", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      overskrift: "Når det er 21 i Danmark, er det 15 i New York",
      kolonne: "Når det er i Danmark",
      række21: ["<td>15:00</td>", "<td>14:00</td>", "<td>12:00</td>"],
      række14: ["<td>08:00</td>", "<td>07:00</td>", "<td>05:00</td>"],
      række16: ["<td>10:00</td>", "<td>09:00</td>", "<td>07:00</td>"],
      forklaring: "anden søndag i marts",
    },
    {
      locale: "se" as const,
      overskrift: "När det är 21 i Sverige är det 15 i New York",
      kolonne: "När det är i Sverige",
      række21: ["<td>15:00</td>", "<td>14:00</td>", "<td>12:00</td>"],
      række14: ["<td>08:00</td>", "<td>07:00</td>", "<td>05:00</td>"],
      række16: ["<td>10:00</td>", "<td>09:00</td>", "<td>07:00</td>"],
      forklaring: "andra söndagen i mars",
    },
  ])(
    "$locale tabellen svarer på kl. 21, 14 og 16, som autocomplete spørger om",
    async ({ locale, overskrift, kolonne, række21, række14, række16, forklaring }) => {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

      const html = renderToStaticMarkup(await TidszonePage());

      expect(html).toContain(`>${overskrift}<`);
      expect(html).toContain(kolonne);
      expect(html).toContain("<th>New York</th>");
      expect(html).toContain("<th>Chicago</th>");
      expect(html).toContain("<th>Los Angeles</th>");
      for (const celle of [...række21, ...række14, ...række16]) {
        expect(html).toContain(celle);
      }
      // Fælden der gør svaret rigtigt: USA skifter anden søndag i marts,
      // Danmark sidste. Derfor er der dage hvor forskellen er 5 timer, og
      // siden skal sige det — ellers læser en bruger tabellen som "altid 6".
      // (Testens gamle begrundelse sagde, at USA skifter "på samme datoer som
      // Danmark", hvilket er målt falsk; `tidszone-usa-timer.test.ts` låser
      // nu dagetallet i stedet.)
      expect(html).toContain(forklaring);
      expect(html).toContain(String(afvigendeDage()));
    }
  );

  test("tabellens celler er modulets tal, ikke tal skrevet i JSX", async () => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));

    const html = renderToStaticMarkup(await TidszonePage());
    const overskrift = html.indexOf("Når det er 21 i Danmark");
    expect(overskrift).toBeGreaterThan(-1);
    const tabelSlut = html.indexOf("</table>", overskrift);
    const blok = html.slice(overskrift, tabelSlut);

    for (const raekke of usaTimerRaekker()) {
      for (const vaerdi of raekke.klokkeslaet) {
        expect(blok).toContain(`<td>${vaerdi}</td>`);
      }
    }
  });

  test("kl. 12-tabellen og time-tabellen er én tabel, ikke to sider", async () => {
    // Siden svarede allerede paa kl. 12. Hvis time-tabellen gav et andet
    // svar paa det samme klokkeslaet, vilde den modsige den.
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));

    const html = renderToStaticMarkup(await TidszonePage());
    const gammel = html.indexOf("Vintertid (kl. 12 CET)");
    const ny = html.indexOf("Når det er 21 i Danmark");
    expect(gammel).toBeGreaterThan(-1);
    expect(ny).toBeGreaterThan(gammel);
    expect(html.slice(gammel, ny)).toContain("<td>06:00</td>");
    expect(html.slice(ny)).toContain("<td>06:00</td>");
  });

  test("time-tabellen findes i begge sprog og ingen i no", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const se = renderToStaticMarkup(await TidszonePage());
    expect(se).toContain("När det är 21 i Sverige är det 15 i New York");

    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
    const da = renderToStaticMarkup(await TidszonePage());
    expect(da).toContain("Når det er 21 i Danmark, er det 15 i New York");
    expect(da).not.toContain("När det är 21 i Sverige");
  });

  test("faq'en svarer paa kl. 21 med de samme tal som tabellen", () => {
    for (const locale of ["da", "se"] as const) {
      const faq = getPageData("tidszone", locale)!.faqItems;
      const spg = faq.filter((f) => /21/.test(f.question) && /(Danmark|Sverige)/.test(f.question));
      // C120's laere: et hardkodet antal naar et spaergsmaal fojes til.
      expect(spg.length).toBe(1);
      const svar = spg[0].answer;
      for (const vaerdi of ["15", "14", "12"]) {
        expect(svar).toContain(vaerdi);
      }
      // Paritet mellem sprogene laases mod den anden gren, ikke mod et tal.
      const andet = getPageData("tidszone", locale === "da" ? "se" : "da")!.faqItems;
      expect(faq.length).toBe(andet.length);
    }
  });
});

describe("tidszone stat-tabel for USA", () => {
  test("stat-tabellen findes i begge sprog med ni rækker og ingen i no", async () => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
    const da = renderToStaticMarkup(await TidszonePage());
    expect(da).toContain("Når det er 12 i Danmark, er det 06 i Florida");

    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const se = renderToStaticMarkup(await TidszonePage());
    expect(se).toContain("När det är 12 i Sverige är det 06 i Florida");

    vi.mocked(getLocale).mockResolvedValue("no");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("no"));
    const no = renderToStaticMarkup(await TidszonePage());
    expect(no).not.toContain("Florida");
    expect(no).not.toContain("Kalifornien");
  });

  test("alle ni stat-navne staar i den danske og svenska tabel", async () => {
    const forventedeDa = [
      "Florida", "Californien", "Texas", "Washington",
      "Georgia", "Arizona", "Colorado", "Minnesota", "Massachusetts",
    ];
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
    const da = renderToStaticMarkup(await TidszonePage());
    for (const stat of forventedeDa) expect(da).toContain(stat);

    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const se = renderToStaticMarkup(await TidszonePage());
    // Svensk oversaetter Californien; de otte andra hedder det samme.
    for (const stat of forventedeDa) {
      expect(se).toContain(stat === "Californien" ? "Kalifornien" : stat);
    }
    expect(se).not.toContain(">Californien<");
  });

  test("cellerne er modulets tal, laest fra tabellens rækker - ikke fra hele HTML'en", async () => {
    // C155's laere: et grep paa hele siden taeler de samme tal ogsaa i
    // time-tabellen, saa det kan ikke skelne stat-tabellen fra den anden.
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
    const html = renderToStaticMarkup(await TidszonePage());

    const raekker = usaStatRaekker("da");
    const rækkeMed = (stat: string) =>
      html.slice(
        html.indexOf(`<td>${stat}</td>`),
        html.indexOf("</tr>", html.indexOf(`<td>${stat}</td>`))
      );

    for (const raekke of raekker) {
      const celle = rækkeMed(raekke.stat);
      expect(celle).toContain(`<td>${raekke.by}</td>`);
      expect(celle).toContain(`<td>${raekke.vinter}</td>`);
      expect(celle).toContain(`<td>${raekke.sommer}</td>`);
    }
  });

  test("Arizona-undtagelsen staar i teksten med de rigtige tal", async () => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
    const da = renderToStaticMarkup(await TidszonePage());
    // JSX bryder teksten paa nye linjer, saa assertionen laeser den
    // sammensatte saetning - ikke en enkelt linje af markupken.
    const daSaetning = da
      .replace(/<!--.*?-->/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ");
    expect(daSaetning).toContain(
      "mens Phoenix står på 04 vinter og 03 sommer"
    );
    expect(daSaetning).toContain(
      "flytter Denver sig med, så den står på 04 hele året"
    );

    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const se = renderToStaticMarkup(await TidszonePage());
    const seSaetning = se
      .replace(/<!--.*?-->/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ");
    expect(seSaetning).toContain(
      "medan Phoenix står på 04 vinter och 03 sommar"
    );
    expect(seSaetning).toContain(
      "flyttar Denver med, så den står på 04 hela året"
    );
  });

  test("faq'en svarer paa stat-klyngen i begge sprog, med præcis ét par pr. spørgsmål", () => {
    for (const locale of ["da", "se"] as const) {
      const faq = getPageData("tidszone", locale)!.faqItems;
      const statSporgsmaal = faq.filter((f) => /Florida/.test(f.question));
      expect(statSporgsmaal.length).toBe(1);
      // Svaret skal naevne de fire zoner klyngen spoerger om.
      expect(statSporgsmaal[0].answer).toContain("Eastern");
      expect(statSporgsmaal[0].answer).toContain("Central");
      expect(statSporgsmaal[0].answer).toContain("Pacific");

      const arizona = faq.filter((f) => /Phoenix/.test(f.question));
      expect(arizona.length).toBe(1);
      // Svensk siger "sommar", dansk "sommer", saa aarstalet laeses via
      // regex paa den danske del af tallene, ikke paa ordet ved siden.
      expect(arizona[0].answer).toContain("04 vinter");
      expect(arizona[0].answer).toMatch(/0?3 sommer|sommar/);

      // Paritet mellem sprogene laeses mod den anden gren (C120's laere).
      const andet = getPageData("tidszone", locale === "da" ? "se" : "da")!.faqItems;
      expect(faq.length).toBe(andet.length);
    }
  });

  test("stat-navnene ligger i keywords i begge sprog", () => {
    for (const locale of ["da", "se"] as const) {
      const keywords = getPageData("tidszone", locale)!.keywords.join(" ").toLowerCase();
      for (const søgning of ["florida", "miami", "texas", "california", "arizona"]) {
        expect(keywords).toContain(søgning);
      }
    }
  });

  test("de populære tidsforskelle er de regnede, i begge sprog", async () => {
    // Tallet for Sydney stod i JSX som "9-10 timer foran", mens TIDSZONER og
    // sommertid.ts giver 8-10. Listen læses nu fra `tidsforskelsRækker`, så
    // denne test falder, hvis nogen gaar tilbage til haandskrevne tal.
    for (const locale of ["da", "se"] as const) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

      const html = renderToStaticMarkup(await TidszonePage());
      const spoergsprog = locale === "da" ? "da" : "se";
      const raekker = tidsforskelsRækker(
        ["London", "New York", "Los Angeles", "Tokyo", "Sydney"],
        spoergsprog
      );

      for (const raekke of raekker) {
        const by = tidsforskelBy(raekke, spoergsprog);
        const tekst = tidsforskelTekst(raekke, spoergsprog);
        // Byen staar i <strong>, forskellen i den followinge tekstnode, saa
        // hele raekken slaas sammen for at ramme den renderede markup.
        expect(html).toContain(`<strong>${by}:</strong> ${tekst}`);
      }

      // Sydney maa ikke skrive det gamle 9-10, og den skal ligge foran.
      const sydney = raekker.find((r) => r.by === "Sydney")!;
      expect(tidsforskelTekst(sydney, spoergsprog)).toMatch(/^8-10 /);
      expect(html).not.toContain("9-10");
    }
  });
});

describe("tidszone giver hver landside en indgang", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  // 2/10: de 24 nye sider (12 lande paa hvert domaene, nu 14) var kun linkede til
  // hinanden og linkede selv til /tidszone — vejen den anden vej var tom, saa
  // /tidszone (24.358 visninger, 0,4 % CTR, pos. 7,6) ikke gav dem et eneste
  // indlaeg. Porten dommer paa den *renderede* side, fordi en href paa det
  // forkerte domaene er usynlig i kilden: listen af lande er den samme paa
  // begge domaener, saa kun prefixen kan vaere forkeret. Slugs og navne er
  // skrevet som litteraler her — ikke læst fra KLOKKEN_LANDE — fordi en port
  // der laeser sin forventning fra det samme modul som koden, ikke kan se
  // en fejl i modulet. Tilfojes et land, skal porten vaere med.
  const SLUGS_DA = [
    "usa", "thailand", "australien", "japan", "tyrkiet", "canada",
    "kina", "indien", "england", "spanien", "brasilien", "portugal",
    // 4/10 05:1x: Danmarks narmeste naboer, malt paa dansk autocomplete.
    "norge", "tyskland",
  ];
  const SLUGS_SE = [
    "usa", "thailand", "australien", "japan", "turkiet", "kanada",
    "kina", "indien", "england", "spanien", "brasilien", "portugal",
    // 4/10 05:1x: Danmarks narmeste naboer, malt paa dansk autocomplete.
    "norge", "tyskland",
  ];

  test.each([
    { locale: "da" as const, prefix: "/klokken-i/", slugs: SLUGS_DA, spoergsmaal: "Hvad er klokken i", anker: ["Japan", "Tyrkiet", "USA"], andet: "/klockan-i/", andetTekst: "Vad är klockan i" },
    { locale: "se" as const, prefix: "/klockan-i/", slugs: SLUGS_SE, spoergsmaal: "Vad är klockan i", anker: ["Japan", "Türkiet", "Kanada"], andet: "/klokken-i/", andetTekst: "Hvad er klokken i" },
  ])(
    "$locale linker til alle 14 landesider med spoergsmaalstekst som anker",
    async ({ locale, prefix, slugs, spoergsmaal, anker, andet, andetTekst }) => {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

      const html = renderToStaticMarkup(await TidszonePage());

      for (const slug of slugs) {
        expect(html).toContain(`href="${prefix}${slug}"`);
      }
      // Ankerteksten er hele spoergsmaalet, saa den ikke kan vaere et navn
      // der ikke svaerer til den side den peger paa. Tyrkiet/Türkiet og
      // Canada/Kanada er de to, hvor de to domaener har forskellige navne.
      for (const navn of anker) {
        expect(html).toContain(`>${spoergsmaal} ${navn}?</a>`);
      }

      // Præcis de 14 — ikke flere, ikke færre — og intet fra det andet domaene.
      const links = [...html.matchAll(new RegExp(`href="${prefix}[a-z-]+"`, "g"))];
      expect(links).toHaveLength(slugs.length);
      expect(html).not.toContain(`href="${andet}`);
      expect(html).not.toContain(andetTekst);
    }
  );

  // Samme fejlklasse som de manglende {" "} i C55/C56: JSX bevarer flere
  // mellemrum paa én linje, saa den svenske landetabel-boen skrev "eftersom"
  // med elleve mellemrum foran det foerste gaense citat. tsc, lint og build
  // ser det ikke — det er synligt i markupken, og derfor laeses her.
  test("den svenska landetabel-sætning har ét mellemrum foran citatet", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await TidszonePage());

    expect(html).toContain("eftersom &quot;tidsskillnad Japan&quot;,");
  });
});
