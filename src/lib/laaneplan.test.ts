import { describe, expect, test } from "vitest";
import {
  fraGammeltDelLink,
  kortBeloeb,
  type LaaneState,
  aarsOversigt,
  fraQuery,
  harDelLink,
  tilQuery,
  aopFraBetalinger,
  beregnLaaneplan,
  restgaeldPrAar,
  sammenlign,
  validerInput,
} from "./laaneplan";

const BASIS = { hovedstol: 1_000_000, aarsrente: 5, loebetidAar: 30 };

describe("annuitetslån", () => {
  test("1 mio. til 5 % over 30 år: kendt ydelse og samlet rente", () => {
    const p = beregnLaaneplan({ ...BASIS, type: "annuitet" });
    expect(p.antalMaaneder).toBe(360);
    expect(p.foersteYdelse).toBeCloseTo(5368.22, 2);
    expect(p.sidsteYdelse).toBeCloseTo(5368.22, 2);
    expect(p.samletRente).toBeCloseTo(932_557.8, 0);
    expect(p.samletTilbagebetaling).toBeCloseTo(1_932_557.8, 0);
  });

  test("første måned: renten er hovedstol × månedsrente, resten er afdrag", () => {
    const p = beregnLaaneplan({ ...BASIS, type: "annuitet" });
    expect(p.raekker[0].rente).toBeCloseTo(4166.67, 2);
    expect(p.raekker[0].afdrag).toBeCloseTo(1201.55, 2);
    expect(p.raekker[0].restgaeld).toBeCloseTo(998_798.45, 2);
  });

  test("restgælden ender på præcis 0, og afdragene summerer til hovedstolen", () => {
    const p = beregnLaaneplan({ ...BASIS, type: "annuitet" });
    expect(p.raekker.at(-1)?.restgaeld).toBe(0);
    const sumAfdrag = p.raekker.reduce((s, x) => s + x.afdrag, 0);
    expect(sumAfdrag).toBeCloseTo(BASIS.hovedstol, 6);
  });
});

describe("serielån", () => {
  test("1 mio. til 5 % over 30 år: kendt første/sidste ydelse og rente", () => {
    const p = beregnLaaneplan({ ...BASIS, type: "serielaan" });
    expect(p.foersteYdelse).toBeCloseTo(6944.44, 2);
    expect(p.sidsteYdelse).toBeCloseTo(2789.35, 2);
    expect(p.samletRente).toBeCloseTo(752_083.33, 1);
  });

  test("afdraget er konstant", () => {
    const p = beregnLaaneplan({ ...BASIS, type: "serielaan" });
    expect(p.raekker[0].afdrag).toBeCloseTo(2777.78, 2);
    expect(p.raekker[200].afdrag).toBeCloseTo(2777.78, 2);
  });
});

describe("rente 0", () => {
  test("annuitet og serielån giver samme plan uden renter og ÅOP 0", () => {
    for (const type of ["annuitet", "serielaan"] as const) {
      const p = beregnLaaneplan({ hovedstol: 120_000, aarsrente: 0, loebetidAar: 10, type });
      expect(p.foersteYdelse).toBeCloseTo(1000, 6);
      expect(p.samletRente).toBe(0);
      expect(p.samletTilbagebetaling).toBeCloseTo(120_000, 6);
      expect(p.aop).toBe(0);
    }
  });
});

describe("ÅOP", () => {
  test("uden gebyrer er ÅOP den effektive årsrente (1 + r/12)^12 − 1", () => {
    const p = beregnLaaneplan({ ...BASIS, type: "annuitet" });
    expect(p.aop).toBeCloseTo(((1 + 0.05 / 12) ** 12 - 1) * 100, 4);
  });

  test("10.000 kr. over 12 måneder til 20 % uden gebyrer: ÅOP 21,94 %", () => {
    const p = beregnLaaneplan({ hovedstol: 10_000, aarsrente: 20, loebetidAar: 1, type: "annuitet" });
    expect(p.aop).toBeCloseTo(21.94, 2);
  });

  test("gebyrer løfter ÅOP over den effektive rente", () => {
    const uden = beregnLaaneplan({ hovedstol: 100_000, aarsrente: 9, loebetidAar: 5, type: "annuitet" });
    const med = beregnLaaneplan({
      hovedstol: 100_000,
      aarsrente: 9,
      loebetidAar: 5,
      type: "annuitet",
      stiftelsesgebyr: 2_000,
      maanedsgebyr: 30,
    });
    expect(med.aop).toBeGreaterThan(uden.aop);
    expect(med.samletGebyr).toBe(2_000 + 30 * 60);
    expect(med.udbetalt).toBe(98_000);
    expect(med.samletTilbagebetaling).toBeCloseTo(100_000 + med.samletRente + 3_800, 6);
  });

  test("100.000 kr. til 9 % over 5 år med 1.500 kr. i stiftelsesgebyr: ÅOP 10,09 %", () => {
    const p = beregnLaaneplan({ hovedstol: 100_000, aarsrente: 9, loebetidAar: 5, stiftelsesgebyr: 1_500, type: "annuitet" });
    expect(p.aop).toBeCloseTo(10.09, 2);
  });

  test("harDelLink ignorerer sporingsparametre", () => {
    expect(harDelLink("?gclid=abc&utm_source=x")).toBe(false);
    expect(harDelLink("?utm_source=x&beloeb=5000")).toBe(true);
  });

  test("ÅOP-løsningen går i nul: nutidsværdien af betalingerne er det udbetalte", () => {
    const p = beregnLaaneplan({
      hovedstol: 50_000,
      aarsrente: 12,
      loebetidAar: 3,
      type: "annuitet",
      stiftelsesgebyr: 1_000,
      maanedsgebyr: 25,
    });
    const nv = p.raekker.reduce((s, x, k) => s + (x.ydelse + 25) / (1 + p.aop / 100) ** ((k + 1) / 12), 0);
    expect(nv).toBeCloseTo(49_000, 4);
  });

  test("betaler man mindre end man fik, er ÅOP 0 og ikke negativ", () => {
    expect(aopFraBetalinger(1000, [400, 400])).toBe(0);
    expect(aopFraBetalinger(0, [100])).toBe(0);
    expect(aopFraBetalinger(1000, [])).toBe(0);
  });
});

describe("ekstreme værdier", () => {
  test("1 måneds løbetid", () => {
    const p = beregnLaaneplan({ hovedstol: 10_000, aarsrente: 12, loebetidAar: 1 / 12, type: "annuitet" });
    expect(p.antalMaaneder).toBe(1);
    expect(p.foersteYdelse).toBeCloseTo(10_100, 6);
    expect(p.raekker[0].restgaeld).toBe(0);
  });

  test("50 år og 40 % rente giver endelige tal", () => {
    const p = beregnLaaneplan({ hovedstol: 20_000_000, aarsrente: 40, loebetidAar: 50, type: "annuitet" });
    expect(Number.isFinite(p.samletRente)).toBe(true);
    expect(Number.isFinite(p.aop)).toBe(true);
    expect(p.raekker).toHaveLength(600);
  });

  test("decimal løbetid giver hele måneder", () => {
    const p = beregnLaaneplan({ hovedstol: 60_000, aarsrente: 6, loebetidAar: 2.5, type: "serielaan" });
    expect(p.antalMaaneder).toBe(30);
  });

  test("ugyldigt input afvises i stedet for at give NaN", () => {
    expect(() => beregnLaaneplan({ ...BASIS, hovedstol: 0, type: "annuitet" })).toThrow();
    expect(() => beregnLaaneplan({ ...BASIS, aarsrente: -1, type: "annuitet" })).toThrow();
    expect(() => beregnLaaneplan({ ...BASIS, loebetidAar: 0, type: "annuitet" })).toThrow();
    expect(() => beregnLaaneplan({ ...BASIS, aarsrente: Number.NaN, type: "annuitet" })).toThrow();
    expect(validerInput({ ...BASIS, stiftelsesgebyr: 2_000_000, type: "annuitet" })).not.toBeNull();
    expect(validerInput({ ...BASIS, type: "annuitet" })).toBeNull();
  });
});

describe("sammenligning", () => {
  test("serielån er billigst i renter, men dyrest i første måned", () => {
    const s = sammenlign(BASIS);
    expect(s.renteForskel).toBeCloseTo(932_557.8 - 752_083.33, 0);
    expect(s.foersteYdelseForskel).toBeCloseTo(1576.23, 1);
    expect(s.serielaan.samletRente).toBeLessThan(s.annuitet.samletRente);
  });

  test("krydsmåneden er den første, hvor serielånet er billigere pr. måned", () => {
    const s = sammenlign(BASIS);
    expect(s.krydsMaaned).not.toBeNull();
    const k = (s.krydsMaaned as number) - 1;
    expect(s.serielaan.raekker[k].ydelse).toBeLessThan(s.annuitet.raekker[k].ydelse);
    expect(s.serielaan.raekker[k - 1].ydelse).toBeGreaterThanOrEqual(s.annuitet.raekker[k - 1].ydelse);
  });

  test("ved 0 % rente er serielånet aldrig billigere pr. måned", () => {
    const s = sammenlign({ hovedstol: 120_000, aarsrente: 0, loebetidAar: 10 });
    expect(s.krydsMaaned).toBeNull();
    expect(s.renteForskel).toBe(0);
  });
});

describe("del-link", () => {
  const STANDARD: LaaneState = {
    hovedstol: 1_000_000,
    aarsrente: 5,
    loebetidAar: 30,
    stiftelsesgebyr: 0,
    maanedsgebyr: 0,
    type: "annuitet",
  };

  test("rundtur: det der skrives, læses tilbage", () => {
    const s: LaaneState = { hovedstol: 75_000, aarsrente: 8.5, loebetidAar: 2.5, stiftelsesgebyr: 1_500, maanedsgebyr: 25, type: "serielaan" };
    expect(fraQuery(tilQuery(s), STANDARD)).toEqual(s);
  });

  test("tilQuery giver læsbare parametre", () => {
    expect(tilQuery(STANDARD)).toBe("beloeb=1000000&rente=5&aar=30&type=annuitet");
  });

  test("ugyldige og manglende parametre falder tilbage til standard", () => {
    expect(fraQuery("", STANDARD)).toEqual(STANDARD);
    expect(fraQuery("beloeb=abc&rente=-3&aar=9999&type=hack&stiftelse=1e99", STANDARD)).toEqual(STANDARD);
  });
});

describe("årsoversigt", () => {
  test("summerer ydelse, renter og afdrag pr. år og slutter på 0", () => {
    const p = beregnLaaneplan({ hovedstol: 60_000, aarsrente: 6, loebetidAar: 2.5, type: "annuitet" });
    const o = aarsOversigt(p);
    expect(o.map((x) => x.aar)).toEqual([1, 2, 3]);
    expect(o.reduce((s, x) => s + x.rente, 0)).toBeCloseTo(p.samletRente, 6);
    expect(o.reduce((s, x) => s + x.afdrag, 0)).toBeCloseTo(60_000, 6);
    expect(o.at(-1)?.restgaeld).toBe(0);
  });
});

describe("restgæld pr. år", () => {
  test("starter ved hovedstolen og slutter på 0", () => {
    const p = beregnLaaneplan({ ...BASIS, type: "annuitet" });
    const punkter = restgaeldPrAar(p, BASIS.hovedstol);
    expect(punkter[0]).toEqual({ aar: 0, restgaeld: 1_000_000 });
    expect(punkter).toHaveLength(31);
    expect(punkter.at(-1)).toEqual({ aar: 30, restgaeld: 0 });
  });

  test("løbetid på ikke hele år får et slutpunkt", () => {
    const p = beregnLaaneplan({ hovedstol: 60_000, aarsrente: 6, loebetidAar: 2.5, type: "annuitet" });
    expect(restgaeldPrAar(p, 60_000).at(-1)).toEqual({ aar: 2.5, restgaeld: 0 });
  });
});

describe("gammelt del-link og aksetekst", () => {
  const standard = { hovedstol: 1_000_000, aarsrente: 5, loebetidAar: 30, stiftelsesgebyr: 0, maanedsgebyr: 0, type: "annuitet" as const };

  test("mapper gamle felter til nye og beholder standard for ugyldige", () => {
    expect(fraGammeltDelLink({ hovedstol: 200000, rente: 4, loebetid: 20, type: "serielaan" }, standard)).toEqual({
      ...standard, hovedstol: 200000, aarsrente: 4, loebetidAar: 20, type: "serielaan",
    });
    expect(fraGammeltDelLink({ hovedstol: -5, rente: "x", type: "andet" }, standard)).toEqual(standard);
  });

  test("kortBeloeb forkorter aksens tal", () => {
    expect(kortBeloeb(1_000_000)).toBe("1 mio.");
    expect(kortBeloeb(2_500_000)).toBe("2,5 mio.");
    expect(kortBeloeb(999_600)).toBe("1 mio.");
    expect(kortBeloeb(999_400)).toBe("999 t.");
    expect(kortBeloeb(500_000)).toBe("500 t.");
    expect(kortBeloeb(50_000)).toBe("50 t.");
    expect(kortBeloeb(0)).toBe("0");
    expect(kortBeloeb(5_000)).toBe("5.000");
  });
});
