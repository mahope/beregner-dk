import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import TidsBeregner from "./TidsBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { decodeCalculationState, encodeCalculationState } from "@/lib/calculation-state";
import { getDomainConfig } from "@/lib/domain-config";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

const domainConfig = getDomainConfig("localhost");

function renderTids(locale: "da" | "se") {
  const config = locale === "se" ? getDomainConfig("beraknare.se") : domainConfig;

  return render(
    <LocaleProvider locale={locale} domainConfig={config}>
      <TidsBeregner />
    </LocaleProvider>,
  );
}

describe("TidsBeregner", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/tidsberegner");
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test.each([
    ["da", "Del beregning", "Link til beregning", "7t 30m"],
    ["se", "Dela beräkning", "Länk till beräkning", "7h 30m"],
  ] as const)(
    "indlæser og deler danske og svenske URL-state uden dobbelt midnat",
    async (locale, shareButton, linkLabel, result) => {
      const inputs = {
        startTid: "22:00",
        slutTid: "06:00",
        startDato: "2026-09-25",
        slutDato: "2026-09-26",
        fratraekPause: 30,
      };
      const encoded = encodeCalculationState({
        type: "tidsberegner",
        inputs,
        timestamp: 1700000000000,
      });
      window.history.replaceState({}, "", `/tidsberegner?s=${encoded}`);

      const firstRender = renderTids(locale);

      await waitFor(() => {
        const timeInputs = firstRender.container.querySelectorAll<HTMLInputElement>('input[type="time"]');
        const dateInputs = firstRender.container.querySelectorAll<HTMLInputElement>('input[type="date"]');
        expect(timeInputs[0]).toHaveValue("22:00");
        expect(timeInputs[1]).toHaveValue("06:00");
        expect(dateInputs[0]).toHaveValue("2026-09-25");
        expect(dateInputs[1]).toHaveValue("2026-09-26");
      });
      expect(firstRender.container.querySelector(".text-4xl")?.textContent).toBe(result);

      fireEvent.click(screen.getByRole("button", { name: shareButton }));
      const shareUrl = screen.getByLabelText(linkLabel).getAttribute("value") ?? "";
      const sharedEncoded = new URL(shareUrl).searchParams.get("s") ?? "";
      const sharedState = decodeCalculationState(sharedEncoded);

      expect(sharedState?.inputs).toEqual(inputs);
      firstRender.unmount();

      window.history.replaceState({}, "", `/tidsberegner?s=${sharedEncoded}`);
      const secondRender = renderTids(locale);

      await waitFor(() => {
        const timeInputs = secondRender.container.querySelectorAll<HTMLInputElement>('input[type="time"]');
        const dateInputs = secondRender.container.querySelectorAll<HTMLInputElement>('input[type="date"]');
        const pauseInput = secondRender.container.querySelector<HTMLInputElement>('input[type="number"]');
        expect(timeInputs[0]).toHaveValue("22:00");
        expect(timeInputs[1]).toHaveValue("06:00");
        expect(dateInputs[0]).toHaveValue("2026-09-25");
        expect(dateInputs[1]).toHaveValue("2026-09-26");
        expect(pauseInput).toHaveValue(30);
      });
      expect(secondRender.container.querySelector(".text-4xl")?.textContent).toBe(result);
    },
  );
});
