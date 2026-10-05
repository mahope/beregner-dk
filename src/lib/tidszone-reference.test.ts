import { describe, expect, test } from "vitest";
import { getPageData } from "./page-data";
import {
  brugerSommertid,
  DANSK_UTC_SOMMER,
  DANSK_UTC_VINTER,
  TIDSZONER,
  tidsforskelsRækker,
  tidsforskelBy,
  tidsforskelTekst,
  tidszoneRækker,
  vinterTidIBy,
} from "./tidszone-reference";

/**
 * Samme to dage, som `tidszoneRækker` regner kolonnerne på, men gjort til
 * UTC-øjeblikke, så `Intl` kan læse dem i byens egen zone. 15. januar kl. 12
 * i Danmark er 11:00 UTC, og 15. juli kl. 12 er 10:00 UTC (CET → CEST).
 */
const VINTERDATO_UTC = new Date("2026-01-15T11:00:00Z");
const SOMMERDATO_UTC = new Date("2026-07-15T10:00:00Z");

const MINUTTER = (vaerdi: string) =>
  Number(vaerdi.slice(0, 2)) * 60 + Number(vaerdi.slice(3));

/**
 * Forskellen mellem to klokkeslæt **på døgnet**, ikke på papiret. Auckland
 * står på 00:00 i vinterkolonnen og 22:00 i sommerkolonnen, altså to timer
 * tidligere — men 1320 - 0 er 1320, fordi klokkeslættene ikke er hinandens
 * summering. Uden denne wrapping ville porten forbyde netop det spring, den
 * skal fange.
 */
const MINUTTER_DIFF = (senere: string, tidligere: string) => {
  const forskel = MINUTTER(senere) - MINUTTER(tidligere);
  return ((forskel % 1440) + 1440) % 1440;
};

describe("tidszone-reference", () => {
  test("dansk reference er CET/CEST", () => {
    expect(DANSK_UTC_VINTER).toBe(1);
    expect(DANSK_UTC_SOMMER).toBe(2);
  });

  test("klokkeslaet ved 12 i Danmark i vinter- og somertid", () => {
    const raekker = tidszoneRækker();
    const find = (by: string) => raekker.find((r) => r.by === by);

    expect(find("London")?.vinter).toBe("11:00");
    expect(find("New York")?.vinter).toBe("06:00");
    expect(find("Chicago")?.vinter).toBe("05:00");
    expect(find("Los Angeles")?.vinter).toBe("03:00");
    expect(find("São Paulo")?.vinter).toBe("08:00");
    expect(find("Dubai")?.vinter).toBe("15:00");
    expect(find("Mumbai")?.vinter).toBe("16:30");
    expect(find("Shanghai")?.vinter).toBe("19:00");
    expect(find("Tokyo")?.vinter).toBe("20:00");
    expect(find("Sydney")?.vinter).toBe("22:00");
    expect(find("Auckland")?.vinter).toBe("00:00");
  });

  /**
   * Porten mod den eneste autoritet: IANA-tidszonebasen, som Node læser
   * gennem `Intl`. Den er ikke en forventning, der er skrevet ud fra hukommelsen
   * — den er kalenderen. Før rettelsen af `tidszoneRækker` gav den 3 røde:
   * Nuuk 08:00 (09:00), Sydney 21:00 (22:00) og Auckland 23:00 (00:00).
   *
   * Kun byer med **forskellige** vinter- og sommeroffset testes, fordi en by med
   * fast offset ellers er trivielt korrekt uanset hvilken sæson man vælger.
   * Byerne er skrevet ud med deres IANA-zone, så porten fejler, hvis nogen
   * bytterZone, og ikke kun hvis et tal glider.
   */
  test("vinterkolonnen er IANA's egen time paa 15. januar", () => {
    const AFPROEVET: Record<string, string> = {
      Nuuk: "America/Nuuk",
      Sydney: "Australia/Sydney",
      Auckland: "Pacific/Auckland",
      Athen: "Europe/Athens",
      Shanghai: "Asia/Shanghai",
      Tokyo: "Asia/Tokyo",
    };

    for (const [by, zone] of Object.entries(AFPROEVET)) {
      const forventet = new Intl.DateTimeFormat("en-GB", {
        timeZone: zone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(VINTERDATO_UTC);
      expect(vinterTidIBy(by)).toBe(forventet);
    }
  });

  test("sommerkolonnen er IANA's egen time paa 15. juli", () => {
    const AFPROEVET: Record<string, string> = {
      Nuuk: "America/Nuuk",
      Sydney: "Australia/Sydney",
      Auckland: "Pacific/Auckland",
      "New York": "America/New_York",
      London: "Europe/London",
      Tokyo: "Asia/Tokyo",
    };
    const raekker = tidszoneRækker();
    const find = (by: string) => raekker.find((r) => r.by === by);

    for (const [by, zone] of Object.entries(AFPROEVET)) {
      const forventet = new Intl.DateTimeFormat("en-GB", {
        timeZone: zone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(SOMMERDATO_UTC);
      expect(find(by)?.sommer).toBe(forventet);
    }
  });

  test("byer paa sydhalvkloden bytter modsat Danmark, saa de to kolonner ikke er ens", () => {
    const raekker = tidszoneRækker();
    const find = (by: string) => raekker.find((r) => r.by === by);

    // Sydney og Auckland har somertid naar Danmark har vintertid, saa deres
    // tal FALLER fra vinter- til sommerkolonnen. Foer rettelsen stod begge
    // med samme tal i begge kolonner, fordi koden valgte byens egen
    // sommerkonstant i sommerkolonnen uden at laese datoen.
    expect(find("Sydney")?.sommer).toBe("20:00");
    expect(find("Auckland")?.sommer).toBe("22:00");
    for (const by of ["Sydney", "Auckland"]) {
      const r = find(by);
      expect(MINUTTER_DIFF(r!.sommer, r!.vinter)).toBe(1440 - 120);
    }
  });

  test("alle viste klokkeslaet er gyldige dognstider", () => {
    for (const raekke of tidszoneRækker()) {
      for (const vaerdi of [raekke.vinter, raekke.sommer]) {
        expect(vaerdi).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
      }
    }
  });

  test("byer der skifter med Danmark staar ens, byer der skifter modsat bytter to timer", () => {
    for (const zone of TIDSZONER) {
      const [raekke] = tidszoneRækker([zone]);
      const forskel = MINUTTER_DIFF(raekke.sommer, raekke.vinter);
      if (zone.dst === "au") {
        // Australien og New Zealand har somertid naar Danmark har vintertid,
        // saa de ligger to tidligere i sommerkolonnen. Rettelsen af
        // `tidszoneRækker` gjorde denne forskel aflæselig i stedet for at
        // antage, at alle byer skifter sammen med Danmark.
        expect(forskel).toBe(1440 - 120);
      } else if (brugerSommertid(zone)) {
        // Byer med egen sommertid, der skifter paa Danmarks datoer, flytter
        // sig sammen med Danmark og viser derfor samme klokkeslaet.
        expect(forskel).toBe(0);
      } else {
        // Byer uden sommertid (Tokyo, Dubai, São Paulo, ...) ligger fast, saa
        // Danmarks eget skift flytter dem en time.
        expect(forskel).toBe(1440 - 60);
      }
    }

    const [saoPaulo] = tidszoneRækker([{ by: "São Paulo", utcVinter: -3 }]);
    expect(saoPaulo).toEqual({ by: "São Paulo", vinter: "08:00", sommer: "07:00" });

    const [sydney] = tidszoneRækker([
      { by: "Sydney", utcVinter: 10, utcSommer: 11, dst: "au" },
    ]);
    expect(sydney).toEqual({ by: "Sydney", vinter: "22:00", sommer: "20:00" });
  });

  test("dognskifte bryder ikke tabellen", () => {
    const [raekke] = tidszoneRækker([{ by: "Kiribati", utcVinter: 14, utcSommer: 14 }]);
    expect(raekke).toEqual({ by: "Kiribati", vinter: "01:00", sommer: "00:00" });
  });

  test("de lande, folk autocomplete-praeger, staar i tabellen", () => {
    const raekker = tidszoneRækker();
    const find = (by: string) => raekker.find((r) => r.by === by);

// Gronland: fast UTC-2 (WGT og WGST er samme zone), jf. IANA America/Nuuk.
// Rækken la paa UTC-3/-2, hvilket gav "08 i Nuuk" i brodteksten naar
// kalenderen siger 09.
expect(find("Nuuk")).toEqual({ by: "Nuuk", vinter: "09:00", sommer: "09:00" });
    // Lissabon: WET = UTC+0, WEST = UTC+1. Island: UTC+0 hele aaret.
    expect(find("Lissabon")).toEqual({ by: "Lissabon", vinter: "11:00", sommer: "11:00" });
    expect(find("Reykjavik")).toEqual({ by: "Reykjavik", vinter: "11:00", sommer: "10:00" });
    // Graekenland og Kreta: EET = UTC+2, EEST = UTC+3.
    expect(find("Athen")).toEqual({ by: "Athen", vinter: "13:00", sommer: "13:00" });
    expect(find("Heraklion (Kreta)")?.vinter).toBe("13:00");
  });

  test("svensk viser Aten, og ingen by har samme navn to gange", () => {
    const raekker = tidszoneRækker(TIDSZONER, "se");
    const navne = raekker.map((r) => r.by);

    expect(navne).toContain("Aten");
    expect(navne).not.toContain("Athen");
    expect(navne).toContain("Nuuk");
    expect(new Set(navne).size).toBe(navne.length);
  });

  test("de naeste destinationer fra autocomplete staar i tabellen", () => {
    const raekker = tidszoneRækker();
    const find = (by: string) => raekker.find((r) => r.by === by);

    // "tidsforskel thailand" og "hvad er klokken i thailand": Bangkok er fast UTC+7.
    expect(find("Bangkok")).toEqual({ by: "Bangkok", vinter: "18:00", sommer: "17:00" });
    // "tidsforskel bali danmark": Bali er fast UTC+8, samme som Shanghai.
    expect(find("Denpasar (Bali)")).toEqual({ by: "Denpasar (Bali)", vinter: "19:00", sommer: "18:00" });
    // "tidsforskel tyrkiet": Istanbul er fast UTC+3, Tyrkiet har ingen sommertid.
    expect(find("Istanbul")).toEqual({ by: "Istanbul", vinter: "14:00", sommer: "13:00" });
    // "hvad er klokken i spanien": Madrid følger Danmarks sommertid.
    expect(find("Madrid")).toEqual({ by: "Madrid", vinter: "12:00", sommer: "12:00" });
    // "hvad er klokken i canada": Toronto ligger som New York.
    expect(find("Toronto")).toEqual({ by: "Toronto", vinter: "06:00", sommer: "06:00" });
  });

  test("antallet af byer i metaDescription følger tabellen", () => {
    // C46 lagde fire byer i tabellen uden at rette "12 byer" i metaDescription,
    // altsaa lovede den indekserede tekst et tal, der ikke passede længere.
    for (const locale of ["da", "se"] as const) {
      const { metaDescription } = getPageData("tidszone", locale)!;
      const loevet = Number(metaDescription.match(/till? (\d+) (?:byer|städer)/)?.[1]);
      expect(loevet).toBe(TIDSZONER.length);
    }
  });
});

/**
 * Tidsforskellene i "Populære tidsforskelle fra Danmark". Før dette var de
 * håndskrevet i `src/app/tidszone/page.tsx`, og Sydney stod som "9-10 timer
 * foran" — de to midterste kombinationer frem for det interval, kalenderen
 * faktisk har. `sommertid.test.ts` regnede allerede 8 og 10, så brødteksten
 * modsatte repoets egen test.
 */
describe("tidsforskelsRækker", () => {
  const BYER = ["London", "New York", "Los Angeles", "Tokyo", "Sydney"];
  const raekker = tidsforskelsRækker(BYER);
  const find = (by: string) => raekker.find((r) => r.by === by)!;

  test("Sydney ligger 8-10 timer foran, ikke 9-10", () => {
    // Sydney er AEST (UTC+10) og AEDT (UTC+11), og dens somertid loeber modsat
    // Danmarks, saa forskellen svinger mellem 8 og 10 timer. Det laveste tal
    // er 8, fordi Danmark staar paa CEST mens Sydney staar paa AEST.
    expect(find("Sydney")).toMatchObject({ mindst: 8, mest: 10, fast: false });
    expect(tidsforskelTekst(find("Sydney"), "da")).toBe("8-10 timer foran");
    expect(tidsforskelTekst(find("Sydney"), "se")).toBe("8-10 timmar före");
  });

  test("byer der skifter paa Danmarks datoer har én fast forskel", () => {
    // London (GMT/BST) skifter sidste soendag i marts og sidste soendag i
    // oktober, ligesom Danmark, saa forskellen er 1 time bagud hele aaret.
    expect(find("London")).toMatchObject({ mindst: -1, mest: -1, fast: true });
    expect(tidsforskelTekst(find("London"), "da")).toBe("1 time bagud");
  });

  test("New York er 5-6 timer bagud, fordi USA skifter en soendag foer Danmark", () => {
    // USA gaar paa EDT 2. soendag i marts, Danmark paa CEST sidste soendag i
    // marts. I de dage imellem er forskellen 5 og ikke 6 timer.
    expect(find("New York")).toMatchObject({ mindst: -6, mest: -5, fast: false });
    expect(tidsforskelTekst(find("New York"), "da")).toBe("5-6 timer bagud");
    expect(tidsforskelTekst(find("New York"), "se")).toBe("5-6 timmar efter");
  });

  test("Tokyo ligger 7-8 timer foran, fordi Japan ikke har sommertid", () => {
    // Tokyo er fast UTC+9, saa det er Danmark der flytter sig: 8 timer foran
    // om vinteren, 7 mens Danmark har CEST.
    expect(find("Tokyo")).toMatchObject({ mindst: 7, mest: 8, fast: false });
    expect(tidsforskelTekst(find("Tokyo"), "da")).toBe("7-8 timer foran");
  });

  test("hver by i TIDSZONER har en brugbar forskel", () => {
    for (const by of TIDSZONER.map((z) => z.by)) {
      const [raekke] = tidsforskelsRækker([by]);
      expect(raekke.mest).toBeGreaterThanOrEqual(raekke.mindst);
      // Retningen skal følge byens egen forskel, ikke et fast valg. Madrid
      // deler CET/CEST med Danmark og har forskellen 0 hele året, så den
      // skrives som "samme tid" frem for "0 timer foran".
      const tekst = tidsforskelTekst(raekke, "da");
      if (raekke.fast && raekke.mindst === 0) {
        expect(tekst).toBe("samme tid som Danmark");
        expect(tidsforskelTekst(raekke, "se")).toBe("samma tid som Sverige");
        continue;
      }
      expect(tekst).toMatch(raekke.mest < 0 ? /bagud$/ : /foran$/);
      expect(tidsforskelTekst(raekke, "se")).toMatch(raekke.mest < 0 ? /efter$/ : /före$/);
    }
  });

  test("et interval skrives stigende og altid med to tal", () => {
    // `mindst` er -6 for New York, saa tallene skal sorteres, ellers stod der
    // "6-5 timer bagud" — et interval læst baglæns.
    const newYork = find("New York");
    const [lav, hoej] = [
      Math.abs(newYork.mindst),
      Math.abs(newYork.mest),
    ].sort((a, b) => a - b);
    expect(tidsforskelTekst(newYork, "da")).toBe(`${lav}-${hoej} timer bagud`);
    expect(hoej).toBeGreaterThan(lav);
  });

  test("en by der mangler i tabellen kaster, saa listen ikke kan miste en raekke", () => {
    // Tidsforskel-bylisten skal ikke kunne ramme en by, der ikke findes: den
    // ville givet en linje uden tal, fordi koden lop paa `undefined`.
    expect(() => tidsforskelsRækker(["Nuuk", "Kbh"])).toThrow(/Kbh/);
  });

  test("dansk og svensk raekke har samme rækkefølge og samme tal", () => {
    const da = tidsforskelsRækker(BYER, "da");
    const se = tidsforskelsRækker(BYER, "se");

    // `by` er dansk i begge, saa nøglerne kan sammenlignes direkte.
    expect(se.map((r) => r.by)).toEqual(da.map((r) => r.by));
    expect(se.map((r) => [r.mindst, r.mest])).toEqual(da.map((r) => [r.mindst, r.mest]));
    // Sproget maa kun boe i navnet og i retningen, ikke i tallene.
    expect(tidsforskelBy(find("Sydney"), "se")).toBe("Sydney");
  });

  test("brodteksten i begge sprog bruger de regnede tal", () => {
    // Laes fra den konstant, siden renderer, saa testen ikke kan holde sig
    // oprejst, hvis JSX gaar tilbage til haandskrevne tal.
    const mønster =
      /^\d+(?:[.,]\d+)?(?:-\d+(?:[.,]\d+)?)? (?:time|timer|timme|timmar) (?:bagud|foran|efter|före)$/;
    for (const spoergsprog of ["da", "se"] as const) {
      for (const raekke of tidsforskelsRækker(BYER, spoergsprog)) {
        expect(tidsforskelTekst(raekke, spoergsprog)).toMatch(mønster);
      }
    }
  });
});
