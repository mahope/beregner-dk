/**
 * Standarddatoen i de to beregnere, der bruger datoen *som inputværdi*.
 *
 * `toISOString().split("T")[0]` skriver dagen i UTC. Klokken 00.30 dansk tid er
 * stadig dagen før i UTC, så en læser i Danmark, Sverige eller Norge fik dagen i
 * går som standard — og for `/ugenummer` dermed også ugenummeret for i går. Testen
 * låser tidszonen til Danmark, så den fejl ikke kan komme tilbage: på en maskine
 * med UTC-tid ville den ellers aldrig kunne fejle.
 */
process.env.TZ = "Europe/Copenhagen";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import AlderBeregner from "./AlderBeregner";
import UgenummerBeregner from "./UgenummerBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";
import { tilIsoDato } from "@/lib/lokal-dato";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

const domainConfig = getDomainConfig("localhost");

/** 00.30 dansk tid: UTC er endnu dagen før, så UTC-strengen er den forkerte. */
const LOKAL_MORGEN = "2026-09-27T00:30:00";

function renderMed(Beregner: typeof AlderBeregner | typeof UgenummerBeregner) {
  return render(
    <LocaleProvider locale="da" domainConfig={domainConfig}>
      <Beregner />
    </LocaleProvider>
  );
}

/**
 * AlderBeregner har to datofelter (fødselsdato og beregningsdato) og
 * UgenummerBeregner ét, så feltet vælges efter sin position. Ingen af komponenterne
 * kobler `label` med `htmlFor`, så der kan ikke slås op på etiketten.
 */
function datoFelt(container: HTMLElement, index: number): HTMLInputElement {
  const felter = container.querySelectorAll<HTMLInputElement>('input[type="date"]');
  return felter[index];
}

describe("standarddato i læserens egen tidszone", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(LOKAL_MORGEN));
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  test("tidspunktet er valgt, fordi UTC og dansk tid her er på hver sin dag", () => {
    expect(new Date().toISOString().slice(0, 10)).toBe("2026-09-26");
    expect(tilIsoDato(new Date())).toBe("2026-09-27");
  });

  test("/alder bruger dagens lokale dato som beregningsdato", () => {
    const { container } = renderMed(AlderBeregner);
    expect(datoFelt(container, 1).value).toBe("2026-09-27");
  });

  test("/alder nulstiller til dagens lokale dato, ikke UTC-dagen", () => {
    const { container } = renderMed(AlderBeregner);
    fireEvent.change(datoFelt(container, 1), { target: { value: "2020-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: /Nulstil/i }));
    expect(datoFelt(container, 1).value).toBe("2026-09-27");
  });

  test("/ugenummer bruger dagens lokale dato, så ugetallet ikke er i gårs", () => {
    const { container } = renderMed(UgenummerBeregner);
    expect(datoFelt(container, 0).value).toBe("2026-09-27");
    // 27. september 2026 er en søndag i ISO-uge 39. Skrev feltet i UTC, ville
    // læseren have fået 26. september og dermed 39 fra et andet uge-anker.
    expect(screen.getByText("Ugenummer 39")).toBeInTheDocument();
  });
});
