import { describe, expect, test } from "vitest";
import {
  ORESUND_GO_AARSAFGIFT,
  ORESUND_KATEGORIER,
  ORESUND_START,
  beregnOresundsbroen,
  oresundGoBreakEven,
  oresundKategori,
  oresundPris,
} from "./oresundsbroen";

const start = oresundKategori(ORESUND_START)!;

describe("oresundPris", () => {
  test("personbil max 6 m koster 182/420/470 kr. pr. overfart", () => {
    expect(oresundPris(start, "go")).toBe(182);
    expect(oresundPris(start, "online")).toBe(420);
    expect(oresundPris(start, "normal")).toBe(470);
  });

  test("hver køretøjstype har en GO-pris under onlineprisen under normalprisen", () => {
    for (const k of ORESUND_KATEGORIER) {
      expect(k.go, k.etiket).toBeLessThan(k.online);
      expect(k.online, k.etiket).toBeLessThan(k.normal);
    }
  });
});

describe("beregnOresundsbroen", () => {
  test("tur/retur er to gange prisen pr. overfart", () => {
    const r = beregnOresundsbroen({ nokkel: ORESUND_START, betalingsform: "normal", ture: 1 })!;
    expect(r.prisPrOverfart).toBe(470);
    expect(r.turReturPris).toBe(940);
    expect(r.aarsforbrug).toBe(940);
  });

  test("ØresundGO lægger årsafgiften oveni og sparer mod normalprisen", () => {
    const r = beregnOresundsbroen({ nokkel: ORESUND_START, betalingsform: "go", ture: 12 })!;
    expect(r.aarsafgift).toBe(ORESUND_GO_AARSAFGIFT);
    expect(r.aarsforbrug).toBe(ORESUND_GO_AARSAFGIFT + 182 * 2 * 12);
    expect(r.normalAarsforbrug).toBe(470 * 2 * 12);
    expect(r.besparelseModNormal).toBe(470 * 2 * 12 - (ORESUND_GO_AARSAFGIFT + 182 * 2 * 12));
  });

  test("besparelsen findes kun for GO", () => {
    for (const form of ["online", "normal"] as const) {
      const r = beregnOresundsbroen({ nokkel: ORESUND_START, betalingsform: form, ture: 5 })!;
      expect(r.besparelseModNormal).toBeNull();
      expect(r.aarsafgift).toBe(0);
    }
  });

  test("årsforbruget deles over tolv måneder", () => {
    const r = beregnOresundsbroen({ nokkel: ORESUND_START, betalingsform: "online", ture: 12 })!;
    expect(r.prMaaned).toBe((420 * 2 * 12) / 12);
  });

  test("antallet af ture holdes inden for grænserne", () => {
    const nul = beregnOresundsbroen({ nokkel: ORESUND_START, betalingsform: "normal", ture: 0 })!;
    expect(nul.ture).toBe(1);
    const tusind = beregnOresundsbroen({ nokkel: ORESUND_START, betalingsform: "normal", ture: 1000 })!;
    expect(tusind.ture).toBe(365);
  });

  test("en ukendt køretøjstype giver intet resultat", () => {
    expect(beregnOresundsbroen({ nokkel: "finnes-ikke", betalingsform: "go", ture: 1 })).toBeNull();
  });
});

describe("oresundGoBreakEven", () => {
  test("årsafgiften er tjent ind allerede på den første tur for en personbil", () => {
    expect(oresundGoBreakEven(start)).toBe(1);
  });

  test("en motorcykel skal køre to ture, før årsafgiften er tjent ind", () => {
    expect(oresundGoBreakEven(oresundKategori("motorcykel")!)).toBe(2);
  });

  test("break-even regnes på normalprisen minus GO-prisen", () => {
    for (const k of ORESUND_KATEGORIER) {
      const besparelsePrTur = (k.normal - k.go) * 2;
      expect(oresundGoBreakEven(k), k.etiket).toBe(
        Math.ceil(ORESUND_GO_AARSAFGIFT / besparelsePrTur)
      );
    }
  });
});
