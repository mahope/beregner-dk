import { describe, it, expect } from "vitest";
import {
  BOERNE_SATSER_2026,
  BOERNEUNGEYDELSE_2026,
  aarligBelob,
  beregnAftrapning,
  maanedligOmregnet,
  naesteUdbetalingsdato,
  satsForAlder,
  udbetalingerPrAar,
  udbetalingsdatoerAar,
} from "./borneungeydelse";

describe("BOERNE_SATSER_2026", () => {
  it("har de officielle intervalbeløb fra borger.dk", () => {
    expect(BOERNE_SATSER_2026.map((s) => [s.alder, s.hel])).toEqual([
      ["0-2 år", 5370],
      ["3-6 år", 4248],
      ["7-14 år", 3342],
      ["15-17 år", 1114],
    ]);
  });

  it("har halvdelen som præcis halvdelen af hele beløbet", () => {
    for (const sats of BOERNE_SATSER_2026) {
      expect(sats.halv).toBe(sats.hel / 2);
    }
  });

  it("har aldersgrupper i stigende rækkefølge uden overlap", () => {
    for (let i = 1; i < BOERNE_SATSER_2026.length; i++) {
      expect(BOERNE_SATSER_2026[i].fraAar).toBeGreaterThan(
        BOERNE_SATSER_2026[i - 1].fraAar,
      );
    }
  });

  it("har en kilde og en verificeringsdato", () => {
    expect(BOERNEUNGEYDELSE_2026.source).toMatch(/^https:\/\/www\.borger\.dk\//);
    expect(BOERNEUNGEYDELSE_2026.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("udbetalingerPrAar", () => {
  it("regner kvartalsvis og månedligt", () => {
    expect(udbetalingerPrAar("kvartal")).toBe(4);
    expect(udbetalingerPrAar("maaned")).toBe(12);
  });
});

describe("satsForAlder", () => {
  it("finder den rigtige sats i hvert aldersinterval", () => {
    expect(satsForAlder(0)?.hel).toBe(5370);
    expect(satsForAlder(2)?.hel).toBe(5370);
    expect(satsForAlder(3)?.hel).toBe(4248);
    expect(satsForAlder(6)?.hel).toBe(4248);
    expect(satsForAlder(7)?.hel).toBe(3342);
    expect(satsForAlder(14)?.hel).toBe(3342);
    expect(satsForAlder(15)?.hel).toBe(1114);
    expect(satsForAlder(17)?.hel).toBe(1114);
  });

  it("skifter interval ved 15 år", () => {
    expect(satsForAlder(14)?.interval).toBe("kvartal");
    expect(satsForAlder(15)?.interval).toBe("maaned");
  });

  it("returnerer den højeste sats for børn over 18 år", () => {
    expect(satsForAlder(18)?.alder).toBe("15-17 år");
  });

  it("returnerer undefined for ugyldig alder", () => {
    expect(satsForAlder(-1)).toBeUndefined();
    expect(satsForAlder(Number.NaN)).toBeUndefined();
  });
});

describe("aarligBelob", () => {
  it("ganger kvartalsbeløb med 4 og månedlige med 12", () => {
    expect(aarligBelob(BOERNE_SATSER_2026[0])).toBe(21480);
    expect(aarligBelob(BOERNE_SATSER_2026[1])).toBe(16992);
    expect(aarligBelob(BOERNE_SATSER_2026[2])).toBe(13368);
    expect(aarligBelob(BOERNE_SATSER_2026[3])).toBe(13368);
  });
});

describe("beregnAftrapning", () => {
  const graense = BOERNEUNGEYDELSE_2026.aftrapning.graense;

  it("er 0 ved og under grænsen", () => {
    expect(beregnAftrapning(graense)).toBe(0);
    expect(beregnAftrapning(graense - 100000)).toBe(0);
    expect(beregnAftrapning(0)).toBe(0);
  });

  it("er 2 % af beløbet over grænsen", () => {
    expect(beregnAftrapning(graense + 138900)).toBeCloseTo(2778, 6);
    expect(beregnAftrapning(1100000)).toBeCloseTo(2778, 6);
  });

  it("er 0 for negative og ugyldige indkomster", () => {
    expect(beregnAftrapning(-1)).toBe(0);
    expect(beregnAftrapning(Number.NaN)).toBe(0);
  });
});

describe("maanedligOmregnet", () => {
  it("deler årsbeløbet med 12, så en kvartalssats ikke forveksles med en månedssats", () => {
    expect(maanedligOmregnet(BOERNE_SATSER_2026[0])).toBe(1790);
    expect(maanedligOmregnet(BOERNE_SATSER_2026[1])).toBe(1416);
    expect(maanedligOmregnet(BOERNE_SATSER_2026[2])).toBe(1114);
  });

  it("er præcis det officielle månedsbeløb for den månedsudbetalte sats", () => {
    expect(maanedligOmregnet(BOERNE_SATSER_2026[3])).toBe(1114);
  });

  it("følger årsbeløbet, så en satsændring ikke kan glemme at gange med 4", () => {
    // 5.370 / 3 er også 1.790, så en test på "delt med 3 mod 12" kan ikke
    // skelne. Låsen er derfor, at tallet *defineres* som årsbeløbet delt med
    // 12: ændres satsen, kan tallet ikke blive stående på det gamle.
    for (const sats of BOERNE_SATSER_2026) {
      expect(maanedligOmregnet(sats)).toBe(aarligBelob(sats) / 12);
    }
  });
});

describe("udbetalingsdatoerAar", () => {
  // Lokal kalenderdato, ikke toISOString: `new Date(2026, 0, 20)` er 20. jan
  // kl. 00.00 dansk tid, hvilket er 19. jan 23.00 UTC, så toISOString ville
  // give dagen i minus én. Første forsøg på denne test fejlede af den grund.
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  it("giver de fire kvartalsdatoer i de måneder borger.dk angiver", () => {
    const datoer = udbetalingsdatoerAar(2026, "kvartal");
    expect(datoer.map((u) => iso(u.dato))).toEqual([
      "2026-01-20",
      "2026-04-20",
      "2026-07-20",
      "2026-10-20",
    ]);
  });

  it("har alle fire kvartalsmåneder med, også januar", () => {
    // `boerneydelse` stod som [20, 4, 7, 10], altså dagen og kun tre
    // måneder. Strukturen er nu { dag, maaneder }, så en måned ikke kan
    // forsvinde i dag-tallet igen.
    expect(BOERNEUNGEYDELSE_2026.udbetaling.boerneydelse.dag).toBe(20);
    expect(BOERNEUNGEYDELSE_2026.udbetaling.boerneydelse.maaneder).toEqual([
      1, 4, 7, 10,
    ]);
  });

  it("giver alle tolv månedsdatoer for ungeydelsen", () => {
    const datoer = udbetalingsdatoerAar(2026, "maaned");
    expect(datoer).toHaveLength(12);
    expect(datoer.map((u) => u.maaned)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
    for (const u of datoer) {
      expect(u.dato.getDate()).toBe(20);
    }
  });

  it("flytter de tre ungeudbetalinger der falder på en weekend i 2026", () => {
    const forskudte = udbetalingsdatoerAar(2026, "maaned").filter((u) => u.forskudt);
    expect(forskudte.map((u) => iso(u.dato))).toEqual([
      "2026-06-20",
      "2026-09-20",
      "2026-12-20",
    ]);
    // 20. juni er en lørdag, de to andre søndage; pengene kommer hverdagen
    // inden, altså om fredagen.
    expect(forskudte.map((u) => iso(u.betalingsdato))).toEqual([
      "2026-06-19",
      "2026-09-18",
      "2026-12-18",
    ]);
    expect(forskudte.map((u) => u.ugedag)).toEqual(["lørdag", "søndag", "søndag"]);
  });

  it("lader alle fire børneudbetalinger i 2026 stå", () => {
    expect(udbetalingsdatoerAar(2026, "kvartal").filter((u) => u.forskudt)).toEqual([]);
  });

  it("flytter aldrig en betaling *frem* — den skal altid ligge inden den 20.", () => {
    for (const interval of ["kvartal", "maaned"] as const) {
      for (const u of udbetalingsdatoerAar(2026, interval)) {
        expect(u.betalingsdato.getTime()).toBeLessThanOrEqual(u.dato.getTime());
      }
    }
  });

  it("flytter også en betaling der falder på en helligdag, ikke kun på weekend", () => {
    // Påsken 2057 er 22. april, så skærtorsdag er 19. og langfredag 20.
    // Den 20. er en fredag, men *hverdagen inden* er torsdag den 19. — som
    // også er skærtorsdag, altså helligdag. Betalingen rykked derfor to dage
    // tilbage til onsdag den 18. April. Min første test forventede den 19.
    // og faldt; koden var rigtig, forventningen var ikke.
    const apr20 = udbetalingsdatoerAar(2057, "kvartal").find((u) => u.maaned === 4);
    expect(iso(apr20?.dato ?? new Date(0))).toBe("2057-04-20");
    expect(apr20?.ugedag).toBe("fredag");
    expect(apr20?.forskudt).toBe(true);
    expect(iso(apr20?.betalingsdato ?? new Date(0))).toBe("2057-04-18");
  });

  it("regner et andet år forfra, så tallet ikke er hårdkodet til 2026", () => {
    const forskudte2027 = udbetalingsdatoerAar(2027, "maaned")
      .filter((u) => u.forskudt)
      .map((u) => iso(u.dato));
    expect(forskudte2027).toEqual([
      "2027-02-20",
      "2027-03-20",
      "2027-06-20",
      "2027-11-20",
    ]);
  });
});

describe("naesteUdbetalingsdato", () => {
  // Lokal kalenderdato. Et `new Date("2026-10-01")` er UTC-midnat og dermed
  // 1. oktober kl. 02:00 dansk tid — i praksis det samme her, men på en dag hvor
  // de to tidszoner er forskudte ville `new Date(aar, maaned-1, dag)` være det
  // ufarlige valg, fordi det er dansk kalenderdato uden tidszone.
  const d = (aar: number, maaned: number, dag: number) =>
    new Date(aar, maaned - 1, dag);
  const iso = (x: Date) =>
    `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;

  it("giver den 20. selv den er den 20.", () => {
    // Betalingen er den dag den står på konto, så den skal kunne svare «i dag».
    const n = naesteUdbetalingsdato(d(2026, 10, 20), "kvartal");
    expect(iso(n.betalingsdato)).toBe("2026-10-20");
    expect(n.dage).toBe(0);
  });

  it("giver dagens betaling også når den er forskudt fra en weekend", () => {
    // 20. juni 2026 er en lørdag, så pengene står på konto 19. juni. Læser man
    // siden 19. juni, er svaret «i dag» — ikke «20. juni», for den er forbi.
    const n = naesteUdbetalingsdato(d(2026, 6, 19), "maaned");
    expect(iso(n.betalingsdato)).toBe("2026-06-19");
    expect(iso(n.nominell)).toBe("2026-06-20");
    expect(n.dage).toBe(0);
  });

  it("springer frem til januar når oktober er det sidste kvartal", () => {
    // December er *ikke* et kvartal — kun den månedlige ungeydelse har den.
    // Derfor er januar det næste kvartal efter 20. oktober, 91 dage senere:
    // 10 dage til 31. oktober, 30 i november, 31 i december og 20 i januar.
    const n = naesteUdbetalingsdato(d(2026, 10, 21), "kvartal");
    expect(iso(n.betalingsdato)).toBe("2027-01-20");
    expect(n.dage).toBe(91);
  });

  it("løber over årsskiftet, så en november-læsning ikke får en gået dato", () => {
    // Et fast årstal ville svare 20. oktober *i år* for en læsning i november,
    // altså en dato der er gået, når den vises.
    const n = naesteUdbetalingsdato(d(2026, 11, 5), "kvartal");
    expect(iso(n.betalingsdato)).toBe("2027-01-20");
    expect(n.nominell.getFullYear()).toBe(2027);
    expect(n.dage).toBe(76);
  });

  it("tæller dage hele vejen over sommer- og vintertid", () => {
    // 22. marts 2026 er efter skiftet til sommertid, 20. januar før det. En
    // naiv måling i millisekunder ville tælle 29 dage minus én time her, fordi
    // timezonen skifter en time; dagnumrene tæller 29 hele dage.
    const n = naesteUdbetalingsdato(d(2026, 3, 22), "maaned");
    expect(iso(n.betalingsdato)).toBe("2026-04-20");
    expect(n.dage).toBe(29);
  });

  it("giver den samme dato uanset hvilken dag i samme ugeinterval man læser", () => {
    const foer = naesteUdbetalingsdato(d(2026, 3, 23), "maaned");
    const efter = naesteUdbetalingsdato(d(2026, 3, 29), "maaned");
    expect(iso(foer.betalingsdato)).toBe("2026-04-20");
    expect(iso(efter.betalingsdato)).toBe("2026-04-20");
    expect(efter.dage).toBe(foer.dage - 6);
  });
});
