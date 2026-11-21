import { describe, expect, test } from "vitest";
import {
  excelEksempler,
  forskelSammePaaBeggeDatoer,
  TIDSSKILLNADS_LANDE,
  tidsskillnadRaekker,
} from "./tidszone-eksempler";
import { TIDSZONER, brugerSommertid, klokkeslaetVed } from "./tidszone-reference";

const MINUTTER = (vaerdi: string) =>
  Number(vaerdi.slice(0, 2)) * 60 + Number(vaerdi.slice(3));

/** 12:00 dansk vintertid / 12:00 dansk sommertid — de to øjeblikke, tabellen regnes på. */
const VINTER_OEGNBLIK = "2026-01-15T11:00:00Z";
const SOMMER_OEGNBLIK = "2026-07-15T10:00:00Z";

/**
 * Byens egen UTC-forskel i timer, målt gennem `Intl` — altså IANA-tidszonebasen,
 * ikke en forventning skrevet ud fra hukommelsen. `longOffset` giver "GMT+11",
 * "GMT-05:30" eller "GMT" afhængigt af zonen og datoen.
 */
function ianaOffsetTimer(zone: string, oegnblik: string): number {
  const del = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    timeZoneName: "longOffset",
  })
    .formatToParts(new Date(oegnblik))
    .find((part) => part.type === "timeZoneName")?.value;
  if (!del) throw new Error(`Intl gav ingen timeZoneName for ${zone}`);
  const [timegn, minutter = "0"] = del.replace("GMT", "").split(":");
  const tegn = timegn.startsWith("-") ? -1 : 1;
  const hele = Number(timegn.replace("+", "").replace("-", "")) || 0;
  return tegn * (hele + Number(minutter) / 60);
}

/** Byens forskel til Danmark i timer, målt gennem IANA. */
function ianaForskel(zone: string, oegnblik: string): number {
  return (
    ianaOffsetTimer(zone, oegnblik) -
    ianaOffsetTimer("Europe/Copenhagen", oegnblik)
  );
}

/** Byen i landetabellen, skrevet med sin IANA-zone, så porten fejler på bytteZone. */
const IANA_ZONER: Record<string, string> = {
  London: "Europe/London",
  "New York": "America/New_York",
  Nuuk: "America/Nuuk",
  Athen: "Europe/Athens",
  Istanbul: "Europe/Istanbul",
  Madrid: "Europe/Madrid",
  Bangkok: "Asia/Bangkok",
  Tokyo: "Asia/Tokyo",
  Shanghai: "Asia/Shanghai",
  Sydney: "Australia/Sydney",
  Auckland: "Pacific/Auckland",
};

function zoneFor(by: string) {
  const zone = TIDSZONER.find((z) => z.by === by);
  if (!zone) {
    throw new Error(`Mangler byen ${by} i TIDSZONER`);
  }
  return zone;
}

const landeOg = (liste: string[], land: string) => liste.includes(land);

const byForLand = (landDa: string) =>
  TIDSSKILLNADS_LANDE.find((l) => l.landDa === landDa)!.by;

describe("tidszone-eksempler", () => {
  test("alle lande i listen findes i TIDSZONER, så ingen forskel kan opfindes", () => {
    for (const land of TIDSSKILLNADS_LANDE) {
      expect(TIDSZONER.some((z) => z.by === land.by)).toBe(true);
    }
  });

  /**
   * Porten mod den eneste autoritet: IANA, som Node læser gennem `Intl`.
   *
   * Den erstatter to tests, der låste *fejlen* fast ved at genskrive koden i
   * testen: «vinterforskellen er zoneens egen offset minus Danmarks UTC+1»
   * og «sommerforskellen følger zoneens egen sommertid». Begge formler er
   * sande for de byer, der skifter på EU's datoer, og forkerte for
   * sydhalvkloden — de må altså ikke dømmes mod sig selv.
   *
   * Før rettelsen af `forskel` gav den 3 røde: Australien 9 (10), New Zealand
   * 11 (12) og Australiens sommerværdi manglede helt, fordi betingelsen var
   * `brugerSommertid` og den sagde «Samme som vintertid» for en by, der
   * flytter sig den anden vej.
   */
  test("alle rækker er målt mod IANA paa de to sæsondatoer", () => {
    for (const raekke of tidsskillnadRaekker("da")) {
      const zone = IANA_ZONER[raekke.by];
      expect(zone, `${raekke.land} mangler en IANA-zone i porten`).toBeDefined();

      const forventetVinter = ianaForskel(zone, VINTER_OEGNBLIK);
      const forventetSommer = ianaForskel(zone, SOMMER_OEGNBLIK);

      expect(raekke.vinter, `${raekke.land} om vinteren`).toBeCloseTo(
        forventetVinter,
        5
      );
      // Sommerspalten findes kun naar de to forskelle er forskellige — det er
      // ud fra tallene, ikke ud fra om byen har sommertid.
      if (forventetSommer === forventetVinter) {
        expect(raekke.sommer, `${raekke.land} skal ikke have en sommerværdi`).toBeUndefined();
        expect(raekke.tekstSommer, `${raekke.land} skal ikke have en sommertekst`).toBeUndefined();
      } else {
        expect(raekke.sommer, `${raekke.land} om sommeren`).toBeCloseTo(
          forventetSommer,
          5
        );
        expect(raekke.tekstSommer, `${raekke.land} skal have en sommertekst`).toBeDefined();
      }
    }
  });

  test("sydhalvkloden har omvendt fortegn, saa tabellen ikke kan sige 'fast hele aaret'", () => {
    const raekker = tidsskillnadRaekker("da");
    const australien = raekker.find((r) => r.land === "Australien");
    const newZealand = raekker.find((r) => r.land === "New Zealand");

    // Pacific/Auckland er UTC+13 den 15. januar (NZDT) og UTC+12 den 15. juli,
    // Australia/Sydney UTC+11 og UTC+10, mens Danmark er UTC+1 og UTC+2.
    expect(australien?.vinter).toBe(10);
    expect(australien?.tekstVinter).toBe("10 timer frem");
    expect(australien?.sommer).toBe(8);
    expect(australien?.tekstSommer).toBe("8 timer frem");

    expect(newZealand?.vinter).toBe(12);
    expect(newZealand?.tekstVinter).toBe("12 timer frem");
    expect(newZealand?.sommer).toBe(10);
    expect(newZealand?.tekstSommer).toBe("10 timer frem");

    // De to skal have forskellige summer, ellers er siden til at lyve igen.
    expect(forskelSammePaaBeggeDatoer("Sydney")).toBe(false);
    expect(forskelSammePaaBeggeDatoer("Auckland")).toBe(false);
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

  test("byer der flytter sig med Danmark har samme forskel i begge sæsoner", () => {
    // New York er med her fordi forskellen er 6 timer bagud på begge
    // sæsondatoer — ikke fordi den flytter sig på EU's datoer. Den gør ikke,
    // og forskellen svinger alligevel mellem 6 og 5 i de tre uger hvor kun USA
    // har skiftet. Derfor må `foelgerEu` og denne egenskab aldrig blandes.
    for (const land of ["Grækenland", "Spanien", "Storbritannien", "USA", "Grønland"]) {
      const raekke = tidsskillnadRaekker("da").find((r) => r.land === land);
      expect(raekke?.sommer).toBeUndefined();
      expect(raekke?.tekstSommer).toBeUndefined();
      expect(forskelSammePaaBeggeDatoer(raekke!.by)).toBe(true);
    }
  });

  test("Grønland er 3 timer bagud hele året, fordi Nuuk følger EU's skiftedatoer", () => {
    const groenland = tidsskillnadRaekker("da").find((r) => r.land === "Grønland");

    expect(groenland).toBeDefined();
    expect(groenland?.by).toBe("Nuuk");
    // Nuuk har fast UTC-2 (WGT) og UTC-1 (WGST) om sommeren, så den ligger
    // 3 timer bagud Danmarks UTC+1 både om vinteren og om sommeren. Rækken
    // lå på UTC-3/-2, hvilket gjorde siden sige "4 timer bagefter" og
    // "08 i Nuuk" — et timepavsagn i brødteksten, kalenderen ikke deler.
    expect(groenland?.vinter).toBe(-3);
    expect(groenland?.tekstVinter).toBe("3 timer bagefter");
    // America/Nuuk bruger WGT/WGST på EU's datoer, så zone og Danmark flytter
    // sig samtidig, og forskellen er den samme om sommeren.
    expect(groenland?.sommer).toBeUndefined();
    // Grønland står i tabellen, fordi dansk autocomplete har det som nr. 1
    // under "tidsforskel" og nr. 13 under "tidszoner".
    expect(zoneFor(groenland!.by).utcVinter).toBe(-2);
    expect(zoneFor(groenland!.by).utcSommer).toBe(-1);
  });

  test("Canada er bevidst ikke i landetabellen: Toronto skifter ikke på EU's datoer", () => {
    // En konstant værdi ville være forkert i de ca. tre uger omkring
    // forårs- og efterårsskiftet, hvor kun den ene side har sommartid.
    const lande = tidsskillnadRaekker("da").map((r) => r.land);
    expect(lande).not.toContain("Canada");
    // Og det må ikke snige sig ind som en by, der *ligner* Canada.
    expect(TIDSSKILLNADS_LANDE.some((l) => l.by === "Toronto")).toBe(false);
  });

  test("foelgerEu er kun de lande, der skifter på EU's datoer — ikke dem, der bare har sommertid", () => {
    const foelger = TIDSSKILLNADS_LANDE.filter((l) => l.foelgerEu).map((l) => l.landDa);

    // Disse skifter på sidste søndag i marts / oktober, sammen med Danmark.
    expect(landeOg(foelger, "Grønland")).toBe(true);
    expect(landeOg(foelger, "Grækenland")).toBe(true);
    expect(landeOg(foelger, "Spanien")).toBe(true);
    expect(landeOg(foelger, "Storbritannien")).toBe(true);

    // Disse HAR sommertid, men på andre datoer. De må ikke stå i
    // sætningen "… følger Danmark", fordi den er forkelt i de korte
    // overgangsperioder — og det er præcis den fejl, den første version af
    // denne ændring lavede ved at udlede sætningen fra `brugerSommertid`.
    for (const land of ["USA", "Australien", "New Zealand"]) {
      expect(landeOg(foelger, land)).toBe(false);
      // Og de har faktisk sommertid, så de to er ikke det samme spørgsmål.
      expect(brugerSommertid(zoneFor(byForLand(land)))).toBe(true);
    }
    // Tyrkiet, Japan, Kina og Thailand har ingen sommertid overhovedet.
    for (const land of ["Tyrkiet", "Japan", "Kina", "Thailand"]) {
      expect(landeOg(foelger, land)).toBe(false);
      expect(brugerSommertid(zoneFor(byForLand(land)))).toBe(false);
    }
  });

  test("forskelSammePaaBeggeDatoer er falsk for de byer, der ikke bruger sommertid", () => {
    expect(forskelSammePaaBeggeDatoer("Tokyo")).toBe(false);
    expect(forskelSammePaaBeggeDatoer("Bangkok")).toBe(false);
    expect(forskelSammePaaBeggeDatoer("Istanbul")).toBe(false);
  });

  test("Sverige får svenska landnavn, og enheden er enten time eller timer", () => {
    const raekker = tidsskillnadRaekker("se");
    const lande = raekker.map((r) => r.land);

    expect(lande).toContain("Grekland");
    expect(lande).toContain("Turkiet");
    expect(lande).not.toContain("Grækenland");
    expect(lande).not.toContain("Tyrkiet");
    // Grønland kom i tabellen med dansk autocomplete som datagrund (C155),
    // men fik ikke sit `landSe`, så beraknare.se skrev "Grønland" med dansk
    // ø. Fundet ved at kravle den *byggede* server (C168), ikke i kilden:
    // port-analysen dømmer `landDa`-strengen ude, fordi den læses gennem
    // `landSe ?? landDa` ved visningsstedet.
    expect(lande).toContain("Grönland");
    expect(lande).not.toContain("Grønland");
    // Storbritannien, Spanien, Japan, Thailand, Kina og Australien hedder
    // det samme på svenska. New Zealand gør **ikke** — den hedder
    // «Nya Zealand», og den skrev beraknare.se «New Zealand» i landetabellen,
    // fordi feltet var valgfrit og faldt tilbage på `landDa`. Testen her låste
    // netop fejlen fast med påstanden «New Zealand hedder det samme på
    // svenska»; den påstand er fjernet og erstattet af porten nedfor, der
    // gennemgår alle elleve rækker i begge sprog.
    expect(lande).toContain("Storbritannien");
    expect(lande).toContain("Spanien");
    expect(lande).not.toContain("New Zealand");
    expect(lande).toContain("Nya Zealand");
  });

  /**
   * Hver landerække skal have et svensk navn, fordi `landSe` er udbudt for
   * alle — så kan den ikke glemmes ved næste land. Porten dømmer begge sprog
   * hver for sig på de elleve rækker: et navn må ikke have æ/ø i den svenske
   * udgave, og den danske skal være uændret.
   */
  test("alle elleve lande har et svensk navn, og ingen række lækker dansk", () => {
    const se = tidsskillnadRaekker("se");
    const da = tidsskillnadRaekker("da");

    expect(se).toHaveLength(TIDSSKILLNADS_LANDE.length);
    expect(da).toHaveLength(TIDSSKILLNADS_LANDE.length);
    expect(se.map((r) => r.land)).toEqual(TIDSSKILLNADS_LANDE.map((l) => l.landSe));
    expect(da.map((r) => r.land)).toEqual(TIDSSKILLNADS_LANDE.map((l) => l.landDa));

    for (const raekke of se) {
      // «Grønland» med dansk ø og «New Zealand» med dansk navn var de to
      // lækager, feltet lod igennom.
      expect(raekke.land).not.toMatch(/[æøåÆØÅ]/);
    }
    // De svenske navne, der faktisk afviger fra de danske.
    expect(se.map((r) => r.land)).toEqual(
      expect.arrayContaining(["Grönland", "Grekland", "Turkiet", "Nya Zealand"])
    );
    expect(da.map((r) => r.land)).toEqual(
      expect.arrayContaining(["Grønland", "Grækenland", "Tyrkiet", "New Zealand"])
    );
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

  test("timeforskellen er 12 mod byens egen klokkeslaet i samme time", () => {
    // Når det er 12 i Danmark, er klokkeslættet i byen 12 + forskellen. Så
    // tabellen og bytabellen i TidszoneBeregneren ikke kan glide fra hinanden.
    //
    // Forventningen læses fra `klokkeslaetVed`, altså fra den funktion
    // `/tidszone`'s bytabel renderer. Den tidligere udgave af denne test
    // genskrev `forskel`s formel i testen — og dens første `expect` havde begge
    // grene i ternaren lig med hinanden (`? raekke.vinter : raekke.vinter`), så
    // den kunne ikke fejle uanset hvad koden gjorde.
    for (const raekke of tidsskillnadRaekker("da")) {
      const zone = zoneFor(raekke.by);
      // `klokkeslaetVed` giver "HH:MM" i byen, så 12 + forskellen mod Danmark
      // er time-delen, og "00:00" tælles som 24 (Auckland står på 00:00 om
      // vinteren, fordi den ligger 12 timer frem).
      const somUger = (klokkeslaet: string) => {
        const time = Number(klokkeslaet.slice(0, 2));
        return (time === 0 ? 24 : time) - 12;
      };

      expect(raekke.vinter, `${raekke.land} om vinteren`).toBe(
        somUger(klokkeslaetVed(12, zone, false))
      );
      expect(
        raekke.sommer === undefined ? raekke.vinter : raekke.sommer,
        `${raekke.land} om sommeren`
      ).toBe(somUger(klokkeslaetVed(12, zone, true)));
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
