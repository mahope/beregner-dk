import { describe, it, expect } from "vitest";
import {
  PLUS_TID_EKSEMPLER,
  formatKlokkeslaet,
  plusTid,
  summerTidsrum,
} from "./plus-tid";

describe("plusTid", () => {
  it("lægger hele timer på et klokkeslæt i samme døgn", () => {
    const r = plusTid({ klokkeslaet: "09:00", timer: 8, minutter: 0 });
    expect(r?.klokkeslaet).toBe("17:00");
    expect(r?.heleDage).toBe(0);
    expect(r?.overMidnat).toBe(false);
    expect(r?.totalMinutter).toBe(480);
    expect(r?.decimalTimer).toBe(8);
  });

  it("regner timer og minutter sammen, ikke hver for sig", () => {
    const r = plusTid({ klokkeslaet: "07:15", timer: 0, minutter: 50 });
    expect(r?.klokkeslaet).toBe("08:05");
    expect(r?.decimalTimer).toBeCloseTo(50 / 60, 10);
  });

  it("lægger 2 timer og 45 minutter på, når de krydser midnat", () => {
    const r = plusTid({ klokkeslaet: "22:30", timer: 2, minutter: 45 });
    expect(r?.klokkeslaet).toBe("01:15");
    expect(r?.timer).toBe(1);
    expect(r?.minutter).toBe(15);
    expect(r?.heleDage).toBe(1);
    expect(r?.overMidnat).toBe(true);
  });

  it("giver præcis 00:00 og én hel dag ved 12 timer over 12:00", () => {
    const r = plusTid({ klokkeslaet: "12:00", timer: 12, minutter: 0 });
    expect(r?.klokkeslaet).toBe("00:00");
    expect(r?.heleDage).toBe(1);
  });

  it("tæller 16 timer på 16:00 som døgnet efter", () => {
    const r = plusTid({ klokkeslaet: "16:00", timer: 16, minutter: 0 });
    expect(r?.klokkeslaet).toBe("08:00");
    expect(r?.heleDage).toBe(1);
  });

  it("trækker 8 timer fra 23:30 og lander i dagen før", () => {
    const r = plusTid({ klokkeslaet: "23:30", timer: -8, minutter: 0 });
    expect(r?.klokkeslaet).toBe("15:30");
    expect(r?.heleDage).toBe(0);
    expect(r?.totalMinutter).toBe(-480);
    expect(r?.decimalTimer).toBe(-8);
  });

  it("tager modulo uden at give et negativt klokkeslæt", () => {
    // 06:00 minus 8 timer er -120 minutter før midnat. En ren % giver -120,
    // som formatteres til "-2:00" — altså ikke et klokkeslæt.
    const r = plusTid({ klokkeslaet: "06:00", timer: -8, minutter: 0 });
    expect(r?.klokkeslaet).toBe("22:00");
    expect(r?.timer).toBe(22);
    expect(r?.minutter).toBe(0);
    expect(r?.heleDage).toBe(-1);
  });

  it("regner flere dage frem", () => {
    const r = plusTid({ klokkeslaet: "00:00", timer: 49, minutter: 30 });
    expect(r?.klokkeslaet).toBe("01:30");
    expect(r?.heleDage).toBe(2);
  });

  it("lader minutter alene være negative", () => {
    const r = plusTid({ klokkeslaet: "10:00", timer: 0, minutter: -45 });
    expect(r?.klokkeslaet).toBe("09:15");
    expect(r?.heleDage).toBe(0);
  });

  it("behandler en udfyldt time-felt som 0 minutter", () => {
    const r = plusTid({ klokkeslaet: "10:00", timer: 0 });
    expect(r?.klokkeslaet).toBe("10:00");
  });

  it("afviser klokkeslæt der ikke findes", () => {
    for (const klokkeslaet of ["24:00", "12:60", "9:5", "abc", "", "12", "12:00:00", "-1:00"]) {
      expect(plusTid({ klokkeslaet, timer: 8, minutter: 0 })).toBeNull();
    }
  });

  it("afviser tal der ikke er heltal", () => {
    expect(plusTid({ klokkeslaet: "09:00", timer: 1.5, minutter: 0 })).toBeNull();
    expect(plusTid({ klokkeslaet: "09:00", timer: Number.NaN, minutter: 0 })).toBeNull();
    expect(plusTid({ klokkeslaet: "09:00", timer: 1, minutter: Infinity })).toBeNull();
  });

  it("regner alle eksemplerne uden at fejle", () => {
    for (const eksempel of PLUS_TID_EKSEMPLER) {
      const r = plusTid(eksempel);
      expect(r, eksempel.id).not.toBeNull();
      expect(r!.klokkeslaet, eksempel.id).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  it("kender præcis resultatet af hvert eksempel", () => {
    const laeg = Object.fromEntries(
      PLUS_TID_EKSEMPLER.map((e) => [e.id, plusTid(e)!.klokkeslaet]),
    );
    expect(laeg).toEqual({
      plus8: "17:00",
      plus12: "00:00",
      plus16: "08:00",
      plus2t45: "01:15",
      minus8: "15:30",
      minus8natt: "18:30",
      plus50: "08:05",
    });
  });

  it("har mindst ét eksempel med hele dage og ét med minus", () => {
    const heleDage = PLUS_TID_EKSEMPLER.filter((e) => plusTid(e)!.heleDage !== 0);
    const minus = PLUS_TID_EKSEMPLER.filter((e) => plusTid(e)!.totalMinutter < 0);
    const baglaens = PLUS_TID_EKSEMPLER.filter((e) => plusTid(e)!.heleDage < 0);
    expect(heleDage.length).toBeGreaterThan(0);
    expect(minus.length).toBeGreaterThan(0);
    expect(baglaens.length).toBeGreaterThan(0);
  });
});

describe("formatKlokkeslaet", () => {
  it("sætter nuller foran timer og minutter", () => {
    expect(formatKlokkeslaet(0)).toBe("00:00");
    expect(formatKlokkeslaet(615)).toBe("10:15");
    expect(formatKlokkeslaet(1439)).toBe("23:59");
  });
});

describe("summerTidsrum", () => {
  it("lægger to tidsrum sammen", () => {
    const r = summerTidsrum([
      { startTid: "08:00", slutTid: "16:00" },
      { startTid: "16:00", slutTid: "18:30" },
    ]);
    expect(r?.timer).toBe(10);
    expect(r?.minutter).toBe(30);
    expect(r?.totalMinutter).toBe(630);
    expect(r?.gyldige).toBe(2);
    expect(r?.springteOver).toBe(0);
  });

  it("tæller et rum der støder op mod næste døgn som de otte timer det er", () => {
    const r = summerTidsrum([{ startTid: "22:00", slutTid: "06:00" }]);
    expect(r?.timer).toBe(8);
    expect(r?.totalMinutter).toBe(480);
  });

  it("trækker en pause på over en time fra, før summen regnes", () => {
    // 22:00-06:00 er 480 minutter, minus 90 minutters pause = 390 = 6:30.
    // Trækkes der efter i stedet for inden, bliver det 7:30 — den fejl
    // teksten på siden kalder den fælde, der tager flest.
    const r = summerTidsrum([{ startTid: "22:00", slutTid: "06:00", fratraekPause: 90 }]);
    expect(r?.timer).toBe(6);
    expect(r?.minutter).toBe(30);
  });

  it("springer et ugyldigt rum over og tæller det", () => {
    const r = summerTidsrum([
      { startTid: "08:00", slutTid: "16:00" },
      { startTid: "", slutTid: "" },
      { startTid: "12:00", slutTid: "25:00" },
    ]);
    expect(r?.timer).toBe(8);
    expect(r?.gyldige).toBe(1);
    expect(r?.springteOver).toBe(2);
  });

  it("regner døgn og decimaltimer", () => {
    const r = summerTidsrum([
      { startTid: "08:00", slutTid: "20:00" },
      { startTid: "08:00", slutTid: "20:00" },
      { startTid: "08:00", slutTid: "20:00" },
    ]);
    expect(r?.totalMinutter).toBe(2160);
    expect(r?.decimalTimer).toBe(36);
    expect(r?.heleDoegn).toBeCloseTo(1.5, 10);
  });

  it("giver null når intet kan regnes", () => {
    expect(summerTidsrum([])).toBeNull();
    expect(
      summerTidsrum([
        { startTid: "xx", slutTid: "yy" },
      ]),
    ).toBeNull();
  });
});