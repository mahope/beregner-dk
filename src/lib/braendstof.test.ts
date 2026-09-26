import { describe, it, expect } from "vitest";
import { getPageData } from "./page-data";
import {
  BRAENDSTOF_FORUDSETNINGER,
  ELBIL_FORUDSETNINGER,
  besparelseProcent,
  breakEvenKwhPris,
  elbilForudsætninger,
  elbilSammenligning,
  prisPrKm,
  procent1Decimals,
} from "./braendstof";

describe("prisPrKm", () => {
  it("beregner benzinpris pr. km", () => {
    expect(prisPrKm("benzin")).toBeCloseTo(0.9, 6);
  });

  it("beregner dieselpris pr. km", () => {
    expect(prisPrKm("diesel")).toBeCloseTo(12.8 / 18, 6);
  });

  it("beregner elpris pr. km", () => {
    expect(prisPrKm("el")).toBeCloseTo(0.425, 6);
  });

  it("laeser forudsætningerne, der ikke er hardkodede to steder", () => {
    expect(BRAENDSTOF_FORUDSETNINGER.benzin).toEqual({ literPris: 13.5, kmPerLiter: 15 });
    expect(BRAENDSTOF_FORUDSETNINGER.diesel).toEqual({ literPris: 12.8, kmPerLiter: 18 });
    expect(BRAENDSTOF_FORUDSETNINGER.el).toEqual({ kwhPris: 2.5, kwhPer100km: 17 });
  });
});

describe("besparelseProcent", () => {
  it("giver 52,8 % mod benzin — ikke et rundt 50-70 %-interval", () => {
    expect(procent1Decimals(besparelseProcent("benzin"))).toBe(52.8);
  });

  it("giver 40,2 % mod diesel, altså under 50 %", () => {
    expect(procent1Decimals(besparelseProcent("diesel"))).toBe(40.2);
  });

  it("er mindre mod endelingsbil end mod benzin, fordi diesel er billigere pr. km", () => {
    expect(besparelseProcent("diesel")).toBeLessThan(besparelseProcent("benzin"));
  });

  it("er 0 mod sig selv", () => {
    expect(besparelseProcent("el")).toBe(0);
  });

  it("går negativ, når el er dyrere end sammenligningsbrændstoffet", () => {
    const { kwhPer100km } = BRAENDSTOF_FORUDSETNINGER.el;
    const dyrt = breakEvenKwhPris("diesel") * 1.5;
    const elPris = (kwhPer100km / 100) * dyrt;
    expect(elPris).toBeGreaterThan(prisPrKm("diesel"));
  });
});

describe("breakEvenKwhPris", () => {
  it("er ca. 4,18 kr./kWh mod diesel", () => {
    expect(breakEvenKwhPris("diesel")).toBeCloseTo(4.18, 2);
  });

  it("er ca. 5,29 kr./kWh mod benzin", () => {
    expect(breakEvenKwhPris("benzin")).toBeCloseTo(5.29, 2);
  });

  it("ved break-even er el og sammenligningsbrændstoffet pr. km lige dyre", () => {
    for (const type of ["benzin", "diesel"] as const) {
      const el = (BRAENDSTOF_FORUDSETNINGER.el.kwhPer100km / 100) * breakEvenKwhPris(type);
      expect(el).toBeCloseTo(prisPrKm(type), 6);
    }
  });
});

describe("procent1Decimals", () => {
  it("runder rigtigt både op og ned", () => {
    expect(procent1Decimals(52.777)).toBe(52.8);
    expect(procent1Decimals(40.234)).toBe(40.2);
    expect(procent1Decimals(0)).toBe(0);
  });
});

describe("/braendstof FAQ", () => {
  const locales = ["da", "no", "se"] as const;

  function elSvar(locale: (typeof locales)[number]): string {
    const faq = getPageData("braendstof", locale)!.faqItems;
    const fundet = faq.find((f) => elSpoergsmaal.test(f.question));
    if (!fundet) throw new Error(`Ingen el-spørgsmål i ${locale}`);
    return fundet.answer;
  }

  it("findes i alle tre sprogversioner", () => {
    for (const locale of locales) {
      expect(elSvar(locale)).toBeTruthy();
    }
  });

  it("lover ikke længere det runde 50-70 %-interval, værktøjet selv modsiger", () => {
    for (const locale of locales) {
      const svar = elSvar(locale);
      expect(svar).not.toMatch(/50-70/);
    }
  });

  it("nævner de to faktiske besparelsesgrader, der er udledt af forudsætningerne", () => {
    const forventetBenzin = medKomma(besparelseProcent("benzin"));
    const forventetDiesel = medKomma(besparelseProcent("diesel"));
    for (const locale of locales) {
      const svar = elSvar(locale);
      expect(svar).toContain(`${forventetBenzin} %`);
      expect(svar).toContain(`${forventetDiesel} %`);
    }
  });

  it("er tydelig om, at besparelsen er lavere mod diesel end mod benzin", () => {
    for (const locale of locales) {
      const svar = elSvar(locale);
      const benzinPct = svar.indexOf(`${medKomma(besparelseProcent("benzin"))} %`);
      const dieselPct = svar.indexOf(`${medKomma(besparelseProcent("diesel"))} %`);
      expect(benzinPct).toBeGreaterThanOrEqual(0);
      expect(dieselPct).toBeGreaterThan(benzinPct);
    }
  });

  it("skriver procent med komma, som dansk og svensk kræver", () => {
    for (const locale of locales) {
      expect(elSvar(locale)).not.toMatch(/\d\.\d\s*%/);
    }
  });
});

const elSpoergsmaal = /el-?biler billigere|elbiler billigere|elbilar billigare/i;

/** Spejler formateringen i page-data.ts: én decimal, komma. */
function medKomma(value: number): string {
  return procent1Decimals(value).toFixed(1).replace(".", ",");
}

describe("elbilForudsætninger", () => {
  it("er standarderne /elbil-værktøjet bruger, ikke en tredje sæt", () => {
    expect(ELBIL_FORUDSETNINGER.da).toEqual({
      elKwhPris: 2.5,
      elKwhPer100km: 18,
      benzinLiterPris: 13.5,
      benzinKmPerLiter: 16,
      kmPrAar: 15000,
      aar: 5,
    });
    expect(ELBIL_FORUDSETNINGER.se).toEqual({
      elKwhPris: 2,
      elKwhPer100km: 18,
      benzinLiterPris: 19,
      benzinKmPerLiter: 16,
      kmPrAar: 15000,
      aar: 5,
    });
  });

  it("giver svensk på beraknare.se og dansk overalt ellers", () => {
    expect(elbilForudsætninger("se")).toBe(ELBIL_FORUDSETNINGER.se);
    expect(elbilForudsætninger("da")).toBe(ELBIL_FORUDSETNINGER.da);
    expect(elbilForudsætninger("no")).toBe(ELBIL_FORUDSETNINGER.da);
    expect(elbilForudsætninger("")).toBe(ELBIL_FORUDSETNINGER.da);
  });
});

describe("elbilSammenligning", () => {
  it("giver 0,45 mod 0,84 kr. pr. km på dansk — 46,7 %, ikke under halvdelen", () => {
    const da = elbilSammenligning("da");
    expect(da.elPrisPrKm).toBeCloseTo(0.45, 6);
    expect(da.benzinPrisPrKm).toBeCloseTo(0.84375, 6);
    expect(da.besparelseProcent).toBe(46.7);
    // Løftet "under halvdelen" er falsk ved værktøjets egne standarder.
    expect(da.elPrisPrKm / da.benzinPrisPrKm).toBeGreaterThan(0.5);
  });

  it("gør el dyrere end benzin over 4,7 kr./kWh", () => {
    expect(elbilSammenligning("da").breakEvenKwhPris).toBe(4.7);
  });

  it("giver ca. 5.900 kr. pr. år på 15.000 km", () => {
    expect(elbilSammenligning("da").aarligBesparelse).toBe(5900);
  });

  it("giver svensk 0,36 mod 1,19 kr. pr. km og ca. 12.400 kr. pr. år", () => {
    const se = elbilSammenligning("se");
    expect(se.elPrisPrKm).toBeCloseTo(0.36, 6);
    expect(se.benzinPrisPrKm).toBeCloseTo(1.1875, 6);
    expect(se.besparelseProcent).toBe(69.7);
    expect(se.aarligBesparelse).toBe(12400);
  });

  it("ligger samme vej som /braendstof-tabellen, så de to sammenligninger ikke kan glide fra hinanden", () => {
    const tabel = procent1Decimals(besparelseProcent("benzin"));
    const elbil = elbilSammenligning("da").besparelseProcent;
    // 18 kWh/100 km og 16 km/l er hver især dyrere for el end tabellens 17 og 15.
    expect(elbil).toBeLessThan(tabel);
    expect(BRAENDSTOF_FORUDSETNINGER.benzin.kmPerLiter).toBeLessThan(
      ELBIL_FORUDSETNINGER.da.benzinKmPerLiter,
    );
    expect(BRAENDSTOF_FORUDSETNINGER.el.kwhPer100km).toBeLessThan(
      ELBIL_FORUDSETNINGER.da.elKwhPer100km,
    );
  });
});
