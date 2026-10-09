import { describe, expect, it } from "vitest";
import {
  AEGLOESNING_DAGE,
  GRAVIDITET_DAGE,
  MAKS_GRAVIDITET_DAGE,
  beregnGraviditetsuge,
  plusDage,
} from "./graviditetsuge";

describe("plusDage", () => {
  it("flytter over måneds- og årsskift", () => {
    expect(plusDage("2026-01-31", 1)).toBe("2026-02-01");
    expect(plusDage("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("regner skuddagen med", () => {
    expect(plusDage("2024-02-28", 1)).toBe("2024-02-29");
    expect(plusDage("2024-02-29", 1)).toBe("2024-03-01");
  });

  it("giver null for en ugyldig dato", () => {
    expect(plusDage("2026-02-30", 1)).toBeNull();
    expect(plusDage("ikke-en-dato", 1)).toBeNull();
  });
});

describe("beregnGraviditetsuge", () => {
  // Første dag i sidste menstruation 1. januar 2026 giver termin 8. oktober
  // 2026 (280 dage) og ægløsning 15. januar (dag 14).
  const reference = "2026-06-25";

  it("regner ugen fra sidste menstruation", () => {
    const r = beregnGraviditetsuge({ kind: "sidsteMens", dato: "2026-01-01" }, reference);
    expect(r).not.toBeNull();
    expect(r).toMatchObject({
      uger: 25,
      dage: 0,
      totalDage: 175,
      termin: "2026-10-08",
      undfangelse: "2026-01-15",
      sidsteMens: "2026-01-01",
      trimester: 2,
      dageTilTermin: GRAVIDITET_DAGE - 175,
      procent: 63,
    });
  });

  it("giver samme svar fra terminsdatoen — den er den omvendte vej", () => {
    const fraMens = beregnGraviditetsuge({ kind: "sidsteMens", dato: "2026-01-01" }, reference);
    const fraTermin = beregnGraviditetsuge({ kind: "termin", dato: "2026-10-08" }, reference);
    expect(fraTermin).toEqual(fraMens);
  });

  it("giver samme svar fra undfangelsesdatoen", () => {
    const fraMens = beregnGraviditetsuge({ kind: "sidsteMens", dato: "2026-01-01" }, reference);
    const fraUndfangelse = beregnGraviditetsuge(
      { kind: "undfangelse", dato: "2026-01-15" },
      reference
    );
    expect(fraUndfangelse).toEqual(fraMens);
  });

  it("regner ægløsningen som dag 14 af graviditeten", () => {
    const r = beregnGraviditetsuge({ kind: "undfangelse", dato: "2026-01-15" }, "2026-01-15");
    expect(r?.totalDage).toBe(AEGLOESNING_DAGE);
    expect(r?.undfangelse).toBe("2026-01-15");
  });

  it("skifter trimester ved uge 13 og 27, som /termin", () => {
    const ved = (dato: string) =>
      beregnGraviditetsuge({ kind: "sidsteMens", dato: "2026-01-01" }, dato)?.trimester;
    expect(ved("2026-03-26")).toBe(1); // uge 12+0
    expect(ved("2026-04-02")).toBe(2); // uge 13+0
    expect(ved("2026-07-02")).toBe(2); // uge 26+0
    expect(ved("2026-07-09")).toBe(3); // uge 27+0
  });

  it("tæller dage og uger rigtigt midt i en uge", () => {
    const r = beregnGraviditetsuge({ kind: "sidsteMens", dato: "2026-01-01" }, "2026-06-28");
    expect(r).toMatchObject({ uger: 25, dage: 3, totalDage: 178 });
  });

  it("regner over skuddagen", () => {
    const r = beregnGraviditetsuge({ kind: "sidsteMens", dato: "2024-02-29" }, "2024-06-01");
    expect(r?.termin).toBe("2024-12-05");
    expect(r?.undfangelse).toBe("2024-03-14");
  });

  it("tæller kalenderdage over sommer-/vintertidsskiftet", () => {
    // 20. marts til 20. november 2026 krydser begge skift, men er 245 hele dage.
    const r = beregnGraviditetsuge({ kind: "sidsteMens", dato: "2026-03-20" }, "2026-11-20");
    expect(r?.totalDage).toBe(245);
    expect(r).toMatchObject({ uger: 35, dage: 0 });
  });

  it("giver null når reference-datoen ligger før undfangelsen", () => {
    expect(
      beregnGraviditetsuge({ kind: "sidsteMens", dato: "2026-01-01" }, "2025-12-31")
    ).toBeNull();
  });

  it("giver null når graviditeten ville være over 45 uger", () => {
    const forSent = plusDage("2026-01-01", MAKS_GRAVIDITET_DAGE + 1)!;
    expect(
      beregnGraviditetsuge({ kind: "sidsteMens", dato: "2026-01-01" }, forSent)
    ).toBeNull();
    const grænsen = plusDage("2026-01-01", MAKS_GRAVIDITET_DAGE)!;
    expect(
      beregnGraviditetsuge({ kind: "sidsteMens", dato: "2026-01-01" }, grænsen)
    ).not.toBeNull();
  });

  it("giver null for en ugyldig dato", () => {
    expect(beregnGraviditetsuge({ kind: "termin", dato: "2026-13-01" }, reference)).toBeNull();
    expect(beregnGraviditetsuge({ kind: "termin", dato: "2026-10-08" }, "2026-02-30")).toBeNull();
  });
});
