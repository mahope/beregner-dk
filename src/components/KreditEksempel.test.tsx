import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { BILLAAN_LAANGIVERE, PANTSAT, formatHentetDato } from "@/lib/kredit-eksempler";
import { KreditEksempel } from "./KreditEksempel";

describe("KreditEksempel", () => {
  test("viser långiverens eksempel med kilde og dato", () => {
    const nordea = BILLAAN_LAANGIVERE.find((l) => l.navn === "Nordea")!;
    const { container, getByRole } = render(<KreditEksempel laangiver={nordea} />);
    const tekst = container.textContent ?? "";
    expect(tekst).toContain(`ÅOP ${nordea.eksempel!.aop}`);
    expect(tekst).toContain(`Eksemplet er hentet fra Nordea den ${formatHentetDato(nordea.eksempel!.hentet)}.`);
    expect(tekst).not.toContain("kr..");
    expect(getByRole("link", { name: "Nordea" }).getAttribute("href")).toBe(nordea.eksempel!.kilde);
  });

  test("viser intet, når långiveren ikke har et offentliggjort eksempel", () => {
    const { container } = render(<KreditEksempel laangiver={PANTSAT} />);
    expect(container.textContent).toBe("");
  });
});
