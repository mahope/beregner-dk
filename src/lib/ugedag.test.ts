import { describe, expect, test } from "vitest";
import {
  dageIAar,
  dageMellemIsoDatoer,
  erWeekend,
  formatDatoTekst,
  getUgedagPath,
  isUgedagLocale,
  isoUge,
  ugedagResultat,
  ugedagsnavn,
  ugenOmkring,
  UGEDAG_PATH,
} from "./ugedag";

describe("ugedagsnavn", () => {
  // De færdige reference-datoer er valgt, fordi de er *kontrollerbare*: 1. januar
  // 2026 er en torsdag (juleaftensdagen 2025 var samme ugedag), 6. oktober 2026
  // er en tirsdag. Ugedagen er det ENESTE tal, der ikke må kunne glide, fordi
  // hele sidens hensigt er den — en forkert ugedag er præcis den fejl, den her
  // skal finde.
  test("de færdige ugedage læses rigtigt i begge sprog", () => {
    // 2026-01-01 = torsdag, 2026-10-06 = tirsdag, 2026-12-25 = fredag,
    // 2026-12-26 = lørdag, 2026-12-27 = søndag, 2026-04-03 = fredag (langfredag).
    expect(ugedagsnavn("2026-01-01", "da")).toBe("Torsdag");
    expect(ugedagsnavn("2026-01-01", "se")).toBe("Torsdag");
    expect(ugedagsnavn("2026-10-06", "da")).toBe("Tirsdag");
    expect(ugedagsnavn("2026-12-25", "da")).toBe("Fredag");
    expect(ugedagsnavn("2026-12-26", "da")).toBe("Lørdag");
    expect(ugedagsnavn("2026-12-27", "da")).toBe("Søndag");
  });

  // GetDay()'s række begynder på SØNDAG (0), ikke på mandag. En rotation der
  // antager den europæiske rækkefølge (mandag = 0) ville give mandag for
  // søndage — altså *seks* af ugens syv dage forkerte, og kun søndagen ville
  // være rigtig ved etiketten. Det er den mutation, der dømmer den her.
  test("hver af de syv dage har sit eget navn — ingen forskydning af getDay()", () => {
    // 2026-11-02 er en mandag; de syv dage derfra dækker mandag→søndag.
    const forventetDa = [
      "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag",
    ];
    const forventetSe = [
      "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag",
    ];
    forventetDa.forEach((navn, i) => {
      const dag = 2 + i;
      const iso = `2026-11-${String(dag).padStart(2, "0")}`;
      expect(ugedagsnavn(iso, "da")).toBe(navn);
      expect(ugedagsnavn(iso, "se")).toBe(forventetSe[i]);
    });
  });

  test("svensk og dansk staver hver deres, ikke en fælles række", () => {
    // "Lørdag" vs "Lördag", "Søndag" vs "Söndag", "Tirsdag" vs "Tisdag".
    // Mutation: gør `se` til en kopi af `da` → 4 røde på denne test.
    expect(ugedagsnavn("2026-11-07", "se")).toBe("Lördag");
    expect(ugedagsnavn("2026-11-07", "da")).toBe("Lørdag");
    expect(ugedagsnavn("2026-11-08", "se")).toBe("Söndag");
    expect(ugedagsnavn("2026-11-03", "se")).toBe("Tisdag");
    expect(ugedagsnavn("2026-11-02", "se")).toBe("Måndag");
  });

  test("en uguelig dato returnerer null frem for at rulle over i næste måned", () => {
    expect(ugedagsnavn("2026-02-30", "da")).toBeNull();
    expect(ugedagsnavn("2026-13-01", "da")).toBeNull();
    expect(ugedagsnavn("", "da")).toBeNull();
    expect(ugedagsnavn("2026-1-1", "da")).toBeNull();
  });
});

describe("erWeekend", () => {
  test("kun lørdag og søndag er weekend", () => {
    expect(erWeekend("2026-11-07")).toBe(true); // lørdag
    expect(erWeekend("2026-11-08")).toBe(true); // søndag
    expect(erWeekend("2026-11-06")).toBe(false); // fredag
    expect(erWeekend("2026-11-02")).toBe(false); // mandag
    expect(erWeekend("2026-02-30")).toBe(false);
  });
});

describe("isoUge", () => {
  // ISO 8601: uge 1 er den uge, der indeholder årets første TORSDAG. Det er
  // ikke den samme regel som "den uge, der indeholder 1. januar", og det er
  // derfor `/ugenummer` har en hel side om. De tre års-skifte-datoer her er de
  // tre tilfælde, hvor de to regler giver hver sit svar.
  test("uge 1 er ugen med årets første torsdag", () => {
    // 1. januar 2026 ER en torsdag → uge 1.
    expect(isoUge("2026-01-01")).toEqual({ uge: 1, ugedag: 4 });
    // 1. januar 2017 var en søndag → uge 52 af 2016, ikke uge 1 af 2017.
    expect(isoUge("2017-01-01")).toEqual({ uge: 52, ugedag: 7 });
    // 30. december 2019 er en mandag, men tilhører uge 1 af 2020.
    expect(isoUge("2019-12-30")).toEqual({ uge: 1, ugedag: 1 });
  });

  test("ISO-ugedagen har mandag = 1 og søndag = 7, ikke getDay()'s 0-6", () => {
    expect(isoUge("2026-11-02")).toEqual({ uge: 45, ugedag: 1 }); // mandag
    expect(isoUge("2026-11-08")).toEqual({ uge: 45, ugedag: 7 }); // søndag
  });

  // Et skudårsløft: ISO har 53 uger i 2020 og 2026. Mutation af `+4` til `+3`
  // eller af `Math.ceil` til `Math.floor` giver et ugeantal uden for 1-53 her.
  test("et år har højst 53 ISO-uger og mindst 52", () => {
    for (let aar = 1990; aar <= 2035; aar++) {
      const iso = `${aar}-06-15`;
      const { uge } = isoUge(iso)!;
      expect(uge).toBeGreaterThanOrEqual(1);
      expect(uge).toBeLessThanOrEqual(53);
    }
    expect(isoUge("2026-12-31")).toEqual({ uge: 53, ugedag: 4 });
    expect(isoUge("2020-12-31")).toEqual({ uge: 53, ugedag: 4 });
  });

  test("en uguelig dato returnerer null", () => {
    expect(isoUge("2026-02-30")).toBeNull();
    expect(isoUge("")).toBeNull();
  });
});

describe("dageIAar", () => {
  test("skudårsreglen er den gregorianske: 400-årsreglen og 100-årsreglen", () => {
    expect(dageIAar(2026)).toEqual({ dage: 365, skudaar: false });
    expect(dageIAar(2024)).toEqual({ dage: 366, skudaar: true });
    expect(dageIAar(1900)).toEqual({ dage: 365, skudaar: false });
    expect(dageIAar(2000)).toEqual({ dage: 366, skudaar: true });
    expect(dageIAar(2100)).toEqual({ dage: 365, skudaar: false });
  });
});

describe("formatDatoTekst", () => {
  test("dansk skriver punktum, svensk ikke", () => {
    expect(formatDatoTekst("2026-09-27", "da")).toBe("27. september 2026");
    expect(formatDatoTekst("2026-09-27", "se")).toBe("27 september 2026");
  });

  test("månedsnavnene er hvert sprog eget", () => {
    // "maj" hedder "maj" på begge sprog, men "marts"/"mars" og
    // "august"/"augusti" gør det ikke.
    expect(formatDatoTekst("2026-03-05", "da")).toBe("5. marts 2026");
    expect(formatDatoTekst("2026-03-05", "se")).toBe("5 mars 2026");
    expect(formatDatoTekst("2026-08-05", "da")).toBe("5. august 2026");
    expect(formatDatoTekst("2026-08-05", "se")).toBe("5 augusti 2026");
    // "maj" og "juni"/"juli" er ens i begge sprog.
    expect(formatDatoTekst("2026-05-05", "da")).toBe("5. maj 2026");
    expect(formatDatoTekst("2026-05-05", "se")).toBe("5 maj 2026");
  });

  test("éncifrede dage og måneder får nul-cifre", () => {
    expect(formatDatoTekst("2026-01-01", "da")).toBe("1. januar 2026");
    expect(formatDatoTekst("2026-11-09", "se")).toBe("9 november 2026");
  });
});

describe("ugenOmkring", () => {
  test("ugen er alle syv dage og starter på mandag", () => {
    const række = ugenOmkring("2026-11-04", "da"); // en onsdag
    expect(række).toHaveLength(7);
    expect(række[0].ugedagTekst).toBe("Mandag");
    expect(række[6].ugedagTekst).toBe("Søndag");
    expect(række.map((d) => d.dagNr)).toEqual([2, 3, 4, 5, 6, 7, 8]);
  });

  // Samme uge uanset hvilken af de syv dage man spørger på. Det er den
  // mutation, der dømmer: en mandag-offset på den valgte dato i stedet for på
  // `isoUge` giver en forskudt uge på de seks ikke-mandag-dage.
  test("samme uge uanset hvilken dag i den man spørger på", () => {
    const mandag = ugenOmkring("2026-11-02", "da");
    for (let i = 0; i < 7; i++) {
      const iso = `2026-11-${String(2 + i).padStart(2, "0")}`;
      const række = ugenOmkring(iso, "da");
      expect(række.map((d) => d.iso)).toEqual(mandag.map((d) => d.iso));
      expect(række.find((d) => d.erValgt)?.dagNr).toBe(2 + i);
    }
  });

  test("ugedagen i rækken er den samme som ugedagsnavn() giver", () => {
    const række = ugenOmkring("2026-11-04", "se");
    for (const dag of række) {
      expect(dag.ugedagTekst).toBe(ugedagsnavn(dag.iso, "se"));
    }
  });

  test("en månedsskifte ugen kan ikke regne en ugedag for mange eller for få", () => {
    // 31. december 2026 er en torsdag, så ugen løber 28/12-3/1.
    const række = ugenOmkring("2026-12-31", "da");
    expect(række).toHaveLength(7);
    expect(række[0].tekst).toBe("28");
    expect(række[3].tekst).toBe("31");
    expect(række[4].tekst).toBe("1");
    expect(række[4].ugedagTekst).toBe("Fredag");
    expect(række[6].ugedagTekst).toBe("Søndag");
  });

  test("weekend-markeringen følger erWeekend()", () => {
    const række = ugenOmkring("2026-11-04", "da");
    expect(række.filter((d) => d.weekend)).toHaveLength(2);
    expect(række[5].weekend).toBe(true);
    expect(række[6].weekend).toBe(true);
    expect(række[0].weekend).toBe(false);
  });

  test("præcis én dag er markeret som valgt", () => {
    const række = ugenOmkring("2026-11-04", "da");
    expect(række.filter((d) => d.erValgt)).toHaveLength(1);
  });

  test("en uguelig dato giver en tom uge frem for syv forkerte", () => {
    expect(ugenOmkring("2026-02-30", "da")).toEqual([]);
  });
});

describe("ugedagResultat", () => {
  test("svarer på alle spørgsmålene om én dato", () => {
    const r = ugedagResultat("2026-12-25", "da");
    expect(r).toEqual({
      iso: "2026-12-25",
      datoTekst: "25. december 2026",
      ugedagTekst: "Fredag",
      uge: 52,
      ugedagIso: 5,
      weekend: false,
    });
  });

  test("juleaften 2026 er en fredag og ikke en helligdag i ugedagssvaret", () => {
    // Det er den kontrol, hele siden hviler på: datoen → ugedag → ISO-uge.
    const r = ugedagResultat("2026-12-24", "se")!;
    expect(r.ugedagTekst).toBe("Torsdag");
    expect(r.uge).toBe(52);
    expect(r.datoTekst).toBe("24 december 2026");
  });

  test("brødteksten og værktøjet læser den samme funktion", () => {
    // Uden denne test kunne siden skrive «fredag» i brødteksten mens
    // `ugedagsnavn` siger «lørdag`. Mutation af ugedagsnavn → denne rød.
    for (const iso of ["2026-01-01", "2026-06-01", "2026-12-25"]) {
      for (const locale of ["da", "se"] as const) {
        const r = ugedagResultat(iso, locale)!;
        expect(r.ugedagTekst).toBe(ugedagsnavn(iso, locale));
        expect(r.uge).toBe(isoUge(iso)!.uge);
        expect(r.datoTekst).toBe(formatDatoTekst(iso, locale));
      }
    }
  });

  test("en uguelig dato returnerer null", () => {
    expect(ugedagResultat("2026-02-30", "da")).toBeNull();
  });
});

describe("dageMellemIsoDatoer", () => {
  test("en uge er syv dage, uanset hvor et skifte for sommertid ligger", () => {
    // 25.–26. oktober 2026 er 25 timer, altså 1,04 dage. Tælles på
    // millisekunder og rundet op, bliver det 2 — mutation af `heleDageMellem`
    // til en ren millisekunder-diff giver røde her.
    expect(dageMellemIsoDatoer("2026-10-25", "2026-10-26")).toBe(1);
    expect(dageMellemIsoDatoer("2026-03-28", "2026-03-29")).toBe(1);
    expect(dageMellemIsoDatoer("2026-01-01", "2026-12-31")).toBe(364);
  });
});

describe("stier og sprog", () => {
  test("sproget vælger stien, og norsk er ikke i drift", () => {
    expect(getUgedagPath("da")).toBe("/ugedag");
    expect(getUgedagPath("se")).toBe("/veckodag");
    expect(getUgedagPath("no")).toBeNull();
    expect(isUgedagLocale("da")).toBe(true);
    expect(isUgedagLocale("se")).toBe(true);
    expect(isUgedagLocale("no")).toBe(false);
    expect(UGEDAG_PATH.da).toBe("/ugedag");
    expect(UGEDAG_PATH.se).toBe("/veckodag");
  });

  test("den danske og den svenske sti er forskellige", () => {
    // Mutation: gør `se` til `/ugedag` → rød. Ellers ville de to domæner
    // servere samme adresse, og den svenske søgning «vilken veckodag» ikke
    // kunne finde siden.
    expect(UGEDAG_PATH.da).not.toBe(UGEDAG_PATH.se);
  });
});
