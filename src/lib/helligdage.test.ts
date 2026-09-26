import { describe, expect, test } from "vitest";
import {
  erArbejdsdag,
  erHelligdag,
  foegArbejdsdage,
  getHelligdage,
  taellArbejdsdage,
  taellHelligdage,
  taellHelligdagePaaHverdag,
  taellNytarsaften,
  taellWeekender,
  type HelligdagLocale,
} from "./helligdage";

const da: HelligdagLocale = "da";
const se: HelligdagLocale = "se";

function d(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function iso(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${day}`;
}

function names(year: number, locale: HelligdagLocale): string[] {
  return getHelligdage(year, locale).map((h) => h.name);
}

describe("getHelligdage", () => {
  test("danske helligdage 2026 er de ni officielle", () => {
    expect(names(2026, da)).toEqual([
      "Nytårsdag",
      "Skærtorsdag",
      "Langfredag",
      "Påskedag",
      "2. påskedag",
      "Grundlovsdag",
      "Juleaftensdag",
      "Juledag",
      "2. juledag",
    ]);
  });

  test("sorted by date and one entry per day", () => {
    const list = getHelligdage(2027, da);
    const times = list.map((h) => h.date.getTime());
    expect([...times].sort((a, b) => a - b)).toEqual(times);
    expect(new Set(times).size).toBe(times.length);
  });

  test("de ni officielle danske helligdage ligger på de rette datoer", () => {
    const datoer = getHelligdage(2026, da).map((h) => iso(h.date));
    expect(datoer).toEqual([
      "2026-01-01",
      "2026-04-02",
      "2026-04-03",
      "2026-04-05",
      "2026-04-06",
      "2026-06-05",
      "2026-12-24",
      "2026-12-25",
      "2026-12-26",
    ]);
  });

  test("påske-relaterede datoer følger den gregorianske algoritme", () => {
    const easter2026 = getHelligdage(2026, da).find(
      (h) => h.name === "Påskedag"
    );
    expect(iso(easter2026!.date)).toBe("2026-04-05");
    const easter2027 = getHelligdage(2027, da).find(
      (h) => h.name === "Påskedag"
    );
    expect(iso(easter2027!.date)).toBe("2027-03-28");
  });

  test("skærtorsdag er altid torsdag og påskedag altid søndag", () => {
    for (let year = 2024; year <= 2045; year++) {
      const list = getHelligdage(year, da);
      const find = (n: string) => list.find((h) => h.name === n)!.date;
      expect(find("Skærtorsdag").getDay()).toBe(4);
      expect(find("Langfredag").getDay()).toBe(5);
      expect(find("Påskedag").getDay()).toBe(0);
      expect(find("2. påskedag").getDay()).toBe(1);
    }
  });

  test("store bededag er ikke en helligdag (afskaffet fra 2024)", () => {
    expect(erHelligdag(d("2024-01-05"), da)).toBe(false);
    expect(erHelligdag(d("2023-01-05"), da)).toBe(false);
    expect(names(2026, da)).not.toContain("Store bededag");
  });

  test("nytårsaften er ikke en officiel dansk helligdag", () => {
    expect(erHelligdag(d("2026-12-31"), da)).toBe(false);
  });

  test("svenske helligdage 2026", () => {
    expect(names(2026, se)).toEqual([
      "Nyårsdagen",
      "Trettondedag jul",
      "Långfredagen",
      "Påskdagen",
      "Annandag påsk",
      "Første maj",
      "Kristi himmelsfärdsdag",
      "Sveriges nationaldag",
      "Midsommarafton",
      "Midsommardagen",
      "Alla helgons dag",
      "Julafton",
      "Juldagen",
      "Annandag jul",
      "Nyårsafton",
    ]);
  });

  test("midsommar og alla helgons dag ligger på en lørdag", () => {
    for (let year = 2024; year <= 2035; year++) {
      for (const name of ["Midsommarafton", "Midsommardagen", "Alla helgons dag"]) {
        const holiday = getHelligdage(year, se).find((h) => h.name === name)!;
        expect(holiday.date.getDay()).toBe(6);
      }
    }
  });

  test("midsommarafton 2026 er 20. juni", () => {
    const midsommar = getHelligdage(2026, se).find(
      (h) => h.name === "Midsommarafton"
    )!;
    expect(iso(midsommar.date)).toBe("2026-06-20");
  });

  test("nationaldagen er forskellig per domæne", () => {
    expect(erHelligdag(d("2026-06-05"), da)).toBe(true);
    expect(erHelligdag(d("2026-06-05"), se)).toBe(false);
    expect(erHelligdag(d("2026-06-06"), se)).toBe(true);
    expect(erHelligdag(d("2026-06-06"), da)).toBe(false);
  });

  test("kristi himmelsfärdsdag er 39 dage efter påskedagen", () => {
    const list = getHelligdage(2026, se);
    const paske = list.find((h) => h.name === "Påskdagen")!.date;
    const himmelsfard = list.find(
      (h) => h.name === "Kristi himmelsfärdsdag"
    )!.date;
    const diff = Math.round(
      (himmelsfard.getTime() - paske.getTime()) / 86400000
    );
    expect(diff).toBe(39);
  });
});

describe("erArbejdsdag", () => {
  test("weekend er ikke arbejdsdag", () => {
    expect(erArbejdsdag(d("2026-09-26"), da)).toBe(false); // Saturday
    expect(erArbejdsdag(d("2026-09-27"), da)).toBe(false); // Sunday
    expect(erArbejdsdag(d("2026-09-28"), da)).toBe(true); // Monday
  });

  test("helligdag er ikke arbejdsdag", () => {
    expect(erArbejdsdag(d("2026-12-25"), da)).toBe(false);
    expect(erArbejdsdag(d("2026-12-24"), da)).toBe(false);
    expect(erArbejdsdag(d("2026-12-23"), da)).toBe(true);
  });

  test("en helligdag der falder på en lørdag tælles ikke dobbelt", () => {
    // 1. januar 2022 var en lørdag.
    expect(erHelligdag(d("2022-01-01"), da)).toBe(true);
    expect(erArbejdsdag(d("2022-01-01"), da)).toBe(false);
  });
});

describe("taellArbejdsdage", () => {
  test("en hel uge er fem arbejdsdage", () => {
    expect(taellArbejdsdage(d("2026-09-21"), d("2026-09-27"), da)).toBe(5);
  });

  test("juleugen 2026 tæller korrekt", () => {
    // 21.-27. december 2026: man-fre er 21.-23. og 28. er ikke med.
    expect(taellArbejdsdage(d("2026-12-21"), d("2026-12-27"), da)).toBe(3);
  });

  test("helligdage og nytårsaften trækkes fra december 2026", () => {
    // 23 hverdage minus 24./25. december og nytårsaften.
    // 26. december er en lørdag og tæller ikke som hverdag.
    expect(taellArbejdsdage(d("2026-12-01"), d("2026-12-31"), da)).toBe(20);
    expect(taellHelligdage(d("2026-12-01"), d("2026-12-31"), da)).toBe(3);
  });

  test("juli 2026 har ingen danske helligdage", () => {
    expect(taellHelligdage(d("2026-07-01"), d("2026-07-31"), da)).toBe(0);
  });

  test("juli 2026 har svensk nationaldag-helligdag i juni ikke juli", () => {
    expect(taellHelligdage(d("2026-06-01"), d("2026-06-30"), da)).toBe(1);
  });

  test("omvendt interval giver 0", () => {
    expect(taellArbejdsdage(d("2026-12-31"), d("2026-12-01"), da)).toBe(0);
    expect(taellHelligdage(d("2026-12-31"), d("2026-12-01"), da)).toBe(0);
  });

  test("interval på én dag", () => {
    expect(taellArbejdsdage(d("2026-09-28"), d("2026-09-28"), da)).toBe(1);
    expect(taellArbejdsdage(d("2026-09-26"), d("2026-09-26"), da)).toBe(0);
  });

  test("skudårsdagen tælles som sin egen dag", () => {
    // 28. februar (ons), 29. februar (tor) og 1. marts (fre).
    expect(taellArbejdsdage(d("2024-02-28"), d("2024-03-01"), da)).toBe(3);
  });

  test("syv dage er altid syv dage, også over DST- og påskeskift", () => {
    // Skiftet til sommertid ligger i dette vindue hvert år. Påske kan falde
    // så tidligt som 22. marts, så skærtorsdag/langfredag/2. påskedag kan
    // tage arbejdsdage væk. De forventede tal er 5 minus hverdagshelligdage.
    const forventet: Record<number, number> = {
      2024: 3, // skærtorsdag 28/3 + langfredag 29/3
      2025: 5,
      2026: 5,
      2027: 2, // skærtorsdag 25/3, langfredag 26/3, 2. påskedag 29/3
      2028: 5,
      2029: 3, // skærtorsdag 29/3 + langfredag 30/3
      2030: 5,
    };
    for (let year = 2024; year <= 2030; year++) {
      expect(taellArbejdsdage(d(`${year}-03-25`), d(`${year}-03-31`), da)).toBe(
        forventet[year]
      );
    }
  });

  test("helligdage tælles hver for sig selv i et langt interval", () => {
    const to = new Date(2026, 11, 31);
    const fra = new Date(2026, 0, 1);
    const forventet = getHelligdage(2026, da).filter(
      (h) => h.date.getTime() >= fra.getTime() && h.date.getTime() <= to.getTime()
    ).length;
    expect(taellHelligdage(fra, to, da)).toBe(forventet);
  });
});

describe("taellWeekender", () => {
  test("en hel uge har to weekenddage", () => {
    expect(taellWeekender(d("2026-09-21"), d("2026-09-27"))).toBe(2);
  });

  test("helligdage på en hverdag tælles ikke som weekend", () => {
    // 1.-7. januar 2026: nytårsdag er en torsdag, så ugen har kun lørdag/søndag.
    expect(taellWeekender(d("2026-01-01"), d("2026-01-07"))).toBe(2);
  });

  test("juleugen 2026 har weekenddage uafhængigt af juledagene", () => {
    // 21.-27. december: lør 26. og søn 27.
    expect(taellWeekender(d("2026-12-21"), d("2026-12-27"))).toBe(2);
    // 26. december er både en lørdag og 2. juledag, men tælles kun som weekend.
    expect(taellWeekender(d("2026-12-26"), d("2026-12-26"))).toBe(1);
    expect(taellHelligdage(d("2026-12-26"), d("2026-12-26"), da)).toBe(1);
  });


  test("en arbejdsdag er aldrig en weekenddag", () => {
    for (let day = 1; day <= 31; day++) {
      const dato = d(`2026-12-${String(day).padStart(2, "0")}`);
      if (erArbejdsdag(dato, da)) {
        expect(taellWeekender(dato, dato)).toBe(0);
      }
    }
  });

  test("hverdage minus arbejdsdage er præcis helligdage og nytårsaften", () => {
    const dage = Array.from({ length: 31 }, (_, i) =>
      d(`2026-12-${String(i + 1).padStart(2, "0")}`)
    );
    const hverdage = dage.filter((x) => x.getDay() >= 1 && x.getDay() <= 5);
    const taelt = taellArbejdsdage(d("2026-12-01"), d("2026-12-31"), da);
    const fradrag = hverdage.filter((x) => !erArbejdsdag(x, da));

    expect(hverdage.length).toBe(23);
    expect(taelt).toBe(20);
    // 24. og 25. december er helligdage, 31. december er nytårsaften.
    // 26. december mangler, fordi den er en lørdag og dermed ikke en hverdag.
    expect(fradrag.map(iso)).toEqual(["2026-12-24", "2026-12-25", "2026-12-31"]);
  });

  test("omvendt interval giver 0", () => {
    expect(taellWeekender(d("2026-12-31"), d("2026-12-01"))).toBe(0);
  });

  test("et interval tælles uafhængigt af rækkefølgen, når det sorteres", () => {
    // Dato-inputsene tillader slutdato før startdato, så kalenderen sorterer
    // intervallet før tællerne kører. Uden den sortering ville alle tre tal
    // blive 0, fordi tællerne afviser omvendte intervaller.
    const forventet = { arbejdsdage: 20, weekenddage: 8, helligdage: 3 };
    const fra = d("2026-12-01");
    const til = d("2026-12-31");

    for (const [a, b] of [
      [fra, til],
      [til, fra],
    ]) {
      const lav = a.getTime() <= b.getTime() ? a : b;
      const høj = a.getTime() <= b.getTime() ? b : a;
      expect(taellArbejdsdage(lav, høj, da)).toBe(forventet.arbejdsdage);
      expect(taellWeekender(lav, høj)).toBe(forventet.weekenddage);
      expect(taellHelligdage(lav, høj, da)).toBe(forventet.helligdage);
    }
  });
});

describe("taellNytarsaften", () => {
  test("nytårsaften er ikke en helligdag og ikke en arbejdsdag", () => {
    const nytarsaften = d("2026-12-31");
    expect(taellNytarsaften(nytarsaften, nytarsaften)).toBe(1);
    expect(taellHelligdage(nytarsaften, nytarsaften, da)).toBe(0);
    expect(taellArbejdsdage(nytarsaften, nytarsaften, da)).toBe(0);
  });

  test("tæller højst én gang og kun i sit interval", () => {
    expect(taellNytarsaften(d("2026-01-01"), d("2026-12-31"))).toBe(1);
    expect(taellNytarsaften(d("2026-12-30"), d("2027-01-02"))).toBe(1);
    expect(taellNytarsaften(d("2026-12-01"), d("2026-12-30"))).toBe(0);
  });

  test("et helt år indeholder præcis én nytårsaften", () => {
    for (const aar of [2026, 2027, 2028]) {
      expect(taellNytarsaften(d(`${aar}-01-01`), d(`${aar}-12-31`))).toBe(1);
    }
  });

  test("omvendt interval giver 0", () => {
    expect(taellNytarsaften(d("2026-12-31"), d("2026-12-01"))).toBe(0);
  });
});

describe("taellHelligdagePaaHverdag", () => {
  test("springer helligdage, der allerede er weekenddage", () => {
    // 26. december 2026 er en lørdag og 2. juledag.
    expect(taellHelligdage(d("2026-12-26"), d("2026-12-26"), da)).toBe(1);
    expect(taellHelligdagePaaHverdag(d("2026-12-26"), d("2026-12-26"), da)).toBe(0);
    // 24. og 25. december ligger på en hverdag.
    expect(taellHelligdagePaaHverdag(d("2026-12-24"), d("2026-12-26"), da)).toBe(2);
  });

  test("en påskedag på en søndag tælles kun som weekenddag", () => {
    // Påskedag 2026 er 5. april, en søndag.
    expect(taellHelligdage(d("2026-04-05"), d("2026-04-05"), da)).toBe(1);
    expect(taellHelligdagePaaHverdag(d("2026-04-05"), d("2026-04-05"), da)).toBe(0);
    expect(taellHelligdagePaaHverdag(d("2026-04-05"), d("2026-04-06"), da)).toBe(1);
  });

  test("tæller de danske helligdage, der ikke er weekenddage, på et helt år", () => {
    for (const [aar, forventet] of [[2026, 7], [2027, 5], [2028, 6]] as const) {
      expect(
        taellHelligdagePaaHverdag(d(`${aar}-01-01`), d(`${aar}-12-31`), da)
      ).toBe(forventet);
    }
  });

  test("omvendt interval giver 0", () => {
    expect(taellHelligdagePaaHverdag(d("2026-12-26"), d("2026-12-24"), da)).toBe(0);
  });
});

/**
 * The three day categories shown next to "Antal dage" on /dato must partition the
 * days between the two dates, so a reader can add them up. New Year's Eve is the
 * one day that belongs to none of them on the Danish side, and the Swedish
 * calendar lists it as a holiday, so it is the only remainder there.
 */
describe("dagstallene dækker hver dag mellem to datoer én gang", () => {
  const intervaller: [string, string][] = [
    ["2026-01-01", "2026-01-07"],
    ["2026-09-28", "2026-09-29"],
    ["2026-12-20", "2027-01-05"],
    ["2026-12-26", "2026-12-26"],
    ["2026-03-27", "2026-04-06"],
    ["2026-06-01", "2026-06-05"],
    ["2026-12-31", "2026-12-31"],
  ];

  function dageEfter(start: Date): Date {
    const dagen = new Date(start);
    dagen.setDate(dagen.getDate() + 1);
    return dagen;
  }

  test.each(intervaller)("%s til % summerer til antal dage", (fra, til) => {
    const start = d(fra);
    const end = d(til);
    const intervalStart = dageEfter(start);
    const antalDage = intervalStart.getTime() > end.getTime()
      ? 0
      : Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    for (const locale of [da, se]) {
      const summeret =
        taellArbejdsdage(intervalStart, end, locale) +
        taellWeekender(intervalStart, end) +
        taellHelligdagePaaHverdag(intervalStart, end, locale) +
        (locale === "se" ? 0 : taellNytarsaften(intervalStart, end));

      expect(summeret).toBe(antalDage);
    }
  });
});
