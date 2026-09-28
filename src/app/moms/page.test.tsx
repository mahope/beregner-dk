import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { formatNumber } from "@/lib/format";
import { beregnMoms, momsFaktor } from "@/lib/moms";
import MomsPage from "./page";

vi.mock("@/components/MomsBeregner", () => ({
  default: () => <div>Momsværktøj</div>,
}));
vi.mock("@/components/AffiliateBox", () => ({
  SelvstaendigAffiliate: () => null,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({
  default: ({ items }: { items: { question: string; answer: string }[] }) => (
    <ul>
      {items.map((item) => <li key={item.question}>{item.question} {item.answer}</li>)}
    </ul>
  ),
}));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

describe("moms page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Momsberegner",
      answer: "Beregn dansk moms på 25 %. Læg moms til 1.000 kr. og få 1.250 kr. Træk også moms fra en pris inkl. moms, eller find momsandelen.",
      schema: "Gratis momsberegner. Beregn dansk moms på 25 % med priser inkl. og ekskl. moms.",
    },
    {
      locale: "se" as const,
      heading: "Momskalkylator",
      answer: "Beräkna svensk moms på 25 %, 12 % eller 6 %. Lägg till 1 000 kr. och få 1 250 kr. Dra av moms eller hitta momsandelen.",
      schema: "Gratis momskalkylator. Beräkna svensk moms på 25 %, 12 % och 6 % med priser inkl. och exkl. moms.",
    },
  ])("viser det konkrete svar, schema og beregneren i $locale", async ({ locale, heading, answer, schema }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await MomsPage());

    expect(html).toContain(`>${heading}</h1>`);
    expect(html).toContain(answer);
    expect(html).toContain(schema);
    expect(html).toContain("Momsværktøj");
  });

  test("viser formler for alle svenska momssatser i synlig FAQ", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await MomsPage());

    expect(html).toContain("1 000 kr × 1,25 = 1 250 kr, × 1,12 = 1 120 kr eller × 1,06 = 1 060 kr");
    expect(html).toContain("Momsandelen är cirka 20 % vid 25 % moms, 10,71 % vid 12 % och 5,66 % vid 6 %");
  });

  test("svarer på de spørgsmål den danske søgeklynge stiller: bøger, fødevarer og 25 % fra", async () => {
    const html = renderToStaticMarkup(await MomsPage());

    // "moms på bøger" og "moms på bøger afskaffes hvornår" — autocomplete, 0 svar før denne.
    expect(html).toContain("En bog til 249 kr.");
    // Rettet fra "Bøger, avis og forbrugsudstyr: uden moms", som lå i den
    // synlige liste og var fagligt forkert — forbrugsudstyr har 25 %.
    expect(html).toContain("Bøger, aviser og tidsskrifter:");
    // "moms på fødevarer" / "moms på frugt og grønt" — Danmark har kun 25 %.
    expect(html).toContain("Der er kun én dansk momssats");
    expect(html).toContain("En fødevare til 80 kr. ekskl. moms koster 100 kr. inkl. moms");
    // "hvordan trækker man moms fra et beløb" og de fem variationer under det.
    expect(html).toContain("1.250 kr. inkl. moms ÷ 1,25 = 1.000 kr. ekskl. moms");
    // "tysk moms fra" — dansk virksomhed, tysk leverandør.
    expect(html).toContain("En dansk virksomhed, der køber tjenester i Tyskland, betaler ikke tysk moms");
  });

  test("den danske side siger ikke, at bøger har 0 % moms", async () => {
    const html = renderToStaticMarkup(await MomsPage());

    // Undtaget fra momsloven er ikke det samme som 0 % moms. Den gamle liste sagde
    // "Aviser og tidsskrifter (0% moms)", som er en fejl i lovterminologien.
    expect(html).not.toContain("Aviser og tidsskrifter (0% moms)");
  });

  test("svarer på 'moms baglæns' med regel, tabel og den fælde 20 % skaber", async () => {
    const html = renderToStaticMarkup(await MomsPage());

    // "hvordan beregner man moms baglæns" + "hvordan beregner man prisen uden
    // moms" + "hvordan beregner man uden moms" — autocomplete, 0 svar før denne.
    expect(html).toContain("Sådan beregner du moms baglæns");
    expect(html).toContain("del med 1,25");
    // Tabel fra fratraekRaekker(25) — 1.250 -> 1.000 -> 250, pr. række.
    expect(html).toContain("1.250 kr.");
    expect(html).toContain("1.000 kr.");
    expect(html).toContain("250 kr.");
    // 499 kr. er det beløb, der gør forskellen mellem 20 %-metoden og ÷ 1,25
    // synlig. Forventningerne kommer fra beregnMoms, ikke fra hånden — saa
    // tallene kan ikke glide fra de, regnestykket viser.
    const med499 = beregnMoms(499, "fratraekMoms", 25);
    expect(html).toContain(`${formatNumber(med499.prisUdenMoms, "da", { maximumFractionDigits: 2 })} kr.`);
    expect(html).toContain(`${formatNumber(med499.momsBeloeb, "da", { maximumFractionDigits: 2 })} kr.`);
    // Tilbagekoblingen: 1.000 ekskl. x 1,25 = 1.250 inkl.
    expect(html).toContain("1.000 kr. ekskl.");
  });

  test("gør fælden ved 25 % fire gange eksplicit", async () => {
    const html = renderToStaticMarkup(await MomsPage());

    // 1,25^4 = 2,4414 mens (1-0,2)^4 = 0,4096 — det er hele pointen, og begge
    // tal er skrevet, så læseren kan se forskellen.
    expect(html).toContain("Momsen fire gange i træk");
    expect(html).toContain("2,4414");
    expect(html).toContain("0,4096");
    expect(html).toContain("Beregn kun med 25 %, aldrig med 20 % gentaget.");
  });

  test("hvert led i 25 %-regnestykket kan efterprøves af læseren", async () => {
    const html = renderToStaticMarkup(await MomsPage());

    // Uden afrunding, ellers er kæden ikke et regnestykke: 1.000 x 1,25 er
    // 1.250, og 1.250 x 1,25 er 1.562,50 — ikke "1.560".
    const faktor = momsFaktor(25);
    for (const start of [100, 1000]) {
      const trin = [1, 2, 3, 4].map((n) => start * faktor ** n);
      for (const tal of trin) {
        expect(html).toContain(
          `${formatNumber(tal, "da", { maximumFractionDigits: 2 })} kr.`
        );
      }
      // 1,5625 i fjerde potens: ingen afrunding i kæden over den endelige pris.
      expect(html).not.toContain(
        `${formatNumber(Math.round(trin[1] / 10) * 10, "da", { maximumFractionDigits: 2 })} kr. × 1,25`
      );
    }
  });


  test("viser momsberegneren i Excel med dansk semikolon-not", async () => {
    const html = renderToStaticMarkup(await MomsPage());

    expect(html).toContain("Momsberegneren i Excel");
    expect(html).toContain("=MOMS(A1;25;0;0)");
    expect(html).toContain("=A1+MOMS(A1;25;0;0)");
    expect(html).toContain("=A1/1,25");
    expect(html).toContain("=MOMS(A1/1,25;25;0;0)");
    expect(html).toContain("=A1-A1/1,25");
    expect(html).toContain("semikolon");
  });

  test("de nye tal i brødteksten er dem, modulet regner", async () => {
    const html = renderToStaticMarkup(await MomsPage());

    // Krydscheck mod beregnMoms, så en indskrevet fejl ikke kan overleve.
    for (const sats of [25]) {
      const faktor = 1 + sats / 100;
      for (const inkl of [1250, 499, 2000]) {
        const ekskl = inkl / faktor;
        const moms = inkl - ekskl;
        expect(html).toContain(
          `${formatNumber(ekskl, "da", { maximumFractionDigits: 2 })} kr.`
        );
        expect(html).toContain(`${formatNumber(moms, "da", { maximumFractionDigits: 2 })} kr.`);
      }
    }
  });

  test("den danske side siger ikke, at forbrugsudstyr er uden moms", async () => {
    const html = renderToStaticMarkup(await MomsPage());

    // En vaskemaskine og en telefon er 25 % moms i Danmark. Den gamle liste
    // skrev "Bøger, avis og forbrugsudstyr: uden moms", hvilket er en
    // faglig fejl — og den laa i den synlige brødtekst.
    expect(html).not.toContain("Bøger, avis og forbrugsudstyr");
    expect(html).toContain("Forbrugsudstyr, telefoner og møbler:");
  });

  test("de nye spørgsmål står i den danske FAQ og dermed i JSON-LD", async () => {
    const html = renderToStaticMarkup(await MomsPage());

    for (const spg of [
      "Hvordan beregner man moms baglæns?",
      "Hvordan bruger man MOMS-funktionen i Excel?",
      "Hvorfor er der kun én momssats, når nogle lande har flere?",
    ]) {
      expect(html).toContain(spg);
    }
  });

  test("svarar på 'räkna ut moms baklänges' med regel, tabell och 499-fällan", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await MomsPage());

    // "räkna ut moms baklänges" — autocomplete nr. 2, 0 svar før denne.
    expect(html).toContain("Så räknar du ut moms baklänges");
    expect(html).toContain("dela med 1,25");
    // Tabell från baklaengesTabel() — 1 250 -> 1 000 -> 250, pr. rad.
    expect(html).toContain("1 250 kr");
    expect(html).toContain("1 000 kr");
    expect(html).toContain("250 kr");
    // 499 kr är det belopp som gör skillnaden mellan 20 %-metoden och ÷ 1,25
    // synlig. Forventningerne kommer fra beregnMoms, inte från handen.
    const med499 = beregnMoms(499, "fratraekMoms", 25);
    expect(html).toContain(`${formatNumber(med499.prisUdenMoms, "se", { maximumFractionDigits: 2 })} kr`);
    expect(html).toContain(`${formatNumber(med499.momsBeloeb, "se", { maximumFractionDigits: 2 })} kr`);
    // Tillbakakopplingen: 1 000 exkl. × 1,25 = 1 250 inkl.
    expect(html).toContain("1 000 kr exkl.");
  });

  test("visar momsberegnern i Excel med svenska formler — ingen dansk MOMS()", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await MomsPage());

    // Svensk Excel har ingen inbyggd momsfunktion — formlarna är enkla
    // multiplikationer, inte den danska MOMS()-funktionen.
    expect(html).toContain("Moms i Excel");
    expect(html).toContain("=A1*1,25");
    expect(html).toContain("=A1/1,25");
    expect(html).toContain("=A1*0,20");
    expect(html).toContain("=A1-A1/1,25");
    expect(html).toContain("semikolon");
    // Negativ lås: den danska MOMS()-funktionen finns inte i svensk Excel.
    expect(html).not.toContain("=MOMS(");
  });

  test("nya spørgsmål står i den svenska FAQ och dermed i JSON-LD", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await MomsPage());

    for (const spg of [
      "Hur räknar man ut moms baklänges?",
      "Hur beräknar man moms i Excel?",
    ]) {
      expect(html).toContain(spg);
    }
  });

  test("den svenska sidan läcker ingen danske markører", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await MomsPage());

    // "baglæns" er dansk — svensk är "baklänges". MOMS() er dansk Excel.
    expect(html).not.toContain("baglæns");
    expect(html).not.toContain("=MOMS(");
  });
});
