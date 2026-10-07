import { describe, test, expect } from "vitest";
import {
  MAANEDER_IAAR,
  STANDARD_BATTERI_KWH,
  STANDARD_LADNING_NU_PCT,
  STANDARD_LADNING_TIL_PCT,
  beregnElbilLading,
  elbilLadingStandard,
} from "./elbil-lading";
import { ELBIL_FORUDSETNINGER } from "./braendstof";

describe("elbilLadingStandard", () => {
  test("læser elpris og forbrug fra ELBIL_FORUDSETNINGER", () => {
    const da = elbilLadingStandard("da");
    expect(da.elpris).toBe(ELBIL_FORUDSETNINGER.da.elKwhPris);
    expect(da.forbrugKwh100km).toBe(ELBIL_FORUDSETNINGER.da.elKwhPer100km);
    const se = elbilLadingStandard("se");
    expect(se.elpris).toBe(ELBIL_FORUDSETNINGER.se.elKwhPris);
    expect(se.forbrugKwh100km).toBe(ELBIL_FORUDSETNINGER.se.elKwhPer100km);
  });

  test("månedskørsel er årskørselen delt på 12", () => {
    const da = elbilLadingStandard("da");
    expect(da.kmPrMaaned).toBe(Math.round(ELBIL_FORUDSETNINGER.da.kmPrAar / MAANEDER_IAAR));
  });

  test("standardintervallet er 20 til 80 procent af 60 kWh", () => {
    const da = elbilLadingStandard("da");
    expect(da.batteriKwh).toBe(STANDARD_BATTERI_KWH);
    expect(da.ladningNuPct).toBe(STANDARD_LADNING_NU_PCT);
    expect(da.ladningTilPct).toBe(STANDARD_LADNING_TIL_PCT);
  });
});

describe("beregnElbilLading", () => {
  test("60 kWh fra 20 til 80 procent ved 2,5 kr/kWh koster 90 kr", () => {
    const r = beregnElbilLading({
      batteriKwh: 60,
      ladningNuPct: 20,
      ladningTilPct: 80,
      elpris: 2.5,
      forbrugKwh100km: 18,
      kmPrMaaned: 1250,
    })!;
    expect(r.kwhTilOpladning).toBeCloseTo(36, 9);
    expect(r.prisForOpladning).toBeCloseTo(90, 9);
  });

  test("pris pr. 100 km er forbrug gange elpris", () => {
    const r = beregnElbilLading({
      batteriKwh: 60,
      ladningNuPct: 20,
      ladningTilPct: 80,
      elpris: 2.5,
      forbrugKwh100km: 18,
      kmPrMaaned: 1250,
    })!;
    expect(r.prisPr100km).toBeCloseTo(45, 9);
    expect(r.prisPrKm).toBeCloseTo(0.45, 9);
  });

  test("månedlig omkostning følger af kørsel og forbrug", () => {
    const r = beregnElbilLading({
      batteriKwh: 60,
      ladningNuPct: 20,
      ladningTilPct: 80,
      elpris: 2.5,
      forbrugKwh100km: 18,
      kmPrMaaned: 1250,
    })!;
    expect(r.kwhPrMaaned).toBeCloseTo(225, 9);
    expect(r.maanedligPris).toBeCloseTo(562.5, 9);
  });

  test("svenske standardværdier giver 72 kr for samme interval", () => {
    const r = beregnElbilLading(elbilLadingStandard("se"))!;
    expect(r.kwhTilOpladning).toBeCloseTo(36, 9);
    expect(r.prisForOpladning).toBeCloseTo(72, 9);
  });

  test("en procentdel af batteriet er intervallet gange kapaciteten", () => {
    const r = beregnElbilLading({
      batteriKwh: 75,
      ladningNuPct: 10,
      ladningTilPct: 60,
      elpris: 3,
      forbrugKwh100km: 20,
      kmPrMaaned: 1000,
    })!;
    expect(r.kwhTilOpladning).toBeCloseTo(37.5, 9);
    expect(r.prisForOpladning).toBeCloseTo(112.5, 9);
  });

  test("tomt eller negativt input giver null", () => {
    const grundlag = elbilLadingStandard("da");
    expect(beregnElbilLading({ ...grundlag, batteriKwh: -1 })).toBeNull();
    expect(beregnElbilLading({ ...grundlag, elpris: Number.NaN })).toBeNull();
    expect(beregnElbilLading({ ...grundlag, forbrugKwh100km: Number.POSITIVE_INFINITY })).toBeNull();
  });

  test("slutladning under startladning eller over 100 giver null", () => {
    const grundlag = elbilLadingStandard("da");
    expect(beregnElbilLading({ ...grundlag, ladningTilPct: 20 })).toBeNull();
    expect(beregnElbilLading({ ...grundlag, ladningTilPct: 10 })).toBeNull();
    expect(beregnElbilLading({ ...grundlag, ladningTilPct: 120 })).toBeNull();
  });

  test("fuld opladning fra 0 til 100 procent er hele batteriet", () => {
    const r = beregnElbilLading({
      batteriKwh: 60,
      ladningNuPct: 0,
      ladningTilPct: 100,
      elpris: 2.5,
      forbrugKwh100km: 18,
      kmPrMaaned: 1250,
    })!;
    expect(r.kwhTilOpladning).toBeCloseTo(60, 9);
    expect(r.prisForOpladning).toBeCloseTo(150, 9);
  });
});
