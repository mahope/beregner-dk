import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import KalorieBeregner from "./KalorieBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { encodeCalculationState } from "@/lib/calculation-state";
import { getDomainConfig } from "@/lib/domain-config";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

function renderKalorier(
  maal: "vedligehold" | "tab" | "opbyg",
  locale: "da" | "se" = "da"
) {
  const encoded = encodeCalculationState({
    type: "kalorier",
    inputs: { alder: 30, koen: "mand", vaegt: 80, hoejde: 180, aktivitet: "moderat", maal },
    timestamp: 1700000000000,
  });
  window.history.replaceState({}, "", `/kalorier?s=${encoded}`);
  const config =
    locale === "se" ? getDomainConfig("beraknare.se") : getDomainConfig("localhost");

  return render(
    <LocaleProvider locale={locale} domainConfig={config}>
      <KalorieBeregner />
    </LocaleProvider>
  );
}

/** The protein card's gram figure, which is the second <p> of its block. */
function proteinGram(): number {
  const overskrift = screen.getAllByText("Protein")[0];
  return Number(overskrift.parentElement?.querySelectorAll("p")[1]?.textContent?.replace("g", "").trim());
}

describe("KalorieBeregner — protein følger dit mål", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("80 kg vedligehold giver 80 g protein, ikke 144 g", () => {
    renderKalorier("vedligehold");
    expect(proteinGram()).toBe(80);
  });

  test("80 kg vægttab giver 112 g protein (1,4 g/kg)", () => {
    renderKalorier("tab");
    expect(proteinGram()).toBe(112);
  });

  test("80 kg muskelopbygning giver 152 g protein (1,9 g/kg)", () => {
    renderKalorier("opbyg");
    expect(proteinGram()).toBe(152);
  });

  test("g/kg-basis og interval vises i proteinfeltet", () => {
    renderKalorier("tab");
    const blok = screen.getAllByText("Protein")[0].parentElement;
    expect(blok?.textContent).toContain("1,4 g/kg protein");
    expect(blok?.textContent).toContain("1,2-1,6");
  });

  test("svensk visning bruger decimal-komma", () => {
    renderKalorier("opbyg", "se");
    const blok = screen.getAllByText("Protein")[0].parentElement;
    expect(proteinGram()).toBe(152);
    expect(blok?.textContent).toContain("1,9 g/kg protein");
  });
});
