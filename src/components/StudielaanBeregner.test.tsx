import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import StudielaanBeregner from "./StudielaanBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";
import { encodeCalculationState } from "@/lib/calculation-state";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

const domainConfig = getDomainConfig("localhost");

function renderStudielaan() {
  return render(
    <LocaleProvider locale="da" domainConfig={domainConfig}>
      <StudielaanBeregner />
    </LocaleProvider>,
  );
}

describe("StudielaanBeregner", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/studielaan");
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("indlæser og beregner et gammelt delelink med fem års løbetid", async () => {
    const state = encodeCalculationState({
      type: "studielaan",
      inputs: {
        samletGaeld: 100000,
        rente: 4,
        loebetid: 5,
        ekstraAfdrag: 0,
        maanedligIndkomst: 25000,
      },
      timestamp: 1700000000000,
    });
    window.history.replaceState({}, "", `/studielaan?s=${state}`);

    renderStudielaan();

    await waitFor(() => {
      expect(screen.getByLabelText("Løbetid")).toHaveValue(5);
    });
    expect(screen.getByText(/bevarer det ældre link/)).toBeInTheDocument();
    expect(screen.getByText("Hypotetisk månedsplan").parentElement?.parentElement).toHaveTextContent("1.842");
  });

  test("rydder delelinket fra URL ved nulstilling", async () => {
    const state = encodeCalculationState({
      type: "studielaan",
      inputs: {
        samletGaeld: 100000,
        rente: 4,
        loebetid: 5,
        ekstraAfdrag: 0,
        maanedligIndkomst: 25000,
      },
      timestamp: 1700000000000,
    });
    window.history.replaceState({}, "", `/studielaan?s=${state}`);

    renderStudielaan();
    await waitFor(() => {
      expect(screen.getByLabelText("Samlet SU-gæld")).toHaveValue(100000);
    });

    fireEvent.click(screen.getByRole("button", { name: "Nulstil" }));

    expect(screen.getByLabelText("Samlet SU-gæld")).toHaveValue(null);
    expect(new URL(window.location.href).searchParams.has("s")).toBe(false);
  });

  test("afviser negative tal uden at beregne en ugyldig rente", () => {
    renderStudielaan();

    fireEvent.change(screen.getByLabelText("Samlet SU-gæld"), {
      target: { value: "-1" },
    });

    expect(screen.getByLabelText("Samlet SU-gæld")).toHaveValue(0);
    expect(screen.queryByRole("heading", { name: "Hypotetisk månedsplan" })).not.toBeInTheDocument();
  });

  test("viser ikke et resultat, når rentefeltet er tomt", () => {
    renderStudielaan();

    fireEvent.change(screen.getByLabelText("Samlet SU-gæld"), {
      target: { value: "100000" },
    });
    expect(screen.getByRole("heading", { name: "Hypotetisk månedsplan" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Rente (p.a.)"), {
      target: { value: "" },
    });

    expect(screen.queryByRole("heading", { name: "Hypotetisk månedsplan" })).not.toBeInTheDocument();
  });
});
