import { describe, expect, test } from "vitest";
import {
  beregnKlokkenNu,
  findKlokkenLand,
  getKlokkenPrefix,
  getKlokkenHubRaekker,
  getKlokkenSlugs,
  KLOKKEN_LANDE,
  klokkenLandTitel,
  landetsNavn,
  tidsforskelMinutter,
} from "./klokken-i";

/** Vinter: Danmark står på CET (UTC+1). Sommer: CEST (UTC+2). */
const VINTER = new Date("2026-01-15T12:00:00Z");
const SOMMER = new Date("2026-07-15T12:00:00Z");

function by(landSlug: string, index = 0) {
  const land = findKlokkenLand(landSlug, "da");
  if (!land) throw new Error(`Ukendt land: ${landSlug}`);
  return land.byer[index];
}

describe("tidsforskellen læses fra kalenderen, ikke fra en tabel", () => {
  test("vinter: Tokyo er 8 timer foran Danmark, New York 6 bagud", () => {
    expect(tidsforskelMinutter(VINTER, "Asia/Tokyo")).toBe(480);
    expect(tidsforskelMinutter(VINTER, "America/New_York")).toBe(-360);
  });

  test("skiftevinduet: USA har skiftet, Danmark har ikke, så tallet flytter sig", () => {
    // USA skifter anden søndag i marts, Danmark sidste søndag i marts. Den
    // 22. marts står New York derfor på UTC-4 mens Danmark stadig er på
    // UTC+1, så forskellen er 5 timer i stedet for 6. Et fast tal i en
    // brødtekst ville være forkeret i de tre uger imellem de to skiftedatoer.
    const marts = new Date("2026-03-22T12:00:00Z");
    expect(tidsforskelMinutter(marts, "America/New_York")).toBe(-300);
    expect(tidsforskelMinutter(VINTER, "America/New_York")).toBe(-360);
    expect(tidsforskelMinutter(SOMMER, "America/New_York")).toBe(-360);
  });

  test("sommer: Tokyo er 7 timer foran, fordi Danmark også har skiftet", () => {
    expect(tidsforskelMinutter(SOMMER, "Asia/Tokyo")).toBe(420);
  });

  test("et halvt timezone-sprog skriver minutterne ud, ikke 4,5", () => {
    const svar = beregnKlokkenNu(by("indien"), "da", VINTER);
    expect(svar.tid).toBe("17:30");
    expect(svar.forskel).toBe("4 timer og 30 minutter foran");
  });

  test("en by der krydser datolinjen får et positivt tal, ikke -8", () => {
    // 23:30 i Tokyo er 14:30 samme dag i Danmark, så forskellen er stadig +
    // 8 timer. Et naivt differens af de to klokkeslæt ville give -8 her.
    const senNat = new Date("2026-01-15T14:30:00Z");
    expect(tidsforskelMinutter(senNat, "Asia/Tokyo")).toBe(480);
    expect(beregnKlokkenNu(by("japan"), "da", senNat).tid).toBe("23:30");
  });

  test("byen og Danmark kan stå på hver sin kalenderdag", () => {
    const svar = beregnKlokkenNu(by("japan"), "da", senDagEfterMidnat);
    expect(svar.andenDag).not.toBeNull();
    expect(svar.andenDag).toContain("anden dato");
    const dansk = beregnKlokkenNu(by("portugal"), "da", senDagEfterMidnat);
    expect(dansk.andenDag).toBeNull();
  });
});

const senDagEfterMidnat = new Date("2026-01-15T22:30:00Z");

describe("sidens svar", () => {
  test("vintertid: New York er 07:00 og 6 timer bagud", () => {
    const svar = beregnKlokkenNu(by("usa"), "da", VINTER);
    expect(svar.tid).toBe("07:00");
    expect(svar.forskel).toBe("6 timer bagud");
    expect(svar.by).toBe("New York");
    // 07:00 er morgen, ikke nat — natten er aftager 23-07 i byens eget ur.
    expect(svar.erNatte).toBe(false);
  });

  test("datoen skrives i byens egen tid, ikke i Danmarks", () => {
    // 15. januar kl. 21:00 i Tokyo er stadig 15. januar i Danmark, mens
    // kl. 07:00 i New York er 15. januar — ingen af dem må låne Danmarks dag.
    expect(beregnKlokkenNu(by("japan"), "da", VINTER).dato).toBe(
      "torsdag 15. januar 2026"
    );
    expect(beregnKlokkenNu(by("japan"), "se", VINTER).dato).toBe(
      "torsdag 15. januari 2026"
    );
  });

  test("et land uden sommertid flytter sig stadig en time, fordi Danmark gør", () => {
    // Bangkok har fast UTC+7 hele året. Forskellen er derfor 6 timer om
    // vinteren og 5 om sommeren — ændringen kommer fra Danmark, ikke Bangkok.
    expect(tidsforskelMinutter(VINTER, "Asia/Bangkok")).toBe(360);
    expect(tidsforskelMinutter(SOMMER, "Asia/Bangkok")).toBe(300);
  });

  test("natten følger byens eget ur, ikke Danmarks", () => {
    // Kl. 06:00 dansk tid er 14:00 i Sydney, 00:00 i New York og 21:00 dagen
    // før i Los Angeles: to byer er i dagslys og én er midt i natten på samme
    // øjeblik. Dømmer porten på dansk tid, ville alle tre få samme svar.
    const tidspunkt = new Date("2026-07-15T04:00:00Z");
    expect(beregnKlokkenNu(by("australien"), "da", tidspunkt).tid).toBe("14:00");
    expect(beregnKlokkenNu(by("australien"), "da", tidspunkt).erNatte).toBe(false);
    expect(beregnKlokkenNu(by("usa"), "da", tidspunkt).tid).toBe("00:00");
    expect(beregnKlokkenNu(by("usa"), "da", tidspunkt).erNatte).toBe(true);
    expect(beregnKlokkenNu(by("usa", 3), "da", tidspunkt).tid).toBe("21:00");
    expect(beregnKlokkenNu(by("usa", 3), "da", tidspunkt).erNatte).toBe(false);
  });
});

describe("ruterne", () => {
  test("alle ti danske autocomplete-land er dækket", () => {
    // Målt 2/10: `suggestqueries.google.com?hl=da&gl=dk&q=hvad+er+klokken+i`.
    for (const landSlug of [
      "usa",
      "thailand",
      "australien",
      "japan",
      "tyrkiet",
      "canada",
      "kina",
    ]) {
      expect(findKlokkenLand(landSlug, "da"), landSlug).not.toBeNull();
    }
  });

  test("naboerne Norge og Tyskland har hver sin side i begge sprog", () => {
    // Målt 4/10 05:1x: «hvad er klokken i norge» → «… i norge» + «… norge
    // lige nu», «hvad er klokken i tyskland» → «… tyskland» + «… tyskland
    // lige nu». Det er Danmarks nærmeste naboer, og de var de eneste af de
    // ti målte lande vi manglede.
    for (const sprog of ["da", "se"] as const) {
      expect(findKlokkenLand("norge", sprog)?.byer[0].zone).toBe("Europe/Oslo");
      expect(findKlokkenLand("tyskland", sprog)?.byer[0].zone).toBe(
        "Europe/Berlin"
      );
    }
    expect(getKlokkenSlugs("da")).toContain("norge");
    expect(getKlokkenSlugs("se")).toContain("tyskland");
    // Rækken på hubben er samme liste, så en side der ikke er med dér ville
    // være en side uden indgang.
    const raekker = getKlokkenHubRaekker("da", new Date("2026-07-15T04:00:00Z"));
    expect(raekker.map((r) => r.id)).toContain("norge");
    expect(raekker.map((r) => r.id)).toContain("tyskland");
  });

  test("egne lande får ingen side — de er dækket af /tidszone", () => {
    // En dansk læser der spørger «hvad er klokken i danmark» kan se svaret på
    // sin egen telefon; en sådan side er tynd SEO-fyld.
    expect(findKlokkenLand("danmark", "da")).toBeNull();
    expect(findKlokkenLand("sverige", "se")).toBeNull();
    expect(findKlokkenLand("new-york", "da")).toBeNull();
  });

  test("slug og navn følger spørgsmålet på begge domæner", () => {
    expect(findKlokkenLand("turkiet", "se")).not.toBeNull();
    expect(findKlokkenLand("tyrkiet", "se")).toBeNull();
    const tyrkiet = findKlokkenLand("tyrkiet", "da");
    expect(tyrkiet && landetsNavn(tyrkiet, "se")).toBe("Turkiet");
    expect(getKlokkenPrefix("da")).toBe("/klokken-i/");
    expect(getKlokkenPrefix("se")).toBe("/klockan-i/");
    expect(getKlokkenPrefix("no")).toBeUndefined();
  });

  test("alle lande har mindst én by med en IANA-zone", () => {
    for (const land of KLOKKEN_LANDE) {
      expect(land.byer.length).toBeGreaterThan(0);
      expect(land.byer[0].zone).toMatch(/^[A-Za-z]+\/[A-Za-z_]+$/);
    }
  });

  test("slugene er unikke, så ingen side overskriver en anden", () => {
    for (const sprog of ["da", "se"] as const) {
      const slugs = getKlokkenSlugs(sprog);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });
  /**
   * Landstitlen skal regne om **12** fra læserens egen zone, og forventningerne
   * er her skrevet fra `tzdb`-viden om den enkelte by — ikke genberegnet med den
   * samme formel som koden. Tokyo står på UTC+9 hele året, så 12 i Danmark er
   * 20:00 om vinteren (Danmark UTC+1) og 19:00 om sommeren (Danmark UTC+2):
   * et håndskrevet «20:00» holder altså kun halve året og bliver rødt i juli.
   */
  test("landstitlen regner om 12 i Danmark til byens egen tid, vinter og sommer", () => {
    const japan = findKlokkenLand("japan", "da");
    const usa = findKlokkenLand("usa", "da");
    if (!japan || !usa) throw new Error("japan/usa skal findes");
    expect(klokkenLandTitel(japan, "da", VINTER)).toBe(
      "Hvad er klokken i Japan? 12 i Danmark = 20:00 i Tokyo"
    );
    expect(klokkenLandTitel(japan, "da", SOMMER)).toBe(
      "Hvad er klokken i Japan? 12 i Danmark = 19:00 i Tokyo"
    );
    // USA skifter til sommertid samme dag som Danmark, så forskellen er de
    // samme 6 timer hele året. New York er UTC-5 / UTC-4 mod Danmarks UTC+1 /
    // UTC+2 — det er grunden til at tallet ikke skifter her.
    expect(klokkenLandTitel(usa, "da", VINTER)).toContain("= 06:00 i New York");
    expect(klokkenLandTitel(usa, "da", SOMMER)).toContain("= 06:00 i New York");
  });

  test("alle landstitler har byen med og ingen arv fra rodlayoutets site-navn", () => {
    for (const sprog of ["da", "se"] as const) {
      const egetZone = sprog === "da" ? "Danmark" : "Sverige";
      for (const slug of getKlokkenSlugs(sprog)) {
        const land = findKlokkenLand(slug, sprog);
        if (!land) throw new Error(`Ukendt land: ${sprog}/${slug}`);
        const titel = klokkenLandTitel(land, sprog, VINTER);
        const sporgsmaal =
          sprog === "da" ? /^Hvad er klokken i / : /^Vad är klockan i /;
        expect(titel, `${sprog}/${slug}`).toMatch(sporgsmaal);
        expect(titel, `${sprog}/${slug}`).toMatch(/\d\d:\d\d/);
        expect(titel, `${sprog}/${slug}`).toContain(`12 i ${egetZone} = `);
        // `| MinBeregner.dk` lå i alle tolv titler før 3/10 19:1x.
        expect(titel, `${sprog}/${slug}`).not.toContain("MinBeregner.dk");
        expect(titel.length, `${sprog}/${slug}`).toBeLessThanOrEqual(70);
      }
    }
  });
});

describe("landene dansk autocomplete spørger om, men vi ikke dækkede", () => {
  // «klokken i roma», «klokken i amsterdam», «klokken i dubai» m.fl. var
  // danske completioner, men `/klokken-i/*` kunne ikke svare på dem, fordi
  // landet ikke stod i `KLOKKEN_LANDE`. Danmark og Sverige er bevidst
  // undtaget — de er læserens eget marked og dækket af `/tidszone`
  // (se porten «egne lande får ingen side»).
  const FORVENTET = [
    { slugDa: "frankrig", slugSe: "frankrike", zone: "Europe/Paris" },
    { slugDa: "italien", slugSe: "italien", zone: "Europe/Rome" },
    { slugDa: "nederlandene", slugSe: "nederlanden", zone: "Europe/Amsterdam" },
    { slugDa: "graekenland", slugSe: "grekland", zone: "Europe/Athens" },
    { slugDa: "schweiz", slugSe: "schweiz", zone: "Europe/Zurich" },
    { slugDa: "marokko", slugSe: "marokko", zone: "Africa/Casablanca" },
    { slugDa: "emiraterne", slugSe: "emiraten", zone: "Asia/Dubai" },
  ] as const;

  /** UTC-forskellen i minutter, som `Intl` selv læser den — uafhængig af modulet. */
  function ianaOffsetMinutter(zone: string, tidspunkt: Date): number {
    const dele = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "longOffset",
    }).formatToParts(tidspunkt);
    const navn = dele.find((d) => d.type === "timeZoneName")?.value ?? "";
    const fundet = navn.match(/GMT([+-])(\d{1,2}):(\d{2})/);
    if (!fundet) return navn.includes("GMT+") ? 0 : NaN;
    const minutter = Number(fundet[2]) * 60 + Number(fundet[3]);
    return fundet[1] === "-" ? -minutter : minutter;
  }

  test("alle svy lande har en side i begge sprog, med den IANA-zone de er dømt mod", () => {
    for (const land of FORVENTET) {
      expect(getKlokkenSlugs("da"), `da/${land.slugDa}`).toContain(land.slugDa);
      expect(getKlokkenSlugs("se"), `se/${land.slugSe}`).toContain(land.slugSe);
      const fundet = findKlokkenLand(land.slugDa, "da");
      expect(fundet, `findKlokkenLand(${land.slugDa})`).not.toBeNull();
      expect(fundet!.byer[0].zone, land.slugDa).toBe(land.zone);
    }
  });

  test("tidsforskellen er præcis den, IANA siger, i både vinter og sommer", () => {
    for (const land of FORVENTET) {
      for (const [navn, tidspunkt] of [["januar", VINTER], ["juli", SOMMER]] as const) {
        const dansk = ianaOffsetMinutter("Europe/Copenhagen", tidspunkt);
        const haanden = tidsforskelMinutter(tidspunkt, land.zone);
        const spring = ianaOffsetMinutter(land.zone, tidspunkt);
        // Marokko springer desuden et time under ramadan, så dets IANA-zone
        // er stadig mål — det er netop derfor vi ikke skriver et fast tal.
        expect(haanden, `${land.slugDa} i ${navn}`).toBe(spring - dansk);
      }
    }
  });

  test("Spanien har Barcelona med, så «klokken i barcelona» ikke rammer Madrid-siden", () => {
    const spanien = findKlokkenLand("spanien", "da");
    expect(spanien!.byer.map((b) => b.da)).toEqual(["Madrid", "Barcelona"]);
    expect(spanien!.byer[1].zone).toBe("Europe/Madrid");
  });

  test("sprognavnene er oversat, så beraknare.se ikke skriver dansk", () => {
    for (const land of FORVENTET) {
      const fundet = findKlokkenLand(land.slugSe, "se");
      expect(fundet, `se/${land.slugSe}`).not.toBeNull();
      expect(landetsNavn(fundet!, "se"), land.slugSe).toBe(fundet!.navnSe);
    }
    // Grækenland og Schweiz hedder det samme på begge sprog, så de skal ikke
    // tvinges ind i en kunstig oversættelse.
    expect(landetsNavn(findKlokkenLand("schweiz", "se")!, "se")).toBe("Schweiz");
    expect(landetsNavn(findKlokkenLand("graekenland", "da")!, "se")).toBe("Grekland");
  });
});
