import { describe, expect, test } from "vitest";
import { BMI_BAAND, vaegtInterval } from "@/lib/bmi-voksen-grænser";
import {
  MAX_HOEJDE_CM,
  MIN_HOEJDE_CM,
  devineIdealvaegt,
  hamwiIdealvaegt,
  idealvaegtResultat,
  rundIdealvaegt,
} from "@/lib/idealvaegt";

/**
 * Forventningerne er regnet fra formlernes kilder, ikke fra koden:
 * Devine mænd 50 + 0,9 × (højde − 152), kvinder 45,5 + 0,9 × (højde − 152);
 * Hamwi mænd 48 + 1,1 × (højde − 152), kvinder 45,4 + 0,9 × (højde − 152).
 * 180 cm mand er derfor 75,2 og 78,8 kg — de to tal, en mutation af
 * grundværdien eller hældningen flytter.
 */
describe("Devines idealvægt", () => {
  test("på referencehøjden 152 cm er den grundværdien", () => {
    expect(devineIdealvaegt(152, "mand")).toBeCloseTo(50, 10);
    expect(devineIdealvaegt(152, "kvinde")).toBeCloseTo(45.5, 10);
  });

  test("en mand på 180 cm vejer 75,2 kg", () => {
    expect(devineIdealvaegt(180, "mand")).toBeCloseTo(75.2, 10);
  });

  test("en kvinde på 165 cm vejer 57,2 kg", () => {
    expect(devineIdealvaegt(165, "kvinde")).toBeCloseTo(57.2, 10);
  });

  test("kvinder ligger lavere end mænd ved samme højde", () => {
    for (const h of [140, 160, 180, 200]) {
      expect(devineIdealvaegt(h, "kvinde")).toBeLessThan(devineIdealvaegt(h, "mand"));
    }
  });

  test("hældningen er 0,9 kg pr. centimeter for begge køn", () => {
    for (const koen of ["mand", "kvinde"] as const) {
      expect(devineIdealvaegt(180, koen) - devineIdealvaegt(170, koen)).toBeCloseTo(9, 10);
    }
  });
});

describe("Hamwis idealvægt", () => {
  test("på referencehøjden 152 cm er den grundværdien", () => {
    expect(hamwiIdealvaegt(152, "mand")).toBeCloseTo(48, 10);
    expect(hamwiIdealvaegt(152, "kvinde")).toBeCloseTo(45.4, 10);
  });

  test("en mand på 180 cm vejer 78,8 kg", () => {
    expect(hamwiIdealvaegt(180, "mand")).toBeCloseTo(78.8, 10);
  });

  test("en kvinde på 165 cm veger 57,1 kg", () => {
    expect(hamwiIdealvaegt(165, "kvinde")).toBeCloseTo(57.1, 10);
  });

  test("mændene stiger stejlere end kvinderne", () => {
    // 1,1 mod 0,9 pr. cm — det er den eneste forskel på hældningen, og den
    // er hele grunden til at siden viser begge formler.
    expect(hamwiIdealvaegt(180, "mand") - hamwiIdealvaegt(152, "mand")).toBeCloseTo(30.8, 10);
    expect(hamwiIdealvaegt(180, "kvinde") - hamwiIdealvaegt(152, "kvinde")).toBeCloseTo(25.2, 10);
  });
});

describe("resultatet samler begge formler", () => {
  test("gennemsnippet ligger mellem de to", () => {
    const r = idealvaegtResultat(180, "mand");
    expect(r.gennemsnit).toBeCloseTo((r.devine + r.hamwi) / 2, 10);
    expect(r.gennemsnit).toBeCloseTo(77, 10);
    expect(r.devine).toBeLessThan(r.gennemsnit);
    expect(r.hamwi).toBeGreaterThan(r.gennemsnit);
  });

  test("spredningen er forskellen mellem formlerne", () => {
    // 180 cm mand: 78,8 − 75,2 = 3,6 kg
    expect(idealvaegtResultat(180, "mand").spredning).toBeCloseTo(3.6, 10);
    // 165 cm kvinde: 57,2 − 57,1 = 0,1 kg
    expect(idealvaegtResultat(165, "kvinde").spredning).toBeCloseTo(0.1, 10);
  });

  test("formlerne er ikke ens — de må aldrig smelte sammen til én", () => {
    for (const h of [MIN_HOEJDE_CM, 160, 200, MAX_HOEJDE_CM]) {
      expect(devineIdealvaegt(h, "mand")).not.toBeCloseTo(hamwiIdealvaegt(h, "mand"), 1);
    }
  });

  test("gemmer køn og højde, så et resultat kan afleveres i en delelink", () => {
    const r = idealvaegtResultat(175, "kvinde");
    expect(r.koen).toBe("kvinde");
    expect(r.hoejdeCm).toBe(175);
  });
});

describe("afviser ugyldige højder", () => {
  test("ikke-tal kaster i stedet for at returnere NaN", () => {
    expect(() => devineIdealvaegt(Number.NaN, "mand")).toThrow();
    expect(() => hamwiIdealvaegt(Number.NaN, "kvinde")).toThrow();
    expect(() => idealvaegtResultat(Number.POSITIVE_INFINITY, "mand")).toThrow();
  });

  test("nul og negative højder kaster", () => {
    expect(() => devineIdealvaegt(0, "mand")).toThrow();
    expect(() => hamwiIdealvaegt(-180, "kvinde")).toThrow();
  });

  test("begge formler er positive i hele det interval, værktøjet tilbyder", () => {
    for (let h = MIN_HOEJDE_CM; h <= MAX_HOEJDE_CM; h += 1) {
      for (const koen of ["mand", "kvinde"] as const) {
        expect(devineIdealvaegt(h, koen), `${koen} ${h}`).toBeGreaterThan(20);
        expect(hamwiIdealvaegt(h, koen), `${koen} ${h}`).toBeGreaterThan(20);
      }
    }
  });
});

describe("BMI-intervallet kommer fra sitets egen WHO-tabel", () => {
  test("normalvægtsbåndet er BMI 18,5-24,9", () => {
    const normal = BMI_BAAND.find((b) => b.dansk === "Normalvægt");
    expect(normal).toBeDefined();
    expect(vaegtInterval(1.8, normal!)).toEqual({ min: 59.9, max: 80.7 });
  });

  test("det er samme interval, BMI-siden viser", () => {
    // 175 cm: 18,5 × 3,0625 = 56,7 og 24,9 × 3,0625 = 76,3.
    const normal = BMI_BAAND.find((b) => b.dansk === "Normalvægt")!;
    expect(vaegtInterval(1.75, normal)).toEqual({ min: 56.7, max: 76.3 });
  });
});

describe("rundIdealvaegt", () => {
  test("runder til én decimal", () => {
    expect(rundIdealvaegt(75.25)).toBe(75.3);
    expect(rundIdealvaegt(75.24)).toBe(75.2);
    expect(rundIdealvaegt(80)).toBe(80);
  });
});