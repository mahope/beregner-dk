import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import DatoBeregner from "./DatoBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { encodeCalculationState } from "@/lib/calculation-state";
import { getDomainConfig } from "@/lib/domain-config";
import { beregnAlder } from "@/lib/alder";
import { tilIsoDato } from "@/lib/lokal-dato";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

function renderDato(startDato: string, slutDato: string, locale: "da" | "se") {
  const encoded = encodeCalculationState({
    type: "dato",
    inputs: { mode: "dage-mellem", startDato, slutDato },
    timestamp: 1700000000000,
  });
  window.history.replaceState({}, "", `/dato?s=${encoded}`);
  const config =
    locale === "se" ? getDomainConfig("beraknare.se") : getDomainConfig("localhost");

  return render(
    <LocaleProvider locale={locale} domainConfig={config}>
      <DatoBeregner />
    </LocaleProvider>
  );
}

/** Reads a result tile: a label <p> with exactly one sibling <p> holding the value. */
function tile(label: RegExp): number {
  const felt = screen
    .getAllByText(label)
    .find(
      (node) =>
        node.tagName === "P" && node.parentElement?.querySelectorAll("p").length === 2
    );
  const value = felt?.parentElement?.querySelectorAll("p")[1]?.textContent ?? "";
  return Number(value.trim());
}

/** Reads the big headline, whose block holds the day count plus a weeks/days line. */
function antalDage(label: RegExp): number {
  const overskrift = screen.getByText(label);
  return Number(overskrift.parentElement?.children[1]?.textContent?.trim());
}

describe("DatoBeregner — dage mellem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("de tre dagstyper summerer til antal dage", async () => {
    // Mandag 28. september til tirsdag 29. september 2026: 1 dag, og de tre
    // felter må derfor ikke tælle to arbejdsdage.
    renderDato("2026-09-28", "2026-09-29", "da");

    await waitFor(() => {
      expect(antalDage(/^Antal dage$/)).toBe(1);
    });
    expect(tile(/^Arbejdsdage$/)).toBe(1);
    expect(tile(/^Weekenddage$/)).toBe(0);
    expect(tile(/^Helligdage$/)).toBe(0);
  });

  test("et interval på tværs af nytårsaften forklares i stedet for at skjules", async () => {
    // 20. december 2026 til 5. januar 2027: 16 dage, hvoraf nytårsaften hverken
    // er arbejdsdag eller (dansk) helligdag.
    renderDato("2026-12-20", "2027-01-05", "da");

    await waitFor(() => {
      expect(antalDage(/^Antal dage$/)).toBe(16);
    });
    const arbejdsdage = tile(/^Arbejdsdage$/);
    const weekenddage = tile(/^Weekenddage$/);
    const helligdage = tile(/^Helligdage$/);

    // 26. december er både lørdag og 2. juledag, men må kun tælles én gang.
    expect(arbejdsdage + weekenddage + helligdage).toBe(15);
    expect(
      screen.getByText(/Nytårsaften er ikke en officiel helligdag/)
    ).toBeTruthy();
  });

  test("svensk kalender tæller nytårsaften som helgdag", async () => {
    renderDato("2026-12-20", "2027-01-05", "se");

    await waitFor(() => {
      expect(antalDage(/^Antal dagar$/)).toBe(16);
    });
    const summeret =
      tile(/^Arbetsdagar$/) +
      tile(/^Lördagar\/söndagar$/) +
      tile(/^Helgdagar$/);
    expect(summeret).toBe(16);
    expect(screen.queryByText(/Nyårsafton är inte en officiell helgdag/)).toBeNull();
  });

  test("samme dag giver nul i alle felter", async () => {
    renderDato("2026-12-31", "2026-12-31", "da");

    await waitFor(() => {
      expect(antalDage(/^Antal dage$/)).toBe(0);
    });
    expect(tile(/^Arbejdsdage$/)).toBe(0);
    expect(tile(/^Weekenddage$/)).toBe(0);
    expect(tile(/^Helligdage$/)).toBe(0);
  });
});

/** Renderer et vilkårligt delelink-state, så alderstilstanden kan læses. */
function renderAlder(foedselsdato: string, locale: "da" | "se" = "da") {
  const encoded = encodeCalculationState({
    type: "dato",
    inputs: { mode: "alder", foedselsdato },
    timestamp: 1700000000000,
  });
  window.history.replaceState({}, "", `/dato?s=${encoded}`);
  const config =
    locale === "se" ? getDomainConfig("beraknare.se") : getDomainConfig("localhost");

  render(
    <LocaleProvider locale={locale} domainConfig={config}>
      <DatoBeregner />
    </LocaleProvider>
  );
}

describe("DatoBeregner — alder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("svarer som `/alder`-modulet gør med samme fødselsdato", async () => {
    renderAlder("1990-03-15");

    const forventet = beregnAlder({
      foedselsdato: "1990-03-15",
      beregningsdato: tilIsoDato(new Date()),
    });
    await waitFor(() => {
      expect(screen.getByText(new RegExp(`^${forventet?.aar} år$`))).toBeTruthy();
    });
    expect(
      screen.getByText(`${forventet?.maaneder} måneder og ${forventet?.dage} dage`)
    ).toBeTruthy();
    // Totalerne formateres med locale, så daltes tusindtalsseparator.
    expect(
      screen.getByText((forventet?.totalDage ?? 0).toLocaleString("da-DK"))
    ).toBeTruthy();
  });

  test("en fødselsdato i fremtiden viser intet resultat frem for negativ alder", async () => {
    renderAlder("2030-01-01");

    await waitFor(() => {
      expect(screen.getByText(/^Fødselsdato$/)).toBeTruthy();
    });
    expect(screen.queryByText(/NaN/)).toBeNull();
    expect(screen.queryByText(/^Din alder$/)).toBeNull();
  });
});
