import { describe, expect, test } from "vitest";
import {
  erArbejdsdag,
  getHelligdagPath,
  getHelligdage,
  helligdagAntal,
  helligdagRaekker,
  naesteHelligdage,
  erHelligdag,
  foegArbejdsdage,
  taellArbejdsdage,
  taellHelligdage,
  taellHelligdagePaaHverdag,
  taellNytarsaften,
  taellWeekender,
  type HelligdagLocale,
} from "./helligdage";
import { helligdagsnavne } from "./helligdage";
import { getDageTilSlugs } from "./dage-til";

const tilIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

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

/** Signed number of calendar days from `a` to `b`, via UTC day numbers. */
function dageMellem(a: Date, b: Date): number {
  const dag = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((dag(a) - dag(b)) / 86400000);
}

function names(year: number, locale: HelligdagLocale): string[] {
  return getHelligdage(year, locale).map((h) => h.name);
}

describe("getHelligdage", () => {
  test("danske helligdage 2026 er de tretten officielle", () => {
    expect(names(2026, da)).toEqual([
      "Nytårsdag",
      "Palmesøndag",
      "Skærtorsdag",
      "Langfredag",
      "Påskedag",
      "2. påskedag",
      "Kristi himmelfartsdag",
      "Pinsedag",
      "2. pinsedag",
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

  test("de tretten officielle danske helligdage ligger på de rette datoer", () => {
    const datoer = getHelligdage(2026, da).map((h) => iso(h.date));
    expect(datoer).toEqual([
      "2026-01-01",
      "2026-03-29",
      "2026-04-02",
      "2026-04-03",
      "2026-04-05",
      "2026-04-06",
      "2026-05-14",
      "2026-05-24",
      "2026-05-25",
      "2026-06-05",
      "2026-12-24",
      "2026-12-25",
      "2026-12-26",
    ]);
  });

  test("palmesøndag er påskedagen minus 7 dage og altid en søndag", () => {
    // `/dage-til/palmesondag` siger i sin FAQ, at palmesøndag står i listen over
    // Danmarks helligdage. Før 2/10 sagde den det uden at være sand: listen havde
    // 12 helligdage og ingen palmesøndag, så læseren kunne tælle listen på
    // `/dato` og ikke finde den. Derfor ligger den nu i modulet, og denne test er
    // beviset på at påstanden holder — tages den ud af modulet igen, bliver den
    // rød.
    for (let year = 2024; year <= 2045; year++) {
      const list = getHelligdage(year, da);
      const palme = list.find((h) => h.name === "Palmesøndag");
      expect(palme, `palmesøndag mangler i ${year}`).toBeDefined();
      const paske = list.find((h) => h.name === "Påskedag")!.date;
      expect(palme!.date.getDay(), `palmesøndag ${year} er ikke en søndag`).toBe(0);
      expect(dageMellem(palme!.date, paske), `palmesøndag ${year} er ikke 7 dage før påskedagen`).toBe(-7);
      expect(erHelligdag(palme!.date, da)).toBe(true);
    }
  });

  test("palmesøndag er en helligdag, men aldrig en helligdag på en hverdag", () => {
    // Palmesøndag og påskedagen er helligdage, men altid søndage, så de hører til
    // weekenden og ikke til «helligdage på hverdag». `/dato`s arbejdsdage- og
    // helligdagstal er derfor uændrede af at palmesøndag kom på listen, og denne
    // test låser det — en port der tæller alle helligdage med på hverdagene ville
    // give 13 og 12 i stedet for 13 og 9 for 2026.
    for (let year = 2024; year <= 2045; year++) {
      const palme = getHelligdage(year, da).find((h) => h.name === "Palmesøndag")!.date;
      expect(taellHelligdage(palme, palme, da)).toBe(1);
      expect(taellHelligdagePaaHverdag(palme, palme, da)).toBe(0);
      expect(erArbejdsdag(palme, da)).toBe(false);
    }
    expect(taellHelligdage(d("2026-01-01"), d("2026-12-31"), da)).toBe(13);
    expect(taellHelligdagePaaHverdag(d("2026-01-01"), d("2026-12-31"), da)).toBe(9);
    expect(taellArbejdsdage(d("2026-01-01"), d("2026-12-31"), da)).toBe(251);
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
      "Första maj",
      "Kristi himmelsfärdsdag",
      "Pingstdagen",
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

  // listen er håndskrevet pr. sprog, så en dansk stavemåde kan komme ind i den
  // svenske. «Første maj» gjorde det — og `rendered-leak-scan.mjs` fandt den
  // først i den serverede HTML, fordi `locale-leak.mjs` måler kilden, ikke den
  // streng der så bliver læst af en svensk læser. Derfor dømmes her alle
  // navne i den svenske liste, ikke blot 2026.
  test("svenske helligdagsnavne har ingen danske bogstaver", () => {
    for (let year = 2024; year <= 2035; year++) {
      for (const holiday of getHelligdage(year, se)) {
        expect(holiday.name, `${year} ${holiday.name}`).not.toMatch(/[æø]/i);
      }
    }
  });

  // Midsommarafton är fredagen 19–25 juni, midsommardagen lördagen 20–26 juni,
  // och alla helgons dag lördagen 31 oktober–6 november. Den gamle koden räknade
  // afton som en lördag (alltid en dag för sent) och midsommardagen ur fel
  // fönster, så 2026 fick 27 juni i stället för 20 juni.
  test("midsommar och alla helgons dag följer veckodagsvinduer", () => {
    for (let year = 2024; year <= 2035; year++) {
      const list = getHelligdage(year, se);
      const find = (n: string) => list.find((h) => h.name === n)!;
      expect(find("Midsommarafton").date.getDay(), `afton ${year}`).toBe(5);
      expect(find("Midsommardagen").date.getDay(), `dag ${year}`).toBe(6);
      expect(find("Alla helgons dag").date.getDay(), `helgon ${year}`).toBe(6);
      const afton = find("Midsommarafton").date;
      const dag = find("Midsommardagen").date;
      expect(afton.getMonth(), `månad ${year}`).toBe(5);
      expect(dag.getMonth(), `månad ${year}`).toBe(5);
      expect(afton.getDate(), `afton-datum ${year}`).toBeGreaterThanOrEqual(19);
      expect(afton.getDate(), `afton-datum ${year}`).toBeLessThanOrEqual(25);
      expect(dag.getDate(), `dag-datum ${year}`).toBeGreaterThanOrEqual(20);
      expect(dag.getDate(), `dag-datum ${year}`).toBeLessThanOrEqual(26);
      // Midsommardagen är dagen efter midsommarafton.
      const diff = Math.round((dag.getTime() - afton.getTime()) / 86400000);
      expect(diff, `midsommar ${year}`).toBe(1);
      // Alla helgons dag ligger 31 oktober–6 november.
      const helgon = find("Alla helgons dag").date;
      const iVinduet =
        (helgon.getMonth() === 9 && helgon.getDate() === 31) ||
        (helgon.getMonth() === 10 && helgon.getDate() <= 6);
      expect(iVinduet, `helgon ${year}`).toBe(true);
    }
  });

  test("midsommarafton 2026 er 19. juni og midsommardagen 20. juni", () => {
    const list = getHelligdage(2026, se);
    expect(iso(list.find((h) => h.name === "Midsommarafton")!.date)).toBe("2026-06-19");
    expect(iso(list.find((h) => h.name === "Midsommardagen")!.date)).toBe("2026-06-20");
    expect(iso(list.find((h) => h.name === "Alla helgons dag")!.date)).toBe("2026-10-31");
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

  // De tre danske dage efter påsken manglede i listen, sa alle arbejdsdage-
  // og helligdagstal i maj var for hoje. Testen laaser forskelsdagen, som
  // dage-til-siden allerede dokumenterer: mandagen efter pingstdagen er
  // helligdag i Danmark og almindelig arbejdsdag i Sverige. Den svenske
  // undtagelse læses på *navnet*, fordi 6. juni 2033 og 2044 er både
  // nationaldag og annandag pingst — då er mandagen alligevel en helligdag.
  test("pinsedagen er søndag og 2. pinsedag er helligdag i Danmark men ikke i Sverige", () => {
    for (let year = 2024; year <= 2045; year++) {
      const dansk = getHelligdage(year, da);
      const svensk = getHelligdage(year, se);
      const find = (list: typeof dansk, n: string) => list.find((h) => h.name === n)!.date;
      // Dage-tallet, ikke millisekunder: `easterDate` bygger lokale datoer, så
      // en DST-overgang mellem påsken og pinse giver en times spring.
      const dageMellem = (fra: Date, til: Date) =>
        (Date.UTC(til.getFullYear(), til.getMonth(), til.getDate()) -
          Date.UTC(fra.getFullYear(), fra.getMonth(), fra.getDate())) /
        86400000;
      const paske = find(dansk, "Påskedag");
      expect(dageMellem(paske, find(dansk, "Kristi himmelfartsdag")), `himmelfart ${year}`).toBe(39);
      expect(dageMellem(paske, find(dansk, "Pinsedag")), `pinsedag ${year}`).toBe(49);
      expect(dageMellem(paske, find(dansk, "2. pinsedag")), `2. pinsedag ${year}`).toBe(50);
      // Svensk pingstdagen ligger på præcis samme afstand.
      expect(dageMellem(find(svensk, "Påskdagen"), find(svensk, "Pingstdagen")), `pingstdagen ${year}`).toBe(49);
      expect(find(dansk, "Pinsedag").getDay(), `pinsedag ${year}`).toBe(0);
      expect(find(dansk, "2. pinsedag").getDay(), `2. pinsedag ${year}`).toBe(1);
      // Svensk lov (1989:253) kender pingstdagen, men ikke annandag pingst.
      expect(find(svensk, "Pingstdagen").getDay(), `pingstdagen ${year}`).toBe(0);
      expect(svensk.some((h) => h.name === "Annandag pingst"), `år ${year}`).toBe(false);
    }
  });

  // Samme regel på hele året: en hverdag der er helligdag, tælles aldrig som
  // arbejdsdag. 2026 stod på 253 før de tre danske dage kom med i listen —
  // 251 er det rigtige tal, fordi 14. maj (torsdag) og 25. maj (mandag) er
  // hverdage. Pinseugen 25.-31. maj har derfor fire arbejdsdage, ikke fem.
  test("et helt dansk år har 251 arbejdsdage med de tretten helligdage", () => {
    expect(taellArbejdsdage(d("2026-01-01"), d("2026-12-31"), da)).toBe(251);
    expect(taellArbejdsdage(d("2026-05-25"), d("2026-05-31"), da)).toBe(4);
    // Samme uge i Sverige: pingstdagen er søndagen, så mandagen er
    // arbejdsdag og alle fem hverdage tæller.
    expect(taellArbejdsdage(d("2026-05-18"), d("2026-05-24"), se)).toBe(5);
  });
});

describe("helligdagsnavne", () => {
  // Sætningen på /dato og i FAQ'en læses herfra. Den skal derfor ramme hvert
  // navn i `getHelligdage` — ikke en håndskrevet liste, der kan glide fra.
  test("sætningen rammer præcis navnene i listen, i begge sprog", () => {
    for (const locale of ["da", "se"] as const) {
      const liste = getHelligdage(2026, locale);
      const sætning = helligdagsnavne(2026, locale);
      expect(sætning.split(", ")).toHaveLength(liste.length);
      for (const h of liste) expect(sætning).toContain(h.name);
    }
  });

  test("de tre danske dage efter påsken står i sætningen", () => {
    // De manglede i den håndskrevne sætning, så læseren fik at vide at
    // værktøjet springer ni helligdage over, mens det springer tretten over.
    const da = helligdagsnavne(2026, "da");
    expect(da).toContain("Kristi himmelfartsdag");
    expect(da).toContain("Pinsedag");
    expect(da).toContain("2. pinsedag");
    const se = helligdagsnavne(2026, "se");
    expect(se).toContain("Pingstdagen");
    expect(se).not.toContain("Annandag pingst");
  });

  test("egen navneform bevares, så genitivet ikke skrives med lille s", () => {
    // Svensk genitiv skal have stort S. Derfor står navnene uændret, og den
    // der kalder dem ind må bruge dem, hvor et stort bogstav passer.
    expect(helligdagsnavne(2026, "se")).toContain("Sveriges nationaldag");
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
    // 2026: ni hverdage (palmesøndag, påskedag og pinsedag er søndage, 2.
    // juledag lørdag).
    // 2027: syv, fordi grundlovsdagen 2027 er en lørdag.
    // 2028: syv, fordi 2. pinsedag og grundlovsdag er samme dag.
    for (const [aar, forventet] of [[2026, 9], [2027, 7], [2028, 7]] as const) {
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

describe("/helligdage — årets helligdage som tabelrækker", () => {
  // 2026-10-09, fast klokkeslæt så «dage til næste helligdag» kan måles.
  const FRA = new Date(2026, 9, 9, 12, 0, 0);

  test("rækkerne er getHelligdage, bare med ugedag og type", () => {
    for (const locale of ["da", "se"] as const) {
      const raekker = helligdagRaekker(2026, locale);
      const kilden = getHelligdage(2026, locale);
      expect(raekker).toHaveLength(kilden.length);
      expect(raekker.map((r) => r.navn)).toEqual(kilden.map((k) => k.name));
      expect(raekker.map((r) => r.iso)).toEqual(kilden.map((k) => tilIso(k.date)));
      // Rækkefølgen er kalenderens, ikke alfabetisk.
      expect(raekker[0].iso < raekker[raekker.length - 1].iso).toBe(true);
    }
  });

  test("1. januar 2026 er en torsdag med fast dato og et link", () => {
    const rad = helligdagRaekker(2026, "da").find((r) => r.iso === "2026-01-01");
    expect(rad).toBeDefined();
    expect(rad!.navn).toBe("Nytårsdag");
    expect(rad!.ugedag).toBe("Torsdag");
    expect(rad!.datoTekst).toBe("1. januar 2026");
    expect(rad!.fast).toBe(true);
    expect(rad!.paaHverdag).toBe(true);
    expect(rad!.dageTilSlug).toBe("nytaarsdag");
  });

  test("de 13 danske helligdage 2026: 9 på en hverdag, 4 i weekenden", () => {
    // Fire af dem (palmesøndag, påskedag, pinsedag, 2. juledag 2026) falder i
    // weekenden — det er forklaringen på at «251 arbejdsdage + 104
    // weekenddage + 13 helligdage» ikke summerer til 365.
    const a = helligdagAntal(2026, "da");
    expect(a.total).toBe(13);
    expect(a.paaHverdag).toBe(9);
    expect(a.paaWeekend).toBe(4);
    expect(a.paaHverdag + a.paaWeekend).toBe(a.total);
    expect(helligdagRaekker(2026, "da").filter((r) => r.paaHverdag)).toHaveLength(
      a.paaHverdag
    );
  });

  test("påskeafhængige helligdage er ikke markeret som faste", () => {
    const navne = helligdagRaekker(2026, "da").filter((r) => !r.fast).map((r) => r.navn);
    expect(navne).toEqual([
      "Palmesøndag",
      "Skærtorsdag",
      "Langfredag",
      "Påskedag",
      "2. påskedag",
      "Kristi himmelfartsdag",
      "Pinsedag",
      "2. pinsedag",
    ]);
    // …og deres datoer flytter sig, mens juleaftensdag står.
    expect(helligdagRaekker(2027, "da").find((r) => r.navn === "Juleaftensdag")!.iso).toBe("2027-12-24");
    expect(helligdagRaekker(2027, "da").find((r) => r.navn === "Påskedag")!.iso).not.toBe(
      helligdagRaekker(2026, "da").find((r) => r.navn === "Påskedag")!.iso
    );
  });

  // Midsommar och alla helgons dag styrdes av en veckodag, ikke en fast
  // kalenderdag, så de får inte kallas «Fast datum» i tabellen.
  test("svenska rörliga helgdagar är inte markerade som faste", () => {
    const raekker = helligdagRaekker(2026, "se");
    const ikkeFaste = raekker.filter((r) => !r.fast).map((r) => r.navn);
    expect(ikkeFaste).toEqual([
      "Långfredagen",
      "Påskdagen",
      "Annandag påsk",
      "Kristi himmelsfärdsdag",
      "Pingstdagen",
      "Midsommarafton",
      "Midsommardagen",
      "Alla helgons dag",
    ]);
    for (const navn of ["Midsommarafton", "Midsommardagen", "Alla helgons dag"]) {
      expect(raekker.find((r) => r.navn === navn)!.fast, navn).toBe(false);
    }
    for (const navn of ["Nyårsdagen", "Julafton", "Juldagen", "Nyårsafton"]) {
      expect(raekker.find((r) => r.navn === navn)!.fast, navn).toBe(true);
    }
  });

  test("hvert link til en «dage til»-side findes i /dage-til", () => {
    for (const locale of ["da", "se"] as const) {
      const slugs = getDageTilSlugs(locale);
      for (const year of [2026, 2027]) {
        for (const rad of helligdagRaekker(year, locale)) {
          if (rad.dageTilSlug === null) continue;
          expect(slugs, `${locale} ${rad.navn}`).toContain(rad.dageTilSlug);
        }
      }
    }
  });

  test("næste helligdage fra 9. oktober 2026 er juleaftensdag", () => {
    const naeste = naesteHelligdage(FRA, "da", 3);
    expect(naeste.map((r) => r.navn)).toEqual([
      "Juleaftensdag",
      "Juledag",
      "2. juledag",
    ]);
    expect(naeste.map((r) => r.dageTil)).toEqual([76, 77, 78]);
    expect(naeste[0].datoTekst).toBe("24. december 2026");
  });

  test("listen kører over årsskiftet", () => {
    const naeste = naesteHelligdage(new Date(2026, 11, 30, 12, 0, 0), "da", 2);
    expect(naeste.map((r) => r.navn)).toEqual(["Nytårsdag", "Palmesøndag"]);
    expect(naeste[0].iso).toBe("2027-01-01");
    expect(naeste[1].iso.startsWith("2027-03")).toBe(true);
  });

  test("en helligdag der falder i dag har 0 dage til sig", () => {
    const naeste = naesteHelligdage(new Date(2026, 11, 24, 1, 0, 0), "da", 1);
    expect(naeste[0].navn).toBe("Juleaftensdag");
    expect(naeste[0].dageTil).toBe(0);
  });

  test("stierne er adskilt pr. sprog, og norsk er ikke i drift", () => {
    expect(getHelligdagPath("da")).toBe("/helligdage");
    expect(getHelligdagPath("se")).toBe("/helgdagar");
    expect(getHelligdagPath("no")).toBeNull();
    expect(getHelligdagPath("en")).toBeNull();
  });
});
