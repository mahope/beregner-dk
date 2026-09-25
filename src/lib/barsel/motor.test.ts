import { describe, expect, test } from "vitest";
import { analyserPlan, blokBeskrivelse, blokke } from "./motor";
import { beregnOekonomi, ugesats } from "./oekonomi";
import { rettigheder } from "./regler";
import {
  anvendSkabelon,
  nyForaelder,
  saetNaertstaaende,
  skiftKonstellation,
  standardPlan,
  type SkabelonId,
} from "./skabeloner";
import type { BarselsPlan, Konstellation, Periode } from "./types";

const IDAG = "2026-09-25";

function plan(k: Konstellation = "mor-far", extra: Partial<BarselsPlan> = {}): BarselsPlan {
  const base = skiftKonstellation({ ...standardPlan(IDAG), dato: "2027-03-01" }, k);
  return { ...base, ...extra };
}

function medPerioder(p: BarselsPlan, a: Periode[], b?: Periode[]): BarselsPlan {
  return {
    ...p,
    foraeldre: p.foraeldre.map((f, i) => ({ ...f, perioder: i === 0 ? a : (b ?? []) })),
  };
}

const niveauer = (p: BarselsPlan) => analyserPlan(p, IDAG).beskeder.map((b) => `${b.niveau}:${b.id}`);
const fejlOgAdvarsler = (p: BarselsPlan) =>
  analyserPlan(p, IDAG).beskeder.filter((b) => b.niveau !== "info").map((b) => b.id);

describe("rettigheder pr. konstellation", () => {
  test("mor + far", () => {
    const p = plan("mor-far");
    const mor = rettigheder(p, p.foraeldre[0], 0);
    const far = rettigheder(p, p.foraeldre[1], 1);
    expect(mor.foerUger).toBe(4);
    expect(mor.efterUger).toBe(24);
    expect(mor.oeremaerketUger).toBe(11);
    // 8 weeks from weeks 3-10 (§ 7 a) + 5 after week 10 = 13
    expect(mor.overdrageligeUger).toBe(13);
    expect(far.foerUger).toBe(0);
    expect(far.efterUger).toBe(24);
    expect(far.oeremaerketUger).toBe(11);
    expect(far.overdrageligeUger).toBe(13);
    expect(mor.frist).toBe(52);
  });

  test("mor + medmor gives the medmor the same rights as a father", () => {
    const p = plan("mor-medmor");
    const medmor = rettigheder(p, p.foraeldre[1], 1);
    expect(medmor.rolle).toBe("partner");
    expect(medmor.efterUger).toBe(24);
    expect(p.foraeldre[1].navn).toBe("Medmor");
  });

  test("two fathers via surrogacy: 6 + 18 weeks each", () => {
    const p = plan("to-foraeldre");
    for (const [i, f] of p.foraeldre.entries()) {
      const r = rettigheder(p, f, i);
      expect(r.foerUger).toBe(0);
      expect(r.efterUger).toBe(24);
      expect(r.oeremaerketUger).toBe(11);
      expect(r.overdrageligeUger).toBe(4 + 9);
    }
  });

  test("solo parent: 22 extra weeks, 46 after the birth", () => {
    const p = plan("solo");
    expect(p.foraeldre).toHaveLength(1);
    const r = rettigheder(p, p.foraeldre[0], 0);
    expect(r.foerUger).toBe(4);
    expect(r.efterUger).toBe(46);
  });

  test("adoption: 4 weeks before from abroad, 1 week in Denmark", () => {
    const udland = plan("adoption-par", { adoptionUdland: true });
    const dk = plan("adoption-par", { adoptionUdland: false });
    expect(rettigheder(udland, udland.foraeldre[0], 0).foerUger).toBe(4);
    expect(rettigheder(dk, dk.foraeldre[1], 1).foerUger).toBe(1);
    expect(rettigheder(dk, dk.foraeldre[1], 1).efterUger).toBe(24);
    const solo = plan("adoption-solo");
    expect(rettigheder(solo, solo.foraeldre[0], 0).efterUger).toBe(46);
  });

  test("multiple births add 13 weeks per parent, regardless of number of children", () => {
    for (const antal of [2, 3] as const) {
      const p = plan("mor-far", { antalBoern: antal });
      expect(rettigheder(p, p.foraeldre[0], 0).efterUger).toBe(37);
      expect(rettigheder(p, p.foraeldre[1], 1).efterUger).toBe(37);
    }
  });

  test("hospitalisation extends the leave and the deadline", () => {
    const p = plan("mor-far", { indlaeggelsesUger: 6 });
    const r = rettigheder(p, p.foraeldre[0], 0);
    expect(r.efterUger).toBe(30);
    expect(r.frist).toBe(58);
    const gammel = plan("mor-far", { indlaeggelsesUger: 30, dato: "2025-12-01" });
    expect(rettigheder(gammel, gammel.foraeldre[0], 0).efterUger).toBe(24 + 13);
  });

  test("the 9 weeks are only earmarked for wage earners", () => {
    const p = plan("mor-far");
    p.foraeldre[1] = { ...p.foraeldre[1], beskaeftigelse: "selvstaendig" };
    const far = rettigheder(p, p.foraeldre[1], 1);
    expect(far.oeremaerketUger).toBe(2);
    expect(far.overdrageligeUger).toBe(22);
  });
});

describe("standardplaner er gyldige", () => {
  const konstellationer: Konstellation[] = ["mor-far", "mor-medmor", "to-foraeldre", "solo", "adoption-par", "adoption-solo"];
  const skabeloner: SkabelonId[] = ["klassisk", "lige", "sammen"];
  for (const k of konstellationer) {
    for (const s of skabeloner) {
      for (const antal of [1, 2] as const) {
        test(`${k} / ${s} / ${antal} barn`, () => {
          const p = anvendSkabelon(plan(k, { antalBoern: antal }), s);
          const fejl = fejlOgAdvarsler(p);
          expect(fejl).toEqual([]);
          const a = analyserPlan(p, IDAG);
          for (const f of a.foraeldre) expect(f.udenRet).toBe(0);
        });
      }
    }
  }

  test("classic mor + far: mother holds 37 weeks after birth, 13 received from the father", () => {
    const a = analyserPlan(anvendSkabelon(plan("mor-far"), "klassisk"), IDAG);
    const [mor, far] = a.foraeldre;
    expect(mor.brugtFoer).toBe(4);
    expect(mor.brugtEfter).toBe(37);
    expect(mor.modtaget).toBe(13);
    expect(far.afgivet).toBe(13);
    expect(far.brugtEfter).toBe(11);
    expect(far.tabteOeremaerkede).toBe(0);
    expect(a.faellesUger).toBe(2);
  });

  test("equal split has no transfers and no overlap after the first 2 weeks", () => {
    const a = analyserPlan(anvendSkabelon(plan("mor-far"), "lige"), IDAG);
    expect(a.foraeldre[0].modtaget).toBe(0);
    expect(a.foraeldre[1].modtaget).toBe(0);
    expect(a.faellesUger).toBe(2);
  });

  test("twins, classic: all 74 weeks after birth fit within the year", () => {
    const a = analyserPlan(anvendSkabelon(plan("mor-far", { antalBoern: 2 }), "klassisk"), IDAG);
    expect(a.foraeldre[0].brugtEfter + a.foraeldre[1].brugtEfter).toBe(74);
  });
});

describe("validering", () => {
  test("mother must be on leave the first 2 weeks", () => {
    const p = medPerioder(plan(), [{ start: 1, slut: 24, type: "orlov" }], [{ start: 0, slut: 2, type: "orlov" }]);
    expect(niveauer(p)).toContain("fejl:pligt-a");
    const ferie = medPerioder(plan(), [{ start: 0, slut: 1, type: "ferie" }, { start: 1, slut: 24, type: "orlov" }]);
    expect(niveauer(ferie)).toContain("fejl:pligt-a");
  });

  test("the other parent loses weeks not taken in the first 10 weeks", () => {
    const p = medPerioder(
      plan(),
      [{ start: -4, slut: 24, type: "orlov" }],
      [
        { start: 3, slut: 4, type: "orlov" },
        { start: 24, slut: 45, type: "orlov" },
      ]
    );
    const a = analyserPlan(p, IDAG);
    const b = a.beskeder.find((x) => x.id === "foedsel-b")!;
    expect(b.niveau).toBe("advarsel");
    expect(b.titel).toContain("1 uge");
    // The 2 weeks outside week 0-9 cannot be covered by the birth weeks → but by other buckets
    expect(a.foraeldre[1].tabteOeremaerkede).toBe(1);
  });

  test("the other parent may split the first weeks (info about agreement)", () => {
    const p = medPerioder(
      plan(),
      [{ start: -4, slut: 24, type: "orlov" }],
      [
        { start: 0, slut: 1, type: "orlov" },
        { start: 5, slut: 6, type: "orlov" },
        { start: 24, slut: 33, type: "orlov" },
      ]
    );
    expect(niveauer(p)).toContain("info:opdelt-b");
    expect(fejlOgAdvarsler(p)).not.toContain("foedsel-b");
  });

  test("unused earmarked weeks are flagged", () => {
    const p = medPerioder(plan(), [{ start: -4, slut: 37, type: "orlov" }], [{ start: 0, slut: 2, type: "orlov" }]);
    const a = analyserPlan(p, IDAG);
    expect(a.foraeldre[1].tabteOeremaerkede).toBe(9);
    expect(a.beskeder.find((x) => x.id === "oeremaerket-b")?.titel).toContain("9 uger");
  });

  test("more leave than rights gives an error and weeks without benefits", () => {
    const p = medPerioder(plan(), [{ start: -4, slut: 45, type: "orlov" }], [{ start: 0, slut: 11, type: "orlov" }]);
    const a = analyserPlan(p, IDAG);
    // Mother has 24 + max 13 from the father = 37 → 8 weeks without benefits
    expect(a.foraeldre[0].udenRet).toBe(8);
    expect(niveauer(p)).toContain("fejl:udenret-a");
  });

  test("earmarked weeks cannot be transferred", () => {
    const p = medPerioder(plan(), [{ start: -4, slut: 46, type: "orlov" }], [{ start: 0, slut: 2, type: "orlov" }]);
    const a = analyserPlan(p, IDAG);
    expect(a.foraeldre[0].modtaget).toBe(13);
    expect(a.foraeldre[0].udenRet).toBe(9);
  });

  test("self-employed father can transfer all 22 weeks", () => {
    const base = plan();
    base.foraeldre[1] = { ...base.foraeldre[1], beskaeftigelse: "selvstaendig" };
    const p = medPerioder(base, [{ start: -4, slut: 46, type: "orlov" }], [{ start: 0, slut: 2, type: "orlov" }]);
    const a = analyserPlan(p, IDAG);
    expect(a.foraeldre[0].modtaget).toBe(22);
    expect(a.foraeldre[0].udenRet).toBe(0);
    expect(a.foraeldre[1].tabteOeremaerkede).toBe(0);
  });

  test("mother can transfer weeks 3-10 to the father (§ 7 a)", () => {
    const p = medPerioder(
      plan(),
      [
        { start: -4, slut: 2, type: "orlov" },
        { start: 10, slut: 24, type: "orlov" },
      ],
      [{ start: 0, slut: 32, type: "orlov" }]
    );
    const a = analyserPlan(p, IDAG);
    expect(a.foraeldre[1].modtaget).toBe(8);
    expect(a.foraeldre[1].udenRet).toBe(0);
    expect(niveauer(p)).toContain("info:7a-b");
  });

  test("part-time leave uses a fraction of a week and extends the deadline", () => {
    const p = medPerioder(
      plan(),
      [
        { start: -4, slut: 10, type: "orlov" },
        { start: 10, slut: 38, type: "deltid", arbejdsProcent: 50 },
      ],
      [{ start: 0, slut: 2, type: "orlov" }, { start: 38, slut: 47, type: "orlov" }]
    );
    const a = analyserPlan(p, IDAG);
    expect(a.foraeldre[0].brugtEfter).toBe(24);
    expect(a.foraeldre[0].deltidsForlaengelse).toBe(14);
    expect(a.foraeldre[0].frist).toBe(66);
  });

  test("leave after the first year without postponement is flagged", () => {
    const p = medPerioder(
      plan(),
      [{ start: -4, slut: 24, type: "orlov" }],
      [
        { start: 0, slut: 2, type: "orlov" },
        { start: 50, slut: 60, type: "orlov" },
      ]
    );
    expect(fejlOgAdvarsler(p)).toEqual(expect.arrayContaining(["udenret-b"]));
  });

  test("overlap is reported as shared weeks", () => {
    const a = analyserPlan(anvendSkabelon(plan(), "sammen"), IDAG);
    expect(a.faellesUger).toBe(24);
    expect(a.beskeder.find((x) => x.id === "faelles")?.niveau).toBe("info");
  });

  test("postponed weeks are reserved from the shareable weeks", () => {
    const base = plan();
    base.foraeldre[1] = { ...base.foraeldre[1], udskudteUger: 5 };
    const p = anvendSkabelon(base, "lige");
    const a = analyserPlan(p, IDAG);
    expect(a.foraeldre[1].udskudt).toBe(5);
    expect(a.foraeldre[1].brugtEfter).toBe(19);
    expect(fejlOgAdvarsler(p)).toEqual([]);
    base.foraeldre[1] = { ...base.foraeldre[1], udskudteUger: 8 };
    expect(niveauer(anvendSkabelon(base, "lige"))).toContain("info:udskudt-aftale-b");
  });

  test("solo parent can transfer weeks to a close relative", () => {
    const solo = saetNaertstaaende(plan("solo"), true);
    expect(solo.foraeldre).toHaveLength(2);
    const p = medPerioder(
      solo,
      [{ start: -4, slut: 30, type: "orlov" }],
      [{ start: 30, slut: 46, type: "orlov" }]
    );
    const a = analyserPlan(p, IDAG);
    expect(a.foraeldre[1].modtaget).toBe(16);
    expect(a.foraeldre[1].udenRet).toBe(0);
    expect(niveauer(p)).toContain("info:naert-b");
    // Earmarked weeks stay with the parent: 46 - 11 = 35 transferable at most
    const forMeget = medPerioder(solo, [{ start: -4, slut: 10, type: "orlov" }], [{ start: 10, slut: 50, type: "orlov" }]);
    expect(analyserPlan(forMeget, IDAG).foraeldre[1].modtaget).toBe(27);
  });
});

describe("varsler", () => {
  test("mother 3 months before, other parent 4 weeks before, later leave 6 weeks after", () => {
    const a = analyserPlan(anvendSkabelon(plan(), "klassisk"), IDAG);
    const mor = a.varsler.filter((v) => v.foraelder === "a");
    const far = a.varsler.filter((v) => v.foraelder === "b");
    expect(mor.find((v) => v.titel.includes("graviditeten"))?.dato).toBe("2026-12-01");
    expect(far.find((v) => v.titel.includes("første 10 uger"))?.dato).toBe("2027-02-01");
    expect(far.find((v) => v.titel.includes("efter uge 10"))?.dato).toBe("2027-04-12");
    expect(mor.find((v) => v.titel.includes("Søg"))?.dato).toBe("2027-04-26");
  });
});

describe("blokke til arbejdsgiver", () => {
  test("splits periods at birth and at week 10 with dates", () => {
    const p = anvendSkabelon(plan(), "klassisk");
    const a = analyserPlan(p, IDAG);
    const mor = blokke(p, a.foraeldre[0]);
    expect(mor.map((b) => [b.type, b.fase, b.fra, b.til])).toEqual([
      ["graviditet", "foer", "2027-02-01", "2027-02-28"],
      ["orlov", "tidlig", "2027-03-01", "2027-05-09"],
      ["orlov", "senere", "2027-05-10", "2027-11-14"],
    ]);
    expect(blokBeskrivelse(mor[1], false)).toBe("Barselsorlov i de første 10 uger efter fødslen (10 uger)");
  });
});

describe("økonomi", () => {
  test("weekly rate uses hourly pay after AM-bidrag and the 2026 cap", () => {
    const lav = { ...nyForaelder("a", "A"), maanedsloen: 20000 };
    // 20.000 × 12 / 52 / 37 × 0,92 × 37
    expect(ugesats(lav)).toBeCloseTo((20000 * 12) / 52 * 0.92, 5);
    const hoej = { ...nyForaelder("a", "A"), maanedsloen: 60000 };
    expect(ugesats(hoej)).toBe(5085);
    expect(ugesats({ ...hoej, beskaeftigelse: "studerende" })).toBe(0);
    expect(ugesats({ ...hoej, beskaeftigelse: "ledig", ydelseMaaned: 20000 })).toBeCloseTo((20000 * 12) / 52, 5);
  });

  test("salary during leave replaces benefits for the paid weeks", () => {
    const base = anvendSkabelon(plan(), "lige");
    base.foraeldre[0] = { ...base.foraeldre[0], maanedsloen: 40000, loenUnderBarsel: [{ uger: 14, procent: 100 }] };
    const a = analyserPlan(base, IDAG);
    const o = beregnOekonomi(base, a);
    const mor = o.foraeldre[0];
    const uden = beregnOekonomi(
      { ...base, foraeldre: [{ ...base.foraeldre[0], loenUnderBarsel: [] }, base.foraeldre[1]] },
      a
    ).foraeldre[0];
    expect(mor.bruttoIAlt).toBeGreaterThan(uden.bruttoIAlt);
    expect(mor.tabBrutto).toBeLessThan(uden.tabBrutto);
    // First paid week is at full salary
    expect(mor.maaneder[0].brutto).toBeGreaterThan(0);
  });

  test("normal months equal salary and totals add up", () => {
    const p = anvendSkabelon(plan(), "klassisk");
    const o = beregnOekonomi(p, analyserPlan(p, IDAG));
    expect(o.husstand).toHaveLength(o.maaneder.length);
    const f = o.foraeldre[1];
    const fuld = f.maaneder.find((m) => Math.abs(m.brutto - m.normal) < 1 && m.normal > 30000);
    expect(fuld).toBeDefined();
    expect(o.tabBrutto).toBeCloseTo(o.foraeldre[0].tabBrutto + o.foraeldre[1].tabBrutto, 6);
    expect(o.tabNetto).toBeGreaterThan(0);
    expect(o.tabNetto).toBeLessThan(o.tabBrutto);
  });

  test("part-time week mixes salary and benefits", () => {
    const base = medPerioder(plan(), [
      { start: -4, slut: 10, type: "orlov" },
      { start: 10, slut: 11, type: "deltid", arbejdsProcent: 60 },
    ]);
    const o = beregnOekonomi(base, analyserPlan(base, IDAG));
    expect(o.foraeldre[0].bruttoIAlt).toBeGreaterThan(0);
  });
});
