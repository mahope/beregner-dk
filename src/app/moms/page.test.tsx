import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { formatNumber } from "@/lib/format";
import { beregnMoms, DEFAULT_MOMS_SATS, momsAndel, momsFaktor, MOMS_REFERENCE_BELOEB } from "@/lib/moms";
import { momsSatsUdenraekke, udenlandRaeekker } from "@/lib/moms-eu";
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

  /**
   * Fund 1/10: de tre sidste rækker i Excel-tabellen regner på et beløb *med*
   * moms, men overskriften sagde «På 1.000 kr. ekskl. moms» — og resultaterne
   * var dem for 1.000 kr. *inkl.* moms. `=A1/1,25` med A1 = 1.000 er 800, ikke
   * 1.000, og `=MOMS(800;25;0;0)` er 200, ikke 250. Læseren kopierede formlerne
   * og fik et tal, der ikke hang sammen med det, cellen viste.
   *
   * Nu står grundlaget i hver række, og alle tal læses fra `beregnMoms`.
   */
  test("de tre baglæns-rækker viser 800, 200 og 200 for 1.000 kr. inkl. moms", async () => {
    const html = renderToStaticMarkup(await MomsPage());
    const inkl = beregnMoms(1000, "fratraekMoms", DEFAULT_MOMS_SATS);
    const kr = (tal: number) => `${formatNumber(tal, "da", { maximumFractionDigits: 2 })} kr.`;

    expect(inkl.prisUdenMoms).toBe(800);
    expect(inkl.momsBeloeb).toBe(200);
    // Mutation: sæt de gamle tal 1.000/250/250 tilbage i cellerne. Derfor læses
    // hele kolonnen i rækkefølge — en enkelt `toContain("800 kr.")` ville være
    // grøn, fordi 800 kr. står flere steder på siden.
    const kolonne = [...html.matchAll(/<td class="py-2">([\d.]+ kr\.)<\/td>/g)].map((m) => m[1]);
    expect(kolonne).toEqual([
      kr(beregnMoms(1000, "tillaegMoms", DEFAULT_MOMS_SATS).momsBeloeb),
      kr(beregnMoms(1000, "tillaegMoms", DEFAULT_MOMS_SATS).prisInklMoms),
      kr(inkl.prisUdenMoms),
      kr(inkl.momsBeloeb),
      kr(inkl.momsBeloeb),
    ]);
    expect(kolonne).not.toContain("1.000 kr.");
    expect(html.match(/A1 er her 1\.000 kr\. inkl\. moms/g)).toHaveLength(3);
    expect(html).toContain(`regner på ${kr(1000)} <em>uden</em>`);
    expect(html).not.toContain("På 1.000 kr. ekskl. moms");
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

  /**
   * Fund 2/10: de tre regnestykker i introen stod håndskrevet i begge sprog —
   * «1.000 kr × 1,25 = 1.250 kr inkl. moms» lå på siden to gange i hvert sprog
   * (én i listen, én i «når du skal lægge momsen oveni igen»), selv om
   * `MOMS_REFERENCE_BELOEB`, `beregnMoms` og tabellerne lige under dem regner de
   * samme tal. De var ikke forkerte — de var fem kopier, der ville blive
   * stående, når satsen ændrer sig.
   *
   * Sætningerne dømmes nu på hele den *renderede* liste, ikke på en løs
   * `toContain`:mutationen ville være at sætte «1.000 kr × 1,25» tilbage i
   * én `<li>`, og så ville kun den ene af de tre fejle.
   */
  test("de tre intro-regnestykker er regnet af modulet i begge sprog", async () => {
    const EK = MOMS_REFERENCE_BELOEB[2];
    const med = beregnMoms(EK, "tillaegMoms", DEFAULT_MOMS_SATS);
    const fra = beregnMoms(med.prisInklMoms, "fratraekMoms", DEFAULT_MOMS_SATS);
    const faktor = formatNumber(momsFaktor(DEFAULT_MOMS_SATS), "da");
    const andel = formatNumber(momsAndel(DEFAULT_MOMS_SATS), "da", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const kr = (tal: number) => `${formatNumber(tal, "da", { maximumFractionDigits: 2 })} kr.`;

    const html = renderToStaticMarkup(await MomsPage());
    // Kun introens liste — den næste liste på siden (baglæns) bruger samme
    // tegn, så et løst filter ville tage den med.
    const intro = (html.split("<h3>Sådan beregner du moms</h3>")[1]?.split("</ul>")[0] ?? "").match(
      /<li>([\s\S]*?)<\/li>/g
    );

    expect(intro).toEqual([
      `<li><strong>Læg moms til:</strong> Gang beløbet med ${faktor}. Eksempel: ${kr(EK)} × ${faktor} = ${kr(med.prisInklMoms)} inkl. moms</li>`,
      `<li><strong>Træk moms fra:</strong> Divider beløbet med ${faktor}. Eksempel: ${kr(med.prisInklMoms)} ÷ ${faktor} = ${kr(fra.prisUdenMoms)} ekskl. moms</li>`,
      `<li><strong>Find momsandelen:</strong> Gang beløbet inkl. moms med ${andel}. Eksempel: ${kr(med.prisInklMoms)} × ${andel} = ${kr(fra.momsBeloeb)} i moms</li>`,
    ]);
  });

  test("svensk introduktion har samme tre regnestykker, i svensk notation", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const EK = MOMS_REFERENCE_BELOEB[2];
    const med = beregnMoms(EK, "tillaegMoms", DEFAULT_MOMS_SATS);
    const fra = beregnMoms(med.prisInklMoms, "fratraekMoms", DEFAULT_MOMS_SATS);
    const faktor = formatNumber(momsFaktor(DEFAULT_MOMS_SATS), "se", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const andel = formatNumber(momsAndel(DEFAULT_MOMS_SATS), "se", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const kr = (tal: number) => `${formatNumber(tal, "se", { maximumFractionDigits: 2 })} kr`;

    const html = renderToStaticMarkup(await MomsPage());
    const intro = (
      html.split("<h3>Så här räknar du ut moms</h3>")[1]?.split("</ul>")[0] ?? ""
    ).match(/<li>([\s\S]*?)<\/li>/g);

    expect(intro).toEqual([
      `<li><strong>Lägga på moms:</strong> Multiplicera beloppet med ${faktor}. Exempel: ${kr(EK)} × ${faktor} = ${kr(med.prisInklMoms)} inkl. moms</li>`,
      `<li><strong>Räkna bort moms:</strong> Dividera beloppet med ${faktor}. Exempel: ${kr(med.prisInklMoms)} ÷ ${faktor} = ${kr(fra.prisUdenMoms)} exkl. moms</li>`,
      `<li><strong>Hitta momsandelen:</strong> Multiplicera beloppet inkl. moms med ${andel}. Exempel: ${kr(med.prisInklMoms)} × ${andel} = ${kr(fra.momsBeloeb)} i moms</li>`,
    ]);
  });

  /**
   * Samme fund, anden halvdel: «1,25 gang fire er 2,4414» og «0,4096» var også
   * håndskrevet, selv om de er 1,25⁴ og 0,8⁴. Sætningen siger nu, hvad den
   * trækker 20 % fire gange *gør* — prisen bliver 409,60 kr. — hvor den gamle
   * skrev «får du 0,4096 — altså kun 410 kr. oveni», hvilket læst som en
   * difference, selv om det er hele prisen.
   */
  test("«momsen fire gange i træk» regner begge faktorer og den nye pris", async () => {
    const html = renderToStaticMarkup(await MomsPage());
    const f4 = momsFaktor(DEFAULT_MOMS_SATS) ** 4;
    const p4 = (1 - momsAndel(DEFAULT_MOMS_SATS)) ** 4;
    const kr = (tal: number) => `${formatNumber(tal, "da", { maximumFractionDigits: 2 })} kr.`;

    // Afsnittets *anden* stykke: det første er indgangen til reglen.
    const afsnit =
      html
        .split("<h3>Momsen fire gange i træk</h3>")[1]
        ?.split("Derfor er der kun én sats")[1]
        ?.split("</p>")[0] ?? "";
    expect(afsnit).toContain(`er ${formatNumber(f4, "da", { maximumFractionDigits: 4 })}, så`);
    expect(afsnit).toContain(kr(MOMS_REFERENCE_BELOEB[2] * f4));
    expect(afsnit).toContain(`bliver prisen ${formatNumber(p4, "da", { maximumFractionDigits: 4 })} af den oprindelige`);
    expect(afsnit).toContain(kr(MOMS_REFERENCE_BELOEB[2] * p4));
    // Negativ lås: den gamle sætning skrev den afrundede sum og kaldte den
    // en difference oveni.
    expect(afsnit).not.toContain("oveni");
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

describe("moms: EU-sats-tabellen (landene dansk og svensk autocomplete spørger om)", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  // Otte af ti danske variationer under "moms procent" er landespecifikke, og
  // før denne tabel var Holland, Finland, Italien og Norge 0 gange på siden.
  // Derfor læses forventningerne af modulet — en sats i tabellen skal give
  // præcis den pris, beregnMoms ville give.
  const tabelRaekker = udenlandRaeekker();

  test("tabellen har én række pr. land, og antallet afspejler modulet", async () => {
    const html = renderToStaticMarkup(await MomsPage());

    const raekker = [...html.matchAll(/<tr[^>]*>/g)];
    // +1 for header-rækken, og de to andre tabeller på siden har hver deres.
    const egne = html.split("<h3>Momssatsen i EU")[1]?.split("<h3>")[0] ?? "";
    const egneRaekker = [...egne.matchAll(/<tr[^>]*>/g)].length - 1;
    expect(egneRaekker).toBe(tabelRaekker.length);
    expect(raekker.length).toBeGreaterThan(egneRaekker);
  });

  test("hver landerække viser satsen og 100-kr-prisen, som modulet regner dem", async () => {
    const html = renderToStaticMarkup(await MomsPage());

    for (const { land, prisInklMoms100 } of tabelRaekker) {
      const sats = formatNumber(land.standard, "da", { maximumFractionDigits: 1 });
      const pris = formatNumber(prisInklMoms100, "da", { maximumFractionDigits: 2 });
      const række = html.split(`<th scope="row" class="text-left font-normal py-1.5 pr-3">${land.navn.da}`)[1]
        ?.split("</tr>")[0] ?? "";
      expect(række, `mangler række for ${land.navn.da}`).not.toBe("");
      expect(række).toContain(`${sats} %`);
      expect(række).toContain(`${pris} kr.`);
    }
  });

  test("de otte målte danske lande står i tabellen med deres eget navn", async () => {
    const html = renderToStaticMarkup(await MomsPage());

    for (const kode of ["NL", "FI", "DE", "IT", "NO", "SE", "FR", "PL"]) {
      const land = tabelRaekker.find((r) => r.land.kode === kode)!;
      expect(html, `mangler ${kode}`).toContain(`>${land.land.navn.da}`);
    }
    // Norge er markeret som ikke-EU, fordi det er det det er.
    expect(html).toContain("Norge (ikke EU)");
  });

  test("brødtekstens 17 % og 27 % er de samme tal som tabellen finder", async () => {
    const html = renderToStaticMarkup(await MomsPage());
    const { lavest, hoejest } = momsSatsUdenraekke();

    // Før stod "17% (Luxembourg) til 27% (Ungarn)" håndskrevet i brødteksten,
    // ved siden af en tabel der ikke fandtes. Nu er begge tal fundet af tabellen.
    expect(html).toContain("17 % (Luxembourg)");
    expect(html).toContain("27 % (Ungarn)");
    expect(lavest.navn.da).toBe("Luxembourg");
    expect(hoejest.navn.da).toBe("Ungarn");
    // Og de to priser, brødteksten nævner, er tabellens celler.
    expect(html).toContain("117 kr.");
    expect(html).toContain("127 kr.");
  });

  test("Danmark står med 0 % på bøger som undtagelse, ikke som reduceret sats", async () => {
    const html = renderToStaticMarkup(await MomsPage());
    // Forankret i rækkens <th scope="row">, ikke i ">Danmark" — FAQ'en siger
    // også "Danmark", og en løs grep ville tage den først.
    const række = html.split('pr-3">Danmark<')[1]?.split("</tr>")[0] ?? "";

    expect(række).toContain("25 %");
    expect(række).toContain("Ingen");
    // Fælden: 0 % er en undtagelse fra momsloven, ikke en lavere sats, så den
    // må ikke stå i reduceret-kolonnen.
    expect(række).not.toContain("0 %");
  });

  test("de nye spørgsmål står i den danske FAQ og dermed i JSON-LD", async () => {
    const html = renderToStaticMarkup(await MomsPage());

    for (const spg of [
      "Hvad er momssatsen i Tyskland?",
      "Hvad er momssatsen i Holland?",
      "Hvad er momssatsen i Norge?",
      "Hvilken momssats har EU's laveste og højeste land?",
      "Hvad er momssatsen i Sverige?",
    ]) {
      expect(html).toContain(spg);
    }
    // Og svarene er skrevet i sit eget sprog, ikke bare spørgsmålene.
    expect(html).toContain("Momssatsen i Tyskland er 19 %");
    expect(html).toContain("Momssatsen i Holland er 21 %");
    expect(html).toContain("ikke medlem af EU");
  });
});

describe("moms: EU-tabellen på beraknare.se har sit eget sprog", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
  });

  test("har samme antal rækker som den danske — ellers er tabellen halv", async () => {
    const html = renderToStaticMarkup(await MomsPage());
    const egne = html.split("<h3>Momssatsen i EU")[1]?.split("<h3>")[0] ?? "";
    const egneRaekker = [...egne.matchAll(/<tr[^>]*>/g)].length - 1;
    expect(egneRaekker).toBe(udenlandRaeekker().length);
  });

  test("bruger svenska landnavn, og de tre der hedder forskelligt er rigtige", async () => {
    const html = renderToStaticMarkup(await MomsPage());

    for (const kode of ["NL", "AT", "EL", "LU", "HU"]) {
      const land = udenlandRaeekker().find((r) => r.land.kode === kode)!.land;
      expect(html, `mangler ${land.navn.se}`).toContain(`>${land.navn.se}`);
    }
    expect(html).toContain("Nederländerna");
    expect(html).toContain("Österrike");
    expect(html).toContain("Grekland");
    // De danske navne skal ikke stå som række-overskrift på beraknare.se.
    expect(html).not.toContain(">Holland");
    expect(html).toContain("Norge (inte EU)");
  });

  test("har svensk notation i priserne — 1.125 er dansk, 1 125 er svensk", async () => {
    const html = renderToStaticMarkup(await MomsPage());
    const tysk = udenlandRaeekker().find((r) => r.land.kode === "DE")!;

    expect(html).toContain(
      `${formatNumber(tysk.prisInklMoms100, "se", { maximumFractionDigits: 2 })} kr`
    );
    // Negativ lås mod den danske notation på den svenske side.
    expect(html).not.toContain(
      `${formatNumber(tysk.prisInklMoms100, "da", { maximumFractionDigits: 2 })} kr.`
    );
  });

  test("svarer på de målte svenska søgninger i svensk", async () => {
    const html = renderToStaticMarkup(await MomsPage());

    for (const spg of [
      "Vad är momssatsen i Tyskland?",
      "Vad är momssatsen i Holland?",
      "Vad är momssatsen i Norge?",
      "Vilket EU-land har lägst och högst momssats?",
      "Hur mycket moms är det på mat i Sverige?",
    ]) {
      expect(html).toContain(spg);
    }
    expect(html).toContain("Momssatsen i Tyskland är 19 %");
    // "Holland" er det ord søgeren skriver; svaret bruger landets eget navn fra
    // modulet. Hvis svaret sagde "Nederländerna" i spørgsmålsteksten ville det
    // være dansk, men i svaret er det det korrekte svenske navn.
    expect(html).toContain("Vad är momssatsen i Holland?");
    expect(html).toContain("Momssatsen i Nederländerna är 21 %");
  });
});
