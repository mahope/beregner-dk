/**
 * WHO's grænser i brødteksten målt mod WHO, ikke mod et hjemmeskrevet tal
 * (opgave 191).
 *
 * Uden denne port er indlæggets grænser frie tal. De samme tal står i fire
 * steder på sitet — `BMIBeregner`'s zones, `/bmi`'s brødtekst, sidens FAQ og
 * nu indlægget — og intet holdt dem sammen. Det er præcis den fejl, opgave 189
 * fandt på `/promille`, hvor tabellen skrev at Danmark har "Ingen særregel"
 * mens loven sætter den til 0,2 ‰ de første tre år.
 *
 * Derfor ligger tærsklerne i `bmi-voksen-grænser.ts` som *data med kilde*, og
 * porten læser brødteksten og sammenligner med dem. Hvis WHO en dag flytter en
 * grænse, flytter den, hvad porten kræver af siden — ikke kun et tal i
 * indlægget.
 *
 * **Porten skal kunne blive rød.** Det er derfor den sidste test rydder
 * båndene op og kræver, at de hverken overlapper eller har huller: en port der
 * kun tjekker at ét tal står i siden ville være grøn, også hvis skalaen var
 * 18,5 / 25 / 30 / 31.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { BMI_BAAND, BMI_KILDE, bmiBaand, vaegtInterval } from "@/lib/bmi-voksen-grænser";

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(async () => "da"),
  getCurrentDomainConfig: vi.fn(async () => ({
    baseUrl: "https://minberegner.dk",
    siteName: "MinBeregner.dk",
    ogLocale: "da_DK",
  })),
}));

/**
 * `/bmi` indlægger værktøjet med `next/dynamic`, som suspenderer — og en
 * suspendérende komponent kan ikke rendereres i et synkront
 * `renderToStaticMarkup`. Det er en målebegrænsning, ikke en fejl på siden,
 * så værktøjet erstattes med en stub. Alt det porten vil se — "Guides om
 * emnet" og artiklens href — ligger uden for værktøjet.
 */
vi.mock("@/components/BMIBeregner", () => ({ default: () => <div>BMIværktøj</div> }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));
vi.mock("@/components/ads/AdBanner", () => ({ InlineAd: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
  // `BlogArticleSchema` videresender til `ArticleSchema`. Uden den i stubben
  // ville indlægget ikke kunne renderes overhovedet — porten ville aldrig nå
  // de påstande, den er skrevet for.
  ArticleSchema: () => null,
}));

const SLUG = "bmi-voksen-saadan-tolk-er-du-tallet";
const source = readFileSync(
  join(process.cwd(), "src", "app", "blog", SLUG, "page.tsx"),
  "utf8",
);
const kildekode = readFileSync(
  join(process.cwd(), "src", "lib", "bmi-voksen-grænser.ts"),
  "utf8",
);

/** Teksten i den udlede markup, uden HTML-tags — så tal kan måles i løbet. */
function tekst(indhold: string): string {
  return indhold
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const Side = (await import("@/app/blog/bmi-voksen-saadan-tolk-er-du-tallet/page")).default;
const da = tekst(renderToStaticMarkup(<Side />));

/** "18,5" og "18.5" er samme tal i to stavemåder. */
function danskTal(tal: number): string {
  return tal.toFixed(1).replace(".", ",");
}

describe("WHO's grænser i brødteksten", () => {
  test("hvert bånd fra WHO's skala står i indlæggets tabel", () => {
    for (const baand of BMI_BAAND) {
      const nedre = danskTal(baand.min);
      const oevre = baand.max === null ? null : danskTal(baand.max);
      for (const tal of [nedre, oevre]) {
        if (tal === null) continue;
        // Båndets navn skal stå i markupken — så en skala uden navn
        // (fx et råt "25") ikke kan bestå porten ved et tilfælde.
        expect(da, `${baand.dansk} mangler i indlægget`).toContain(baand.dansk);
        expect(
          da.match(new RegExp(tal.replace(",", "[,.]"), "g"))?.length ?? 0,
          `grænsen ${tal} for ${baand.dansk} står ikke i indlægget`,
        ).toBeGreaterThan(0);
      }
    }
  });

  test("indlægget oplyser kilden, og opdateringsdatoen er den fra WHO", () => {
    expect(da).toContain(BMI_KILDE.organisation);
    expect(da).toContain(BMI_KILDE.opdateret);
    // Uden afsnit kan en efterfølger ikke genskabe tallene. URL'en ligger i
    // kildefilen — indlægget skal ikke henvise til den pr. klik.
    expect(kildekode, "kilden skal være en fuld URL i koden").toContain(BMI_KILDE.url);
  });

  test("WHO's egne ord for overvægt og fedme citeres, ikke bare tallene", () => {
    // WHO's factsheet siger "greater than or equal to 25" og "30". Uden
    // citatet kunne indlægget have hentet 25 og 30 fra en hvilken som helst
    // fitnessblog, og så er porten oveni meaningless.
    expect(da).toContain("BMI greater than or equal to 25");
    expect(da).toContain("BMI greater than or equal to 30");
  });

  test("erstatningsmarkør-ordet fra WHO's egen beskrivelse er med", () => {
    // WHO kalder BMI en "surrogate marker of fatness". Det er den eneste
    // passage, der siger at tallet ikke *er* fedt — og det er derfor
    // indlægget har fire forbehold.
    expect(source).toContain("surrogate marker");
    expect(da).toContain("erstatningsmarkør");
  });

  test("indlægget siger at BMI ikke justeres for alder — WHO's egen forbehold", () => {
    // `/bmi`-siden siger det samme, men hverken WHO's factsheet eller
    // formlen gør det automatisk. Skulle nogen skrive "aldersjusteret BMI"
    // på siden, skal porten kunne se det.
    expect(da).toContain("justeres ikke for alder");
  });

  test("børn sendes til børneguiden, ikke til voksengrænserne", () => {
    // Indlægget er skrevet til voksne. Uden denne linje ville en læser med et
    // barn kopiere 18,5-24,9 over på sit barn — præcis den fejl
    // `/bmi`'s blå boks siger, at værktøjet ikke dækker.
    expect(da).toContain("alders- og kønsspecifikke");
    expect(da).toMatch(/BMI for børn\?[\s\S]*Nej/);
  });
});

/**
 * Den anden side af koblingen: `/bmi` skal *vise* indlægget, ikke bare have en
 * nøgle i `blog-kobling.ts`.
 *
 * `blog-kobling.test.ts` læser sidens kildekode og ser efter strengen
 * `RelateredeArtikler`. Det er nok til at fange en manglende komponent, men ikke
 * en komponent der renderer ingenting — `RelateredeArtikler` returnerer `null`
 * for `locale !== "da"`, så dansk kode kan være grøn på alle tre domæner uden
 * at blokken nogensinde dukker op. Derfor måles den her i markupken.
 */
describe("/bmi's returlink til indlægget", () => {
  async function bmiMarkup(locale: "da" | "se"): Promise<string> {
    const { getLocale } = await import("@/lib/get-locale");
    (getLocale as unknown as { mockReturnValue: (v: string) => void }).mockReturnValue(locale);
    const BmiPage = (await import("@/app/bmi/page")).default;
    return renderToStaticMarkup(await BmiPage());
  }

  afterEach(async () => {
    const { getLocale } = await import("@/lib/get-locale");
    (getLocale as unknown as { mockReturnValue: (v: string) => void }).mockReturnValue("da");
  });

  test("den danske side viser 'Guides om emnet' med indlægget i markupken", async () => {
    const markup = await bmiMarkup("da");
    expect(markup, "/bmi har ingen 'Guides om emnet'").toContain("Guides om emnet");
    const sektion = markup.slice(markup.indexOf("Guides om emnet"));
    expect(sektion, "/bmi linker ikke til sit eget indlæg").toContain(`/blog/${SLUG}`);
    // Ikke børneguiden: en voksen læser skal ikke få en børnepercentil som
    // sin eneste guide. (Børneguiden *er* korrekt linket fra den blå boks
    // længere oppe — den skal bare ikke stå i "Guides om emnet".)
    expect(sektion, "/bmi's guide er børneguiden").not.toContain(
      "/blog/bmi-for-boern-saadan-tjekker-du",
    );
  });

  test("den svenske side får ingen dansk guide", async () => {
    // Indlæggene er danske. Uden denne port kunne en svensk læser møde
    // "Guides om emnet" med dansk brødtekst på beraknare.se.
    expect(await bmiMarkup("se")).not.toContain("Guides om emnet");
  });
});

describe("WHO's skala som data", () => {
  test("båndene er disjunkte og dækker hele linjen fra 0", () => {
    // Den mutation porten *skal* kunne fange: en skala hvor et bånd er
    // springet over, eller hvor to bånd overlapper.
    for (let i = 1; i < BMI_BAAND.length; i++) {
      const forrige = BMI_BAAND[i - 1];
      const nu = BMI_BAAND[i];
      expect(forrige.max, `bånd ${forrige.dansk} slutter ikke ved ${nu.min}`).toBe(nu.min);
      expect(forrige.dansk).not.toBe(nu.dansk);
    }
    expect(BMI_BAAND[0].min).toBe(0);
    expect(BMI_BAAND[BMI_BAAND.length - 1].max).toBe(null);
  });

  test("de to tærskler WHO selv nævner, ligger i skalaen", () => {
    // 25 og 30 er de to tal factsheeten siger ordret. Er de ikke her, er
    // skalaen en anden skala end den, der er kildeført.
    const overvaegt = BMI_BAAND.find((b) => b.who.startsWith("overweight"));
    const fedme = BMI_BAAND.find((b) => b.who.startsWith("obesity class I"));
    expect(overvaegt?.min, "WHO: overvægt er BMI ≥ 25").toBe(25);
    expect(fedme?.min, "WHO: fedme er BMI ≥ 30").toBe(30);
  });

  test("bmiBaand placerer grænseværdierne i båndet ovenover, ikke nedenunder", () => {
    // 25,0 er *overvægt*, ikke normalvægt. Og 30,0 er fedme. Det er hele
    // pointen med WHO's "greater than or equal to".
    expect(bmiBaand(25).dansk).toBe("Overvægt");
    expect(bmiBaand(30).dansk).toBe("Fedme, klasse I");
    expect(bmiBaand(24.999).dansk).toBe("Normalvægt");
    expect(bmiBaand(18.5).dansk).toBe("Normalvægt");
    expect(bmiBaand(18.499).dansk).toBe("Undervægt");
  });

  test("bmiBaand kaster på et tal uden for skalaen i stedet for at tie", () => {
    expect(() => bmiBaand(Number.NaN)).toThrow();
    expect(() => bmiBaand(-1)).toThrow();
  });

  test("vægtintervallet følger BMI_BAAND, så det ikke kan glide fra hinanden", () => {
    // 18,5 × 1,75² = 56,7 kg — samme tal som `/bmi`'s egen FAQ.
    const interval = vaegtInterval(1.75, BMI_BAAND[1]);
    expect(interval.min).toBeCloseTo(56.7, 5);
    expect(interval.max).toBeCloseTo(76.3, 5);
    // Det højeste bånd har ingen øvre grænse — og må ikke få en opdigtet.
    expect(vaegtInterval(1.75, BMI_BAAND[BMI_BAAND.length - 1]).max).toBe(null);
  });
});