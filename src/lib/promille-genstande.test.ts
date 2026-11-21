import { describe, test, expect } from "vitest";
import { beregnPromille, GRAM_PR_GENSTAND, PROMILLEGRANSE } from "./promille";
import {
  PROMILLE_GENSTANDE_RAEKKER,
  PROMILLE_VAEGTE,
  formatPromilleTabel,
  genstandeTilGraense,
  graenseSvar,
  vaegtNogle,
} from "./promille-genstande";

/**
 * Modulet ligger bagved både `/promille`'s tabel og FAQ'en, og det er
 * beregnet — ikke skrevet — fordi C84's fejlklasse er en tabel med egne tal,
 * der kan glide fra det værktøj den beskriver. Derfor evaluerer hver test her
 * mod `beregnPromille` frem for mod en hårdkodet forventning.
 */
describe("PROMILLE_GENSTANDE_RAEKKER", () => {
  test("hver celle er det beregnPromille selv regner", () => {
    for (const raekke of PROMILLE_GENSTANDE_RAEKKER) {
      for (const { vaegtKg, koen } of PROMILLE_VAEGTE) {
        const forventet = beregnPromille(raekke.genstande, vaegtKg, koen, 0)!;
        expect(raekke.promille[vaegtNogle(vaegtKg, koen)]).toBe(forventet.promille);
      }
    }
  });

  test("gram er antal gange GRAM_PR_GENSTAND, så læseren kan regne efter", () => {
    for (const raekke of PROMILLE_GENSTANDE_RAEKKER) {
      expect(raekke.gram).toBe(raekke.genstande * GRAM_PR_GENSTAND);
    }
  });

  test("den samme række giver højere promille for en let kvinde end for en tung mand", () => {
    // Det er den fordelingsfaktor, ikke bare vægten, der gør svaret. Uden
    // denne lås kunne en række byttes om ved en fejl, og tabellen ville så
    // læse "0,36 ‰" under den kolonne, der siger 80 kg.
    const to = PROMILLE_GENSTANDE_RAEKKER.find((r) => r.genstande === 2)!;
    expect(to.promille[vaegtNogle(60, "kvinde")]).toBeGreaterThan(
      to.promille[vaegtNogle(80, "mand")]
    );
  });

  test("promillen stiger med antallet genstande", () => {
    const raekker = [...PROMILLE_GENSTANDE_RAEKKER].sort((a, b) => a.genstande - b.genstande);
    for (let i = 1; i < raekker.length; i += 1) {
      for (const { vaegtKg, koen } of PROMILLE_VAEGTE) {
        const nogle = vaegtNogle(vaegtKg, koen);
        expect(raekker[i].promille[nogle]).toBeGreaterThan(raekker[i - 1].promille[nogle]);
      }
    }
  });
});

describe("formatPromilleTabel", () => {
  test("skriver komma i både dansk og svensk tekst", () => {
    // 0.5 med punktum er den fejl C76/C77/C78 rettede på otte sider.
    expect(formatPromilleTabel(0.5)).toBe("0,50");
    expect(formatPromilleTabel(1.45)).toBe("1,45");
    expect(formatPromilleTabel(2.18)).toBe("2,18");
  });
});

describe("graenseSvar", () => {
  test("skelner på tre, så teksten aldrig siger 'over' om en der kun er på den", () => {
    // 0,50 ‰ på 70 kg er præcis den danske grænse. `beregnPromille`
    // markerer netop det med `paaGraensen`, fordi begge landes love siger,
    // at man først bryder loven NÅR man overstiger grænsen.
    expect(graenseSvar(0.44, 0.5)).toBe("under");
    expect(graenseSvar(0.5, 0.5)).toBe("paa");
    expect(graenseSvar(0.66, 0.5)).toBe("over");
    expect(graenseSvar(0.44, 0.2)).toBe("over");
  });

  test("er enig med beregnPromilles egen paaGraensen-flag", () => {
    // `maaKoere` og `paaGraensen` regnes mod den grænse, man *giver*
    // beregnPromille — uden den bruger den altid den danske, og sammenligningen
    // ville teste 0,2 mod et flag, der var regnet på 0,5. Det var min første
    // version, og den faldt, fordi den var en fejltagelse, ikke fordi
    // graenseSvar var forkert.
    for (const antal of [1, 2, 3, 4, 6]) {
      for (const { vaegtKg, koen } of PROMILLE_VAEGTE) {
        for (const graense of [PROMILLEGRANSE.da, PROMILLEGRANSE.se]) {
          const r = beregnPromille(antal, vaegtKg, koen, 0, graense)!;
          expect(graenseSvar(r.promille, graense)).toBe(
            r.maaKoere ? "under" : r.paaGraensen ? "paa" : "over"
          );
        }
      }
    }
  });
});

describe("genstandeTilGraense", () => {
  test("det danske 0,5 nås ved to øl for en 70 kg mand", () => {
    // Rækken i tabellen siger 2 øl = 0,50 ‰, altså præcis på grænsen.
    // genstandeTilGraense skal derfor sige 2, ikke 1 og ikke 3.
    const antal = genstandeTilGraense(70, "mand", PROMILLEGRANSE.da)!;
    expect(antal).toBe(2);
    expect(beregnPromille(antal, 70, "mand", 0)!.promille).toBeGreaterThanOrEqual(
      PROMILLEGRANSE.da
    );
    expect(beregnPromille(antal - 1, 70, "mand", 0)!.promille).toBeLessThan(PROMILLEGRANSE.da);
  });

  test("det svenska 0,2 nås allerede ved én øl for alle tre kroppe", () => {
    // Sveriges grænse er halvdelen af Danmarks, så her er svaret ét
    // standardglas — ikke to. Skrev siden "samma antal" i stedet for tallet,
    // var det kun rigtigt, fordi de tilfældigvis var ens.
    for (const { vaegtKg, koen } of PROMILLE_VAEGTE) {
      expect(genstandeTilGraense(vaegtKg, koen, PROMILLEGRANSE.se)).toBe(1);
    }
  });

  test("svarer aldrig med et antal under den danske, fordi det er strengest", () => {
    for (const { vaegtKg, koen } of PROMILLE_VAEGTE) {
      const da = genstandeTilGraense(vaegtKg, koen, PROMILLEGRANSE.da);
      const se = genstandeTilGraense(vaegtKg, koen, PROMILLEGRANSE.se);
      expect(se!).toBeLessThanOrEqual(da!);
    }
  });
});
