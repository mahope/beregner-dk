import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import SuIndtaegtsgraense from "./SuIndtaegtsgraense";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";
import { formatCurrency } from "@/lib/format";

const domainConfig = getDomainConfig("localhost");

/**
 * Samme formatter som komponenten bruger, så porten ikke dømmer formateringen
 * men regnestykket. `Intl` sætter et hårdt mellemrum mellem tal og «kr.»;
 * det erstattes med et almindeligt, fordi det er den samme synlige tekst.
 */
const da = (tal: number) =>
  formatCurrency(tal, "da", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(
    / /g,
    " ",
  );

/** Den synlige tekst i den renderede komponent, mellemrum normaliseret. */
const tekst = (container: HTMLElement) =>
  (container.textContent ?? "").replace(/\s+/g, " ").trim();

/** Hvor mange gange et tal står i den synlige tekst. */
const antal = (container: HTMLElement, nål: string) =>
  tekst(container).split(nål).length - 1;

function renderVærktøj() {
  return render(
    <LocaleProvider locale="da" domainConfig={domainConfig}>
      <SuIndtaegtsgraense />
    </LocaleProvider>,
  ).container;
}

afterEach(cleanup);

describe("SU-indtægtsgrænsen: standard-svaret", () => {
  test("svarer med 12 x den laveste sats på 12 måneder videregående SU", () => {
    const c = renderVærktøj();
    // 12 × 20.749 = 248.988, og pr. måned er præcis den laveste sats, fordi
    // alle 12 måneder er ens. Brutto er efter-AM-tallet delt på 0,92, nedrundet.
    expect(tekst(c)).toContain(da(12 * 20749));
    // `<dt>` og `<dd>` er to elementer, så textContent klistrer tallet på labelen.
    expect(tekst(c)).toContain(`Det svarer til pr. måned${da(20749)}`);
    expect(tekst(c)).toContain(da(Math.floor((12 * 20749) / 0.92)));
    expect(antal(c, da(20749))).toBeGreaterThanOrEqual(3);
  });

  test("siger, at alle 12 måneder bruger den samme sats — ikke at de er uden SU", () => {
    const c = renderVærktøj();
    expect(tekst(c)).toContain("Alle 12 måneder bruger den samme sats");
    // Den tidligere sætning læste «12 måneder uden SU», hvilket er
    // modsætningen af hvad der er valgt: 12 måneder MED SU.
    expect(tekst(c)).not.toContain("12 måneder uden SU");
  });

  test("kalder ikke det nedsatte handicaptillægs-fribeløb for «den laveste sats»", () => {
    const c = renderVærktøj();
    fireEvent.click(screen.getByLabelText(/Jeg har handicaptillæg/));
    // 3.921 er det NEDSATTE fribeløb, ikke den laveste af de tre — og med
    // handicaptillæg er det ikke engang SU-månederne, der bruger den laveste.
    expect(tekst(c)).toContain("Alle 12 måneder bruger den samme sats på 3.921 kr.");
    expect(tekst(c)).not.toContain("laveste sats");
  });
});

describe("SU-indtægtsgrænsen: valgene ændrer svaret", () => {
  test("færre SU-måneder hæver grænsen, fordi de øvrige måneder bruger en højere sats", () => {
    const c = renderVærktøj();
    fireEvent.change(screen.getByLabelText(/Antal måneder med SU/), { target: { value: "9" } });
    // 9 × 20.749 + 3 × 23.598 = 257.535.
    expect(tekst(c)).toContain(da(9 * 20749 + 3 * 23598));
    expect(tekst(c)).toContain("3 af de 12 måneder er uden SU");
    expect(tekst(c)).not.toContain(da(12 * 20749));
  });

  test("«ikke under uddannelse» i de øvrige måneder hæver grænsen yderligere", () => {
    const c = renderVærktøj();
    fireEvent.change(screen.getByLabelText(/Antal måneder med SU/), { target: { value: "9" } });
    fireEvent.change(screen.getByLabelText(/de 3 øvrige måneder er jeg/), {
      target: { value: "hoejeste" },
    });
    // 9 × 20.749 + 3 × 45.420 = 323.001.
    expect(tekst(c)).toContain(da(9 * 20749 + 3 * 45420));
  });

  test("ungdomsuddannelse bruger den laveste sats på 15.297", () => {
    const c = renderVærktøj();
    fireEvent.change(screen.getByLabelText(/Jeg går på/), { target: { value: "ungdom" } });
    // 12 × 15.297 = 183.564.
    expect(tekst(c)).toContain(da(12 * 15297));
    expect(tekst(c)).not.toContain(da(12 * 20749));
  });

  test("et barn under 18 år lægger 34.129 til ÅRET, og rækken vises kun når der er børn", () => {
    const c = renderVærktøj();
    // Uden børn er der ingen tillægsrække overhovedet.
    expect(tekst(c)).not.toContain("Tillæg for børn under 18");

    fireEvent.change(screen.getByLabelText("Børn under 18 år"), { target: { value: "2" } });
    expect(tekst(c)).toContain("Tillæg for børn under 18");
    expect(tekst(c)).toContain(`+${da(2 * 34129)}`);
    // 12 × 20.749 + 2 × 34.129 = 317.246.
    expect(tekst(c)).toContain(da(12 * 20749 + 2 * 34129));
  });

  test("handicaptillæg sænker SU-månederne til det nedsatte fribeløb", () => {
    const c = renderVærktøj();
    fireEvent.click(screen.getByLabelText(/Jeg har handicaptillæg/));
    // 12 × 3.921 = 47.052.
    expect(tekst(c)).toContain(da(12 * 3921));
  });

  test("feltet for de øvrige måneder låses, når alle 12 måneder har SU", () => {
    renderVærktøj();
    expect((screen.getByLabelText(/de 0 øvrige måneder er jeg/) as HTMLSelectElement).disabled).toBe(
      true,
    );
    fireEvent.change(screen.getByLabelText(/Antal måneder med SU/), { target: { value: "6" } });
    expect(
      (screen.getByLabelText(/de 6 øvrige måneder er jeg/) as HTMLSelectElement).disabled,
    ).toBe(false);
  });
});
