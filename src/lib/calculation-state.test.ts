import { describe, test, expect } from "vitest";
import { encodeCalculationState, decodeCalculationState } from "./calculation-state";
import type { CalculationState } from "./calculation-state";

describe("encodeCalculationState / decodeCalculationState", () => {
  const state: CalculationState = {
    type: "bmi",
    inputs: { vaegt: 80, hoejde: 180 },
    timestamp: 1700000000000,
  };

  test("roundtrips correctly", () => {
    const encoded = encodeCalculationState(state);
    expect(encoded).toBeTruthy();
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = decodeCalculationState(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.type).toBe("bmi");
    expect(decoded!.inputs.vaegt).toBe(80);
    expect(decoded!.inputs.hoejde).toBe(180);
    expect(decoded!.timestamp).toBe(1700000000000);
  });

  test("produces URL-safe output (no +, /, =)", () => {
    const encoded = encodeCalculationState(state);
    expect(encoded).not.toMatch(/[+/=]/);
  });

  test("handles complex inputs", () => {
    const complex: CalculationState = {
      type: "loen",
      inputs: {
        bruttoLoen: 45000,
        periode: "maaned",
        medKirkeskat: true,
        kommuneSkat: 24.94,
        pension: 8,
      },
      timestamp: Date.now(),
    };

    const encoded = encodeCalculationState(complex);
    const decoded = decodeCalculationState(encoded);
    expect(decoded!.inputs.bruttoLoen).toBe(45000);
    expect(decoded!.inputs.medKirkeskat).toBe(true);
    expect(decoded!.inputs.pension).toBe(8);
  });

  test("returns null for invalid input", () => {
    expect(decodeCalculationState("not-valid-base64!!!")).toBeNull();
    expect(decodeCalculationState("")).toBeNull();
  });

  test("returns empty string for invalid state", () => {
    const result = encodeCalculationState(undefined as unknown as CalculationState);
    expect(result).toBe("");
  });
});
