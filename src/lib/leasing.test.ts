import { describe, expect, test } from "vitest";

import {
  LEASING_EKSEMPEL,
  beregnLeasing,
  beregnLeasingSammenlign,
  leasingSammenlignFaqSvar,
  leasingSammenlignSætning,
} from "@/lib/leasing";

/**
 * `/leasing` havde ingen test, fordi regnestykket lå i komponentens `useMemo`.
 * Sammenligningen var derfor heller aldrig prøvet imod den rigtige regning — og
 * den var forkert, som `nettoOmkostning`-porten nedenfor viser.
 */
describe("beregnLeasing", () => {
  test("standardeksemplet giver 4.121 kr i måneden og 178.350 kr i alt", () => {
    const r = beregnLeasing(LEASING_EKSEMPEL)!;

    // Afrundet, som `LeasingBeregner.tsx` viser dem.
    expect(Math.round(r.maanedligYdelse)).toBe(4121);
    expect(Math.round(r.totalLeasing)).toBe(178350);
    expect(Math.round(r.totalRente)).toBe(28350);
  });

  test("ydelsen er værdiforringelsen plus renterne på gennemsnitsgælden", () => {
    const { bilpris, restvaerdi, loebetid, rentesats, udbetaling } = LEASING_EKSEMPEL;
    const r = beregnLeasing(LEASING_EKSEMPEL)!;

    const afskrivning = (bilpris - udbetaling - restvaerdi) / loebetid;
    const gaeld = (bilpris - udbetaling + restvaerdi) / 2;
    const rente = gaeld * (rentesats / 100 / 12);

    expect(r.vaerdtab).toBe(150000);
    expect(r.gennemsnitsGaeld).toBe(210000);
    expect(r.maanedligYdelse).toBeCloseTo(afskrivning + rente, 10);
    expect(r.totalRente).toBeCloseTo(rente * loebetid, 10);
  });

  test("uden pris eller løbetid er der ingen ydelse", () => {
    expect(beregnLeasing({ ...LEASING_EKSEMPEL, bilpris: 0 })).toBeNull();
    expect(beregnLeasing({ ...LEASING_EKSEMPEL, loebetid: 0 })).toBeNull();
    expect(beregnLeasing({ ...LEASING_EKSEMPEL, bilpris: -300000 })).toBeNull();
    expect(beregnLeasingSammenlign({ ...LEASING_EKSEMPEL, loebetid: 0 })).toBeNull();
  });
});

describe("beregnLeasingSammenlign", () => {
  test("restværdien tælles med, så et billån er billigere end leasing i netto", () => {
    const s = beregnLeasingSammenlign(LEASING_EKSEMPEL)!;

    // Brutto står som før: du betaler mere til et billån.
    expect(Math.round(s.billaan.total)).toBeGreaterThan(Math.round(s.leasing.total));

    // Men du ejer bilen både under og efter løbetiden. Regnet på det, du
    // faktisk mister, er billånet billigere. Uden denne linje er sammenligningen
    // bare det modsatte af rigtigt.
    expect(s.billaan.nettoOmkostning).toBeCloseTo(s.billaan.total - 150000, 6);
    expect(s.leasing.nettoOmkostning).toBeCloseTo(s.leasing.total, 6);
    expect(s.billaan.nettoOmkostning).toBeLessThan(s.leasing.nettoOmkostning);
    expect(s.billigst).toBe("billaan");
    expect(Math.round(s.billaanFordel)).toBe(9210);
  });

  test("netto for begge afdragsformer er værdiforringen plus renterne", () => {
    const s = beregnLeasingSammenlign(LEASING_EKSEMPEL)!;

    // Det er den egenskab, der gør de to sammenlignelige: de har begge mistet
    // præcis bilens værdiforring, så det eneste der kan afgøre prisen er
    // renterne. Billånet er billigere, fordi et annuitetslån afdrager, mens
    // leasing har hele gælden stående til sidste måned.
    expect(s.leasing.nettoOmkostning - s.vaerdtab).toBeCloseTo(s.totalRente, 6);
    expect(s.billaan.nettoOmkostning - s.vaerdtab).toBeGreaterThan(0);
    expect(s.billaan.nettoOmkostning - s.vaerdtab).toBeLessThan(s.totalRente);
  });

  test("leasing afleverer bilen, så intet står tilbage", () => {
    const s = beregnLeasingSammenlign(LEASING_EKSEMPEL)!;

    expect(s.leasing.ejerVedUdlob).toBe(0);
    expect(s.leasing.egerBil).toBe(false);
    expect(s.billaan.ejerVedUdlob).toBe(150000);
    expect(s.billaan.egerBil).toBe(true);
    expect(s.kontant.ejerVedUdlob).toBe(150000);
    expect(s.kontant.egerBil).toBe(true);
  });

  test("kontantkøb koster bilprisen og taber kun værdiforringen", () => {
    const s = beregnLeasingSammenlign(LEASING_EKSEMPEL)!;

    expect(s.kontant.total).toBe(300000);
    expect(s.kontant.nettoOmkostning).toBe(150000);
    expect(s.kontant.maanedlig).toBeCloseTo(150000 / 36, 10);
    // Den månedlige kontant-tal er værdiforringen fordelt, altså
    // depreciationen — det er, `vaerdtabNote` på kortet siger, og det er det
    // leasingydelsen sammenlignes mod.
    expect(s.kontant.maanedlig).toBeCloseTo(s.vaerdtab / 36, 10);
    // Kontantkøb kan aldrig være dyrere end et billån, fordi det ingen rente
    // har — derfor er det ikke en del af dommen i `billigst`.
    expect(s.kontant.nettoOmkostning).toBeLessThan(s.billaan.nettoOmkostning);
  });

  test("dommen gælder de to afdragsformer, aldrig kontantkøb", () => {
    // Helt uden restværdi er de to køb ligegyldige, og leasing har ikke noget
    // at vinde på: da skal `billigst` pege på den billigste af de to, aldrig på
    // kontantkøb, der altid ville vinde uden at sige noget.
    const s = beregnLeasingSammenlign({ ...LEASING_EKSEMPEL, restvaerdi: 0 })!;
    expect(s.billigst).toBe("leasing");
    expect(s.billaanFordel).toBeLessThan(0);
  });

  test("ved 0 % rente bliver billånet en ren fordeling af lånet", () => {
    const s = beregnLeasingSammenlign({ ...LEASING_EKSEMPEL, rentesats: 0 })!;

    expect(s.billaan.maanedlig).toBeCloseTo(270000 / 36, 10);
    expect(s.leasing.maanedlig).toBeCloseTo(120000 / 36, 10);
    expect(s.billaan.nettoOmkostning).toBeCloseTo(300000 - 150000, 6);
  });

  test("restværdien over bilprisen giver en negativ afskrivning, som modellen ikke dækker", () => {
    // Bevidst: modellen tager bilprisen minus udbetalingen minus restværdien som
    // afskrivning, så en restværdi over prisen giver en negativ månedlig ydelse.
    // Skal det kastes, er det en ny regel — ikke en test, der skal slås fra.
    const s = beregnLeasingSammenlign({ ...LEASING_EKSEMPEL, restvaerdi: 400000 })!;
    expect(s.leasing.maanedlig).toBeLessThan(0);
  });
});

describe("leasingSammenlignSætning", () => {
  const sammenlign = beregnLeasingSammenlign(LEASING_EKSEMPEL)!;

  test("sætningen citerer de beregnede tal, ikke håndskrevne", () => {
    const da = leasingSammenlignSætning(sammenlign, 36, "da");
    // 319.140 − 150.000 = 169.140 kr. mod leasingens 178.350 kr.
    expect(da).toContain("169.140");
    expect(da).toContain("178.350");
    expect(da).toContain("et billån");
    expect(da).toContain("150.000");
    expect(da).toContain("36 måneder");
  });

  test("svensk og norsk er hver sin sætning med hvert sprog separator", () => {
    const se = leasingSammenlignSætning(sammenlign, 36, "se");
    const no = leasingSammenlignSætning(sammenlign, 36, "no");

    expect(se).toContain("169 140");
    expect(se).toContain("178 350");
    expect(se).toContain("ett billån");
    expect(se).not.toContain("169.140");
    expect(no).toContain("169 140");
    expect(no).not.toBe(se);
    expect(leasingSammenlignSætning(sammenlign, 36, "da")).not.toBe(se);
  });

  test("vinderen afhænger af tallene, så en ny restværdi skriver sætningen om", () => {
    const dyrt = beregnLeasingSammenlign({ ...LEASING_EKSEMPEL, restvaerdi: 10000 })!;
    expect(dyrt.billigst).toBe("leasing");
    const da = leasingSammenlignSætning(dyrt, 36, "da");
    expect(da).toContain("leasing billigst");
    expect(da).toContain("0 kr.");
  });
});

describe("leasingSammenlignFaqSvar", () => {
  const sammenlign = beregnLeasingSammenlign(LEASING_EKSEMPEL)!;

  test("svaret på svensk svarer med de beregnede tal", () => {
    const se = leasingSammenlignFaqSvar(sammenlign, "se");
    expect(se).toContain("178 350 kr");
    expect(se).toContain("169 140 kr");
    // Billånet er billigere (169 140 < 178 350), så forskellen er «mindre».
    expect(sammenlign.billigst).toBe("billaan");
    expect(se).toContain("9 210 kr mindre");
    expect(se).toContain("150 000 kr kvar att sälja den för");
    expect(se).toContain("4,5 %");
    expect(se).toContain("36 månader");
  });

  test("hvert sprog er sin egen sætning med sin egen separator", () => {
    const da = leasingSammenlignFaqSvar(sammenlign, "da");
    const no = leasingSammenlignFaqSvar(sammenlign, "no");
    const se = leasingSammenlignFaqSvar(sammenlign, "se");

    expect(da).toContain("178.350 kr.");
    expect(da).toContain("169.140 kr,");
    expect(da).toContain("9.210 kr mindre");
    expect(no).toContain("178 350 kr");
    expect(no).toContain("9 210 kr mindre");
    expect(new Set([da, no, se]).size).toBe(3);
  });

  test("ingen sætning sætter kr. ved siden af sit eget punktum", () => {
    for (const locale of ["da", "se", "no"] as const) {
      const svar = leasingSammenlignFaqSvar(sammenlign, locale);
      expect(svar).not.toMatch(/kr\.\.|kr\.,/);
    }
  });

  test("svaret skifter retning, når leasing bliver billigere", () => {
    // Uden restværdi er de to afdragsformer næsten lige dyre, og leasing
    // vinder. Sætningen må ikke stå og sige "mindre" om en fordel.
    const ingenRest = beregnLeasingSammenlign({ ...LEASING_EKSEMPEL, restvaerdi: 0 })!;
    const se = leasingSammenlignFaqSvar(ingenRest, "se");
    expect(ingenRest.billigst).toBe("leasing");
    expect(se).toContain("mer");
    expect(se).not.toContain("mindre");
  });

  // Bevar at «mer»/«mindre» beskriver **billånet**: ordet skal følge den
  // afdragsform, der reelt er billigst, i alle tre sprog. Uden denne kan
  // en ny standardværdi få sætningen til at modsige tabellen.
  test("«mer»/«mindre» følger den billigste afdragsform i alle sprog", () => {
    const restvaerdier = [150000, 10000, 0, 60000];
    for (const restvaerdi of restvaerdier) {
      const s = beregnLeasingSammenlign({ ...LEASING_EKSEMPEL, restvaerdi })!;
      const forventetDa = s.billigst === "billaan" ? "mindre" : "mere";
      const forventetSeNo = s.billigst === "billaan" ? "mindre" : "mer";
      for (const locale of ["da", "se", "no"] as const) {
        const svar = leasingSammenlignFaqSvar(s, locale);
        const ord = svar.match(/(mindre|mere|mer)\./)?.[1];
        expect(ord, `restvaerdi ${restvaerdi}, ${locale}`).toBe(
          locale === "da" ? forventetDa : forventetSeNo,
        );
      }
    }
  });
});
