import { getDomainConfig } from "@/lib/domain-config";
import { LEASING_EKSEMPEL, beregnLeasingSammenlign } from "@/lib/leasing";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { LocaleProvider } from "./LocaleProvider";
import LeasingBeregner from "./LeasingBeregner";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
}));

const domainConfig = getDomainConfig("localhost");

function renderLeasing(locale: "da" | "se" = "da") {
  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <LeasingBeregner />
    </LocaleProvider>,
  );
}

/** Intl bruger et ikke-brydende mellemrum før valutaenheden i nogle browsere. */
function normalize(text: string | null | undefined): string {
  return (text ?? "").replace(/[   ]/g, " ");
}

function heleTeksten(): string {
  return normalize(document.body.textContent);
}

describe("LeasingBeregner — valutaenheden står kun én gang", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/leasing");
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("skriver ikke «kr. kr.» nogen steder i det danske resultat", async () => {
    renderLeasing();

    await waitFor(() => {
      expect(heleTeksten()).toMatch(/Månedlig leasingydelse/);
    });
    // `formatKr` er `formatCurrency`, som selv afslutter med valutaenheden, så
    // et bogstaveligt " kr." efter kalden skrev "4.121 kr. kr." overalt i
    // resultatblokken.
    expect(heleTeksten()).not.toMatch(/kr\. kr\.|kr kr/);
  });

  test("skriver ikke «kr kr» på den svenske side", async () => {
    renderLeasing("se");

    await waitFor(() => {
      expect(heleTeksten()).toMatch(/Månatlig leasingkostnad/);
    });
    expect(heleTeksten()).not.toMatch(/kr\. kr\.|kr kr/);
  });

  test("månedsydelsen er præcis eksemplets ydelse med én enhed", async () => {
    renderLeasing();
    const sammenlign = beregnLeasingSammenlign(LEASING_EKSEMPEL);
    expect(sammenlign).not.toBeNull();
    const maanedlig = sammenlign?.leasing.maanedlig ?? 0;

    await waitFor(() => {
      expect(heleTeksten()).toMatch(/Månedlig leasingydelse/);
    });
    const ydelse = screen
      .getByText("Månedlig leasingydelse")
      .closest("div")
      ?.parentElement?.textContent;
    expect(normalize(ydelse)).toMatch(
      new RegExp(
        `${Math.round(maanedlig).toLocaleString("da-DK", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })} kr\\.`
      )
    );
  });
});
