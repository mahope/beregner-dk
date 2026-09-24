import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import BMIBeregner from "./BMIBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";
import { decodeCalculationState } from "@/lib/calculation-state";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

const domainConfig = getDomainConfig("localhost");

function renderBMI(locale: "da" | "no" | "se" = "da") {
  const config = locale === "no"
    ? getDomainConfig("beregner.no")
    : locale === "se"
      ? getDomainConfig("beraknare.se")
      : domainConfig;

  return render(
    <LocaleProvider locale={locale} domainConfig={config}>
      <BMIBeregner />
    </LocaleProvider>,
  );
}

describe("BMIBeregner", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/bmi");
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("viser et voksenværktøj uden alder som input", () => {
    const { container } = renderBMI();

    expect(screen.getByText(/BMI for voksne \(18\+\)/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Alder")).not.toBeInTheDocument();
    expect(screen.getByText("Køn (kun til WHR)")).toBeInTheDocument();
    expect(container.querySelector(".text-5xl")?.textContent).toBe("24.5");

    fireEvent.click(screen.getByRole("button", { name: "Kvinde" }));

    expect(container.querySelector(".text-5xl")?.textContent).toBe("24.5");
  });

  test("viser norske labels på beregner.no", () => {
    renderBMI("no");

    expect(screen.getByLabelText("Vekt (kg)")).toHaveValue(75);
    expect(screen.getByText(/BMI for voksne \(18\+\)/)).toBeInTheDocument();
     expect(screen.getByText("Kjønn (kun for WHR)")).toBeInTheDocument();
     expect(screen.queryByText("Vægt (kg)")).not.toBeInTheDocument();
  });

  test("viser svenska labels på beraknare.se", () => {
    renderBMI("se");

    expect(screen.getByLabelText("Vikt (kg)")).toHaveValue(75);
    expect(screen.getByText(/BMI för vuxna \(18\+\)/)).toBeInTheDocument();
    expect(screen.getByText("Kön (endast WHR)")).toBeInTheDocument();
    expect(screen.queryByText("Vægt (kg)")).not.toBeInTheDocument();
  });

  test("bruker køn kun til WHR-referencevisningen", () => {
    renderBMI();

    fireEvent.change(screen.getByLabelText("Taljemål (cm)"), { target: { value: "82" } });
    fireEvent.change(screen.getByLabelText("Hoftemål (cm)"), { target: { value: "100" } });

    expect(screen.getByText("0.82")).toBeInTheDocument();
    expect(screen.queryByText(/0,90|0,85/)).not.toBeInTheDocument();
    expect(screen.getByText(/Mænd: køn bruges kun til WHR-referencevisningen/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Kvinde" }));

    expect(screen.getByText("0.82")).toBeInTheDocument();
    expect(screen.getByText(/Kvinder: køn bruges kun til WHR-referencevisningen/)).toBeInTheDocument();
  });

  test("rounder WHR kun til visning", () => {
    renderBMI();

    fireEvent.change(screen.getByLabelText("Taljemål (cm)"), { target: { value: "89.9" } });
    fireEvent.change(screen.getByLabelText("Hoftemål (cm)"), { target: { value: "100" } });

    expect(screen.getByText("0.90")).toBeInTheDocument();
  });

  test("viser kønsspecifik WHR-referencevejledning", () => {
    renderBMI();

    fireEvent.change(screen.getByLabelText("Taljemål (cm)"), { target: { value: "89" } });
    fireEvent.change(screen.getByLabelText("Hoftemål (cm)"), { target: { value: "100" } });

    expect(screen.getByText(/Mænd: køn bruges kun til WHR-referencevisningen/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Kvinde" }));

    expect(screen.getByText(/Kvinder: køn bruges kun til WHR-referencevisningen/)).toBeInTheDocument();
  });

  test("indlæser legacy delelinks og deler uden alder", async () => {
    const legacyState = "eyJ2IjoiMSIsInQiOiJibWkiLCJpIjp7InZhZWd0Ijo4MCwiaG9lamRlIjoxODAsImtvZW4iOiJrdmluZGUiLCJhbGRlciI6OH0sInRzIjoxNzAwMDAwMDAwMDAwfQ";
    window.history.replaceState({}, "", `/bmi?s=${legacyState}`);

    renderBMI();

    await waitFor(() => {
      expect(screen.getByLabelText("Vægt (kg)")).toHaveValue(80);
      expect(screen.getByLabelText("Højde (cm)")).toHaveValue(180);
    });
    expect(screen.queryByLabelText("Alder")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Del beregning" }));
    const shareUrl = screen.getByLabelText("Delbart link").getAttribute("value") ?? "";
    const sharedEncoded = new URL(shareUrl).searchParams.get("s");
    const sharedState = decodeCalculationState(sharedEncoded ?? "");

    expect(sharedState?.inputs).toMatchObject({ vaegt: 80, hoejde: 180, koen: "kvinde" });
    expect(sharedState?.inputs).not.toHaveProperty("alder");
  });
});
