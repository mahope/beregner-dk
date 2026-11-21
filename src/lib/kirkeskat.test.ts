import { describe, expect, test } from "vitest";
import {
  beregnKirkeskat,
  kirkeskatSats,
  KIRKESKAT_EKSEMPLER,
  KIRKESKAT_SNIT,
} from "./kirkeskat";
import { KOMMUNER } from "./kommuner";

describe("kirkeskat", () => {
  test("beregner kirkeskat for København", () => {
    const resultat = beregnKirkeskat(500_000, "København");
    expect(resultat).not.toBeNull();
    expect(resultat!.sats).toBe(0.44);
    expect(resultat!.kirkeskat).toBe(2200);
    expect(resultat!.sparing).toBe(2200);
  });

  test("beregner kirkeskat for Aarhus", () => {
    const resultat = beregnKirkeskat(400_000, "Aarhus");
    expect(resultat).not.toBeNull();
    expect(resultat!.sats).toBe(0.59);
    expect(resultat!.kirkeskat).toBe(2360);
  });

  test("returnerer null for negativ indkomst", () => {
    expect(beregnKirkeskat(-1000, "København")).toBeNull();
  });

  test("returnerer null for nul indkomst", () => {
    expect(beregnKirkeskat(0, "København")).toBeNull();
  });

  test("returnerer null for NaN", () => {
    expect(beregnKirkeskat(NaN, "København")).toBeNull();
  });

  test("returnerer null for Infinity", () => {
    expect(beregnKirkeskat(Infinity, "København")).toBeNull();
  });

  test("bruger snit-sats for ukendt kommune", () => {
    const sats = kirkeskatSats("Ukendt Kommune");
    expect(sats).toBe(KIRKESKAT_SNIT);
    // Snittet er en procent som kommunernes egne satser (0,639 %), ikke en
    // brøkdel (0,00639). En fallback i forkert enhed ville give 100x for lidt.
    expect(sats).toBeGreaterThan(0.4);
    expect(sats).toBeLessThan(1);
  });

  test("finder korrekt sats for alle kommuner", () => {
    for (const kommune of KOMMUNER) {
      const sats = kirkeskatSats(kommune.navn);
      expect(sats).toBe(kommune.kirkeskat);
      expect(sats).toBeGreaterThan(0);
      expect(sats).toBeLessThan(2);
    }
  });

  test("eksempler er regnet korrekt", () => {
    for (const eksempel of KIRKESKAT_EKSEMPLER) {
      const resultat = beregnKirkeskat(eksempel.skattepligtig, eksempel.kommune);
      expect(resultat).not.toBeNull();
      expect(resultat!.kirkeskat).toBe(eksempel.resultat.kirkeskat);
    }
  });

  test("kirkeskat stiger med indkomst", () => {
    const lav = beregnKirkeskat(200_000, "København")!;
    const hoej = beregnKirkeskat(600_000, "København")!;
    expect(hoej.kirkeskat).toBeGreaterThan(lav.kirkeskat);
  });

  test("kirkeskat er proportional med indkomst", () => {
    const resultat = beregnKirkeskat(500_000, "København")!;
    // Proportionaliteten er det der tæller: kirkeskat = indkomst × sats, uanset
    // hvilken sats København har i 2026. Satsen står i `kommuner.ts` og kan
    // ændres fra år til år, men forholdet mellem de tre felter må ikke glide.
    expect(resultat.kirkeskat).toBe(
      Math.round(500_000 * (resultat.sats / 100))
    );
  });
});
