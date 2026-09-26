import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import TidszoneBeregner from "./TidszoneBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

const daDomain = getDomainConfig("localhost");
const seDomain = getDomainConfig("beraknare.se");

function renderTidszone(locale: "da" | "se") {
  const domainConfig = locale === "se" ? seDomain : daDomain;

  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <TidszoneBeregner />
    </LocaleProvider>,
  );
}

function selectOptions(container: HTMLElement) {
  return Array.from(container.querySelectorAll("select"))
    .flatMap((select) => Array.from(select.querySelectorAll("option")).map((option) => option.textContent ?? ""));
}

describe("TidszoneBeregner", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/tidszone");
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("forankrer hjemtidszonen i Danmark på dansk", () => {
    const { container } = renderTidszone("da");
    const tekst = container.textContent ?? "";

    expect(tekst).toContain("København");
    expect(screen.getByRole("heading", { name: "Tidsforskel fra Danmark" })).toBeVisible();
    expect(tekst).not.toContain("Sverige");
    expect(selectOptions(container)).toContain("København - Danmark (CET/CEST)");
  });

  test("forankrer hjemtidszonen i Sverige på svensk", () => {
    const { container } = renderTidszone("se");
    const tekst = container.textContent ?? "";

    expect(tekst).toContain("Stockholm");
    expect(screen.getByRole("heading", { name: "Tidsskillnad från Sverige" })).toBeVisible();
    expect(tekst).toContain("Sverige byter till sommartid");
    expect(tekst).not.toContain("Köpenhamn");
    expect(tekst).not.toContain("från Danmark");
    expect(selectOptions(container)).toContain("Stockholm - Sverige (CET/CEST)");
  });

  test("beholder delte links med fraTidszone=dk gyldige i begge locales", () => {
    const dansk = renderTidszone("da");
    const svensk = renderTidszone("se");

    for (const { container } of [dansk, svensk]) {
      const fraZone = container.querySelector("select") as HTMLSelectElement;
      expect(fraZone.value).toBe("dk");
      expect(fraZone.options[0].textContent).toMatch(/Danmark \(CET\/CEST\)|Sverige \(CET\/CEST\)/);
    }
  });

  test("regner tidsforskellen fra hjemtidszonen, uanset locale", () => {
    for (const [locale, forventet] of [
      ["da", "New York er 6 timer bagud København"],
      ["se", "New York är 6 timmar efter Stockholm"],
    ] as const) {
      const { unmount } = renderTidszone(locale);

      // 12 i hjemtidszonen (UTC+1) er 06 i New York (UTC-5) om vinteren.
      expect(screen.getByText(forventet)).toBeVisible();
      unmount();
    }
  });
});
