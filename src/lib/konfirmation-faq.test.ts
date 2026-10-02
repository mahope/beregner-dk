import { describe, expect, test } from "vitest";
import { getPageData } from "@/lib/page-data";
import { PRISER, FASTE_POSTER, GAVEGENNEMSNIT } from "@/components/KonfirmationBeregner";
import {
  FOTOGRAF,
  GAVEBELOB,
  GAVEINTERVAL,
  KONFIRMANDTOEJ,
  MAD_PR_PERSON,
  konfirmationBrødtekstTal,
} from "@/lib/konfirmation-eksempler";
import { formatBelob } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

/**
 * Påstande i tekst er kode (punkt 11). `/konfirmation`'s FAQ blev publiceret som
 * `FAQPage`-JSON-LD med «8.000-25.000 DKK afhængigt af antal gæster» som svar
 * på «Hvad koster en konfirmation?» — altså et *samlet* beløb.
 *
 * Målt mod beregnerens egne tal (standardindstillinger: 30 gæster,
 * forsamlingshus, fotograf med): festen 19.600 kr. og gaverne 19.100 kr., i alt
 * 38.700 kr. Siden sagde altså «højst 25.000» om et beløb, dens egen værktøj
 * viser 38.700, og 25.000 var i virkeligheden loftet for *gaverne alene* — de
 * samme tal, brødteksten skriver som gaveinterval.
 *
 * 3/10 blev den samme fejl fundet **to gange til**, i de to andre sprog, som
 * den første rettelse lod stå: svensk svarede «10.000-30.000 SEK beroende på
 * antal gäster» og norsk «10.000-30.000 NOK avhengig av antall gjester» —
 * samme forveksling, samme danske punktum i en svensk og en norsk sætning, og
 * en valutaenhed ingen anden sted på siderne bruger.
 */
const DA_DEFAULTS = {
  gaester: 30,
  foraeldre: 2,
  bedsteforaeldre: 4,
  familie: 8,
  venner: 5,
};

function standardFoeldsom() {
  const p = PRISER.forsamlingshus;
  const udgifter =
    DA_DEFAULTS.gaester * p.madPrPerson +
    p.lokalePris +
    FASTE_POSTER.konfirmandToej +
    FASTE_POSTER.fotograf +
    FASTE_POSTER.pynt +
    FASTE_POSTER.invitation +
    FASTE_POSTER.kage;
  const gaver =
    DA_DEFAULTS.foraeldre * GAVEGENNEMSNIT.foraeldre +
    DA_DEFAULTS.bedsteforaeldre * GAVEGENNEMSNIT.bedsteforaeldre +
    DA_DEFAULTS.familie * GAVEGENNEMSNIT.oevrigFamilie +
    DA_DEFAULTS.venner * GAVEGENNEMSNIT.venner;
  return { udgifter, gaver, alt: udgifter + gaver };
}

const SPORGSMAAL: Record<Locale, string> = {
  da: "Hvad koster en konfirmation?",
  se: "Vad kostar en konfirmation?",
  no: "Hva koster en konfirmasjon?",
};

function kosterSvar(locale: Locale): string {
  return getPageData("konfirmation", locale)!.faqItems.find(
    (f) => f.question === SPORGSMAAL[locale],
  )!.answer;
}

/** Alle beløb i en sætning, i det sprog den er skrevet på. */
function belob(svar: string): string[] {
  return svar.match(/\d{1,3}(?:[. ]\d{3})+/g) ?? [];
}

describe("/konfirmation: FAQ'en må ikke modsige beregneren", () => {
  test("beregnerens standardforløb koster mere end det gamle FAQ-loft på 25.000", () => {
    const { udgifter, gaver, alt } = standardFoeldsom();
    // Beløbene her skal kunne slås op i KonfirmationBeregner.tsx — bliver de
    // ændret, peger denne prøve på den nye værdi i stedet for på en kold konstant.
    expect(udgifter).toBe(19_600);
    expect(gaver).toBe(19_100);
    expect(alt).toBe(38_700);
    expect(alt).toBeGreaterThan(25_000);
  });

  test("svaret på «Hvad koster en konfirmation?» rammer ikke længere under sit eget værktøj", () => {
    const svar = kosterSvar("da");
    expect(svar).not.toMatch(/8\.000-25\.000/);
    // Dansk side skriver «kr.», ikke «DKK» — de øvrige svar og hele brødteksten
    // gør det samme, og FAQ'en publiceres som JSON-LD ved siden af dem.
    expect(svar).not.toMatch(/DKK/);
    expect(svar).toContain("10.000 og 25.000 kr.");
  });

  test("gaveintervallet i FAQ'en er det samme som i sidens brødtekst", () => {
    // Prøven hedder det, så den dømmer det — i alle tre sprog og på det tal, der
    // står i begge steder. Før 3/10 svarede svensk «10.000-30.000 SEK», mens
    // brødteksten lige ovenfor sagde «mellan 10 000 och 25 000 kr»: de to
    // modsagde hinanden på den samme side, og kun JSON-LD'en bar den ene.
    for (const locale of ["da", "se", "no"] as const) {
      expect(kosterSvar(locale)).toContain(konfirmationBrødtekstTal(locale).gaver);
    }
  });
});

describe("/konfirmation: de håndskrevne intervaller", () => {
  test("hvert interval rummer den pris, beregneren regner med", () => {
    // De syv par er hele sammenhængen mellem løftet og værktøjet: siden lover
    // et interval, `KonfirmationBeregner` tager ét tal i det. Ændres et tal i
    // komponenten uden at intervallet følger med, bliver denne prøve rød —
    // altså kan siden ikke begynde at lyve, fordi porten dømmer begge sider.
    const par: [number, { min: number; maks: number }, string][] = [
      [PRISER.hjemme.madPrPerson, MAD_PR_PERSON.hjemme, "mad hjemme"],
      [PRISER.forsamlingshus.madPrPerson, MAD_PR_PERSON.forsamlingshus, "forsamlingshus"],
      [PRISER.restaurant.madPrPerson, MAD_PR_PERSON.restaurant, "mad restaurant"],
      [FASTE_POSTER.konfirmandToej, KONFIRMANDTOEJ, "konfirmandtøj"],
      [FASTE_POSTER.fotograf, FOTOGRAF, "fotograf"],
      [GAVEGENNEMSNIT.foraeldre, GAVEBELOB.foraeldre, "gave fra forældre"],
      [GAVEGENNEMSNIT.bedsteforaeldre, GAVEBELOB.bedsteforaeldre, "gave fra bedsteforældre"],
    ];
    for (const [pris, interval, navn] of par) {
      expect(pris, `${navn} ligger ikke i sit interval`).toBeGreaterThanOrEqual(interval.min);
      expect(pris, `${navn} ligger ikke i sit interval`).toBeLessThanOrEqual(interval.maks);
    }
  });

  test("gaveintervallet rummer det, gaverne faktisk bliver", () => {
    expect(standardFoeldsom().gaver).toBeGreaterThanOrEqual(GAVEINTERVAL.min);
    expect(standardFoeldsom().gaver).toBeLessThanOrEqual(GAVEINTERVAL.maks);
  });
});

describe("/konfirmation: svensk og norsk", () => {
  test("svarene på «hvad koster en konfirmation?» nævner kun gaveintervallet", () => {
    // Den gamle svenske og norske streng lovede 10.000-30.000 som et *samlet*
    // beløb. Det er ikke en formuleringsfejl, det er et tal der ikke er
    // beregnerens, så prøven tæller beløbene i svaret i stedet for at læse dem:
    // de skal være præcis de to endepunkter, i sprog egen skrivemåde.
    for (const locale of ["se", "no"] as const) {
      const forventet = [
        formatBelob(GAVEINTERVAL.min, locale),
        formatBelob(GAVEINTERVAL.maks, locale),
      ].sort();
      expect(belob(kosterSvar(locale)).sort(), locale).toEqual(forventet);
    }
  });

  test("svarene skriver tusindtalsseparatoren i sit eget sprog", () => {
    // «10.000» i en svensk sætning læses som hundrede tusind, og `FAQSchema`
    // publicerer svaret — samme fejl som `/kvadratmeter` og `/kalorier` havde.
    for (const locale of ["se", "no"] as const) {
      for (const svar of getPageData("konfirmation", locale)!.faqItems.map((f) => f.answer)) {
        expect(svar, locale).not.toMatch(/\d\.\d{3}/);
      }
    }
  });

  test("svarene skriver «kr», som resten af siderne gør", () => {
    // Svensk skrev «SEK» og norsk «NOK», mens brødteksten, beregnerens
    // resultatblok og sidens egen `getCurrencySuffix` skriver «kr».
    for (const locale of ["se", "no"] as const) {
      for (const svar of getPageData("konfirmation", locale)!.faqItems.map((f) => f.answer)) {
        expect(svar, locale).not.toMatch(/\b(SEK|NOK|DKK)\b/);
      }
    }
  });

  test("intet svar får dobbelt punktum efter «kr»", () => {
    // Den fejl denne iteration næsten skrev ind: intervallet «2.000-5.000 kr.»
    // skrev sit eget punktum, og sætningen satte et til oveni — «kr..». Dansk
    // skriver «kr.», svensk og norsk «kr», så det er den danske gren, der
    // double-punktet. Samme residue som `/leasing` havde i to dage (punkt 13):
    // hverken tsc, lint eller build kan se den, kun en sætningsregel.
    for (const locale of ["da", "se", "no"] as const) {
      for (const svar of getPageData("konfirmation", locale)!.faqItems.map((f) => f.answer)) {
        expect(svar, locale).not.toMatch(/kr\.\./);
      }
    }
  });

  test("alle tre sprog får samme gavebeløb pr. relation", () => {
    // Norsk lovede 3.000-8.000 kr. til forældre, dansk 2.000-5.000 kr. — for
    // én og samme beregner, der bruger 3.000 kr. på alle domæner.
    const sporgsmaal: Record<Locale, string> = {
      da: "Gavebeløb?",
      se: "Gåvobelopp?",
      no: "Gavebeløp?",
    };
    for (const locale of ["da", "se", "no"] as const) {
      const svar = getPageData("konfirmation", locale)!.faqItems.find(
        (f) => f.question === sporgsmaal[locale],
      )!.answer;
      expect(belob(svar).sort(), locale).toEqual(
        [
          formatBelob(GAVEBELOB.foraeldre.min, locale),
          formatBelob(GAVEBELOB.foraeldre.maks, locale),
          formatBelob(GAVEBELOB.bedsteforaeldre.min, locale),
          formatBelob(GAVEBELOB.bedsteforaeldre.maks, locale),
        ].sort(),
      );
    }
  });
});

describe("/konfirmation: brødteksten", () => {
  test("dansk er byte-uændret", () => {
    // De to afsnit har altid skrevet «150-200 kr./person hjemme til 400-700
    // kr./person på restaurant» og «10.000 og 25.000 kr.». Dansk er den største
    // side, så en ændring i den skal være en beslutning og ikke en bivirkning
    // af at flytte tal ind i et modul.
    const t = konfirmationBrødtekstTal("da");
    expect(t.madHjemme).toBe("150-200 kr./person");
    expect(t.madRestaurant).toBe("400-700 kr./person");
    expect(t.konfirmandtoej).toBe("1.500-4.000 kr.");
    expect(t.fotograf).toBe("1.000-3.000 kr.");
    expect(t.gaver).toBe("10.000 og 25.000 kr.");
  });

  test("svensk og dansk lovede to forskellige fotografintervaller", () => {
    // Dansk skrev «omkring 1.000-3.000 kr.» og svensk «kring 1 500-4 000 kr»
    // for én og samme konstant på 1.500 kr. Nu er der ét interval, formatteret
    // i hvert sprog — så de to domæner ikke længere kan love hinanden forskel.
    expect(konfirmationBrødtekstTal("se").fotograf).toBe("1 000-3 000 kr");
    expect(konfirmationBrødtekstTal("da").fotograf).toBe("1.000-3.000 kr.");
  });

  test("svensk og norsk skriver mellemrum, dansk punktum", () => {
    expect(konfirmationBrødtekstTal("se").konfirmandtoej).toBe("1 500-4 000 kr");
    expect(konfirmationBrødtekstTal("no").konfirmandtoej).toBe("1 500-4 000 kr");
  });
});
