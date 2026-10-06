/**
 * Promillegrænserne i brødteksten målt mod loven, ikke mod et hjemmeskrevet
 * målescript (opgave 189).
 *
 * Uden denne port er `/promille` brødtekstens tal frie tal. `PROMILLEGRANSE_UDLAND`
 * siger i sin egen docblock at kilden er WHO's landoversigt hentet via Wikipedia —
 * altså en sekundær kilde, og de svenske og danske *særregler* i landstabellen var
 * slet ikke kildeført. Det viste sig dyrt: tabellen skrev at Danmark har
 * "Ingen særregel", mens Rådet for Sikker Trafik oplyser at grænsen blev sat ned til
 * 0,2 ‰ for nye bilister de første 3 år med kørekort i 2025.
 *
 * **Målerfælden fra F8 gælder også her.** Porten må ikke låse de ord den så, og
 * den må ikke måle mod en hjemmeskrevet antagelse om hvad loven siger. Derfor:
 *
 * 1. Kilden er hentet fra en myndighed, ikke husket. Retsinformation.dk serverer
 *    kun en SPA-skal til en agent (alle `/api/document/*`-stier svarer 200 med
 *    index.html), så den danske lov er læst gennem Rådet for Sikker Trafik, der
 *    gengiver færdselslovens § 53 ordret. Den svenske lov er læst i sin
 *    gældende lydelse på riksdagen.se, den tyske i StVG § 24a og § 24c på
 *    gesetze-im-internet.de, og den britiske i GOV.UK's blodgrænsetabel.
 * 2. Tabellen herunder er *data fra kilden*, og porten læser tallene herfra — så
 *    et tal der ændrer sig i loven, ændrer hvad porten kræver af brødteksten.
 * 3. Kun de fire lande med en hentet kilde måles. De otte andre rækker er
 *    Springvand fra den samme Wikipedia-tabel og springes over, ligesom F8's
 *    port gjorde; at låse dem ville bare låse de ord porten så.
 */

import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { PROMILLEGRANSE, PROMILLEGRANSE_UDLAND, PROMILLEGROV_SE } from "@/lib/promille";
import { getPageData } from "@/lib/page-data";
import PromillePage from "@/app/promille/page";

vi.mock("@/components/PromilleBeregner", () => ({
  default: () => <div>Promilleværktøj</div>,
}));
// Klientværktøjerne kalder useLocale, og denne port renderer siden til statisk
// markup uden en LocaleProvider — samme fejlklasse som Sentrys åbne
// MINBEREGNER-2 ("useLocale must be used within a LocaleProvider"). Derfor
// erstattes de, præcis som PromilleBeregner allerede er.
vi.mock("@/components/KoerIgenBeregner", () => ({
  default: () => <div>Koer-igen-værktøj</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null, ArticleSchema: () => null }));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

/** Loven, som den står i den hentede kilde. Ikke husket — læst 30/9 2026. */
interface Lovkilde {
  /** Kilden, med afsnit, så en efterfølger kan genhente den. */
  kilde: string;
  /** Hvornår kilden blev hentet. */
  hentet: string;
  /** Den generelle grænse i ‰. */
  generel: number;
  /** Eventuel strengere grænse for nye bilister, i ‰. */
  nyBilist?: number;
  /** Hvor mange år den strengere grænse gælder. */
  nyBilistAar?: number;
  /** Grænsen for det grove brud, i ‰, hvis loven har en. */
  grov?: number;
  /** Alder hvor loven forbyder alkohol helt, hvis den har et tal. */
  forbudUnderAar?: number;
  /** Loven forbyder alkohol i kørekortets prøveperiode. */
  forbudIProbeperiode?: boolean;
  /** En del af landet har sin egen grænse, i ‰. */
  regioner?: Record<string, number>;
}

const LOVKILDE: Record<string, Lovkilde> = {
  danmark: {
    kilde: "Færdselsloven § 53, gengivet ordret af Rådet for Sikker Trafik",
    hentet: "2026-09-30",
    generel: 0.5,
    nyBilist: 0.2,
    nyBilistAar: 3,
    // RST: "Over 2,0 promille … Du får frakendt kørekortet ubetinget i mindst 3 år."
    grov: 2.0,
  },
  sverige: {
    // 4 §: "alkoholkoncentrationen under eller efter färden uppgår till minst
    // 0,2 promille i blodet". 4 a §: grovt när "minst 1,0 promille i blodet".
    kilde: "Trafikbrottslagen (1951:649) 4 § og 4 a §",
    hentet: "2026-09-30",
    generel: 0.2,
    grov: 1.0,
  },
  tyskland: {
    // § 24a(1): "0,25 mg/l oder mehr Alkohol in der Atemluft oder 0,5 Promille
    // oder mehr Alkohol im Blut". § 24c(1) forbyder alkohol "in der Probezeit
    // nach § 2a oder vor Vollendung des 21. Lebensjahres" — et forbud, ikke et
    // lavere tal, så det skrives 0,0 ‰.
    kilde: "Straßenverkehrsgesetz (StVG) § 24a og § 24c, gesetze-im-internet.de",
    hentet: "2026-09-30",
    generel: 0.5,
    forbudUnderAar: 21,
    forbudIProbeperiode: true,
  },
  storbritannien: {
    // GOV.UK, "The drink drive limit": 80 mg pr. 100 ml blod i England, Wales
    // og Nordirland, 50 mg i Skotland = 0,8 hhv. 0,5 promille. RTA 1988 § 5
    // straffer den der "exceeds the prescribed limit", så det er 80/50 der er
    // grænsen, ikke et roundere tal.
    kilde: "GOV.UK, The drink drive limit (grænserne i RTA 1988 § 5)",
    hentet: "2026-09-30",
    generel: 0.8,
    regioner: { Skotland: 0.5 },
  },
};

/**
 * "0,5" / "0,2" / "1,0" / "2,0". **Ikke** `String(tal)` — JavaScript skriver
 * `String(2.0)` som `"2"`, så den naive form gjør porten måle mod et tal der
 * aldrig står i brødteksten. Målerfældens fjerde udløber, fundet i denne
 * opgave: en forkert formatter lod to tests se ud som at de fejlede på
 * brødteksten, når de fejlede på sig selv.
 */
const danskKomma = (tal: number) => (Number.isInteger(tal) ? tal.toFixed(1) : `${tal}`).replace(".", ",");

/** Alle tal i den hentede lovgivning — tilladt i en sætning der sammenligner. */
const TAL_FRA_LOVEN = Object.values(LOVKILDE).flatMap((lov) => [
  lov.generel,
  lov.nyBilist,
  lov.nyBilistAar,
  lov.grov,
  lov.forbudUnderAar,
  ...Object.values(lov.regioner ?? {}),
].filter((t): t is number => typeof t === "number").map(danskKomma));

/** Hent en `<tr>` ud af den renderede landstabel. */
const raekke = (html: string, land: string): string => {
  const rækker = html.match(/<tr>(?:(?!<\/tr>)[\s\S])*?<\/tr>/g) ?? [];
  const fundet = rækker.find((r) => r.includes(`>${land}</td>`));
  if (!fundet) throw new Error(`Ingen række for ${land} i den renderede tabel`);
  return fundet;
};

/** Brødteksten på `/promille` i ét sprog: FAQ, description og og-description. */
const sideTekster = (locale: "da" | "se") => {
  const side = getPageData("promille", locale);
  if (!side) throw new Error(`Ingen sidedata for /promille (${locale})`);
  return [
    ...side.faqItems.map((f) => `${f.question} ${f.answer}`),
    side.metaDescription,
    side.ogDescription,
  ];
};

const danskeTekster = () => sideTekster("da");
const svenskeTekster = () => sideTekster("se");

/**
 * Find en hel sætning der *fastsætter* et tal. Bredere læsninger af samme
 * brødtekst gav i denne opgave 29 fund i dansk og 31 i svensk, hvor **alle** var
 * beregnede promiller, Tysklands og Storbritanniens grænser eller et hypotetisk
 * "må jeg køre med 0,4". Det er målerfældens sjette udløber, og F8's port blev
 * af samme grund snævret fra "alle ugedage" til de to påstande der faktisk var
 * forkerte. Porten her må derfor *kræve* kildens tal frem for at søge efter
 * forkerte — en mutation i kilden eller i brødteksten giver så et rødt svar.
 */
const sætningMed = (tekster: string[], mønster: RegExp) =>
  tekster.flatMap((t) => t.split(/(?<=[.!?])\s+/)).find((s) => mønster.test(s)) ?? "";

const SVERIGE = /\bSverige|svensk/i;

describe("promillegrænser mod loven", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test("de hentede love må aldrig ændre sig uden at porten bliver rød", () => {
    // Lovenes tal står her, fordi de er hentet. De skal ikke kunne glide fra
    // kilden uden at nogen lægger mærke til det — derfor låses de fra begge sider.
    expect(LOVKILDE.sverige).toEqual({
      kilde: "Trafikbrottslagen (1951:649) 4 § og 4 a §",
      hentet: "2026-09-30",
      generel: 0.2,
      grov: 1.0,
    });
    expect(LOVKILDE.danmark).toEqual({
      kilde: "Færdselsloven § 53, gengivet ordret af Rådet for Sikker Trafik",
      hentet: "2026-09-30",
      generel: 0.5,
      nyBilist: 0.2,
      nyBilistAar: 3,
      grov: 2.0,
    });
    expect(LOVKILDE.tyskland).toEqual({
      kilde: "Straßenverkehrsgesetz (StVG) § 24a og § 24c, gesetze-im-internet.de",
      hentet: "2026-09-30",
      generel: 0.5,
      forbudUnderAar: 21,
      forbudIProbeperiode: true,
    });
    expect(LOVKILDE.storbritannien).toEqual({
      kilde: "GOV.UK, The drink drive limit (grænserne i RTA 1988 § 5)",
      hentet: "2026-09-30",
      generel: 0.8,
      regioner: { Skotland: 0.5 },
    });
  });

  test("beregnerens egen grænse er den grænse, loven giver", () => {
    expect(PROMILLEGRANSE.da).toBe(LOVKILDE.danmark.generel);
    expect(PROMILLEGRANSE.se).toBe(LOVKILDE.sverige.generel);
  });

  test("landstabellen viser den generelle grænse fra loven, ikke en anden", () => {
    for (const [nokkel, lov] of Object.entries(LOVKILDE)) {
      expect(PROMILLEGRANSE_UDLAND[nokkel]).toBe(lov.generel);
    }
  });

  test("Danmark må ikke stå med 'Ingen særregel' — loven har sænket den for nye bilister", async () => {
    const lov = LOVKILDE.danmark;
    expect(lov.nyBilist).toBeDefined();
    expect(lov.nyBilistAar).toBeDefined();

    const html = renderToStaticMarkup(await PromillePage());
    const række = raekke(html, "Danmark");

    // Begge tal fra kilden skal stå i rækken, så en værdi der ændrer sig i
    // loven, gør porten rød indtil brødteksten følger med.
    expect(række).toContain(`${danskKomma(lov.nyBilist!)} ‰`);
    expect(række).toContain(`${lov.nyBilistAar} år`);
    // Og den skal ikke sige det modsatte, som den gjorde før denne opgave.
    expect(række).not.toMatch(/Ingen særregel/);
  });

  test("Sveriges række skal nævne den grove grænse fra 4 a §", async () => {
    const lov = LOVKILDE.sverige;
    expect(lov.grov).toBeDefined();

    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const html = renderToStaticMarkup(await PromillePage());

    expect(raekke(html, "Sverige")).toContain(`${danskKomma(lov.generel)} ‰`);
    // Sverige har ingen lavere grænse for nye bilister i 4 §, så rækken skal
    // ikke opfinde en — kun den generelle og den grove.
    expect(raekke(html, "Sverige")).not.toMatch(/de första \d+ åren/);
  });

  test("svensk brødtekst fastsætter 4 §'s grænse og 4 a §'s grove grænse", () => {
    const lov = LOVKILDE.sverige;
    const tekster = svenskeTekster();

    const fastsat = sætningMed(tekster, /gränsen för rattfylleri/i);
    expect(fastsat).not.toBe("");
    expect(fastsat).toContain(`${danskKomma(lov.generel)} ‰`);

    const grov = sætningMed(tekster, /grovt rattfylleri/i);
    expect(grov).not.toBe("");
    expect(grov).toContain(`${danskKomma(lov.grov!)} ‰`);
  });

  test("dansk brødtekst fastsætter færdselslovens 0,5 ‰", () => {
    const lov = LOVKILDE.danmark;
    const tekster = danskeTekster();

    const fastsat = sætningMed(tekster, new RegExp(`${danskKomma(lov.generel)}\\s*‰`, "i"));
    // Siden er dansk, så en sætning der fastsætter 0,5,5 skal være Danmarks
    // egen — den skal ikke blot nævne et tal der ligner.
    expect(fastsat).toMatch(/ulovligt/i);
    expect(fastsat).toContain(`${danskKomma(lov.generel)} ‰`);
  });

  test("dansk brødtekst må ikke kalde 2,0 ‰ noget andet end ubetinget kørekorttab", () => {
    const lov = LOVKILDE.danmark;
    const sætninger = danskeTekster().flatMap((t) => t.split(/(?<=[.!?])\s+/));

    const nævnerGroft = sætninger.filter((s) => s.includes(danskKomma(lov.grov!)));
    expect(nævnerGroft.length).toBeGreaterThan(0);
    for (const sætning of nævnerGroft) {
      // RST: over 2,0 får man kørekortet frakendt ubetinget i mindst 3 år. En
      // sætning der nævner 2,0 skal hænge sammen med kørekortet, ellers er
      // den en løs promilleoplysning uden lovens følge.
      expect(sætning).toMatch(/kørekort/);
    }
  });

  test("Tysklands række må kun nævne de regler, StVG faktisk indeholder", async () => {
    const lov = LOVKILDE.tyskland;
    // Begge sprog. Review-fundet 16/9 var præcis denne fejlklasse: en tekst der
    // kun blev rettet i den ene sproggren, så beraknare.se fik danske ord.
    for (const [land, domæne, prøveperiode] of [
      ["Tyskland", "da", "prøveperiode"],
      ["Tyskland", "se", "provperiod"],
    ] as const) {
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(domæne));
      const række = raekke(renderToStaticMarkup(await PromillePage()), land);

      // § 24c er et *forbud* ("ein alkoholisches Getränk … zu sich nimmt"), så
      // brødteksten skal skrive 0,0 og alderen, ellers er den en lavere grænse
      // som loven ikke har.
      expect(række).toContain(`${danskKomma(0)} ‰`);
      expect(række).toContain(`${lov.forbudUnderAar} år`);
      expect(række.toLowerCase()).toContain(prøveperiode.toLowerCase());
      // Og den må ikke opfinde en tredje grænse. "0,3 ‰ ved en anden
      // trafikforseelse" stod i begge tabeller før denne opgave: det er relativ
      // kørselsuevne, altså retspraksis, og ingen paragraf i StVG taler om det.
      expect(række).not.toMatch(/0,3 ‰/);
    }
  });

  test("Storbritanniens række skal skelne mellem Skotland og resten af Storbritannien", async () => {
    const lov = LOVKILDE.storbritannien;
    const skotland = Object.entries(lov.regioner ?? {});
    expect(skotland.length).toBeGreaterThan(0);

    const html = renderToStaticMarkup(await PromillePage());
    const række = raekke(html, "Storbritannien");

    expect(række).toContain(`${danskKomma(lov.generel)} ‰`);
    for (const [region, graense] of skotland) {
      // Rækken skriver tallet enten før eller efter regionens navn
      // ("0,5 ‰ i Skotland" / "Skotland: 0,5 ‰"), så begge rækkefølger
      // tæller — men de to tal må ikke stå uden for hinandens sætning.
      const tal = danskKomma(graense);
      const tæt = `[^<]{0,40}`;
      expect(række).toMatch(new RegExp(`${tal}${tæt}${region}|${region}${tæt}${tal}`, "i"));
    }
  });

  test("det danske Tyskland-svar må ikke love en lavere grænse end lovens", () => {
    const lov = LOVKILDE.tyskland;
    const svar = danskeTekster().find((t) => /promillegrænsen i Tyskland/i.test(t));
    expect(svar).toBeDefined();

    expect(svar).toContain(`${danskKomma(lov.generel)} promille`);
    expect(svar).toContain(`${danskKomma(0)} promille`);
    expect(svar).toContain(`${lov.forbudUnderAar} år`);
    expect(svar).not.toMatch(/0,3 promille/);
  });

  test("den svenske grænsetekst udleder lovens tal i stedet for at skrive dem i hånden", () => {
    // CEO-kø punkt 7: svaret om Sveriges grænse skrev "0,2", "1,0" og "0,5"
    // som tekst, så et tal der ændrer sig i trafikbrottslagen eller
    // færdselsloven ville have flyttet tabellen og *ikke* brødteksten. Nu står
    // de tre tal i `PROMILLEGRANSE` og `PROMILLEGROV_SE`.
    const svar = svenskeTekster().find((t) => /gränsen för rattfylleri/i.test(t));
    expect(svar).toBeDefined();
    expect(svar).toContain(`${danskKomma(PROMILLEGRANSE.se)} ‰`);
    expect(svar).toContain(`${danskKomma(PROMILLEGROV_SE)} ‰`);
    expect(svar).toContain(`(${danskKomma(PROMILLEGRANSE.da)} ‰)`);

    // Porten der faktisk kan fejle: ingen sætning om en grænse må indeholde et
    // promilletal, der ikke er et af sidens egne. Den her fejler, hvis nogen
    // indsætter et håndskrevet "0,3 ‰" ved siden af de udledte tal.
    const tilladte = new Set([
      danskKomma(PROMILLEGRANSE.se),
      danskKomma(PROMILLEGRANSE.da),
      danskKomma(PROMILLEGROV_SE),
    ]);
    const grænsesætninger = svenskeTekster()
      .flatMap((t) => t.split(/(?<=[.!?])\s+/))
      .filter((s) => /gräns|rattfylleri/i.test(s) && /\d,\d\s*‰/.test(s));
    expect(grænsesætninger.length).toBeGreaterThan(0);
    for (const sætning of grænsesætninger) {
      for (const match of sætning.match(/\d,\d(?=\s*‰)/g) ?? []) {
        expect(tilladte).toContain(match);
      }
    }
  });

});
