import { describe, expect, test } from "vitest";
import {
  beregnBarselsdagpenge,
  fordelBarselsUger,
  isBarselEmployment,
  isBarselParent,
} from "./barselsdagpenge";
import { estimerNettoMaaned } from "./barsel/netto";
import { BARSEL_2026 } from "./satser-2026";

describe("barsel shared-state validation", () => {
  test("accepts current employment and parent values", () => {
    expect(isBarselEmployment("fulltime")).toBe(true);
    expect(isBarselEmployment("parttime")).toBe(true);
    expect(isBarselEmployment("selfemployed")).toBe(true);
    expect(isBarselEmployment("unemployed")).toBe(true);
    expect(isBarselParent("mor")).toBe(true);
    expect(isBarselParent("far")).toBe(true);
  });

  test("rejects malformed legacy values", () => {
    expect(isBarselEmployment("contractor")).toBe(false);
    expect(isBarselEmployment(null)).toBe(false);
    expect(isBarselParent("other")).toBe(false);
    expect(isBarselParent(1)).toBe(false);
  });
});

describe("beregnBarselsdagpenge: validation", () => {
  test("returns null for invalid income, hours, or weeks", () => {
    expect(beregnBarselsdagpenge({ monthlyIncome: 0, weeklyHours: 37, weeks: 24 })).toBeNull();
    expect(beregnBarselsdagpenge({ monthlyIncome: -1, weeklyHours: 37, weeks: 24 })).toBeNull();
    expect(beregnBarselsdagpenge({ monthlyIncome: Number.NaN, weeklyHours: 37, weeks: 24 })).toBeNull();
    expect(beregnBarselsdagpenge({ monthlyIncome: 35000, weeklyHours: 0, weeks: 24 })).toBeNull();
    expect(beregnBarselsdagpenge({ monthlyIncome: 35000, weeklyHours: 41, weeks: 24 })).toBeNull();
    expect(beregnBarselsdagpenge({ monthlyIncome: 35000, weeklyHours: 37, weeks: 0 })).toBeNull();
    expect(beregnBarselsdagpenge({ monthlyIncome: 35000, weeklyHours: 37, weeks: 53 })).toBeNull();
    expect(beregnBarselsdagpenge({ monthlyIncome: 35000, weeklyHours: 37, weeks: 12.5 })).toBeNull();
  });

  test("rejects employer pay that does not fit the leave or the employment type", () => {
    const base = { monthlyIncome: 30000, weeklyHours: 37, weeks: 24 };
    expect(beregnBarselsdagpenge({ ...base, employerWeeks: 25 })).toBeNull();
    expect(beregnBarselsdagpenge({ ...base, employerWeeks: -1 })).toBeNull();
    expect(beregnBarselsdagpenge({ ...base, employerWeeks: 8, employerPercent: 0 })).toBeNull();
    expect(beregnBarselsdagpenge({ ...base, employerWeeks: 8, employerPercent: 101 })).toBeNull();
    expect(
      beregnBarselsdagpenge({ ...base, employment: "selfemployed", employerWeeks: 8 }),
    ).toBeNull();
  });
});

describe("beregnBarselsdagpenge: lønmodtager", () => {
  test("20.000 kr. pr. måned på 37 timer giver løn efter AM-bidrag, under loftet", () => {
    // 20.000 x 12 / 52 = 4.615,38 kr. om ugen; efter 8 % AM-bidrag 4.246,15 kr.
    const r = beregnBarselsdagpenge({ monthlyIncome: 20000, weeklyHours: 37, weeks: 24 })!;
    expect(r.weeklyRate).toBeCloseTo(4246.15, 2);
    expect(r.monthlyAmount).toBeCloseTo((4246.15 * 52) / 12, 1);
    expect(r.totalAmount).toBeCloseTo(4246.15 * 24, 0);
    expect(r.isHourlyRateCapped).toBe(false);
    expect(r.coveragePercent).toBeCloseTo(92, 5);
  });

  test("rammer maksimum 5.085 kr. om ugen fra ca. 23.950 kr. om måneden", () => {
    const over = beregnBarselsdagpenge({ monthlyIncome: 24000, weeklyHours: 37, weeks: 24 })!;
    expect(over.weeklyRate).toBeCloseTo(BARSEL_2026.maxWeeklyRate, 2);
    expect(over.isHourlyRateCapped).toBe(true);

    const under = beregnBarselsdagpenge({ monthlyIncome: 23500, weeklyHours: 37, weeks: 24 })!;
    expect(under.weeklyRate).toBeLessThan(BARSEL_2026.maxWeeklyRate);
    expect(under.isHourlyRateCapped).toBe(false);
  });

  test("højere løn giver ikke højere sats end maksimum", () => {
    const r = beregnBarselsdagpenge({ monthlyIncome: 80000, weeklyHours: 37, weeks: 24 })!;
    expect(r.weeklyRate).toBeCloseTo(BARSEL_2026.maxWeeklyRate, 2);
    expect(r.coveragePercent).toBeLessThan(50);
  });

  test("deltid på 20 timer: timeløn under loftet udbetales fuldt efter AM", () => {
    // 8.000 x 12 / 52 = 1.846,15 kr. om ugen; efter AM 1.698,46 kr. (84,92 kr. i timen)
    const r = beregnBarselsdagpenge({
      monthlyIncome: 8000,
      weeklyHours: 20,
      weeks: 10,
      employment: "parttime",
    })!;
    expect(r.weeklyRate).toBeCloseTo(1698.46, 2);
    expect(r.isHourlyRateCapped).toBe(false);
  });

  test("deltid på 20 timer: timeløn over 137,43 kr. rammer timeloftet", () => {
    // 15.000 kr. for 20 timer er 173 kr. i timen, 159 kr. efter AM, så loftet gælder.
    const r = beregnBarselsdagpenge({
      monthlyIncome: 15000,
      weeklyHours: 20,
      weeks: 24,
      employment: "parttime",
    })!;
    expect(r.weeklyRate).toBeCloseTo((BARSEL_2026.maxWeeklyRate / BARSEL_2026.fullTimeHours) * 20, 2);
    expect(r.isHourlyRateCapped).toBe(true);
  });

  test("fuldtid ignorerer timefeltet", () => {
    const a = beregnBarselsdagpenge({ monthlyIncome: 20000, weeklyHours: 10, weeks: 24 })!;
    const b = beregnBarselsdagpenge({ monthlyIncome: 20000, weeklyHours: 37, weeks: 24 })!;
    expect(a.weeklyRate).toBeCloseTo(b.weeklyRate, 6);
  });

  test("beløb efter skat bygger på samme skatteestimat som planlæggeren, uden AM-bidrag", () => {
    const r = beregnBarselsdagpenge({ monthlyIncome: 24000, weeklyHours: 37, weeks: 24 })!;
    const maanedFoerSkat = (BARSEL_2026.maxWeeklyRate * 52) / 12;
    const estimat = estimerNettoMaaned({ loen: 0, ydelse: maanedFoerSkat });
    expect(r.monthlyAmount).toBeCloseTo(maanedFoerSkat, 6);
    expect(r.monthlyAfterTax).toBeCloseTo(estimat.netto, 6);
    expect(estimat.amBidrag).toBe(0);
    expect(r.monthlyAfterTax).toBeLessThan(r.monthlyAmount);
    expect(r.totalAfterTax).toBeCloseTo((estimat.netto * 24 * 12) / 52, 4);
  });

  test("tabet er forskellen på nettoløn og netto-barselsdagpenge, aldrig negativt", () => {
    const r = beregnBarselsdagpenge({ monthlyIncome: 20000, weeklyHours: 37, weeks: 24 })!;
    const lon = estimerNettoMaaned({ loen: 20000, ydelse: 0 }).netto;
    expect(r.monthlyLoss).toBeCloseTo(lon - r.monthlyAfterTax, 6);
    expect(r.monthlyLoss).toBeGreaterThan(0);
  });
});

describe("beregnBarselsdagpenge: løn under barsel", () => {
  test("uger med fuld løn fra arbejdsgiveren erstatter dagpenge i de uger", () => {
    const uden = beregnBarselsdagpenge({ monthlyIncome: 30000, weeklyHours: 37, weeks: 24 })!;
    const med = beregnBarselsdagpenge({
      monthlyIncome: 30000,
      weeklyHours: 37,
      weeks: 24,
      employerWeeks: 14,
    })!;

    expect(med.employerWeeks).toBe(14);
    expect(med.benefitWeeks).toBe(10);
    // Udbetaling Danmark betaler kun for de 10 uger uden løn.
    expect(med.totalAmount).toBeCloseTo(med.weeklyRate * 10, 6);
    expect(med.weeklyRate).toBeCloseTo(uden.weeklyRate, 6);
    expect(med.totalAfterTax).toBeGreaterThan(uden.totalAfterTax);
    expect(med.employerMonthlyAfterTax).toBeCloseTo(
      estimerNettoMaaned({ loen: 30000, ydelse: 0 }).netto,
      6,
    );
  });

  test("gennemsnittet pr. måned er vægtet efter ugerne med løn og dagpenge", () => {
    const r = beregnBarselsdagpenge({
      monthlyIncome: 30000,
      weeklyHours: 37,
      weeks: 26,
      employerWeeks: 13,
    })!;
    // Halvdelen af ugerne med løn og halvdelen med dagpenge: gennemsnittet er midt imellem.
    expect(r.averageMonthlyAfterTax).toBeCloseTo(
      (r.employerMonthlyAfterTax + r.monthlyAfterTax) / 2,
      6,
    );
  });

  test("løn i alle uger giver ingen dagpenge og fuld nettoløn", () => {
    const r = beregnBarselsdagpenge({
      monthlyIncome: 30000,
      weeklyHours: 37,
      weeks: 12,
      employerWeeks: 12,
    })!;
    expect(r.benefitWeeks).toBe(0);
    expect(r.totalAmount).toBe(0);
    expect(r.averageMonthlyAfterTax).toBeCloseTo(r.employerMonthlyAfterTax, 6);
  });

  test("delvis løn giver den andel af lønnen, ikke fuld løn", () => {
    const fuld = beregnBarselsdagpenge({
      monthlyIncome: 30000, weeklyHours: 37, weeks: 10, employerWeeks: 10,
    })!;
    const delvis = beregnBarselsdagpenge({
      monthlyIncome: 30000, weeklyHours: 37, weeks: 10, employerWeeks: 10, employerPercent: 80,
    })!;
    expect(delvis.employerMonthlyAfterTax).toBeLessThan(fuld.employerMonthlyAfterTax);
    expect(delvis.employerMonthlyAfterTax).toBeCloseTo(
      estimerNettoMaaned({ loen: 24000, ydelse: 0 }).netto,
      6,
    );
  });

  test("delvis løn under dagpengene giver aldrig mindre end dagpengene (§ 39)", () => {
    const r = beregnBarselsdagpenge({
      monthlyIncome: 30000, weeklyHours: 37, weeks: 10, employerWeeks: 10, employerPercent: 50,
    })!;
    expect(r.employerMonthlyAfterTax).toBeCloseTo(r.monthlyAfterTax, 6);
    expect(r.monthlyLoss).toBeCloseTo(
      Math.max(0, estimerNettoMaaned({ loen: 30000, ydelse: 0 }).netto - r.monthlyAfterTax),
      6,
    );
  });

  test("fuld løn i alle uger giver ingen indkomstnedgang og fuld dækning", () => {
    const r = beregnBarselsdagpenge({
      monthlyIncome: 30000, weeklyHours: 37, weeks: 12, employerWeeks: 12,
    })!;
    expect(r.monthlyLoss).toBeCloseTo(0, 6);
    expect(r.coveragePercent).toBe(100);
  });
});

describe("beregnBarselsdagpenge: selvstændig og ledig", () => {
  test("selvstændig: overskud pr. uge op til maksimum", () => {
    // 15.000 x 12 / 52 = 3.461,54 kr. om ugen
    const r = beregnBarselsdagpenge({
      monthlyIncome: 15000, weeklyHours: 37, weeks: 24, employment: "selfemployed",
    })!;
    expect(r.weeklyRate).toBeCloseTo(3461.54, 2);
    expect(r.isWeeklyRateCapped).toBe(false);
    expect(r.isHourlyRateCapped).toBe(false);
  });

  test("selvstændig: højt overskud giver maksimum og markeres som afkortet", () => {
    const r = beregnBarselsdagpenge({
      monthlyIncome: 40000, weeklyHours: 37, weeks: 24, employment: "selfemployed",
    })!;
    expect(r.weeklyRate).toBe(BARSEL_2026.maxWeeklyRate);
    expect(r.isWeeklyRateCapped).toBe(true);
  });

  test("ledig: samme sats som dagpengene, aldrig over maksimum", () => {
    // 19.000 kr. om måneden i dagpenge = 4.384,62 kr. om ugen
    const r = beregnBarselsdagpenge({
      monthlyIncome: 19000, weeklyHours: 37, weeks: 24, employment: "unemployed",
    })!;
    expect(r.weeklyRate).toBeCloseTo(4384.62, 2);
    expect(r.coveragePercent).toBeCloseTo(100, 5);
    expect(r.monthlyLoss).toBeCloseTo(0, 6);

    const hoej = beregnBarselsdagpenge({
      monthlyIncome: 30000, weeklyHours: 37, weeks: 24, employment: "unemployed",
    })!;
    expect(hoej.weeklyRate).toBe(BARSEL_2026.maxWeeklyRate);
  });
});

describe("fordelBarselsUger", () => {
  test("mor uden overdragelse: 4 uger før og 24 uger efter fødslen", () => {
    const u = fordelBarselsUger("mor");
    expect(u.beforeBirth).toBe(4);
    expect(u.afterBirth).toBe(24);
    expect(u.total).toBe(28);
    expect(u.partnerTotal).toBe(24);
    expect(u.earmarked).toBe(11);
    expect(u.transferable).toBe(13);
  });

  test("far/medmor uden overdragelse: 24 uger efter fødslen, 11 øremærkede", () => {
    const u = fordelBarselsUger("far");
    expect(u.beforeBirth).toBe(0);
    expect(u.total).toBe(24);
    expect(u.partnerTotal).toBe(28);
    expect(u.earmarked).toBe(11);
  });

  test("overdragede uger flyttes fra den ene til den anden, i alt uændret", () => {
    const give = fordelBarselsUger("far", 6);
    expect(give.total).toBe(18);
    expect(give.partnerTotal).toBe(34);
    expect(give.total + give.partnerTotal).toBe(fordelBarselsUger("far").total + fordelBarselsUger("far").partnerTotal);

    const take = fordelBarselsUger("mor", -13);
    expect(take.total).toBe(28 + 13);
    expect(take.partnerTotal).toBe(24 - 13);
  });

  test("overdragelse over 13 uger afkortes, og de 11 øremærkede uger bliver hos forælderen", () => {
    const u = fordelBarselsUger("far", 40);
    expect(u.transferred).toBe(13);
    // 24 uger efter fødslen minus 13 overdragelige giver præcis de 11 øremærkede.
    expect(u.total).toBe(u.earmarked);
    expect(fordelBarselsUger("far", -99).transferred).toBe(-13);
  });

  test("ugyldig overdragelse tæller som nul", () => {
    expect(fordelBarselsUger("mor", Number.NaN).transferred).toBe(0);
  });
});
