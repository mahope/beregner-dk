import { describe, test, expect } from "vitest";
import {
  getHomePageData,
  getHomeCalculators,
  getHomeCalculatorCount,
  getDageTilKort,
} from "./home-data";
import { isCalculatorAvailable } from "./calculator-list";
import { beregnere } from "./categories";
import {
  getDageTilAnswer,
  getDageTilEvents,
  getDageTilSlugs,
  type DageTilLocale,
} from "./dage-til";

describe("getHomePageData", () => {
  test("returns data for all locales", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const data = getHomePageData(locale);
      expect(data.hero.title, `${locale} hero title`).toBeTruthy();
      expect(data.hero.subtitle, `${locale} hero subtitle`).toBeTruthy();
      expect(data.meta.title, `${locale} meta title`).toBeTruthy();
      expect(data.faqItems.length, `${locale} FAQ items`).toBeGreaterThan(0);
    }
  });

  test("trust signals have correct format (value|label)", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const data = getHomePageData(locale);
      for (const key of ["calculators", "rates", "price", "privacy"] as const) {
        const signal = data.trustSignals[key];
        expect(signal, `${locale} trust signal ${key}`).toContain("|");
      }
    }
  });

  test("privacy copy distinguishes fragment and query-based share links", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const data = getHomePageData(locale);
      const privacyCopy = [
        data.sections.features.private.description,
        data.faqItems.find((item) => item.question.toLowerCase().includes(locale === "se" ? "sparar" : locale === "no" ? "lagrer" : "gemmer"))?.answer ?? "",
      ].join(" ");
      expect(privacyCopy, `${locale} privacy copy`).not.toMatch(
        /åbner et delelink|åpner et delelink|öppnar en delelänk/i,
      );
      expect(privacyCopy, `${locale} privacy copy`).not.toMatch(
        /bruger en delefunktion|bruker en delingsfunksjon|använder en delningsfunktion/i,
      );
      expect(privacyCopy, `${locale} privacy copy`).toMatch(/query/i);
      expect(data.trustSignals.privacy, `${locale} privacy badge`).toMatch(/database|databas/i);
      expect(data.trustSignals.privacy, `${locale} privacy badge`).not.toMatch(
        /^100%\|/,
      );
    }
  });
});

describe("getHomeCalculators", () => {
  test("returns calculators for all locales", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const calcs = getHomeCalculators(locale);
      expect(calcs.length, `${locale} calculator count`).toBeGreaterThan(10);
    }
  });

  test("DA has more calculators than SE/NO", () => {
    const da = getHomeCalculators("da");
    const se = getHomeCalculators("se");
    expect(da.length).toBeGreaterThan(se.length);
  });

  test("all calculators have required fields", () => {
    for (const locale of ["da", "no", "se"] as const) {
      for (const calc of getHomeCalculators(locale)) {
        expect(calc.title, `${locale}:${calc.href}`).toBeTruthy();
        expect(calc.href).toMatch(/^\//);
        expect(calc.category).toBeTruthy();
      }
    }
  });

  test("BMI home cards describe an adult calculator", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const bmi = getHomeCalculators(locale).find((calc) => calc.href === "/bmi");
      expect(bmi?.description.toLowerCase()).toMatch(/voksne|vuxna/);
    }
  });

  test("only exposes calculators available in the active locale", () => {
    for (const locale of ["da", "no", "se"] as const) {
      for (const calculator of getHomeCalculators(locale)) {
        expect(
          isCalculatorAvailable(calculator.href, locale),
          `${locale}/${calculator.href}`
        ).toBe(true);
      }
    }
  });

  test("Swedish home links the Swedish-only salary and mortgage calculators", () => {
    const hrefs = getHomeCalculators("se").map((calculator) => calculator.href);
    expect(hrefs).toContain("/lon-efter-skatt");
    expect(hrefs).toContain("/bolan");
    expect(hrefs).not.toContain("/loen-efter-skat");
  });

  test("the visible calculator count is derived, not hardcoded", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const count = getHomeCalculatorCount(locale);
      const data = getHomePageData(locale);
      const copy = [
        data.trustSignals.calculators,
        data.meta.description,
        data.hero.subtitle,
        ...data.faqItems.map((item) => item.answer),
      ].join(" ");
      expect(copy, `${locale} copy has no leftover placeholder`).not.toContain("{count}");
      expect(
        copy,
        `${locale} copy states the real calculator count (${count})`
      ).toContain(`${count}`);
    }
  });

  test("popular row follows the measured top pages per locale", () => {
    const daPopular = getHomeCalculators("da")
      .filter((c) => c.popular)
      .map((c) => c.href);
    for (const href of [
      "/dato",
      "/bmi",
      "/boligstoette",
      "/kvadratmeter",
      "/rentefradrag",
      "/tidsberegner",
      "/kalorier",
      "/braendstof",
      "/loen-efter-skat",
    ]) {
      expect(daPopular, `DA popular ${href}`).toContain(href);
    }

    const sePopular = getHomeCalculators("se")
      .filter((c) => c.popular)
      .map((c) => c.href);
    for (const href of [
      "/tidsberegner",
      "/dato",
      "/leasing",
      "/nedtaelling",
      "/tidszone",
      "/lon-efter-skatt",
    ]) {
      expect(sePopular, `SE popular ${href}`).toContain(href);
    }
  });

  test("some calculators are marked popular", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const popular = getHomeCalculators(locale).filter((c) => c.popular);
      expect(popular.length, `${locale} popular count`).toBeGreaterThan(3);
    }
  });

  test("the Danish popular row is the measured top pages, in traffic order", () => {
    // Plausible 2026-09-28, 28 dage: /dato 1057, /bmi 954, /boligstoette 527,
    // /kvadratmeter 375, /rentefradrag 319, /kalorier 293, /tidsberegner 288,
    // /braendstof 267, /barselsdagpenge 198, /husleje 170, /renteberegner 148,
    // /boernepenge 141, /pension 139 — plus /loen-efter-skat as brandværktøj.
    expect(
      getHomeCalculators("da")
        .filter((c) => c.popular)
        .map((c) => c.href),
    ).toEqual([
      "/dato",
      "/bmi",
      "/boligstoette",
      "/kvadratmeter",
      "/rentefradrag",
      "/tidsberegner",
      "/kalorier",
      "/braendstof",
      "/barselsdagpenge",
      "/husleje",
      "/renteberegner",
      "/boernepenge",
      "/pension",
      "/loen-efter-skat",
    ]);
  });

  test("every calculator in the site catalog is linked from a homepage", () => {
    const linked = new Set([
      ...getHomeCalculators("da").map((c) => c.href),
      ...getHomeCalculators("se").map((c) => c.href),
    ]);
    const orphans = beregnere
      .map((item) => item.href)
      .filter((href) => !linked.has(href));
    expect(orphans, "katalogsider uden link fra forside").toEqual([]);
  });

  test("every Danish first-page search page is linked from the Danish homepage", () => {
    // Search Console 2026-08-29 → 2026-09-26: de danske sider med flest
    // visninger ligger alle på position 5-9, men /promille, /brok og /fart
    // havde pr. 2026-09-28 nul interne links fra forsiden.
    const daHrefs = getHomeCalculators("da").map((c) => c.href);
    for (const href of [
      "/procent",
      "/dato",
      "/tidsberegner",
      "/tidszone",
      "/moms",
      "/kvadratmeter",
      "/braendstof",
      "/renteberegner",
      "/kalorier",
      "/boligstoette",
      "/alder",
      "/promille",
      "/brok",
      "/fart",
    ]) {
      expect(daHrefs, `DA-forsiden linker ${href}`).toContain(href);
    }
  });

  test("home catalog categories match the site catalog they are copied from", () => {
    // Kun kategorien låses, ikke titlen: tre kort har bevidst en kortere titel på
    // forsiden ("Rejsebudget" mod "Rejsebudget Beregner"), og det er ikke en
    // fejl. Kategorien derimod styrer badge, farve og gruppering, så den skal
    // ikke kunne afvige mellem forsiden og /kategori-siderne.
    const siteKatalog = new Map(beregnere.map((item) => [item.href, item]));
    for (const calc of getHomeCalculators("da")) {
      const source = siteKatalog.get(calc.href);
      if (!source) continue;
      expect(calc.category, `${calc.href} category`).toBe(source.category);
    }
  });
});

describe("getDageTilKort", () => {
  const idag = new Date();

  test("forsiden linker hver dage-til-side dens eget sprog serverer", () => {
    // The expected prefix is written out literally on purpose. Deriving it from
    // getDageTilPrefix made the test build the very string the code built, so a
    // malformed href passed — the prefix already carries both slashes, and
    // "//dage-til//juledagen" is a protocol-relative URL to a host named
    // "dage-til". A measurement must not repeat the expression it measures.
    const forventetPrefix: Record<string, string> = {
      da: "/dage-til/",
      se: "/dagar-till/",
    };

    for (const locale of ["da", "se"] as const) {
      const slugge = getDageTilSlugs(locale);
      const hrefs = getDageTilKort(locale, idag).map((k) => k.href);
      expect(slugge.length).toBeGreaterThan(0);
      for (const slug of slugge) {
        expect(hrefs, `${locale}/${slug}`).toContain(`${forventetPrefix[locale]}${slug}`);
      }
    }
  });

  test("intet href på forsiden må starte med to skråstreg", () => {
    // A leading "//" is protocol-relative, so the card would leave the site.
    for (const locale of ["da", "se", "no"] as const) {
      for (const kort of getDageTilKort(locale, idag)) {
        expect(kort.href, `${locale}/${kort.title}`).not.toMatch(/^\/\//);
        expect(kort.href, `${locale}/${kort.title}`).not.toContain("//");
        expect(kort.href, `${locale}/${kort.title}`).toMatch(/^\/[a-z-]+\/[a-z0-9-]+$/);
      }
    }
  });

  test("beregner.no får ingen kort, fordi domænet ikke serverer dage-til", () => {
    expect(getDageTilKort("no", idag)).toEqual([]);
    expect(getDageTilSlugs("no")).toEqual([]);
  });

  test("kortets titel er sideens egen <h1>, så de to ikke kan glide fra hinanden", () => {
    for (const locale of ["da", "se"] as const) {
      const sprog = locale as DageTilLocale;
      const events = getDageTilEvents(locale);
      const kort = getDageTilKort(locale, idag);
      expect(kort).toHaveLength(events.length);
      for (const [i, event] of events.entries()) {
        expect(kort[i].title).toBe(event[sprog].copy.question);
      }
    }
  });

  test("dage-tallet i beskrivelsen er beregnet, ikke skrevet i hånden", () => {
    for (const locale of ["da", "se"] as const) {
      const sprog = locale as DageTilLocale;
      const ord = sprog === "da" ? "dage" : "dagar";
      const events = getDageTilEvents(locale);
      for (const [i, event] of events.entries()) {
        const svar = getDageTilAnswer(event, sprog, idag);
        const forventet = svar.isToday
          ? `det er idag.`
          : `${svar.days} ${ord} till`.replace("till", sprog === "da" ? "til" : "till");
        expect(getDageTilKort(locale, idag)[i].description).toContain(
          forventet
        );
      }
    }
  });

  test("kortene er hverken populære eller i en kategori, så de ikke havner i kataloggitteret", () => {
    for (const kort of getDageTilKort("da", idag)) {
      expect(kort.popular).toBe(false);
      expect(kort.category).toBe("");
    }
  });

  test("kortene følger kalenderen: samme kald en dag senere flytter antallet", () => {
    const foer = getDageTilKort("da", new Date("2026-09-28T12:00:00Z"));
    const senere = getDageTilKort("da", new Date("2026-09-29T12:00:00Z"));
    const foerDage = foer.map((k) => k.description);
    const senereDage = senere.map((k) => k.description);
    expect(senereDage).not.toEqual(foerDage);
    for (const [i, d] of foerDage.entries()) {
      const tal = Number(d.match(/^(\d+) dage/)?.[1]);
      const ny = Number(senereDage[i].match(/^(\d+) dage/)?.[1]);
      expect(ny).toBe(tal - 1);
    }
  });
});
