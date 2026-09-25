import { describe, expect, test } from "vitest";
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
    expect(find("Sao Paulo")?.vinter).toBe("08:00");
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

    const [saoPaulo] = tidszoneRækker([{ by: "Sao Paulo", utcVinter: -3 }]);
    expect(saoPaulo).toEqual({ by: "Sao Paulo", vinter: "08:00", sommer: "07:00" });

    const [sydney] = tidszoneRækker([{ by: "Sydney", utcVinter: 10, utcSommer: 11 }]);
    expect(sydney).toEqual({ by: "Sydney", vinter: "21:00", sommer: "21:00" });
  });

  test("dognskifte bryder ikke tabellen", () => {
    const [raekke] = tidszoneRækker([{ by: "Kiribati", utcVinter: 14, utcSommer: 14 }]);
    expect(raekke).toEqual({ by: "Kiribati", vinter: "01:00", sommer: "00:00" });
  });
});
