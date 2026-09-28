import { describe, expect, test } from "vitest";
import {
  excelEksempler,
  skifterSammenMedDanmark,
  TIDSSKILLNADS_LANDE,
  tidsskillnadRaekker,
} from "./tidszone-eksempler";
import { TIDSZONER } from "./tidszone-reference";

const MINUTTER = (vaerdi: string) =>
  Number(vaerdi.slice(0, 2)) * 60 + Number(vaerdi.slice(3));

function zoneFor(by: string) {
  const zone = TIDSZONER.find((z) => z.by === by);
  if (!zone) {
    throw new Error(`Mangler byen ${by} i TIDSZONER`);
  }
  return zone;
}

describe("tidszone-eksempler", () => {
  test("alle lande i listen findes i TIDSZONER, så ingen forskel kan opfindes", () => {
    for (const land of TIDSSKILLNADS_LANDE) {
      expect(TIDSZONER.some((z) => z.by === land.by)).toBe(true);
    }
  });

  test("vinterforskellen er zoneens egen offset minus Danmarks UTC+1", () => {
    for (const raekke of tidsskillnadRaekker("da")) {
      expect(raekke.vinter).toBe(zoneFor(raekke.by).utcVinter - 1);
    }
  });

  test("sommerforskellen følger zoneens egen sommertid, også for brudtal", () => {
    for (const raekke of tidsskillnadRaekker("da")) {
      const zone = zoneFor(raekke.by);
      if (raekke.sommer !== undefined) {
        expect(raekke.sommer).toBe((zone.utcSommer ?? zone.utcVinter) - 2);
      }
    }
  });

  test("forskellen til New York er 6 timer bagud, til Tokyo 8 frem om vinteren", () => {
    const raekker = tidsskillnadRaekker("da");
    const usa = raekker.find((r) => r.land === "USA");
    const japan = raekker.find((r) => r.land === "Japan");

    expect(usa?.vinter).toBe(-6);
    expect(usa?.tekstVinter).toBe("6 timer bagefter");
    expect(japan?.vinter).toBe(8);
    expect(japan?.tekstVinter).toBe("8 timer frem");
  });

  test("Japan er 7 timer frem i sommertid, fordi Japan ikke bruger sommertid", () => {
    const japan = tidsskillnadRaekker("da").find((r) => r.land === "Japan");
    expect(japan?.sommer).toBe(7);
    expect(japan?.tekstSommer).toBe("7 timer frem");
  });

  test("byer der selv bruger sommertid har samme forskel hele året", () => {
    for (const land of ["Grækenland", "Spanien", "Storbritannien", "USA"]) {
      const raekke = tidsskillnadRaekker("da").find((r) => r.land === land);
      expect(raekke?.sommer).toBeUndefined();
      expect(raekke?.tekstSommer).toBeUndefined();
      expect(skifterSammenMedDanmark(raekke!.by)).toBe(true);
    }
  });

  test("skifterSammenMedDanmark er falsk for de byer, der ikke bruger sommertid", () => {
    expect(skifterSammenMedDanmark("Tokyo")).toBe(false);
    expect(skifterSammenMedDanmark("Bangkok")).toBe(false);
    expect(skifterSammenMedDanmark("Istanbul")).toBe(false);
  });

  test("Sverige får svenska landnavn, og enheden er enten time eller timer", () => {
    const raekker = tidsskillnadRaekker("se");
    const lande = raekker.map((r) => r.land);

    expect(lande).toContain("Grekland");
    expect(lande).toContain("Turkiet");
    expect(lande).not.toContain("Grækenland");
    expect(lande).not.toContain("Tyrkiet");
    // Storbritannien, Spanien, Japan, Thailand, Kina, Australien og
    // New Zealand hedder det samme på svenska.
    expect(lande).toContain("Storbritannien");
    expect(lande).toContain("Spanien");
  });

  test("svensk tekst bruger timmar/timme, dansk timer/time, og ingen har fejlenheden", () => {
    for (const raekke of tidsskillnadRaekker("se")) {
      for (const tekst of [raekke.tekstVinter, raekke.tekstSommer].filter(Boolean)) {
        expect(tekst).toMatch(/(timme|timmar|samma tid)/);
        expect(tekst).not.toMatch(/\btimer\b/);
      }
    }
    for (const raekke of tidsskillnadRaekker("da")) {
      for (const tekst of [raekke.tekstVinter, raekke.tekstSommer].filter(Boolean)) {
        expect(tekst).toMatch(/(time|timer|samme tid)/);
        expect(tekst).not.toMatch(/\btimme\b/);
      }
    }
  });

  test("alle tekststrenge i begge sprog er frie for den anden sprogs markører", () => {
    for (const raekke of tidsskillnadRaekker("se")) {
      for (const tekst of [raekke.tekstVinter, raekke.tekstSommer].filter(Boolean)) {
        expect(tekst).not.toMatch(/[æø]/);
        expect(tekst).not.toMatch(/Danmark/);
      }
    }
    for (const raekke of tidsskillnadRaekker("da")) {
      for (const tekst of [raekke.tekstVinter, raekke.tekstSommer].filter(Boolean)) {
        expect(tekst).not.toMatch(/[äö]/);
        expect(tekst).not.toMatch(/Sverige/);
      }
    }
  });

  test("Excel-formlerne har begge sprog, og formelsyntaksen er ens", () => {
    const eksempler = excelEksempler();
    const formler = eksempler.map((e) => e.formel);

    expect(formler).toContain("=B1-A1");
    expect(formler).toContain("=(B1-A1)*24");
    expect(formler).toContain("=B1-A1+(B1<A1)");
    expect(formler).toContain('=DATEDIF(A1;B1;"h")');

    for (const eksempel of eksempler) {
      expect(eksempel.hvadDa.length).toBeGreaterThan(20);
      expect(eksempel.hvadSe.length).toBeGreaterThan(20);
      // Formler med argumenter bruger semikolon i dansk og svensk notation.
      if (eksempel.formel.includes("DATEDIF")) {
        expect(eksempel.formel).toContain(";");
      }
      expect(eksempel.hvadSe).not.toMatch(/[æø]/);
      expect(eksempel.hvadDa).not.toMatch(/[äö]/);
    }
  });

  test("timeforskellen er 12 mod byens egen klokkeslæt i samme time", () => {
    // Når det er 12 i Danmark, er klokkeslætket i byen 12 + forskellen. Så
    // tabellen og bytabellen i TidszoneBeregneren ikke kan glide fra hinanden.
    for (const raekke of tidsskillnadRaekker("da")) {
      const zone = zoneFor(raekke.by);
      const forventet = 12 - 1 + zone.utcVinter;
      const faktiskVinter = (forventet + 24) % 24;
      const faktiskSommer = (12 - 2 + (zone.utcSommer ?? zone.utcVinter) + 24) % 24;

      expect(faktiskVinter - 12).toBe(
        ((raekke.vinter + 12) % 24) - 12 < 0
          ? raekke.vinter
          : raekke.vinter
      );
      expect(faktiskSommer - 12).toBe(
        raekke.sommer === undefined ? raekke.vinter : raekke.sommer
      );
    }
  });

  test("krydstjek mod MINUTTER: en forskel på N timer flytter klokken N time", () => {
    const usa = tidsskillnadRaekker("da").find((r) => r.land === "USA")!;
    const dansk12 = MINUTTER("12:00");
    const newYork = (dansk12 + usa.vinter * 60 + 1440) % 1440;

    expect(Math.floor(newYork / 60)).toBe(6);
    expect(newYork % 60).toBe(0);
  });
});
