import { describe, expect, it } from "vitest";
import {
  BR18_OMBYGNING,
  BYGNINGSDELER,
  ISOLERINGSMATERIALER,
  RSE,
  beregnIsolering,
  bygningsdelVedId,
  luftlag,
  materialeVedId,
  tykkelseForU,
} from "@/lib/isolation";

describe("beregnisolering", () => {
  it("regner et loft til BR-krav med stenuld", () => {
    // R_total = 1/0,20 = 5,00; luftlag 0,10 + 0,04 = 0,14
    // R_iso = 4,86; d = 0,037 × 4,86 = 0,17982 m = 17,98 cm
    const r = beregnIsolering({
      bygningsdelId: "loft",
      materialeId: "stenuld",
      arealM2: 100,
      uVaerdi: 0.2,
    });
    expect(r.tykkelseCm).toBe(17.98);
    expect(r.rIsolering).toBe(4.86);
    expect(r.rTotal).toBe(5);
    expect(r.luftlagM2KW).toBe(0.14);
    expect(r.brugerBrKrav).toBe(true);
    expect(r.umuligt).toBe(false);
  });

  it("bruger luftlagene efter varmestrømmens retning", () => {
    expect(luftlag(bygningsdelVedId("loft"))).toBe(RSE + 0.1);
    expect(luftlag(bygningsdelVedId("vaeg"))).toBe(RSE + 0.13);
    expect(luftlag(bygningsdelVedId("gulv"))).toBe(RSE + 0.17);
  });

  it("lader et gulv nøjes med mindre end et loft, fordi varmestrømmen går nedad", () => {
    // Varme stiger, så luften over et varmt loft holder bedre på varmen end
    // luften under et koldt gulv. Rsi er derfor 0,10 på et loft mod 0,17 i et
    // gulv, og luftlagene tager mere af modstanden i gulvet.
    const loft = beregnIsolering({ bygningsdelId: "loft", materialeId: "glasuld", arealM2: 50, uVaerdi: 0.2 });
    const gulv = beregnIsolering({ bygningsdelId: "gulv", materialeId: "glasuld", arealM2: 50, uVaerdi: 0.2 });
    expect(gulv.tykkelseCm).toBeLessThan(loft.tykkelseCm);
    expect(gulv.rIsolering).toBeLessThan(loft.rIsolering);
  });

  it("giver tyndere lag jo lavere lambda-tallet er", () => {
    const ram = (materialeId: string) =>
      beregnIsolering({ bygningsdelId: "vaeg", materialeId, arealM2: 10, uVaerdi: 0.18 });
    const pir = ram("pir");
    const traefiber = ram("traefiber");
    expect(pir.tykkelseCm).toBeLessThan(traefiber.tykkelseCm);
    expect(pir.materiale.lambda).toBeLessThan(traefiber.materiale.lambda);
  });

  it("regner varmetabet ud fra areal gange U", () => {
    const r = beregnIsolering({ bygningsdelId: "loft", materialeId: "stenuld", arealM2: 100, uVaerdi: 0.2 });
    expect(r.varmetabPrGrad).toBe(20);
    expect(r.volumenM3).toBeCloseTo(17.98, 2);
  });

  it("falder tilbage til bygningsdelens krav når U-værdien er ugyldig", () => {
    const uden = beregnIsolering({ bygningsdelId: "vaeg", materialeId: "stenuld", arealM2: 10 });
    const nul = beregnIsolering({ bygningsdelId: "vaeg", materialeId: "stenuld", arealM2: 10, uVaerdi: 0 });
    const negativ = beregnIsolering({
      bygningsdelId: "vaeg",
      materialeId: "stenuld",
      arealM2: 10,
      uVaerdi: -1,
    });
    expect(uden.tykkelseCm).toBe(beregnIsolering({
      bygningsdelId: "vaeg",
      materialeId: "stenuld",
      arealM2: 10,
      uVaerdi: 0.3,
    }).tykkelseCm);
    expect(nul.tykkelseCm).toBe(uden.tykkelseCm);
    expect(negativ.tykkelseCm).toBe(uden.tykkelseCm);
  });

  it("lader et valgt krav slå BR-kravet", () => {
    const r = beregnIsolering({ bygningsdelId: "loft", materialeId: "stenuld", arealM2: 10, uVaerdi: 0.1 });
    expect(r.uVaerdi).toBe(0.1);
    expect(r.brugerBrKrav).toBe(false);
    expect(r.tykkelseCm).toBeGreaterThan(
      beregnIsolering({ bygningsdelId: "loft", materialeId: "stenuld", arealM2: 10 }).tykkelseCm,
    );
  });

  it("afbalancerer areal til standardværdien når det ikke er et tal", () => {
    const r = beregnIsolering({
      bygningsdelId: "loft",
      materialeId: "stenuld",
      arealM2: Number.NaN,
    });
    expect(r.arealM2).toBe(100);
  });

  it("siger 0 cm når luftlagene alene holder kravet", () => {
    const r = beregnIsolering({ bygningsdelId: "vaeg", materialeId: "stenuld", arealM2: 10, uVaerdi: 9 });
    expect(r.umuligt).toBe(true);
    expect(r.tykkelseCm).toBe(0);
    expect(r.volumenM3).toBe(0);
  });

  it("afslører at BR-kravet er løsere end ombygningskravet", () => {
    for (const del of BYGNINGSDELER) {
      const r = beregnIsolering({ bygningsdelId: del.id, materialeId: "stenuld", arealM2: 10 });
      expect(r.lossereEndOmbygning).toBe(del.brKrav > BR18_OMBYGNING[del.id]);
    }
  });
});

describe("tykkelseForU", () => {
  it("giver samme tal som beregneren", () => {
    expect(tykkelseForU("loft", "stenuld", 0.2)).toBe(
      beregnIsolering({ bygningsdelId: "loft", materialeId: "stenuld", arealM2: 10, uVaerdi: 0.2 })
        .tykkelseCm,
    );
  });

  it("giver 0 når kravet ikke kan nås med isolering", () => {
    expect(tykkelseForU("vaeg", "pir", 10)).toBe(0);
  });
});

describe("data", () => {
  it("holder BR18 § 257 kravstallene", () => {
    const loft = bygningsdelVedId("loft");
    const vaeg = bygningsdelVedId("vaeg");
    const gulv = bygningsdelVedId("gulv");
    expect(loft.brKrav).toBe(0.2);
    expect(vaeg.brKrav).toBe(0.3);
    expect(gulv.brKrav).toBe(0.2);
  });

  it("holder hvert materiales lambda inden for sit eget interval", () => {
    for (const m of ISOLERINGSMATERIALER) {
      expect(m.lambda).toBeGreaterThanOrEqual(m.lambdaMin);
      expect(m.lambda).toBeLessThanOrEqual(m.lambdaMaks);
      expect(materialeVedId(m.id).id).toBe(m.id);
    }
  });

  it("har unikke materiale-id'er", () => {
    const ids = ISOLERINGSMATERIALER.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
