import { describe, expect, test } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { getPageData } from "@/lib/page-data";
import FreelancerTimeprisPage from "@/app/blog/saadan-finder-du-din-timepris-som-freelancer/page";
import {
  DANSKE_MARKEDSPRISER,
  GRUPPE_ETIKETTER,
  POST_ETIKETTER,
  findMarkedspris,
  formaterMarkedspris,
  freelancerTimeprisFaqSvar,
  markedspriserErDanske,
  markedsprisFaqSvar,
  markedsprisOmraade,
  markedspriser,
} from "@/lib/timepris-markedspriser";

/**
 * Punkt 11: en påstand i tekst er kode.
 *
 * `/timepris` skrev 27 beløb håndskrevet i `TimeprisBeregner.tsx` — de samme
 * danske niveauer tre gange, mens overskriften sagde «Typiske timepriser i
 * Norge (2026)» på beregner.no og «Typiska timpriser i Sverige (2026)» på
 * beraknare.se. Sidens egen FAQ modsagde sit eget panel med tal, der stod
 * ingen steder i koden («IT: 900-1.800 SEK/timme»).
 *
 * Modulet løser det ved konstruktion: ét sæt tal, ét sted, og svaret på
 * «normal konsulent-timepris» læses fra samme tabel. Porten dømmer de to
 * ting, der kan glide fra hinanden igen — en række der mangler i ét sprog,
 * og et FAQ-svar der ikke kommer fra tabellen.
 */

const LOCALES = ["da", "se", "no"] as const;

function allePoster() {
  return DANSKE_MARKEDSPRISER.flatMap((g) => g.poster);
}

/**
 * `Intl` skriver tusindtalsseparatoren som et ubrudt mellemrum (U+00A0), som
 * er det korrekte i brødtekst, men umuligt at skrive i en assertion. Her
 * normaliseres det, så porten kan dømme tallene og ikke tegnsættet.
 */
function medMellemrum(str: string): string {
  return str.replace(/\u00a0/g, " ");
}

describe("timepris-markedspriser", () => {
  test("alle tre domæner får præcis samme fire grupper og tolv poster", () => {
    const da = markedspriser("da");
    const laegre = JSON.stringify(DANSKE_MARKEDSPRISER);

    for (const locale of LOCALES) {
      expect(JSON.stringify(markedspriser(locale))).toBe(laegre);
      expect(da.map((g) => g.id)).toEqual(["it", "kreativ", "raadgivning", "haandvaerk"]);
      expect(allePoster()).toHaveLength(12);
      expect(locale).toBeTruthy();
    }
  });

  test("hver post har et navn i alle tre sprog", () => {
    for (const gruppe of DANSKE_MARKEDSPRISER) {
      expect(Object.keys(GRUPPE_ETIKETTER[gruppe.id]).sort()).toEqual(["da", "no", "se"]);
      for (const post of gruppe.poster) {
        for (const locale of LOCALES) {
          expect(POST_ETIKETTER[post.id][locale]).toBeTruthy();
          expect(POST_ETIKETTER[post.id][locale].length).toBeGreaterThan(2);
        }
      }
    }
  });

  test("intet interval er vendt eller tomt", () => {
    for (const post of allePoster()) {
      expect(post.min).toBeGreaterThan(0);
      expect(post.max).toBeGreaterThan(post.min);
    }
  });

  test("dansk skriver «500-700 kr», svensk og norsk «500–700 DKK»", () => {
    const post = findMarkedspris("haandvaerk", "haandvaerker");

    // Dansk er uændret, så den danske side renderer præcis som før.
    expect(formaterMarkedspris(post, "da")).toBe("400-600 kr");
    // «kr» i svensk og norsk læses som egen valuta, så der står landekoden.
    expect(formaterMarkedspris(post, "se")).toBe("400–600 DKK");
    expect(formaterMarkedspris(post, "no")).toBe("400–600 DKK");
    expect(formaterMarkedspris(post, "se")).toContain("–");
  });

  test("tusindtalsseparatoren følger domænet, ikke altid dansk", () => {
    // Punkt 13-bristen: modulet hårdkodede `formatNumber(post.min, "da")`, så
    // beraknare.se skrev «Advokat: 1.500-3.500 DKK». I svensk og norsk er «.»
    // decimaltegn, så «1.500» læses som 1,5 — en faktor 1.000 for lav i en
    // pris-tabel. Ni af de tolv poster har en tusindtalsseparator.
    expect(medMellemrum(formaterMarkedspris(findMarkedspris("raadgivning", "advokat"), "se"))).toBe(
      "1 500–3 500 DKK"
    );
    expect(medMellemrum(formaterMarkedspris(findMarkedspris("raadgivning", "advokat"), "no"))).toBe(
      "1 500–3 500 DKK"
    );
    expect(medMellemrum(formaterMarkedspris(findMarkedspris("raadgivning", "advokat"), "da"))).toBe(
      "1.500-3.500 kr"
    );

    for (const post of allePoster()) {
      // Ingen punktum-tusindtalsseparator på de to domæner, hvor «.» er
      // decimaltegn.
      for (const locale of ["se", "no"] as const) {
        expect(formaterMarkedspris(post, locale)).not.toMatch(/\d\.\d{3}/);
      }
      // Og intet mellemrum som tusindtalsseparator i dansk.
      expect(formaterMarkedspris(post, "da")).not.toMatch(/\d\s\d/);
      expect(medMellemrum(formaterMarkedspris(post, "se"))).toContain("–");
    }
  });

  test("tabellen er dansk på de domæner, hvor den ikke er det lokale marked", () => {
    expect(markedsprisOmraade()).toBe("danmark");
    expect(markedspriserErDanske("da")).toBe(false);
    expect(markedspriserErDanske("se")).toBe(true);
    expect(markedspriserErDanske("no")).toBe(true);
  });

  test("FAQ-svaret læses fra tabellen, ikke skrives for sig", () => {
    for (const locale of LOCALES) {
      const it = formaterMarkedspris(findMarkedspris("it", "itKonsulent"), locale);
      const haandvaerk = formaterMarkedspris(findMarkedspris("haandvaerk", "haandvaerker"), locale);
      const svar = markedsprisFaqSvar(locale);

      expect(svar).toContain(it);
      expect(svar).toContain(haandvaerk);
      expect(svar).not.toContain("1.800");
    }
    expect(markedsprisFaqSvar("da")).toBe("IT: 900-1.500 kr/time. Håndværkere: 400-600 kr/time.");
    expect(medMellemrum(markedsprisFaqSvar("se"))).toBe(
      "Dansk nivå: IT 900–1 500 DKK/timme, hantverkare 400–600 DKK/timme."
    );
    expect(medMellemrum(markedsprisFaqSvar("no"))).toBe(
      "Dansk nivå: IT 900–1 500 DKK/time, håndverkere 400–600 DKK/time."
    );
  });
});

describe("/timepris-siden læser det samme sted", () => {
  test("FAQ'en på alle tre domæner kommer fra modulet", () => {
    for (const locale of LOCALES) {
      const faq = getPageData("timepris", locale)?.faqItems ?? [];
      const svar = faq.find((f) => /timepris\?|timpris\?/i.test(f.question));

      expect(svar, `${locale} mangler spørgsmålet om konsulent-timepris`).toBeTruthy();
      expect(svar?.answer).toBe(markedsprisFaqSvar(locale));
    }
  });

  test("de svenske og norske sider ikke længere påstår et lokalt marked", () => {
    // Modulet har ingen kilde på svensk eller norsk timepris, så påstandene
    // «900-1.800 SEK/timme» og «900-1.800 NOK/time» var opfundne tal.
    for (const locale of ["se", "no"] as const) {
      const hel = JSON.stringify(getPageData("timepris", locale));
      expect(hel).not.toContain("1.800 SEK");
      expect(hel).not.toContain("1.800 NOK");
      expect(hel).not.toContain("800 SEK");
      expect(hel).not.toContain("800 NOK");
    }
  });

  test("den danske FAQ svarer til sit eget panel", () => {
    const faq = getPageData("timepris", "da")?.faqItems ?? [];
    const svar = faq.find((f) => f.question === "Normal konsulent-timepris?")?.answer ?? "";

    // Panelet viser IT-konsulent 900-1.500; FAQ'en skrev 800-1.500.
    expect(svar).toContain("900-1.500");
    expect(svar).not.toContain("800-1.500");
    expect(formaterMarkedspris(findMarkedspris("it", "itKonsulent"), "da")).toBe("900-1.500 kr");
  });
});
/**
 * Blogindlægget `saadan-finder-du-din-timepris-som-freelancer` havde sin
 * egen «Typiske timepriser i Danmark (2026)»-tabel med otte håndskrevne
 * beløb og et FAQ-svar med tre til — og de modsagde `/timepris`:
 * indlægget skrev «Webudviklere 600-1.200 kr», «tekstforfattere 500-1.000
 * kr» og en senior-udvikler-pris på «800-1.400 kr», som stod ingen steder i
 * modulet. To sider på samme site gav to prisér på samme fag.
 *
 * Porten dømmer indlægget og modulet, så beløbene kun findes ét sted.
 */
describe("blogindlæggets timepriser kommer fra modulet", () => {
  const html = renderToStaticMarkup(
    createElement(FreelancerTimeprisPage as unknown as React.ComponentType)
  );
  // `renderToStaticMarkup` escaper `&`, og to gruppenavne indeholder det.
  const synlig = html.replace(/&amp;/g, "&");

  test("hver række i tabellen er en post fra modulet", () => {
    for (const gruppe of markedspriser("da")) {
      expect(synlig).toContain(GRUPPE_ETIKETTER[gruppe.id].da);
      for (const post of gruppe.poster) {
        expect(synlig).toContain(POST_ETIKETTER[post.id].da);
        expect(synlig).toContain(formaterMarkedspris(post, "da"));
      }
    }
  });

  test("de håndskrevne beløb er væk", () => {
    // 800-1.400 kr var senior-udvikler-prisen i indlæggets egen tabel.
    expect(html).not.toContain("800-1.400");
    expect(html).not.toContain("600-900 kr");
    expect(html).not.toContain("1.000-2.000 kr");
  });

  test("FAQ-svaret svarer til tabellen", () => {
    expect(synlig).toContain(freelancerTimeprisFaqSvar());
    expect(freelancerTimeprisFaqSvar()).toContain(
      formaterMarkedspris(findMarkedspris("it", "seniorUdvikler"), "da")
    );
    // Den gamle sætning startede lavere end tabellen gjorde.
    expect(freelancerTimeprisFaqSvar()).not.toContain("600-1.200 kr");
    expect(freelancerTimeprisFaqSvar()).not.toContain("500-1.000 kr");
  });
});
