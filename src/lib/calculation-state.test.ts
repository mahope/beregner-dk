import { afterEach, describe, expect, test } from "vitest";
import {
  clearStateFromUrl,
  decodeCalculationState,
  encodeCalculationState,
  generateShareableLink,
  getStateFromUrl,
  updateUrlWithState,
} from "./calculation-state";
import type { CalculationState } from "./calculation-state";
import { calculationStatePrivacyScript } from "./calculation-state-privacy";

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

  test("keeps legacy BMI age fields decodable", () => {
    const legacy = "eyJ2IjoiMSIsInQiOiJibWkiLCJpIjp7InZhZWd0Ijo4MCwiaG9lamRlIjoxODAsImtvZW4iOiJrdmluZGUiLCJhbGRlciI6OH0sInRzIjoxNzAwMDAwMDAwMDAwfQ";

    const decoded = decodeCalculationState(legacy);

    expect(decoded?.inputs.alder).toBe(8);
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

describe("URL state location", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/");
  });

  test("kan generere et fragment-link uden at ændre standardlinks", () => {
    const state: CalculationState = {
      type: "boligstoette",
      inputs: { husstandsindkomst: 216000 },
      timestamp: 1700000000000,
    };
    const fragmentLink = generateShareableLink(state, { useFragment: true });
    const fragmentUrl = new URL(fragmentLink.fullUrl);

    expect(fragmentUrl.searchParams.has("s")).toBe(false);
    expect(fragmentUrl.hash).toMatch(/^#s=.+/);

    const legacyLink = generateShareableLink(state);
    expect(new URL(legacyLink.fullUrl).searchParams.has("s")).toBe(true);
  });

  test("understøtter fragment-state og fortsat gamle query-links", () => {
    const encoded = encodeCalculationState({
      type: "boligstoette",
      inputs: { husstandsindkomst: 216000 },
      timestamp: 1700000000000,
    });

    window.history.replaceState({}, "", `/boligstoette#s=${encoded}`);
    expect(getStateFromUrl()?.inputs.husstandsindkomst).toBe(216000);

    window.history.replaceState({}, "", `/boligstoette?s=${encoded}`);
    expect(getStateFromUrl()?.inputs.husstandsindkomst).toBe(216000);
  });

  test("fjerner fragment-state før tredjepartsscripts og bruger lokal history-buffer", () => {
    const encoded = encodeCalculationState({
      type: "boligstoette",
      inputs: { husstandsindkomst: 216000 },
      timestamp: 1700000000000,
    });
    window.history.replaceState({ existing: true }, "", `/boligstoette#s=${encoded}&guide`);

    new Function(calculationStatePrivacyScript)();

    expect(window.location.hash).toBe("#guide");
    expect(window.location.search).toBe("");
    expect(window.history.state).toMatchObject({ existing: true });
    expect(getStateFromUrl()?.inputs.husstandsindkomst).toBe(216000);
    expect(window.history.state).toEqual({ existing: true });
  });

  test("scrubber fragment-state før analytics kan læse samme-rute navigation", () => {
    const encoded = encodeCalculationState({
      type: "boligstoette",
      inputs: { husstandsindkomst: 216000 },
      timestamp: 1700000000000,
    });
    new Function(calculationStatePrivacyScript)();

    window.history.pushState(
      { existing: true },
      "",
      `/boligstoette#s=${encoded}&guide`,
    );

    expect(window.location.href).not.toContain(encoded);
    expect(window.location.hash).toBe("#guide");
    expect(getStateFromUrl()?.inputs.husstandsindkomst).toBe(216000);
  });

  test("bevarer scrubbet state ved en ren replaceState på samme rute", () => {
    const encoded = encodeCalculationState({
      type: "boligstoette",
      inputs: { husstandsindkomst: 216000 },
      timestamp: 1700000000000,
    });
    new Function(calculationStatePrivacyScript)();

    window.history.pushState(
      { existing: true },
      "",
      `/boligstoette#s=${encoded}&guide`,
    );
    window.history.replaceState({ router: true }, "", "/boligstoette");

    expect(getStateFromUrl()?.inputs.husstandsindkomst).toBe(216000);
    expect(window.history.state).toEqual({ router: true });
  });

  test("rydder state uden at fjerne andre fragment-ankere", () => {
    const encoded = encodeCalculationState({
      type: "boligstoette",
      inputs: { husstandsindkomst: 216000 },
      timestamp: 1700000000000,
    });
    window.history.replaceState(
      { existing: true, __NA: true },
      "",
      `/boligstoette?s=${encoded}#guide`,
    );

    clearStateFromUrl();

    expect(new URL(window.location.href).searchParams.has("s")).toBe(false);
    expect(new URL(window.location.href).hash).toBe("#guide");
    expect(window.history.state).toEqual({ existing: true, __NA: true });
  });

  test("skjuler ny boligstøtte-query-state og bevarer fragmentanker", () => {
    const oldState = encodeCalculationState({
      type: "boligstoette",
      inputs: { husstandsindkomst: 100000 },
      timestamp: 1700000000000,
    });
    window.history.replaceState({}, "", `/boligstoette?s=legacy#s=${oldState}&guide`);

    updateUrlWithState({
      type: "boligstoette",
      inputs: { husstandsindkomst: 216000 },
      timestamp: 1700000000000,
    });

    const url = new URL(window.location.href);
    expect(url.searchParams.has("s")).toBe(false);
    expect(url.hash).toBe("#guide");
    expect(getStateFromUrl()?.inputs.husstandsindkomst).toBe(216000);
  });

  test("opdaterer og rydder både fragment- og legacy query-state", () => {
    window.history.replaceState({}, "", "/su?behold=ja");

    updateUrlWithState({
      type: "su",
      inputs: { husstandsindkomst: 216000 },
      timestamp: 1700000000000,
    });

    expect(new URL(window.location.href).searchParams.get("behold")).toBe("ja");
    expect(new URL(window.location.href).searchParams.has("s")).toBe(true);
    expect(new URL(window.location.href).hash).toBe("");

    clearStateFromUrl();
    expect(new URL(window.location.href).hash).toBe("");
    expect(new URL(window.location.href).searchParams.get("behold")).toBe("ja");
  });
});
