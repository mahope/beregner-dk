import { describe, test, expect } from "vitest";
import { beregnPace, beregnSplits, beregnTid, formaterLobetid } from "./pace";
import { formatSekunder } from "./tidsberegner";

const sum = (tal: number[]) => tal.reduce((a, b) => a + b, 0);

describe("beregnPace", () => {
  test("tempo fra tid: 5 km på 25 minutter er 5:00 pr. kilometer", () => {
    const r = beregnPace("tid", 5, 25 * 60, 0)!;
    expect(r.totalSek).toBe(1500);
    expect(r.sekunderPerKm).toBe(300);
    expect(formatSekunder(r.sekunderPerKm)).toBe("5:00");
  });

  test("tid fra tempo: 5 km ved 5:00 pr. kilometer er 25 minutter", () => {
    const r = beregnPace("tempo", 5, 0, 300)!;
    expect(r.totalSek).toBe(1500);
    expect(r.sekunderPerKm).toBe(300);
  });

  test("de to veje er hinandens modsætning", () => {
    const fraTid = beregnPace("tid", 10, 45 * 60, 0)!;
    const fraTempo = beregnPace("tempo", 10, 0, fraTid.sekunderPerKm)!;
    expect(fraTempo.totalSek).toBe(fraTid.totalSek);
  });

  test("en halvmarahton på 1:45 er 4:59 pr. kilometer", () => {
    // Samme tal som /tidsberegners egen FAQ, så de to sider ikke modsiger
    // hinanden om den samme løbetid.
    const r = beregnPace("tid", 21.0975, 105 * 60, 0)!;
    expect(r.sekunderPerKm).toBe(299);
    expect(formatSekunder(r.sekunderPerKm)).toBe("4:59");
  });

  test("splits for en halvmarahton summerer til den samlede tid", () => {
    const r = beregnPace("tid", 21.0975, 105 * 60, 0)!;
    expect(r.splits).toHaveLength(22);
    expect(sum(r.splits)).toBe(r.totalSek);
  });

  test("10 km på 45 minutter giver ti lige splits på 270 sekunder", () => {
    const r = beregnPace("tid", 10, 45 * 60, 0)!;
    expect(r.splits).toEqual([270, 270, 270, 270, 270, 270, 270, 270, 270, 270]);
    expect(sum(r.splits)).toBe(2700);
  });

  test("en halv kilometer giver ét split, fordi der ikke er nogen hel kilometer", () => {
    const r = beregnPace("tid", 0.5, 3 * 60, 0)!;
    expect(r.splits).toEqual([180]);
    expect(r.sekunderPerKm).toBe(360);
  });

  test("et maraton på 3:30 er 4:59 pr. kilometer", () => {
    const r = beregnPace("tid", 42.195, 3.5 * 3600, 0)!;
    expect(r.totalSek).toBe(12600);
    expect(formatSekunder(r.sekunderPerKm)).toBe("4:59");
  });

  test("et umuligt svar giver null, ikke NaN", () => {
    expect(beregnPace("tid", 0, 25 * 60, 0)).toBeNull();
    expect(beregnPace("tid", -5, 25 * 60, 0)).toBeNull();
    expect(beregnPace("tid", 5, 0, 0)).toBeNull();
    expect(beregnPace("tid", 5, -600, 0)).toBeNull();
    expect(beregnPace("tempo", 5, 0, 0)).toBeNull();
    expect(beregnPace("tempo", 5, 0, -300)).toBeNull();
    expect(beregnPace("tid", Number.NaN, 600, 0)).toBeNull();
    expect(beregnPace("tid", 5, Number.NaN, 0)).toBeNull();
    expect(beregnPace("tempo", 5, 0, Number.NaN)).toBeNull();
  });

  test("et meget langsomt løb er stadig et svar, ikke en fejl", () => {
    // 20:00 pr. kilometer er langsommere end nogen løber, men talleriet skal
    // stadig kunne vise det, så tidsberegneren ikke springer til en fejlside.
    const r = beregnPace("tempo", 1, 0, 20 * 60)!;
    expect(r.totalSek).toBe(1200);
    expect(r.sekunderPerKm).toBe(1200);
    expect(formatSekunder(r.sekunderPerKm)).toBe("20:00");
    expect(formaterLobetid(r.totalSek)).toBe("20:00");
  });
});

describe("formaterLobetid", () => {
  test("under en time vises som minutter og sekunder", () => {
    expect(formaterLobetid(0)).toBe("0:00");
    expect(formaterLobetid(299)).toBe("4:59");
    expect(formaterLobetid(3599)).toBe("59:59");
  });

  test("over en time får timer med, fordi en marathons tid ikke kan skrives som 210:16", () => {
    expect(formaterLobetid(3600)).toBe("1:00:00");
    expect(formaterLobetid(12600)).toBe("3:30:00");
    expect(formaterLobetid(beregnTid(42.195, 299)!)).toBe("3:30:16");
  });

  test("sekunder med decimaler rundes, og negative tal går til 0:00", () => {
    expect(formaterLobetid(299.4)).toBe("4:59");
    expect(formaterLobetid(299.6)).toBe("5:00");
    expect(formaterLobetid(-10)).toBe("0:00");
  });
});

describe("beregnTid", () => {
  test("5 km ved 5:00 pr. kilometer er 1500 sekunder", () => {
    expect(beregnTid(5, 300)).toBe(1500);
  });

  test("et maraton ved 4:59 pr. kilometer er 3:30:16", () => {
    
  });

  test("nul og negative værdier giver null", () => {
    expect(beregnTid(0, 300)).toBeNull();
    expect(beregnTid(5, 0)).toBeNull();
    expect(beregnTid(-5, 300)).toBeNull();
    expect(beregnTid(Number.POSITIVE_INFINITY, 300)).toBeNull();
  });
});

describe("beregnSplits", () => {
  test("splits for 10 km på 45 minutter summerer til 2700 sekunder", () => {
    const splits = beregnSplits(10, 2700);
    expect(splits).toHaveLength(10);
    expect(sum(splits)).toBe(2700);
  });

  test("et ikke-helt antal kilometer giver én ekstra, kortere split", () => {
    // 5,5 km på 27:30 er 5 hele kilometer på 300 sekunder og en halv på 150.
    const splits = beregnSplits(5.5, 1650);
    expect(splits).toEqual([300, 300, 300, 300, 300, 150]);
    expect(sum(splits)).toBe(1650);
  });

  test("summen holder for alle distancer i intervallet, også dem der kræver afrunding", () => {
    for (let d = 0.1; d <= 42.5; d += 0.1) {
      for (const total of [61, 125, 599, 1234, 2700, 12600]) {
        expect(sum(beregnSplits(d, total))).toBe(total);
      }
    }
  });

  test("et umuligt svar giver en tom liste", () => {
    expect(beregnSplits(0, 2700)).toEqual([]);
    expect(beregnSplits(10, 0)).toEqual([]);
    expect(beregnSplits(-10, 2700)).toEqual([]);
    expect(beregnSplits(Number.NaN, 2700)).toEqual([]);
    expect(beregnSplits(10, Number.NaN)).toEqual([]);
  });
});