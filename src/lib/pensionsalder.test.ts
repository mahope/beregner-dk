import { describe, expect, it } from "vitest";
import {
  PENSIONSALDER_KOHORTER,
  PENSIONSALDER_KILDE,
  beregnPensionsalder,
  formaterAlder,
  kohortForFoedselsdato,
  pensionsalderEksempel,
  pensionsalderRaekker,
} from "./pensionsalder";

const dato = (aar: number, maaned: number, dag: number) =>
  new Date(aar, maaned - 1, dag, 0, 0, 0, 0);

/** Skemaet er låst: otte kohorter, åben opad, i rækkefølge. */
describe("PENSIONSALDER_KOHORTER", () => {
  it("dækker 65 år (født 1953 eller tidligere) til 70 år (født 1971+)", () => {
    expect(PENSIONSALDER_KOHORTER).toHaveLength(8);
    expect(PENSIONSALDER_KOHORTER[0].foedselsdatoLabel).toBe("31. december 1953 eller tidligere");
    expect(PENSIONSALDER_KOHORTER[0].helAar).toBe(65);
    expect(PENSIONSALDER_KOHORTER.at(-1)?.foedselsdatoLabel).toBe("1. januar 1971 eller senere");
    expect(PENSIONSALDER_KOHORTER.at(-1)?.til).toBeNull();
    expect(PENSIONSALDER_KOHORTER.at(-1)?.helAar).toBe(70);
  });

  it("har netop to halvårskohorter, 65 ½ og 66 ½", () => {
    const halve = PENSIONSALDER_KOHORTER.filter((k) => k.halvtAar);
    expect(halve.map((k) => `${k.helAar} ½`)).toEqual(["65 ½", "66 ½"]);
  });

  it("er sammenhængende uden huller eller overlap", () => {
    for (let i = 1; i < PENSIONSALDER_KOHORTER.length; i++) {
      const forrige = PENSIONSALDER_KOHORTER[i - 1];
      const naeste = PENSIONSALDER_KOHORTER[i];
      expect(forrige.til).not.toBeNull();
      const naesteDag = new Date(forrige.til as Date);
      naesteDag.setDate(naesteDag.getDate() + 1);
      expect(naeste.fra.getTime()).toBe(naesteDag.getTime());
    }
  });
});

describe("formaterAlder", () => {
  it("skriver halve år som brøktal, som kilden gør", () => {
    expect(formaterAlder(65, true)).toBe("65 ½ år");
    expect(formaterAlder(68, false)).toBe("68 år");
  });
});

describe("kohortForFoedselsdato", () => {
  it("finder kohorten på grænserne", () => {
    const kohorte = (d: Date) => formaterAlder(
      kohortForFoedselsdato(d).helAar,
      kohortForFoedselsdato(d).halvtAar,
    );
    expect(kohorte(dato(1953, 12, 31))).toBe("65 år");
    expect(kohorte(dato(1954, 1, 1))).toBe("65 ½ år");
    expect(kohorte(dato(1954, 6, 30))).toBe("65 ½ år");
    expect(kohorte(dato(1954, 7, 1))).toBe("66 år");
    expect(kohorte(dato(1954, 12, 31))).toBe("66 år");
    expect(kohorte(dato(1955, 1, 1))).toBe("66 ½ år");
    expect(kohorte(dato(1955, 6, 30))).toBe("66 ½ år");
    expect(kohorte(dato(1955, 7, 1))).toBe("67 år");
    expect(kohorte(dato(1962, 12, 31))).toBe("67 år");
    expect(kohorte(dato(1963, 1, 1))).toBe("68 år");
    expect(kohorte(dato(1966, 12, 31))).toBe("68 år");
    expect(kohorte(dato(1967, 1, 1))).toBe("69 år");
    expect(kohorte(dato(1970, 12, 31))).toBe("69 år");
    expect(kohorte(dato(1971, 1, 1))).toBe("70 år");
    expect(kohorte(dato(2000, 5, 5))).toBe("70 år");
  });

  it("tæller 29. februar som 28. februar, så skudår mister sin kohort", () => {
    // 29/2 1964 falder i kohorten 1963-1966 (68 år), ligesom 28/2 gør.
    expect(kohortForFoedselsdato(dato(1964, 2, 29)).helAar).toBe(68);
    expect(kohortForFoedselsdato(dato(1964, 2, 29)).fra).toEqual(dato(1963, 1, 1));
  });
});

describe("beregnPensionsalder", () => {
  it("regner alderen fra fødselsdagen og udbetaling fra 1. i samme måned", () => {
    // Født 15. marts 1968 -> 69 år 15. marts 2037 -> pension fra 1. marts 2037.
    const resultat = beregnPensionsalder(dato(1968, 3, 15), dato(2026, 10, 9));
    expect(resultat.alderTekst).toBe("69 år");
    expect(resultat.alderFyldesDato).toEqual(dato(2037, 3, 15));
    expect(resultat.foerstePensionsdag).toEqual(dato(2037, 3, 1));
    expect(resultat.alderNaaet).toBe(false);
  });

  it("lægger halve år på som seks måneder", () => {
    // Født 1. januar 1954 -> 65 ½ år 1. juli 2019 -> pension fra 1. juli 2019.
    const jan = beregnPensionsalder(dato(1954, 1, 1), dato(2026, 10, 9));
    expect(jan.alderTekst).toBe("65 ½ år");
    expect(jan.alderFyldesDato).toEqual(dato(2019, 7, 1));
    expect(jan.foerstePensionsdag).toEqual(dato(2019, 7, 1));
    expect(jan.alderNaaet).toBe(true);

    // Født 30. juni 1954 -> 65 ½ år 31. december 2019.
    const juni = beregnPensionsalder(dato(1954, 6, 30), dato(2026, 10, 9));
    expect(juni.alderFyldesDato).toEqual(dato(2019, 12, 30));
    expect(juni.foerstePensionsdag).toEqual(dato(2019, 12, 1));
  });

  it("giver 67 år til hele 1955-1962-kohorten", () => {
    const resultat = beregnPensionsalder(dato(1962, 12, 31), dato(2026, 10, 9));
    expect(resultat.alderTekst).toBe("67 år");
    expect(resultat.alderFyldesDato).toEqual(dato(2029, 12, 31));
    expect(resultat.foerstePensionsdag).toEqual(dato(2029, 12, 1));
  });

  it("regner 29. februar-køre helt frem med 28. februar", () => {
    // Født 29/2 1964 -> 68 år 28/2 2032 -> pension fra 1. februar 2032.
    const resultat = beregnPensionsalder(dato(1964, 2, 29), dato(2026, 10, 9));
    expect(resultat.alderTekst).toBe("68 år");
    expect(resultat.alderFyldesDato).toEqual(dato(2032, 2, 28));
    expect(resultat.foerstePensionsdag).toEqual(dato(2032, 2, 1));
  });

  it("kalder alderen nået først på dagens dato", () => {
    // Født 15. marts 1958 -> 67 år 15. marts 2025 -> nået på dagen, ikke dagen før.
    expect(beregnPensionsalder(dato(1958, 3, 15), dato(2025, 3, 14)).alderNaaet).toBe(false);
    expect(beregnPensionsalder(dato(1958, 3, 15), dato(2025, 3, 15)).alderNaaet).toBe(true);
  });

  it("sætter 1971-kohorten på 70 år ved fødsel 1. januar", () => {
    const resultat = beregnPensionsalder(dato(1971, 1, 1), dato(2026, 10, 9));
    expect(resultat.alderTekst).toBe("70 år");
    expect(resultat.alderFyldesDato).toEqual(dato(2041, 1, 1));
  });

  it("holder kohortedatoerne i europæiske kalenderdage", () => {
    // Alderen er et kalenderbegreb: midnat lokal tid, ikke UTC.
    const resultat = beregnPensionsalder(dato(1970, 12, 31), dato(2026, 10, 9));
    expect(resultat.alderFyldesDato.getHours()).toBe(0);
    expect(resultat.alderFyldesDato.getFullYear()).toBe(2039);
    expect(resultat.foerstePensionsdag.getMonth()).toBe(11); // december
  });
});

describe("eksempel og skematabellen", () => {
  it("eksemplet er 1968-kohorten: 69 år fra 1. marts 2037", () => {
    const eksempel = pensionsalderEksempel();
    expect(eksempel.alderTekst).toBe("69 år");
    expect(eksempel.foerstePensionsdag).toEqual(dato(2037, 3, 1));
  });

  it("tabellen har én række pr. kohort", () => {
    const raekker = pensionsalderRaekker();
    expect(raekker).toHaveLength(PENSIONSALDER_KOHORTER.length);
    expect(raekker.map((r) => r.alderTekst)).toEqual([
      "65 år",
      "65 ½ år",
      "66 år",
      "66 ½ år",
      "67 år",
      "68 år",
      "69 år",
      "70 år",
    ]);
  });

  it("har en verificerbar kilde og -dato", () => {
    expect(PENSIONSALDER_KILDE.skema).toContain("borger.dk");
    expect(PENSIONSALDER_KILDE.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
