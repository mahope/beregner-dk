import { describe, expect, test } from "vitest";
import {
  PORTO_KILDE,
  PORTO_MAX_TYKKELSE_CM,
  PORTO_MAX_VAEGT_G,
  PORTO_VARER,
  beregnPorto,
  vaegtKlasse,
} from "./porto";

describe("vaegtKlasse", () => {
  test("binder breve til 100 g og 250 g", () => {
    expect(vaegtKlasse(1)).toBe(100);
    expect(vaegtKlasse(100)).toBe(100);
    expect(vaegtKlasse(101)).toBe(250);
    expect(vaegtKlasse(250)).toBe(250);
  });

  test("et tomt felt falder i den billigste klasse frem for at give ingen pris", () => {
    expect(vaegtKlasse(0)).toBe(100);
  });
});

describe("beregnPorto", () => {
  test("dao's seks priser er alle at finde i beregneren", () => {
    const forventede: [Omit<Parameters<typeof beregnPorto>[0], "antal">, number][] = [
      [{ destination: "danmark", type: "almindelig", vaegtGram: 50 }, 23],
      [{ destination: "danmark", type: "almindelig", vaegtGram: 200 }, 46],
      [{ destination: "danmark", type: "plus", vaegtGram: 80 }, 36],
      [{ destination: "danmark", type: "plus", vaegtGram: 150 }, 59],
      [{ destination: "udlandet", type: "almindelig", vaegtGram: 40 }, 46],
      [{ destination: "udlandet", type: "almindelig", vaegtGram: 120 }, 92],
    ];
    for (const [input, pris] of forventede) {
      expect(beregnPorto(input).pris, JSON.stringify(input)).toBe(pris);
    }
  });

  test("grænsen mellem de to vægtklasser er præcis 100 g", () => {
    expect(beregnPorto({ destination: "danmark", type: "almindelig", vaegtGram: 100 }).pris).toBe(23);
    expect(beregnPorto({ destination: "danmark", type: "almindelig", vaegtGram: 101 }).pris).toBe(46);
  });

  test("udland har ingen hasteservice: et PLUS-brev falder tilbage på almindeligt brev", () => {
    const resultat = beregnPorto({ destination: "udlandet", type: "plus", vaegtGram: 50 });
    expect(resultat.pris).toBe(46);
    expect(resultat.levering).toContain("4-16");
  });

  test("et brev over 250 g er et pakkespørgsmål, ikke en brevpris", () => {
    const resultat = beregnPorto({
      destination: "danmark",
      type: "almindelig",
      vaegtGram: 400,
    });
    expect(resultat.forTungt).toBe(true);
    expect(PORTO_MAX_VAEGT_G).toBe(250);
  });

  test("antal breve gange prisen, og antal runder ned til hele breve", () => {
    expect(
      beregnPorto({ destination: "danmark", type: "almindelig", vaegtGram: 30, antal: 12 }).total
    ).toBe(276);
    expect(
      beregnPorto({ destination: "danmark", type: "almindelig", vaegtGram: 30, antal: 0 }).antal
    ).toBe(1);
    expect(
      beregnPorto({ destination: "danmark", type: "almindelig", vaegtGram: 30, antal: 2.7 }).total
    ).toBe(46);
  });

  test("leveringsfristen følger brevtypen", () => {
    expect(beregnPorto({ destination: "danmark", type: "almindelig", vaegtGram: 20 }).levering).toBe(
      "2-5 hverdage"
    );
    expect(beregnPorto({ destination: "danmark", type: "plus", vaegtGram: 20 }).levering).toBe(
      "1-2 hverdage"
    );
  });
});

describe("prislistens helhed", () => {
  test("der er præcis seks linjer: tre typer plus udlandsbrev", () => {
    expect(PORTO_VARER).toHaveLength(6);
  });

  test("ingen pris er nul, og udland har ingen hasteservice", () => {
    for (const vare of PORTO_VARER) {
      expect(vare.pris, vare.pris.toString()).toBeGreaterThan(0);
    }
    expect(PORTO_VARER.filter((v) => v.destination === "udlandet" && v.type === "plus")).toHaveLength(0);
  });

  test("kilden er datet, så tallene kan genlæses når de ændrer sig", () => {
    expect(PORTO_KILDE.verifiedAt).toMatch(/^2026-10-\d\d$/);
    expect(PORTO_KILDE.priser).toContain("dao.as");
  });

  test("et brev må højst være 1 cm tykt", () => {
    expect(PORTO_MAX_TYKKELSE_CM).toBe(1);
  });
});
