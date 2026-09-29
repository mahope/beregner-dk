import { describe, expect, test } from "vitest";
import { getPageData } from "./page-data";
import {
  brugerSommertid,
  DANSK_UTC_SOMMER,
  DANSK_UTC_VINTER,
  TIDSZONER,
  tidszoneRækker,
} from "./tidszone-reference";

const MINUTTER = (vaerdi: string) =>
  Number(vaerdi.slice(0, 2)) * 60 + Number(vaerdi.slice(3));

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
    expect(find("Sydney")?.vinter).toBe("21:00");
    expect(find("Auckland")?.vinter).toBe("23:00");
  });

  test("alle viste klokkeslaet er gyldige dognstider", () => {
    for (const raekke of tidszoneRækker()) {
      for (const vaerdi of [raekke.vinter, raekke.sommer]) {
        expect(vaerdi).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
      }
    }
  });

  test("byer med sommertid foelger Danmark, byer uden ligger en time tidligere om sommeren", () => {
    for (const zone of TIDSZONER) {
      const [raekke] = tidszoneRækker([zone]);
      const forskel = MINUTTER(raekke.sommer) - MINUTTER(raekke.vinter);
      expect(forskel).toBe(brugerSommertid(zone) ? 0 : -60);
    }

    const [saoPaulo] = tidszoneRækker([{ by: "São Paulo", utcVinter: -3 }]);
    expect(saoPaulo).toEqual({ by: "São Paulo", vinter: "08:00", sommer: "07:00" });

    const [sydney] = tidszoneRækker([{ by: "Sydney", utcVinter: 10, utcSommer: 11 }]);
    expect(sydney).toEqual({ by: "Sydney", vinter: "21:00", sommer: "21:00" });
  });

  test("dognskifte bryder ikke tabellen", () => {
    const [raekke] = tidszoneRækker([{ by: "Kiribati", utcVinter: 14, utcSommer: 14 }]);
    expect(raekke).toEqual({ by: "Kiribati", vinter: "01:00", sommer: "00:00" });
  });

  test("de lande, folk autocomplete-praeger, staar i tabellen", () => {
    const raekker = tidszoneRækker();
    const find = (by: string) => raekker.find((r) => r.by === by);

    // Gronland: WGT = UTC-3 siden marts 2023, WGST = UTC-2 om sommeren.
    expect(find("Nuuk")).toEqual({ by: "Nuuk", vinter: "08:00", sommer: "08:00" });
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
