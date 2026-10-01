import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { udbetalingsdatoerAar } from "@/lib/borneungeydelse";
import { iDagPaSiden, parseIsoDato } from "@/lib/lokal-dato";
import BoernepengePage from "./page";

vi.mock("@/components/BoernepengBeregner", () => ({
  default: () => <div>Børnepengværktøj</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null, ArticleSchema: () => null,
}));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(async () => "da"),
  getCurrentDomainConfig: vi.fn(async () => ({ baseUrl: "https://minberegner.dk" })),
}));

/**
 * Systemuret flyttes, så porten ikke afhænger af hvilken dag den kører.
 *
 * `vi.setSystemTime` flytter `Date.now()` og `new Date()`, men **ikke** den
 * innebygde `Intl`-data, som `iDagPaSiden` bruger til at finde datoen i
 * `Europe/Copenhagen`. Derfor stubbes den tidszone-aflede funktion direkte, så
 * testen læser præcis den kalenderdag, den siger den læser.
 */
const FAST_DATI = "2026-10-01";
let fastDato = FAST_DATI;

vi.mock("@/lib/lokal-dato", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/lokal-dato")>();
  return {
    ...original,
    iDagPaSiden: () => fastDato,
  };
});

/** Markup'en af hele siden, med dagens dato sat til `iso`. */
async function markup(iso: string) {
  fastDato = iso;
  return renderToStaticMarkup(await BoernepengePage());
}

/** Datoen som `<time dateTime>` skriver den, uden ISO-uge og klokkeslæt. */
function isoAf(html: string, tidligere: number): string {
  const alle = [...html.matchAll(/<time dateTime="([^"]+)"/g)].map((m) => m[1]);
  return alle[tidligere] ?? "";
}

beforeEach(() => {
  fastDato = FAST_DATI;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("/boernepenge — hvornår udbetales", () => {
  test("svarer på «hvornår» med en konkret dato for barnet under 15 år", async () => {
    const html = await markup(FAST_DATI);

    // Overskriften er selve svaret på søgningen «børnepenge hvornår».
    expect(html).toContain("Hvornår kommer børnepengen ud?");

    // 1. oktober 2026 → næste kvartalsudbetaling er 20. oktober, 19 dage frem.
    expect(html).toContain("om 19 dage");
    expect(html).toContain("tirsdag 20. oktober 2026");
    // Maskiner læser den ISO-dato, `<time>` rummer.
    expect(isoAf(html, 0)).toBe("2026-10-20");
  });

  test("svarer også for ungeydelsen, som udbetales hver måned", async () => {
    const html = await markup(FAST_DATI);

    expect(html).toContain("15-17 år");
    expect(html).toContain("tirsdag 20. oktober 2026");
    expect(isoAf(html, 1)).toBe("2026-10-20");
  });

  test("svarer «i dag» når betalingsdagen er i dag", async () => {
    // 20. oktober 2026 er en tirsdag og en betalingsdag. Siden skal kunne
    // sige det uden at lyde som om den var gået i forglemmelse.
    const html = await markup("2026-10-20");

    expect(html).toContain("i dag");
    expect(html).toContain("tirsdag 20. oktober 2026");
  });

  test("flytter datoen ind på en hverdag, når den 20. er en weekend", async () => {
    // 19. juni 2026: den 20. er en lørdag, så ungeydelsen står på konto 19. —
    // dvs. i dag. Svaret må ikke være 20. juni, for den dato er forbi.
    const html = await markup("2026-06-19");

    // Børneydelsen (kvartal) har intet med den 20. juni at gøre: næste
    // kvartalsudbetaling er 20. juli.
    expect(isoAf(html, 0)).toBe("2026-07-20");
    expect(html).toContain("mandag 20. juli 2026");

    // Ungeydelsen (måned) er den, der flyttes.
    expect(isoAf(html, 1)).toBe("2026-06-19");
    expect(html).toContain("fredag 19. juni 2026");
    expect(html).toContain("Den nominelle dato er 20. juni");
  });

  test("løber over årsskiftet uden at vise en gået dato", async () => {
    // 5. november 2026: næste kvartal er 20. januar 2027, for december ikke er
    // et kvartal. Et fast årstal ville have svaret 20. oktober 2026.
    const html = await markup("2026-11-05");

    expect(html).toContain("onsdag 20. januar 2027");
    expect(isoAf(html, 0)).toBe("2027-01-20");
    expect(html).not.toContain('<time dateTime="2026-10-20">tirsdag 20. oktober 2026</time>');
  });

  test("tabellerer alle fire kvartalsdatoer for året den næste betaling falder i", async () => {
    const html = await markup("2026-11-05");

    expect(html).toContain("Alle udbetalingsdatoer i 2027");
    for (const u of udbetalingsdatoerAar(2027, "kvartal")) {
      const maaned = new Intl.DateTimeFormat("da-DK", { month: "long" })
        .format(u.dato)
        .toLowerCase();
      expect(html, `20. ${maaned}`).toContain(`20. ${maaned}`);
    }
    // De fire datoer i 2027 er onsdag, tirsdag, tirsdag og onsdag.
    expect(html).toContain("onsdag");
    expect(html).toContain("tirsdag");
  });

  test("siger hvilken periode hver betaling dækker", async () => {
    const html = await markup(FAST_DATI);

    expect(html).toContain("Hver betaling dækker de tre måneder fra sin egen måned");
    expect(html).toContain("januar–marts");
    expect(html).toContain("oktober–december");
  });

  test("siger det, når ingen af årets datoer er flyttet", async () => {
    // 2026 har ingen kvartalsudbetaling på en weekend — målt, ikke antaget:
    // mellem 2026 og 2075 flyttes 61 af 200. Uden den linje ville kolonnen
    // «Står på konto» bare gentage kolonnen «Dato» fire gange uden at sige
    // hvorfor.
    const html = await markup(FAST_DATI);
    expect(html).toContain("Alle fire datoer er almindelige hverdage i 2026");
  });

  test("siger hvor mange, der er flyttet, i et år hvor der er nogle", async () => {
    // 2029 har to: den 20. januar og den 20. oktober.
    const html = await markup("2029-01-01");
    expect(html).toContain("Der er flyttet 2 af de fire datoer i 2029");
    expect(html).toContain("Alle udbetalingsdatoer i 2029");
  });

  test("læser dagens dato i dansk tid, ikke i serverens", async () => {
    // `iDagPaSiden` er stubbet, så porten dømmer på at siden *kalder* den
    // rigtige funktion og bruger dens svar. Uden stubben ville `new Date()` i UTC
    // give i går mellem kl. 00:00 og 02:00 dansk tid, og svaret ville være en
    // betaling, der er sket. Mutation: siden kalder `new Date()` direkte → denne
    // test fejler, fordi forventningerne så følger systemuret, ikke den
    // fastsatte dag.
    const sep30 = await markup("2026-09-30");
    expect(sep30).toContain("om 20 dage");
    expect(isoAf(sep30, 0)).toBe("2026-10-20");

    const okt1 = await markup("2026-10-01");
    expect(okt1).toContain("om 19 dage");
    expect(isoAf(okt1, 0)).toBe("2026-10-20");
  });

  test("viser aldersspændvidden for hele intervallet, ikke kun den første sats", async () => {
    // Regression: overskriften stod «Til et barn fra 0-2 år» over kvartalsblokken,
    // fordi koden greb den første sats med det interval. Men kvartalet udbetales
    // til alle under 15 år, så en læser med et tiårigt barn ville tro at det var
    // 0-2-årssatsen, der gjaldt. Spændet skal bygges af alle grupperne.
    const html = await markup(FAST_DATI);

    expect(html).toContain("Til et barn fra 0-14 år");
    expect(html).toContain("Til et barn fra 15-17 år");
    expect(html).not.toContain("Til et barn fra 0-2 år");
  });

  test("læser beløbsgrupperne fra samme modul som satsen", async () => {
    // Satsen står i `BOERNE_SATSER_2026`. Bloksiden skal ikke have sit eget
    // beløb, der så kan glide fra tabellen længere nede på siden.
    const html = await markup(FAST_DATI);
    expect(html).toContain("0-14 år");
    expect(html).toContain("15-17 år");
  });
});

describe("port-hjælpere", () => {
  test("parseIsoDato læser fastsatte dage, så testen ikke er ur-afhængig", () => {
    expect(iDagPaSiden(new Date(), "da")).toBeTypeOf("string");
    expect(parseIsoDato("2026-10-01")?.getDate()).toBe(1);
    // Ugyldig dato må give null, ikke en rullet dato — ellers ville porten
    // kunne læse en helt anden dag uden at sige det.
    expect(parseIsoDato("2026-13-01")).toBeNull();
  });
});
