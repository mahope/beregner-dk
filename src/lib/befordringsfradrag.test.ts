import { describe, test, expect } from "vitest";
import { beregnBefordringsfradrag } from "./befordringsfradrag";

const base = () => ({
  kmPerDag: 60,
  arbejdsdagePerAar: 225,
  yderkommune: false,
  broStorebaeltTureAar: 0,
  broOeresundTureAar: 0,
  broOffentlig: false,
  indkomstFørAms: 300000,
});

describe("beregnBefordringsfradrag", () => {
  test("returns null for negative km", () => {
    expect(beregnBefordringsfradrag({ ...base(), kmPerDag: -1 })).toBeNull();
  });

  test("returns null for negative arbejdsdage", () => {
    expect(beregnBefordringsfradrag({ ...base(), arbejdsdagePerAar: -1 })).toBeNull();
  });

  test("returns null for arbejdsdage over 365", () => {
    expect(beregnBefordringsfradrag({ ...base(), arbejdsdagePerAar: 366 })).toBeNull();
  });

  test("returns null for negative income", () => {
    expect(beregnBefordringsfradrag({ ...base(), indkomstFørAms: -1 })).toBeNull();
  });

  test("zero fradrag when under 24 km", () => {
    const r = beregnBefordringsfradrag({ ...base(), kmPerDag: 12 })!;
    expect(r.fradraegPerAar).toBe(0);
    expect(r.note).toBeTruthy();
  });

  test("24 km gives no fradrag (bundgrænse)", () => {
    const r = beregnBefordringsfradrag({ ...base(), kmPerDag: 24 })!;
    expect(r.fradraegPerAar).toBe(0);
  });

  test("60 km standard: 36 km × 3,17 kr × 225 dage", () => {
    const r = beregnBefordringsfradrag(base())!;
    const expected = 36 * 3.17 * 225;
    expect(r.almFradragPerAar).toBeCloseTo(expected, 0);
    expect(r.ekstraFradragPerAar).toBeGreaterThan(0);
  });

  test("150 km: 96 km × 3,17 + 30 km × 1,59 × 225", () => {
    const r = beregnBefordringsfradrag({ ...base(), kmPerDag: 150 })!;
    const expected = (96 * 3.17 + 30 * 1.59) * 225;
    expect(r.almFradragPerAar).toBeCloseTo(expected, 0);
  });

  test("yderkommune uses 3,51 kr/km for all", () => {
    const r = beregnBefordringsfradrag({ ...base(), yderkommune: true })!;
    const expected = 36 * 3.51 * 225;
    expect(r.almFradragPerAar).toBeCloseTo(expected, 0);
    expect(r.note).toBeTruthy();
  });

  test("yderkommune over 120 km uses 3,51 for all km", () => {
    const r = beregnBefordringsfradrag({ ...base(), kmPerDag: 150, yderkommune: true })!;
    const expected = 126 * 3.51 * 225;
    expect(r.almFradragPerAar).toBeCloseTo(expected, 0);
  });

  test("Storebæltsbro tilføjes pr. tur", () => {
    const r = beregnBefordringsfradrag({ ...base(), broStorebaeltTureAar: 100 })!;
    expect(r.almFradragPerAar).toBeCloseTo(36 * 3.17 * 225 + 100 * 110, 0);
  });

  test("bro offentlig transport uses lower sats", () => {
    const r = beregnBefordringsfradrag({ ...base(), broStorebaeltTureAar: 100, broOffentlig: true })!;
    expect(r.almFradragPerAar).toBeCloseTo(36 * 3.17 * 225 + 100 * 15, 0);
  });

  test("Øresundsbro tilføjes", () => {
    const r = beregnBefordringsfradrag({ ...base(), broOeresundTureAar: 100 })!;
    expect(r.almFradragPerAar).toBeCloseTo(36 * 3.17 * 225 + 100 * 50, 0);
  });

  test("begge broer kan kombineres", () => {
    const r = beregnBefordringsfradrag({ ...base(), broStorebaeltTureAar: 50, broOeresundTureAar: 50 })!;
    expect(r.almFradragPerAar).toBeCloseTo(36 * 3.17 * 225 + 50 * 110 + 50 * 50, 0);
  });

  test("ekstra fradrag max at low income", () => {
    const r = beregnBefordringsfradrag({ ...base(), indkomstFørAms: 200000 })!;
    expect(r.ekstraFradragPerAar).toBe(30800);
  });

  test("ekstra fradrag phases out at income near threshold", () => {
    const r = beregnBefordringsfradrag({ ...base(), indkomstFørAms: 370000 })!;
    expect(r.ekstraFradragPerAar).toBeGreaterThan(0);
    expect(r.ekstraFradragPerAar).toBeLessThan(30800);
  });

  test("no ekstra fradrag at or above income threshold", () => {
    const r = beregnBefordringsfradrag({ ...base(), indkomstFørAms: 391500 })!;
    expect(r.ekstraFradragPerAar).toBe(0);
  });

  test("skattevaerdi is computed as fradrag × kommuneskat", () => {
    const r = beregnBefordringsfradrag(base())!;
    const expected = r.fradraegPerAar * 0.2507;
    expect(r.skattevaerdi).toBeCloseTo(expected, 0);
  });

  test("0 arbejdsdage giver 0 fradrag", () => {
    const r = beregnBefordringsfradrag({ ...base(), arbejdsdagePerAar: 0 })!;
    expect(r.almFradragPerAar).toBe(0);
  });
});